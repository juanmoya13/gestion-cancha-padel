create extension if not exists pgcrypto;

create type payment_method_enum as enum ('EFECTIVO', 'TRANSFERENCIA', 'CUENTA_CORRIENTE', 'TARJETA_DEBITO', 'TARJETA_CREDITO');
create type sale_status_enum as enum ('COMPLETADO', 'CANCELADO');
create type stock_movement_type_enum as enum ('COMPRA', 'VENTA', 'AJUSTE_MANUAL', 'CANCELACION_VENTA');
create type account_movement_type_enum as enum ('CARGO_VENTA', 'PAGO', 'AJUSTE_MANUAL', 'CANCELACION_VENTA');

create table products (
  id uuid primary key default gen_random_uuid(), name varchar(255) not null,
  sale_price numeric(12, 2) not null check (sale_price >= 0), unit_of_measure varchar(50) not null default 'unidad',
  is_court_rental boolean not null default false, current_stock numeric(12, 2) not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table players (
  id uuid primary key default gen_random_uuid(), first_name varchar(100) not null, last_name varchar(100) not null,
  gender varchar(20), skill_level int check (skill_level between 1 and 10), current_balance numeric(12, 2) not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table player_phones (id uuid primary key default gen_random_uuid(), player_id uuid not null references players(id) on delete cascade, phone_number varchar(50) not null, created_at timestamptz not null default now());
create table purchases (id uuid primary key default gen_random_uuid(), date timestamptz not null default now(), total_amount numeric(12, 2) not null check (total_amount >= 0), notes text, created_at timestamptz not null default now());
create table purchase_items (id uuid primary key default gen_random_uuid(), purchase_id uuid not null references purchases(id) on delete cascade, product_id uuid not null references products(id), quantity numeric(12, 2) not null check (quantity > 0), unit_purchase_price numeric(12, 2) not null check (unit_purchase_price >= 0), subtotal numeric(12, 2) not null check (subtotal >= 0));
create table sales (id uuid primary key default gen_random_uuid(), date timestamptz not null default now(), responsible_player_id uuid references players(id), payment_method payment_method_enum not null, total_amount numeric(12, 2) not null check (total_amount >= 0), status sale_status_enum not null default 'COMPLETADO', notes text, created_at timestamptz not null default now());
create table sale_items (id uuid primary key default gen_random_uuid(), sale_id uuid not null references sales(id) on delete cascade, product_id uuid not null references products(id), quantity numeric(12, 2) not null check (quantity > 0), unit_price numeric(12, 2) not null check (unit_price >= 0), subtotal numeric(12, 2) not null check (subtotal >= 0));
create table stock_movements (id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id), movement_type stock_movement_type_enum not null, quantity_change numeric(12, 2) not null, stock_after numeric(12, 2) not null, reason text, reference_id uuid, created_at timestamptz not null default now());
create table account_movements (id uuid primary key default gen_random_uuid(), player_id uuid not null references players(id), movement_type account_movement_type_enum not null, amount_change numeric(12, 2) not null, balance_after numeric(12, 2) not null, reason text, sale_id uuid references sales(id), created_at timestamptz not null default now());

create index stock_movements_product_id_idx on stock_movements(product_id, created_at desc);
create index account_movements_player_id_idx on account_movements(player_id, created_at desc);
create index sales_date_idx on sales(date desc);
create index purchases_date_idx on purchases(date desc);

alter table products enable row level security;
alter table players enable row level security;
alter table player_phones enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table stock_movements enable row level security;
alter table account_movements enable row level security;

create policy "authenticated users can manage products" on products for all to authenticated using (true) with check (true);
create policy "authenticated users can manage players" on players for all to authenticated using (true) with check (true);
create policy "authenticated users can manage player phones" on player_phones for all to authenticated using (true) with check (true);
create policy "authenticated users can manage purchases" on purchases for all to authenticated using (true) with check (true);
create policy "authenticated users can manage purchase items" on purchase_items for all to authenticated using (true) with check (true);
create policy "authenticated users can manage sales" on sales for all to authenticated using (true) with check (true);
create policy "authenticated users can manage sale items" on sale_items for all to authenticated using (true) with check (true);
create policy "authenticated users can manage stock movements" on stock_movements for all to authenticated using (true) with check (true);
create policy "authenticated users can manage account movements" on account_movements for all to authenticated using (true) with check (true);