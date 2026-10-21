# PerfMonitor 使用与 Skill 配合指南

> **双轨协作模式**：静态分析（Skill）+ 运行时真测（PerfMonitor）= 完整性能优化闭环

---

## 一、PerfMonitor 是什么

### 1.1 定位

**代码位置**: `src/utils/perf-monitor.js`

PerfMonitor 是部署在业务代码中的**运行时性能监控工具**，负责真实用户环境下的性能数据采集与上报。

### 1.2 核心能力

```
┌─────────────────────────────────────────┐
│ 跨页链路监控                             │
│  home_to_list_complete（首页→列表完成）   │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ 同页 Web Vitals                          │
│  FCP / LCP（首次内容绘制/最大内容绘制）    │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ 关键接口耗时                             │
│  getHomeData / 列表接口等                │
└─────────────────────────────────────────┘
```

### 1.3 技术特性

| 特性 | 说明 |
|------|------|
| **上报通道** | Omega 平台统一上报 |
| **环境支持** | H5 + 星河双端 |
| **指标类型** | 跨页链路 / Web Vitals / 接口耗时 |
| **自监控能力** | 自建 LCP/FCP 采集，不依赖单一端能力 |

---

## 二、与 page-performance-analysis Skill 的关系

### 2.1 双轨定位对比

| 维度 | Skill（静态分析轨） | PerfMonitor（运行时真测轨） |
|------|-------------------|---------------------------|
| **触发时机** | 开发阶段、优化前 | 线上运行时、优化后 |
| **数据来源** | 代码静态扫描 | 真实用户环境采集 |
| **输出内容** | 函数耗时估算、瓶颈识别、优化建议 | FCP/LCP/接口耗时真实数据 |
| **优势** | 快速定位、无需部署 | 准确数据、量化收益 |
| **使用场景** | 找问题、定方向 | 验证效果、持续监控 |

### 2.2 协作闭环

```
┌──────────────────────────────────────────┐
│ 1. Skill 静态扫描估瓶颈                    │
│    • 函数耗时梯队                          │
│    • 串行瀑布流识别                        │
│    • P0/P1/P2 优化建议                     │
└────────────────┬─────────────────────────┘
                 ▼
┌──────────────────────────────────────────┐
│ 2. 改造代码                                │
│    • 剥离非关键接口                        │
│    • 优化算法逻辑                          │
│    • 修正统计口径                          │
└────────────────┬─────────────────────────┘
                 ▼
┌──────────────────────────────────────────┐
│ 3. PerfMonitor 真测验证                    │
│    • 对比优化前后数据                      │
│    • 量化性能收益                          │
└────────────────┬─────────────────────────┘
                 ▼
┌──────────────────────────────────────────┐
│ 4. 数据驱动再迭代                          │
│    • 根据监控数据调整优化策略               │
└──────────────────────────────────────────┘
```

---

## 三、实际使用场景

### 场景 1：首页性能优化

#### Step 1 - Skill 静态分析

**用户指令**：
```
请分析酒店首页的函数执行耗时性能
```

**Skill 产出**：
- ✅ 发现 `privacyPopList` 接口耗时 300-600ms
- ✅ 识别该接口非首屏关键路径，但阻塞了 LCP 统计
- ✅ 建议：**P0 级优化** - 剥离此接口，避免污染 LCP 口径

#### Step 2 - 改造代码

```javascript
// 优化前：首屏同步加载
async mounted() {
  await Promise.all([
    this.getHomeData(),      // 关键接口
    this.privacyPopList(),   // ❌ 非关键，但阻塞 LCP
  ]);
}

// 优化后：延迟加载非关键接口
async mounted() {
  await this.getHomeData();  // ✅ 只等关键接口
  
  // 非关键接口延迟加载
  setTimeout(() => {
    this.privacyPopList();
  }, 0);
}
```

#### Step 3 - PerfMonitor 验证

```javascript
// perf-monitor.js 中的指标采集
class PerfMonitor {
  collectWebVitals() {
    // LCP 自监控
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      
      this.reportMetric('home_lcp', lcp);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  wrapApiCall(apiName, apiFunc) {
    return async (...args) => {
      const start = Date.now();
      const result = await apiFunc(...args);
      this.reportMetric(`${apiName}_duration`, Date.now() - start);
      return result;
    };
  }
}
```

