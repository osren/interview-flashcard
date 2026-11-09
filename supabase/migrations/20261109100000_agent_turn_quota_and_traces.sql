-- Agent 轮次幂等计费 + 只写入的 Agent 轨迹表

-- 1) 同一条用户消息（turn_id）只扣一次额度 -------------------------------------
create table if not exists public.ai_usage_turns (
  user_id uuid not null references auth.users (id) on delete cascade,
  turn_id text not null,
  usage_date date not null default (timezone('Asia/Shanghai', now()))::date,
  created_at timestamptz not null default now(),
  primary key (user_id, turn_id)
);

create index if not exists ai_usage_turns_date_idx
  on public.ai_usage_turns (user_id, usage_date);

alter table public.ai_usage_turns enable row level security;
-- 仅 service_role 读写，不给 authenticated 任何策略

-- 2) 消费额度支持 turn_id 幂等 ------------------------------------------------
-- 旧的 2 参数签名先删掉，避免与新签名同时存在导致重载歧义
drop function if exists public.try_consume_ai_quota(uuid, integer);

create or replace function public.try_consume_ai_quota(
  p_user_id uuid,
  p_limit integer default 50,
  p_turn_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date := (timezone('Asia/Shanghai', now()))::date;
  v_count integer := 0;
  v_inserted integer := 0;
  v_turn text := nullif(btrim(coalesce(p_turn_id, '')), '');
begin
  insert into public.ai_usage_daily (user_id, usage_date, call_count)
  values (p_user_id, v_date, 0)
  on conflict (user_id, usage_date) do nothing;

  select call_count
  into v_count
  from public.ai_usage_daily
  where user_id = p_user_id and usage_date = v_date
  for update;

  -- 带 turn_id：先尝试登记本轮，登记失败说明这一轮已经计过费
  if v_turn is not null then
    insert into public.ai_usage_turns (user_id, turn_id, usage_date)
    values (p_user_id, v_turn, v_date)
    on conflict (user_id, turn_id) do nothing;

    get diagnostics v_inserted = row_count;

    if v_inserted = 0 then
      return jsonb_build_object(
        'ok', true,
        'used', v_count,
        'limit', p_limit,
        'remaining', greatest(p_limit - v_count, 0),
        'deduplicated', true
      );
    end if;
  end if;

  if v_count >= p_limit then
    -- 额度已满：撤回本轮登记，避免下次重试被误判为「已计费」而放行
    if v_turn is not null then
      delete from public.ai_usage_turns
      where user_id = p_user_id and turn_id = v_turn;
    end if;

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

revoke all on function public.try_consume_ai_quota(uuid, integer, text) from public;
grant execute on function public.try_consume_ai_quota(uuid, integer, text) to service_role;

-- 3) Agent 轨迹：只写不读 ------------------------------------------------------
create table if not exists public.agent_traces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  turn_id text not null,
  steps jsonb not null default '[]'::jsonb,
  tool_names text[] not null default '{}',
  latency_ms integer,
  tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists agent_traces_user_time_idx
  on public.agent_traces (user_id, created_at desc);

alter table public.agent_traces enable row level security;

create policy "Users can insert own agent traces"
  on public.agent_traces
  for insert
  to authenticated
  with check (auth.uid() = user_id);
