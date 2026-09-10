import type { Product, Purchase, PurchaseItem } from "@/types/database";

export type PurchaseRecord = Purchase;
export type PurchaseItemRecord = PurchaseItem;

export interface PurchaseItemInput {
  productId: string;
  quantity: number;
  unitPurchasePrice: number;
}

export interface RecordPurchaseInput {
  date?: string;
  notes?: string;
  items: PurchaseItemInput[];
}

export interface PurchaseItemWithProduct extends PurchaseItemRecord {
  product: Pick<Product, "name" | "unit_of_measure"> | null;
}

export interface PurchaseWithItems extends PurchaseRecord {
  items: PurchaseItemWithProduct[];
}

export interface PurchaseActionResult<T> {
  data?: T;
  error?: string;
}