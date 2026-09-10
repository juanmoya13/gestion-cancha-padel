"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizePhones } from "@/features/players/domain";
import { createPlayerSchema, deletePlayerSchema, updatePlayerSchema } from "@/features/players/schemas";
import type { ActionResult, CreatePlayerInput, PlayerRecord, UpdatePlayerInput } from "@/features/players/types";
import { getPlayers } from "@/features/players/queries";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function findPlayer(supabase: Awaited<ReturnType<typeof createClient>>, playerId: string) {
  const { data, error } = await supabase.from("players").select("*").eq("id", playerId).single();
  if (error || !data) return undefined;
  const { data: phones } = await supabase.from("player_phones").select("*").eq("player_id", playerId);
  return { ...data, phones: phones ?? [] } satisfies PlayerRecord;
}

export async function createPlayerAction(input: CreatePlayerInput): Promise<ActionResult<PlayerRecord>> {
  const parsed = createPlayerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };
  const phones = normalizePhones(parsed.data.phones);
  if (phones.length === 0) return { error: "Agregá al menos un teléfono" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { data, error } = await supabase.rpc("create_player", {
    p_first_name: parsed.data.firstName,
    p_last_name: parsed.data.lastName,
    p_gender: parsed.data.gender || null,
    p_skill_level: parsed.data.skillLevel ?? null,
    p_phones: phones,
  });
  if (error || !data) return { error: error?.message ?? "No se pudo crear el jugador" };
  revalidatePath("/jugadores");
  revalidatePath("/cuenta-corriente");
  return { data: (await findPlayer(supabase, data.id)) as PlayerRecord };
}

export async function updatePlayerAction(input: UpdatePlayerInput): Promise<ActionResult<PlayerRecord>> {
  const parsed = updatePlayerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };
  const phones = normalizePhones(parsed.data.phones);
  if (phones.length === 0) return { error: "Agregá al menos un teléfono" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { data, error } = await supabase.rpc("update_player", {
    p_player_id: parsed.data.playerId,
    p_first_name: parsed.data.firstName,
    p_last_name: parsed.data.lastName,
    p_gender: parsed.data.gender || null,
    p_skill_level: parsed.data.skillLevel ?? null,
    p_phones: phones,
  });
  if (error || !data) return { error: error?.message ?? "No se pudo actualizar el jugador" };
  revalidatePath("/jugadores");
  revalidatePath("/cuenta-corriente");
  return { data: (await findPlayer(supabase, data.id)) as PlayerRecord };
}

export async function deletePlayerAction(playerId: string): Promise<ActionResult<void>> {
  const parsed = deletePlayerSchema.safeParse(playerId);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "El jugador no es válido" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };
  const { error } = await supabase.rpc("delete_player", { p_player_id: parsed.data });
  if (error) return { error: error.message };
  revalidatePath("/jugadores");
  revalidatePath("/cuenta-corriente");
  return {};
}

export async function refreshPlayers() {
  return getPlayers();
}