"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPurchaseAction } from "@/actions/purchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { calculatePurchaseTotal } from "../domain";
import type { Product } from "@/types/database";

interface PurchaseFormProps {
  products: Product[];
}

interface FormItem {
  productId: string;
  quantity: string;
  unitPurchasePrice: string;
}

const emptyItem = (): FormItem => ({ productId: "", quantity: "1", unitPurchasePrice: "" });

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PurchaseForm({ products }: PurchaseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<FormItem[]>([emptyItem()]);
  const [date, setDate] = useState(() => toDateTimeLocalValue(new Date()));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();

  const total = calculatePurchaseTotal(items.filter((item) => item.productId).map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity) || 0,
    unitPurchasePrice: Number(item.unitPurchasePrice) || 0,
  })));

  function updateItem(index: number, field: keyof FormItem, value: string) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function removeItem(index: number) {
    setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await recordPurchaseAction({
        date: new Date(date).toISOString(),
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPurchasePrice: Number(item.unitPurchasePrice),
        })),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setItems([emptyItem()]);
      setNotes("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submitForm} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Fecha de compra
          <Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Notas <span className="font-normal text-slate-400">(opcional)</span>
          <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej. Reposición semanal" />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Productos comprados</h3>
          <Button type="button" className="h-9 bg-slate-100 px-3 text-slate-700 hover:bg-slate-200" onClick={() => setItems((current) => [...current, emptyItem()])}>
            Agregar producto
          </Button>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,1.5fr)_0.7fr_0.9fr_auto] sm:items-end">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Producto
              <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={item.productId} onChange={(event) => updateItem(index, "productId", event.target.value)} required>
                <option value="">Seleccionar producto</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Cantidad
              <Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Precio unitario
              <Input type="number" min="0" step="0.01" value={item.unitPurchasePrice} onChange={(event) => updateItem(index, "unitPurchasePrice", event.target.value)} required />
            </label>
            <Button type="button" aria-label="Quitar producto" className="h-10 bg-red-50 px-3 text-red-700 hover:bg-red-100" onClick={() => removeItem(index)} disabled={items.length === 1}>Quitar</Button>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total de la compra</p><p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">{formatCurrency(total)}</p></div>
        <Button type="submit" disabled={isPending || products.length === 0}>{isPending ? "Registrando..." : "Registrar compra"}</Button>
      </div>
    </form>
  );
}