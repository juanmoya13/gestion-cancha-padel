import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats amounts in Argentine pesos", () => {
    expect(formatCurrency(12500)).toContain("12.500");
    expect(formatCurrency(12500)).toContain("$");
  });
});