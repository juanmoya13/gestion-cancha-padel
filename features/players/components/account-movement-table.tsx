import type { AccountMovementRecord } from "../types";
import { formatCurrency } from "@/lib/utils";

const movementLabels = { PAGO: "Cobro", AJUSTE_MANUAL: "Ajuste", CARGO_VENTA: "Venta", CANCELACION_VENTA: "Anulación" } as const;

export function AccountMovementTable({ movements }: { movements: AccountMovementRecord[] }) {
  if (movements.length === 0) return <p className="px-6 py-8 text-center text-sm text-slate-500">Todavía no hay movimientos de cuenta.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Fecha</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3">Importe</th><th className="px-6 py-3">Saldo resultante</th><th className="px-6 py-3">Motivo</th></tr></thead><tbody className="divide-y divide-slate-100">{movements.map((movement) => <tr key={movement.id}><td className="whitespace-nowrap px-6 py-4 text-slate-500">{new Date(movement.created_at).toLocaleString("es-AR")}</td><td className="px-6 py-4 font-medium text-slate-800">{movementLabels[movement.movement_type]}</td><td className={`px-6 py-4 font-mono tabular-nums ${movement.amount_change >= 0 ? "text-emerald-700" : "text-red-700"}`}>{movement.amount_change >= 0 ? "+" : ""}{formatCurrency(movement.amount_change)}</td><td className="px-6 py-4 font-mono font-semibold tabular-nums">{formatCurrency(movement.balance_after)}</td><td className="px-6 py-4 text-slate-500">{movement.reason ?? "-"}</td></tr>)}</tbody></table></div>;
}