# 腾讯PCG技术线-智能营销/AI小游戏方向 面试题（版本B）

> 候选人：谭成 | 求职意向：前端实习生  
> 面试方向：AI工程化/小游戏方向 + 前端八股文 + 算法编程  
> 生成时间：2025年4月7日

---

## 1. 你在滴滴推动的 AI Native 转型中，具体是如何制定 OpenSpec 规范并推广到团队的？遇到了哪些阻力，如何解决？

## 答案

### OpenSpec 规范制定过程

**背景：**

滴滴企业版商旅团队有 20+ 前端工程师，维护 57 个业务模块。在引入 AI 辅助开发前，面临以下问题：
- AI 生成的代码风格不一致
- Prompt 质量参差不齐，输出不稳定
- 缺乏统一的 AI 协作流程

**制定步骤：**

```
Step 1: 调研阶段（1周）
├── 分析团队现有代码风格
├── 调研业界 AI 辅助开发实践
└── 收集团队成员痛点

Step 2: 草案制定（1周）
├── 定义 OpenSpec 文件结构
├── 设计 SSD（Structured Skill Definition）规范
└── 编写示例和模板

Step 3: 试点验证（2周）
├── 选择 2-3 个需求试点
├── 收集团队反馈
└── 迭代优化规范

Step 4: 全面推广（持续）
├── 编写培训文档
├── 组织技术分享
└── 建立最佳实践库
```

### OpenSpec 核心内容

```yaml
# OpenSpec 文件示例
spec_version: "1.0.0"
project:
  name: "滴滴商旅前端"
  tech_stack: ["React", "TypeScript", "Ant Design"]
  
# 代码生成规范
code_generation:
  component:
    template: |
      import React from 'react';
      import styles from './{{name}}.module.css';
      
      interface {{name}}Props {
        {{#each props}}
        {{name}}: {{type}};
        {{/each}}
      }
      
      export const {{name}}: React.FC<{{name}}Props> = (props) => {
        // 实现逻辑
      };
    
    rules:
      - "使用函数组件"
      - "Props 必须定义接口"
      - "样式使用 CSS Modules"
      - "必须包含 JSDoc 注释"
  
# AI Prompt 模板
prompts:
  generate_component:
    context: "你是一位资深 React 工程师"
    input_schema:
      component_name: string
      props: array
      requirements: string
    output_schema:
      code: string
      tests: string
      documentation: string
```

### 推广过程中的阻力与解决

| 阻力 | 原因 | 解决方案 |
|------|------|----------|
| **学习成本高** | 新规范增加认知负担 | 提供 IDE 插件自动生成 OpenSpec |
| **灵活性不足** | 简单需求感觉"重" | 推出 Lite 版本，复杂需求用完整版 |
| **AI 输出不稳定** | 模型幻觉问题 | 引入 RAG + 示例库提升稳定性 |
| **老项目迁移难** | 存量代码无法立即适配 | 新需求强制使用，老项目逐步迁移 |
| **质疑效果** | 部分同学不信任 AI | 用数据说话，展示效率提升案例 |

### 量化成果

```
推广 3 个月后的数据：

代码生成采纳率：35% → 78%
需求交付周期：平均缩短 30%
代码规范符合率：60% → 92%
团队满意度：从 5.2/10 提升到 7.8/10
```

---

## 2. GResume 项目中的 AI ATS 评分系统是如何设计的？如何控制 AI 调用成本？

## 答案

### ATS 评分系统设计

**系统架构：**

```
用户上传简历
    ↓
┌─────────────────────────────────────────┐
│           前端（GResume）                │
│  • 简历解析（PDF/Word → 结构化数据）      │
│  • 数据脱敏（保护隐私）                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│      Supabase Edge Functions            │
│  • 请求验证（限流、鉴权）                 │
│  • Prompt 组装                          │
│  • 流式调用 DeepSeek API                │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│         DeepSeek LLM                    │
│  • 简历内容分析                          │
│  • JD 匹配度计算                         │
│  • 优化建议生成                          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│           前端展示                       │
│  • 评分可视化（雷达图）                   │
│  • 优化建议高亮                          │
│  • 对比分析（简历 vs JD）                │
└─────────────────────────────────────────┘
```

**Prompt 设计：**

```typescript
const atsPrompt = `
你是一位资深 HR 和简历优化专家。请对以下简历进行 ATS（ applicant tracking system ）分析。

## 输入数据
简历内容：
{{resumeContent}}

目标职位描述：
{{jobDescription}}

## 分析维度
1. 关键词匹配度（30%）：简历中是否包含 JD 中的核心关键词
2. 格式规范性（20%）：排版、字体、段落是否专业
3. 内容完整性（20%）：是否包含必要模块（教育、工作、项目）
4. 量化成果（15%）：是否有数据支撑的成果
5. 语言表达（15%）：是否简洁、专业、无错别字

## 输出格式（JSON）
{
  "overallScore": 85,
  "dimensions": [
    { "name": "关键词匹配", "score": 90, "suggestions": [...] },
    { "name": "格式规范", "score": 80, "suggestions": [...] }
  ],
  "keywordMatches": [
    { "keyword": "React", "found": true, "context": "..." }
  ],
  "optimizationTips": [...]
}
`;
```

### 成本控制策略

**1. 请求优化**

| 策略 | 实现 | 节省比例 |
|------|------|----------|
| **流式输出** | 分块返回，不用等待完整响应 | 30%+ |
| **缓存复用** | 相同简历 + 相同 JD → 缓存命中 | 50%+ |
| **Prompt 精简** | 只传必要上下文，控制 Token 数 | 20%+ |
| **温度参数** | temperature=0.2，减少重试 | 10%+ |
| **批量处理** | 多维度一次请求，减少往返 | 15%+ |

**2. 模型选择策略**

```typescript
// 分层模型策略
async function analyzeResume(resume: string, jd: string) {
  // 简单任务用轻量模型
  if (isSimpleCheck(resume)) {
    return await callLightModel(resume, jd);  // 成本低 10 倍
  }
  
  // 复杂分析用强模型
  return await callDeepSeek(resume, jd);
}

// 降级方案
async function analyzeWithFallback(resume: string, jd: string) {
  try {
    return await callDeepSeek(resume, jd);
  } catch (e) {
    // 失败时降级到本地规则匹配
    return localKeywordMatch(resume, jd);
  }
}
```

**3. 限流与配额**

```typescript
// Edge Function 限流
const rateLimit = {
  maxRequestsPerUser: 10,      // 每用户每天
  maxRequestsPerIP: 100,       // 每 IP 每天
  windowMs: 24 * 60 * 60 * 1000
};

// 超出配额处理
if (userQuota.exceeded) {
  return {
    code: 'QUOTA_EXCEEDED',
    message: '今日额度已用完，明日再来或使用本地分析',
    fallback: localAnalysis(resume, jd)
  };
}
```

**4. 实际成本数据**

| 功能 | 单次 Token | 单次成本 | 日活 1000 人成本 |
|------|-----------|---------|-----------------|
| ATS 分析 | ~2K | ¥0.15 | ¥150 |
| 简历优化 | ~5K | ¥0.35 | ¥350 |
| 智能补全 | ~500 | ¥0.04 | ¥40 |
| **合计** | - | - | **¥540/天** |

---

## 3. 你在滴滴商旅平台做的弱网优化具体是怎么做的？有哪些可量化的成果？

## 答案

### 弱网场景分析

