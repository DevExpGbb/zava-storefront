import { describe, it, expect } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

/**
 * Helper to create a NextRequest for testing
 */
function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/promo-code", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/promo-code", () => {
  it("should apply a 10% discount to valid cart", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: 2, unitPriceCents: 1000 },
      ],
      promoCode: "SAVE10",
      region: "US-CA",
      discountPercentage: 10,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.subtotalCents).toBe(2000);
    expect(data.discountCents).toBe(200);
    expect(data.discountPercentage).toBe(10);
  });

  it("should reject empty cart", async () => {
    const req = createRequest({
      cartItems: [],
      promoCode: "SAVE10",
      region: "US-CA",
      discountPercentage: 10,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("empty_cart");
  });

  it("should reject invalid discount percentage", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: 1, unitPriceCents: 1000 },
      ],
      promoCode: "INVALID",
      region: "US-CA",
      discountPercentage: 150, // Invalid: > 100
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_request");
  });

  it("should apply correct tax for GB region", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: 1, unitPriceCents: 1000 },
      ],
      promoCode: "SAVE10",
      region: "GB",
      discountPercentage: 10,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    // Subtotal: 1000, Discount: 100, Taxable: 900
    // Tax: 900 * 0.20 = 180
    expect(data.taxCents).toBe(180);
    expect(data.totalCents).toBe(1080);
  });

  it("should apply zero tax for US-OR region", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: 1, unitPriceCents: 1000 },
      ],
      promoCode: "SAVE10",
      region: "US-OR",
      discountPercentage: 10,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.taxCents).toBe(0);
    expect(data.totalCents).toBe(900); // Just the discounted subtotal
  });

  it("should handle multiple cart items", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: 2, unitPriceCents: 1000 },
        { productId: "p2", quantity: 1, unitPriceCents: 500 },
      ],
      promoCode: "SAVE20",
      region: "US-CA",
      discountPercentage: 20,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.subtotalCents).toBe(2500); // 1000*2 + 500
    expect(data.discountCents).toBe(500); // 2500 * 0.20
  });

  it("should reject missing required fields", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: 1, unitPriceCents: 1000 },
      ],
      // Missing promoCode, region, discountPercentage
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("should reject invalid cart item", async () => {
    const req = createRequest({
      cartItems: [
        { productId: "p1", quantity: -1, unitPriceCents: 1000 }, // Invalid: negative quantity
      ],
      promoCode: "SAVE10",
      region: "US-CA",
      discountPercentage: 10,
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
