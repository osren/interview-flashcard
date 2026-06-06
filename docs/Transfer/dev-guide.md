# dev-guide

## 1. 项目概述

## 答案

**### 1.1 项目简介

**项目名称**: fe-esflight（机票业务前端）

**项目定位**: 滴滴企业版商旅平台的机票业务小程序，支持多端运行

### 1.2 技术栈

| 类别 | 技术 | 说明 |
|-----|------|-----|
| **核心框架** | MPX | 滴滴自研小程序跨平台框架，基于 Vue 2.7 |
| **UI 框架** | Vue 2.7.14 | 仅 H5 编译使用 |
| **构建工具** | Webpack 5.82.0 | 打包构建 |
| **状态管理** | @mpxjs/store | 类 Vuex 状态管理 |
| **请求库** | @didi/mpx-fetch | 统一请求封装 |
| **路由** | @didi/es-mpx-router | 路由管理 |
| **样式预处理** | Stylus | CSS 预处理器 |
| **代码规范** | ESLint + Prettier | 代码风格检查 |

### 1.3 支持平台

| 平台 | Mode | 产物目录 | 说明 |
|-----|------|---------|-----|
| 微信小程序 | `wx` | `dist/wx/` | 主流平台 |
| 滴滴小程序 | `dd` | `dist/dd/` | 内部使用 |
| 支付宝小程序 | `ali` | `dist/ali/` | 阿里系 |
| H5 Web | `web` | `dist/web/` | 移动端 H5 |
| 其他 | `swan/qq/tt/jd` | `dist/[mode]/` | 百度/QQ/抖音/京东 |

### 1.4 核心功能模块

```
├── 首页 (home)           # 航班搜索入口
├── 航班搜索 (search)     # 航班列表筛选
├── 航班详情 (flight-detail)  # 舱位选择
├── 创单 (make-order)     # 订单填写支付
├── 订单 (order)          # 订单列表详情
├── 改签 (change-ticket)  # 改签流程
├── 退票 (refund-ticket)  # 退票流程
└── 报销 (reimburse)      # 报销相关
```**

---

## 2. 环境准备

## 答案

**### 2.1 环境要求

```bash
# Node.js 版本
node -v   # >= 16.0.0 (推荐 v18 LTS)

# npm 版本
npm -v    # >= 8.0.0

# 查看当前环境
node -v && npm -v
```

### 2.2 开发工具安装

#### 推荐 IDE
- **VSCode** - 推荐编辑器
  - 安装扩展: `Volar`, `ESLint`, `Prettier`, `Stylus`

#### 小程序开发者工具
| 平台 | 下载地址 | 配置项目路径 |
|-----|---------|-------------|
| 微信开发者工具 | https://developers.weixin.qq.com/miniprogram/dev/ | `dist/wx` |
| 滴滴开发者工具 | 内部渠道 | `dist/dd` |

### 2.3 环境变量（如需要）

```bash
# .env.development - 开发环境
API_BASE_URL=https://api-dev.example.com

# .env.production - 生产环境
API_BASE_URL=https://api.example.com
```**

---

## 3. 项目启动

## 答案

**### 3.1 获取代码

```bash
# 1. 克隆仓库
git clone <repository-url>

# 2. 进入项目目录
cd fe-esflight

# 3. 查看分支
git branch -a
```

### 3.2 安装依赖

```bash
# 安装项目依赖（推荐使用 npm）
npm install

# 如果遇到 ENOBUFS 错误（缓冲区溢出），先运行
npm run preinstall

# 再次尝试安装
npm install
```

### 3.3 启动开发服务器

```bash
# 微信小程序开发模式（默认）
npm run watch

# 滴滴小程序开发模式
npm run watch:diminadev

# H5 开发模式
npm run watch:web

# 同时监听多个平台
npm run watch:cross
```

### 3.4 在开发者工具中预览

1. **微信小程序**
   - 打开微信开发者工具
   - 导入项目路径: `项目根目录/dist/wx`
   - 设置 AppID（如需）

2. **滴滴小程序**
   - 打开滴滴开发者工具
   - 导入项目路径: `项目根目录/dist/dd`

3. **H5**
   - 运行 `npm run watch:web`
   - 浏览器访问: `http://localhost:8080`（默认端口）**

---

## 4. 代码结构

## 答案

**### 4.1 项目目录结构

```
fe-esflight/
├── src/                          # 源代码目录
│   ├── api/                      # API 接口定义
│   ├── components/               # 公共组件（69个）
│   ├── pages/                   # 页面文件
│   ├── store/                   # 状态管理
│   ├── plugins/                 # 插件
│   ├── mixins/                  # 全局混入
│   ├── common/                  # 公共模块
│   ├── utils/                   # 工具函数
│   ├── app.mpx                  # 应用入口
│   └── appInit.js               # 应用初始化
├── build/                       # 构建配置
├── config/                      # 配置文件
├── static/                      # 静态资源（多端适配）
└── package.json
```

### 4.2 核心文件说明