**商旅平台特点：**
- 用户经常在机场、高铁等弱网环境使用
- 机票查询、预订对实时性要求高
- 页面加载慢直接影响转化率

**问题诊断：**

```
通过 Lighthouse 和真实用户监控发现：

弱网环境（2G/3G）下：
- 首屏加载时间：8-12s（目标 < 3s）
- 接口成功率：85%（目标 > 99%）
- 页面白屏率：15%（目标 < 1%）
```

### 优化方案

**1. 资源加载优化**

```typescript
// 路由级代码分割
const PolicyList = loadable(() => import('./pages/PolicyList'), {
  fallback: <Skeleton rows={5} />,
});

// 图片懒加载 + 渐进加载
<Image
  src={highResUrl}
  placeholder={lowResUrl}  // 先显示模糊图
  loading="lazy"
/>

// 资源预加载
const PreloadResources = () => {
  useEffect(() => {
    // 预加载下一页可能需要的资源
    const prefetchNextPage = () => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/next-page.js';
      document.head.appendChild(link);
    };
    
    // 网络良好时预加载
    if (navigator.connection?.effectiveType === '4g') {
      prefetchNextPage();
    }
  }, []);
};
```

**2. 网络请求优化**

```typescript
// 请求重试机制
class RetryableRequest {
  async fetch(url: string, options: RequestInit, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        // 指数退避
        await delay(Math.pow(2, i) * 1000);
      }
    }
  }
}

// 请求合并（防抖）
const debouncedSearch = debounce((query) => {
  fetchSearchResults(query);
}, 300);

// 离线缓存
const offlineCache = {
  async get(key: string) {
    // 先读本地缓存
    const cached = await localDB.get(key);
    if (cached && !isExpired(cached)) {
      return cached.data;
    }
    
    try {
      // 网络请求
      const data = await fetch(key);
      await localDB.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (e) {
      // 网络失败返回过期缓存
      return cached?.data;
    }
  }
};
```

**3. 构建优化**

```javascript
// vite.config.js
export default {
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],  // 第三方库单独打包
          ui: ['antd', '@ant-design/icons'],
          utils: ['lodash', 'moment']
        }
      }
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
};
```

**4. 骨架屏优化**

```typescript
// 通用骨架屏组件
const Skeleton = ({ rows = 3, columns = 1 }) => (
  <div className="skeleton-container">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton-row">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="skeleton-cell" />
        ))}
      </div>
    ))}
  </div>
);

// 使用
<Suspense fallback={<Skeleton rows={5} columns={4} />}>
  <PolicyTable />
</Suspense>
```

### 可量化成果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首屏加载时间（弱网） | 8-12s | 2.5s | 75% |
| 接口成功率（弱网） | 85% | 98.5% | 16% |
| 页面白屏率 | 15% | 0.5% | 97% |
| JS 包体积 | 2.1MB | 1.2MB | 43% |
| 转化率（弱网用户） | 12% | 18% | 50% |

---

## 4. 请解释 React Hooks 的依赖数组工作原理，以及 useEffect 中常见的闭包陷阱如何解决？

## 答案

### 依赖数组工作原理

```javascript
useEffect(() => {
  // effect 逻辑
  console.log(count);
}, [count]);  // 依赖数组

// React 内部实现（简化）
function useEffect(effect, deps) {
  const fiber = currentlyRenderingFiber;
  const hook = mountWorkInProgressHook();
  
  // 比较依赖
  const prevDeps = hook.memoizedState;
  if (prevDeps !== null) {
    const areDepsEqual = deps.every((dep, i) => dep === prevDeps[i]);
    if (areDepsEqual) {
      // 依赖未变，跳过 effect
      return;
    }
  }
  
  // 依赖变化，执行 effect
  hook.memoizedState = deps;
  scheduleEffect(effect);
}
```

### 闭包陷阱详解

**陷阱 1：过时闭包**

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 永远输出 0！
      setCount(count + 1); // 永远设置 1！
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 依赖数组为空，count 永远是初始值
  
  return <div>{count}</div>;
}
```

**原因分析：**

```
初始渲染：
- count = 0
- effect 捕获 count = 0
- 定时器注册，引用 count = 0

后续渲染：
- count 变化，但 effect 不重新执行（依赖数组为空）
- 定时器回调中的 count 永远是 0
```

**解决方案：**

```javascript
// 方案 1：使用函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);  // 使用函数式更新，不依赖外部 count
  }, 1000);
  return () => clearInterval(timer);
}, []);

// 方案 2：使用 ref
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const timer = setInterval(() => {
    console.log(countRef.current);  // 始终是最新值
  }, 1000);
  return () => clearInterval(timer);
}, []);

// 方案 3：正确设置依赖
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);
  }, 1000);
  return () => clearInterval(timer);
}, [count]);  // 添加依赖
```

**陷阱 2：异步回调中的状态**

```javascript
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async () => {
    const data = await fetchResults(query);
    setResults(data);
  };
  
  useEffect(() => {
    // 竞态条件：如果用户快速输入，可能显示旧结果
    handleSearch();
  }, [query]);
}

// 解决方案：使用 AbortController
useEffect(() => {
  const controller = new AbortController();
  
  const search = async () => {
    try {
      const data = await fetchResults(query, { signal: controller.signal });
      setResults(data);
    } catch (e) {
      if (e.name === 'AbortError') return;
      throw e;
    }
  };
  
  search();
  
  return () => controller.abort();  // 清理时取消请求
}, [query]);
```

**陷阱 3：useCallback 和 useMemo 的依赖**

```javascript
// ❌ 错误：依赖不全
const handleClick = useCallback(() => {
  console.log(user.name);  // 使用了 user，但依赖数组没有
}, []);  // 漏了 user

// ✅ 正确
const handleClick = useCallback(() => {
  console.log(user.name);
}, [user]);

// 或者解构后只依赖需要的字段
const handleClick = useCallback(() => {
  console.log(userName);
}, [userName]);
```

### ESLint 规则

```javascript
// eslint-plugin-react-hooks 会自动检查依赖
// 推荐配置
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",  // 检查 Hook 规则
    "react-hooks/exhaustive-deps": "warn"   // 检查依赖数组
  }
}
```

---

## 5. JavaScript 的原型链是什么？如何实现继承？ES6 Class 的本质是什么？

## 答案

### 原型链基础

```javascript
// 构造函数
function Person(name) {
  this.name = name;
}

// 原型方法
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

// 创建实例
const person = new Person('Tom');

// 原型链
person.__proto__ === Person.prototype;  // true
Person.prototype.__proto__ === Object.prototype;  // true
Object.prototype.__proto__ === null;  // true

// 完整的原型链
person → Person.prototype → Object.prototype → null
```

### 继承实现方式

**1. 原型链继承（不推荐）**

```javascript
function Parent() {
  this.name = 'parent';
  this.colors = ['red', 'blue'];
}

function Child() {}

Child.prototype = new Parent();  // 原型指向 Parent 实例

const child1 = new Child();
const child2 = new Child();

child1.colors.push('green');
console.log(child2.colors);  // ['red', 'blue', 'green'] - 共享引用问题！
```

**2. 借用构造函数继承**

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

function Child(name) {
  Parent.call(this, name);  // 借用父类构造函数
}

const child1 = new Child('Tom');
const child2 = new Child('Jerry');

child1.colors.push('green');
console.log(child2.colors);  // ['red', 'blue'] - 独立

// 缺点：无法继承原型方法
```

