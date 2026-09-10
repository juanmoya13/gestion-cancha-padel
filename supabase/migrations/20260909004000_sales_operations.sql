create or replace function record_sale(
  p_date timestamptz,
  p_responsible_player_id uuid,
  p_payment_method text,
  p_notes text,
  p_items jsonb
)
returns sales
language plpgsql
security invoker
set search_path = public
as $$
declare
  sale_record sales%rowtype;
  player_record players%rowtype;
  product_record products%rowtype;
  item_record record;
  sale_total numeric(12, 2) := 0;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'SALE_REQUIRES_ITEMS';
  end if;
  if p_payment_method not in ('EFECTIVO', 'TRANSFERENCIA', 'CUENTA_CORRIENTE') then
    raise exception 'PAYMENT_METHOD_NOT_ALLOWED';
  end if;
  if p_payment_method = 'CUENTA_CORRIENTE' and p_responsible_player_id is null then
    raise exception 'CURRENT_ACCOUNT_REQUIRES_PLAYER';
  end if;

  for item_record in
    select * from jsonb_to_recordset(p_items) as items(product_id uuid, quantity numeric)
  loop
    if item_record.quantity is null or item_record.quantity <= 0 then
      raise exception 'SALE_QUANTITY_MUST_BE_POSITIVE';
    end if;
    select * into product_record from products
    where id = item_record.product_id and is_active = true for update;
    if not found then raise exception 'PRODUCT_NOT_AVAILABLE_FOR_SALE'; end if;
    sale_total := sale_total + item_record.quantity * product_record.sale_price;
  end loop;

  if p_responsible_player_id is not null then
    select * into player_record from players
    where id = p_responsible_player_id and is_active = true for update;
    if not found then raise exception 'PLAYER_NOT_AVAILABLE_FOR_SALE'; end if;
  end if;

  insert into sales (date, responsible_player_id, payment_method, total_amount, notes)
  values (coalesce(p_date, now()), p_responsible_player_id, p_payment_method::payment_method_enum, sale_total, nullif(trim(p_notes), ''))
  returning * into sale_record;

  for item_record in
    select * from jsonb_to_recordset(p_items) as items(product_id uuid, quantity numeric)
  loop
    select * into product_record from products where id = item_record.product_id for update;
    insert into sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    values (sale_record.id, product_record.id, item_record.quantity, product_record.sale_price, item_record.quantity * product_record.sale_price);

    if not product_record.is_court_rental then
      update products set current_stock = current_stock - item_record.quantity, updated_at = now()
      where id = product_record.id returning * into product_record;
      insert into stock_movements (product_id, movement_type, quantity_change, stock_after, reference_id)
      values (product_record.id, 'VENTA', -item_record.quantity, product_record.current_stock, sale_record.id);
    end if;
  end loop;

  if p_payment_method = 'CUENTA_CORRIENTE' then
    update players set current_balance = current_balance - sale_total, updated_at = now()
    where id = player_record.id returning * into player_record;
    insert into account_movements (player_id, movement_type, amount_change, balance_after, reason, sale_id)
    values (player_record.id, 'CARGO_VENTA', -sale_total, player_record.current_balance, null, sale_record.id);
  end if;
  return sale_record;
end;
$$;

create or replace function cancel_sale(p_sale_id uuid, p_reason text default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  sale_record sales%rowtype;
  player_record players%rowtype;
  product_record products%rowtype;
  item_record record;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  select * into sale_record from sales where id = p_sale_id for update;
  if not found then raise exception 'SALE_NOT_FOUND'; end if;
  if sale_record.status = 'CANCELADO' then raise exception 'SALE_ALREADY_CANCELLED'; end if;

  update sales set status = 'CANCELADO' where id = p_sale_id;
  for item_record in select * from sale_items where sale_id = p_sale_id loop
    select * into product_record from products where id = item_record.product_id for update;
    if not product_record.is_court_rental then
      update products set current_stock = current_stock + item_record.quantity, updated_at = now()
      where id = product_record.id returning * into product_record;
      insert into stock_movements (product_id, movement_type, quantity_change, stock_after, reason, reference_id)
      values (product_record.id, 'CANCELACION_VENTA', item_record.quantity, product_record.current_stock, nullif(trim(p_reason), ''), p_sale_id);
    end if;
  end loop;

  if sale_record.payment_method = 'CUENTA_CORRIENTE' then
    select * into player_record from players where id = sale_record.responsible_player_id for update;
    if not found then raise exception 'PLAYER_NOT_FOUND_FOR_CANCELLATION'; end if;
    update players set current_balance = current_balance + sale_record.total_amount, updated_at = now()
    where id = player_record.id returning * into player_record;
    insert into account_movements (player_id, movement_type, amount_change, balance_after, reason, sale_id)
    values (player_record.id, 'CANCELACION_VENTA', sale_record.total_amount, player_record.current_balance, nullif(trim(p_reason), ''), p_sale_id);
  end if;
end;
$$;

revoke all on function record_sale(timestamptz, uuid, text, text, jsonb) from public;
revoke all on function cancel_sale(uuid, text) from public;
grant execute on function record_sale(timestamptz, uuid, text, text, jsonb) to authenticated;
grant execute on function cancel_sale(uuid, text) to authenticated;