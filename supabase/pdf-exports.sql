-- Anonymous PDF-export counter (weekly activation metric).
-- One row per completed export: platform + UI language only — no user id,
-- no child data. Write-only for clients (no SELECT policy).
-- Applied to the hosted project on 2026-07-22. Idempotent — safe to re-run.

create table if not exists public.pdf_exports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  platform text,
  lang text
);

alter table public.pdf_exports enable row level security;

drop policy if exists "pdf_exports_insert" on public.pdf_exports;
create policy "pdf_exports_insert" on public.pdf_exports
  for insert to anon, authenticated with check (true);

-- Weekly scoreboard query:
--   select date_trunc('week', created_at) as week, count(*)
--   from public.pdf_exports group by 1 order by 1 desc;
