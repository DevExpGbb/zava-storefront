import { describe, it, expect } from 'vitest';
import { isKnownPromoCode, totalize } from '../lib/cart';

/**
 * Integration-style tests for the promo-code apply logic that backs
 * POST /api/promo-codes/apply.
 *
 * These tests exercise the service layer directly (isKnownPromoCode + totalize)
 * and mirror the happy-path / error branches the route handler takes.
 */
describe('promo-codes · apply', () => {
  describe('isKnownPromoCode', () => {
    it('accepts WELCOME10 (case-insensitive)', () => {
      expect(isKnownPromoCode('WELCOME10')).toBe(true);
      expect(isKnownPromoCode('welcome10')).toBe(true);
    });

    it('accepts VIP25', () => {
      expect(isKnownPromoCode('VIP25')).toBe(true);
    });

    it('accepts FREESHIP', () => {
      expect(isKnownPromoCode('FREESHIP')).toBe(true);
    });

    it('rejects unknown codes', () => {
      expect(isKnownPromoCode('BOGUS')).toBe(false);
      expect(isKnownPromoCode('')).toBe(false);
      expect(isKnownPromoCode('10OFF')).toBe(false);
    });
  });

  describe('totalize with promo code (service layer)', () => {
    const cart = [{ productId: 'p1', quantity: 2, unitPriceCents: 1000 }];

    it('applies WELCOME10 (10 % discount) in GB', () => {
      const totals = totalize(cart, 'WELCOME10', 'GB');
      // subtotal = 2000, discount = 200, taxable = 1800, tax(GB 20%) = 360
      expect(totals.subtotalCents).toBe(2000);
      expect(totals.discountCents).toBe(200);
      expect(totals.taxCents).toBe(360);
      expect(totals.totalCents).toBe(2160);
    });

    it('applies WELCOME10 (10 % discount) case-insensitively', () => {
      const totals = totalize(cart, 'welcome10', 'GB');
      expect(totals.discountCents).toBe(200);
    });

    it('applies VIP25 (25 %) only when subtotal >= 10000', () => {
      const bigCart = [{ productId: 'p1', quantity: 10, unitPriceCents: 2000 }];
      // subtotal = 20000 >= 10000
      const totals = totalize(bigCart, 'VIP25', 'GB');
      expect(totals.discountCents).toBe(5000);
    });

    it('does not apply VIP25 when subtotal < 10000', () => {
      // subtotal = 2000 < 10000
      const totals = totalize(cart, 'VIP25', 'GB');
      expect(totals.discountCents).toBe(0);
    });

    it('applies FREESHIP (0 % monetary discount)', () => {
      const totals = totalize(cart, 'FREESHIP', 'GB');
      expect(totals.discountCents).toBe(0);
      expect(totals.subtotalCents).toBe(2000);
    });
  });

  describe('route handler guard: unknown code returns 422 marker', () => {
    it('isKnownPromoCode returns false for unknown codes (route will 422)', () => {
      expect(isKnownPromoCode('NOTACODE')).toBe(false);
    });
  });
});
