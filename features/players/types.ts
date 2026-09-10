import type { AccountMovement, Player, PlayerPhone } from "@/types/database";

export type PlayerRecord = Player & { phones: PlayerPhone[] };
export type AccountMovementRecord = AccountMovement;

export interface PlayerInput {
  firstName: string;
  lastName: string;
  phones: string[];
  gender?: string;
  skillLevel?: number;
}

export type CreatePlayerInput = PlayerInput;

export interface UpdatePlayerInput extends PlayerInput {
  playerId: string;
}

export interface RecordPaymentInput {
  playerId: string;
  amount: number;
  notes?: string;
}

export interface AdjustAccountBalanceInput {
  playerId: string;
  amountChange: number;
  reason?: string;
}

export interface ActionResult<T> {
  data?: T;
  error?: string;
}