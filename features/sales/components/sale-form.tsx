"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordSaleAction } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { calculateSaleTotal } from "../domain";
import type { Player } from "@/types/database";
import type { Product } from "@/types/database";
import type { PaymentMethod } from "@/types/database";

interface SaleFormProps { products: Product[]; players: Player[]; }
interface FormItem { productId: string; quantity: string; }
const emptyItem = (): FormItem => ({ productId: "", quantity: "1" });
function toDateTimeLocalValue(date: Date) { const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }

export function SaleForm({ products, players }: SaleFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<FormItem[]>([emptyItem()]);
  const [date, setDate] = useState(() => toDateTimeLocalValue(new Date()));
  const [playerId, setPlayerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const selectedItems = items.filter((item) => item.productId).map((item) => ({ productId: item.productId, quantity: Number(item.quantity) || 0 }));
  const total = calculateSaleTotal(selectedItems, products);

  function updateItem(index: number, field: keyof FormItem, value: string) { setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)); }
  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(undefined);
    startTransition(async () => {
      const result = await recordSaleAction({ date: new Date(date).toISOString(), responsiblePlayerId: playerId || undefined, paymentMethod, notes, items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) })) });
      if (result.error) { setError(result.error); return; }
      setItems([emptyItem()]); setPlayerId(""); setNotes(""); router.refresh();
    });
  }

  return <form onSubmit={submitForm} className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3"><label className="space-y-2 text-sm font-medium text-slate-700">Fecha<Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label className="space-y-2 text-sm font-medium text-slate-700">Medio de pago<select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="CUENTA_CORRIENTE">Cuenta corriente</option></select></label><label className="space-y-2 text-sm font-medium text-slate-700">Jugador responsable <span className="font-normal text-slate-400">(opcional)</span><select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={playerId} onChange={(event) => setPlayerId(event.target.value)}><option value="">Sin jugador</option>{players.map((player) => <option key={player.id} value={player.id}>{player.last_name}, {player.first_name}</option>)}</select></label></div>
    <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Productos y alquileres</h3><Button type="button" className="h-9 bg-slate-100 px-3 text-slate-700 hover:bg-slate-200" onClick={() => setItems((current) => [...current, emptyItem()])}>Agregar ítem</Button></div>{items.map((item, index) => <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_0.4fr_auto] sm:items-end"><label className="space-y-2 text-sm font-medium text-slate-700">Producto o alquiler<select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={item.productId} onChange={(event) => updateItem(index, "productId", event.target.value)} required><option value="">Seleccionar</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}{product.is_court_rental ? " · cancha" : ""} - {formatCurrency(product.sale_price)}</option>)}</select></label><label className="space-y-2 text-sm font-medium text-slate-700">Cantidad<Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} required /></label><Button type="button" className="h-10 bg-red-50 px-3 text-red-700 hover:bg-red-100" onClick={() => setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index))} disabled={items.length === 1}>Quitar</Button></div>)}</div>
    <label className="block space-y-2 text-sm font-medium text-slate-700">Notas <span className="font-normal text-slate-400">(opcional)</span><Input value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p><p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">{formatCurrency(total)}</p></div><Button type="submit" disabled={isPending}>{isPending ? "Registrando..." : "Registrar venta"}</Button></div>
  </form>;
}
