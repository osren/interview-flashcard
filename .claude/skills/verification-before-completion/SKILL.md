---
name: verification-before-completion
description: 在声称任务已完成、已修复、已通过或已可交付前，强制补齐最新验证证据。适用于 OpenSpec 实现、代码评审和交付收尾。
---

# 完成前先验证

当你准备说出以下任一结论时，使用这个 skill：

- "done"
- "fixed"
- "passed"
- "ready for review"
- "ready to archive"

## 目标

用最新证据替代“我觉得已经完成”的判断。

不要信任：
- prior test results
- prior review summaries
- your memory of a previous run
- "it should work" reasoning from code reading alone

## 工作流

1. 明确这次到底在声明什么。
   例如：
   - "bug fixed"
   - "spec implemented"
   - "review comments resolved"

2. 把这个声明映射到对应的验证面。
   常见验证面包括：
   - OpenSpec change 的 `specs/`
   - `tasks.md`
   - `design.md`
   - 相关项目工程约束
   - 编译 / 测试 / lint / 运行时检查

3. 执行最新验证。
   先做最小但足够有说服力的一组检查；如果风险仍高，再扩大范围。

4. 留下证据。
   只保留关键内容：
   - command executed
   - pass/fail summary
   - relevant output snippet

5. 给出状态结论。
   - `DONE`: evidence matches the claim
   - `CONCERNS`: mostly verified, but residual risk remains
   - `BLOCKED`: verification failed
   - `NEEDS_CONTEXT`: cannot choose the right verification because requirements are unclear

## OpenSpec 对应关系

- 在 `/opsx:apply` 中：勾选 `tasks.md` 前，验证对应任务已完成
- 在变更验收中：没有直接证据，不接受“已经实现”
- 在 `/opsx:archive` 前：确认相关行为规格已满足，并记录需要的验证证据

## 约束

- 没有最新命令输出或具体代码证据，就不能宣称完成
- 不能用“看起来没问题”代替验证
- 如果无法验证，要明确说明原因，并标记 `NEEDS_CONTEXT` 或 `CONCERNS`
- 只要有一个关键检查失败，就不能算完成
