import { createClient } from "@/lib/supabase/server";
import type { ProductRecord, StockMovementRecord } from "./types";

export async function getActiveProducts(): Promise<ProductRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  return data ?? [];
}

export async function getInventoryProducts(): Promise<ProductRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("is_active", { ascending: false }).order("name");

  if (error) throw new Error(`No se pudo cargar el inventario: ${error.message}`);
  return data ?? [];
}

export async function getStockMovements(): Promise<StockMovementRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stock_movements").select("*").order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar los movimientos: ${error.message}`);
  return data ?? [];
}