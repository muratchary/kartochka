-- ─────────────────────────────────────────────────────────────────────────────
-- Kartochka — Supabase schema
-- Run this once in the Supabase SQL Editor for your project.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Children ─────────────────────────────────────────────────────────────────
create table if not exists public.children (
  id                 text        primary key,
  user_id            uuid        not null references auth.users(id) on delete cascade,
  name               text        not null,
  date_of_birth      date        not null,
  sex                text        not null check (sex in ('male','female','unspecified')),
  country_code       text        not null,
  photo_uri          text,
  blood_type         text,
  allergy_notes      text,
  medication_notes   text,
  emergency_contact  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Vaccination records ───────────────────────────────────────────────────────
create table if not exists public.vaccination_records (
  id              text        primary key,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  child_id        text        not null references public.children(id) on delete cascade,
  vaccine_code    text        not null,
  dose_index      integer     not null,
  given_on        date        not null,
  location        text,
  batch           text,
  notes           text,
  photo_uri       text,
  reactions       jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Growth records ───────────────────────────────────────────────────────────
create table if not exists public.growth_records (
  id              text        primary key,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  child_id        text        not null references public.children(id) on delete cascade,
  measured_on     date        not null,
  weight_kg       numeric(5,3),
  height_cm       numeric(5,1),
  head_cm         numeric(5,1),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Milestone records ─────────────────────────────────────────────────────────
create table if not exists public.milestone_records (
  id               text        primary key,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  child_id         text        not null references public.children(id) on delete cascade,
  milestone_code   text        not null,
  achieved_on      date        not null,
  photo_uri        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Doctor visits ─────────────────────────────────────────────────────────────
create table if not exists public.doctor_visits (
  id           text        primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  child_id     text        not null references public.children(id) on delete cascade,
  visited_on   date        not null,
  doctor       text,
  clinic       text,
  reason       text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security — each user only sees their own data
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.children          enable row level security;
alter table public.vaccination_records enable row level security;
alter table public.growth_records    enable row level security;
alter table public.milestone_records enable row level security;
alter table public.doctor_visits     enable row level security;

-- Children
create policy "children: own rows" on public.children
  using (user_id = auth.uid());
create policy "children: insert own" on public.children for insert
  with check (user_id = auth.uid());
create policy "children: update own" on public.children for update
  using (user_id = auth.uid());
create policy "children: delete own" on public.children for delete
  using (user_id = auth.uid());

-- Vaccination records
create policy "vaccines: own rows" on public.vaccination_records
  using (user_id = auth.uid());
create policy "vaccines: insert own" on public.vaccination_records for insert
  with check (user_id = auth.uid());
create policy "vaccines: update own" on public.vaccination_records for update
  using (user_id = auth.uid());
create policy "vaccines: delete own" on public.vaccination_records for delete
  using (user_id = auth.uid());

-- Growth records
create policy "growth: own rows" on public.growth_records
  using (user_id = auth.uid());
create policy "growth: insert own" on public.growth_records for insert
  with check (user_id = auth.uid());
create policy "growth: update own" on public.growth_records for update
  using (user_id = auth.uid());
create policy "growth: delete own" on public.growth_records for delete
  using (user_id = auth.uid());

-- Milestones
create policy "milestones: own rows" on public.milestone_records
  using (user_id = auth.uid());
create policy "milestones: insert own" on public.milestone_records for insert
  with check (user_id = auth.uid());
create policy "milestones: update own" on public.milestone_records for update
  using (user_id = auth.uid());
create policy "milestones: delete own" on public.milestone_records for delete
  using (user_id = auth.uid());

-- Doctor visits
create policy "visits: own rows" on public.doctor_visits
  using (user_id = auth.uid());
create policy "visits: insert own" on public.doctor_visits for insert
  with check (user_id = auth.uid());
create policy "visits: update own" on public.doctor_visits for update
  using (user_id = auth.uid());
create policy "visits: delete own" on public.doctor_visits for delete
  using (user_id = auth.uid());