**验证结果**：
- LCP 指标明显下降（移除非关键接口阻塞）
- `getHomeData` 耗时单独可观测

---

### 场景 2：列表页双路径优化

#### Step 1 - Skill 分析

**用户指令**：
```
对订单列表页进行性能分析，重点关注列表渲染和筛选功能
```

**Skill 产出**：
- ✅ 发现两条进入路径：**接口返回** vs **缓存命中直渲**
- ✅ 识别切日期重渲场景的统计口径问题
- ✅ 建议：分别埋点两条路径，避免数据混淆

#### Step 2 - PerfMonitor 补充埋点

```javascript
// 列表页加载逻辑
async loadListData() {
  const cachedData = getCache('listData');
  
  if (cachedData) {
    // 路径 1：缓存命中直渲
    this.renderList(cachedData);
    perfMonitor.reportMetric('list_from_cache_lcp', performance.now());
  }
  
  // 同时发起接口请求
  const freshData = await api.getListData();
  
  if (!cachedData) {
    // 路径 2：接口返回渲染
    this.renderList(freshData);
    perfMonitor.reportMetric('list_from_api_lcp', performance.now());
  } else {
    // 更新缓存但不重新渲染
    updateCache('listData', freshData);
  }
}
```

#### Step 3 - 效果验收

**Omega 看板数据对比**：
- 列表首屏 LCP：**1400ms → 1160ms（↓17%）**
- 缓存命中率：65%（说明大部分用户走了快速路径）

---

### 场景 3：星河菜单切换卡顿

#### Step 1 - Skill 分析

**用户指令**：
```
分析星河底部菜单切换的性能问题
```

**Skill 产出**：
- ✅ 排序逻辑在主线程同步执行
- ✅ 每次切换触发全量重排（O(n log n) 复杂度）
- ✅ 建议：使用 `requestIdleCallback` 延迟非关键排序

#### Step 2 - 优化 + 监控

```javascript
// 优化前：同步阻塞
switchMenu(menuId) {
  const items = this.getMenuItems(menuId);
  const sorted = items.sort(this.heavyComparator); // ❌ 阻塞主线程
  this.renderMenu(sorted);
}

// 优化后：空闲时处理
switchMenu(menuId) {
  const items = this.getMenuItems(menuId);
  
  // 先渲染未排序版本（快速响应）
  this.renderMenu(items);
  
  // 空闲时优化排序
  requestIdleCallback(() => {
    const start = Date.now();
    const sorted = items.sort(this.heavyComparator);
    this.renderMenu(sorted);
    
    perfMonitor.reportMetric(
      'menu_switch_duration', 
      Date.now() - start
    );
  });
}
```

#### Step 3 - 验证

**效果**：
- 卡顿改善约 **27%**（通过 FPS 监控和用户感知耗时）

---

## 四、PerfMonitor 核心 API（推测实现）

### 4.1 基础 API

```javascript
class PerfMonitor {
  /**
   * 上报单个指标
   * @param {string} name - 指标名称
   * @param {number} value - 指标值
   * @param {object} tags - 标签（可选）
   */
  reportMetric(name, value, tags = {}) {
    omega.report({
      metric: name,
      value: value,
      tags: {
        ...tags,
        env: this.detectEnv(), // 'h5' | 'xinghe'
        page: this.getCurrentPage(),
      }
    });
  }
  
  /**
   * 自动采集 Web Vitals
   */
  collectWebVitals() {
    // FCP - 首次内容绘制
    const fcp = performance.getEntriesByType('paint')
      .find(e => e.name === 'first-contentful-paint');
    
    if (fcp) {
      this.reportMetric('fcp', fcp.startTime);
    }
    
    // LCP - 最大内容绘制
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      
      this.reportMetric('lcp', lcp);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID - 首次输入延迟
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.reportMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
  }
}
```

### 4.2 跨页链路监控

