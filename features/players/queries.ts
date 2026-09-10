import { createClient } from "@/lib/supabase/server";
import type { AccountMovementRecord, PlayerRecord } from "./types";

export async function getPlayers(includeInactive = false): Promise<PlayerRecord[]> {
  const supabase = await createClient();
  let query = supabase.from("players").select("*").order("last_name").order("first_name");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data: players, error } = await query;
  if (error) throw new Error(`No se pudieron cargar los jugadores: ${error.message}`);

  const { data: phones, error: phonesError } = await supabase.from("player_phones").select("*");
  if (phonesError) throw new Error(`No se pudieron cargar los teléfonos: ${phonesError.message}`);

  return (players ?? []).map((player) => ({
    ...player,
    phones: (phones ?? []).filter((phone) => phone.player_id === player.id),
  }));
}

export async function getPlayerAccountMovements(playerId: string): Promise<AccountMovementRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("account_movements").select("*").eq("player_id", playerId).order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los movimientos de cuenta: ${error.message}`);
  return data ?? [];
}

export async function getAccountMovements(): Promise<AccountMovementRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("account_movements").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los movimientos de cuenta: ${error.message}`);
  return data ?? [];
}