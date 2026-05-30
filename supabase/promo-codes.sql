-- Promo code redemption for tester / launch Premium grants.
-- Run this once in the Supabase SQL editor (same as partner-sharing.sql).
--
-- Model: ONE shared code, server-enforced cap. The first N devices to
-- redeem the valid code get Premium; after the cap is reached, redemption
-- fails with 'exhausted'. Re-redeeming on the same device is idempotent
-- (returns ok without consuming another slot).
--
-- To change the code or cap, edit v_valid_code / v_cap below and re-run
-- the CREATE OR REPLACE FUNCTION block.

create table if not exists public.promo_redemptions (
  id         uuid primary key default gen_random_uuid(),
  code       text not null,
  device_id  text,
  created_at timestamptz not null default now()
);

-- Lock the table down. anon never touches it directly — only through the
-- security-definer function below, which runs with elevated rights.
alter table public.promo_redemptions enable row level security;

create or replace function public.redeem_promo(p_code text, p_device_id text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valid_code constant text := 'KARTOCHKA2026';  -- the shared tester code
  v_cap        constant int  := 100;               -- max redemptions
  v_count int;
begin
  if lower(trim(p_code)) <> lower(v_valid_code) then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  -- Idempotent: a device that already redeemed stays granted, no new slot used.
  if p_device_id is not null and exists (
    select 1 from promo_redemptions where device_id = p_device_id
  ) then
    return jsonb_build_object('ok', true, 'reason', 'already');
  end if;

  select count(*) into v_count from promo_redemptions where code = v_valid_code;
  if v_count >= v_cap then
    return jsonb_build_object('ok', false, 'reason', 'exhausted');
  end if;

  insert into promo_redemptions (code, device_id) values (v_valid_code, p_device_id);
  return jsonb_build_object('ok', true, 'reason', 'granted');
end;
$$;

-- Let the public (anon) app call the function, but nothing else.
grant execute on function public.redeem_promo(text, text) to anon;

-- Handy: how many slots are left?
--   select 100 - count(*) from public.promo_redemptions where code = 'KARTOCHKA2026';
