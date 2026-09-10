import { z } from "zod";

const paymentMethods = ["EFECTIVO", "TRANSFERENCIA", "CUENTA_CORRIENTE"] as const;
const saleItemSchema = z.object({
  productId: z.string().uuid("El producto no es válido"),
  quantity: z.number().finite().positive("La cantidad debe ser mayor a cero"),
});

export const recordSaleSchema = z.object({
  date: z.string().datetime({ offset: true }).optional(),
  responsiblePlayerId: z.string().uuid("El jugador no es válido").optional(),
  paymentMethod: z.enum(paymentMethods),
  notes: z.string().trim().max(500).optional(),
  items: z.array(saleItemSchema).min(1, "Agregá al menos un producto"),
}).superRefine((input, context) => {
  const productIds = new Set<string>();
  input.items.forEach((item, index) => {
    if (productIds.has(item.productId)) context.addIssue({ code: "custom", message: "No repitas productos en la venta", path: ["items", index, "productId"] });
    productIds.add(item.productId);
  });
  if (input.paymentMethod === "CUENTA_CORRIENTE" && !input.responsiblePlayerId) context.addIssue({ code: "custom", message: "La cuenta corriente requiere un jugador responsable", path: ["responsiblePlayerId"] });
});

export const cancelSaleSchema = z.object({
  saleId: z.string().uuid("La venta no es válida"),
  reason: z.string().trim().max(500).optional(),
});
