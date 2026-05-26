-- ─────────────────────────────────────────────────────────────────────────────
-- Kartochka — Partner sharing schema
-- Run this in the Supabase SQL Editor after schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Share link codes ──────────────────────────────────────────────────────────
-- Owner generates a 6-char code. Partner enters it to link their account.
create table if not exists public.child_share_links (
  code          char(6)     primary key,
  owner_user_id uuid        not null references auth.users(id) on delete cascade,
  child_id      text        not null references public.children(id) on delete cascade,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '7 days')
);

-- ── Accepted partnerships ─────────────────────────────────────────────────────
-- Once a partner accepts a code, this record grants them ongoing access.
create table if not exists public.child_partners (
  id              text        primary key,
  owner_user_id   uuid        not null references auth.users(id) on delete cascade,
  partner_user_id uuid        not null references auth.users(id) on delete cascade,
  child_id        text        not null references public.children(id) on delete cascade,
  granted_at      timestamptz not null default now(),
  unique (partner_user_id, child_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.child_share_links enable row level security;
alter table public.child_partners     enable row level security;

-- Share links: owner manages their own codes; any signed-in user can look up by code
create policy "share_links: owner insert" on public.child_share_links for insert
  with check (owner_user_id = auth.uid());
create policy "share_links: owner delete" on public.child_share_links for delete
  using (owner_user_id = auth.uid());
create policy "share_links: lookup by code" on public.child_share_links for select
  using (auth.uid() is not null);

-- Partners: owner and partner can see the record; owner can delete (revoke)
create policy "partners: owner or partner can read" on public.child_partners for select
  using (owner_user_id = auth.uid() or partner_user_id = auth.uid());
create policy "partners: any authenticated user can insert" on public.child_partners for insert
  with check (auth.uid() is not null);
create policy "partners: owner can revoke" on public.child_partners for delete
  using (owner_user_id = auth.uid());

-- ── Helper function ───────────────────────────────────────────────────────────
-- Returns true if the current user is a partner for the given child.
create or replace function public.is_partner_for_child(p_child_id text)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.child_partners
    where child_id = p_child_id
      and partner_user_id = auth.uid()
  );
$$;

-- ── Update children RLS to allow partner read/write ───────────────────────────
-- Drop the existing select policy and recreate it to include partner access.
drop policy if exists "children: own rows" on public.children;

create policy "children: own or partner rows" on public.children for select
  using (user_id = auth.uid() or is_partner_for_child(id));

create policy "children: partner update" on public.children for update
  using (user_id = auth.uid() or is_partner_for_child(id));

-- ── Update child records tables to allow partner access ───────────────────────
-- vaccination_records
drop policy if exists "vaccines: own rows" on public.vaccination_records;
create policy "vaccines: own or partner" on public.vaccination_records for select
  using (user_id = auth.uid() or is_partner_for_child(child_id));
create policy "vaccines: partner insert" on public.vaccination_records for insert
  with check (
    user_id = auth.uid() or
    exists (select 1 from public.child_partners where child_id = vaccination_records.child_id and partner_user_id = auth.uid())
  );

-- growth_records
drop policy if exists "growth: own rows" on public.growth_records;
create policy "growth: own or partner" on public.growth_records for select
  using (user_id = auth.uid() or is_partner_for_child(child_id));

-- milestone_records
drop policy if exists "milestones: own rows" on public.milestone_records;
create policy "milestones: own or partner" on public.milestone_records for select
  using (user_id = auth.uid() or is_partner_for_child(child_id));

-- doctor_visits
drop policy if exists "visits: own rows" on public.doctor_visits;
create policy "visits: own or partner" on public.doctor_visits for select
  using (user_id = auth.uid() or is_partner_for_child(child_id));