```javascript
class PerfMonitor {
  /**
   * 跨页链路监控
   * @param {string} from - 起始页面
   * @param {string} to - 目标页面
   * @returns {Function} 结束回调
   */
  trackPageTransition(from, to) {
    const startTime = Date.now();
    const transitionId = `${from}_to_${to}`;
    
    // 存储到全局，供目标页面调用
    window.__pageTransitions = window.__pageTransitions || {};
    window.__pageTransitions[transitionId] = () => {
      const duration = Date.now() - startTime;
      this.reportMetric(`${transitionId}_complete`, duration);
    };
    
    return window.__pageTransitions[transitionId];
  }
}

// 使用示例
// pages/home/index.mpx
navigateToList() {
  perfMonitor.trackPageTransition('home', 'list');
  
  mpx.navigateTo({
    url: '/pages/list/main?from=home'
  });
}

// pages/list/index.mpx
onReady() {
  const from = this.$route.query.from;
  if (from && window.__pageTransitions) {
    const callback = window.__pageTransitions[`${from}_to_list`];
    callback?.();
  }
}
```

### 4.3 接口耗时包装器

```javascript
class PerfMonitor {
  /**
   * 包装 API 调用，自动上报耗时
   * @param {string} apiName - 接口名称
   * @param {Function} apiFunc - 原始接口函数
   * @returns {Function} 包装后的函数
   */
  wrapApiCall(apiName, apiFunc) {
    return async (...args) => {
      const start = Date.now();
      
      try {
        const result = await apiFunc(...args);
        
        // 成功上报
        this.reportMetric(`${apiName}_duration`, Date.now() - start, {
          status: 'success'
        });
        
        return result;
      } catch (error) {
        // 失败上报
        this.reportMetric(`${apiName}_duration`, Date.now() - start, {
          status: 'error'
        });
        this.reportMetric(`${apiName}_error`, 1);
        
        throw error;
      }
    };
  }
}

// 使用示例
import perfMonitor from '@/utils/perf-monitor';
import { getHomeData } from '@/api/home';

// 包装关键接口
const getHomeDataWithMonitor = perfMonitor.wrapApiCall(
  'getHomeData',
  getHomeData
);

// 正常使用
async mounted() {
  const data = await getHomeDataWithMonitor();
  this.homeData = data;
}
```

---

## 五、在代码中集成 PerfMonitor

### 5.1 页面级集成

```javascript
// pages/home/index.mpx
<script>
import perfMonitor from '@/utils/perf-monitor';
import { getHomeData, getRecommendList } from '@/api/home';

export default {
  async onLoad() {
    // 1. 开启 Web Vitals 自动采集
    perfMonitor.collectWebVitals();
    
    // 2. 包装关键接口
    const getHomeDataWithMonitor = perfMonitor.wrapApiCall(
      'getHomeData',
      getHomeData
    );
    
    // 3. 正常业务逻辑
    try {
      const data = await getHomeDataWithMonitor();
      this.homeData = data;
    } catch (error) {
      console.error('首页数据加载失败', error);
    }
  },
  
  methods: {
    // 跨页跳转监控
    navigateToList() {
      perfMonitor.trackPageTransition('home', 'list');
      
      mpx.navigateTo({
        url: '/pages/list/main?from=home'
      });
    }
  }
}
</script>
```

### 5.2 全局初始化（App.mpx）

```javascript
// app.mpx
<script>
import perfMonitor from '@/utils/perf-monitor';

export default {
  onLaunch() {
    // 全局初始化监控
    perfMonitor.init({
      enableWebVitals: true,  // 开启 Web Vitals
      enablePageTransition: true, // 开启跨页监控
      sampleRate: 0.1, // 采样率 10%
    });
    
    // 全局错误监控
    mpx.onError((error) => {
      perfMonitor.reportMetric('global_error', 1, {
        message: error.message,
        stack: error.stack
      });
    });
  }
}
</script>
```

### 5.3 环境判断与双端支持

