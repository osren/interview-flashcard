/** Agent 灰度开关：默认关闭，改 .env 里 VITE_AGENT_ENABLED=true 再重启 dev/build */
export const AGENT_ENABLED = import.meta.env.VITE_AGENT_ENABLED === 'true';

/** 面板标题与系统提示共用的一行能力说明 */
export const AGENT_SCOPE_LABEL = '秋招投递助手';

export function shouldMountAgentPanel(): boolean {
  return AGENT_ENABLED;
}