| 文件 | 作用 |
|-----|------|
| `src/app.mpx` | 应用入口，配置全局组件、全局样式、应用生命周期 |
| `src/appInit.js` | 应用初始化逻辑（签名、埋点、权限、配置） |
| `src/store/index.js` | 状态管理入口，聚合所有 store 模块 |
| `src/plugins/router.js` | 页面路由配置 |
| `src/api/` | 所有接口定义，统一管理 API 请求 |
| `config/defs.js` | 全局变量（API 代理表、环境常量等） |

### 4.3 Store 模块职责

| 模块 | 路径 | 职责 |
|-----|------|-----|
| `user` | `store/modules/user/` | 用户信息、Token |
| `travel` | `store/modules/travel/` | 出行类型、差旅单、来源 |
| `rule` | `store/modules/rule/` | 差标规则、制度配置 |
| `order` | `store/modules/order/` | 订单信息、订单列表 |
| `makeOrder` | `store/modules/makeOrder/` | 创单状态（鉴权信息、航班数据） |
| `flightList` | `store/modules/flightList/` | 航班列表、筛选条件 |
| `flightDetail` | `store/modules/flightDetail/` | 航班详情 |
| `change` | `store/modules/change/` | 改签状态 |
| `common` | `store/modules/common/` | 公共状态（来源信息、Session） |
| `system` | `store/modules/system/` | 系统信息（设备信息等） |
| `customization` | `store/modules/customization/` | 主题色、定制化 |**

---

## 5. 开发规范

## 答案

**### 5.1 Git 工作流

#### 分支命名规范

```bash
# 特性分支
feature/<功能描述>
例如: feature/order-detail-improve

# Bug 修复分支
fix/<问题描述>
例如: fix/search-page-crash
```

#### 开发流程

```bash
# 1. 从 master 创建新分支
git checkout master
git pull origin master
git checkout -b feature/xxx

# 2. 开发代码

# 3. 提交代码（使用交互式提交）
npm run commit

# 4. 推送分支
git push origin feature/xxx

# 5. 创建 Pull Request，等待 Code Review

# 6. 合并到 master
```

### 5.2 Commit 提交规范

使用 **Commitizen** 交互式提交：`npm run commit`

| 类型 | 说明 | 示例 |
|-----|------|-----|
| `feat` | 新功能 | `feat: 添加订单筛选功能` |
| `fix` | 修复 Bug | `fix: 修复搜索页面白屏问题` |
| `docs` | 文档更新 | `docs: 更新 API 文档` |
| `style` | 代码格式 | `style: 格式化代码` |
| `refactor` | 重构 | `refactor: 重构订单模块结构` |
| `test` | 测试 | `test: 添加订单测试用例` |
| `chore` | 构建/工具 | `chore: 更新依赖版本` |

### 5.3 代码风格

#### ESLint 配置 (`.eslintrc.js`)

```javascript
module.exports = {
  extends: ['standard', 'plugin:mpx/vue'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
```

#### Prettier 配置 (`.prettierrc.js`)

```javascript
module.exports = {
  semi: false,           // 不使用分号
  singleQuote: true,      // 使用单引号
  arrowParens: 'avoid',  // 箭头函数单参数不加括号
  printWidth: 120        // 行宽 120
}
```

#### 自动格式化

```bash
npm run lint:fix   # 修复代码格式
npm run format     # Prettier 格式化
```

### 5.4 命名规范

| 类型 | 规范 | 示例 |
|-----|------|-----|
| 页面目录 | kebab-case | `change-ticket` |
| 组件目录 | kebab-case | `flight-card` |
| 组件文件 | `index.mpx` | `components/cabin-card/index.mpx` |
| Mixin 文件 | `-mixin.js` | `popup-mixin.js` |
| API 文件 | kebab-case | `flight-list.js` |
| 变量/函数 | camelCase | `flightList` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT` |**

---

## 6. 开发流程

## 答案

**### 6.1 新增页面

**步骤**: 创建页面目录 → 编写页面文件 → 配置路由

```html
<!-- src/pages/new-page/index.mpx -->
<script name="json">
  module.exports = {
    usingComponents: {
      'flight-card': '@/components/flight-card/index'
    }
  }
</script>

<template>
  <view class="new-page">
    <flight-card detail="{{flightInfo}}" />
  </view>
</template>

<script>
  import { createPage } from '@didi/es-mpx-creator'

  createPage({
    data() {
      return { flightInfo: {} }
    },
    onLoad(options) {
      console.log('页面参数:', options)
    },
    methods: {
      handleClick() {
        console.log('点击事件')
      }
    }
  })
</script>
```

### 6.2 新增组件

**组件必须声明为 component**，使用 `createComponent` 创建：

```html
<script name="json">
  module.exports = {
    component: true,  // 必须声明为组件
    usingComponents: {}
  }
</script>

<script>
  import { createComponent } from '@didi/es-mpx-creator'

  createComponent({
    props: {
      title: { type: String, default: '默认标题' }
    },
    methods: {
      handleClick() {
        this.triggerEvent('click', { value: this.internalValue })
      }
    }
  })
