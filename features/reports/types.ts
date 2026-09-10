import type { Player, Purchase } from "@/types/database";
import type { SaleWithItems } from "@/features/sales/types";

export interface PlayerBalanceSummary { player: Player; state: "DEUDA" | "A_FAVOR" | "SALDADO"; }
export interface RentalRanking { playerId: string; playerName: string; rentals: number; }
export interface AnalyticsSnapshot {
  revenueToday: number;
  revenueMonth: number;
  expensesToday: number;
  expensesMonth: number;
  weeklyRentals: number;
  balances: PlayerBalanceSummary[];
  weeklyRanking: RentalRanking[];
  monthlyRanking: RentalRanking[];
  recentSales: SaleWithItems[];
  recentPurchases: Purchase[];
}
