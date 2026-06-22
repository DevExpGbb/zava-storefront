import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getPromoCode, isPromoCodeValid, calculateDiscount, applyPromoRequestSchema, applyPromoResponseSchema } from '@/lib/promo';

/**
 * Applies a promo code to a cart and returns the updated cart with discount breakdown.
 *
 * POST /api/carts/:cartId/apply-promo
 *
 * Request body:
 * ```json
 * { "promoCode": "SAVE10" }
 * ```
 *
 * Response on success (200):
 * ```json
 * {
 *   "cartId": "cart_123",
 *   "promoCode": "SAVE10",
 *   "discountPercentage": 10,
 *   "discountAmount": 1000,
 *   "originalTotal": 10000,
 *   "newTotal": 9000,
 *   "validFrom": "2026-01-01T00:00:00Z",
 *   "validUntil": "2026-12-31T23:59:59Z"
 * }
 * ```
 *
 * Error responses:
 * - 400 if promo code is invalid, expired, or malformed
 * - 404 if cart not found
 *
 * @param req - The Next.js request object
 * @param context - Route context containing cartId
 * @returns JSON response with discount information or error
 *
 * @example
 * const res = await fetch('/api/carts/cart_123/apply-promo', {
 *   method: 'POST',
 *   body: JSON.stringify({ promoCode: 'SAVE10' }),
 * });
 * const data = await res.json();
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    // Validate and parse request body
    const body = await req.json();
    const parsed = applyPromoRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Promo code must be a non-empty string',
        },
        { status: 400 }
      );
    }

    const { promoCode } = parsed.data;
    const { cartId } = params;

    // Validate cart exists
    const cart = await db.getCart(cartId);
    if (!cart) {
      return NextResponse.json(
        {
          error: 'cart_not_found',
          message: `Cart with ID ${cartId} not found`,
        },
        { status: 404 }
      );
    }

    // Fetch promo code from database
    const promoDB = await getPromoCode(db, promoCode);
    if (!promoDB) {
      return NextResponse.json(
        {
          error: 'promo_code_not_found',
          message: `Promo code "${promoCode}" does not exist`,
        },
        { status: 400 }
      );
    }

    // Validate promo code is active and within date range
    if (!isPromoCodeValid(promoDB)) {
      return NextResponse.json(
        {
          error: 'promo_code_invalid',
          message: `Promo code "${promoCode}" is expired or inactive`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    const discountAmount = calculateDiscount(cart.subtotalCents, promoDB.discountPercentage);
    const newTotal = Math.max(0, cart.subtotalCents - discountAmount);

    // Update cart with promo code and discount
    await db.updateCartWithPromo(cartId, promoDB.code, discountAmount, newTotal);

    // Return response
    const response = applyPromoResponseSchema.parse({
      cartId,
      promoCode: promoDB.code,
      discountPercentage: promoDB.discountPercentage,
      discountAmount,
      originalTotal: cart.subtotalCents,
      newTotal,
      validFrom: promoDB.validFrom,
      validUntil: promoDB.validUntil,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'invalid_json',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Log unexpected errors
    console.error('Error applying promo code:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An internal error occurred while applying the promo code',
      },
      { status: 500 }
    );
  }
}