</script>
```

### 6.3 新增 API 接口

```javascript
// src/api/my-feature.js
import mpx from '@mpxjs/core'

export const getFlightList = (params) =>
  mpx.$http.get('/flight/list', { params })

export const createOrder = (data) =>
  mpx.$http.post('/order/create', { data })
```

### 6.4 新增 Store 模块

```
src/store/modules/myModule/
├── index.js      # 模块入口
├── state.js      # 状态定义
├── mutations.js  # 同步方法
└── actions.js    # 异步方法
```

### 6.5 开发自测流程

```mermaid
flowchart TD
    A[编写代码] --> B[本地运行]
    B --> C{功能是否正常?}
    C -->|是| D[运行 lint 检查]
    C -->|否| A
    D --> E{代码格式正确?}
    E -->|是| F[切换多平台测试]
    E -->|否| F
    F --> G{各平台正常?}
    G -->|是| H[提交代码]
    G -->|否| A
```**

---

## 7. 常用命令

## 答案

**### 7.1 安装与依赖

```bash
npm install           # 安装依赖
npm run preinstall    # 修复依赖问题（如 ENOBUFS）
npm update            # 更新依赖
npm outdated          # 查看可更新依赖
```

### 7.2 开发调试

```bash
npm run watch          # 微信小程序开发模式（默认）
npm run watch:diminadev  # 滴滴小程序开发模式
npm run watch:web      # H5 开发模式
npm run watch:cross    # 多平台同时监听
npm run build          # 生产环境构建
npm run build:dev      # 开发环境构建
npm run build:cross    # 多平台构建
```

### 7.3 代码检查

```bash
npm run lint           # ESLint 检查
npm run lint:fix       # ESLint 修复
npm run lint:check     # 严格模式检查
npm run format         # Prettier 格式化
npm run test           # 单元测试
```

### 7.4 提交相关

```bash
npm run commit         # 交互式提交
npx git-cz            # 或直接使用
git status            # 查看 git 状态
git diff              # 查看修改内容
```**

---

## 8. 调试技巧

## 答案

**### 8.1 Console 调试

```javascript
console.log('debug info')
console.warn('warning message')
console.error('error message')
console.group('请求信息')
console.log('url:', url)
console.groupEnd()
```

### 8.2 小程序开发者工具调试

| 平台 | 调试工具 | 说明 |
|-----|---------|-----|
| 微信小程序 | 微信开发者工具 | Sources 面板断点调试 |
| 滴滴小程序 | 滴滴开发者工具 | Console + Sources |
| H5 | 浏览器 DevTools | Network + Elements |

### 8.3 状态调试

```javascript
// 在页面中打印 data
console.log('current data:', this.data)

// 查看 store 状态
console.log('store state:', this.$mpxStore.state)
```

### 8.4 跨平台调试注意

```javascript
// 平台判断
if (__mpx_mode__ === 'web') {
  console.log('H5 环境')
} else if (__mpx_mode__ === 'dd') {
  console.log('滴滴小程序')
} else if (__mpx_mode__ === 'wx') {
  console.log('微信小程序')
}
```**

---

## 9. 常见问题

## 答案

**### 9.1 编译错误

**ENOBUFS 错误**
```bash
# 解决方案
npm run preinstall
npm install
```

**Mpx 编译报错**
- 检查 `.mpx` 文件语法
- 确保使用正确的 `createPage` / `createComponent`
- 检查 import 路径是否正确

**样式不生效**
- 确认样式文件被正确引入
- 检查是否有 `scoped` 样式泄漏

### 9.2 运行问题

**端口被占用**
```bash
lsof -i :8080
kill -9 <PID>
```

**Node 版本不兼容**
```bash
nvm use 18
```

### 9.3 接口问题

**接口 404**
- 检查 `config/defs.js` 中的 API 代理配置
- 确认接口 URL 正确

**接口超时**
- 检查网络环境
- 确认后端服务是否正常运行

### 9.4 样式问题

**跨平台样式差异**
```stylus
if __mpx_mode__ == 'web'
  .container
    padding 20px
else
  .container
    padding 20rpx
```**

---

## 10. 附录

## 答案

**### 10.1 关键配置文件

| 配置项 | 文件路径 |
|--------|----------|
| ESLint | `.eslintrc.js` |
| Prettier | `.prettierrc.js` |
| TypeScript | `tsconfig.json` |
| Commit 规范 | `commitlint.config.js` |
| Jest 测试 | `jest.config.js` |
| Webpack 基础 | `build/webpack.base.conf.js` |
| 用户配置 | `config/user.conf.js` |
| 全局变量 | `config/defs.js` |

### 10.2 技术资料

- [MPX 官方文档](https://didi.github.io/mpx/)
- [MPX GitHub](https://github.com/didi/mpx)
- [Vue 2 文档](https://v2.vuejs.org/)
- [滴滴企业级组件库](https://github.com/didi/es-mpx-ui)**

---
