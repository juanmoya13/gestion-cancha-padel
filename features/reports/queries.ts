import { getPlayers } from "@/features/players/queries";
import { getPurchases } from "@/features/purchases/queries";
import { getSales } from "@/features/sales/queries";
import { calculateAnalytics } from "./domain";

export async function getAnalyticsSnapshot() {
  const [sales, purchases, players] = await Promise.all([getSales(), getPurchases(), getPlayers()]);
  return calculateAnalytics(sales, purchases, players);
}
