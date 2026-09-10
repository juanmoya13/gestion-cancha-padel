"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizePurchaseDate } from "@/features/purchases/domain";
import { recordPurchaseSchema } from "@/features/purchases/schemas";
import type { PurchaseActionResult, PurchaseRecord, RecordPurchaseInput } from "@/features/purchases/types";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function recordPurchaseAction(input: RecordPurchaseInput): Promise<PurchaseActionResult<PurchaseRecord>> {
  const parsed = recordPurchaseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };

  const { data, error } = await supabase.rpc("record_purchase", {
    p_date: normalizePurchaseDate(parsed.data.date) ?? null,
    p_notes: parsed.data.notes || null,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_purchase_price: item.unitPurchasePrice,
    })),
  });

  if (error || !data) return { error: error?.message ?? "No se pudo registrar la compra" };

  revalidatePath("/compras");
  revalidatePath("/productos");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { data };
}