```javascript
// utils/perf-monitor.js
class PerfMonitor {
  detectEnv() {
    // 星河环境判断
    if (typeof mpx !== 'undefined' && mpx.platform === 'xinghe') {
      return 'xinghe';
    }
    
    // H5 环境
    if (typeof window !== 'undefined') {
      return 'h5';
    }
    
    return 'unknown';
  }
  
  collectWebVitals() {
    const env = this.detectEnv();
    
    if (env === 'h5') {
      // H5 使用 PerformanceObserver
      this._collectWebVitalsH5();
    } else if (env === 'xinghe') {
      // 星河使用自定义监控
      this._collectWebVitalsXinghe();
    }
  }
  
  _collectWebVitalsH5() {
    // 使用 PerformanceObserver API
    new PerformanceObserver((list) => {
      // ...
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  _collectWebVitalsXinghe() {
    // 星河环境的自定义实现
    const observer = mpx.createPerformanceObserver((entries) => {
      // ...
    });
    observer.observe({ entryTypes: ['render', 'script'] });
  }
}
```

---

## 六、数据对比：静态估算 vs 真测验证

| 维度 | Skill 静态估算 | PerfMonitor 真测 | 使用时机 |
|------|---------------|-----------------|----------|
| **接口耗时** | 100-300ms（简单查询）<br>300-800ms（复杂查询） | 实际 API 响应时间<br>含网络、服务端、客户端解析 | 估算用 Skill<br>验证用 Monitor |
| **LCP** | 推测关键路径<br>估算阻塞接口影响 | PerformanceObserver 实测<br>精确到毫秒 | Skill 找瓶颈<br>Monitor 量收益 |
| **函数耗时** | 基于复杂度评估<br>O(n)、O(n²) 等 | 真机执行耗时<br>含 GC、主线程调度 | 双管齐下 |
| **用户卡顿** | 算法复杂度推断<br>同步阻塞识别 | FPS 监控<br>长任务追踪 | 定位用 Skill<br>验证用 Monitor |

**协作策略**：
1. 用 Skill **快速定位** 可疑瓶颈（无需部署）
2. 改造代码后，用 PerfMonitor **真测验证** 优化效果
3. 根据监控数据 **持续迭代**，形成闭环

---

## 七、Skill 分析脚本的配合

### 7.1 scripts/analyze.sh 作用

`analyze.sh` 是 Skill 的**前置工具**，用于生成分析报告框架：

```bash
# 使用方式
cd page-performance-analysis/scripts
./analyze.sh src/pages/home/index.mpx 首页性能分析报告.md

# 输出
✓ 目标文件: index.mpx
✓ 技术栈: MPX/Vue
✓ 代码行数: 450
✓ 函数数量: 23
✓ 分析报告已生成: 首页性能分析报告.md
```

### 7.2 生成的报告框架

```markdown
# 页面性能分析报告

**生成时间**: 2026-09-17 15:10:23
**分析文件**: src/pages/home/index.mpx
**技术栈**: MPX/Vue
**代码行数**: 450

---

## 一、页面概述
待 Claude 深度分析...

## 二、函数执行耗时排序

### 🔴 第一梯队：高耗时函数（>500ms）
待分析...

### 🟡 第二梯队：中等耗时函数（200-500ms）
待分析...

### 🟢 第三梯队：低耗时函数（<200ms）
待分析...

## 三、性能瓶颈分析
待 Claude 深度分析...

## 四、优化建议
### P0 级（立即优化）
待分析...
```

### 7.3 后续流程

1. **提供给 Claude**：将框架报告和源码路径提供给 Claude
2. **深度分析**：Claude 读取源码，填充具体分析内容
3. **输出完整报告**：包含耗时梯队、瓶颈识别、优化建议
4. **结合 PerfMonitor**：优化后通过真测验证效果

---

## 八、已验证的优化成果

### 8.1 首页优化

| 指标 | 优化手段 | 效果 |
|------|---------|------|
| **LCP** | 剥离 `privacyPopList` 非关键接口 | 不再污染 LCP 口径 |
| **接口耗时** | 单独监控 `getHomeData` | 可观测核心接口性能 |
| **环境适配** | H5/星河双端自监控 | 统一数据口径 |

### 8.2 列表页优化

| 指标 | 优化手段 | 效果 |
|------|---------|------|
| **首屏 LCP** | 双路径埋点 + 口径修正 | **1400ms → 1160ms（↓17%）** |
| **缓存命中** | 区分接口返回 vs 缓存直渲 | 65% 用户走快速路径 |
| **切日期场景** | 修正重渲统计口径 | 数据准确性提升 |

### 8.3 星河菜单优化