**3. 组合继承（经典方式）**

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);  // 继承属性
  this.age = age;
}

Child.prototype = new Parent();  // 继承方法
Child.prototype.constructor = Child;  // 修复 constructor

Child.prototype.sayAge = function() {
  console.log(this.age);
};
```

**4. 寄生组合继承（最优）**

```javascript
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

function Parent(name) {
  this.name = name;
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

inheritPrototype(Child, Parent);

Child.prototype.sayAge = function() {
  console.log(this.age);
};
```

### ES6 Class 本质

```javascript
// ES6 Class 写法
class Parent {
  constructor(name) {
    this.name = name;
  }
  
  sayName() {
    console.log(this.name);
  }
  
  static staticMethod() {
    console.log('static');
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
  
  sayAge() {
    console.log(this.age);
  }
}

// 本质上还是原型链（Babel 编译后）
function Parent(name) {
  this.name = name;
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

Parent.staticMethod = function() {
  console.log('static');
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
Child.prototype.sayAge = function() {
  console.log(this.age);
};

Object.setPrototypeOf(Child, Parent);  // 继承静态方法
```

### Class 与原型链对比

| 特性 | Class | 原型链 |
|------|-------|--------|
| 语法 | 声明式，更像 Java | 函数式 |
| 本质 | 语法糖 | 底层机制 |
| 继承 | extends + super | prototype + call |
| 静态方法 | static 关键字 | 直接挂载构造函数 |
| 私有属性 | #private（ES2022） | 闭包模拟 |

---

## 6. 请详细解释浏览器缓存机制，包括强缓存和协商缓存

## 答案

### 缓存类型

```
浏览器请求资源时：

1. 检查 Service Worker 缓存
2. 检查 Memory Cache（内存缓存）
3. 检查 Disk Cache（磁盘缓存）
4. 检查 Push Cache（HTTP/2）
5. 发起网络请求
```

### 强缓存

**特点：** 不会发送请求到服务器，直接返回缓存

**控制头：**

```
Expires（HTTP/1.0）
├── 值：绝对时间，如 Wed, 21 Oct 2025 07:28:00 GMT
├── 缺点：依赖客户端时间，可能不准确
└── 优先级：低

Cache-Control（HTTP/1.1）
├── max-age=3600：缓存 3600 秒
├── no-cache：可以缓存，但必须协商
├── no-store：完全不缓存
├── private：仅客户端缓存
├── public：客户端和代理都可缓存
└── 优先级：高
```

**示例：**

```javascript
// 强缓存 1 年（适合带 hash 的资源）
Cache-Control: public, max-age=31536000, immutable

// 不缓存（HTML 文件）
Cache-Control: no-cache

// 私有缓存
Cache-Control: private, max-age=3600
```

### 协商缓存

**特点：** 发送请求到服务器，由服务器决定是否使用缓存

**控制头：**

```
Last-Modified / If-Modified-Since
├── Last-Modified：资源最后修改时间
├── If-Modified-Since：请求时带上上次的时间
└── 缺点：时间精度秒级，可能不准确

ETag / If-None-Match（推荐）
├── ETag：资源的唯一标识（通常是 hash）
├── If-None-Match：请求时带上上次的 ETag
└── 优点：精确，优先级高于 Last-Modified
```

**协商过程：**

```
首次请求：
客户端 ───────────────────────────────→ 服务器
         GET /resource.js
         
客户端 ←─────────────────────────────── 服务器
         200 OK
         ETag: "33a64df5"
         Cache-Control: max-age=0

再次请求：
客户端 ───────────────────────────────→ 服务器
         GET /resource.js
         If-None-Match: "33a64df5"
         
客户端 ←─────────────────────────────── 服务器
         304 Not Modified
         （不返回资源内容，节省带宽）
```

### 缓存策略实践

```javascript
// 不同资源的缓存策略

// HTML：不缓存，确保获取最新版本
// Nginx 配置
location / {
  add_header Cache-Control "no-cache";
}

// JS/CSS：长期缓存（因为文件名有 hash）
location ~* \.(js|css)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

// 图片：长期缓存
location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
  add_header Cache-Control "public, max-age=31536000";
}

// API：不缓存
location /api/ {
  add_header Cache-Control "no-store";
}
```

### 缓存清理

```javascript
// 方式 1：修改文件名（推荐）
// main.a3f2b1c.js → main.d8e9f0a.js

// 方式 2：修改查询参数
// main.js?v=2

// 方式 3：Cache-Control: no-cache（开发环境）
```

---

## 7. 什么是 CORS？如何解决跨域问题？

## 答案

### CORS 原理

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器的一种安全机制，限制从一个源加载的文档或脚本如何与来自另一个源的资源进行交互。

**同源策略：**

```
同源定义：协议 + 域名 + 端口 完全相同

同源：
- https://example.com/page1
- https://example.com/page2

不同源：
- https://example.com vs http://example.com（协议不同）
- https://example.com vs https://api.example.com（域名不同）
- https://example.com vs https://example.com:8080（端口不同）
```

### CORS 请求类型

**简单请求：**

```
条件：
1. 方法：GET、HEAD、POST
2. 头部：Accept、Accept-Language、Content-Language、Content-Type
3. Content-Type：application/x-www-form-urlencoded、multipart/form-data、text/plain

请求流程：
客户端 ───────────────────────────────→ 服务器
         GET /api/data
         Origin: https://example.com
         
客户端 ←─────────────────────────────── 服务器
         200 OK
         Access-Control-Allow-Origin: https://example.com
```

**预检请求（Preflight）：**

```
条件：不满足简单请求条件

请求流程：
客户端 ───────────────────────────────→ 服务器
         OPTIONS /api/data
         Origin: https://example.com
         Access-Control-Request-Method: PUT
         Access-Control-Request-Headers: X-Custom-Header
         
客户端 ←─────────────────────────────── 服务器
         204 No Content
         Access-Control-Allow-Origin: https://example.com
         Access-Control-Allow-Methods: GET, POST, PUT
         Access-Control-Allow-Headers: X-Custom-Header
         Access-Control-Max-Age: 86400

客户端 ───────────────────────────────→ 服务器
         PUT /api/data
         Origin: https://example.com
         X-Custom-Header: value
```

### 解决方案

**1. 后端配置 CORS（推荐）**

```javascript
// Node.js + Express
const cors = require('cors');

// 允许所有来源（开发环境）
app.use(cors());

// 允许特定来源
app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // 允许携带 Cookie
}));

// Nginx 配置
location /api/ {
  add_header 'Access-Control-Allow-Origin' 'https://example.com';
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
  add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
  add_header 'Access-Control-Allow-Credentials' 'true';
  
  if ($request_method = 'OPTIONS') {
    return 204;
  }
}
```

**2. 代理（开发环境）**

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};

// 请求时
fetch('/api/users');  // 实际请求 http://backend-server.com/users
```

**3. JSONP（仅 GET，已过时）**

```javascript
// 原理：利用 script 标签不受同源策略限制
function jsonp(url, callback) {
  const script = document.createElement('script');
  const callbackName = 'jsonp_' + Date.now();
  
  window[callbackName] = (data) => {
    callback(data);
    document.body.removeChild(script);
    delete window[callbackName];
  };
  
  script.src = `${url}?callback=${callbackName}`;
  document.body.appendChild(script);
}

jsonp('https://api.example.com/data', (data) => {
  console.log(data);
});
```

**4. postMessage（跨窗口通信）**

