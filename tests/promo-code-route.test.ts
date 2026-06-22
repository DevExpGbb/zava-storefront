import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/cart/promo-code/route';

function buildRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest('http://localhost:3000/api/cart/promo-code', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/cart/promo-code', () => {
  it('returns unauthorized when auth headers are missing', async () => {
    const response = await POST(
      buildRequest({
        items: [{ productId: 'p1', quantity: 1, unitPriceCents: 10_000 }],
        promoCode: 'WELCOME10',
        region: 'GB',
      }),
    );

    expect(response.status).toBe(401);
  });

  it('returns forbidden when role is not customer', async () => {
    const response = await POST(
      buildRequest(
        {
          items: [{ productId: 'p1', quantity: 1, unitPriceCents: 10_000 }],
          promoCode: 'WELCOME10',
          region: 'GB',
        },
        {
          authorization: 'Bearer test-token',
          'x-user-id': 'u1',
          'x-user-role': 'admin',
        },
      ),
    );

    expect(response.status).toBe(403);
  });

  it('returns bad request for an invalid or inapplicable code', async () => {
    const response = await POST(
      buildRequest(
        {
          items: [{ productId: 'p1', quantity: 1, unitPriceCents: 1_000 }],
          promoCode: 'VIP25',
          region: 'GB',
        },
        {
          authorization: 'Bearer test-token',
          'x-user-id': 'u1',
          'x-user-role': 'customer',
        },
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_or_inapplicable_promo_code',
    });
  });

  it('applies percentage discount and returns totals', async () => {
    const response = await POST(
      buildRequest(
        {
          items: [{ productId: 'p1', quantity: 1, unitPriceCents: 10_000 }],
          promoCode: 'vip25',
          region: 'GB',
        },
        {
          authorization: 'Bearer test-token',
          'x-user-id': 'u1',
          'x-user-role': 'customer',
        },
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      promoCode: 'VIP25',
      discountPercent: 25,
      totals: {
        subtotalCents: 10_000,
        discountCents: 2_500,
        taxCents: 1_500,
        totalCents: 9_000,
      },
    });
  });
});
