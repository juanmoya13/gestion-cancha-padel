"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adjustAccountBalanceSchema, recordPaymentSchema } from "@/features/players/schemas";
import type { ActionResult, AdjustAccountBalanceInput, AccountMovementRecord, RecordPaymentInput } from "@/features/players/types";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function recordPaymentAction(input: RecordPaymentInput): Promise<ActionResult<AccountMovementRecord>> {
  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { data, error } = await supabase.rpc("record_account_payment", {
    p_player_id: parsed.data.playerId,
    p_amount: parsed.data.amount,
    p_notes: parsed.data.notes || null,
  });
  if (error || !data) return { error: error?.message ?? "No se pudo registrar el cobro" };
  revalidatePath("/jugadores");
  revalidatePath("/cuenta-corriente");
  revalidatePath("/dashboard");
  return { data };
}

export async function adjustAccountBalanceAction(input: AdjustAccountBalanceInput): Promise<ActionResult<AccountMovementRecord>> {
  const parsed = adjustAccountBalanceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { data, error } = await supabase.rpc("adjust_account_balance", {
    p_player_id: parsed.data.playerId,
    p_amount_change: parsed.data.amountChange,
    p_reason: parsed.data.reason || null,
  });
  if (error || !data) return { error: error?.message ?? "No se pudo ajustar la cuenta" };
  revalidatePath("/jugadores");
  revalidatePath("/cuenta-corriente");
  revalidatePath("/dashboard");
  return { data };
}