"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeInitialStock } from "@/features/products/domain";
import { adjustStockSchema, createProductSchema, updateProductSchema } from "@/features/products/schemas";
import type { ActionResult, AdjustStockInput, CreateProductInput, ProductRecord, UpdateProductInput } from "@/features/products/types";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createProductAction(input: CreateProductInput): Promise<ActionResult<ProductRecord>> {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };

  const initialStock = normalizeInitialStock(parsed.data.initialStock, parsed.data.isCourtRental);
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      sale_price: parsed.data.salePrice,
      unit_of_measure: parsed.data.unitOfMeasure,
      is_court_rental: parsed.data.isCourtRental,
      current_stock: 0,
    })
    .select()
    .single();

  if (error || !product) return { error: error?.message ?? "No se pudo crear el producto" };

  if (initialStock > 0) {
    const { error: stockError } = await supabase.rpc("adjust_product_stock", {
      p_product_id: product.id,
      p_quantity_change: initialStock,
      p_reason: "Stock inicial",
    });
    if (stockError) return { error: stockError.message };
  }

  revalidatePath("/productos");
  revalidatePath("/stock");
  return { data: { ...product, current_stock: initialStock } };
}

export async function updateProductAction(input: UpdateProductInput): Promise<ActionResult<ProductRecord>> {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };

  const { data, error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      sale_price: parsed.data.salePrice,
      unit_of_measure: parsed.data.unitOfMeasure,
      is_court_rental: parsed.data.isCourtRental,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.productId)
    .eq("is_active", true)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "No se pudo actualizar el producto" };
  revalidatePath("/productos");
  revalidatePath("/stock");
  return { data };
}

export async function deleteProductAction(productId: string): Promise<ActionResult<void>> {
  const parsed = updateProductSchema.shape.productId.safeParse(productId);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "El producto no es válido" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };

  const { error } = await supabase.from("products").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", parsed.data).eq("is_active", true);
  if (error) return { error: error.message };
  revalidatePath("/productos");
  revalidatePath("/stock");
  return {};
}

export async function adjustStockAction(input: AdjustStockInput): Promise<ActionResult<{ productId: string; stockAfter: number }>> {
  const parsed = adjustStockSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "La sesión expiró" };

  const { data, error } = await supabase.rpc("adjust_product_stock", {
    p_product_id: parsed.data.productId,
    p_quantity_change: parsed.data.quantityChange,
    p_reason: parsed.data.reason || null,
  });

  if (error || !data?.[0]) return { error: error?.message ?? "No se pudo ajustar el stock" };
  revalidatePath("/productos");
  revalidatePath("/stock");
  return { data: { productId: data[0].product_id, stockAfter: data[0].stock_after } };
}