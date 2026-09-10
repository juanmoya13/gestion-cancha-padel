import { createClient } from "@/lib/supabase/server";
import type { PurchaseWithItems } from "./types";

type PurchaseItemQuery = {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_purchase_price: number;
  subtotal: number;
  products: { name: string; unit_of_measure: string } | null;
};

export async function getPurchases(): Promise<PurchaseWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, purchase_items(*, products(name, unit_of_measure))")
    .order("date", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar las compras: ${error.message}`);

  return (data ?? []).map((purchase) => ({
    ...purchase,
    items: ((purchase.purchase_items ?? []) as PurchaseItemQuery[]).map((item) => ({
      id: item.id,
      purchase_id: item.purchase_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_purchase_price: item.unit_purchase_price,
      subtotal: item.subtotal,
      product: item.products,
    })),
  }));
}