-- Interview notes cloud persistence (面经云端持久化)
-- One complete snapshot per authenticated user; RLS keeps each snapshot private.

create table if not exists public.interview_sync (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{"companies": [], "favoriteQuestions": []}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists interview_sync_updated_at_idx
  on public.interview_sync (updated_at desc);

alter table public.interview_sync enable row level security;

drop policy if exists "Users can read own interview sync" on public.interview_sync;
create policy "Users can read own interview sync"
  on public.interview_sync for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own interview sync" on public.interview_sync;
create policy "Users can insert own interview sync"
  on public.interview_sync for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own interview sync" on public.interview_sync;
create policy "Users can update own interview sync"
  on public.interview_sync for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own interview sync" on public.interview_sync;
create policy "Users can delete own interview sync"
  on public.interview_sync for delete to authenticated
  using (auth.uid() = user_id);
