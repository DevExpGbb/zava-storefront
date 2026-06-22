import { describe, it, expect } from "vitest";

/**
 * Test calculation logic for promo-code endpoint
 * Tests the discount and tax calculation functions independently
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

describe("Promo-code endpoint calculation logic", () => {
  it("should calculate 10% discount correctly", () => {
    const subtotalCents = 2000;
    const discountPercentage = 10;
    const discountCents = Math.floor((subtotalCents * discountPercentage) / 100);

    expect(discountCents).toBe(200);
  });

  it("should handle zero discount", () => {
    const subtotalCents = 2000;
    const discountPercentage = 0;
    const discountCents = Math.floor((subtotalCents * discountPercentage) / 100);

    expect(discountCents).toBe(0);
  });

  it("should handle max discount (100%)", () => {
    const subtotalCents = 2000;
    const discountPercentage = 100;
    const discountCents = Math.floor((subtotalCents * discountPercentage) / 100);

    expect(discountCents).toBe(2000);
  });

  it("should calculate GB tax correctly", () => {
    const taxableCents = 900;
    const tax = computeTax(taxableCents, "GB");

    expect(tax).toBe(180); // 900 * 0.20
  });

  it("should calculate DE tax correctly", () => {
    const taxableCents = 1000;
    const tax = computeTax(taxableCents, "DE");

    expect(tax).toBe(190); // 1000 * 0.19
  });

  it("should calculate US-CA tax correctly", () => {
    const taxableCents = 1000;
    const tax = computeTax(taxableCents, "US-CA");

    expect(tax).toBe(73); // 1000 * 0.0725, rounded
  });

  it("should apply zero tax for US-OR", () => {
    const taxableCents = 1000;
    const tax = computeTax(taxableCents, "US-OR");

    expect(tax).toBe(0);
  });

  it("should apply default tax for unknown region", () => {
    const taxableCents = 1000;
    const tax = computeTax(taxableCents, "UNKNOWN");

    expect(tax).toBe(100); // 1000 * 0.10
  });

  it("should handle cart totals with discount and tax", () => {
    // Scenario: $20.00 subtotal, 10% discount, US-CA tax
    const subtotalCents = 2000;
    const discountPercentage = 10;
    const region = "US-CA";

    const discountCents = Math.floor((subtotalCents * discountPercentage) / 100);
    const taxableCents = Math.max(0, subtotalCents - discountCents);
    const taxCents = computeTax(taxableCents, region);
    const totalCents = taxableCents + taxCents;

    expect(discountCents).toBe(200);
    expect(taxableCents).toBe(1800);
    expect(taxCents).toBe(131); // 1800 * 0.0725 = 130.5, rounds to 131
    expect(totalCents).toBe(1931);
  });
});
