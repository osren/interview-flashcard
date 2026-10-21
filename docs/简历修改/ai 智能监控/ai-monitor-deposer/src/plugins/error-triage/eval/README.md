# eval —— prompt 判定质量评测 / 调优闭环

把"人肉调 prompt"变成**可度量、可回归**的闭环：拉真实异常 → 去重成 case → 标 gold → 跑判定 → 打分 → 错误分析 → 改 prompt → 数据集冻结重跑。

```
datasets/<domain>.jsonl   考卷 + 标准答案（每行一个 case，含 alarm 与 gold）
outputs/<domain>.jsonl    run.js 产物（模型判定结果，按 case_id 与 gold join）
reports/vN.md             score.js 产物（指标快照，版本对比 = 回归测试）
run.js                    读 dataset → 逐条 triage（真实模型，不派发）→ outputs
score.js                  outputs vs gold → 指标 + 失败清单（漏报优先）
```

## dataset 一行的 schema

```json
{
  "case_id": "transferLeftTicket-errcode1",
  "count": 37,
  "split": "train",
  "alarm": { "url": "/esapp/railway/train/transferLeftTicket", "env": "prod", "level": "error", "errorCode": "1", "errorMsg": "参数错误" },
  "gold":  { "should_report": true, "severity": "P1", "error_type": "param_validate_failed" }
}
```

- `alarm`：喂给判定链路的入参，字段同服务入参契约（唯一必填 `url`）。
- `gold`：标准答案；标注阶段可先留空，`score.js` 只评有 gold 的 case。
- `split`：`train`（调 prompt 时看）/ `holdout`（约 20%，只用来验证是否过拟合，调优期间别看）。
- `count`：同指纹频次，用于验证"高频升级"。

## 用法

**一次性准备**：MCP 拉某 url 全部异常 → 归一成 `alarm` → 按指纹去重成几十个 unique case → 写进 `datasets/<domain>.jsonl`（gold 先空）→ 自举标 gold（模型出草标、人工纠正）→ 打 `split`。

**每轮迭代**：
```bash
# 1. 跑判定（接生产模型，只判定不派发）
DOMAIN=train LLM_GATEWAY_ENDPOINT=... LLM_GATEWAY_KEY=... \
  node src/plugins/error-triage/eval/run.js

# 2. 打分，出报告
DOMAIN=train node src/plugins/error-triage/eval/score.js > src/plugins/error-triage/eval/reports/v1.md

# 3. 看失败清单 → 归因到具体 prompt 规则 → 改 _base.md / <category>.md（版本进 git）
# 4. 数据集不动，回到第 1 步重跑，对比新旧报告
```

## 纪律

- **漏报优先**：先把 FN 压到 0/接近 0，再降误报。别为降噪把 recall 做掉。
- **数据集冻结**：一轮调优期间 dataset 不动，否则指标不可比。加样本 → 开新版本重建基线。
- **train 调、holdout 验**：train 一直涨而 holdout 不涨/下跌 = 过拟合，回退。
- **最终数字用生产模型**：`run.js` 接 DCC 网关；更强模型只用于标 gold 草稿和错误分析，不进 `run.js`。
- **正负样本平衡**：真实异常里 business_reject 占多数，gold 要保留足够"真故障"正样本，否则"一律不报"也能刷高准确率——这正是 FN 要单独盯的原因。
