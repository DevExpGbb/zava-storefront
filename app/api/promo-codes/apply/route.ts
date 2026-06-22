import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cartItemSchema, isKnownPromoCode, totalize } from '@/lib/cart';

/** Request body schema — all fields are required and stripped of unknowns by Zod. */
const ApplyPromoSchema = z.object({
  code: z.string().min(1).max(50),
  cart: z.array(cartItemSchema).min(1),
  region: z.string().min(2).max(8),
});

/**
 * POST /api/promo-codes/apply
 *
 * Validates a promo code against a cart and returns the full totals with the
 * percentage discount applied.
 *
 * @param req - Incoming Next.js request whose JSON body matches {@link ApplyPromoSchema}.
 * @returns 200 with cart totals on success; 400 on invalid body; 422 on unknown promo code.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = ApplyPromoSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const { code, cart, region } = parsed.data;

  if (!isKnownPromoCode(code)) {
    return NextResponse.json({ error: 'unknown_promo_code' }, { status: 422 });
  }

  const totals = totalize(cart, code, region);

  return NextResponse.json({ code: code.toUpperCase(), ...totals });
}
