import { describe, it, expect } from 'vitest';
import { isPromoCodeValid, calculateDiscount } from '../lib/promo';

describe('promo · validation and calculation', () => {
  it('accepts valid active promo codes within date range', () => {
    const now = new Date();
    const promo = {
      id: 'promo_1',
      code: 'VALID10',
      discountPercentage: 10,
      validFrom: new Date(now.getTime() - 86400000).toISOString(), // Yesterday
      validUntil: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
      active: true,
      createdAt: new Date().toISOString(),
    };

    expect(isPromoCodeValid(promo)).toBe(true);
  });

  it('rejects inactive promo codes', () => {
    const now = new Date();
    const promo = {
      id: 'promo_2',
      code: 'INACTIVE10',
      discountPercentage: 10,
      validFrom: new Date(now.getTime() - 86400000).toISOString(),
      validUntil: new Date(now.getTime() + 86400000).toISOString(),
      active: false,
      createdAt: new Date().toISOString(),
    };

    expect(isPromoCodeValid(promo)).toBe(false);
  });

  it('rejects expired promo codes (past valid date)', () => {
    const now = new Date();
    const promo = {
      id: 'promo_3',
      code: 'EXPIRED10',
      discountPercentage: 10,
      validFrom: new Date(now.getTime() - 172800000).toISOString(), // 2 days ago
      validUntil: new Date(now.getTime() - 86400000).toISOString(), // Yesterday (expired)
      active: true,
      createdAt: new Date().toISOString(),
    };

    expect(isPromoCodeValid(promo)).toBe(false);
  });

  it('rejects promo codes not yet valid (future start date)', () => {
    const now = new Date();
    const promo = {
      id: 'promo_4',
      code: 'FUTURE10',
      discountPercentage: 10,
      validFrom: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
      validUntil: new Date(now.getTime() + 172800000).toISOString(), // 2 days from now
      active: true,
      createdAt: new Date().toISOString(),
    };

    expect(isPromoCodeValid(promo)).toBe(false);
  });

  it('calculates discount correctly for percentage-based discount', () => {
    expect(calculateDiscount(10000, 10)).toBe(1000); // 10% of $100
    expect(calculateDiscount(50000, 25)).toBe(12500); // 25% of $500
    expect(calculateDiscount(1000, 5)).toBe(50); // 5% of $10
  });

  it('rounds down discount to nearest cent', () => {
    expect(calculateDiscount(10001, 33)).toBe(3300); // 33% of $100.01 = $33.0033 → $33.00
  });

  it('handles zero discount percentage', () => {
    expect(calculateDiscount(10000, 0)).toBe(0);
  });

  it('handles 100% discount', () => {
    expect(calculateDiscount(10000, 100)).toBe(10000);
  });

  it('handles zero subtotal', () => {
    expect(calculateDiscount(0, 10)).toBe(0);
  });
});
