import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getAccountStatus } from "../domain";

export function AccountBadge({ balance }: { balance: number }) {
  const status = getAccountStatus(balance);
  if (status === "debt") return <Badge className="border-red-200 bg-red-50 text-red-700">Deuda: {formatCurrency(Math.abs(balance))}</Badge>;
  if (status === "surplus") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">A favor: {formatCurrency(balance)}</Badge>;
  return <Badge className="border-slate-200 bg-slate-100 text-slate-600">Saldado: {formatCurrency(0)}</Badge>;
}