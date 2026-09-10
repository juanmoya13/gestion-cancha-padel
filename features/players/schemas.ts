import { z } from "zod";

const phoneSchema = z.string().trim().min(1, "Cada teléfono es obligatorio").max(50);

const playerFields = {
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  lastName: z.string().trim().min(1, "El apellido es obligatorio").max(100),
  phones: z.array(phoneSchema).min(1, "Agregá al menos un teléfono"),
  gender: z.string().trim().max(20).optional(),
  skillLevel: z.number().int().min(1, "El nivel mínimo es 1").max(10, "El nivel máximo es 10").optional(),
};

export const createPlayerSchema = z.object(playerFields);
export const updatePlayerSchema = createPlayerSchema.extend({ playerId: z.string().uuid("El jugador no es válido") });

export const deletePlayerSchema = z.string().uuid("El jugador no es válido");

export const recordPaymentSchema = z.object({
  playerId: z.string().uuid("El jugador no es válido"),
  amount: z.number().finite().positive("El cobro debe ser mayor a cero"),
  notes: z.string().trim().max(500).optional(),
});

export const adjustAccountBalanceSchema = z.object({
  playerId: z.string().uuid("El jugador no es válido"),
  amountChange: z.number().finite().refine((value) => value !== 0, "El ajuste no puede ser cero"),
  reason: z.string().trim().max(500).optional(),
});