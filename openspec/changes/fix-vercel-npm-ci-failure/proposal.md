## Why

Vercel部署时执行`npm ci`失败，报错"Exit handler never called"。这是npm自身的bug，在某些环境/版本下会导致构建失败。需要改用更稳定的安装方式来解决部署问题。

## What Changes

- 将Vercel构建命令从`npm ci`改为`npm install`
- 添加`.npmrc`配置文件设置合适的registry和cache配置
- 确保package.json中的engines字段与本地一致

## Capabilities

### New Capabilities
- vercel-deploy-fix: 修复Vercel部署时的npm安装问题

### Modified Capabilities
- (无)

## Impact

- 修改文件: `package.json` (可选，清理engines字段)
- 新增文件: `.npmrc`
- 配置变更: Vercel项目设置中的install command