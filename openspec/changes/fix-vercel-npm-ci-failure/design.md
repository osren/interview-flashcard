## Context

当前项目部署在Vercel上，使用`npm ci`进行依赖安装。但Vercel构建时报错"Exit handler never called"，这是npm自身的bug，在某些环境或npm版本下会导致构建失败。需要解决这个部署问题。

## Goals / Non-Goals

**Goals:**
- 解决Vercel部署时的npm安装失败问题
- 确保部署流程稳定可靠

**Non-Goals:**
- 不修改业务代码逻辑
- 不升级依赖版本（仅解决安装问题）

## Decisions

### 方案1: 改用`npm install`替代`npm ci`
- 优点：更稳定，兼容性更好
- 缺点：可能安装的依赖版本略有差异（但可通过package-lock.json控制）

### 方案2: 在Vercel设置中修改install command
- 在Vercel项目设置中将Install Command从`npm ci`改为`npm install`
- 优点：无需修改代码仓库
- 缺点：需要手动在Vercel控制台修改

### 方案3: 添加.npmrc配置文件
- 配置npm的registry和cache设置
- 优点：提升安装稳定性
- 缺点：可能影响本地开发

**最终选择**: 方案1 + 方案3组合
- 修改vercel.json配置使用`npm install`
- 添加.npmrc优化npm配置

## Risks / Trade-offs

- [风险] npm install可能安装略有不同的依赖版本 → [缓解] 保留package-lock.json，npm install仍会参考lock文件
- [风险] .npmrc配置影响本地开发 → [缓解] 配置仅针对特定场景，本地开发通常不受影响

## Migration Plan

1. 创建.npmrc配置文件
2. 修改vercel.json中的build command（如需要）
3. 在Vercel控制台修改Install Command设置（如果vercel.json不生效）
4. 验证部署成功

## Open Questions

- 是否需要同步更新本地package.json的engines字段？