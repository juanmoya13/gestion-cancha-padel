import { describe, expect, it } from "vitest";
import { calculateAnalytics } from "./domain";
import type { Player, Product, Purchase } from "@/types/database";
import type { SaleWithItems } from "@/features/sales/types";

const player = (id: string): Player => ({ id, first_name: "Ana", last_name: "Pádel", gender: null, skill_level: 5, current_balance: 0, is_active: true, created_at: "2026-09-09T10:00:00Z", updated_at: "2026-09-09T10:00:00Z" });
const product: Product = { id: "00000000-0000-0000-0000-000000000001", name: "Cancha", sale_price: 1000, unit_of_measure: "alquiler", is_court_rental: true, current_stock: 0, is_active: true, created_at: "", updated_at: "" };
function sale(id: string, date: string, status: SaleWithItems["status"] = "COMPLETADO", responsiblePlayerId: string | null = "p1"): SaleWithItems { return { id, date, responsible_player_id: responsiblePlayerId, payment_method: "EFECTIVO", total_amount: 1000, status, notes: null, created_at: date, responsiblePlayer: responsiblePlayerId ? { first_name: "Ana", last_name: "Pádel" } : null, items: [{ id: `i-${id}`, sale_id: id, product_id: product.id, quantity: 1, unit_price: 1000, subtotal: 1000, product }] }; }
const purchase: Purchase = { id: "purchase", date: "2026-09-09T11:00:00Z", total_amount: 500, notes: null, created_at: "" };

describe("calculateAnalytics", () => {
  it("counts rentals without a registered player in the weekly metric", () => {
    const result = calculateAnalytics([sale("anonymous", "2026-09-09T08:00:00Z", "COMPLETADO", null)], [], [], new Date("2026-09-09T12:00:00Z"));

    expect(result.weeklyRentals).toBe(1);
    expect(result.weeklyRanking).toEqual([]);
    expect(result.monthlyRanking).toEqual([]);
  });

  it("excludes cancelled sales and applies ranking thresholds", () => {
    const sales = [sale("1", "2026-09-09T08:00:00Z"), sale("2", "2026-09-09T09:00:00Z"), sale("3", "2026-09-09T10:00:00Z"), sale("4", "2026-09-09T11:00:00Z", "CANCELADO")];
    const result = calculateAnalytics(sales, [purchase], [player("p1")], new Date("2026-09-09T12:00:00Z"));
    expect(result.revenueToday).toBe(3000);
    expect(result.weeklyRentals).toBe(3);
    expect(result.weeklyRanking[0]?.rentals).toBe(3);
    expect(result.monthlyRanking).toEqual([]);
  });
});
