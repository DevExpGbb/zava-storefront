import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { applyDiscount } from '../lib/cart';
import { POST } from '../app/api/cart/promo/route';

// ---------------------------------------------------------------------------
// Pure helper: applyDiscount
// ---------------------------------------------------------------------------
describe('applyDiscount', () => {
  const subtotal = 10_000; // £100.00

  it('returns 0 when no code provided', () => {
    expect(applyDiscount(subtotal, null)).toBe(0);
  });

  it('WELCOME10 applies 10% discount', () => {
    expect(applyDiscount(subtotal, 'WELCOME10')).toBe(1_000);
  });

  it('WELCOME10 is case-insensitive', () => {
    expect(applyDiscount(subtotal, 'welcome10')).toBe(1_000);
  });

  it('VIP25 applies 25% when subtotal >= 10000', () => {
    expect(applyDiscount(10_000, 'VIP25')).toBe(2_500);
  });

  it('VIP25 returns 0 when subtotal < 10000', () => {
    expect(applyDiscount(9_999, 'VIP25')).toBe(0);
  });

  it('FREESHIP returns 0 (shipping handled elsewhere)', () => {
    expect(applyDiscount(subtotal, 'FREESHIP')).toBe(0);
  });

  it('unknown code returns 0', () => {
    expect(applyDiscount(subtotal, 'NOTACODE')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// POST /api/cart/promo — route handler
// ---------------------------------------------------------------------------

function buildRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/cart/promo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/cart/promo', () => {
  const singleItem = [{ productId: 'p1', quantity: 2, unitPriceCents: 1_000 }];

  it('returns 400 for non-JSON body', async () => {
    const req = new NextRequest('http://localhost/api/cart/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_json');
  });

  it('returns 400 when items array is empty', async () => {
    const res = await POST(buildRequest({ items: [], region: 'GB' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_request');
  });

  it('returns 400 when region is missing', async () => {
    const res = await POST(buildRequest({ items: singleItem }));
    expect(res.status).toBe(400);
  });

  it('applies WELCOME10 promo code correctly', async () => {
    const res = await POST(buildRequest({ items: singleItem, promoCode: 'WELCOME10', region: 'GB' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    // subtotal = 2 * 1000 = 2000; discount = 200; taxable = 1800; tax GB 20% = 360; total = 2160
    expect(json.totals.subtotalCents).toBe(2_000);
    expect(json.totals.discountCents).toBe(200);
    expect(json.totals.taxCents).toBe(360);
    expect(json.totals.totalCents).toBe(2_160);
    expect(json.promoApplied).toBe(true);
    expect(json.promoCode).toBe('WELCOME10');
  });

  it('sets promoApplied=false for unknown code', async () => {
    const res = await POST(buildRequest({ items: singleItem, promoCode: 'BOGUS', region: 'GB' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.totals.discountCents).toBe(0);
    expect(json.promoApplied).toBe(false);
  });

  it('works without a promo code (omitted)', async () => {
    const res = await POST(buildRequest({ items: singleItem, region: 'US-CA' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.promoCode).toBeNull();
    expect(json.promoApplied).toBe(false);
  });

  it('works with promoCode: null explicitly', async () => {
    const res = await POST(buildRequest({ items: singleItem, promoCode: null, region: 'DE' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.promoApplied).toBe(false);
  });
});
