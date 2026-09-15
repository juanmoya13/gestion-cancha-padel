import type { Player, Purchase } from "@/types/database";
import type { SaleWithItems } from "@/features/sales/types";
import type { AnalyticsSnapshot, PlayerBalanceSummary, RentalRanking } from "./types";

interface DateRange { start: Date; end: Date; }
function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function startOfWeek(date: Date) { const day = date.getDay(); const daysFromMonday = day === 0 ? 6 : day - 1; const result = startOfDay(date); result.setDate(result.getDate() - daysFromMonday); return result; }
function rangeFrom(start: Date, days: number): DateRange { const end = new Date(start); end.setDate(end.getDate() + days); return { start, end }; }
function inRange(value: string, range: DateRange) { const date = new Date(value); return date >= range.start && date < range.end; }
function validSales(sales: SaleWithItems[]) { return sales.filter((sale) => sale.status === "COMPLETADO"); }
function revenue(sales: SaleWithItems[], range: DateRange) { return validSales(sales).filter((sale) => inRange(sale.date, range)).reduce((total, sale) => total + sale.total_amount, 0); }
function rentalQuantity(sale: SaleWithItems) { return sale.items.filter((item) => item.product?.is_court_rental).reduce((total, item) => total + item.quantity, 0); }
function rentalTotal(sales: SaleWithItems[], range: DateRange) { return validSales(sales).filter((sale) => inRange(sale.date, range)).reduce((total, sale) => total + rentalQuantity(sale), 0); }
function rentalCounts(sales: SaleWithItems[], players: Player[], range: DateRange): RentalRanking[] {
  const counts = new Map<string, number>();
  validSales(sales).filter((sale) => sale.responsible_player_id && inRange(sale.date, range)).forEach((sale) => {
    const rentals = rentalQuantity(sale);
    if (rentals > 0 && sale.responsible_player_id) counts.set(sale.responsible_player_id, (counts.get(sale.responsible_player_id) ?? 0) + rentals);
  });
  return [...counts.entries()].map(([playerId, rentals]) => ({ playerId, rentals, playerName: (() => { const player = players.find((candidate) => candidate.id === playerId); return player ? `${player.first_name} ${player.last_name}` : "Jugador eliminado"; })() })).sort((a, b) => b.rentals - a.rentals || a.playerName.localeCompare(b.playerName));
}
function balanceSummaries(players: Player[]): PlayerBalanceSummary[] { return players.map((player) => ({ player, state: player.current_balance < 0 ? "DEUDA" : player.current_balance > 0 ? "A_FAVOR" : "SALDADO" })); }

export function calculateAnalytics(sales: SaleWithItems[], purchases: Purchase[], players: Player[], now = new Date()): AnalyticsSnapshot {
  const today = startOfDay(now); const month = startOfMonth(now); const week = startOfWeek(now);
  const weeklyRanking = rentalCounts(sales, players, rangeFrom(week, 7)).filter((entry) => entry.rentals > 2);
  const monthlyRanking = rentalCounts(sales, players, rangeFrom(month, new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() + 1)).filter((entry) => entry.rentals > 8);
  return {
    revenueToday: revenue(sales, rangeFrom(today, 1)), revenueMonth: revenue(sales, rangeFrom(month, new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() + 1)),
    expensesToday: purchases.filter((purchase) => inRange(purchase.date, rangeFrom(today, 1))).reduce((total, purchase) => total + purchase.total_amount, 0),
    expensesMonth: purchases.filter((purchase) => inRange(purchase.date, rangeFrom(month, new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() + 1))).reduce((total, purchase) => total + purchase.total_amount, 0),
    weeklyRentals: rentalTotal(sales, rangeFrom(week, 7)),
    balances: balanceSummaries(players), weeklyRanking, monthlyRanking,
    recentSales: sales.slice(0, 5), recentPurchases: purchases.slice(0, 5),
  };
}
