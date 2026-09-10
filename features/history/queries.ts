import { getAccountMovements } from "@/features/players/queries";
import { getPurchases } from "@/features/purchases/queries";
import { getSales } from "@/features/sales/queries";
import { getStockMovements } from "@/features/products/queries";

export async function getOperationHistory() {
  const [sales, purchases, stockMovements, accountMovements] = await Promise.all([getSales(), getPurchases(), getStockMovements(), getAccountMovements()]);
  return { sales, purchases, stockMovements, accountMovements };
}