```javascript
// 父窗口
const iframe = document.getElementById('my-iframe');
iframe.contentWindow.postMessage('Hello', 'https://child-domain.com');

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://child-domain.com') return;
  console.log(e.data);
});

// 子窗口
window.parent.postMessage('Hi', 'https://parent-domain.com');
```

### CORS 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| No 'Access-Control-Allow-Origin' | 后端未配置 CORS | 后端添加响应头 |
| Credentials flag is true, but Access-Control-Allow-Credentials is not | 携带 Cookie 但后端未允许 | 后端设置 Access-Control-Allow-Credentials: true |
| Request header field X-XXX is not allowed | 自定义头部未允许 | 后端添加到 Access-Control-Allow-Headers |
| 预检请求失败 | OPTIONS 请求返回非 200 | 确保 OPTIONS 返回 204 |

---

## 8. 请解释 JavaScript 中的 this 指向，以及箭头函数和普通函数的区别

## 答案

### this 指向规则

**1. 默认绑定（全局上下文）**

```javascript
function foo() {
  console.log(this);  // 浏览器：window，Node.js：global
}
foo();

// 严格模式
function bar() {
  'use strict';
  console.log(this);  // undefined
}
bar();
```

**2. 隐式绑定（对象方法）**

```javascript
const obj = {
  name: 'Tom',
  sayName() {
    console.log(this.name);  // this 指向 obj
  }
};

obj.sayName();  // 'Tom'

// 隐式丢失
const say = obj.sayName;
say();  // undefined（this 指向 window）
```

**3. 显式绑定（call/apply/bind）**

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'Tom' };

// call：参数列表
greet.call(person, 'Hello');  // 'Hello, Tom'

// apply：参数数组
greet.apply(person, ['Hi']);  // 'Hi, Tom'

// bind：返回新函数
const greetTom = greet.bind(person);
greetTom('Hey');  // 'Hey, Tom'
```

**4. new 绑定**

```javascript
function Person(name) {
  this.name = name;  // this 指向新创建的实例
}

const tom = new Person('Tom');
console.log(tom.name);  // 'Tom'
```

### 箭头函数与普通函数的区别

| 特性 | 普通函数 | 箭头函数 |
|------|---------|---------|
| this | 运行时确定 | 定义时确定（词法作用域） |
| arguments | 有 | 没有（使用剩余参数） |
| 构造函数 | 可以 | 不可以 |
| 原型 | 有 prototype | 没有 |
| 简写 | 不能省略 return | 单表达式可省略 return |

**箭头函数的 this：**

```javascript
const obj = {
  name: 'Tom',
  
  // 普通函数
  sayNameNormal: function() {
    console.log(this.name);  // 'Tom'
    
    setTimeout(function() {
      console.log(this.name);  // undefined（this 指向 window）
    }, 100);
  },
  
  // 箭头函数
  sayNameArrow: function() {
    console.log(this.name);  // 'Tom'
    
    setTimeout(() => {
      console.log(this.name);  // 'Tom'（继承外层 this）
    }, 100);
  }
};
```

**实际应用：**

```javascript
// React 类组件（旧）
class Counter extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
    
    // 需要绑定 this
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }
}

// React 函数组件 + Hooks（新）
function Counter() {
  const [count, setCount] = useState(0);
  
  // 箭头函数自动绑定
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}
```

### this 面试题

```javascript
const obj = {
  name: 'obj',
  fn1() {
    console.log(this.name);
  },
  fn2: () => {
    console.log(this.name);
  },
  fn3() {
    return () => {
      console.log(this.name);
    };
  }
};

obj.fn1();      // 'obj'（隐式绑定）
obj.fn2();      // undefined（箭头函数，this 指向 window）
obj.fn3()();    // 'obj'（箭头函数继承 fn3 的 this）

const fn = obj.fn1;
fn();           // undefined（默认绑定）
```

---

## 9. 什么是虚拟 DOM？Diff 算法是如何工作的？

## 答案

### 虚拟 DOM 概念

虚拟 DOM（Virtual DOM）是用 JavaScript 对象描述真实 DOM 结构的轻量级表示。

```javascript
// 真实 DOM
<div class="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 虚拟 DOM（React 中）
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: 'Hello' }
      },
      {
        type: 'p',
        props: { children: 'World' }
      }
    ]
  }
}
```

### 为什么需要虚拟 DOM

```
直接操作真实 DOM 的问题：
1. DOM 操作代价高（引发重排重绘）
2. 频繁操作导致性能问题

虚拟 DOM 的优势：
1. 减少直接 DOM 操作次数
2. 批量更新，提高效率
3. 跨平台（React Native、小程序等）
```

### Diff 算法

**传统 Diff 算法的问题：**

```
两棵树完全对比：O(n³)
- 1000 个节点需要 10 亿次比较
- 不可接受
```

**React Diff 策略（O(n)）：**

```
策略 1：同级比较，不跨层级
策略 2：不同类型的元素直接替换
策略 3：key 属性优化列表比较
```

**Diff 过程：**

```javascript
// 1. 元素类型不同，直接替换
// 旧：<div>Hello</div>
// 新：<span>Hello</span>
// 结果：卸载 div，挂载 span

// 2. 元素类型相同，比较属性
// 旧：<div className="a" />
// 新：<div className="b" />
// 结果：更新 className

// 3. 列表比较（带 key）
// 旧：[A, B, C]
// 新：[A, C, B]
// 结果：移动 C 和 B，不重新创建

// 4. 列表比较（不带 key）
// 旧：[A, B, C]
// 新：[A, C, B]
// 结果：B → C，C → B（性能差）
```

**Key 的作用：**

```javascript
// ❌ 不带 key，性能差
<ul>
  {items.map(item => <li>{item.name}</li>)}
</ul>

// ✅ 带 key，React 可以识别元素
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// 不要用 index 作为 key（如果列表会变化）
// ❌ {items.map((item, index) => <li key={index}>...</li>)}
```

### Vue 的 Diff 优化

```javascript
// Vue 2：双端比较
// 从两端同时比较，减少比较次数

// Vue 3：静态提升 + PatchFlag
// 静态节点只创建一次
// 动态节点标记类型，只比较变化的部分

