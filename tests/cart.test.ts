import { describe, it, expect } from 'vitest';
import { addItem, removeItem, totalize } from '../lib/cart';

describe('cart · happy path', () => {
  it('adds new items', () => {
    const next = addItem([], { productId: 'p1', quantity: 2, unitPriceCents: 500 });
    expect(next).toHaveLength(1);
    expect(next[0].quantity).toBe(2);
  });

  it('merges duplicates', () => {
    const cart = [{ productId: 'p1', quantity: 1, unitPriceCents: 500 }];
    const next = addItem(cart, { productId: 'p1', quantity: 2, unitPriceCents: 500 });
    expect(next[0].quantity).toBe(3);
  });

  it('removes items', () => {
    const cart = [{ productId: 'p1', quantity: 1, unitPriceCents: 500 }];
    expect(removeItem(cart, 'p1')).toHaveLength(0);
  });

  it('computes a basic GB total', () => {
    const totals = totalize(
      [{ productId: 'p1', quantity: 2, unitPriceCents: 1000 }],
      null,
      'GB',
    );
    expect(totals.subtotalCents).toBe(2000);
    expect(totals.taxCents).toBe(400);
    expect(totals.totalCents).toBe(2400);
  });
});

// NOTE (workshop): the following branches have NO tests yet — Track 1 (test-improver)
// should expand coverage for them:
//   - addItem when merged quantity exceeds 99 (throws)
//   - applyDiscount: WELCOME10, VIP25 above & below threshold, FREESHIP, unknown code
//   - computeTax for DE, US-CA, US-OR, unknown region
//   - totalize when discount > subtotal (taxable should clamp at 0)
