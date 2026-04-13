## ADDED Requirements

### Requirement: Vercel部署使用稳定npm安装方式
Vercel构建时SHALL使用更稳定的npm安装方式来避免"Exit handler never called"错误。

#### Scenario: 修改Vercel构建命令
- **WHEN** Vercel执行构建命令时
- **THEN** 使用`npm install`替代`npm ci`

#### Scenario: npm配置优化
- **WHEN** npm install执行时
- **THEN** 通过.npmrc配置优化registry和cache设置

### Requirement: package.json engines字段与本地环境一致
确保package.json中的engines字段与本地Node版本兼容，避免版本不匹配问题。

#### Scenario: engines字段检查
- **WHEN** 本地Node版本与engines指定版本不一致时
- **THEN** 更新engines字段为本地实际版本或移除该字段