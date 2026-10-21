-- Learning progress & streak check-in cloud sync
-- Idempotent: safe to re-run in SQL Editor

create table if not exists public.learning_sync (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists learning_sync_updated_at_idx
  on public.learning_sync (updated_at desc);

alter table public.learning_sync enable row level security;

drop policy if exists "Users can read own learning sync" on public.learning_sync;
create policy "Users can read own learning sync"
  on public.learning_sync
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own learning sync" on public.learning_sync;
create policy "Users can insert own learning sync"
  on public.learning_sync
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own learning sync" on public.learning_sync;
create policy "Users can update own learning sync"
  on public.learning_sync
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own learning sync" on public.learning_sync;
create policy "Users can delete own learning sync"
  on public.learning_sync
  for delete
  to authenticated
  using (auth.uid() = user_id);
