export function normalizeInitialStock(initialStock: number | undefined, isCourtRental: boolean) {
  if (isCourtRental) return 0;
  return initialStock ?? 0;
}

export function calculateStockAfter(currentStock: number, quantityChange: number) {
  return currentStock + quantityChange;
}