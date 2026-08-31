-- User-specific campus jobs (手动新增 / AI 解析岗位)
-- Idempotent: safe to re-run in SQL Editor

create table if not exists public.campus_user_jobs (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  job_data jsonb not null,
  source text not null default 'custom' check (source in ('custom', 'builtin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index if not exists campus_user_jobs_user_updated_idx
  on public.campus_user_jobs (user_id, updated_at desc);

alter table public.campus_user_jobs enable row level security;

drop policy if exists "Users can read own campus user jobs" on public.campus_user_jobs;
create policy "Users can read own campus user jobs"
  on public.campus_user_jobs
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own campus user jobs" on public.campus_user_jobs;
create policy "Users can insert own campus user jobs"
  on public.campus_user_jobs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own campus user jobs" on public.campus_user_jobs;
create policy "Users can update own campus user jobs"
  on public.campus_user_jobs
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own campus user jobs" on public.campus_user_jobs;
create policy "Users can delete own campus user jobs"
  on public.campus_user_jobs
  for delete
  to authenticated
  using (auth.uid() = user_id);
