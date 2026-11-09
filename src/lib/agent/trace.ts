import { supabase } from '@/lib/supabase/client';

export interface AgentTraceStep {
  step: number;
  tool?: string;
  args?: string;
  summary?: string;
  isError?: boolean;
}

export interface AgentTracePayload {
  turnId: string;
  steps: AgentTraceStep[];
  toolNames: string[];
  latencyMs: number;
  tokens?: number;
}

/**
 * 轨迹只写不读：失败一律静默，不能因为埋点把对话打断。
 */
export async function recordAgentTrace(payload: AgentTracePayload): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('agent_traces').insert({
      user_id: user.id,
      turn_id: payload.turnId,
      steps: payload.steps,
      tool_names: payload.toolNames,
      latency_ms: payload.latencyMs,
      tokens: payload.tokens ?? null,
    });

    if (error) {
      console.debug('[agent-trace] insert failed:', error.message);
    }
  } catch (error) {
    console.debug('[agent-trace] skipped:', error);
  }
}
