-- Fix get_ai_quota when user has no usage row for today (SELECT INTO sets NULL)
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
