import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cartItemSchema } from "@/lib/cart";

/**
 * Promo code request schema
 * Validates cart items, promo code, and region for tax calculation
 */
const PromoCodeRequestSchema = z.object({
  cartItems: z.array(cartItemSchema),
  promoCode: z.string().min(1).max(20),
  region: z.string().min(1).max(10),
  discountPercentage: z.number().int().min(0).max(100),
});

/**
 * POST /api/promo-code
 * 
 * Applies a percentage discount to a cart using the provided promo code.
 * Returns calculated totals including subtotal, discount, tax, and final total.
 * 
 * @param req - HTTP request containing cart items, promo code, region, and discount percentage
 * @returns Cart totals with applied discount or error response
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PromoCodeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { cartItems, promoCode, region, discountPercentage } = parsed.data;

    // Validate that cart is not empty
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "empty_cart" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotalCents = cartItems.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );

    // Apply percentage-based discount
    const discountCents = Math.floor((subtotalCents * discountPercentage) / 100);

    // Calculate tax on discounted amount
    const taxableCents = Math.max(0, subtotalCents - discountCents);
    const taxCents = computeTax(taxableCents, region);

    return NextResponse.json(
      {
        promoCode,
        discountPercentage,
        subtotalCents,
        discountCents,
        taxCents,
        totalCents: taxableCents + taxCents,
      },
      { status: 200 }
    );
  } catch (error) {
    // Generic error response - no stack trace or sensitive details to client
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

/**
 * Calculate tax based on region
 * @param taxableCents - Amount subject to taxation
 * @param region - Tax region code
 * @returns Tax amount in cents
 */
function computeTax(taxableCents: number, region: string): number {
  switch (region) {
    case "GB":
      return Math.round(taxableCents * 0.20);
    case "DE":
      return Math.round(taxableCents * 0.19);
    case "US-CA":
      return Math.round(taxableCents * 0.0725);
    case "US-OR":
      return 0;
    default:
      return Math.round(taxableCents * 0.10);
  }
}
