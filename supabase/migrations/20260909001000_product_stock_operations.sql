create or replace function adjust_product_stock(
  p_product_id uuid,
  p_quantity_change numeric,
  p_reason text default null
)
returns table (product_id uuid, stock_after numeric)
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_product products%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  if p_quantity_change = 0 then
    raise exception 'QUANTITY_CHANGE_MUST_NOT_BE_ZERO';
  end if;

  update products
  set current_stock = current_stock + p_quantity_change,
      updated_at = now()
  where id = p_product_id
    and is_active = true
    and is_court_rental = false
  returning * into updated_product;

  if not found then
    raise exception 'PRODUCT_NOT_AVAILABLE_FOR_STOCK';
  end if;

  insert into stock_movements (product_id, movement_type, quantity_change, stock_after, reason)
  values (p_product_id, 'AJUSTE_MANUAL', p_quantity_change, updated_product.current_stock, nullif(trim(p_reason), ''));

  return query select updated_product.id, updated_product.current_stock;
end;
$$;

revoke all on function adjust_product_stock(uuid, numeric, text) from public;
grant execute on function adjust_product_stock(uuid, numeric, text) to authenticated;