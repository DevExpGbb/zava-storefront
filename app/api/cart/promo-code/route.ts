import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cartItemSchema, resolvePromoCodePercent, totalize } from '../../../../lib/cart';

const PromoCodeApplySchema = z.object({
  items: z.array(cartItemSchema).min(1),
  promoCode: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/),
  region: z.string().trim().min(2).max(8),
});

function authorize(req: NextRequest): NextResponse | null {
  const authorization = req.headers.get('authorization');
  const userId = req.headers.get('x-user-id');
  const role = req.headers.get('x-user-role');

  if (!authorization || !authorization.startsWith('Bearer ') || !userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (role !== 'customer') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return null;
}

export async function POST(req: NextRequest) {
  const authFailure = authorize(req);
  if (authFailure) {
    return authFailure;
  }

  const body = await req.json();
  const parsed = PromoCodeApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const subtotalCents = parsed.data.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const discountPercent = resolvePromoCodePercent(subtotalCents, parsed.data.promoCode);
  if (discountPercent <= 0) {
    return NextResponse.json({ error: 'invalid_or_inapplicable_promo_code' }, { status: 400 });
  }

  const totals = totalize(parsed.data.items, parsed.data.promoCode, parsed.data.region);
  return NextResponse.json({
    promoCode: parsed.data.promoCode.toUpperCase(),
    discountPercent,
    totals,
  });
}
