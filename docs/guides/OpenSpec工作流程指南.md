# OpenSpec 工作流程指南

InterviewFlash 使用 OpenSpec 管理新功能和重要行为变更。新变更统一存放在根目录 `openspec/changes/`；`docs/specs/` 仅保留旧流程的历史材料。

## 什么时候写变更规格

适用于新功能、跨模块变更、数据或接口变更，以及会影响用户可观察行为的修复。小型文案调整、纯重构和不改变行为的工具维护可直接实施；不要为了满足格式而编造行为规格。

## Claude Code 工作流

本仓库当前提供 `/opsx:explore`、`/opsx:propose`、`/opsx:apply` 和 `/opsx:archive`：

1. 需求或方案尚不清楚时，先用 `/opsx:explore` 收敛问题和选项。
2. 用 `/opsx:propose <change-name>` 创建变更及其实现所需 artifacts。默认 `spec-driven` 变更通常包含 `proposal.md`、`specs/<capability>/spec.md`、`design.md` 和 `tasks.md`。
3. 审阅并修订规格和设计。规格写可观察行为及验收场景；设计写实现方案；任务清单写可追踪的实施步骤。纯重构、文档或工具类变更可在变更元数据中显式跳过行为规格。
4. 用 `/opsx:apply <change-name>` 按任务实施；实现发现需求或设计有误时，先更新相应 artifact，再继续。
5. 对照行为规格验收实现，运行适用的构建、lint 和功能验证。CLI 可用时运行 `openspec validate <change-name>`。
6. 用 `/opsx:archive <change-name>` 归档完成的变更；归档会将行为规格增量同步到 `openspec/specs/`，形成当前能力规格。

需求模糊度和风险决定流程深度：不确定的设计多探索和澄清，高风险变更应在编码前仔细审阅规格和方案；简单改动无需人为增加审批轮次。

## 目录结构

```text
openspec/
├── config.yaml                 # schema 和项目上下文
├── specs/                      # 当前能力规格
└── changes/
    ├── <change-name>/          # 进行中的变更
    │   ├── proposal.md
    │   ├── design.md
    │   ├── tasks.md
    │   └── specs/<capability>/spec.md  # 行为变化时
    └── archive/                # 已完成变更历史
```

## CLI 常用命令

```bash
openspec list                    # 查看进行中的变更
openspec status --change <name>  # 查看 artifact 状态
openspec validate <name>         # 校验单个变更
openspec validate --all          # 校验所有变更和能力规格
openspec show <name>             # 查看变更
```

OpenSpec CLI 必须已安装并可在终端访问；Claude Code 的 slash command 文件本身不等于 CLI 已安装。升级 CLI 后，在仓库根目录运行 `openspec update` 以刷新本项目生成的 agent 指令。最新安装步骤和 CLI 行为见 [OpenSpec 官方文档](https://openspec.dev/docs/setup) 与 [CLI 参考](https://openspec.dev/docs/cli)。
