import { z } from 'zod';
import type { Db } from './db';

/**
 * Schema for promo code validation.
 *
 * @example
 * const result = promoCodeSchema.safeParse({
 *   code: "SAVE10",
 *   discountPercentage: 10,
 *   validFrom: "2026-01-01T00:00:00Z",
 *   validUntil: "2026-12-31T23:59:59Z",
 * });
 */
export const promoCodeSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(50),
  discountPercentage: z.number().min(0).max(100),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
});

/**
 * PromoCode represents a discount code in the system.
 *
 * @example
 * const promo: PromoCode = {
 *   id: "promo_123",
 *   code: "SAVE10",
 *   discountPercentage: 10,
 *   validFrom: "2026-01-01T00:00:00Z",
 *   validUntil: "2026-12-31T23:59:59Z",
 *   active: true,
 *   createdAt: "2026-01-01T00:00:00Z",
 * };
 */
export type PromoCode = z.infer<typeof promoCodeSchema>;

/**
 * Request body schema for applying a promo code.
 *
 * @example
 * const body = { promoCode: "SAVE10" };
 */
export const applyPromoRequestSchema = z.object({
  promoCode: z.string().min(1).max(50),
});

/**
 * Response schema for applying a promo code to a cart.
 */
export const applyPromoResponseSchema = z.object({
  cartId: z.string(),
  promoCode: z.string(),
  discountPercentage: z.number(),
  discountAmount: z.number(),
  originalTotal: z.number(),
  newTotal: z.number(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export type ApplyPromoResponse = z.infer<typeof applyPromoResponseSchema>;

/**
 * Fetches a promo code by its code value.
 *
 * @param db - Database instance
 * @param code - The promo code string (e.g., "SAVE10")
 * @returns PromoCode if found, null otherwise
 *
 * @example
 * const promo = await getPromoCode(db, "SAVE10");
 * if (!promo) {
 *   throw new Error("Promo code not found");
 * }
 */
export async function getPromoCode(db: Db, code: string): Promise<PromoCode | null> {
  const { rows } = await db.query<PromoCode>(
    `SELECT id, code, discount_percentage AS "discountPercentage",
            valid_from AS "validFrom", valid_until AS "validUntil",
            active, created_at AS "createdAt"
     FROM promo_codes
     WHERE UPPER(code) = UPPER($1)
     LIMIT 1`,
    [code],
  );
  return rows[0] ?? null;
}

/**
 * Validates that a promo code is active and within its valid date range.
 *
 * @param promoCode - The promo code to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * if (!isPromoCodeValid(promo)) {
 *   throw new Error("Promo code is expired or inactive");
 * }
 */
export function isPromoCodeValid(promoCode: PromoCode): boolean {
  if (!promoCode.active) {
    return false;
  }

  const now = new Date();
  const validFrom = new Date(promoCode.validFrom);
  const validUntil = new Date(promoCode.validUntil);

  return now >= validFrom && now <= validUntil;
}

/**
 * Calculates the discount amount based on the original total and discount percentage.
 *
 * @param subtotalCents - The original subtotal in cents
 * @param discountPercentage - The discount percentage (0-100)
 * @returns The discount amount in cents
 *
 * @example
 * const discount = calculateDiscount(10000, 10); // 1000 cents (10% of $100)
 */
export function calculateDiscount(subtotalCents: number, discountPercentage: number): number {
  return Math.floor((subtotalCents * discountPercentage) / 100);
}
