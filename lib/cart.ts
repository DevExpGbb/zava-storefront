import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
  unitPriceCents: z.number().int().nonnegative(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export interface CartTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}

export function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  const existing = cart.findIndex((c) => c.productId === item.productId);
  if (existing === -1) return [...cart, item];
  const merged = { ...cart[existing], quantity: cart[existing].quantity + item.quantity };
  if (merged.quantity > 99) throw new Error('quantity exceeds limit');
  return cart.map((c, i) => (i === existing ? merged : c));
}

export function removeItem(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((c) => c.productId !== productId);
}

export function applyDiscount(subtotalCents: number, code: string | null): number {
  if (!code) return 0;
  const upper = code.toUpperCase();
  if (upper === 'WELCOME10') return Math.floor(subtotalCents * 0.10);
  if (upper === 'VIP25' && subtotalCents >= 10_000) return Math.floor(subtotalCents * 0.25);
  if (upper === 'FREESHIP') return 0;
  return 0;
}

export function computeTax(taxableCents: number, region: string): number {
  switch (region) {
    case 'GB':
      return Math.round(taxableCents * 0.20);
    case 'DE':
      return Math.round(taxableCents * 0.19);
    case 'US-CA':
      return Math.round(taxableCents * 0.0725);
    case 'US-OR':
      return 0;
    default:
      return Math.round(taxableCents * 0.10);
  }
}

export function totalize(cart: CartItem[], discountCode: string | null, region: string): CartTotals {
  const subtotalCents = cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const discountCents = applyDiscount(subtotalCents, discountCode);
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = computeTax(taxableCents, region);
  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents: taxableCents + taxCents,
  };
}
