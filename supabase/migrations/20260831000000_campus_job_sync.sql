-- Campus job application sync (投递记录云端同步)
-- Idempotent: safe to re-run in SQL Editor

create table if not exists public.campus_job_sync (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists campus_job_sync_updated_at_idx
  on public.campus_job_sync (updated_at desc);

alter table public.campus_job_sync enable row level security;

drop policy if exists "Users can read own campus job sync" on public.campus_job_sync;
create policy "Users can read own campus job sync"
  on public.campus_job_sync
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own campus job sync" on public.campus_job_sync;
create policy "Users can insert own campus job sync"
  on public.campus_job_sync
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own campus job sync" on public.campus_job_sync;
create policy "Users can update own campus job sync"
  on public.campus_job_sync
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own campus job sync" on public.campus_job_sync;
create policy "Users can delete own campus job sync"
  on public.campus_job_sync
  for delete
  to authenticated
  using (auth.uid() = user_id);
