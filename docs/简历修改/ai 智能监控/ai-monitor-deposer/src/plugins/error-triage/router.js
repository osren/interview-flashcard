// router.js —— 通用路由引擎（领域无关）
//
// route(url) => category key。三件事：
//   1. 归一化成 pathname（去掉 host 和 query，避免 query 里的 token/sig blob 误匹配）
//   2. 归属判别：配了 ownedPrefixes 时，pathname 不在自有前缀内 → nonCoreKey（非核心/三方）
//   3. 自有接口走有序规则表：命中靠前优先，未命中兜底 fallbackKey
//
// 规则表与归属前缀都来自 domains/<team>/rules.js，由 pipeline.js 传入。

// 完整 url 取 pathname；相对路径则去掉 query。
function toPathname(url) {
  if (!url) return '';
  try {
    return new URL(url).pathname;
  } catch {
    const q = url.indexOf('?');
    return q === -1 ? url : url.slice(0, q);
  }
}

/**
 * @param {Array}  rules   [{ pattern: string|RegExp, key }]，有序
 * @param {object} [options]
 * @param {string} [options.fallbackKey='order']      自有接口未命中时兜底
 * @param {string|string[]} [options.ownedPrefixes=[]] 自有接口路径前缀；为空则不做归属判别
 * @param {string} [options.nonCoreKey='non-core']    非自有接口归到的 key
 */
export function createRouter(rules, options = {}) {
  const {
    fallbackKey = 'order',
    ownedPrefixes = [],
    nonCoreKey = 'non-core',
  } = options;

  const owned = Array.isArray(ownedPrefixes) ? ownedPrefixes : [ownedPrefixes];
  const compiled = rules.map(({ pattern, key }) => ({
    key,
    test: pattern instanceof RegExp
      ? (p) => pattern.test(p)
      : (p) => p.includes(pattern),
  }));

  return function route(url) {
    const pathname = toPathname(url);
    if (!pathname) return fallbackKey;

    // 归属判别：配了自有前缀且一个都不匹配 → 非核心/三方接口
    if (owned.length && !owned.some((pre) => pathname.startsWith(pre))) {
      return nonCoreKey;
    }

    for (const r of compiled) {
      if (r.test(pathname)) return r.key;
    }
    return fallbackKey;
  };
}
