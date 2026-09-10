import type { PaymentMethod, Product, Sale, SaleItem } from "@/types/database";

export type SaleRecord = Sale;
export type SaleItemRecord = SaleItem;

export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export interface RecordSaleInput {
  date?: string;
  responsiblePlayerId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: SaleItemInput[];
}

export interface SaleItemWithProduct extends SaleItemRecord {
  product: Pick<Product, "name" | "unit_of_measure" | "is_court_rental"> | null;
}

export interface SaleWithItems extends SaleRecord {
  items: SaleItemWithProduct[];
  responsiblePlayer: { first_name: string; last_name: string } | null;
}

export interface CancelSaleInput {
  saleId: string;
  reason?: string;
}

export interface ActionResult<T> {
  data?: T;
  error?: string;
}
