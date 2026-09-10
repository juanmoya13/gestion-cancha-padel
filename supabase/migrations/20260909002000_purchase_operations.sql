create or replace function record_purchase(
  p_date timestamptz,
  p_notes text,
  p_items jsonb
)
returns purchases
language plpgsql
security invoker
set search_path = public
as $$
declare
  purchase_record purchases%rowtype;
  item_record record;
  product_record products%rowtype;
  purchase_total numeric(12, 2) := 0;
begin
  if auth.uid() is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'PURCHASE_REQUIRES_ITEMS';
  end if;

  for item_record in
    select *
    from jsonb_to_recordset(p_items) as items(product_id uuid, quantity numeric, unit_purchase_price numeric)
  loop
    if item_record.quantity is null or item_record.quantity <= 0 then
      raise exception 'PURCHASE_QUANTITY_MUST_BE_POSITIVE';
    end if;

    if item_record.unit_purchase_price is null or item_record.unit_purchase_price < 0 then
      raise exception 'PURCHASE_PRICE_MUST_NOT_BE_NEGATIVE';
    end if;

    select * into product_record
    from products
    where id = item_record.product_id
      and is_active = true
      and is_court_rental = false
    for update;

    if not found then
      raise exception 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE';
    end if;

    purchase_total := purchase_total + (item_record.quantity * item_record.unit_purchase_price);
  end loop;

  insert into purchases (date, total_amount, notes)
  values (coalesce(p_date, now()), purchase_total, nullif(trim(p_notes), ''))
  returning * into purchase_record;

  for item_record in
    select *
    from jsonb_to_recordset(p_items) as items(product_id uuid, quantity numeric, unit_purchase_price numeric)
  loop
    insert into purchase_items (purchase_id, product_id, quantity, unit_purchase_price, subtotal)
    values (
      purchase_record.id,
      item_record.product_id,
      item_record.quantity,
      item_record.unit_purchase_price,
      item_record.quantity * item_record.unit_purchase_price
    );

    update products
    set current_stock = current_stock + item_record.quantity,
        updated_at = now()
    where id = item_record.product_id
    returning * into product_record;

    insert into stock_movements (product_id, movement_type, quantity_change, stock_after, reference_id)
    values (item_record.product_id, 'COMPRA', item_record.quantity, product_record.current_stock, purchase_record.id);
  end loop;

  return purchase_record;
end;
$$;

revoke all on function record_purchase(timestamptz, text, jsonb) from public;
grant execute on function record_purchase(timestamptz, text, jsonb) to authenticated;