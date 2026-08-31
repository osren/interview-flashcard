-- Shared campus job catalog (内置 51 岗位)
-- Idempotent: safe to re-run in SQL Editor

create table if not exists public.campus_job_catalog (
  id text primary key,
  job_data jsonb not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists campus_job_catalog_active_idx
  on public.campus_job_catalog (is_active, updated_at desc);

alter table public.campus_job_catalog enable row level security;

drop policy if exists "Campus job catalog is readable by everyone" on public.campus_job_catalog;
create policy "Campus job catalog is readable by everyone"
  on public.campus_job_catalog
  for select
  using (is_active = true);

-- Writes restricted to service role (seed via migration / admin)
