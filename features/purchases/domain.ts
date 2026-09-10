import type { PurchaseItemInput } from "./types";

export function calculatePurchaseItemSubtotal(item: Pick<PurchaseItemInput, "quantity" | "unitPurchasePrice">) {
  return item.quantity * item.unitPurchasePrice;
}

export function calculatePurchaseTotal(items: PurchaseItemInput[]) {
  return items.reduce((total, item) => total + calculatePurchaseItemSubtotal(item), 0);
}

export function normalizePurchaseDate(date: string | undefined) {
  return date ? new Date(date).toISOString() : undefined;
}