import type { Product, StockMovement } from "@/types/database";

export type ProductRecord = Product;
export type StockMovementRecord = StockMovement;

export interface CreateProductInput {
  name: string;
  salePrice: number;
  unitOfMeasure: string;
  isCourtRental: boolean;
  initialStock?: number;
}

export interface UpdateProductInput extends CreateProductInput {
  productId: string;
}

export interface AdjustStockInput {
  productId: string;
  quantityChange: number;
  reason?: string;
}

export interface ActionResult<T> {
  data?: T;
  error?: string;
}