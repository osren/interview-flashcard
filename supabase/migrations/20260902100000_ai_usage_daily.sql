-- Per-user daily AI call quota tracking
create table if not exists public.ai_usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default (timezone('Asia/Shanghai', now()))::date,
  call_count integer not null default 0 check (call_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.ai_usage_daily enable row level security;

create policy "Users can read own ai usage"
  on public.ai_usage_daily
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.get_ai_quota(p_user_id uuid, p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date := (timezone('Asia/Shanghai', now()))::date;
  v_count integer := 0;
begin
  select coalesce(call_count, 0)
  into v_count
  from public.ai_usage_daily
  where user_id = p_user_id and usage_date = v_date;

  v_count := coalesce(v_count, 0);

  return jsonb_build_object(
    'used', v_count,
    'limit', p_limit,
    'remaining', greatest(p_limit - v_count, 0)
  );
end;
$$;

create or replace function public.try_consume_ai_quota(p_user_id uuid, p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date := (timezone('Asia/Shanghai', now()))::date;
  v_count integer := 0;
begin
  insert into public.ai_usage_daily (user_id, usage_date, call_count)
  values (p_user_id, v_date, 0)
  on conflict (user_id, usage_date) do nothing;

  select call_count
  into v_count
  from public.ai_usage_daily
  where user_id = p_user_id and usage_date = v_date
  for update;

  if v_count >= p_limit then
    return jsonb_build_object(
      'ok', false,
      'used', v_count,
      'limit', p_limit,
      'remaining', 0
    );
  end if;

  update public.ai_usage_daily
  set call_count = call_count + 1
  where user_id = p_user_id and usage_date = v_date
  returning call_count into v_count;

  return jsonb_build_object(
    'ok', true,
    'used', v_count,
    'limit', p_limit,
    'remaining', greatest(p_limit - v_count, 0)
  );
end;
$$;

revoke all on function public.get_ai_quota(uuid, integer) from public;
revoke all on function public.try_consume_ai_quota(uuid, integer) from public;
grant execute on function public.get_ai_quota(uuid, integer) to service_role;
grant execute on function public.try_consume_ai_quota(uuid, integer) to service_role;
