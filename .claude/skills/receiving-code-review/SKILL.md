---
name: receiving-code-review
description: 用有纪律的分流、接受决策、定向修复和重新验证来处理评审反馈。适用于 OpenSpec 验收或人工评审返回 finding / 问题的场景。
---

# 处理代码评审反馈

当以下来源返回 finding 后，使用这个 skill：

- OpenSpec change verification
- code review
- human review
- another agent's review pass

## 目标

把 finding 转成明确决策和经过验证的后续动作，而不是模糊地说一句“已处理”。

## 工作流

1. 标准化 finding。
   对每一项记录：
   - source
   - severity
   - file/area
   - claimed issue

2. 给每项 finding 分类。
   - accept
   - reject with reason
   - defer with reason
   - needs clarification

3. 把已接受的 finding 映射到工件。
   判断以下哪些需要更新：
   - code
   - `design.md`
   - `spec.md`
   - `verification.md`
   - `tasks.md`

4. 一次修一批有内聚性的内容。
   保持每轮修复范围清晰，不要把无关修改混进来。

5. 重新验证已接受的修复。
   先跑最小但足够有说服力的回归检查，必要时再扩大。

6. 带证据回复。
   对每个已接受的 finding 说明：
   - what changed
   - where it changed
   - what verification was rerun

## OpenSpec 对应关系

- 规格或设计评审反馈：根据决策更新 change 内的 `specs/` 或 `design.md`
- 实现评审 finding：修正代码及相应的 `tasks.md` / 验证证据
- 归档前核验发现的问题：确认实现与行为规格一致，再完成修复和验证

## 约束

- 没有决策记录时，不要悄悄吸收 review 反馈
- 没有具体修改或明确拒绝时，不要说“已解决”
- 如果 finding 暴露的是 spec / design 问题，就更新文档工件，不要盲目补代码
