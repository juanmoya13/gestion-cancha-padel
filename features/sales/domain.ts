import type { Product } from "@/types/database";
import type { SaleItemInput } from "./types";

export function calculateSaleTotal(items: SaleItemInput[], products: Product[]): number {
  return items.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return total + (product?.sale_price ?? 0) * item.quantity;
  }, 0);
}

export function getSaleProductLabel(product: Pick<Product, "name" | "is_court_rental">): string {
  return product.is_court_rental ? `${product.name} (alquiler)` : product.name;
}
