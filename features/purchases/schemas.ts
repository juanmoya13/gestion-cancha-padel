import { z } from "zod";

const positiveNumber = z.number().finite().positive();
const nonNegativeNumber = z.number().finite().min(0);

export const purchaseItemSchema = z.object({
  productId: z.string().uuid("El producto no es válido"),
  quantity: positiveNumber,
  unitPurchasePrice: nonNegativeNumber,
});

export const recordPurchaseSchema = z.object({
  date: z.string().datetime({ offset: true }).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(purchaseItemSchema).min(1, "Agregá al menos un producto"),
}).superRefine((input, context) => {
  const productIds = new Set<string>();
  input.items.forEach((item, index) => {
    if (productIds.has(item.productId)) {
      context.addIssue({ code: "custom", message: "No repitas productos en la compra", path: ["items", index, "productId"] });
    }
    productIds.add(item.productId);
  });
});