const template = `
  <div>
    <h1>Static Title</h1>  <!-- 静态，跳过 -->
    <p>{{ dynamic }}</p>    <!-- 动态，比较 TEXT -->
    <span :class="cls"></span>  <!-- 动态，比较 CLASS -->
  </div>
`;
```

---

## 10. 请手写实现 new 操作符

## 答案

```javascript
function myNew(constructor, ...args) {
  // 1. 创建一个空对象，继承 constructor 的原型
  const obj = Object.create(constructor.prototype);
  
  // 2. 执行构造函数，绑定 this 为新对象
  const result = constructor.apply(obj, args);
  
  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return (result !== null && (typeof result === 'object' || typeof result === 'function')) 
    ? result 
    : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const tom = myNew(Person, 'Tom', 20);
console.log(tom.name);  // 'Tom'
console.log(tom.age);   // 20
tom.sayHello();         // 'Hello, I'm Tom'
console.log(tom instanceof Person);  // true
```

### 完整版（包含边界处理）

```javascript
function myNew(constructor, ...args) {
  // 边界检查
  if (typeof constructor !== 'function') {
    throw new TypeError('Constructor must be a function');
  }
  
  // 1. 创建对象，继承原型
  const obj = Object.create(constructor.prototype);
  
  // 2. 执行构造函数
  const result = constructor.apply(obj, args);
  
  // 3. 处理返回值
  // 如果返回的是对象或函数，则返回该值
  // 否则返回创建的对象
  const isObject = typeof result === 'object' && result !== null;
  const isFunction = typeof result === 'function';
  
  return isObject || isFunction ? result : obj;
}

// 测试构造函数返回对象的情况
function ReturnObject() {
  this.name = 'instance';
  return { name: 'returned' };  // 返回新对象
}

const obj1 = myNew(ReturnObject);
console.log(obj1.name);  // 'returned'（不是 'instance'）

// 测试构造函数返回原始值的情况
function ReturnPrimitive() {
  this.name = 'instance';
  return 123;  // 返回原始值，忽略
}

const obj2 = myNew(ReturnPrimitive);
console.log(obj2.name);  // 'instance'
```

---

## 11. 编程题：实现一个防抖函数 debounce

## 答案

```javascript
/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay, immediate = false) {
  let timer = null;
  
  return function(...args) {
    const context = this;
    
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }
    
    if (immediate) {
      // 立即执行模式
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      
      if (callNow) {
        fn.apply(context, args);
      }
    } else {
      // 延迟执行模式
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
      }, delay);
    }
  };
}

// 测试
const handleSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);

// 快速输入
handleSearch('a');
handleSearch('ab');
handleSearch('abc');  // 只有这个会执行（300ms 后）
```

### 带取消功能的增强版

```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;
  
  const debounced = function(...args) {
    const context = this;
    
    if (timer) {
      clearTimeout(timer);
    }
    
    if (immediate) {
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      
      if (callNow) {
        fn.apply(context, args);
      }
    } else {
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    }
  };
  
  // 取消功能
  debounced.cancel = function() {
    clearTimeout(timer);
    timer = null;
  };
  
  // 立即执行功能
  debounced.flush = function() {
    if (timer) {
      clearTimeout(timer);
      fn.apply(this);
      timer = null;
    }
  };
  
  return debounced;
}

// 使用
const search = debounce(() => console.log('search'), 300);

// 取消未执行的调用
search('query');
search.cancel();  // 不会执行

// 立即执行
search('query');
search.flush();   // 立即执行
```

---

## 12. 编程题：实现一个节流函数 throttle

## 答案

```javascript
/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @param {Object} options - 配置选项
 * @returns {Function} 节流后的函数
 */
function throttle(fn, limit, options = {}) {
  const { leading = true, trailing = true } = options;
  
  let timer = null;
  let lastArgs = null;
  let lastCallTime = 0;
  
  return function(...args) {
    const context = this;
    const now = Date.now();
    
    // 判断是否超过时间限制
    const remaining = limit - (now - lastCallTime);
    
    if (remaining <= 0 || remaining > limit) {
      // 超过限制，可以执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      if (leading) {
        fn.apply(context, args);
        lastCallTime = now;
      } else {
        lastArgs = args;
        lastCallTime = now;
      }
    } else if (!timer && trailing) {
      // 在限制内，设置延迟执行
      lastArgs = args;
      timer = setTimeout(() => {
        fn.apply(context, lastArgs);
        lastCallTime = leading ? Date.now() : 0;
        timer = null;
        lastArgs = null;
      }, remaining);
    }
  };
}

// 测试
const handleScroll = throttle(() => {
  console.log('Scroll at', new Date().toLocaleTimeString());
}, 1000);

// 持续滚动
window.addEventListener('scroll', handleScroll);
// 每秒最多执行一次
```

### 时间戳版（简单版）

```javascript
function throttleSimple(fn, limit) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// 使用
window.addEventListener('scroll', throttleSimple(() => {
  console.log('scrolled');
}, 200));
```

---

## 13. 编程题：实现一个扁平化数组的方法 flat

## 答案

```javascript
/**
 * 数组扁平化
 * @param {Array} arr - 要扁平化的数组
 * @param {number} depth - 扁平化深度，默认为 1
 * @returns {Array} 扁平化后的数组
 */
