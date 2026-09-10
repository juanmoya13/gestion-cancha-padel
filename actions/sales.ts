"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cancelSaleSchema, recordSaleSchema } from "@/features/sales/schemas";
import type { ActionResult, CancelSaleInput, RecordSaleInput, SaleRecord } from "@/features/sales/types";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function recordSaleAction(input: RecordSaleInput): Promise<ActionResult<SaleRecord>> {
  const parsed = recordSaleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { data, error } = await supabase.rpc("record_sale", {
  p_date: parsed.data.date ?? null,
  p_responsible_player_id: parsed.data.responsiblePlayerId ?? null,
  p_payment_method: parsed.data.paymentMethod,
  p_notes: parsed.data.notes || null,
  p_items: parsed.data.items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
  })),
});
  if (error || !data) return { error: error?.message ?? "No se pudo registrar la venta" };
  revalidatePath("/ventas"); revalidatePath("/historial"); revalidatePath("/dashboard"); revalidatePath("/reportes"); revalidatePath("/productos"); revalidatePath("/stock"); revalidatePath("/jugadores"); revalidatePath("/cuenta-corriente");
  return { data };
}

export async function cancelSaleAction(input: CancelSaleInput): Promise<ActionResult<void>> {
  const parsed = cancelSaleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "La venta no es válida" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { error } = await supabase.rpc("cancel_sale", { p_sale_id: parsed.data.saleId, p_reason: parsed.data.reason || null });
  if (error) return { error: error.message };
  revalidatePath("/ventas"); revalidatePath("/historial"); revalidatePath("/dashboard"); revalidatePath("/reportes"); revalidatePath("/productos"); revalidatePath("/stock"); revalidatePath("/jugadores"); revalidatePath("/cuenta-corriente");
  return {};
}
