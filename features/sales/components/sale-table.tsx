"use client";

import { useState, useTransition } from "react";
import { cancelSaleAction } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { SaleWithItems } from "../types";

export function SaleTable({ sales }: { sales: SaleWithItems[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  function cancel(sale: SaleWithItems) {
    if (!window.confirm(`¿Anular la venta de ${formatCurrency(sale.total_amount)}?`)) return;
    startTransition(async () => { const result = await cancelSaleAction({ saleId: sale.id }); if (result.error) setError(result.error); });
  }
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Detalle</th><th className="px-4 py-3">Jugador</th><th className="px-4 py-3">Pago</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Estado</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{sales.map((sale) => { const cancelled = sale.status === "CANCELADO"; return <tr key={sale.id} className={cancelled ? "bg-slate-50 text-slate-400" : ""}><td className={cancelled ? "px-4 py-4 line-through" : "px-4 py-4"}>{new Date(sale.date).toLocaleString("es-AR")}</td><td className={cancelled ? "px-4 py-4 line-through" : "px-4 py-4"}>{sale.items.map((item) => `${item.product?.name ?? "Producto"} x${item.quantity}`).join(", ")}</td><td className="px-4 py-4">{sale.responsiblePlayer ? `${sale.responsiblePlayer.first_name} ${sale.responsiblePlayer.last_name}` : "Sin jugador"}</td><td className="px-4 py-4">{sale.payment_method.replaceAll("_", " ")}</td><td className="px-4 py-4 text-right font-mono font-semibold tabular-nums">{formatCurrency(sale.total_amount)}</td><td className="px-4 py-4 text-center"><span className={cancelled ? "rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700" : "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"}>{cancelled ? "Anulada" : "Completada"}</span></td><td className="px-4 py-4 text-right">{!cancelled && <Button className="h-8 bg-red-50 px-3 text-xs text-red-700 hover:bg-red-100" onClick={() => cancel(sale)} disabled={isPending}>Anular</Button>}</td></tr>; })}</tbody></table>{error && <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{sales.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-500">Todavía no hay ventas registradas.</p>}</div>;
}
