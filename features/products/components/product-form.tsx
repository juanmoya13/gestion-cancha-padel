"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductRecord } from "../types";

interface ProductFormProps {
  product?: ProductRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [name, setName] = useState(product?.name ?? "");
  const [salePrice, setSalePrice] = useState(product?.sale_price.toString() ?? "");
  const [unitOfMeasure, setUnitOfMeasure] = useState(product?.unit_of_measure ?? "unidad");
  const [initialStock, setInitialStock] = useState(product?.current_stock.toString() ?? "0");
  const [isCourtRental, setIsCourtRental] = useState(product?.is_court_rental ?? false);

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const input = {
        name,
        salePrice: Number(salePrice),
        unitOfMeasure,
        isCourtRental,
        initialStock: Number(initialStock),
      };
      const result = product
        ? await updateProductAction({ ...input, productId: product.id })
        : await createProductAction(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (onSuccess) onSuccess();
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submitForm} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
          Nombre
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Agua mineral" required />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Precio de venta
          <Input type="number" min="0" step="0.01" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} placeholder="0" required />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Unidad de medida
          <Input value={unitOfMeasure} onChange={(event) => setUnitOfMeasure(event.target.value)} placeholder="unidad" required />
        </label>
        {!product && (
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Stock inicial
            <Input type="number" step="0.01" value={initialStock} onChange={(event) => setInitialStock(event.target.value)} disabled={isCourtRental} />
          </label>
        )}
        <label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={isCourtRental} onChange={(event) => setIsCourtRental(event.target.checked)} className="size-4 accent-emerald-600" />
          Es alquiler de cancha
        </label>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" className="bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}</Button>
      </div>
    </form>
  );
}