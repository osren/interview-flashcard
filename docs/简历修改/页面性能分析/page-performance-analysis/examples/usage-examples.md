# 页面性能分析 Skill - 使用示例

## 示例 1：分析酒店列表页

### 用户输入
```
请分析酒店列表页的函数执行耗时性能，重点关注搜索和筛选功能
```

### Claude 执行流程

#### 步骤 1：识别目标页面
```bash
# 查找列表页文件
find . -name "*list*" -path "*/pages/*" | grep -E "\.(mpx|vue|js|jsx|tsx)$"

# 输出
src/pages/search/list.mpx
```

#### 步骤 2：读取页面源码
```javascript
// 读取主文件
Read src/pages/search/list.mpx

// 读取相关的 mixin 文件
Read src/pages/search/mixins/list-request-mixin.js
Read src/pages/search/mixins/filter-mixin.js
Read src/pages/search/mixins/scroll-mixin.js

// 读取 store 模块
Read src/store/modules/hotel/action.js
```

#### 步骤 3：分析关键函数
- **页面加载**: `loadListData()`, `fetchFilterItems()`
- **用户交互**: `search()`, `filterChange()`, `loadMore()`
- **数据监听**: `filterParams` watch, `sortType` watch

#### 步骤 4：生成分析报告

---

## 示例 2：分析酒店详情页

### 用户输入
```
分析酒店详情页的性能，特别关注图片加载和价格数据请求
```

### Claude 执行流程

#### 步骤 1：定位详情页
```bash
find . -name "*detail*" -o -name "*hotel*" -path "*/pages/*" | grep -v node_modules
```

#### 步骤 2：分析关键功能
- 图片懒加载策略
- 价格接口请求时序
- 评论数据分页加载
- 地图组件初始化

#### 步骤 3：识别性能瓶颈
- 首屏图片过多导致加载慢
- 价格请求串行执行
- 地图组件体积大

#### 步骤 4：提供优化建议
- 图片预加载 + 懒加载组合
- 价格请求并行化
- 地图组件按需加载

---

## 示例 3：批量分析多个页面

### 用户输入
```
对酒店项目的所有主要页面进行性能分析，生成汇总报告
```

### Claude 执行流程

#### 步骤 1：扫描项目结构
```bash
# 查找所有页面
find src/pages -name "*.mpx" -o -name "*.vue" | sort
```

#### 步骤 2：逐个分析页面
1. 首页 (pages/home/index.mpx)
2. 列表页 (pages/search/list.mpx)
3. 详情页 (pages/hotel/index.mpx)
4. 订单页 (pages/order/index.mpx)
5. 表单页 (pages/form/index.mpx)

#### 步骤 3：生成汇总报告
```markdown
# 酒店项目性能分析汇总报告

## 一、整体性能概览

### 性能评分
| 页面 | 首屏时间 | 可交互时间 | 评分 |
|------|---------|-----------|------|
| 首页 | 2.5s | 4.2s | B |
| 列表页 | 1.8s | 3.5s | A |
| 详情页 | 3.2s | 5.1s | C |
| 订单页 | 1.5s | 3.0s | A |
| 表单页 | 1.2s | 2.8s | A |

### 共性问题
1. 网络请求串行执行
2. 防抖时间过长
3. 缺少请求缓存

### 优化优先级
1. 详情页（最需要优化）
2. 首页（次需要优化）
3. 列表页（适度优化）
```

---

## 示例 4：特定场景分析

### 用户输入
```
分析订单列表页的分页加载性能，滚动加载是否有性能问题
```

### Claude 执行流程

#### 步骤 1：定位滚动加载代码
```javascript
// 查找滚动相关的代码
grep -r "scroll" src/pages/order --include="*.js" --include="*.mpx"
```

#### 步骤 2：分析滚动函数
```javascript
// 发现关键函数
onScrollToBottom() {
  this.loadMore()
}

loadMore: debounce(async function() {
  this.page++
  await this.getOrderList()
}, 300)
```

#### 步骤 3：识别性能问题
- 防抖时间 300ms 可能过长
- 列表数据未虚拟化
- 滚动事件未节流

#### 步骤 4：提供优化建议
```javascript
// 优化方案
onScrollToBottom: throttle(function() {
  this.loadMore()
}, 100)  // 节流时间缩短

loadMore: debounce(async function() {
  if (this.loading || !this.hasMore) return
  
  this.loading = true
  this.page++
  await this.getOrderList()
  this.loading = false
}, 150)  // 防抖时间缩短

// 使用虚拟列表
<virtual-list
  :data="orderList"
  :item-size="80"
  @scroll-bottom="loadMore"
/>
```

---

## 示例 5：对比分析

### 用户输入
```
对比分析酒店首页 H5 版本和小程序版本的性能差异
```

### Claude 执行流程

#### 步骤 1：识别不同平台的代码
```bash
# 查找平台特定代码
grep -r "__mpx_mode__" src/pages/home --include="*.js" --include="*.mpx"
```

#### 步骤 2：分析平台差异
```javascript
// H5 特定逻辑
if (__mpx_mode__ === 'web') {
  // Web 特有的性能问题
  this.initWebSDK()
  this.preloadImages()
}

// 小程序特定逻辑
if (__mpx_mode__ === 'dd' || __mpx_mode__ === 'wx') {
  // 小程序特有的性能问题
  this.requestLocationPermission()
}
```

#### 步骤 3：生成对比报告
```markdown
# H5 vs 小程序性能对比

## 性能指标对比

| 指标 | H5 | 小程序 | 差异分析 |
|------|-----|--------|----------|
| FCP | 2.0s | 1.5s | 小程序更快 |
| TTI | 4.5s | 3.8s | 小程序更快 |
| LCP | 3.0s | 2.5s | 小程序更快 |

## 关键差异点

### H5 特有问题
1. JS Bundle 体积大（需优化）
2. 图片加载慢（需 CDN）
3. 首屏渲染慢（需 SSR）

### 小程序特有问题
1. setData 频繁（需合并）
2. 分包加载策略（需优化）
3. 原生组件通信慢（需减少）

## 优化建议

### H5 优化
- 启用 Gzip 压缩
- 图片懒加载 + WebP
- 代码分割

### 小程序优化
- 减少 setData 调用
- 优化分包策略
- 使用虚拟列表
```

---

## 使用技巧

### 技巧 1：指定关注点
```
分析首页性能，重点关注：首屏加载、搜索交互、定位获取
```

### 技巧 2：对比优化前后
```
对比首页优化前后的性能变化，评估优化效果
```

### 技巧 3：生成可视化图表
```
分析列表页性能，并生成瀑布流时序图
```

### 技巧 4：导出 JSON 数据
```
导出首页性能分析数据为 JSON 格式，便于后续处理
```

---

## 常见问题

### Q1: 如何分析异步函数的耗时？
A: Claude 会根据网络请求类型和数据量进行估算，同时分析 Promise 链的执行顺序。

### Q2: 如何处理复杂的组件嵌套？
A: Claude 会递归分析组件树，识别每个组件的初始化和渲染耗时。

### Q3: 如何评估优化的效果？
A: Claude 会对比优化前后的代码，计算理论性能提升，并建议使用性能测试工具验证。

---

## 输出格式

### Markdown 报告
标准的性能分析报告，包含详细的分析过程和优化建议。

### JSON 数据
结构化的性能数据，便于程序化处理和可视化。

### HTML 报告
带图表的 HTML 报告，适合分享和展示。

---

**提示**: 使用时可以直接向 Claude 描述分析需求，Claude 会自动执行分析流程并生成报告。
