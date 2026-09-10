export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "CUENTA_CORRIENTE";
export type SaleStatus = "COMPLETADO" | "CANCELADO";
export type StockMovementType = "COMPRA" | "VENTA" | "AJUSTE_MANUAL" | "CANCELACION_VENTA";
export type AccountMovementType = "CARGO_VENTA" | "PAGO" | "AJUSTE_MANUAL" | "CANCELACION_VENTA";

export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: ProductInsert; Update: Partial<ProductInsert> };
      players: { Row: Player; Insert: PlayerInsert; Update: Partial<PlayerInsert> };
      player_phones: { Row: PlayerPhone; Insert: PlayerPhoneInsert; Update: Partial<PlayerPhoneInsert> };
      purchases: { Row: Purchase; Insert: PurchaseInsert; Update: Partial<PurchaseInsert> };
      purchase_items: { Row: PurchaseItem; Insert: PurchaseItemInsert; Update: Partial<PurchaseItemInsert> };
      sales: { Row: Sale; Insert: SaleInsert; Update: Partial<SaleInsert> };
      sale_items: { Row: SaleItem; Insert: SaleItemInsert; Update: Partial<SaleItemInsert> };
      stock_movements: { Row: StockMovement; Insert: StockMovementInsert; Update: Partial<StockMovementInsert> };
      account_movements: { Row: AccountMovement; Insert: AccountMovementInsert; Update: Partial<AccountMovementInsert> };
    };
    Views: Record<string, never>;
    Functions: {
      adjust_product_stock: {
        Args: { p_product_id: string; p_quantity_change: number; p_reason?: string | null };
        Returns: { product_id: string; stock_after: number }[];
      };
      record_purchase: {
        Args: { p_date: string | null; p_notes: string | null; p_items: unknown };
        Returns: Purchase;
      };
      create_player: {
        Args: { p_first_name: string; p_last_name: string; p_gender: string | null; p_skill_level: number | null; p_phones: unknown };
        Returns: Player;
      };
      update_player: {
        Args: { p_player_id: string; p_first_name: string; p_last_name: string; p_gender: string | null; p_skill_level: number | null; p_phones: unknown };
        Returns: Player;
      };
      delete_player: {
        Args: { p_player_id: string };
        Returns: undefined;
      };
      record_account_payment: {
        Args: { p_player_id: string; p_amount: number; p_notes?: string | null };
        Returns: AccountMovement;
      };
      adjust_account_balance: {
        Args: { p_player_id: string; p_amount_change: number; p_reason?: string | null };
        Returns: AccountMovement;
      };
      record_sale: {
        Args: { p_date: string | null; p_responsible_player_id: string | null; p_payment_method: string; p_notes: string | null; p_items: unknown };
        Returns: Sale;
      };
      cancel_sale: {
        Args: { p_sale_id: string; p_reason?: string | null };
        Returns: undefined;
      };
    };
    Enums: {
      payment_method_enum: PaymentMethod;
      sale_status_enum: SaleStatus;
      stock_movement_type_enum: StockMovementType;
      account_movement_type_enum: AccountMovementType;
    };
    CompositeTypes: Record<string, never>;
  };
}

interface Timestamps { created_at: string; updated_at: string; }
export interface Product extends Timestamps { id: string; name: string; sale_price: number; unit_of_measure: string; is_court_rental: boolean; current_stock: number; is_active: boolean; }
export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at"> & Partial<Pick<Product, "id" | "created_at" | "updated_at">>;
export interface Player extends Timestamps { id: string; first_name: string; last_name: string; gender: string | null; skill_level: number | null; current_balance: number; is_active: boolean; }
export type PlayerInsert = Omit<Player, "id" | "created_at" | "updated_at"> & Partial<Pick<Player, "id" | "created_at" | "updated_at">>;
export interface PlayerPhone { id: string; player_id: string; phone_number: string; created_at: string; }
export type PlayerPhoneInsert = Omit<PlayerPhone, "id" | "created_at"> & Partial<Pick<PlayerPhone, "id" | "created_at">>;
export interface Purchase { id: string; date: string; total_amount: number; notes: string | null; created_at: string; }
export type PurchaseInsert = Omit<Purchase, "id" | "created_at"> & Partial<Pick<Purchase, "id" | "created_at">>;
export interface PurchaseItem { id: string; purchase_id: string; product_id: string; quantity: number; unit_purchase_price: number; subtotal: number; }
export type PurchaseItemInsert = PurchaseItem;
export interface Sale { id: string; date: string; responsible_player_id: string | null; payment_method: PaymentMethod; total_amount: number; status: SaleStatus; notes: string | null; created_at: string; }
export type SaleInsert = Omit<Sale, "id" | "created_at"> & Partial<Pick<Sale, "id" | "created_at">>;
export interface SaleItem { id: string; sale_id: string; product_id: string; quantity: number; unit_price: number; subtotal: number; }
export type SaleItemInsert = SaleItem;
export interface StockMovement { id: string; product_id: string; movement_type: StockMovementType; quantity_change: number; stock_after: number; reason: string | null; reference_id: string | null; created_at: string; }
export type StockMovementInsert = Omit<StockMovement, "id" | "created_at"> & Partial<Pick<StockMovement, "id" | "created_at">>;
export interface AccountMovement { id: string; player_id: string; movement_type: AccountMovementType; amount_change: number; balance_after: number; reason: string | null; sale_id: string | null; created_at: string; }
export type AccountMovementInsert = Omit<AccountMovement, "id" | "created_at"> & Partial<Pick<AccountMovement, "id" | "created_at">>;