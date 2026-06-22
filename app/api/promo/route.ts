import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cartItemSchema, computeTax, totalize } from '@/lib/cart';

const BodySchema = z.object({
  cart: z.array(cartItemSchema),
  // either a direct percent (0-100) or a promo `code` handled by existing logic
  percent: z.number().int().min(0).max(100).optional(),
  code: z.string().min(1).optional(),
  region: z.string().min(2).optional().default('GB'),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { cart, percent, code, region } = parsed.data;

  const subtotalCents = cart.reduce((s, it) => s + it.unitPriceCents * it.quantity, 0);

  let discountCents = 0;
  if (typeof percent === 'number') {
    discountCents = Math.floor((subtotalCents * percent) / 100);
  } else if (code) {
    // reuse existing discount logic when a code is provided
    const totals = totalize(cart, code, region);
    discountCents = totals.discountCents;
  }

  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = computeTax(taxableCents, region);
  const totalCents = taxableCents + taxCents;

  return NextResponse.json({ subtotalCents, discountCents, taxCents, totalCents });
}
