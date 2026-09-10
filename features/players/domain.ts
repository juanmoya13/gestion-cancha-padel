export function normalizePhones(phones: string[]) {
  return [...new Set(phones.map((phone) => phone.trim()).filter(Boolean))];
}

export function calculateBalanceAfter(currentBalance: number, amountChange: number) {
  return currentBalance + amountChange;
}

export function getAccountStatus(balance: number): "debt" | "surplus" | "settled" {
  if (balance < 0) return "debt";
  if (balance > 0) return "surplus";
  return "settled";
}