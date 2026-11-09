/**
 * Agent 开关的判定规则是「默认开启，显式关闭」。
 *
 * 原因：Vite 会在构建时把 import.meta.env.VITE_AGENT_ENABLED 静态替换成字面量，
 * 而 .env 不入库（.gitignore 里被忽略），线上构建（Vercel / Netlify 从 GitHub 拉代码）
 * 拿不到本地 .env，变量就是 undefined。若按 "=== 'true'" 判定，线上助手会直接消失，
 * 所以这里只认显式的 'false'。
 *
 * 想做灰度时：在平台环境变量里配 VITE_AGENT_ENABLED=false 再重新部署即可关闭。
 */
const rawAgentFlag = import.meta.env.VITE_AGENT_ENABLED;

export const AGENT_ENABLED = rawAgentFlag !== 'false';

/** 面板标题与系统提示共用的一行能力说明 */
export const AGENT_SCOPE_LABEL = '秋招投递助手';

export function shouldMountAgentPanel(): boolean {
  return AGENT_ENABLED;
}
