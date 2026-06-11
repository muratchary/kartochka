-- ─────────────────────────────────────────────────────────────────────────────
-- Kartochka — in-app account deletion (App Store guideline 5.1.1(v))
-- Run this once in the Supabase SQL Editor after schema.sql + partner-sharing.sql.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- delete_my_account() permanently removes the calling user. Every app table
-- (children, vaccination_records, growth_records, milestone_records,
-- doctor_visits, child_share_links, child_partners) has a foreign key to
-- auth.users(id) ON DELETE CASCADE, so deleting the auth row wipes all of the
-- user's cloud data in a single statement.
--
-- SECURITY DEFINER lets the function delete from auth.users (owned by the
-- supabase_auth_admin role) on behalf of the authenticated caller. It only
-- ever deletes auth.uid() — a user can never delete anyone but themselves.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  -- Rows the caller created as a *partner* of someone else's child are keyed
  -- by partner_user_id, not user_id, so they aren't reached by the auth.users
  -- cascade on the owner side — remove them explicitly first.
  delete from public.child_partners where partner_user_id = uid;

  -- Deleting the auth user cascades every owner-keyed row across all tables.
  delete from auth.users where id = uid;
end;
$$;

-- Only signed-in users may call it; never anon or the public role.
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
