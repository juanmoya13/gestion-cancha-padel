import { describe, expect, it } from "vitest";
import { calculateStockAfter, normalizeInitialStock } from "./domain";

describe("product stock rules", () => {
  it("does not assign physical stock to court rentals", () => {
    expect(normalizeInitialStock(8, true)).toBe(0);
  });

  it("allows stock to become negative", () => {
    expect(calculateStockAfter(0, -3)).toBe(-3);
  });

  it("uses zero when initial stock is omitted", () => {
    expect(normalizeInitialStock(undefined, false)).toBe(0);
  });
});