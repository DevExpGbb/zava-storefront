import { describe, it, expect } from 'vitest';
import { canCancel, fulfillmentMessage, summarize } from '../lib/orders';

describe('orders · pure helpers', () => {
  it('only pending orders can be cancelled', () => {
    expect(canCancel({ id: 'x', userId: 'u', totalCents: 1, status: 'pending', createdAt: '' })).toBe(true);
    expect(canCancel({ id: 'x', userId: 'u', totalCents: 1, status: 'paid', createdAt: '' })).toBe(false);
  });

  it('summarizes a cart', () => {
    expect(
      summarize([
        { productId: 'p1', quantity: 2, unitPriceCents: 100 },
        { productId: 'p2', quantity: 1, unitPriceCents: 100 },
      ]),
    ).toBe('3 items across 2 lines');
  });
});

// NOTE (workshop): createOrder, findOrder, fulfillmentMessage for non-pending statuses,
// and singular/plural edge cases of summarize are uncovered. Track 1 territory.