function flat(arr, depth = 1) {
  // 边界情况
  if (!Array.isArray(arr)) {
    return [arr];
  }
  
  if (depth === 0) {
    return arr.slice();
  }
  
  const result = [];
  
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // 递归扁平化
      result.push(...flat(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  
  return result;
}

// 测试
const arr = [1, [2, 3], [4, [5, 6]], [[[7]]]];

console.log(flat(arr));       // [1, 2, 3, 4, [5, 6], [[7]]]
console.log(flat(arr, 2));    // [1, 2, 3, 4, 5, 6, [7]]
console.log(flat(arr, Infinity));  // [1, 2, 3, 4, 5, 6, 7]
```

### 迭代版（避免栈溢出）

```javascript
function flatIterative(arr, depth = 1) {
  const result = [];
  const stack = arr.map(item => ({ item, depth }));
  
  while (stack.length > 0) {
    const { item, depth } = stack.pop();
    
    if (Array.isArray(item) && depth > 0) {
      // 将子数组展开到栈中
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push({ item: item[i], depth: depth - 1 });
      }
    } else {
      result.unshift(item);
    }
  }
  
  return result;
}

// 使用 reduce 实现
function flatReduce(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatReduce(val, depth - 1) : val), [])
    : arr.slice();
}
```

---

## 14. 编程题：实现 LRU 缓存

## 答案

```javascript
/**
 * LRU (Least Recently Used) 缓存
 * 最近最少使用淘汰策略
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();  // 使用 Map 保持插入顺序
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    
    // 获取值，并移到最新位置
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      // 已存在，删除旧位置
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 超出容量，删除最旧的（Map 的第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // 插入新值（最新位置）
    this.cache.set(key, value);
  }
  
  // 获取当前缓存大小
  size() {
    return this.cache.size;
  }
  
  // 清空缓存
  clear() {
    this.cache.clear();
  }
}

// 测试
const cache = new LRUCache(2);

cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));    // 1（1 变为最新）

cache.put(3, 3);              // 淘汰 2
console.log(cache.get(2));    // -1（已淘汰）

cache.put(4, 4);              // 淘汰 1
console.log(cache.get(1));    // -1（已淘汰）
console.log(cache.get(3));    // 3
console.log(cache.get(4));    // 4
```

### 使用双向链表 + HashMap 实现（O(1)）

```javascript
class ListNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCacheOptimized {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();  // key -> node
    
    // 虚拟头尾节点
    this.head = new ListNode(0, 0);
    this.tail = new ListNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    
    const node = this.cache.get(key);
    this.moveToHead(node);
    return node.value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      // 更新值，移到头部
      const node = this.cache.get(key);
      node.value = value;
      this.moveToHead(node);
    } else {
      // 创建新节点
      const node = new ListNode(key, value);
      this.cache.set(key, node);
      this.addToHead(node);
      
      // 超出容量，删除尾部
      if (this.cache.size > this.capacity) {
        const tail = this.removeTail();
        this.cache.delete(tail.key);
      }
    }
  }
  
  // 移到头部（最近使用）
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  
  // 添加节点到头部
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  
  // 删除节点
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  // 删除尾部（最久未使用）
  removeTail() {
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
}
```

---

## 15. 你在简历中提到"乐观 UI"，请详细解释其实现原理和在 GResume 中的应用

## 答案

### 乐观 UI 概念

乐观 UI（Optimistic UI）是一种设计模式：在用户操作后立即更新界面，不等待服务器响应，假设操作会成功。如果失败，再回滚或提示用户。

```
传统 UI：
用户操作 → 发送请求 → 等待响应 → 更新界面
   ↓
  延迟感明显

乐观 UI：
用户操作 → 立即更新界面 → 发送请求 → 失败则回滚
   ↓
  即时反馈，体验流畅
```

### 实现原理

```typescript
// 乐观更新流程
async function optimisticUpdate(operation) {
  // 1. 保存当前状态（用于回滚）
  const previousState = { ...currentState };
  
  // 2. 立即更新 UI（乐观）
  updateUI(operation.optimisticResult);
  
  try {
    // 3. 发送请求
    const result = await api.call(operation);
    
    // 4. 确认更新（可选，如果乐观结果与实际一致）
    updateUI(result);
    
  } catch (error) {
    // 5. 失败回滚
    updateUI(previousState);
    showError(error.message);
  }
}
```

### GResume 中的应用

**场景 1：实时协作编辑**

```typescript
// 用户输入时立即更新本地状态
const useOptimisticUpdate = () => {
  const [doc, setDoc] = useState(initialDoc);
  const pendingOps = useRef([]);
  
  const updateField = (path: string, value: any) => {
    // 1. 乐观更新本地状态
    const newDoc = produce(doc, draft => {
      set(draft, path, value);
    });
    setDoc(newDoc);
    
    // 2. 记录操作
    const op = { path, value, timestamp: Date.now() };
    pendingOps.current.push(op);
    
    // 3. 异步同步到服务器
    syncToServer(op).then(
      // 成功：从 pending 移除
      () => {
        pendingOps.current = pendingOps.current.filter(p => p !== op);
      },
      // 失败：回滚
      (error) => {
        setDoc(doc);  // 回滚到之前状态
        pendingOps.current = pendingOps.current.filter(p => p !== op);
        toast.error('同步失败，请重试');
      }
    );
  };
  
  return { doc, updateField };
};
```

**场景 2：点赞/收藏**

```typescript
const LikeButton = ({ postId, initialLiked }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  
  const handleLike = async () => {
    // 乐观更新
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;
    
    setLiked(newLiked);
    setCount(newCount);
    
    try {
      await api.likePost(postId, newLiked);
    } catch (error) {
      // 失败回滚
      setLiked(liked);
      setCount(count);
      toast.error('操作失败');
    }
  };
  
  return (
    <button onClick={handleLike}>
      {liked ? '❤️' : '🤍'} {count}
    </button>
  );
};
```

### 乐观 UI 的注意事项

| 场景 | 建议 |
|------|------|
| 高失败率操作 | 不建议使用乐观 UI |
| 关键业务操作 | 慎用，需要明确回滚机制 |
| 网络不稳定环境 | 增加重试机制 |
| 多用户协作 | 结合 CRDT 处理冲突 |

---

## 16. 请设计一个前端埋点系统，需要支持 PV/UV、点击事件、性能监控

## 答案

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    采集层 (SDK)                          │
│  • 自动采集（PV、性能）                                   │
│  • 手动埋点（点击、曝光）                                  │
│  • 批量上报 + 本地缓存                                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    上报层 (Beacon)                       │
│  • 数据压缩                                              │
│  • 失败重试                                              │
│  • 采样控制                                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    服务端 (Collector)                    │
│  • 数据清洗                                              │
│  • 实时计算                                              │
│  • 存储分发                                              │
└─────────────────────────────────────────────────────────┘
```

### SDK 实现

```typescript
interface TrackerConfig {
  endpoint: string;
  appId: string;
  sampleRate?: number;  // 采样率 0-1
  batchSize?: number;   // 批量上报数量
}

class Tracker {
  private queue: Event[] = [];
  private config: TrackerConfig;
  
  constructor(config: TrackerConfig) {
    this.config = { sampleRate: 1, batchSize: 10, ...config };
    this.init();
  }
  
  private init() {
    // 自动采集 PV
    this.trackPV();
    
    // 自动采集性能
    this.trackPerformance();
    
    // 自动采集错误
    this.trackError();
    
    // 页面卸载时上报
    window.addEventListener('beforeunload', () => this.flush());
    
    // 定时上报
    setInterval(() => this.flush(), 5000);
  }
  
  // PV 采集
  private trackPV() {
    const track = () => {
      this.send({
        type: 'pv',
        url: location.href,
        referrer: document.referrer,
        timestamp: Date.now()
      });
    };
    
    // 初始页面
    track();
    
    // SPA 路由变化
    if ('history' in window) {
      const originalPushState = history.pushState;
      history.pushState = function(...args) {
        originalPushState.apply(this, args);
        track();
      };
      window.addEventListener('popstate', track);
    }
  }
  
  // 性能采集
  private trackPerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.send({
          type: 'performance',
          metrics: {
            dns: perf.domainLookupEnd - perf.domainLookupStart,
            tcp: perf.connectEnd - perf.connectStart,
            ttfb: perf.responseStart - perf.requestStart,
            dom: perf.domContentLoadedEventEnd - perf.navigationStart,
            load: perf.loadEventEnd - perf.navigationStart
          }
        });
      }, 0);
    });
  }
  
  // 错误采集
  private trackError() {
    window.addEventListener('error', (e) => {
      this.send({
        type: 'error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      this.send({
        type: 'promise_error',
        reason: e.reason?.message || String(e.reason),
        stack: e.reason?.stack
      });
    });
  }
  
  // 手动埋点
  track(event: string, params?: Record<string, any>) {
    this.send({
      type: 'custom',
      event,
      params,
      timestamp: Date.now()
    });
  }
  
  // 点击埋点（自动）
  trackClick(selector: string, eventName: string) {
    document.addEventListener('click', (e) => {
      if (e.target.matches(selector)) {
        this.track(eventName, {
          target: e.target.tagName,
          text: e.target.textContent?.slice(0, 50)
        });
      }
    });
  }
  
  // 曝光埋点
  trackExposure(selector: string, eventName: string) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.track(eventName, {
            target: entry.target.tagName,
            visibleRatio: entry.intersectionRatio
          });
        }
      });
    }, { threshold: 0.5 });
    
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  }
  
  // 发送事件
  private send(event: Event) {
    // 采样
    if (Math.random() > this.config.sampleRate) return;
    
    this.queue.push({
      ...event,
      appId: this.config.appId,
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    });
    
    // 达到批量大小立即上报
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }
  
  // 批量上报
  private flush() {
    if (this.queue.length === 0) return;
    
    const events = this.queue.splice(0, this.queue.length);
    
    // 使用 sendBeacon（页面卸载时也能发送）
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.config.endpoint,
        JSON.stringify(events)
      );
    } else {
      fetch(this.config.endpoint, {
        method: 'POST',
        body: JSON.stringify(events),
        keepalive: true
      });
    }
  }
  
  private getSessionId() {
    let sessionId = sessionStorage.getItem('tracker_session');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      sessionStorage.setItem('tracker_session', sessionId);
    }
    return sessionId;
  }
  
  private getUserId() {
    return localStorage.getItem('user_id') || 'anonymous';
  }
}

// 使用
const tracker = new Tracker({
  endpoint: 'https://analytics.example.com/collect',
  appId: 'gresume',
  sampleRate: 1
});

// 手动埋点
tracker.track('resume_create', { template: 'modern' });
tracker.track('ai_optimize_click');

// 自动点击埋点
tracker.trackClick('[data-track="export"]', 'export_resume');

// 曝光埋点
tracker.trackExposure('.feature-card', 'feature_expose');
```

---

## 17. 请解释 Service Worker 的工作原理，以及如何实现离线缓存

## 答案

### Service Worker 概念

Service Worker 是运行在浏览器后台的独立线程，可以拦截网络请求、缓存资源、推送通知，实现离线访问。

**特点：**
- 独立于主线程，不阻塞页面
- 生命周期独立于页面
- 需要 HTTPS（开发环境 localhost 除外）
- 基于 Promise

### 生命周期

```
安装（install）
    ↓
激活（activate）
    ↓
空闲（idle）
    ↓
终止（terminated）←→ 重新激活
    ↓
fetch / push / sync 事件
```

### 离线缓存实现

```javascript
// sw.js - Service Worker 文件
const CACHE_NAME = 'gresume-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/icon.png'
];

// 安装：缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())  // 立即激活
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())  // 立即控制页面
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，直接返回
        if (response) {
          return response;
        }
        
        // 缓存未命中，发起网络请求
        return fetch(event.request)
          .then((response) => {
            // 缓存新资源
            if (response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // 网络失败，返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
```

### 注册 Service Worker

```javascript
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
        
        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本
              showUpdateNotification(newWorker);
            }
          });
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// 更新提示
function showUpdateNotification(worker) {
  if (confirm('有新版本可用，是否更新？')) {
    worker.postMessage({ action: 'skipWaiting' });
    window.location.reload();
  }
}
```

### 缓存策略

| 策略 | 适用场景 | 实现 |
|------|---------|------|
| Cache First | 静态资源 | 先读缓存，未命中再网络 |
| Network First | 实时数据 | 先网络，失败回退缓存 |
| Stale While Revalidate | 兼顾速度和新鲜度 | 先返回缓存，同时更新 |
| Network Only | 敏感数据 | 只走网络 |
| Cache Only | 离线资源 | 只读缓存 |

```javascript
// Stale While Revalidate 策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        
        // 返回缓存（可能过期），同时更新
        return response || fetchPromise;
      });
    })
  );
});
```

---

## 18. 请设计一个支持 AI 实时对话的 WebSocket 架构

## 答案

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                       客户端                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   UI 层     │  │  状态管理   │  │   WebSocket     │  │
│  │  消息列表   │←→│  Zustand   │←→│    Client       │  │
│  │  输入框     │  │             │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      网关层                              │
│  • 负载均衡（WebSocket 粘性会话）                          │
│  • 鉴权（JWT Token 验证）                                 │
│  • 限流（防止滥用）                                       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    WebSocket 服务                        │
│  • 连接管理（心跳、重连）                                  │
│  • 消息路由                                               │
│  • 会话状态维护                                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      AI 服务                             │
│  • 流式 LLM 调用                                         │
│  • 上下文管理                                            │
│  • 响应缓存                                              │
└─────────────────────────────────────────────────────────┘
```

### 客户端实现

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status: 'sending' | 'streaming' | 'completed' | 'error';
}

class AIChatClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: Map<string, (chunk: string) => void> = new Map();
  
  constructor(private url: string, private token: string) {}
  
  connect() {
    this.ws = new WebSocket(`${this.url}?token=${this.token}`);
    
    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  private handleMessage(data: any) {
    switch (data.type) {
      case 'chunk':
        // 流式消息片段
        this.messageHandlers.get(data.messageId)?.(data.content);
        break;
      case 'complete':
        // 消息完成
        this.messageHandlers.delete(data.messageId);
        break;
      case 'error':
        // 错误处理
        console.error('AI Error:', data.error);
        break;
    }
  }
  
  async sendMessage(content: string): Promise<Message> {
    const messageId = generateId();
    const message: Message = {
      id: messageId,
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    // 发送消息
    this.ws?.send(JSON.stringify({
      type: 'chat',
      messageId,
      content,
      history: this.getRecentHistory()  // 发送最近上下文
    }));
    
    return message;
  }
  
  // 流式接收
  onStream(messageId: string, onChunk: (chunk: string) => void) {
    this.messageHandlers.set(messageId, onChunk);
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    }
  }
  
  disconnect() {
    this.ws?.close();
  }
}

// React Hook 封装
const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const clientRef = useRef<AIChatClient>();
  
  useEffect(() => {
    const client = new AIChatClient('wss://api.example.com/ai', getToken());
    client.connect();
    clientRef.current = client;
    
    return () => client.disconnect();
  }, []);
  
  const sendMessage = async (content: string) => {
    const client = clientRef.current;
    if (!client) return;
    
    // 添加用户消息
    const userMessage = await client.sendMessage(content);
    setMessages(prev => [...prev, userMessage]);
    
    // 创建 AI 消息占位
    const aiMessageId = generateId();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming'
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsStreaming(true);
    
    // 流式接收
    let fullContent = '';
    client.onStream(aiMessageId, (chunk) => {
      fullContent += chunk;
      setMessages(prev => 
        prev.map(m => 
          m.id === aiMessageId 
            ? { ...m, content: fullContent }
            : m
        )
      );
    });
    
    setIsStreaming(false);
  };
  
  return { messages, sendMessage, isStreaming };
};
```

### 服务端实现（Node.js + ws）

```javascript
const WebSocket = require('ws');
const { OpenAI } = require('openai');

const wss = new WebSocket.Server({ port: 8080 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

wss.on('connection', (ws, req) => {
  // 鉴权
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  if (!verifyToken(token)) {
    ws.close(1008, 'Invalid token');
    return;
  }
  
  ws.on('message', async (data) => {
    const { type, messageId, content, history } = JSON.parse(data);
    
    if (type === 'chat') {
      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [...history, { role: 'user', content }],
          stream: true
        });
        
        // 流式转发
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          ws.send(JSON.stringify({
            type: 'chunk',
            messageId,
            content: text
          }));
        }
        
        ws.send(JSON.stringify({
          type: 'complete',
          messageId
        }));
        
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          messageId,
          error: error.message
        }));
      }
    }
  });
  
  // 心跳
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);
  
  ws.on('close', () => {
    clearInterval(pingInterval);
  });
});
```

---

## 19. 请解释 WebAssembly 在前端的应用场景，以及如何在项目中集成

## 答案

### WebAssembly 简介

WebAssembly（Wasm）是一种二进制指令格式，可以在现代浏览器中以接近原生的速度运行。

**特点：**
- 高效快速：接近原生性能
- 安全：沙箱环境运行
- 开放：可与其他 Web 技术协作
- 语言无关：C/C++/Rust/Go 等都可编译为 Wasm

### 应用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| **图像/视频处理** | 滤镜、编码、解码 | FFmpeg.wasm |
| **游戏引擎** | 高性能游戏 | Unity WebGL |
| **AI 推理** | 端侧模型运行 | TensorFlow.js |
| **加密计算** | 密码学运算 | 哈希、加密 |
| **科学计算** | 复杂数学运算 | 物理模拟 |
| **解析器** | 快速解析大文件 | CSV/JSON 解析 |

### 项目集成示例

**场景：图片压缩**

```typescript
// 使用 Rust + wasm-pack 编译的 Wasm 模块
import init, { compress_image } from './image_compressor.js';

// 初始化 Wasm
await init();

// 使用
async function compressImage(file: File, quality: number): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // 调用 Wasm 函数
  const compressed = compress_image(uint8Array, quality);
  
  return new Blob([compressed], { type: 'image/jpeg' });
}
```

**Rust 源码：**

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;
use image::{ImageOutputFormat, DynamicImage};

#[wasm_bindgen]
pub fn compress_image(data: &[u8], quality: u8) -> Vec<u8> {
    // 解码图片
    let img = image::load_from_memory(data).unwrap();
    
    // 压缩
    let mut output = Vec::new();
    img.write_to(&mut output, ImageOutputFormat::Jpeg(quality)).unwrap();
    
    output
}
```

**编译：**

```bash
# 安装 wasm-pack
cargo install wasm-pack

# 编译为 Wasm
wasm-pack build --target web
```

### 性能对比

```typescript
// JS 版 MD5
function md5JS(data: string): string {
  // 纯 JavaScript 实现
  // ...
}

// Wasm 版 MD5
import { md5 } from './md5_wasm.js';

// 性能测试
const data = 'x'.repeat(1000000);

console.time('JS');
md5JS(data);
console.timeEnd('JS');  // ~500ms

console.time('Wasm');
md5(data);
console.timeEnd('Wasm');  // ~50ms（10倍提升）
```

### 注意事项

| 注意点 | 说明 |
|--------|------|
| 首次加载 | Wasm 文件较大，需要压缩和缓存 |
| 内存管理 | Wasm 内存需要手动管理 |
| 类型转换 | JS 和 Wasm 之间需要类型转换 |
| 调试困难 | 调试体验不如 JS |
| 适用场景 | 计算密集型任务，不是所有场景都适合 |

---

## 20. 如果让你设计一个支持 AI 生成内容的营销小游戏，你会如何设计技术架构？

## 答案

### 需求分析

**智能营销/AI 小游戏特点：**
- **高并发**：营销活动期间流量激增（10万+并发）
- **实时性**：AI 交互需要低延迟响应（< 500ms）
- **多端适配**：H5、小程序、App
- **AI 集成**：智能推荐、生成式内容、NLP 交互
- **数据驱动**：A/B 测试、用户行为分析

### 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                     用户端 (User)                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  H5     │  │  小程序  │  │  App    │  │  PC     │   │
│  │(Phaser) │  │(微信API)│  │(RN/Flutter)│ │(Web)   │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   网关层 (Gateway)                       │
│  • CDN 静态资源分发                                      │
│  • WAF 安全防护                                          │
│  • 负载均衡 + 限流                                        │
│  • A/B Testing                                           │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   游戏服务   │     │   AI 服务   │     │   数据服务  │
│  (Node.js)  │     │  (Python/   │     │  (ClickHouse│
│  • 游戏逻辑  │     │   Go)       │     │   /ES)     │
│  • 状态同步  │     │  • LLM API  │     │  • 行为分析 │
│  • 排行榜   │     │  • 内容生成 │     │  • 实时监控 │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 核心模块设计

**1. 游戏引擎层**

```typescript
// 游戏引擎封装
class AIGameEngine {
  private scene: Phaser.Scene;
  private aiService: AIService;
  
  constructor(config: GameConfig) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 750,
      height: 1334,
      scene: [BootScene, MenuScene, GameScene]
    });
    
    this.aiService = new AIService(config.aiEndpoint);
  }
  
  // AI 生成关卡
  async generateLevel(difficulty: number): Promise<LevelData> {
    const prompt = `生成一个难度为 ${difficulty} 的消除游戏关卡`;
    return this.aiService.generate('level', prompt);
  }
  
  // AI 生成道具描述
  async generateItemDescription(itemType: string): Promise<string> {
    return this.aiService.generate('text', 
      `为 ${itemType} 道具生成一个有趣的描述，10字以内`
    );
  }
  
  // AI 智能提示
  async getHint(currentState: GameState): Promise<Hint> {
    return this.aiService.analyze('hint', currentState);
  }
}
```

**2. AI 服务层**

```typescript
class AIService {
  // 分层模型策略
  async generate(type: string, prompt: string): Promise<any> {
    // 简单任务用轻量模型
    if (this.isSimpleTask(type)) {
      return this.callLightModel(prompt);
    }
    
    // 复杂任务用强模型
    return this.callLLM(prompt);
  }
  
  // 流式生成（实时显示）
  async *streamGenerate(prompt: string): AsyncGenerator<string> {
    const stream = await this.llm.stream(prompt);
    
    for await (const chunk of stream) {
      yield chunk.content;
    }
  }
  
  // 缓存策略
  private async getCachedOrGenerate(key: string, prompt: string) {
    // 检查缓存
    const cached = await redis.get(`ai:${key}`);
    if (cached) return JSON.parse(cached);
    
    // 生成并缓存
    const result = await this.generateContent(prompt);
    await redis.setex(`ai:${key}`, 3600, JSON.stringify(result));
    
    return result;
  }
}
```

**3. 实时通信层**

```typescript
// WebSocket 管理
class GameWebSocket {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  
  connect() {
    this.ws = new WebSocket('wss://game.example.com/ws');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }
  
  // 实时对战
  sendMove(move: Move) {
    this.send({ type: 'move', data: move });
  }
  
  // AI 对战
  async playWithAI(level: number) {
    const ai = new GameAI(level);
    
    while (!this.game.isOver()) {
      const state = this.game.getState();
      const move = await ai.getMove(state);
      this.game.applyMove(move);
      
      // 发送给服务器验证
      this.sendMove(move);
    }
  }
}
```

### 性能优化策略

**1. 资源加载**

```javascript
// 分级加载策略
const assetLoadConfig = {
  critical: ['bgm', 'ui-sprites'],      // 首屏必需
  level1: ['game-sprites', 'effects'],   // 游戏核心
  level2: ['extra-sounds', 'animations'] // 后续关卡
};

// 预加载下一关资源
preloadNextLevel(currentLevel + 1);
```

**2. AI 响应优化**

```javascript
// 边缘缓存 + 预生成
const aiContentCache = {
  // 预生成常见内容
  async pregenerateCommonContent() {
    const templates = [
      '欢迎语',
      '通关祝贺',
      '道具描述'
    ];
    
    for (const template of templates) {
      const variations = await this.ai.generateVariations(template, 10);
      await this.cache.set(`template:${template}`, variations);
    }
  }
};
```

**3. 监控与数据分析**

```typescript
// 游戏事件追踪
class GameAnalytics {
  track(event: string, params: any) {
    // 批量上报
    this.buffer.push({ event, params, timestamp: Date.now() });
    
    if (this.buffer.length >= 10) {
      this.flush();
    }
  }
  
  // 关键指标
  trackMetrics() {
    return {
      fps: this.getFPS(),
      aiResponseTime: this.getAIResponseTime(),
      userEngagement: this.getEngagement()
    };
  }
}
```

### 技术选型

| 模块 | 技术 | 理由 |
|------|------|------|
| 游戏引擎 | Phaser 3 | 成熟、性能好、文档完善 |
| 前端框架 | React 18 | 组件化、生态丰富 |
| 状态管理 | Zustand | 轻量、适合游戏状态 |
| AI 服务 | Python + FastAPI | AI 生态好、开发快 |
| 实时通信 | WebSocket + Protobuf | 低延迟、二进制高效 |
| 数据库 | Redis + PostgreSQL | 缓存 + 持久化 |
| 部署 | Docker + K8s | 弹性扩缩容 |

---

*面试题生成完毕 | 版本B：AI工程化/小游戏方向 + 前端八股文 + 算法编程*
