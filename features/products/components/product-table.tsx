"use client";

import { useState, useTransition } from "react";
import { deleteProductAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProductForm } from "./product-form";
import type { ProductRecord } from "../types";

export function ProductTable({ products }: { products: ProductRecord[] }) {
  const [editing, setEditing] = useState<ProductRecord>();
  const [confirming, setConfirming] = useState<ProductRecord>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function removeProduct() {
    if (!confirming) return;
    startTransition(async () => {
      const result = await deleteProductAction(confirming.id);
      if (result.error) setError(result.error);
      setConfirming(undefined);
    });
  }

  if (editing) {
    return <Card><CardContent className="pt-6"><h2 className="mb-5 text-lg font-semibold text-slate-900">Editar producto</h2><ProductForm product={editing} onCancel={() => setEditing(undefined)} onSuccess={() => { setEditing(undefined); window.location.reload(); }} /></CardContent></Card>;
  }

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        {error && <p role="alert" className="m-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {products.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Todavía no hay productos activos.</p> : (
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Producto</th><th className="px-5 py-3">Unidad</th><th className="px-5 py-3 text-right">Precio</th><th className="px-5 py-3 text-right">Stock</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => <tr key={product.id}>
                <td className="px-5 py-4 font-medium text-slate-900">{product.name}{product.is_court_rental && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Cancha</span>}</td>
                <td className="px-5 py-4 text-slate-500">{product.unit_of_measure}</td>
                <td className="px-5 py-4 text-right font-mono tabular-nums">{formatCurrency(product.sale_price)}</td>
                <td className={cn("px-5 py-4 text-right font-mono font-semibold tabular-nums", product.is_court_rental ? "text-slate-400" : product.current_stock < 0 ? "bg-red-100 text-red-800" : product.current_stock <= 5 ? "text-amber-700" : "text-slate-900")}>{product.is_court_rental ? "No aplica" : product.current_stock}</td>
                <td className="px-5 py-4 text-right"><Button type="button" className="mr-2 bg-slate-100 px-3 text-slate-700 hover:bg-slate-200" onClick={() => setEditing(product)}>Editar</Button><Button type="button" className="bg-transparent px-3 text-red-700 hover:bg-red-50" onClick={() => setConfirming(product)}>Eliminar</Button></td>
              </tr>)}
            </tbody>
          </table>
        )}
      </CardContent>
      {confirming && <div className="border-t border-red-100 bg-red-50 p-4"><p className="text-sm text-red-800">¿Eliminar lógicamente <strong>{confirming.name}</strong>? Conservará su historial.</p><div className="mt-3 flex justify-end gap-2"><Button type="button" className="bg-white text-slate-700 hover:bg-slate-100" onClick={() => setConfirming(undefined)}>Cancelar</Button><Button type="button" disabled={isPending} className="bg-red-600 hover:bg-red-700" onClick={removeProduct}>{isPending ? "Eliminando..." : "Confirmar eliminación"}</Button></div></div>}
    </Card>
  );
}