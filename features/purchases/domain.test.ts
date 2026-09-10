import { describe, expect, it } from "vitest";
import { calculatePurchaseItemSubtotal, calculatePurchaseTotal, normalizePurchaseDate } from "./domain";

describe("purchase rules", () => {
  it("calculates each item subtotal and the complete total", () => {
    const items = [
      { productId: "one", quantity: 3, unitPurchasePrice: 1250 },
      { productId: "two", quantity: 2, unitPurchasePrice: 800.5 },
    ];

    expect(calculatePurchaseItemSubtotal(items[0])).toBe(3750);
    expect(calculatePurchaseTotal(items)).toBe(5351);
  });

  it("preserves a custom date as an ISO timestamp", () => {
    expect(normalizePurchaseDate("2026-09-09T12:00:00-03:00")).toBe("2026-09-09T15:00:00.000Z");
  });
});