create or replace function create_player(
  p_first_name text,
  p_last_name text,
  p_gender text,
  p_skill_level integer,
  p_phones jsonb
)
returns players
language plpgsql
security invoker
set search_path = public
as $$
declare
  player_record players%rowtype;
  phone_record text;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_phones is null or jsonb_typeof(p_phones) <> 'array' or jsonb_array_length(p_phones) = 0 then
    raise exception 'PLAYER_REQUIRES_PHONE';
  end if;
  if p_skill_level is not null and (p_skill_level < 1 or p_skill_level > 10) then
    raise exception 'SKILL_LEVEL_OUT_OF_RANGE';
  end if;

  insert into players (first_name, last_name, gender, skill_level)
  values (trim(p_first_name), trim(p_last_name), nullif(trim(p_gender), ''), p_skill_level)
  returning * into player_record;

  for phone_record in select value from jsonb_array_elements_text(p_phones)
  loop
    if trim(phone_record) <> '' then
      insert into player_phones (player_id, phone_number) values (player_record.id, trim(phone_record));
    end if;
  end loop;

  if not exists (select 1 from player_phones where player_id = player_record.id) then
    raise exception 'PLAYER_REQUIRES_PHONE';
  end if;
  return player_record;
end;
$$;

create or replace function update_player(
  p_player_id uuid,
  p_first_name text,
  p_last_name text,
  p_gender text,
  p_skill_level integer,
  p_phones jsonb
)
returns players
language plpgsql
security invoker
set search_path = public
as $$
declare
  player_record players%rowtype;
  phone_record text;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_phones is null or jsonb_typeof(p_phones) <> 'array' or jsonb_array_length(p_phones) = 0 then
    raise exception 'PLAYER_REQUIRES_PHONE';
  end if;
  if p_skill_level is not null and (p_skill_level < 1 or p_skill_level > 10) then
    raise exception 'SKILL_LEVEL_OUT_OF_RANGE';
  end if;

  update players
  set first_name = trim(p_first_name), last_name = trim(p_last_name), gender = nullif(trim(p_gender), ''),
      skill_level = p_skill_level, updated_at = now()
  where id = p_player_id and is_active = true
  returning * into player_record;
  if not found then raise exception 'PLAYER_NOT_AVAILABLE'; end if;

  delete from player_phones where player_id = p_player_id;
  for phone_record in select value from jsonb_array_elements_text(p_phones)
  loop
    if trim(phone_record) <> '' then
      insert into player_phones (player_id, phone_number) values (p_player_id, trim(phone_record));
    end if;
  end loop;
  if not exists (select 1 from player_phones where player_id = p_player_id) then raise exception 'PLAYER_REQUIRES_PHONE'; end if;
  return player_record;
end;
$$;

create or replace function delete_player(p_player_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  update players set is_active = false, updated_at = now() where id = p_player_id and is_active = true;
  if not found then raise exception 'PLAYER_NOT_AVAILABLE'; end if;
end;
$$;

create or replace function record_account_payment(p_player_id uuid, p_amount numeric, p_notes text default null)
returns account_movements
language plpgsql
security invoker
set search_path = public
as $$
declare
  player_record players%rowtype;
  movement_record account_movements%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_amount <= 0 then raise exception 'PAYMENT_MUST_BE_POSITIVE'; end if;
  select * into player_record from players where id = p_player_id and is_active = true for update;
  if not found then raise exception 'PLAYER_NOT_AVAILABLE'; end if;

  update players set current_balance = current_balance + p_amount, updated_at = now() where id = p_player_id returning * into player_record;
  insert into account_movements (player_id, movement_type, amount_change, balance_after, reason)
  values (p_player_id, 'PAGO', p_amount, player_record.current_balance, nullif(trim(p_notes), ''))
  returning * into movement_record;
  return movement_record;
end;
$$;

create or replace function adjust_account_balance(p_player_id uuid, p_amount_change numeric, p_reason text default null)
returns account_movements
language plpgsql
security invoker
set search_path = public
as $$
declare
  player_record players%rowtype;
  movement_record account_movements%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_amount_change = 0 then raise exception 'ACCOUNT_ADJUSTMENT_MUST_NOT_BE_ZERO'; end if;
  select * into player_record from players where id = p_player_id and is_active = true for update;
  if not found then raise exception 'PLAYER_NOT_AVAILABLE'; end if;

  update players set current_balance = current_balance + p_amount_change, updated_at = now() where id = p_player_id returning * into player_record;
  insert into account_movements (player_id, movement_type, amount_change, balance_after, reason)
  values (p_player_id, 'AJUSTE_MANUAL', p_amount_change, player_record.current_balance, nullif(trim(p_reason), ''))
  returning * into movement_record;
  return movement_record;
end;
$$;

revoke all on function create_player(text, text, text, integer, jsonb) from public;
revoke all on function update_player(uuid, text, text, text, integer, jsonb) from public;
revoke all on function delete_player(uuid) from public;
revoke all on function record_account_payment(uuid, numeric, text) from public;
revoke all on function adjust_account_balance(uuid, numeric, text) from public;
grant execute on function create_player(text, text, text, integer, jsonb) to authenticated;
grant execute on function update_player(uuid, text, text, text, integer, jsonb) to authenticated;
grant execute on function delete_player(uuid) to authenticated;
grant execute on function record_account_payment(uuid, numeric, text) to authenticated;
grant execute on function adjust_account_balance(uuid, numeric, text) to authenticated;