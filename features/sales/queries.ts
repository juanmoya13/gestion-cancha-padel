import { createClient } from "@/lib/supabase/server";
import type { SaleWithItems } from "./types";

type SaleItemQuery = {
  id: string; sale_id: string; product_id: string; quantity: number; unit_price: number; subtotal: number;
  products: { name: string; unit_of_measure: string; is_court_rental: boolean } | null;
};

type SaleQuery = {
  id: string; date: string; responsible_player_id: string | null; payment_method: SaleWithItems["payment_method"];
  total_amount: number; status: SaleWithItems["status"]; notes: string | null; created_at: string;
  sale_items: SaleItemQuery[]; players: { first_name: string; last_name: string } | null;
};

export async function getSales(): Promise<SaleWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sales").select("*, sale_items(*, products(name, unit_of_measure, is_court_rental)), players(first_name, last_name)").order("date", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las ventas: ${error.message}`);
  return ((data ?? []) as unknown as SaleQuery[]).map((sale) => ({
    id: sale.id, date: sale.date, responsible_player_id: sale.responsible_player_id, payment_method: sale.payment_method,
    total_amount: sale.total_amount, status: sale.status, notes: sale.notes, created_at: sale.created_at,
    responsiblePlayer: sale.players,
    items: (sale.sale_items ?? []).map((item) => ({ ...item, product: item.products })),
  }));
}
