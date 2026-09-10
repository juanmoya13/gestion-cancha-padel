import { describe, expect, it } from "vitest";
import { calculateBalanceAfter, getAccountStatus, normalizePhones } from "./domain";

describe("player account rules", () => {
  it("adds a payment to a debt balance", () => {
    expect(calculateBalanceAfter(-10000, 4000)).toBe(-6000);
  });

  it("classifies debt, surplus and settled balances", () => {
    expect(getAccountStatus(-1)).toBe("debt");
    expect(getAccountStatus(1)).toBe("surplus");
    expect(getAccountStatus(0)).toBe("settled");
  });

  it("trims and removes duplicate phones", () => {
    expect(normalizePhones([" 11-1234 ", "11-1234", "", "11-5678"])).toEqual(["11-1234", "11-5678"]);
  });
});