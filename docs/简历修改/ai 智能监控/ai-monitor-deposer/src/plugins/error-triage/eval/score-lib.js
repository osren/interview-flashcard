// eval/score-lib.js —— 纯打分逻辑（无 IO），score.js(CLI) 与 server.js 的 /eval 共用
//
// 输入：cases = [{ case_id, gold, split }]，outputs = Map(case_id -> 判定结果)
// 输出：按 split 分组的指标。漏报率(FN) 为头号指标。

export const RANK = { P0: 0, P1: 1, P2: 2, P3: 3 };

// 对一个 split 的 case 列表打分
export function scoreSplit(list, outputs) {
  const m = { n: 0, fn: [], fp: [], sevExact: 0, sevOff1: 0, sevOffBig: [], typeOk: 0, missing: [] };
  for (const c of list) {
    const g = c.gold;
    const o = outputs.get(c.case_id);
    if (!o) { m.missing.push(c.case_id); continue; }
    m.n++;
    if (g.should_report && !o.should_report) m.fn.push(`${c.case_id} (gold ${g.severity})`);
    if (!g.should_report && o.should_report) m.fp.push(`${c.case_id} (判 ${o.severity})`);
    const d = Math.abs((RANK[o.severity] ?? 9) - (RANK[g.severity] ?? 9));
    if (d === 0) m.sevExact++;
    else if (d === 1) m.sevOff1++;
    else m.sevOffBig.push(`${c.case_id}: gold ${g.severity} / 判 ${o.severity}`);
    if (g.error_type && o.error_type === g.error_type) m.typeOk++;
  }
  return m;
}

// 只评有 gold 的 case，按 train/holdout 分组
export function scoreDataset(cases, outputs) {
  const graded = cases.filter((c) => c.gold && c.gold.severity);
  const bySplit = {};
  for (const split of ['train', 'holdout']) {
    const list = graded.filter((c) => (c.split || 'train') === split);
    if (list.length) bySplit[split] = scoreSplit(list, outputs);
  }
  return bySplit;
}

const pct = (a, b) => (b ? `${a}/${b} (${((a / b) * 100).toFixed(0)}%)` : '0/0');

// 把指标渲染成 markdown（CLI 用；/eval 直接回 JSON 不用它）
export function renderReportMd(domain, bySplit) {
  const out = [`# eval 报告 · DOMAIN=${domain}`, ''];
  for (const [name, m] of Object.entries(bySplit)) {
    out.push(`### ${name}（n=${m.n}）`, '');
    out.push(`- **漏报率 FN**：${pct(m.fn.length, m.n)}　←头号指标`);
    out.push(`- 误报率 FP：${pct(m.fp.length, m.n)}`);
    out.push(`- severity 完全一致：${pct(m.sevExact, m.n)}；差一级：${m.sevOff1}；差多级：${m.sevOffBig.length}`);
    out.push(`- error_type 准确：${pct(m.typeOk, m.n)}`);
    if (m.missing.length) out.push(`- ⚠️ 缺判定输出：${m.missing.join(', ')}`);
    const fails = [
      ...m.fn.map((x) => `[FN 漏报] ${x} → 判「不报」`),
      ...m.fp.map((x) => `[FP 误报] ${x}`),
      ...m.sevOffBig.map((x) => `[SEV 差多级] ${x}`),
    ];
    if (fails.length) { out.push('', '**失败清单：**'); fails.forEach((f) => out.push(`- ${f}`)); }
    out.push('');
  }
  return out.join('\n');
}
