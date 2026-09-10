"use client";

import { useState, useTransition } from "react";
import { adjustStockAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductRecord } from "../types";

export function StockAdjustForm({ products }: { products: ProductRecord[] }) {
  const physicalProducts = products.filter((product) => product.is_active && !product.is_court_rental);
  const [productId, setProductId] = useState(physicalProducts[0]?.id ?? "");
  const [quantityChange, setQuantityChange] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    startTransition(async () => {
      const result = await adjustStockAction({ productId, quantityChange: Number(quantityChange), reason });
      setMessage(result.error ?? "Stock actualizado correctamente.");
      if (!result.error) { setQuantityChange(""); setReason(""); window.location.reload(); }
    });
  }

  return <form onSubmit={submitForm} className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-1">Producto<select value={productId} onChange={(event) => setProductId(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500" required><option value="">Seleccionar</option>{physicalProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · stock {product.current_stock}</option>)}</select></label><label className="space-y-2 text-sm font-medium text-slate-700">Ajuste de stock<Input type="number" step="0.01" value={quantityChange} onChange={(event) => setQuantityChange(event.target.value)} placeholder="Ej. 5 o -3" required /></label><label className="space-y-2 text-sm font-medium text-slate-700">Motivo opcional<Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Rotura, conteo..." /></label></div>{message && <p role={message.endsWith("correctamente.") ? "status" : "alert"} className={message.endsWith("correctamente.") ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{message}</p>}<div className="flex justify-end"><Button type="submit" disabled={isPending || physicalProducts.length === 0}>{isPending ? "Aplicando..." : "Aplicar ajuste"}</Button></div></form>;
}