| 指标 | 优化手段 | 效果 |
|------|---------|------|
| **切换卡顿** | `requestIdleCallback` 优化排序 | **改善约 27%** |
| **FPS 监控** | 长任务追踪 | 主线程阻塞减少 |

---

## 九、面试可讲的内容

### 9.1 技术亮点

**搭建双轨性能监控体系**：
- **静态分析轨**（Skill）：开发阶段快速定位瓶颈
- **运行时真测轨**（PerfMonitor）：线上持续监控与验证

**关键技术决策**：
1. **自建 Web Vitals 采集**：不依赖单一端能力，H5/星河双端统一口径
2. **双路径监控设计**：区分接口返回 vs 缓存命中，避免数据混淆
3. **环境抽象封装**：统一 API，屏蔽底层差异

### 9.2 可量化收益

| 优化项 | 收益 |
|-------|------|
| 列表页首屏 LCP | ↓17%（1400ms → 1160ms） |
| 星河菜单切换卡顿 | 改善约 27% |
| 监控覆盖 | 跨页链路 + Web Vitals + 关键接口 |
| 环境支持 | H5/星河双端 |

### 9.3 面试回答模板

**问：如何做性能优化？**

> 我们建立了双轨性能监控体系：
> 
> 1. **静态分析**：通过 Skill 读代码估算函数耗时，识别串行瀑布流、频繁触发等瓶颈
> 2. **运行时监控**：PerfMonitor 采集真实 FCP/LCP、跨页链路、接口耗时，通过 Omega 上报
> 3. **闭环验证**：Skill 定位 → 改代码 → PerfMonitor 验收，形成数据驱动的迭代
> 
> 典型案例：列表页优化
> - **问题**：Skill 发现接口返回和缓存直渲两条路径混在一起，口径不清晰
> - **方案**：分别埋点两条路径，修正切日期重渲场景的统计
> - **效果**：首屏 LCP 从 1400ms 降到 1160ms，下降 17%

**问：如何保证监控数据准确性？**

> 1. **自建采集**：不依赖单一端 API，H5 用 PerformanceObserver，星河用自定义实现
> 2. **口径明确**：区分关键路径（如首屏关键接口）vs 非关键路径（如隐私弹窗）
> 3. **环境区分**：H5/星河双端独立上报，避免数据混淆
> 4. **异常处理**：接口失败单独上报 error 指标，不影响耗时统计

---

## 十、总结

### 10.1 核心价值

```
┌─────────────────────────────────────────────┐
│ page-performance-analysis Skill              │
│  ✓ 读代码估瓶颈                              │
│  ✓ 串行瀑布流识别                            │
│  ✓ 耗时梯队评估                              │
│  ✓ P0/P1/P2 优化建议                         │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  业务代码改造     │
         └─────────┬────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ PerfMonitor                                  │
│  ✓ FCP/LCP 实测                              │
│  ✓ 跨页链路耗时                              │
│  ✓ 关键接口真实耗时                          │
│  ✓ Omega 上报 → 看板对比                     │
└─────────────────────────────────────────────┘
```

### 10.2 一句话总结

**Skill 负责「读代码找问题」，PerfMonitor 负责「线上量收益」—— 两者互补，形成「分析 → 优化 → 验证」的完整闭环。**

### 10.3 适用场景

| 场景 | 推荐工具 |
|------|---------|
| 新功能开发前的性能预判 | Skill 静态分析 |
| 已上线功能的性能问题定位 | Skill + PerfMonitor 数据 |
| 优化效果验证 | PerfMonitor 真测对比 |
| 持续性能监控 | PerfMonitor 长期上报 |
| 多页面性能横向对比 | PerfMonitor 看板 |

---

## 附录：参考文档

| 文档 | 说明 |
|------|------|
| [SKILL.md](./page-performance-analysis/SKILL.md) | Skill 核心定义与分析流程 |
| [QUICKSTART.md](./page-performance-analysis/QUICKSTART.md) | 快速开始指南 |
| [功能全面说明.md](./功能全面说明.md) | Skill 完整功能说明 |
| [PerfMonitor与体验优化.md](./PerfMonitor与体验优化.md) | PerfMonitor 业务实践 |
| [功能理解手册.md](./功能理解手册.md) | 双轨协作大白话 |
