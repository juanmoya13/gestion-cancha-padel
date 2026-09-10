import { z } from "zod";

const nonNegativeNumber = z.number().finite().min(0);

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  salePrice: nonNegativeNumber,
  unitOfMeasure: z.string().trim().min(1, "La unidad es obligatoria").max(50),
  isCourtRental: z.boolean(),
  initialStock: nonNegativeNumber.optional(),
});

export const updateProductSchema = createProductSchema.extend({
  productId: z.string().uuid("El producto no es válido"),
});

export const adjustStockSchema = z.object({
  productId: z.string().uuid("El producto no es válido"),
  quantityChange: z.number().finite().refine((value) => value !== 0, "El ajuste no puede ser cero"),
  reason: z.string().trim().max(500).optional(),
});