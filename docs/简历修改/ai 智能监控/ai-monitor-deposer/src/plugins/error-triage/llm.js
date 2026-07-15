// llm.js —— 接入公司内部大模型网关的 llm 适配器
//
// triage 通过注入这个函数调用模型；core 不关心网关细节，全部收敛在这里。
// 网关协议各家不同，下面用通用 chat messages 形态打底，三处 TODO 按你们网关改：
//   ① 鉴权头（Bearer / 自定义 header / 签名）
//   ② 请求体字段名
//   ③ 从响应里取模型文本的路径

const DEFAULTS = {
  endpoint: process.env.LLM_GATEWAY_ENDPOINT,        // 网关地址
  apiKey: process.env.LLM_GATEWAY_KEY,               // 鉴权凭证
  model: process.env.LLM_MODEL || 'gpt-4o-mini',     // 主力用便宜小模型即可
  temperature: 0,                                    // 判定要稳定，关掉随机性
  maxTokens: 256,                                    // 输出只是一小段 JSON，设小省钱省时
  timeoutMs: 10000,
};

export function createGatewayLLM(opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  if (!cfg.endpoint) throw new Error('LLM 网关 endpoint 未配置 (LLM_GATEWAY_ENDPOINT)');

  // 注入到 triage 的函数：约定 in { system, user } → out string
  return async function llm({ system, user }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
    try {
      const resp = await fetch(cfg.endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          // ① TODO: 改成网关要求的鉴权方式
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        // ② TODO: 改成网关要求的请求体结构
        body: JSON.stringify({
          model: cfg.model,
          temperature: cfg.temperature,
          max_tokens: cfg.maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!resp.ok) throw new Error(`gateway ${resp.status}`);
      const data = await resp.json();
      // ③ TODO: 改成网关响应里模型文本的实际路径
      return data?.choices?.[0]?.message?.content ?? '';
    } finally {
      clearTimeout(timer);
    }
  };
}
