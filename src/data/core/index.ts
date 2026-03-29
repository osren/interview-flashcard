import { javascriptCards, javascriptChapter } from './javascript';
import { typescriptCards, typescriptChapter } from './typescript';
import { reactCoreCards, reactCoreChapter } from './react-core';
import { Chapter, FlashCard } from '@/types';

// 其他章节的占位数据
const browserCards: FlashCard[] = [
  {
    id: 'browser-render-001',
    module: 'core',
    chapterId: 'browser',
    category: '渲染机制',
    question: '浏览器渲染流程是什么？',
    answer: `## 完整渲染流水线

\`DOM Tree → CSSOM Tree → Render Tree → Layout → Paint → Composite\`

## 各阶段说明

| 阶段 | 职责 |
|------|------|
| **DOM Tree** | 解析 HTML |
| **CSSOM Tree** | 解析 CSS |
| **Render Tree** | DOM + CSSOM 合并 |
| **Layout** | 计算几何信息 |
| **Paint** | 绘制像素 |
| **Composite** | 合成图层 |`,
    tags: ['浏览器', '渲染', '重排', '重绘'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-reflow-repaint-001',
    module: 'core',
    chapterId: 'browser',
    category: '重排重绘',
    question: '什么是重排（Reflow）和重绘（Repaint）？它们的性能影响有什么区别？',
    answer: `## 重排（Reflow/Layout）

- **几何属性**变化时触发
- 涉及计算元素**位置和尺寸**
- 代价**最高**，可能影响整棵布局树

## 重绘（Repaint）

- **外观**变化但不影响布局
- 只需**重新绘制**元素
- 不需要计算几何信息

## 性能影响

**重排 > 重绘**

> 重排**一定**触发重绘，重绘**不一定**重排`,
    tags: ['浏览器', '重排', '重绘'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-reflow-trigger-001',
    module: 'core',
    chapterId: 'browser',
    category: '重排重绘',
    question: '哪些 CSS 属性会触发重排？哪些只触发重绘？',
    answer: `## 触发重排的属性

| 类型 | 属性 |
|------|------|
| **位置、尺寸** | width, height, margin, padding, top, left, bottom, right |
| **边框** | border-width |
| **字体** | font-size |
| **显示隐藏** | display |

## 触发重绘的属性（不触发重排）

| 类型 | 属性 |
|------|------|
| **颜色** | color, background, background-image |
| **边框样式** | border-style, outline |
| **其他** | visibility, 文字装饰 |

## 优化建议

- **批量读写 DOM**（读操作集中，写操作集中）
- 使用 **transform/opacity** 做动画（只触发合成）`,
    tags: ['浏览器', '重排', '重绘', '优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-composite-001',
    module: 'core',
    chapterId: 'browser',
    category: '合成层',
    question: '什么是合成层（Compositing Layer）？为什么 transform/opacity 能优化动画？',
    answer: `## 合成层

- **GPU 加速**的独立图层
- **不影响**其他图层
- 单独栅格化并合成

## 为什么 transform/opacity 更快？

| 原因 | 说明 |
|------|------|
| **不触发** | 重排或重绘 |
| **线程** | 在合成线程执行 |
| **主线程** | 不占用 |
| **GPU** | 直接操作 |

## 提升为合成层的方式

- transform: translateZ(0)
- will-change: transform
- position: fixed
- video、canvas 元素`,
    tags: ['浏览器', '合成层', 'GPU加速'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'browser-event-loop-001',
    module: 'core',
    chapterId: 'browser',
    category: '事件循环',
    question: '浏览器的事件循环和 JavaScript 的事件循环是什么关系？',
    answer: `## 浏览器事件循环组成

- **JS 引擎（V8）**：执行 JS 代码
- **事件触发线程**：处理 DOM 事件
- **定时器线程**：setTimeout/setInterval
- **微任务队列**（Promise）
- **宏任务队列**（setTimeout/UI渲染）

## 执行顺序

1. 执行**同步代码**
2. 清空**微任务**队列
3. 执行**宏任务**
4. **渲染**（如有必要）
5. 重复`,
    tags: ['浏览器', '事件循环', '宏任务', '微任务'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-event-delegation-001',
    module: 'core',
    chapterId: 'browser',
    category: '事件机制',
    question: '什么是事件委托（Event Delegation）？它有什么性能优势？',
    answer: `事件委托：
• 在父元素绑定事件
• 利用冒泡机制处理子元素事件
• 通过 event.target 判断具体元素

性能优势：
• 减少事件处理器数量
• 减少内存占用
• 动态元素自动获得事件处理
• 适合大量相似元素的场景`,
    tags: ['浏览器', '事件委托'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// 不用事件委托：每个 item 绑定事件
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// 使用事件委托
list.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e.target);
  }
});

// 动态列表自动获得事件
// 新增 .item 也无需手动绑定`,
  },
  {
    id: 'browser-event-phase-001',
    module: 'core',
    chapterId: 'browser',
    category: '事件机制',
    question: 'DOM 事件有三个阶段：捕获、目标、冒泡。它们的执行顺序是什么？',
    answer: `三个阶段顺序：
1. 捕获阶段：window → document → html → body → ... → 目标元素
2. 目标阶段：事件到达目标元素
3. 冒泡阶段：目标元素 → ... → body → html → document → window

addEventListener 第三个参数：
• true：捕获阶段处理
• false（默认）：冒泡阶段处理

阻止传播：
• stopPropagation()：阻止后续传播
• stopImmediatePropagation()：阻止后续传播且阻止同事件其他处理器`,
    tags: ['浏览器', '事件', '捕获', '冒泡'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `<div id="outer">
  <div id="inner">Click me</div>
</div>

// 绑定顺序影响执行顺序
inner.addEventListener('click', () => console.log('inner-bubble'), false);
outer.addEventListener('click', () => console.log('outer-bubble'), false);

// inner (target) → outer (bubble)
// 输出: inner-bubble, outer-bubble`,
  },
  {
    id: 'browser-cache-001',
    module: 'core',
    chapterId: 'browser',
    category: '缓存',
    question: '浏览器缓存策略有哪些？Service Worker 的作用是什么？',
    answer: `缓存策略：
1. Memory Cache：内存缓存，快速但进程关闭即消失
2. Disk Cache：磁盘缓存，持久但读取慢
3. Service Worker：可编程的缓存控制
4. Push Cache：HTTP/2 服务端推送缓存

Service Worker 作用：
• 拦截网络请求
• 实现离线缓存
• 推送通知
• 后台同步`,
    tags: ['浏览器', '缓存', 'ServiceWorker'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-http-cache-001',
    module: 'core',
    chapterId: 'browser',
    category: 'HTTP缓存',
    question: 'HTTP 缓存的 Last-Modified 和 ETag 有什么区别？',
    answer: `## Last-Modified vs ETag

| 特性 | Last-Modified | ETag |
|------|---------------|------|
| **判断依据** | 基于时间 | 基于内容哈希 |
| **精度** | 秒级 | 精确匹配 |
| **问题** | 可能被修改但内容未变 | - |
| **优先级** | 较低 | 较高 |

### 响应头

- **Last-Modified**：If-Modified-Since / Last-Modified
- **ETag**：If-None-Match / ETag

### 最佳实践

- **静态资源**用 ETag（内容稳定）
- **频繁变化**资源用 Cache-Control`,
    tags: ['浏览器', 'HTTP缓存'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-dns-001',
    module: 'core',
    chapterId: 'browser',
    category: 'DNS',
    question: 'DNS 预解析（dns-prefetch）和预连接（preconnect）有什么区别？',
    answer: `dns-prefetch：
• 预解析域名对应的 IP
• 只处理 DNS，不建立连接
• <link rel="dns-prefetch" href="//example.com">

preconnect：
• DNS + TCP + TLS（三次握手）
• 完整建立连接
• <link rel="preconnect" href="https://example.com">

使用建议：
• 确定要用的跨域资源用 preconnect
• 不确定是否用，用 dns-prefetch
• 两者结合使用`,
    tags: ['浏览器', 'DNS', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-v8-gc-001',
    module: 'core',
    chapterId: 'browser',
    category: '垃圾回收',
    question: 'V8 引擎的垃圾回收机制是什么？什么是分代回收？',
    answer: `## V8 分代回收

### 新生代（Young Generation）

- 对象**存活时间短**
- **Scavenge** 算法
- From Space / To Space 互换
- 存活对象**晋升**老生代

### 老生代（Old Generation）

- 对象**存活时间长**
- **Mark-Sweep + Mark-Compact**
- 增量标记避免长时间停顿
- **大对象直接分配**到老生代

### 内存分配策略

- 新对象在**新生代**
- 多次 GC 后仍存活 → **晋升**老生代
- 大对象**直接老生代**`,
    tags: ['浏览器', 'V8', '垃圾回收'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'browser-memory-leak-001',
    module: 'core',
    chapterId: 'browser',
    category: '内存',
    question: '如何发现和排查 JavaScript 内存泄漏？',
    answer: `发现内存泄漏：
1. Performance Monitor 观察内存曲线
2. Memory Timeline 录制快照对比
3. 查看堆内存是否持续增长

常见泄漏场景：
• 全局变量（未声明变量）
• 闭包引用大量对象
• 定时器/回调未清理
• 事件监听未移除
• DOM 引用未清除

排查工具：
• Chrome DevTools Memory
• Performance 面板
• Heap Snapshot 对比`,
    tags: ['浏览器', '内存泄漏'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'browser-render-blocking-001',
    module: 'core',
    chapterId: 'browser',
    category: '渲染优化',
    question: '什么是渲染阻塞资源？如何优化？',
    answer: `渲染阻塞资源：
• HTML 解析被 CSS/JS 阻塞
• CSS 是渲染阻塞资源（必须先完成）
• JS 会阻塞 HTML 解析

优化策略：
1. CSS 放 head，优先加载
2. JS 放 body 末尾或 async/defer
3. 关键 CSS 内联
4. 非关键 CSS 异步加载
5. 代码分割减少初始加载`,
    tags: ['浏览器', '渲染阻塞'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `<!-- 阻塞渲染 -->
<script src="app.js"></script>

<!-- 非阻塞：async（下载完立即执行）-->
<script async src="app.js"></script>

<!-- 非阻塞：defer（HTML 解析完执行）-->
<script defer src="app.js"></script>

<!-- 关键 CSS 内联 -->
<style>body { margin: 0; }</style>

<!-- 非关键 CSS 异步 -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
  },
  {
    id: 'browser-cors-001',
    module: 'core',
    chapterId: 'browser',
    category: '安全',
    question: '什么是 CORS？简单请求和预检请求有什么区别？',
    answer: `## CORS（跨域资源共享）

- **浏览器安全**机制
- 限制**跨域 AJAX** 请求
- 服务端需设置**允许头**

## 简单请求条件

- GET/HEAD/POST
- 特定 Content-Type
- 无自定义头

## 预检请求（Preflight）

- **非简单请求**先发 OPTIONS
- 询问服务器是否允许
- 实际请求通过后才发正式请求

### 常见响应头

- Access-Control-Allow-Origin
- Access-Control-Allow-Methods
- Access-Control-Allow-Credentials`,
    tags: ['浏览器', 'CORS', '跨域'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-xss-001',
    module: 'core',
    chapterId: 'browser',
    category: '安全',
    question: '什么是 XSS 攻击？前端如何防护？',
    answer: `## XSS（跨站脚本攻击）

- 向页面**注入恶意脚本**
- 窃取 **Cookie、Token**
- 篡改页面内容

## XSS 类型

| 类型 | 特点 |
|------|------|
| **存储型** | 恶意代码存在数据库 |
| **反射型** | URL 参数注入 |
| **DOM 型** | 前端代码漏洞 |

## 防护措施

- **输入过滤**
- **输出编码**（HTML 转义）
- **CSP**（Content Security Policy）
- **HttpOnly** Cookie`,
    tags: ['浏览器', 'XSS', '安全'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-csrf-001',
    module: 'core',
    chapterId: 'browser',
    category: '安全',
    question: '什么是 CSRF 攻击？和 XSS 有什么区别？',
    answer: `## CSRF（跨站请求伪造）

- 诱导用户访问**恶意页面**
- **自动携带用户 Cookie** 发请求
- 利用用户**已登录状态**

## XSS vs CSRF

| 区别 | XSS | CSRF |
|------|-----|------|
| **攻击方式** | 注入脚本执行 | 利用用户身份发请求 |
| **能力范围** | 窃取任意内容 | 只能发送特定请求 |

## 防护措施

- **Token 验证**
- **SameSite** Cookie
- **验证码**
- 验证 **Referer/Origin**`,
    tags: ['浏览器', 'CSRF', '安全'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-requestidlecallback-001',
    module: 'core',
    chapterId: 'browser',
    category: '性能',
    question: 'requestIdleCallback 和 requestAnimationFrame 有什么区别？',
    answer: `requestAnimationFrame：
• 每帧调用一次（约 16.67ms）
• 与屏幕刷新同步
• 适合动画和视觉更新
• 页面隐藏后暂停

requestIdleCallback：
• 浏览器空闲时调用
• 执行低优先级任务
• deadline.timeRemaining() 限制执行时间
• 后台任务、防腐化清理`,
    tags: ['浏览器', 'requestIdleCallback', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 动画用 requestAnimationFrame
function animate() {
  updateAnimation();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 后台任务用 requestIdleCallback
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() 返回剩余时间
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift());
  }
  if (tasks.length > 0) {
    requestIdleCallback(doWork);
  }
}, { timeout: 2000 }); // 超时时间`,
  },
  {
    id: 'browser-webworker-001',
    module: 'core',
    chapterId: 'browser',
    category: 'Web Worker',
    question: 'Web Worker 是什么？它和主线程如何通信？',
    answer: `Web Worker：
• 独立于主线程的后台线程
• 适合计算密集型任务
• 不阻塞 UI 渲染

通信方式：
• postMessage / onmessage
• MessageChannel（端口间通信）
• SharedWorker（多页面共享）

限制：
• 无法访问 DOM
• 无法访问 window/document
• 不能直接操作 UI
• 与主线程数据复制而非共享`,
    tags: ['浏览器', 'Web Worker'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// main.js
const worker = new Worker('worker.js');
worker.postMessage({ type: 'CALC', data: [1, 2, 3] });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = e.data.data.reduce((a, b) => a + b, 0);
  self.postMessage(result);
};`,
  },
  {
    id: 'browser-throttle-debounce-001',
    module: 'core',
    chapterId: 'browser',
    category: '性能优化',
    question: '防抖（Debounce）和节流（Throttle）有什么区别？分别在什么场景使用？',
    answer: `防抖（Debounce）：
• 事件触发 n 秒后执行
• n 秒内再次触发则重新计时
• 适合：搜索输入、窗口 resize

节流（Throttle）：
• 事件触发后 n 秒内只执行一次
• 适合：滚动事件、按钮点击

选择：
• 防抖：等用户停止操作后执行
• 节流：保证一定频率执行`,
    tags: ['浏览器', '防抖', '节流'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// 防抖：用户停止输入后搜索
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流：滚动时保持更新
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`,
  },
  {
    id: 'browser-bfcache-001',
    module: 'core',
    chapterId: 'browser',
    category: '缓存',
    question: '什么是浏览器的 bfcache（后退缓存）？它对前端有什么影响？',
    answer: `bfcache：
• 浏览器将整个页面快照存入内存
• 用户点击后退时快速恢复
• iOS Safari 特别常用

前端影响：
• 页面进入 bfcache 时不触发 unload
• 离开时执行的逻辑可能不运行
• 需要用 pagehide 代替 unload
• 定时器在 bfcache 期间暂停

注意事项：
• 避免使用 unload 事件
• 使用 pagehide 清理资源
• 检查 document.visibilityState`,
    tags: ['浏览器', 'bfcache'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-resource-priorities-001',
    module: 'core',
    chapterId: 'browser',
    category: '资源加载',
    question: '浏览器如何决定资源加载优先级？preload 和 prefetch 有什么区别？',
    answer: `资源加载优先级：
• Highest：CSS、字体、预渲染
• High：脚本（立即需要）
• Medium：图片
• Low：异步脚本
• Lowest：prefetch

preload vs prefetch：

preload：
• 预加载当前导航需要的资源
• 立即加载
• <link rel="preload">

prefetch：
• 预获取未来导航可能需要的资源
• 空闲时加载
• <link rel="prefetch">

dns-prefetch：
• DNS 预解析
• 提前解析域名`,
    tags: ['浏览器', 'preload', 'prefetch'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-async-defer-001',
    module: 'core',
    chapterId: 'browser',
    category: '脚本加载',
    question: 'script 标签的 async 和 defer 属性有什么区别？',
    answer: `async 和 defer 区别：

无属性：
• HTML 解析暂停
• 脚本获取并执行
• HTML 继续解析

defer：
• HTML 解析继续
• 脚本并行下载
• HTML 解析完成后执行
• 保持相对顺序

async：
• HTML 解析继续
• 脚本下载完立即执行
• 不保持相对顺序`,
    tags: ['浏览器', 'script', 'async', 'defer'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `<!-- 无属性 -->
<script src="a.js"></script>  <!-- 阻塞 HTML 解析 -->
<script src="b.js"></script>  <!-- 等待 a.js 执行 -->

<!-- defer：保持顺序，HTML 解析完执行 -->
<script defer src="a.js"></script>
<script defer src="b.js"></script>

<!-- async：下载完立即执行，不保证顺序 -->
<script async src="a.js"></script>
<script async src="b.js"></script>`,
  },
  {
    id: 'browser-visibility-api-001',
    module: 'core',
    chapterId: 'browser',
    category: 'Page Visibility',
    question: 'Page Visibility API 是什么？有什么应用场景？',
    answer: `Page Visibility API：
• 检测页面是否可见
• document.visibilityState
• visibilitychange 事件

visibilityState 值：
• visible：页面可见
• hidden：页面不可见
• prerender：预渲染（很少见）

应用场景：
• 页面隐藏时暂停视频/音频
• 暂停轮询，页面可见时恢复
• 页面不可见时不发送分析数据
• 暂停消耗资源的任务`,
    tags: ['浏览器', 'Visibility API'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 检测页面可见性
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // 页面可见，恢复轮询
    startPolling();
    // 恢复动画
    resumeAnimation();
  } else {
    // 页面不可见，暂停
    stopPolling();
    // 暂停动画
    pauseAnimation();
  }
});

// 主动检测当前状态
if (document.visibilityState === 'hidden') {
  // 页面当前不可见
}`,
  },
  {
    id: 'browser-interaction-observer-001',
    module: 'core',
    chapterId: 'browser',
    category: 'IntersectionObserver',
    question: 'IntersectionObserver 是什么？相比 scroll 事件有什么优势？',
    answer: `IntersectionObserver：
• 异步观察元素与视口交叉状态
• 不依赖主线程 scroll 事件
• 性能更好

相比 scroll 事件优势：
• scroll 频繁触发，造成性能问题
• IntersectionObserver 回调更少
• 可观察多个元素
• 不卡顿

应用场景：
• 图片懒加载
• 无限滚动
• 广告曝光统计
• 动画触发`,
    tags: ['浏览器', 'IntersectionObserver'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 图片懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, { rootMargin: '0px 0px 200px 0px' }); // 提前 200px 加载

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});`,
  },
  {
    id: 'browser-mutationobserver-001',
    module: 'core',
    chapterId: 'browser',
    category: 'MutationObserver',
    question: 'MutationObserver 是什么？有什么使用场景？',
    answer: `MutationObserver：
• 监听 DOM 树变化
• 替代废弃的 Mutation Events
• 异步回调，批量处理

观察选项：
• childList：子元素变化
• attributes：属性变化
• characterData：文本变化
• subtree：观察后代

使用场景：
• 动态内容监控
• 表单验证
• 内容修改通知
• 替代轮询检测 DOM 变化`,
    tags: ['浏览器', 'MutationObserver'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          console.log('Added:', node.tagName);
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 断开观察
observer.disconnect();`,
  },
  {
    id: 'browser-resize-observer-001',
    module: 'core',
    chapterId: 'browser',
    category: 'ResizeObserver',
    question: 'ResizeObserver 是什么？有什么使用场景？',
    answer: `ResizeObserver：
• 监听元素尺寸变化
• 替代 scroll + resize 监听
• 更高效的尺寸检测

使用场景：
• 响应式容器尺寸
• 图表自适应
• 模态框定位
• 懒加载触发

特点：
• 异步回调（microtask）
• 尺寸变化时触发
• 可观察多个元素`,
    tags: ['浏览器', 'ResizeObserver'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-performancemark-001',
    module: 'core',
    chapterId: 'browser',
    category: 'Performance API',
    question: 'Performance API 提供了哪些功能？',
    answer: `Performance API：

1. 页面计时：
   • performance.timing
   • DNS、TCP、DOM 等时间点

2. 性能标记：
   • performance.mark()
   • performance.measure()

3. 性能指标：
   • performance.now()
   • 高精度时间

4. 资源计时：
   • performance.getEntries()
   • Resource Timing API

5. 导航计时：
   • PerformanceNavigationTiming
   • navigation.type`,
    tags: ['浏览器', 'Performance API'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'browser-cookie-001',
    module: 'core',
    chapterId: 'browser',
    category: 'Cookie',
    question: 'Cookie 和 Web Storage（localStorage/sessionStorage）有什么区别？',
    answer: `Cookie vs Web Storage：

Cookie：
• 大小限制 4KB
• 随请求发送到服务器
• 可设置过期时间
• 支持 Secure/HttpOnly

localStorage：
• 大小 5-10MB
• 仅客户端存储
• 持久存储
• 同步 API

sessionStorage：
• 大小 5-10MB
• 仅当前会话
• 标签页关闭清除

选择：
• 需要发送到服务端 → Cookie
• 纯客户端 → Web Storage`,
    tags: ['浏览器', 'Cookie', 'localStorage'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'browser-serviceworker-cache-001',
    module: 'core',
    chapterId: 'browser',
    category: 'Service Worker',
    question: 'Service Worker 的生命周期是什么？',
    answer: `Service Worker 生命周期：

1. install：
   • 安装事件
   • 缓存静态资源
   • 失败则不激活

2. activate：
   • 激活事件
   • 清理旧缓存
   • 成为控制页面的 worker

3. fetch：
   • 拦截请求
   • 缓存优先/网络优先
   • 返回缓存或新资源

更新流程：
1. 新 SW 下载
2. install 新 SW
3. 等待旧 SW 释放
4. activate 新 SW`,
    tags: ['浏览器', 'ServiceWorker'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'browser-indexeddb-001',
    module: 'core',
    chapterId: 'browser',
    category: 'IndexedDB',
    question: 'IndexedDB 是什么？它和 localStorage 有什么区别？',
    answer: `IndexedDB：
• 浏览器本地数据库
• 存储大量结构化数据
• 支持索引查询
• 异步 API

localStorage vs IndexedDB：

localStorage：
• 键值对存储
• 同步 API
• 容量小（5-10MB）
• 简单场景

IndexedDB：
• 数据库
• 异步 API
• 容量大（无限制）
• 复杂查询
• 事务支持

适用场景：
• 离线应用
• 大量数据存储
• 复杂查询`,
    tags: ['浏览器', 'IndexedDB'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

const browserChapter: Chapter = {
  id: 'browser',
  module: 'core',
  title: '浏览器渲染与网络',
  description: '渲染流水线、重排重绘、HTTP缓存、DNS预解析',
  cardCount: browserCards.length,
  icon: '🌐',
};

const performanceCards: FlashCard[] = [
  {
    id: 'perf-core-vitals-001',
    module: 'core',
    chapterId: 'performance',
    category: '性能指标',
    question: 'Core Web Vitals 三大指标是什么？',
    answer: `## Core Web Vitals 三大指标

| 指标 | 含义 | 目标 |
|------|------|------|
| **LCP** | Largest Contentful Paint（加载性能） | < 2.5s |
| **FID** | First Input Delay（交互响应） | < 100ms |
| **CLS** | Cumulative Layout Shift（视觉稳定性） | < 0.1 |`,
    tags: ['性能', 'LCP', 'FID', 'CLS'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'perf-fcp-001',
    module: 'core',
    chapterId: 'performance',
    category: '加载性能',
    question: '如何优化 First Contentful Paint (FCP)？',
    answer: `FCP 优化策略：
1. 优化服务器响应时间
2. 消除阻塞渲染的资源
3. 内联关键 CSS
4. 压缩 CSS/JS
5. 使用 CDN
6. 缓存策略
7. 预连接关键资源`,
    tags: ['性能', 'FCP', '优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-lcp-001',
    module: 'core',
    chapterId: 'performance',
    category: '加载性能',
    question: '如何优化 Largest Contentful Paint (LCP)？',
    answer: `LCP 优化策略：
1. 优化图片（格式、压缩、尺寸）
2. 使用 CDN
3. 预加载关键图片
4. 消除阻塞资源
5. 服务器端渲染
6. 使用缓存
7. 减少 JS 包体积`,
    tags: ['性能', 'LCP', '图片优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-cls-001',
    module: 'core',
    chapterId: 'performance',
    category: '视觉稳定性',
    question: '如何优化 Cumulative Layout Shift (CLS)？',
    answer: `CLS 优化策略：
1. 为图片/视频设置尺寸
2. 避免动态插入内容
3. 使用 transform 而非动画位置
4. font-display: optional/swap
5. 为广告预留位置
6. skeleton 占位`,
    tags: ['性能', 'CLS'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-longtask-001',
    module: 'core',
    chapterId: 'performance',
    category: '长任务',
    question: '什么是 Long Task？如何优化长任务？',
    answer: `Long Task：
• 阻塞主线程 > 50ms 的任务
• 影响交互响应
• 导致页面卡顿

优化策略：
1. 代码分割
2. Web Worker 处理计算
3. requestIdleCallback 分解任务
4. 虚拟滚动
5. 防抖节流
6. 懒加载非关键模块`,
    tags: ['性能', '长任务', '优化'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'perf-virtual-list-001',
    module: 'core',
    chapterId: 'performance',
    category: '列表优化',
    question: '虚拟列表的原理是什么？有哪些实现方式？',
    answer: `虚拟列表原理：
• 只渲染可视区域元素
• 滚动时动态计算可见范围
• 动态替换渲染内容

实现方式：
1. 固定高度：简单高效
2. 动态高度：需测量每项高度
3. 窗口化库：react-window、react-virtualized

核心指标：
• 可视区域 + 缓冲区
• 滚动位置计算
• 动态替换`,
    tags: ['虚拟列表', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'perf-image-001',
    module: 'core',
    chapterId: 'performance',
    category: '图片优化',
    question: '图片优化有哪些策略？',
    answer: `图片优化策略：

1. 格式选择：
   • WebP/AVIF > JPEG/PNG
   • SVG 用于图标

2. 响应式图片：
   • srcset 属性
   • picture 元素

3. 懒加载：
   • loading="lazy"
   • IntersectionObserver

4. 预加载：
   • preload 关键图片
   • fetchpriority 高优先级

5. CDN + 缓存`,
    tags: ['图片优化', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-bundle-001',
    module: 'core',
    chapterId: 'performance',
    category: '打包优化',
    question: '如何减少 JavaScript 包体积？',
    answer: `减少包体积策略：

1. Tree Shaking
   • ESM 格式
   • 删除死代码

2. 代码分割
   • 动态 import
   • 路由分割

3. 依赖优化
   • 按需导入
   • 替换大依赖

4. 压缩
   • Terser
   • gzip/brotli

5. 分析工具
   • webpack-bundle-analyzer
   • rollup-plugin-visualizer`,
    tags: ['打包优化', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-cache-001',
    module: 'core',
    chapterId: 'performance',
    category: '缓存策略',
    question: '前端缓存策略有哪些？如何选择？',
    answer: `缓存策略：

1. 强缓存：
   • Cache-Control
   • Expires

2. 协商缓存：
   • Last-Modified / ETag
   • 304 响应

3. Service Worker：
   • 离线缓存
   • 自定义策略

4. 内存缓存：
   • Memory Cache
   • 进程关闭消失

选择原则：
• HTML：协商缓存
• 静态资源：强缓存 + hash
• API：协商缓存或 no-cache`,
    tags: ['缓存', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-webpack-001',
    module: 'core',
    chapterId: 'performance',
    category: 'Webpack优化',
    question: 'Webpack 构建速度优化有哪些方法？',
    answer: `Webpack 构建优化：

1. 缓存：
   • babel-loader 缓存
   • cache-loader
   • hard-source-webpack-plugin

2. 并行：
   • thread-loader
   • parallel-webpack

3. 外部扩展：
   • externals
   • DllPlugin

4. 解析优化：
   • modules: false
   • symlinks: false

5. 监控：
   • speed-measure-webpack-plugin`,
    tags: ['Webpack', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'perf-react-001',
    module: 'core',
    chapterId: 'performance',
    category: 'React优化',
    question: 'React 性能优化有哪些方法？',
    answer: `React 性能优化：

1. 减少渲染：
   • React.memo
   • useMemo / useCallback
   • 组件拆分

2. 状态优化：
   • 状态位置合理
   • 减少派生状态
   • 不可变数据

3. 列表优化：
   • key 稳定唯一
   • 虚拟列表

4. 懒加载：
   • React.lazy
   • Suspense

5. 事件：
   • 节流防抖
   • 事件委托`,
    tags: ['React', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-critical-render-001',
    module: 'core',
    chapterId: 'performance',
    category: '渲染优化',
    question: '什么是关键渲染路径？如何优化？',
    answer: `关键渲染路径：
• 浏览器渲染页面的步骤
• 从 HTML 到像素的流程
• 影响首屏时间

优化关键路径：

1. 减少关键资源数量
   • CSS/JS 最小化
   • 异步加载

2. 减少关键路径长度
   • 内联关键 CSS
   • 预加载

3. 减少下载字节
   • 压缩
   • Tree Shaking`,
    tags: ['关键渲染路径', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'perf-preload-001',
    module: 'core',
    chapterId: 'performance',
    category: '预加载',
    question: 'preload、prefetch、prefetch 如何选择使用？',
    answer: `预加载策略：

preload：
• 当前页面必需
• 立即加载
• <link rel="preload">

prefetch：
• 下个导航可能需要
• 空闲时加载
• <link rel="prefetch">

dns-prefetch：
• DNS 解析
• 提前建立连接

选择：
• 首屏资源 → preload
• 下页资源 → prefetch
• 跨域资源 → dns-prefetch + preconnect`,
    tags: ['预加载', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-webpack-bundle-001',
    module: 'core',
    chapterId: 'performance',
    category: '代码分割',
    question: '代码分割的策略有哪些？',
    answer: `代码分割策略：

1. 路由分割：
   • 按页面分割
   • React.lazy + Suspense

2. 组件分割：
   • 大组件单独打包
   • 第三方库分离

3. 公共分割：
   • 提取公共依赖
   • splitChunks 配置

4. 动态导入：
   • import() 语法
   • 按需加载

5. CSS 分割：
   • MiniCssExtractPlugin`,
    tags: ['代码分割', 'Webpack'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-gzip-001',
    module: 'core',
    chapterId: 'performance',
    category: '压缩',
    question: 'gzip 和 brotli 压缩有什么区别？',
    answer: `gzip vs brotli：

gzip：
• 压缩率约 70%
• 所有浏览器支持
• 服务器配置简单

brotli：
• 压缩率约 80%
• 性能更好
• 现代浏览器支持
• 更优的压缩比

选择建议：
• 静态资源用 brotli
• 兼容性考虑可同时配置
• CDN 层压缩最佳`,
    tags: ['压缩', 'gzip'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'perf-font-001',
    module: 'core',
    chapterId: 'performance',
    category: '字体优化',
    question: '字体加载如何优化？font-display 有什么作用？',
    answer: `字体优化：

1. font-display：
   • block：等待（FOIT）
   • swap：显示后备（FOUT）
   • optional：可选择不显示
   • fallback：折中方案

2. 字体子集：
   • 只加载需要的字符
   • unicode-range

3. 预加载：
   <link rel="preload" as="font">

4. 格式：
   • WOFF2 > WOFF > TTF
   • 优先使用 WOFF2`,
    tags: ['字体', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-cdn-001',
    module: 'core',
    chapterId: 'performance',
    category: 'CDN',
    question: 'CDN 的工作原理是什么？它如何提升性能？',
    answer: `CDN 工作原理：
• 用户请求 → CDN 边缘节点
• 边缘节点无资源 → 回源获取
• 缓存到边缘节点
• 返回给用户

CDN 优势：
• 就近访问，降低延迟
• 减轻源站压力
• 抗 DDoS
• 节省带宽
• 自动缓存`,
    tags: ['CDN', '性能'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'perf-http2-001',
    module: 'core',
    chapterId: 'performance',
    category: 'HTTP/2',
    question: 'HTTP/2 相比 HTTP/1.1 有什么性能提升？',
    answer: `HTTP/2 性能提升：

1. 多路复用：
   • 一个 TCP 连接
   • 并行请求
   • 解决队头阻塞

2. 二进制分帧：
   • 新的编码机制
   • 更高效的传输

3. 首部压缩：
   • HPACK 算法
   • 减少重复传输

4. 服务端推送：
   • 主动推送资源
   • 减少请求数`,
    tags: ['HTTP/2', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-monitoring-001',
    module: 'core',
    chapterId: 'performance',
    category: '监控',
    question: '前端性能监控有哪些指标和方法？',
    answer: `性能监控指标：

1. 加载指标：
   • FP / FCP / LCP
   • TTFB / TTDI

2. 交互指标：
   • FID / INP
   • 长任务

3. 稳定性：
   • CLS
   • 错误率

监控方法：
• Performance API
• PerformanceObserver
• PerformanceNavigationTiming
• 自定义上报`,
    tags: ['性能监控'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-lazy-001',
    module: 'core',
    chapterId: 'performance',
    category: '懒加载',
    question: 'React 中的懒加载如何实现？',
    answer: `React 懒加载实现：

1. React.lazy：
   const LazyComponent = React.lazy(() => import('./Component'));

2. Suspense：
   <Suspense fallback={<Loading />}>
     <LazyComponent />
   </Suspense>

3. 路由级懒加载：
   <Routes>
     <Route path="/" element={<LazyComponent />} />
   </Routes>

4. 图片懒加载：
   <img loading="lazy" />`,
    tags: ['懒加载', 'React'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'perf-tree-shaking-001',
    module: 'core',
    chapterId: 'performance',
    category: 'Tree Shaking',
    question: 'Tree Shaking 的原理是什么？它能删除哪些代码？',
    answer: `Tree Shaking 原理：
• 基于 ES Module 静态分析
• 标记未使用的导出
• terser 等压缩工具删除

能删除的代码：
• 未被使用的 export
• 条件为常量的 if 分支
• 不可达代码

不能删除的：
• 副作用代码
• CommonJS 模块
• eval 中的代码

优化条件：
• ES Module
• sideEffects 配置正确`,
    tags: ['TreeShaking', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'perf-memo-001',
    module: 'core',
    chapterId: 'performance',
    category: 'React优化',
    question: 'React.memo 和 useMemo 有什么区别？',
    answer: `React.memo：
• 高阶组件
• 缓存组件渲染结果
• props 没变化不重渲染

useMemo：
• Hook
• 缓存计算值
• 依赖变化时重新计算

useCallback：
• Hook
• 缓存函数引用
• 配合 React.memo 使用`,
    tags: ['React', 'memo'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-ssr-001',
    module: 'core',
    chapterId: 'performance',
    category: 'SSR',
    question: 'SSR 和 CSR 有什么区别？各有什么优缺点？',
    answer: `## SSR（服务端渲染）

| 优点 | 缺点 |
|------|------|
| 首屏快 | 服务器压力大 |
| SEO 友好 | 开发复杂度高 |
| 内容可预取 | 数据获取时机 |

## CSR（客户端渲染）

| 优点 | 缺点 |
|------|------|
| 前后端分离 | 首屏慢 |
| 交互丰富 | SEO 不友好 |
| 减少服务器负载 | 白屏问题 |`,
    tags: ['SSR', 'CSR'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-ssg-001',
    module: 'core',
    chapterId: 'performance',
    category: 'SSG',
    question: '什么是 SSG（静态站点生成）？它和 SSR 有什么区别？',
    answer: `SSG：
• 编译时生成静态 HTML
• 内容固定不变时最优
• 构建时间 = 页面数 × 构建时间

SSG vs SSR：

SSG：
• 构建时生成
• 内容不变
• 极快加载
• 成本低

SSR：
• 运行时生成
• 内容动态
• 首屏快
• 成本高`,
    tags: ['SSG', 'SSR'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-tti-001',
    module: 'core',
    chapterId: 'performance',
    category: '性能指标',
    question: '什么是 TTI（Time to Interactive）？如何优化？',
    answer: `TTI：
• 页面可交互时间
• 长任务结束 + FCP
• 用户可点击/输入

优化策略：
1. 减少 JS 体积
2. 代码分割
3. 懒加载
4. 优化长任务
5. 减少主线程阻塞`,
    tags: ['TTI', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-speed-index-001',
    module: 'core',
    chapterId: 'performance',
    category: '性能指标',
    question: 'Speed Index 是什么？它如何衡量用户体验？',
    answer: `Speed Index：
• 页面视觉填充速度
• 衡量用户看到内容的速度
• 分数越低越好

计算原理：
• 每帧内容可见百分比
• 加权积分
• 汇总为分数

优化方向：
• 加快 FCP
• 减少关键资源
• 流式加载
• 骨架屏`,
    tags: ['SpeedIndex', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'perf-resource-hint-001',
    module: 'core',
    chapterId: 'performance',
    category: '预加载',
    question: 'Resource Hints 有哪些？分别用在什么场景？',
    answer: `Resource Hints：

1. dns-prefetch：
   • 预解析 DNS
   <link rel="dns-prefetch" href="//example.com">

2. preconnect：
   • DNS + TCP + TLS
   • 提前建立连接
   <link rel="preconnect" href="https://example.com">

3. prefetch：
   • 预取下个导航资源
   <link rel="prefetch" href="/next-page">

4. prerender：
   • 预渲染页面
   <link rel="prerender" href="/next-page">`,
    tags: ['ResourceHints'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-metrics-001',
    module: 'core',
    chapterId: 'performance',
    category: '性能指标',
    question: '前端性能指标有哪些？如何采集？',
    answer: `关键性能指标：

1. Navigation：
   • DOMContentLoaded
   • load
   • first-paint

2. Core Web Vitals：
   • LCP / FID / CLS

3. 自定义指标：
   • 自定义计时
   • 业务相关指标

采集方法：
• Performance API
• PerformanceObserver
• PerformanceNavigationTiming
• web-vitals 库`,
    tags: ['性能指标'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'perf-lazyload-img-001',
    module: 'core',
    chapterId: 'performance',
    category: '图片懒加载',
    question: '图片懒加载的实现方式有哪些？',
    answer: `图片懒加载方式：

1. 原生属性：
   <img loading="lazy" />

2. IntersectionObserver：
   const observer = new IntersectionObserver(...);
   observer.observe(img);

3. 滚动监听（不推荐）：
   性能差，已被替代

4. 占位图：
   • 避免布局抖动
   • 设置宽高比

5. srcset + sizes：
   • 响应式图片
   • 根据视口选择`,
    tags: ['图片懒加载'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'perf-webpack-optimize-001',
    module: 'core',
    chapterId: 'performance',
    category: 'Webpack优化',
    question: 'Webpack 的 splitChunks 如何配置可以优化缓存？',
    answer: `splitChunks 优化缓存策略：

1. 分离 vendor：
   • node_modules 单独打包
   • 第三方库长期缓存

2. 分离公共代码：
   • 多入口共享模块
   • 避免重复打包

3. 按需加载：
   • 动态 import
   • 路由分割

基本配置：
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      }
    }
  }
}`,
    tags: ['Webpack', 'splitChunks'],
    status: 'unvisited',
    difficulty: 'hard',
  },
];

const performanceChapter: Chapter = {
  id: 'performance',
  module: 'core',
  title: '性能优化体系',
  description: 'Core Web Vitals、首屏加载、长任务优化、虚拟列表',
  cardCount: performanceCards.length,
  icon: '🚀',
};

const engineeringCards: FlashCard[] = [
  {
    id: 'eng-vite-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Vite',
    question: 'Vite 为什么比 Webpack 快？',
    answer: `## 原理对比

| 构建工具 | 原理 |
|----------|------|
| **Webpack** | 启动时打包整个项目 |
| **Vite** | 按需编译，请求才编译 |

## Vite 优势

- Dev 用 **ESM**，无需打包
- **HMR** 精准更新，毫秒级
- 生产用 **Rollup** 打包
- **esbuild** 预构建依赖`,
    tags: ['Vite', 'Webpack', '工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-vite-hmr-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Vite',
    question: 'Vite 的 HMR 热更新原理是什么？为什么比 Webpack 快？',
    answer: `Vite HMR 原理：
• 文件变化时，只编译该模块
• 通过 WebSocket 通知浏览器
• 浏览器直接用 ESM 更新模块
• 无需重新打包

Webpack HMR 原理：
• 文件变化时重新打包模块
• 重新执行模块及依赖模块
• 热替换传播到依赖的模块

Vite 更快的原因：
• ESM 是原生支持，浏览器直接处理
• Webpack 需要在 Node 层打包处理
• Vite 跳过了打包步骤`,
    tags: ['Vite', 'HMR', '热更新'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'eng-vite-build-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Vite',
    question: 'Vite 生产构建使用什么打包工具？Rollup 有什么优势？',
    answer: `Vite 生产构建使用 Rollup。

Rollup 优势：
• Tree Shaking 更彻底
• 输出更干净
• 适合库/框架打包
• ES Module 原生支持

Vite 配置 Rollup：
• vite.config.js 中 build 配置
• 支持代码分割
• 支持多种格式输出（ESM/CJS/IIFE）`,
    tags: ['Vite', 'Rollup'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    'id': 'eng-zustand-001',
    module: 'core',
    chapterId: 'engineering',
    category: '状态管理',
    question: 'Zustand 和 Redux 有什么区别？为什么选择 Zustand？',
    answer: `## Zustand vs Redux

| 特性 | Redux | Zustand |
|------|-------|---------|
| **Store** | 单 store | 去中心化（可多个） |
| **模式** | reducer + action | Hooks 风格 API |
| **更新** | immutable | mutable 直接更新 |
| **副作用** | 需要中间件 | 内置简单副作用 |
| **样板代码** | 多 | 少 |

### 选择 Zustand 的理由

- 更**轻量**（2KB vs 7KB+）
- 学习曲线**低**
- React Hooks **原生体验**
- **足够简单**`,
    tags: ['Zustand', 'Redux', '状态管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-zustand-impl-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Zustand原理',
    question: 'Zustand 是如何实现状态管理的？',
    answer: `Zustand 实现原理：

1. 创建 store：
   create((set, get) => ({
     state: value,
     actions: () => set(state => ({ ... }))
   }))

2. 订阅机制：
   使用 subscribe 收集依赖
   状态变化时通知订阅者

3. 状态更新：
   set 函数触发更新
   shallow compare 避免不必要更新

4. 核心实现：
   • 利用 Proxy 代理状态
   • 订阅基于组件渲染订阅
   • setState 合并更新`,
    tags: ['Zustand', '原理'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'eng-monorepo-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Monorepo',
    question: '什么是 Monorepo？它有什么优缺点？',
    answer: `Monorepo：
• 单个代码仓库管理多个包
• pnpm workspaces / npm/yarn workspaces
• Turborepo / Nx 构建

优点：
• 代码共享方便
• 统一版本管理
• 跨项目修改一致性
• 简化依赖管理

缺点：
• 仓库体积膨胀
• CI/CD 复杂性增加
• 权限管理挑战
• 工具链配置复杂`,
    tags: ['Monorepo', '工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-ci-cd-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'CI/CD',
    question: '什么是 CI/CD？前端项目通常包含哪些 CI 环节？',
    answer: `CI（持续集成）：
代码提交后自动构建、测试

CD（持续部署/交付）：
自动部署到测试/生产环境

前端 CI 常见环节：
1. 代码检查 ESLint
2. 类型检查 TypeScript
3. 单元测试 Jest/Vitest
4. 集成测试
5. 构建产物
6. 安全扫描
7. 部署到 CDN/云服务`,
    tags: ['CI/CD', '工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-babel-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Babel',
    question: 'Babel 的编译流程是什么？AST 在其中扮演什么角色？',
    answer: `Babel 编译流程：
1. Parse：将代码解析为 AST
2. Transform：遍历 AST，转换节点
3. Generate：将 AST 转回代码

AST（抽象语法树）：
• 代码的结构化表示
• 包含 token 和节点信息
• 节点包含类型、属性、子节点

Babel 插件工作原理：
• 遍历 AST 节点
• 按 visitor 模式处理
• 返回新节点替换旧节点`,
    tags: ['Babel', 'AST'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'eng-webpack-config-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Webpack',
    question: 'Webpack 的 loader 和 plugin 有什么区别？',
    answer: `loader：
• 处理非 JS 文件（CSS、图片等）
• 链式调用，从右到左
• module.rules 配置

plugin：
• 介入构建全流程
• 监听 webpack 事件
• 可访问 compilation 对象
• 做事后处理

区别：
• loader 转换特定文件类型
• plugin 做更广的构建优化
• loader 是链式管道
• plugin 基于事件钩子`,
    tags: ['Webpack', 'loader', 'plugin'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-webpack-tree-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Webpack',
    question: 'Webpack 的 Tree Shaking 原理是什么？需要什么条件？',
    answer: `Tree Shaking 原理：
• 依赖 ES Module 的静态结构
• import/export 在编译时确定
• 分析模块依赖关系
• 标记未使用的导出
• terser 等压缩工具删除死代码

条件：
• production 模式自动开启
• ESM 格式（非 CommonJS）
• optimization.usedExports: true
• sideEffects 配置（package.json）

注意：
• CommonJS require 动态不行
• 需要正确配置 sideEffects`,
    tags: ['Webpack', 'TreeShaking'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'eng-webpack-code-split-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Webpack',
    question: 'Webpack 代码分割（Code Splitting）有哪些方式？',
    answer: `代码分割方式：

1. 入口配置：
   entry: { a: './a.js', b: './b.js' }

2. 动态 import：
   import('./module').then(m => ...)

3. Magic Comments：
   import(/* webpackChunkName: 'name' */ './module')

4. optimization.splitChunks：
   自动提取公共模块

5. MiniCssExtractPlugin：
   CSS 代码分割`,
    tags: ['Webpack', '代码分割'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-typescript-config-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'TypeScript',
    question: 'tsconfig.json 的重要配置项有哪些？',
    answer: `重要配置项：

compilerOptions：
• target：编译目标版本
• module：模块系统
• strict：严格模式
• esModuleInterop：允许 default 导入
• moduleResolution：解析策略（node/classic）
• outDir：输出目录
• declaration：生成 .d.ts
• skipLibCheck：跳过库检查

files：
• include/exclude：包含/排除文件
• extends：继承配置`,
    tags: ['TypeScript', '配置'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-eslint-001',
    module: 'core',
    chapterId: 'engineering',
    category: '代码规范',
    question: 'ESLint 的配置方式有哪些？',
    answer: `ESLint 配置方式：

1. .eslintrc.js（配置对象）
2. .eslintrc.json（JSON 格式）
3. package.json eslintConfig 字段
4. eslint.config.js（flat config，ESLint 9+）

配置内容：
• parserOptions：解析器选项
• parser：自定义解析器
• plugins：扩展规则
• extends：继承配置
• rules：自定义规则
• env：环境变量

常用 extends：
• eslint:recommended
• plugin:react/recommended
• plugin:@typescript-eslint/recommended`,
    tags: ['ESLint', '代码规范'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'eng-prettier-001',
    module: 'core',
    chapterId: 'engineering',
    category: '代码规范',
    question: 'Prettier 和 ESLint 有什么区别？为什么需要两者配合？',
    answer: `Prettier vs ESLint：

Prettier：
• 代码格式化工具
• 专注格式（缩进、换行等）
• 不检查代码质量
• 配置简单

ESLint：
• 代码质量检查
• 检查潜在错误和风格
• 可自动修复部分问题
• 配置复杂

配合使用：
• ESLint 检查代码质量
• Prettier 处理格式化
• 避免冲突（eslint-config-prettier）`,
    tags: ['Prettier', 'ESLint'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'eng-husky-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Git Hooks',
    question: 'Git Hooks 是什么？husky 如何集成到项目中？',
    answer: `Git Hooks：
• Git 操作时触发的脚本
• 位于 .git/hooks/
• pre-commit, commit-msg, pre-push 等

husky：
• 简化 Git Hooks 配置
• 在 package.json 或 .husky/ 定义
• 常用 pre-commit 集成 ESLint/测试`,
    tags: ['Git', 'husky'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `# .husky/pre-commit
npm run lint
npm run test

# package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }`,
  },
  {
    id: 'eng-commitlint-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Git提交规范',
    question: '什么是 commitizen？commitlint 有什么作用？',
    answer: `commitizen：
• 交互式提交工具
• 规范提交信息格式
• 选择提交类型、填写信息

commitlint：
• 校验 commit message 格式
• 配合 husky pre-commit
• 确保提交信息一致性

Angular 提交规范：
type(scope): subject
type: feat|fix|docs|style|refactor|test|chore`,
    tags: ['commitizen', 'commitlint'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-module-001',
    module: 'core',
    chapterId: 'engineering',
    category: '模块化',
    question: 'ES Module 和 CommonJS 有什么区别？',
    answer: `ES Module vs CommonJS：

ES Module：
• import/export 语法
• 编译时确定依赖
• 静态结构（必须在顶层）
• 值引用，可修改但不建议
• 默认严格模式

CommonJS：
• require/module.exports
• 运行时确定依赖
• 动态（可在条件语句中）
• 值拷贝
• Node.js 环境

差异影响：
• ESM 不能条件加载
• CJS 不能在浏览器原生使用
• 混用需要工具转换`,
    tags: ['ES Module', 'CommonJS'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-bundleless-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Bundleless',
    question: '什么是 Bundleless（Snowpack、Vite）？它有什么优缺点？',
    answer: `Bundleless 原理：
• 浏览器直接请求 ESM 模块
• 服务端按需编译
• 无需打包整个项目

优点：
• 启动极快
• HMR 即时
• 按需编译

缺点：
• 首屏加载大量小文件
• 生产仍需打包优化
• 依赖浏览器 ESM 支持

适用场景：
• 开发环境极致体验
• 中小型项目
• 现代浏览器`,
    tags: ['Bundleless', 'Vite'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-pkg-json-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'npm/yarn',
    question: 'package.json 的重要字段有哪些？',
    answer: `重要字段：

dependencies：
• 生产环境依赖

devDependencies：
• 开发环境依赖

peerDependencies：
• 同级依赖（宿主提供）

optionalDependencies：
• 可选依赖（失败不影响安装）

bin：
• CLI 命令映射

main：
• 包入口文件

module：
• ESM 入口文件

exports：
• 条件导出（node/esm/cjs）`,
    tags: ['package.json'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'eng-pnpm-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'pnpm',
    question: 'pnpm 相比 npm/yarn 有什么优势？它的存储机制是什么？',
    answer: `pnpm 优势：
• 更快的安装速度
• 更少的磁盘空间
• 严格的依赖隔离
• 支持 monorepo workspaces

存储机制：
• 全局 store（.pnpm-store）
• 硬链接到 node_modules
• 相同版本只存一份
• 避免重复下载

项目结构：
node_modules/
  .pnpm/
    lodash@4.17.21/
  react -> ../.pnpm/react@18/...`,
    tags: ['pnpm'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-env-001',
    module: 'core',
    chapterId: 'engineering',
    category: '环境变量',
    question: 'Vite/Webpack 中如何处理环境变量？',
    answer: `Vite 环境变量：
• .env 文件（公共）
• .env.local（本地覆盖）
• .env.development / .env.production
• import.meta.env.VITE_* 访问

Webpack 环境变量：
• DefinePlugin 注入
• process.env.NODE_ENV
• --env 参数传递`,
    tags: ['环境变量'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-polyfill-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Polyfill',
    question: 'Polyfill 是什么？babel 和 core-js 如何配合？',
    answer: `Polyfill：
• 代码填充浏览器缺失功能
• 让旧浏览器支持新 API

babel 配置：
• @babel/preset-env + useBuiltIns
• targets 指定浏览器范围
• core-js 指定版本

useBuiltIns 选项：
• false：不引入 polyfill
• entry：按需引入（全局）
• usage：按需引入（按使用）
• 推荐 usage`,
    tags: ['Polyfill', 'Babel'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'eng-source-map-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'SourceMap',
    question: 'SourceMap 是什么？有哪些类型？',
    answer: `SourceMap：
• 代码映射文件
• 调试时定位源码
• 生产环境可选择关闭

常见类型：
• eval：每个模块用 eval()
• cheap：忽略列映射
• module：保留 loader 转换
• hidden：生成但不带引用
• nosources：保留源码位置无源码

生产推荐：
source-map 或 hidden-source-map
完整但体积较大`,
    tags: ['SourceMap'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-lint-staged-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Git Hooks',
    question: 'lint-staged 是什么？它如何提升 Git hooks 效率？',
    answer: `lint-staged：
• 只检查暂存区的文件
• 避免检查整个项目
• 配合 pre-commit 使用

原理：
• git diff --cached 获取暂存文件
• 只对这些文件运行 lint
• 失败则阻止提交

优势：
• 减少检查范围
• 加快 hooks 执行
• 只验证要提交的内容`,
    tags: ['lint-staged', 'Git Hooks'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-vite-plugin-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Vite',
    question: '如何开发一个 Vite 插件？插件的 Hook 有哪些？',
    answer: `Vite 插件 Hook：

1. 服务器启动/关闭：
   - configureServer
   - closeBundle

2. 热更新：
   - hotUpdate

3. 构建阶段：
   - buildStart
   - buildEnd
   - transform
   - renderChunk
   - generateBundle

4. 通用：
   - enforce 调整顺序
   - apply 指定应用目标`,
    tags: ['Vite', 'Plugin'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `export default function myPlugin() {
  return {
    name: 'vite-plugin-example',
    enforce: 'pre', // pre | normal | post
    transform(code, id) {
      if (!id.endsWith('.vue')) return;
      // 转换代码
      return { code: transformed, map: null };
    },
    handleHotUpdate(ctx) {
      // 热更新处理
    }
  };
}`,
  },
  {
    id: 'eng-vitest-001',
    module: 'core',
    chapterId: 'engineering',
    category: '测试',
    question: 'Vitest 和 Jest 有什么区别？为什么选择 Vitest？',
    answer: `Vitest vs Jest：

Vitest：
• 基于 Vite，超快 HMR
• 原生 ESM 支持
• 开箱即用的 TypeScript
• 与 Vite 生态集成

Jest：
• 生态更成熟
• 配置更稳定
• 文档更完善

选择 Vitest 理由：
• 项目已用 Vite
• 开发体验更好
• 测试启动更快
• 更好的 TS 支持`,
    tags: ['Vitest', 'Jest'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-testing-001',
    module: 'core',
    chapterId: 'engineering',
    category: '测试',
    question: '单元测试、集成测试、端到端测试有什么区别？',
    answer: `单元测试：
• 测试最小单位（函数、组件）
• 隔离外部依赖（mock）
• 快速执行

集成测试：
• 测试模块组合
• 涉及真实交互
• 不 mock 或少 mock

E2E 测试：
• 测试完整业务流程
• 模拟真实用户操作
• 使用真实浏览器（Cypress/Puppeteer）

测试金字塔：
    /\
   /  \
  / E2E \
 /--------\
/ Integration \
/--------------\
/   Unit Test   \
-----------------`,
    tags: ['测试', '单元测试'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'eng-mocking-001',
    module: 'core',
    chapterId: 'engineering',
    category: '测试',
    question: '什么是 Mock？如何在前端测试中使用？',
    answer: `Mock：
• 模拟函数/模块行为
• 控制测试环境
• 隔离外部依赖

前端 Mock 场景：
1. API 请求：fetch/axios mock
2. 定时器：jest.useFakeTimers
3. 模块：jest.mock()
4. 第三方 SDK

常用工具：
• jest.fn() / jest.spyOn()
• msw (Mock Service Worker)
• sinon.js`,
    tags: ['测试', 'Mock'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-webpack-resolve-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Webpack',
    question: 'Webpack 的 resolve 配置有哪些常用选项？',
    answer: `resolve 配置：

1. extensions：
   • 自动解析扩展名
   • ['.js', '.jsx', '.ts', '.tsx']

2. alias：
   • 路径别名
   • '@': path.resolve(__dirname, 'src')

3. modules：
   • 查找模块的目录
   • ['node_modules']

4. mainFields：
   • package.json 入口字段
   • ['module', 'main']

5. symlinks：
   • 是否解析软链接`,
    tags: ['Webpack', 'resolve'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-css-modules-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'CSS Modules',
    question: 'CSS Modules 是什么？它如何实现样式隔离？',
    answer: `CSS Modules：
• 编译时处理
• 类名转换为唯一哈希
• 本地作用域

原理：
• 文件名.module.css
• 编译时生成唯一类名
• 导出映射对象

使用：
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>

编译后：
<button class="Button_primary__xVs5E">Click</button>`,
    tags: ['CSS Modules'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-bundler-comparison-001',
    module: 'core',
    chapterId: 'engineering',
    category: '构建工具',
    question: 'Webpack、Rollup、Vite 各自的特点和适用场景是什么？',
    answer: `## 构建工具对比

### Webpack

- 功能**最全面**
- 适合**复杂应用**
- 配置**灵活**
- **生态**丰富

### Rollup

- **专为库**设计
- **Tree Shaking** 最佳
- 输出**最干净**
- **ESM-first**

### Vite

- **开发体验**最佳
- **ESM 原生**支持
- **HMR 即时**
- 适合**现代框架**

### 选择建议

| 场景 | 推荐 |
|------|------|
| **库** | Rollup |
| **大型应用** | Webpack/Vite |
| **新项目** | Vite |`,
    tags: ['Webpack', 'Rollup', 'Vite'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'eng-turborepo-001',
    module: 'core',
    chapterId: 'engineering',
    category: 'Monorepo',
    question: 'Turborepo 是什么？它相比 Lerna 有什么优势？',
    answer: `Turborepo：
• Vercel 推出的构建系统
• 基于 Rust
• 高性能任务调度

Turborepo vs Lerna：

Turborepo：
• 增量构建
• 远程缓存
• 任务可视化
• 智能调度

Lerna：
• 纯 JS
• npm/yarn workspaces 集成
• 版本管理强

核心优势：
• 构建缓存
• 并行执行
• 任务依赖优化`,
    tags: ['Turborepo', 'Monorepo'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

const engineeringChapter: Chapter = {
  id: 'engineering',
  module: 'core',
  title: '工程化与架构',
  description: 'Vite原理、Zustand状态管理、模块化、打包策略',
  cardCount: engineeringCards.length,
  icon: '🔧',
};

const aiEngineeringCards: FlashCard[] = [
  {
    id: 'ai-ssd-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'SSD规范',
    question: '什么是 SSD 规范驱动模式？',
    answer: `SSD = Spec-Driven Development

核心思想：
用结构化的规范文档(Spec)驱动 AI 生成代码。

工作流程：
需求 → 编写规范(Spec) → AI 解读 → 代码生成 → 规范校验 → 人工审核

优势：
• 减少人与 AI 的沟通成本
• 规范可版本化
• 输出质量可控`,
    tags: ['AI', 'SSD', '规范驱动'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-openspec-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'OpenSpec',
    question: 'OpenSpec 协议是什么？它解决了什么问题？',
    answer: `OpenSpec：
• 开放规范协议
• 定义 AI 与工具交互的标准格式
• 支持结构化输入输出

解决的问题：
• AI 输出格式不一致
• 难以验证 AI 输出
• 工具调用困难

应用场景：
• Claude Code 工具调用
• AI Agent 工作流
• 多模型协作`,
    tags: ['AI', 'OpenSpec'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-prompt-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '提示词工程',
    question: '什么是提示词工程（Prompt Engineering）？有哪些常用技巧？',
    answer: `提示词工程：
优化与 AI 交互的输入文本，以获得更好输出。

常用技巧：
1. 角色设定：You are an expert...
2. 明确格式：Return JSON with fields...
3. Few-shot：提供示例
4. 链式思考：Think step by step
5. 迭代优化：Refine based on output
6. 约束条件：Do not include...
7. 上下文窗口：提供足够背景`,
    tags: ['AI', 'Prompt'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-claude-api-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'Claude API',
    question: 'Claude API 的主要功能有哪些？',
    answer: `Claude API 功能：

1. 文本生成：
   • 单一/多轮对话
   • 系统提示词

2. 工具使用：
   • Tool Use (Function Calling)
   • 扩展 AI 能力

3. 上下文管理：
   • Message API
   • 角色（user/assistant）

4. 参数控制：
   • temperature
   • max_tokens
   • stop_sequences`,
    tags: ['Claude', 'API'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-rag-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'RAG',
    question: '什么是 RAG（检索增强生成）？为什么需要它？',
    answer: `RAG = Retrieval-Augmented Generation

为什么需要：
• 训练数据有截止日期
• 需要访问最新/私有数据
• 减少幻觉

原理：
1. 检索：Query → 相关文档
2. 增强：将检索结果加入 Prompt
3. 生成：LLM 基于上下文生成

组件：
• Embedding 模型
• 向量数据库
• 检索算法`,
    tags: ['AI', 'RAG'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-embedding-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'Embedding',
    question: '什么是文本 Embedding？有哪些应用场景？',
    answer: `文本 Embedding：
• 将文本转为向量
• 捕捉语义信息
• 相似的文本向量接近

应用场景：
1. 相似度搜索
2. 文本分类
3. 聚类分析
4. RAG 检索
5. 推荐系统

常用模型：
• OpenAI text-embedding-3
• Cohere Embed
• BGE`,
    tags: ['AI', 'Embedding'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-vector-db-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '向量数据库',
    question: '向量数据库是什么？有哪些常用选型？',
    answer: `向量数据库：
存储和检索高维向量
支持相似度搜索

常用选型：
1. Pinecone：云服务，易用
2. Milvus：开源，可私有部署
3. Qdrant：Rust 编写，高性能
4. Chroma：轻量，适合 POC
5. Weaviate：多功能

选型考虑：
• 数据规模
• 延迟要求
• 部署方式
• 成本`,
    tags: ['向量数据库'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-agent-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'AI Agent',
    question: '什么是 AI Agent？它有哪些核心组件？',
    answer: `AI Agent：
能自主执行任务的 AI 系统

核心组件：
1. 规划（Planning）
   • 任务分解
   • 自我反思

2. 记忆（Memory）
   • 短期记忆
   • 长期记忆

3. 工具（Tools）
   • API 调用
   • 代码执行

4. 行动（Action）
   • 执行任务
   • 环境交互`,
    tags: ['AI', 'Agent'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-few-shot-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '提示词工程',
    question: 'Few-shot 和 Zero-shot 有什么区别？',
    answer: `Zero-shot：
• 不提供任何示例
• 模型依靠预训练知识
• 适合简单/通用任务

Few-shot：
• 提供 1-5 个示例
• 帮助模型理解格式/模式
• 适合复杂/特定任务

选择建议：
• 通用任务 → Zero-shot
• 特定格式 → Few-shot
• 避免过多示例（成本）`,
    tags: ['AI', 'Few-shot'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-chain-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '链式调用',
    question: '什么是 Chain of Thought（思维链）？',
    answer: `Chain of Thought：
让 AI 逐步思考，而非直接给出答案

原理：
• 显式展示推理过程
• 减少逻辑错误
• 提高复杂任务准确性

使用技巧：
• "Think step by step"
• "Explain your reasoning"
• 中间步骤可控制

适用场景：
• 数学问题
• 逻辑推理
• 代码调试`,
    tags: ['AI', 'CoT'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-structured-output-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '结构化输出',
    question: '如何让 AI 输出结构化数据（JSON）？',
    answer: `结构化输出方法：

1. prompt 指定：
   Return JSON with fields: name, age

2. JSON Mode：
   OpenAI: response_format: {type: 'json_object'}
   Claude: object (结构化输出)

3. Schema：
   提供完整 JSON Schema
   减少格式错误

4. 后处理：
   • try-catch JSON.parse
   • 正则提取
   • fallback 策略`,
    tags: ['AI', 'JSON'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-evals-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: 'AI评估',
    question: 'AI 应用需要哪些评估指标？',
    answer: `AI 评估指标：

1. 功能指标：
   • 准确率
   • 召回率
   • F1 分数

2. 质量指标：
   • 流畅度
   • 相关性
   • 事实正确性

3. 安全指标：
   • 幻觉率
   • 毒性
   • 偏见检测

4. 业务指标：
   • 任务完成率
   • 用户满意度
   • 响应延迟`,
    tags: ['AI', '评估'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-context-window-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '上下文管理',
    question: '什么是上下文窗口（Context Window）？超出限制怎么办？',
    answer: `上下文窗口：
• 模型一次能处理的 token 数
• 包含输入 + 输出

常见限制：
• Claude 3: 200K
• GPT-4: 128K
• 各模型不同

超出限制的处理：
1. 摘要压缩
2. 滑动窗口
3. RAG 只检索相关内容
4. 任务拆分
5. 层级索引`,
    tags: ['AI', '上下文'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-streaming-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '流式输出',
    question: '什么是流式输出（Streaming）？如何实现？',
    answer: `流式输出：
• 实时返回生成内容
• 减少等待感
• 类似打字效果

实现方式：
1. Server-Sent Events (SSE)
2. WebSocket
3. chunked transfer

前端处理：
• ReadableStream
• fetch API + reader
• 逐块渲染`,
    tags: ['AI', 'Streaming'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-temperature-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '参数控制',
    question: 'temperature 和 top_p 有什么区别？如何调整？',
    answer: `temperature：
• 控制随机性
• 0 = 确定输出
• 1 = 平衡
• > 1 = 更随机

top_p：
• 核采样参数
• 限制 token 池
• 值越小越集中

调整建议：
• 代码/结构化 → 0（低）
• 创意写作 → 0.7-0.9（高）
• 通用对话 → 0.7

通常只调一个，避免叠加影响`,
    tags: ['AI', 'temperature'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-guardrails-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '安全',
    question: 'AI 应用有哪些安全风险？如何防护？',
    answer: `AI 安全风险：

1. Prompt Injection：
   • 恶意指令覆盖原指令
   • 防护：输入过滤，指令隔离

2. 数据泄露：
   • 训练数据包含敏感信息
   • 防护：敏感信息脱敏

3. 幻觉：
   • 生成虚假信息
   • 防护：RAG，事实核查

4. 滥用：
   • 生成有害内容
   • 防护：内容过滤，输出审核`,
    tags: ['AI', '安全'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-finetune-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '微调',
    question: '什么是模型微调（Fine-tuning）？什么时候需要微调？',
    answer: `微调：
• 在预训练模型基础上训练
• 用特定数据调整权重
• 适应特定任务

什么时候需要：
• Prompt Engineering 效果差
• 需要特定风格/格式
• 成本比 RAG 低时
• 需要快速响应

微调 vs RAG：
• 微调：学习模式/风格
• RAG：访问特定知识
• 可结合使用`,
    tags: ['AI', '微调'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-summarization-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '摘要',
    question: '如何让 AI 做长文本摘要？有什么技巧？',
    answer: `长文本摘要技巧：

1. 分块处理：
   • 按段落/章节分割
   • 逐块摘要
   • 合并最终摘要

2. 层级摘要：
   • 第一遍：各部分摘要
   • 第二遍：总体摘要

3. 提取关键信息：
   • 先提取关键点
   • 再组织成摘要

4. Prompt 优化：
   • 指定长度
   • 指定格式（bullet/paragraph）
   • 强调重点`,
    tags: ['AI', '摘要'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-multimodal-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '多模态',
    question: '什么是多模态 AI？有哪些应用场景？',
    answer: `多模态 AI：
• 处理多种类型数据
• 文本、图像、音频、视频

应用场景：
1. 视觉问答
2. 图片描述生成
3. 文档理解（OCR + 理解）
4. 视频内容分析
5. 语音助手

API 示例：
• Claude 3 Vision
• GPT-4V
• Gemini Pro Vision`,
    tags: ['AI', '多模态'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-translation-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '翻译',
    question: 'AI 翻译相比传统翻译有哪些优势？',
    answer: `AI 翻译优势：
• 上下文理解
• 语境适应
• 持续学习
• 多语言支持

相比传统：
• 统计机器翻译（SMT）
  - 短语匹配为主
  - 语境理解差

• 神经机器翻译（NMT）
  - 端到端学习
  - 语境理解强

最佳实践：
• 混合使用（MT + 人工审校）
• 特定领域微调
• 术语库管理`,
    tags: ['AI', '翻译'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'ai-code-gen-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '代码生成',
    question: 'AI 代码生成的最佳实践是什么？',
    answer: `AI 代码生成最佳实践：

1. 明确的上下文：
   • 语言/框架
   • 输入输出示例
   • 约束条件

2. 迭代优化：
   • 先让 AI 解释代码
   • 指出问题
   • 逐步改进

3. 代码审查：
   • AI 生成 ≠ 正确
   • 必须测试验证
   • 安全检查

4. 工具配合：
   • Claude Code
   • GitHub Copilot
   • Tabnine`,
    tags: ['AI', '代码生成'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-memory-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '记忆管理',
    question: 'AI 应用如何管理对话历史？',
    answer: `对话历史管理策略：

1. 全部保留：
   • 适合短对话
   • 成本高

2. 摘要式：
   • 对话结束时摘要
   • 保留关键信息

3. 滑动窗口：
   • 只保留最近 N 条
   • 丢失早期上下文

4. 重要度筛选：
   • 标记重要消息
   • 优先保留

5. RAG + 历史：
   • 历史也做检索
   • 相关历史加入上下文`,
    tags: ['AI', '记忆管理'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-rate-limit-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '工程实践',
    question: 'AI API 调用的速率限制如何处理？',
    answer: `速率限制处理：

1. 重试机制：
   • 指数退避
   • 随机抖动
   • 最大重试次数

2. 队列管理：
   • 请求排队
   • 限流发送

3. 缓存：
   • 相同请求直接返回
   • 节省成本

4. 降级：
   • 简化请求
   • 使用更小模型

5. 容量规划：
   • 预估 QPS
   • 申请更高配额`,
    tags: ['AI', '速率限制'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-cost-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '成本优化',
    question: '如何降低 AI API 调用成本？',
    answer: `成本优化策略：

1. 减少 token：
   • 精简 Prompt
   • 压缩上下文
   • Few-shot 最小化

2. 模型选择：
   • 按任务选合适模型
   • 大模型 = 高成本

3. 缓存：
   • 相似请求缓存
   • 减少重复调用

4. 批处理：
   • 合并请求
   • 降低单位成本

5. 微调：
   • 一次投入，长期节省
   • 适合高频场景`,
    tags: ['AI', '成本'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-evaluation-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '评估',
    question: '如何评估 AI 应用的效果？',
    answer: `AI 应用评估方法：

1. 自动化评估：
   • LLM-as-Judge
   • 与标准答案对比
   • BLEU / ROUGE 指标

2. 人工评估：
   • A/B 测试
   • 用户反馈
   • 专家评审

3. 任务指标：
   • 准确率
   • 完成率
   • 错误率

4. 质量指标：
   • 延迟
   • 一致性
   • 安全性`,
    tags: ['AI', '评估'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-pii-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '数据处理',
    question: 'AI 应用中如何处理 PII（个人隐私信息）？',
    answer: `PII 处理策略：

1. 识别 PII：
   • 正则匹配
   • NLP 模型识别
   • 命名实体识别

2. 脱敏处理：
   • 删除
   • 泛化（***）
   • 假数据替换

3. 隔离策略：
   • PII 不送入 AI
   • 本地处理后脱敏
   • 使用隐私计算

4. 合规：
   • GDPR / 个人信息保护法
   • 数据最小化原则`,
    tags: ['AI', 'PII'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-hallucination-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '幻觉',
    question: '什么是 AI 幻觉？如何减少幻觉？',
    answer: `AI 幻觉：
• AI 生成看似合理但错误的内容
• 事实性错误
• 引用不存在的资料

减少幻觉方法：
1. RAG：提供真实上下文
2. 链式思考：让 AI 解释推理
3. 约束输出：JSON Schema
4. 多次验证：同一问题不同问法
5. 知识边界：明确告知"不知道"
6. 引用来源：要求标注来源`,
    tags: ['AI', '幻觉'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-self-hosting-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '部署',
    question: 'AI 模型自托管有哪些方案？',
    answer: `AI 模型自托管方案：

1. Ollama：
   • 本地运行大模型
   • 支持 Llama、Mistral 等
   • 简单易用

2. vLLM：
   • 高性能推理
   • PagedAttention
   • 生产级别

3. llama.cpp：
   • 纯 C/C++ 实现
   • CPU/GPU 支持
   • 量化支持

4. Text Generation Inference (TGI)：
   • Hugging Face 出品
   • 生产就绪
   • OpenAI 兼容 API

选型考虑：
• 硬件配置
• 性能需求
• 部署复杂度`,
    tags: ['AI', '自托管'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ai-prompt-tuning-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '提示词工程',
    question: '什么是 Prompt Tuning？和 Fine-tuning 有什么区别？',
    answer: `Prompt Tuning：
• 通过修改输入 Prompt 优化输出
• 不改变模型权重
• 快速迭代

Fine-tuning：
• 训练时调整模型权重
• 需要数据和计算资源
• 适合特定任务

对比：
• Prompt Tuning：低成本，快速
• Fine-tuning：高成本，效果好
• 可结合使用

适用场景：
• Prompt Tuning：快速实验
• Fine-tuning：固定任务场景`,
    tags: ['AI', 'Prompt Tuning'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ai-function-calling-001',
    module: 'core',
    chapterId: 'ai-engineering',
    category: '工具调用',
    question: '什么是 Function Calling（函数调用）？有哪些应用场景？',
    answer: `Function Calling：
• AI 模型调用外部工具
• 结构化输出
• 执行真实操作

典型应用：
1. 数据库查询
2. API 调用
3. 文件操作
4. 计算器

工作流程：
1. AI 识别需要调用函数
2. 提取参数
3. 执行函数
4. 返回结果给 AI
5. AI 整合结果输出

API 支持：
• OpenAI function calling
• Claude tool use
• LangChain agents`,
    tags: ['AI', 'Function Calling'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

const aiEngineeringChapter: Chapter = {
  id: 'ai-engineering',
  module: 'core',
  title: 'AI工程化',
  description: 'SSD规范驱动、OpenSpec协议、AI代码质量保障',
  cardCount: aiEngineeringCards.length,
  icon: '🤖',
};

const systemDesignCards: FlashCard[] = [
  {
    id: 'sys-solid-001',
    module: 'core',
    chapterId: 'system-design',
    category: '设计原则',
    question: 'SOLID 原则在前端如何应用？',
    answer: `## SOLID 五大原则

| 原则 | 含义 | 前端应用 |
|------|------|----------|
| **S** - 单一职责 | 组件只做一件事 | 组件拆分 |
| **O** - 开闭原则 | 可扩展但不改源码 | 组件扩展 |
| **L** - 里氏替换 | 子组件可替换父组件 | 继承设计 |
| **I** - 接口隔离 | 按需传入 props | Props 设计 |
| **D** - 依赖反转 | 依赖注入、高阶组件 | HOC/依赖注入 |`,
    tags: ['系统设计', 'SOLID', '架构'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-kiss-yagni-001',
    module: 'core',
    chapterId: 'system-design',
    category: '设计原则',
    question: 'KISS 和 YAGNI 原则是什么？',
    answer: `KISS = Keep It Simple, Stupid
• 保持简单
• 避免过度设计
• 简单方案优先

YAGNI = You Aren't Gonna Need It
• 不要做未来可能用不到的功能
• 避免过度工程化
• 按需实现

前端应用：
• 先实现，后优化
• 不要过度抽象
• 简单组件优先组合`,
    tags: ['系统设计', 'KISS', 'YAGNI'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'sys-dry-001',
    module: 'core',
    chapterId: 'system-design',
    category: '设计原则',
    question: 'DRY 原则是什么？前端如何实践 DRY？',
    answer: `DRY = Don't Repeat Yourself
不要重复自己

前端实践：
1. 组件复用：
   • 抽象可复用组件
   • 避免重复 UI 代码

2. 样式复用：
   • CSS 变量
   • Tailwind 工具类
   • 设计系统

3. 逻辑复用：
   • 自定义 Hooks
   • 工具函数
   • 状态管理

过度 DRY 的风险：
• 过度抽象
• 耦合增加`,
    tags: ['系统设计', 'DRY'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'sys-component-001',
    module: 'core',
    chapterId: 'system-design',
    category: '组件设计',
    question: '好的组件设计有哪些原则？',
    answer: `组件设计原则：

1. 单一职责：
   • 一个组件只做一件事
   • 易于测试和维护

2. 可复用性：
   • props 抽象接口
   • 减少硬编码
   • 样式与逻辑分离

3. 可组合性：
   • 原子设计原则
   • 小组件组合大组件

4. 明确的数据流：
   • props 向下传递
   • 回调向上传递
   • 避免隐式依赖`,
    tags: ['系统设计', '组件'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-atomic-design-001',
    module: 'core',
    chapterId: 'system-design',
    category: '组件设计',
    question: '什么是原子设计（Atomic Design）？',
    answer: `原子设计五层级：

1. Atoms（原子）：
   • 最小单位
   • Button, Input, Icon

2. Molecules（分子）：
   • 简单组件组合
   • SearchBar = Input + Button

3. Organisms（有机体）：
   • 复杂 UI 区块
   • Header = Logo + Nav + SearchBar

4. Templates（模板）：
   • 页面布局
   • 定义结构

5. Pages（页面）：
   • 具体实例
   • 填充真实数据`,
    tags: ['系统设计', '原子设计'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-state-001',
    module: 'core',
    chapterId: 'system-design',
    category: '状态管理',
    question: '前端状态管理有哪些模式？',
    answer: `## 状态管理模式

### 1. 组件本地状态

- **useState**
- 最小范围

### 2. Context

- **跨组件共享**
- 避免嵌套地狱

### 3. 状态管理库

| 库 | 特点 |
|----|------|
| Redux | 单向数据流 |
| Zustand | 轻量简洁 |
| Jotai | 原子化 |

### 4. Server State

- **React Query**
- **SWR**
- 异步状态同步

### 选择原则

- 能用本地就不用全局
- 共享才用 Context/Store`,
    tags: ['系统设计', '状态管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-cache-001',
    module: 'core',
    chapterId: 'system-design',
    category: '缓存设计',
    question: '前端缓存策略有哪些？',
    answer: `前端缓存层级：

1. 浏览器缓存：
   • Memory Cache
   • Disk Cache
   • Service Worker

2. HTTP 缓存：
   • 强缓存（Cache-Control）
   • 协商缓存（ETag）

3. 内存缓存：
   • 变量存储
   • Map/Object

4. 状态缓存：
   • 组件状态暂存
   • 表单草稿

5. 离线缓存：
   • PWA
   • IndexedDB`,
    tags: ['系统设计', '缓存'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-api-design-001',
    module: 'core',
    chapterId: 'system-design',
    category: 'API设计',
    question: '前端如何设计 API 调用层？',
    answer: `API 调用层设计：

1. 统一封装：
   • 统一请求/响应拦截
   • 错误处理
   • Loading 状态

2. 接口定义：
   • 前后端接口协议
   • 请求/响应类型
   • 文档化

3. 错误处理：
   • HTTP 错误码映射
   • 业务错误码处理
   • 用户提示

4. 缓存策略：
   • 请求缓存
   • 增量获取

5. 最佳实践：
   • 基于 axios/fetch 封装
   • 分离 API 模块
   • 单一数据源`,
    tags: ['系统设计', 'API'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-error-handling-001',
    module: 'core',
    chapterId: 'system-design',
    category: '错误处理',
    question: '前端错误处理有哪些策略？',
    answer: `错误处理策略：

1. 同步错误：
   • try-catch
   • finally 清理

2. 异步错误：
   • .catch()
   • try-catch async/await

3. 全局错误处理：
   • window.onerror
   • unhandledrejection
   • React errorBoundary

4. 业务错误处理：
   • 错误码映射
   • 用户友好的错误提示
   • 错误上报

5. 降级策略：
   • 服务降级
   • 缓存兜底
   • 静态数据`,
    tags: ['系统设计', '错误处理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-loading-001',
    module: 'core',
    chapterId: 'system-design',
    category: '用户体验',
    question: '如何设计好的加载状态？',
    answer: `加载状态设计：

1. 骨架屏（Skeleton）：
   • 占位骨架
   • 减少感知等待

2. 加载指示器：
   • Spinner
   • Progress
   • 适用于短时加载

3. 分步加载：
   • 先加载关键内容
   • 非关键内容延迟

4. 缓存+加载：
   • 先显示缓存
   • 后台更新

5. 渐进式：
   • 低质量占位
   • 逐步清晰

原则：
• 立即响应
• 给出预期
• 不要阻塞交互`,
    tags: ['系统设计', '加载'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-permission-001',
    module: 'core',
    chapterId: 'system-design',
    category: '权限设计',
    question: '如何设计前端权限控制系统？',
    answer: `权限控制设计：

1. 路由权限：
   • 导航守卫
   • 路由元信息
   • 动态路由

2. 按钮权限：
   • 权限指令/组件
   • 动态隐藏/禁用

3. 数据权限：
   • 接口级权限
   • 字段级权限

4. 页面权限：
   • 登录验证
   • 角色判断

5. 实现方式：
   • 基于角色的权限（RBAC）
   • 权限点列表
   • 权限树结构`,
    tags: ['系统设计', '权限'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-form-design-001',
    module: 'core',
    chapterId: 'system-design',
    category: '表单设计',
    question: '复杂表单如何设计？有哪些最佳实践？',
    answer: `复杂表单最佳实践：

1. 表单结构化：
   • 字段分组
   • 步骤引导
   • Section 分割

2. 状态管理：
   • 表单状态集中
   • useReducer 或表单库

3. 验证策略：
   • 实时验证
   • 提交时验证
   • 异步验证

4. 用户体验：
   • 自动保存草稿
   • 错误提示明确
   • 支持键盘导航

5. 性能优化：
   • 懒加载大字段
   • 虚拟化长列表
   • 避免过度渲染`,
    tags: ['系统设计', '表单'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-search-001',
    module: 'core',
    chapterId: 'system-design',
    category: '搜索设计',
    question: '如何设计搜索功能？有哪些优化策略？',
    answer: `搜索功能设计：

1. 搜索类型：
   • 精确搜索
   • 模糊搜索
   • 分词搜索

2. 搜索优化：
   • 防抖（减少请求）
   • 搜索建议/补全
   • 历史记录

3. 结果展示：
   • 分页 / 无限滚动
   • 高亮匹配
   • 排序选项

4. 性能优化：
   • 前端缓存
   • 预搜索
   • 懒加载

5. 空状态：
   • 友好提示
   • 搜索建议`,
    tags: ['系统设计', '搜索'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-infinite-scroll-001',
    module: 'core',
    chapterId: 'system-design',
    category: '列表设计',
    question: '无限滚动列表如何设计？',
    answer: `无限滚动列表设计：

1. 数据加载：
   • 分页加载
   • 游标/offset
   • 预加载下一页

2. 渲染优化：
   • 虚拟列表
   • 窗口化
   • 只渲染可见区域

3. 状态管理：
   • 缓存已加载数据
   • 加载状态
   • 错误处理

4. 用户体验：
   • Loading 指示器
   • 回到顶部
   • 到底提示

5. 问题处理：
   • 重复数据
   • 内存泄漏
   • 快速滚动闪烁`,
    tags: ['系统设计', '无限滚动'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-modal-001',
    module: 'core',
    chapterId: 'system-design',
    category: '组件设计',
    question: 'Modal（模态框）组件如何设计？',
    answer: `Modal 设计要点：

1. 状态管理：
   • 打开/关闭状态
   • 动画状态

2. 层级管理：
   • z-index 层级
   • 焦点管理
   • 背景滚动锁定

3. 事件处理：
   • ESC 关闭
   • 点击背景关闭
   • 阻止冒泡

4. 动画：
   • 入场/退场动画
   • 动画时长

5. 可访问性：
   • ARIA 属性
   • 焦点陷阱
   • 键盘导航`,
    tags: ['系统设计', 'Modal'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-design-system-001',
    module: 'core',
    chapterId: 'system-design',
    category: '设计系统',
    question: '什么是设计系统（Design System）？',
    answer: `设计系统组成：

1. 设计原则：
   • 品牌调性
   • 一致性规范

2. 设计 token：
   • 颜色、字体、间距
   • 变量化配置

3. 组件库：
   • 基础组件
   • 业务组件
   • 文档和示例

4. 模式库：
   • 常用交互模式
   • 页面模板

5. 工具链：
   • Storybook
   • Figma 组件
   • CLI 工具`,
    tags: ['系统设计', '设计系统'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-event-bus-001',
    module: 'core',
    chapterId: 'system-design',
    category: '事件通信',
    question: '跨组件通信有哪些方式？',
    answer: `跨组件通信方式：

1. Props drilling：
   • 父子/爷孙传值
   • 简单但繁琐

2. Context：
   • 跨层级共享
   • 适合主题、语种

3. 自定义事件：
   • 事件总线
   •mitt / eventemitter3
   • 解耦组件

4. 全局状态：
   • Redux/Zustand
   • 全局共享

5. 第三方状态：
   • 适合复杂场景
   • 额外依赖

选择原则：
• 简单到复杂
• 避免过度设计`,
    tags: ['系统设计', '通信'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'sys-dependency-injection-001',
    module: 'core',
    chapterId: 'system-design',
    category: '依赖注入',
    question: '什么是依赖注入？前端如何实现？',
    answer: `依赖注入（DI）：
• 控制权反转（IoC）
• 依赖由外部传入
• 便于测试和替换

前端实现方式：

1. Props 注入：
   <Component service={myService} />

2. Context 注入：
   <DI.Provider value={services}>
     <App />
   </DI.Provider>

3. 高阶组件：
   • 包装并注入依赖

4. React.createContext：
   • useContext 获取

优点：
• 易于测试
• 松耦合
• 灵活配置`,
    tags: ['系统设计', 'DI'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-clean-architecture-001',
    module: 'core',
    chapterId: 'system-design',
    category: '架构',
    question: '什么是 Clean Architecture？前端如何应用？',
    answer: `Clean Architecture 四层：

1. Entities（实体层）：
   • 核心业务实体
   • 纯数据类型
   • 业务规则

2. Use Cases（用例层）：
   • 业务逻辑
   • 应用规则
   • 编排数据流

3. Interface Adapters（接口适配层）：
   • UI 组件
   • API 接口
   • 外部工具

4. Frameworks（框架层）：
   • React/Vue
   • 数据库
   • 第三方库

前端应用：
• 组件只做 UI
• Hook 封装业务逻辑
• 工具函数处理数据`,
    tags: ['系统设计', '架构'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-feature-flag-001',
    module: 'core',
    chapterId: 'system-design',
    category: '特性开关',
    question: '什么是 Feature Flag（特性开关）？',
    answer: `Feature Flag：
• 远程控制功能开关
• 无需重新部署

应用场景：
1. 灰度发布：
   • 百分比灰度
   • 用户群分组

2. A/B 测试：
   • 快速切换
   • 效果对比

3. 紧急开关：
   • 快速关闭问题功能
   • 减少回滚时间

4. 渐进式发布：
   • 逐步放量
   • 降低风险

实现方式：
• 后端配置下发
• 前端 SDK 读取
• 降级处理`,
    tags: ['系统设计', 'FeatureFlag'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-realtime-001',
    module: 'core',
    chapterId: 'system-design',
    category: '实时通信',
    question: '前端实时通信有哪些方案？',
    answer: `实时通信方案：

1. 轮询（Polling）：
   • 定时请求
   • 简单但浪费资源

2. 长轮询（Long Polling）：
   • 请求挂起
   • 有新消息返回

3. WebSocket：
   • 双向通信
   • 实时高效
   • 需要心跳保活

4. Server-Sent Events（SSE）：
   • 单向推送
   • 轻量
   • 自动重连

5. WebRTC：
   • 点对点连接
   • 适合音视频

选择：
• 实时性要求高 → WebSocket
• 单向推送 → SSE`,
    tags: ['系统设计', '实时'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-optimistic-001',
    module: 'core',
    chapterId: 'system-design',
    category: '乐观更新',
    question: '什么是乐观更新（Optimistic Update）？',
    answer: `乐观更新：
• 先更新 UI
• 后台异步请求
• 失败则回滚

实现步骤：
1. 用户操作 → 立即更新 UI
2. 同时发送请求
3. 成功 → 确认更新
4. 失败 → 回滚 + 提示

优点：
• 响应快
• 用户体验好

缺点：
• 需要回滚机制
• 并发冲突处理

适用场景：
• 点赞/取消
• 评论发布
• 状态切换`,
    tags: ['系统设计', '乐观更新'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-pwa-001',
    module: 'core',
    chapterId: 'system-design',
    category: 'PWA',
    question: 'PWA 核心特性和设计考虑有哪些？',
    answer: `PWA 核心特性：

1. Web App Manifest：
   • 应用元信息
   • 安装能力

2. Service Worker：
   • 离线缓存
   • 代理请求
   • 后台同步

3. 离线能力：
   • Cache API
   • IndexedDB
   • 离线优先

4. 推送通知：
   • Web Push
   • 订阅机制

5. 安装能力：
   • Add to Home Screen
   • 应用启动屏

设计考虑：
• 缓存策略
• 数据同步
• 降级处理`,
    tags: ['系统设计', 'PWA'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-ssr-ssg-001',
    module: 'core',
    chapterId: 'system-design',
    category: '渲染策略',
    question: '如何选择 SSR、SSG、CSR？',
    answer: `渲染策略选择：

SSR（服务端渲染）：
• 需要 SEO
• 内容动态
• 首屏快

SSG（静态生成）：
• 内容不变
• 博客/文档
• 最快加载

CSR（客户端渲染）：
• 后台系统
• 用户数据
• 交互丰富

混合策略：
• 首页 SSG
• 内容页 SSR
• 功能页 CSR

原则：
• 合适就好
• 不过度工程化`,
    tags: ['系统设计', 'SSR'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-monitoring-001',
    module: 'core',
    chapterId: 'system-design',
    category: '监控',
    question: '前端监控体系包括哪些内容？',
    answer: `前端监控体系：

1. 性能监控：
   • 页面加载
   • 接口响应
   • 错误率

2. 行为监控：
   • 用户路径
   • 点击热图
   • 留存分析

3. 错误监控：
   • JS 错误
   • 资源加载错误
   • Promise 拒绝

4. 业务监控：
   • 关键转化
   • 功能使用
   • 异常订单

工具：
• Sentry：错误
• Performance API
• 埋点方案
• 灰度监控`,
    tags: ['系统设计', '监控'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-ab-test-001',
    module: 'core',
    chapterId: 'system-design',
    category: 'A/B测试',
    question: '如何在前端实现 A/B 测试？',
    answer: `A/B 测试前端实现：

1. 分流策略：
   • 随机分流
   • 用户 ID 分流
   • 地域/设备分流

2. 实现方式：
   • 前端分流
   • 后端下发
   • Feature Flag

3. 数据收集：
   • 曝光上报
   • 转化上报
   • 用户属性

4. 统计方法：
   • 置信区间
   • p-value
   • 样本量计算

5. 工具：
   • 自建
   • Firebase
   • Optimizely`,
    tags: ['系统设计', 'A/B测试'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-microfrontend-001',
    module: 'core',
    chapterId: 'system-design',
    category: '微前端',
    question: '什么是微前端？有哪些实现方式？',
    answer: `微前端：
• 将前端应用拆分为独立子应用
• 各子应用独立开发/部署
• 统一集成到主应用

实现方式：

1. iframe：
   • 隔离性最好
   • 通信复杂
   • 体验差

2. Web Component：
   • 原生标准
   • 学习成本高

3. Module Federation：
   • Webpack 5 特性
   • 共享依赖
   • 推荐方案

4. qiankun：
   • 基于 iframe
   • 封装更好体验`,
    tags: ['系统设计', '微前端'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-module-federation-001',
    module: 'core',
    chapterId: 'system-design',
    category: 'Module Federation',
    question: 'Webpack Module Federation 是什么？解决了什么问题？',
    answer: `Module Federation：
• Webpack 5 特性
• 允许独立构建的模块共享
• 运行时动态加载

解决的问题：
• 微前端依赖共享
• 多应用间代码复用
• 减少重复打包

核心概念：
• Host：引用方
• Remote：提供方
• shared：共享依赖

配置示例：
new ModuleFederationPlugin({
  name: 'app1',
  exposes: { './Button': './src/Button' },
  shared: ['react', 'react-dom']
});`,
    tags: ['系统设计', 'ModuleFederation'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'sys-isr-001',
    module: 'core',
    chapterId: 'system-design',
    category: '渲染策略',
    question: '什么是 ISR（增量静态再生成）？',
    answer: `ISR = Incremental Static Regeneration

原理：
• 预渲染页面
• 后台增量更新
• 用户先访问静态页

Next.js ISR：
• getStaticProps + revalidate
• 定时重新生成
• 失败返回旧页面

适用场景：
• 高流量内容站
• 需要 SEO 的动态内容
• 减少服务器负载`,
    tags: ['系统设计', 'ISR'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'sys-island-001',
    module: 'core',
    chapterId: 'system-design',
    category: '渲染策略',
    question: '什么是 Island Architecture（孤岛架构）？',
    answer: `Island Architecture：
• 静态 HTML + 可交互组件
• 页面大部分内容静态
• 可交互部分（Island）独立

原理：
• 页面预渲染为静态
• React 组件选择性和水合
• 只为需要的组件注入 JS

框架：
• Astro（默认）
• Qwik
• Fresh

优势：
• 极快的首屏
• 最少 JS
• SEO + 交互兼得`,
    tags: ['系统设计', 'Island'],
    status: 'unvisited',
    difficulty: 'hard',
  },
];

const systemDesignChapter: Chapter = {
  id: 'system-design',
  module: 'core',
  title: '系统设计基础',
  description: 'SOLID原则、状态管理设计、缓存策略设计',
  cardCount: systemDesignCards.length,
  icon: '🏗️',
};

const htmlCssCards: FlashCard[] = [
  {
    id: 'html-css-bfc-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'BFC',
    question: '什么是 BFC？BFC 有哪些应用场景？',
    answer: `## BFC = Block Formatting Context

### 形成条件

- overflow: hidden/auto/scroll
- display: flex/grid
- position: absolute/fixed
- float: left/right
- 根元素 html

### 应用场景

1. **清除浮动**
2. **防止 margin 塌陷**
3. **自适应两栏布局**`,
    tags: ['CSS', 'BFC', '布局'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-box-model-001',
    module: 'core',
    chapterId: 'html-css',
    category: '盒模型',
    question: 'CSS 盒模型是什么？content-box 和 border-box 有什么区别？',
    answer: `## 盒模型组成

- **content**：内容区域
- **padding**：内边距
- **border**：边框
- **margin**：外边距

## 两种盒模型

| 盒模型 | width 计算 | 说明 |
|--------|-----------|------|
| **content-box**（默认） | width = content | 其他部分另算 |
| **border-box** | width = content + padding + border | 更符合直觉 |

## 现代 CSS 推荐

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\``,
    tags: ['CSS', '盒模型'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-flex-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'Flexbox',
    question: 'Flexbox 的主轴和交叉轴是什么？如何切换？',
    answer: `Flexbox 轴向：

主轴（main axis）：
• 默认水平，从左到右
• flex-direction 控制方向

交叉轴（cross axis）：
• 默认垂直，从上到下
• 与主轴垂直

flex-direction 值：
• row（默认）：主轴水平
• column：主轴垂直
• row-reverse：主轴水平反向
• column-reverse：主轴垂直反向`,
    tags: ['CSS', 'Flexbox'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-flex-justify-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'Flexbox',
    question: 'justify-content 和 align-items 有什么区别？',
    answer: `justify-content：
• 沿主轴（main axis）对齐
• 处理主轴方向的空间分配

align-items：
• 沿交叉轴（cross axis）对齐
• 处理交叉轴方向的对齐

常见值：
justify-content:
• flex-start / flex-end
• center
• space-between / space-around

align-items:
• stretch（默认）
• flex-start / flex-end
• center
• baseline`,
    tags: ['CSS', 'Flexbox'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-grid-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'Grid',
    question: 'CSS Grid 和 Flexbox 有什么区别？什么时候用哪个？',
    answer: `## Grid vs Flexbox

| 特性 | Grid（二维） | Flexbox（一维） |
|------|-------------|----------------|
| **控制方向** | 同时控制行和列 | 控制单行或单列 |
| **适用场景** | 整体页面布局 | 组件内部布局 |
| **特点** | 复杂网格系统 | 灵活的内容流 |

### 选择原则

- **整体布局** → Grid
- **组件内元素** → Flexbox
- 可**结合使用**`,
    tags: ['CSS', 'Grid', 'Flexbox'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-grid-template-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'Grid',
    question: 'grid-template-columns 的 fr 单位是什么？',
    answer: `fr 单位：
• fraction（分数）的缩写
• 表示可用空间的比例

示例：
grid-template-columns: 1fr 2fr 1fr
• 第一列：1/4 宽度
• 第二列：2/4 宽度
• 第三列：1/4 宽度

配合其他单位：
grid-template-columns: 200px 1fr 2fr
• 第一列固定 200px
• 剩余空间 1:2 分配`,
    tags: ['CSS', 'Grid'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-position-001',
    module: 'core',
    chapterId: 'html-css',
    category: '定位',
    question: 'CSS position 有哪些值？static 和 relative 有什么区别？',
    answer: `position 值：
• static：正常文档流（默认值）
• relative：相对定位，相对于自身
• absolute：绝对定位，相对于定位祖先
• fixed：固定定位，相对于视口
• sticky：粘性定位，滚动到阈值时固定

static vs relative：

static：
• 遵循正常文档流
• top/left 等无效

relative：
• 相对于自身位置偏移
• 仍占据原空间
• 其他元素不会填补`,
    tags: ['CSS', 'position'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-z-index-001',
    module: 'core',
    chapterId: 'html-css',
    category: '层叠',
    question: 'z-index 是如何工作的？为什么有时候不生效？',
    answer: `## z-index 工作原理

### 1. 同层叠上下文

- z-index 只在**同一层叠上下文**中比较
- **不同层叠上下文无法比较**

### 2. 层叠上下文创建条件

- 根元素
- position + z-index
- opacity < 1
- transform
- CSS Grid / Flex 子元素

### 不生效原因

- 父元素**没有创建层叠上下文**
- 需设置 **position + z-index**`,
    tags: ['CSS', 'z-index'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'html-css-stacking-context-001',
    module: 'core',
    chapterId: 'html-css',
    category: '层叠上下文',
    question: '什么是层叠上下文（Stacking Context）？哪些属性会创建它？',
    answer: `层叠上下文：
• 包含一组层叠层的盒子
• 内部元素在该范围内层叠

创建层叠上下文的属性：
• position: relative/absolute + z-index
• position: fixed/sticky
• opacity: < 1
• transform: != none
• filter: != none
• CSS Grid: 父元素 z-index
• isolation: isolate
• -webkit-overflow-scrolling: touch`,
    tags: ['CSS', '层叠上下文'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'html-css-selector-priority-001',
    module: 'core',
    chapterId: 'html-css',
    category: '选择器',
    question: 'CSS 选择器优先级如何计算？',
    answer: `优先级计算规则：

!important > 行内样式 > ID选择器 > 类/属性/伪类 > 标签/伪元素

计算方法（a, b, c）：
• a: !important 数量
• b: ID 选择器数量
• c: 类/属性/伪类/标签/伪元素数量

比较规则：
• 从左到右逐个比较
• 第一个大就胜出`,
    tags: ['CSS', '选择器优先级'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-pseudo-001',
    module: 'core',
    chapterId: 'html-css',
    category: '伪类伪元素',
    question: '伪类和伪元素有什么区别？',
    answer: `伪类（Pseudo-class）：
• 描述元素的状态
• 单冒号 :hover
• 不创建新元素

常见伪类：
• :hover, :focus, :active
• :first-child, :last-child
• :nth-child()
• :not()

伪元素（Pseudo-element）：
• 创造新元素
• 双冒号 ::before
• 可以在内容前后插入

常见伪元素：
• ::before, ::after
• ::first-line, ::first-letter
• ::placeholder
• ::selection`,
    tags: ['CSS', '伪类', '伪元素'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-display-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'display',
    question: 'display: none 和 visibility: hidden 有什么区别？',
    answer: `display: none：
• 不占据空间
• 完全不渲染
• 不影响布局

visibility: hidden：
• 占据空间
• 仍占用布局
• 子元素可单独可见

visibility 继承性：
• 父元素 visibility: hidden
• 子元素 visibility: visible 可覆盖
• display: none 无法覆盖`,
    tags: ['CSS', 'display', 'visibility'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-margin-collapse-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'margin',
    question: '什么是 margin 塌陷？如何避免？',
    answer: `margin 塌陷：
垂直方向相邻元素的 margin 会合并

塌陷情况：
1. 兄弟元素：取较大值
2. 父子元素：子 margin 作用到父
3. 空元素：上下 margin 合并

避免方法：
• BFC（overflow: hidden/float/position）
• Flexbox（不会塌陷）
• Grid（不会塌陷）
• 单独设置 border/padding`,
    tags: ['CSS', 'margin'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-float-001',
    module: 'core',
    chapterId: 'html-css',
    category: '浮动',
    question: '浮动（float）有什么问题？如何清除浮动？',
    answer: `浮动问题：
• 父元素高度塌陷
• 影响后续元素布局

清除浮动方法：
1. Clearfix：
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

2. BFC：
overflow: hidden/auto

3. 空标签：
<div style="clear: both"></div>

4. 现代布局：
Flexbox / Grid`,
    tags: ['CSS', '浮动'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-responsive-001',
    module: 'core',
    chapterId: 'html-css',
    category: '响应式',
    question: '响应式设计有哪些实现方式？',
    answer: `## 响应式设计方式

### 1. 媒体查询

\`\`\`css
@media (max-width: 768px) { ... }
\`\`\`

### 2. 相对单位

- **rem / em**
- **vw / vh**
- **%**

### 3. 弹性布局

- **Flexbox**
- **Grid**

### 4. 图片响应式

- **srcset**
- **picture** 元素

### 5. 容器查询（Container Query）

\`\`\`css
@container
\`\`\`
`,
    tags: ['CSS', '响应式'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-media-query-001',
    module: 'core',
    chapterId: 'html-css',
    category: '媒体查询',
    question: '媒体查询的 min-width 和 max-width 有什么区别？',
    answer: `min-width：
• 最小宽度阈值
• >= 条件生效
• 移动优先用 min-width

max-width：
• 最大宽度阈值
• <= 条件生效
• 桌面优先用 max-width

选择建议：
• 移动优先 → min-width
• 桌面优先 → max-width

示例：
/* 移动优先 */
@media (min-width: 768px) { ... }
@media (min-width: 1024px) { ... }`,
    tags: ['CSS', '媒体查询'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-rem-em-001',
    module: 'core',
    chapterId: 'html-css',
    category: '单位',
    question: 'rem 和 em 有什么区别？',
    answer: `rem vs em：

rem：
• 相对于根元素（html）
• 全局一致
• 适合整体缩放

em：
• 相对于当前元素
• 受父元素影响
• 可能产生连锁反应

使用建议：
• 字号 → rem
• 间距 → rem
• 组件内 → em
• 可组合性 → em`,
    tags: ['CSS', '单位'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-vw-001',
    module: 'core',
    chapterId: 'html-css',
    category: '单位',
    question: '100vw 和 100% 有什么区别？',
    answer: `100vw vs 100%：

100vw：
• 视口宽度的 100%
• 包含滚动条（如果有）
• 滚动条宽度会影响

100%：
• 父元素宽度的 100%
• 父元素 = 视口时 = 100vw
• 不包含滚动条

问题场景：
移动端 100% 宽度是视口
100vw 可能导致水平滚动

解决方案：
• 使用 100%
• 或 overflow-x: hidden`,
    tags: ['CSS', 'vw', '100%'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-animation-001',
    module: 'core',
    chapterId: 'html-css',
    category: '动画',
    question: 'CSS 动画和 JavaScript 动画有什么区别？',
    answer: `CSS 动画：
• GPU 加速
• 主线程外执行
• 声明式，简洁
• 适合简单动画
• 性能好

JavaScript 动画：
• 主线程执行
• 可控性强
• 适合复杂逻辑
• requestAnimationFrame
• 可暂停/反向

选择原则：
• 简单效果 → CSS
• 复杂交互 → JS
• 可结合使用`,
    tags: ['CSS', '动画'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-transform-001',
    module: 'core',
    chapterId: 'html-css',
    category: '动画',
    question: 'transform 和 top/left 动画哪个性能更好？为什么？',
    answer: `transform 性能更好：

top/left：
• 触发重排（reflow）
• 改变几何属性
• 计算量更大

transform：
• 只触发重绘（repaint）
• 或仅合成层
• GPU 加速
• 触发合成层时会跳过重排重绘

触发合成层的属性：
• transform
• opacity
• filter（部分）
• will-change`,
    tags: ['CSS', 'transform'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-will-change-001',
    module: 'core',
    chapterId: 'html-css',
    category: '性能',
    question: 'will-change 是什么？如何正确使用？',
    answer: `will-change：
提示浏览器即将发生变化的属性

正确用法：
will-change: transform;
will-change: opacity;
will-change: scroll-position;

错误用法：
will-change: all;  /* 过度优化 */
will-change: transform; /* 始终保持 */

最佳实践：
• 动画开始前设置
• 动画结束后移除
• 只在必要时使用
• 不要滥用`,
    tags: ['CSS', 'will-change'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-custom-properties-001',
    module: 'core',
    chapterId: 'html-css',
    category: 'CSS变量',
    question: 'CSS 自定义属性（CSS Variables）有什么作用？',
    answer: `CSS Variables：
• 定义可复用的值
• --variable-name 语法
• var() 函数使用

作用：
• 主题切换
• 组件样式覆盖
• 减少重复

示例：
:root {
  --primary: #3498db;
  --spacing: 16px;
}

.button {
  background: var(--primary);
  padding: var(--spacing);
}`,
    tags: ['CSS', '变量'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-semantic-001',
    module: 'core',
    chapterId: 'html-css',
    category: '语义化',
    question: 'HTML 语义化有什么意义？常用语义标签有哪些？',
    answer: `语义化意义：
• SEO 优化
• 可访问性（屏幕阅读器）
• 代码可维护性
• 搜索引擎理解内容

常用语义标签：
• header / footer
• nav
• main
• article / section
• aside
• figure / figcaption
• time / mark
• button（非 div 按钮）
• input（非 div 输入框）`,
    tags: ['HTML', '语义化'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-css-in-js-001',
    module: 'core',
    chapterId: 'html-css',
    category: '样式方案',
    question: 'CSS Modules、Styled Components、Tailwind CSS 有什么区别？',
    answer: `CSS Modules：
• 编译时处理
• 类名哈希化
• 本地作用域

Styled Components：
• 运行时处理
• 模板字符串样式
• React 常用

Tailwind CSS：
• 原子化 CSS
• 类名组合样式
• JIT 编译器
• 不生成 CSS 文件

选择建议：
• Vue/传统项目 → CSS Modules
• React 新项目 → Styled/Tailwind
• 快速开发 → Tailwind`,
    tags: ['CSS', 'CSS Modules', 'Tailwind'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-filter-001',
    module: 'core',
    chapterId: 'html-css',
    category: '滤镜',
    question: 'CSS filter 有哪些常用效果？',
    answer: `常用 filter 效果：

• blur(5px)：高斯模糊
• brightness(1.2)：亮度
• contrast(1.5)：对比度
• grayscale(1)：灰度
• sepia(0.5)：棕褐色
• saturate(2)：饱和度
• hue-rotate(90deg)：色相旋转
• drop-shadow：阴影

组合使用：
filter: blur(2px) brightness(1.1);`,
    tags: ['CSS', 'filter'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'html-css-clip-path-001',
    module: 'core',
    chapterId: 'html-css',
    category: '裁剪',
    question: 'clip-path 有什么用？有哪些常用形状？',
    answer: `clip-path：
裁剪元素可见区域

常用形状：
• circle()：圆形
• ellipse()：椭圆
• polygon()：多边形
• inset()：内矩形
• url()：SVG 路径

示例：
clip-path: circle(50%);
clip-path: polygon(0 0, 100% 0, 100% 100%);
clip-path: inset(10px 20px);`,
    tags: ['CSS', 'clip-path'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-container-queries-001',
    module: 'core',
    chapterId: 'html-css',
    category: '容器查询',
    question: '什么是容器查询（Container Queries）？',
    answer: `容器查询：
• 根据容器尺寸样式
• 而非视口尺寸

对比媒体查询：
媒体查询：@media (width: 600px)
容器查询：@container (width: 400px)

使用方式：
1. 声明容器：
container-type: inline-size;
container-name: card;

2. 使用查询：
@container card (width > 400px) { ... }`,
    tags: ['CSS', '容器查询'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'html-css-layer-001',
    module: 'core',
    chapterId: 'html-css',
    category: '级联层',
    question: '@layer 是什么？如何使用？',
    answer: `@layer：
级联层，控制样式优先级

使用方式：
@layer base {
  button { ... }
}
@layer utilities {
  .mt-1 { margin-top: 1px; }
}

优先级：
• 后声明的 layer 优先级更高
• layer 外样式 > 所有 layer

应用场景：
• 第三方库样式覆盖
• 样式优先级管理
• CSS 方法论`,
    tags: ['CSS', '@layer'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'html-css-has-001',
    module: 'core',
    chapterId: 'html-css',
    category: '选择器',
    question: ':has() 选择器有什么用？',
    answer: `:has()：
父选择器，根据子元素选择父元素

示例：
/* 有 img 子元素的 a */
a:has(img) { ... }

/* 有 :hover 状态的 label */
label:has(:hover) { ... }

/* 表单内任意 input 聚焦时的 label */
form:has(input:focus) label { ... }

优势：
• 实现父选择器
• 减少 JS 实现
• 条件样式`,
    tags: ['CSS', ':has'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'html-css-view-transitions-001',
    module: 'core',
    chapterId: 'html-css',
    category: '动画',
    question: 'CSS View Transitions 是什么？有什么应用场景？',
    answer: `View Transitions API：
• 跨页面/状态的平滑过渡
• 利用 View Transition API
• 自动捕捉 DOM 变化

应用场景：
1. SPA 页面切换
2. 列表到详情页过渡
3. 模态框打开/关闭
4. 图片放大预览

浏览器支持：
• Chrome 111+ 支持
• 渐进增强使用

语法：
document.startViewTransition(() => {
  // DOM 更新
});`,
    tags: ['CSS', 'View Transitions'],
    status: 'unvisited',
    difficulty: 'hard',
  },
];

const htmlCssChapter: Chapter = {
  id: 'html-css',
  module: 'core',
  title: 'HTML与CSS原理',
  description: 'BFC、Flexbox、Grid、选择器优先级、层叠上下文',
  cardCount: htmlCssCards.length,
  icon: '🎨',
};

const reactHooksCards: FlashCard[] = [
  {
    id: 'react-hooks-rules-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Hooks规则',
    question: 'React Hooks 的两条核心规则是什么？为什么？',
    answer: `## 规则一：只在顶层调用

- **不能**在条件/循环语句中调用
- 原因：Hooks 用**链表存储**，顺序很重要

## 规则二：只在 React 函数中调用

- 只能在**函数组件**或**自定义 Hook** 中调用
- 原因：React 通过**调用顺序**确定 Hook 身份`,
    tags: ['React', 'Hooks', '规则'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'react-hooks-usestate-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useState',
    question: 'useState 的函数式更新和普通更新有什么区别？',
    answer: `## 两种更新方式区别

| 类型 | 语法 | 依赖 |
|------|------|------|
| **普通更新** | setCount(count + 1) | 依赖外部状态 |
| **函数式更新** | setCount(prev => prev + 1) | 不依赖外部 |

### 为什么推荐函数式更新？

多次调用时，普通更新可能被**合并**（只加1次），
函数式更新基于**最新状态**，保证正确。`,
    tags: ['React', 'Hooks', 'useState'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 普通更新
setCount(count + 1);
setCount(count + 1);
// 如果 count=0，最终还是 1

// 函数式更新
setCount(prev => prev + 1);
setCount(prev => prev + 1);
// 如果 count=0，最终是 2 ✅`,
  },
  {
    id: 'react-hooks-useeffect-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useEffect',
    question: 'useEffect 的第二个参数依赖数组有什么作用？依赖缺失或过多会有什么问题？',
    answer: `## 依赖数组的作用

| 依赖数组 | 执行时机 |
|----------|----------|
| **不传** | 每次渲染后都执行 |
| **[]** | 只在首次渲染后执行 |
| **[dep]** | dep 变化时执行 |

### 依赖问题

- **依赖过多**：频繁执行
- **依赖过少**：可能死循环或使用过期值
- **缺失依赖**：可能使用过期闭包值`,
    tags: ['React', 'Hooks', 'useEffect'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 问题：依赖缺失
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count 是旧值！
  }, 1000);
  return () => clearInterval(id);
}, []); // count 未在依赖中 ❌

// 正确做法
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // 使用函数式更新 ✅
  }, 1000);
  return () => clearInterval(id);
}, []); // 不依赖外部值`,
  },
  {
    id: 'react-hooks-useeffect-cleanup-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useEffect',
    question: 'useEffect 的 cleanup 函数什么时候执行？有哪些典型场景？',
    answer: `Cleanup 执行时机：
• 组件卸载时
• 每次 effect 重新执行前

典型场景：
• 取消订阅（WebSocket、EventSource）
• 清除定时器（setInterval、setTimeout）
• 移除事件监听
• 取消请求
• 释放资源`,
    tags: ['React', 'Hooks', 'useEffect'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `useEffect(() => {
  const subscription = eventSource.subscribe(handleEvent);
  const timer = setInterval(() => tick(), 1000);
  window.addEventListener('resize', handleResize);

  // cleanup 函数
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
    window.removeEventListener('resize', handleResize);
  };
}, [handleEvent]);`,
  },
  {
    id: 'react-hooks-usememo-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useMemo',
    question: 'useMemo 和 useCallback 有什么区别？分别在什么场景使用？',
    answer: `## 区别

| Hook | 缓存内容 | 返回值 |
|------|----------|--------|
| **useMemo** | 计算结果 | 值 |
| **useCallback** | 函数引用 | 函数 |

### useMemo 场景

- **expensive calculation**（复杂计算）
- **referential equality**（引用相等，如对象、数组）

### useCallback 场景

- 传递给子组件的回调
- 作为其他 Hook 的依赖
- 配合 **React.memo** 优化`,
    tags: ['React', 'Hooks', 'useMemo', 'useCallback'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// useMemo：缓存计算结果
const sortedList = useMemo(() => {
  return items.slice().sort((a, b) => a.price - b.price);
}, [items]);

// useCallback：缓存函数
const handleClick = useCallback((id) => {
  dispatch({ type: 'SELECT', payload: id });
}, [dispatch]);

// 传递给 memo 化的子组件
const Button = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);
<Button onClick={handleClick} />`,
  },
  {
    id: 'react-hooks-useref-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useRef',
    question: 'useRef 除了存储 DOM 还有什么用途？为什么 ref 变化不触发重渲染？',
    answer: `## useRef 用途

- 存储 **DOM 引用**
- 存储**可变值**（不触发重渲染）
- 存储**上一次**的某个值
- 替代**实例属性**（this.xxx）

### 为什么不变更渲染？

- ref 的 .current **不是 React 控制的状态**
- 修改 .current **不会触发** reconciliation
- 需要配合 useState 或 forceUpdate 才能触发渲染`,
    tags: ['React', 'Hooks', 'useRef'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 存储上一次的值
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// 存储可变值
function Timer() {
  const intervalRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return <div>{count}</div>;
}`,
  },
  {
    id: 'react-hooks-usecontext-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useContext',
    question: 'useContext 的工作原理是什么？如何避免不必要的重渲染？',
    answer: `useContext 原理：
• 监听 Provider 的 value 属性
• value 变化时触发重渲染
• 组件树中所有使用该 Context 的消费者

性能优化：
1. 拆分 Context（按需订阅）
2. Memo 包裹消费组件
3. 使用 useMemo 缓存 value
4. 状态提升到最小范围`,
    tags: ['React', 'Hooks', 'useContext'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `const ThemeContext = createContext('light');

// 拆分 Context
const ThemeContext = createContext({});
const UserContext = createContext({});

// 使用多个小 Context
<ThemeContext.Provider value={theme}>
  <UserContext.Provider value={user}>
    <App />
  </UserContext.Provider>
</ThemeContext.Provider>

// 使用时只订阅需要的
const theme = useContext(ThemeContext); // 只监听 theme
const user = useContext(UserContext);   // 只监听 user`,
  },
  {
    id: 'react-hooks-custom-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '自定义Hooks',
    question: '什么是自定义 Hook？它有什么优势？请举例说明',
    answer: `自定义 Hook：
• 以 use 开头的函数
• 内部可调用其他 Hook
• 复用状态逻辑

优势：
• 逻辑复用（DRY）
• 关注点分离
• 易于测试
• 更好的代码组织`,
    tags: ['React', 'Hooks', '自定义Hooks'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 自定义 Hook：监听窗口尺寸
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用
const { width, height } = useWindowSize();`,
  },
  {
    id: 'react-hooks-uselayouteffect-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useLayoutEffect',
    question: 'useLayoutEffect 和 useEffect 有什么区别？什么场景下必须用 useLayoutEffect？',
    answer: `区别：
• useEffect：异步执行，不阻塞视觉更新
• useLayoutEffect：同步执行，DOM 更新后立即执行

必须用 useLayoutEffect 的场景：
• 需要读取 DOM 布局（getBoundingClientRect）
• 需要手动修改 DOM（改变样式）
• 需要视觉同步更新（避免闪烁）
• 弹窗定位、tooltip 显示

原则：能用 useEffect 就不用 useLayoutEffect（性能更好）`,
    tags: ['React', 'Hooks', 'useLayoutEffect'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// useLayoutEffect 场景：获取 DOM 尺寸后定位
function Tooltip({ target, children }) {
  const [position, setPosition] = useState({});
  const ref = useRef();

  useLayoutEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left + rect.width
    });
  }, [target]);

  return (
    <div ref={ref} style={position}>
      {children}
    </div>
  );
}`,
  },
  {
    id: 'react-hooks-usereducer-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useReducer',
    question: 'useReducer 和 useState 有什么区别？什么场景适合 useReducer？',
    answer: `## 区别

| Hook | 适用场景 |
|------|----------|
| **useState** | 单个状态值 |
| **useReducer** | 复杂状态逻辑（多个相关状态） |

### useReducer 优势

- 状态更新逻辑**集中**
- **易于测试**
- 适合**复杂状态转换**
- 可配合 **dispatch** 传递

### 适用场景

- 相关状态成组（如 form 的多个字段）
- 下一个状态依赖上一个状态
- 状态逻辑复杂，action 类型清晰`,
    tags: ['React', 'Hooks', 'useReducer'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// useReducer 示例
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error('Unknown action');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}`,
  },
  {
    id: 'react-hooks-initialized-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Hooks原理',
    question: 'React Hooks 的实现原理是什么？为什么链表存储很重要？',
    answer: `Hooks 实现原理：
• 函数组件调用时创建 Hooks 链表
• 每个 Hook 是链表节点 { memoizedState, next }
• 通过链表顺序确定 Hook 身份

为什么链表重要：
• 组件每次渲染按相同顺序调用 Hooks
• 顺序决定了每个 Hook 的"位置"
• 打破顺序会导致 Hook 身份错乱

fiber.memoizedState 指向 Hooks 链表头`,
    tags: ['React', 'Hooks', '原理'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hooks-usestate-impl-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useState原理',
    question: 'useState 的更新为什么是异步的？React 18 有什么变化？',
    answer: `useState 异步原因：
• 性能优化：避免每次 setState 都重新渲染
• 批处理（Batch）：合并多次状态更新
• 同一事件内的多次 setState 只触发一次渲染

React 18 变化：
• Automatic Batching：所有场景自动批处理
• 包括 setTimeout、Promise、fetch 回调
• 减少了不必要的渲染次数`,
    tags: ['React', 'Hooks', 'useState'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hooks-dependency-empty-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useEffect',
    question: '为什么 useEffect 依赖数组为空时仍然可能重复执行？',
    answer: `依赖数组为空仍可能重复执行的原因：

1. React.StrictMode（开发环境）
   • 会故意双挂载来检测副作用问题

2. 组件卸载后重新挂载

3. 父组件重新渲染导致子组件重挂载

4. React 18 之前版本的某些行为

使用 useRef 避免重复初始化：
const timerRef = useRef(null);
useEffect(() => {
  if (!timerRef.current) {
    timerRef.current = setInterval(...);
  }
}, []);`,
    tags: ['React', 'Hooks', 'useEffect'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-hooks-deps-compare-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useEffect',
    question: 'useEffect 依赖数组的比较机制是什么？是浅比较还是深比较？',
    answer: `## 依赖数组比较机制

- **Object.is()** 逐项比较
- Object.is 比 === 更**严格**（能区分 +0/-0、NaN）

### 特点

- **引用类型永远不等**（除非同一引用）
- 对象、数组、函数每次渲染都是**新引用**
- 常见错误：内联对象/函数导致频繁执行

### 正确做法

- 提取**子组件**
- **useMemo/useCallback** 缓存引用
- 考虑**状态重构**`,
    tags: ['React', 'Hooks', 'useEffect'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 问题：每次渲染都是新对象
useEffect(() => {
  fetchData({ page: 1, pageSize: 10 });
}, [{ page: 1, pageSize: 10 }]); // 每次渲染都是新数组 ❌

// 正确做法
const params = useMemo(() => ({ page: 1, pageSize: 10 }), []);
useEffect(() => {
  fetchData(params);
}, [params]); // params 引用不变 ✅

// 函数依赖用 useCallback
const fetchData = useCallback((params) => {
  // ...
}, []);`,
  },
  {
    id: 'react-hooks-fetch-data-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '数据获取',
    question: '在 useEffect 中如何正确进行数据获取？为什么要 cleanup？',
    answer: `数据获取模式：

基础版（需要 cleanup）：
useEffect(() => {
  let cancelled = false;
  fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      if (!cancelled) setUser(data);
    });
  return () => { cancelled = true; };
}, [userId]);

更佳方案（使用 AbortController）：
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/user', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => controller.abort();
}, [userId]);`,
    tags: ['React', 'Hooks', '数据获取'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hooks-memo-comparison-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '性能优化',
    question: 'React.memo、useMemo、useCallback 三者如何配合使用才能最大化优化效果？',
    answer: `三者配合策略：

1. React.memo：包装子组件
2. useMemo：缓存计算结果
3. useCallback：缓存回调函数

最佳实践：
• 父组件用 useCallback 缓存要传递的函数
• 子组件用 React.memo 防止不必要的重渲染
• 配合 useMemo 缓存传递给子组件的对象/数组`,
    tags: ['React', 'Hooks', 'memo'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `const Parent = ({ list }) => {
  const [query, setQuery] = useState('');

  // 缓存回调
  const handleSelect = useCallback((id) => {
    dispatch({ type: 'SELECT', payload: id });
  }, [dispatch]);

  // 缓存派生数据
  const filteredList = useMemo(
    () => list.filter(item => item.name.includes(query)),
    [list, query]
  );

  // 子组件 memo 化
  return (
    <>
      <SearchBar onChange={setQuery} />
      <List items={filteredList} onSelect={handleSelect} />
    </>
  );
};

const List = React.memo(({ items, onSelect }) => {
  // 只在 items 或 onSelect 变化时重渲染
  return items.map(item => (
    <ListItem key={item.id} item={item} onSelect={onSelect} />
  ));
});`,
  },
  {
    id: 'react-hooks-state-batching-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '状态更新',
    question: 'React 18 的 useTransition 和 useDeferredValue 有什么用？',
    answer: `useTransition：
• 标记状态更新为可中断
• 保持 UI 响应

useDeferredValue：
• 延迟更新某个值
• 返回可能"过期"的值

使用场景：
• 搜索输入：快速响应打字，延迟搜索结果
• 列表渲染：快速显示列表，延迟排序/过滤`,
    tags: ['React', 'Hooks', '并发'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// useTransition
function Search() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [deferredQuery, setDeferredQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    startTransition(() => {
      setDeferredQuery(e.target.value);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results query={deferredQuery} />}
    </div>
  );
}

// useDeferredValue
function Search({ query }) {
  const deferredQuery = useDeferredValue(query);
  return <Results query={deferredQuery} />;
}`,
  },
  {
    id: 'react-hooks-usestate-init-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useState',
    question: 'useState 的惰性初始化是什么？为什么要用函数初始化状态？',
    answer: `惰性初始化：
• 传入函数而非值
• 只在首次渲染时执行
• 后续渲染不再执行

为什么要用：
• 初始状态计算昂贵（大量数据、复杂计算）
• 避免每次渲染都计算
• 保持初始化逻辑与渲染分离`,
    tags: ['React', 'Hooks', 'useState'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 每次渲染都执行（可能昂贵）
const [state, setState] = useState(computeExpensiveValue(props));

// 惰性初始化：只在首次执行
const [state, setState] = useState(() => computeExpensiveValue(props));

// 典型场景：解析 URL 参数
const [params, setParams] = useState(() => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10
  };
});`,
  },
  {
    id: 'react-hooks-forceupdate-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '强制更新',
    question: '函数组件如何实现 forceUpdate？有没有官方 API？',
    answer: `函数组件 forceUpdate 方法：

官方 API（React 18+）：
没有直接的 forceUpdate，但可用：

1. useReducer（推荐）：
const [_, forceUpdate] = useReducer(x => x + 1, 0);

2. useRef + setState 组合：
const [count, setCount] = useState(0);
const forceUpdate = () => setCount(c => c + 1);

注意：大多数场景不需要 forceUpdate，
应该用状态管理或 ref 替代。`,
    tags: ['React', 'Hooks', 'forceUpdate'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// useReducer 实现
function useForceUpdate() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  return forceUpdate;
}

// 使用
function Counter() {
  const forceUpdate = useForceUpdate();
  const [state, setState] = useState({ value: 0 });

  // 当 state.value 变化但组件不更新时
  const handleChange = () => {
    state.value = Math.random();
    forceUpdate(); // 强制更新
  };

  return <button onClick={handleChange}>{state.value}</button>;
}`,
  },
  {
    id: 'react-hooks-async-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '异步',
    question: 'useEffect 中使用 async/await 有什么问题？如何解决？',
    answer: `useEffect + async 问题：
• async 函数返回 Promise
• useEffect 应返回 cleanup 函数
• async 隐式返回 Promise，不是 cleanup 函数

解决方案：
方案1：定义 async 函数，内部调用
方案2：使用 IIFE
方案3：使用 useQuery 等数据获取库（推荐）`,
    tags: ['React', 'Hooks', 'async'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// ❌ 问题写法
useEffect(async () => {
  const data = await fetchData();
  setData(data);
}, []);

// ✅ 正确写法1：定义函数后调用
useEffect(() => {
  async function fetchAndSet() {
    const data = await fetchData();
    setData(data);
  }
  fetchAndSet();
}, []);

// ✅ 正确写法2：IIFE
useEffect(() => {
  (async () => {
    const data = await fetchData();
    setData(data);
  })();
}, []);

// ✅ 正确写法3：cleanup + AbortController
useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const data = await fetchData(controller.signal);
      setData(data);
    } catch (err) {
      if (err.name !== 'AbortError') throw err;
    }
  })();
  return () => controller.abort();
}, []);`,
  },
  {
    id: 'react-hooks-context-selector-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useContext',
    question: 'useContext 为什么在 Provider value 变化时会导致所有消费者重渲染？如何优化？',
    answer: `问题原因：
• Context 比较 value 引用
• Provider 重新渲染时 value 是新对象
• 所有 useContext 都感知到变化

优化方案：

1. 拆分 Context：
   将不同的 context 分离

2. Memo 化 value：
   const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

3. 状态提升：
   只在必要的祖先组件提供 Context

4. 使用选择器模式：
   react-tracked、zustand 等库提供细粒度订阅`,
    tags: ['React', 'Hooks', 'Context'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 问题
const ThemeContext = createContext();
function App() {
  return (
    <ThemeContext.Provider value={{ theme, setTheme, user }}>
      <ComponentA />
      <ComponentB />
    </ThemeContext.Provider>
  );
}

// 优化1：拆分 Context
const ThemeContext = createContext();
const UserContext = createContext();

<ThemeContext.Provider value={theme}>
  <UserContext.Provider value={user}>
    <ComponentA />
  </UserContext.Provider>
</ThemeContext.Provider>

// 优化2：Memo 化 value
const value = useMemo(() => ({
  theme,
  setTheme
}), [theme, setTheme]);

<ThemeContext.Provider value={value}>
  <ComponentA />
</ThemeContext.Provider>`,
  },
  {
    id: 'react-hooks-suspense-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Suspense',
    question: 'React 18 的 use 是什么？它和 useEffect 有什么区别？',
    answer: `use（Experimental）：
• React 18 新提案，可直接在组件中读取 Promise/Context
• 可在条件语句和循环中使用
• 支持 Promise 和 Context 两种数据源

与 useEffect 区别：
• use：同步读取，Suspend 直到数据就绪
• useEffect：异步执行，可能需要 loading 状态
• use：更声明式，数据就绪前显示 Suspense fallback`,
    tags: ['React', 'Hooks', 'use'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// use 读取 Promise（实验性）
import { use } from 'react';

function User({ userPromise }) {
  const user = use(userPromise); // Suspense 会处理 loading
  return <div>{user.name}</div>;
}

// use 读取 Context
function ThemedButton() {
  const theme = use(ThemeContext); // 直接读取，无需 useContext
  return <button className={theme} />;
}

// 可以在条件中使用
function UserOrGuest({ showUser, userPromise, guest }) {
  if (showUser) {
    return use(userPromise).name;
  }
  return guest;
}`,
  },
  {
    id: 'react-hooks-class-vs-function-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '对比',
    question: 'React 类组件和函数组件在状态管理上有什么区别？',
    answer: `类组件状态管理：
• this.state 是对象
• this.setState 自动合并顶层状态
• 需要绑定 this

函数组件状态管理：
• useState 返回 [state, setState]
• 多个状态需多次调用
• setState 不自动合并
• 不存在 this 问题

主要差异：
• 类组件：所有状态在一个对象
• 函数组件：每个状态独立
• setState 合并行为不同
• this 绑定问题消失`,
    tags: ['React', 'Hooks', '状态管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-hooks-ref-vs-state-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Hooks对比',
    question: 'useRef 和 useState 有什么区别？什么时候用哪个？',
    answer: `useRef vs useState：

useState：
• 状态变化触发重渲染
• 更新是异步的（批量）
• 适合 UI 相关状态

useRef：
• .current 变化不触发重渲染
• 更新是同步的
• 适合存储 DOM 或不渲染的值

选择原则：
• 需要更新 UI → useState
• 只需存储值，不需渲染 → useRef
• 不确定时优先 useState`,
    tags: ['React', 'Hooks', 'useRef', 'useState'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-hooks-id-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Hooks',
    question: '为什么 useRef 返回的对象在每次渲染时都保持同一个引用？',
    answer: `useRef 的特性：
• 首次渲染时创建并返回同一对象
• 后续渲染返回同一个 ref 对象
• .current 可变但不触发重渲染

实现原理：
• useRef 内部使用 useMemo 缓存
• 不依赖任何外部值
• 每次调用返回同一 ref 对象

应用：
• 保持组件级别的值
• 记录上一次的 props/state
• 存储定时器 ID`,
    tags: ['React', 'Hooks', 'useRef'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hooks-iteration-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Hooks',
    question: '为什么 Hooks 不能在循环、条件语句中使用？',
    answer: `Hooks 不能在条件/循环中使用的原因：

实现机制：
• Hooks 用链表存储
• 通过调用顺序确定 Hook 身份
• 每次渲染按相同顺序遍历链表

破坏机制的情况：
• 条件语句：某些渲染跳过 Hook
• 循环语句：Hook 数量不固定
• 结果：链表顺序错乱，状态错配

规则本质：
• 固定调用顺序比灵活性更重要
• React 通过规则保证正确性`,
    tags: ['React', 'Hooks', '规则'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hooks-expensive-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '性能优化',
    question: '如何判断一个计算是否昂贵（Expensive）？',
    answer: `昂贵计算的特征：
• 大数据排序/过滤
• 复杂数学运算
• 深层对象拷贝
• 正则表达式
• JSON 序列化

判断方法：
1. console.time 测量
2. Chrome Performance 面板
3. React DevTools Profiler

优化时机：
• 测量后再优化
• 不是所有计算都需要优化
• 小计算优化可能适得其反`,
    tags: ['React', 'Hooks', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-hooks-stale-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: '闭包陷阱',
    question: '什么是 Hooks 的"闭包陷阱"？如何避免？',
    answer: `闭包陷阱：
• Hooks 捕获创建时的值
• 值变化但 Hook 仍用旧值
• 常见于 useEffect 依赖缺失

典型问题：
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count 是旧值！
  }, 1000);
  return () => clearInterval(id);
}, []); // 依赖为空！

解决方案：
1. 函数式更新：setCount(prev => prev + 1)
2. 正确依赖：加入 count
3. useRef 保存最新值`,
    tags: ['React', 'Hooks', '闭包'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 问题代码
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // 永远是 1
  }, 1000);
  return () => clearInterval(id);
}, []);

// 解决方案1：函数式更新
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);

// 解决方案2：useRef 保存最新值
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);
useEffect(() => {
  const id = setInterval(() => {
    setCount(countRef.current + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);`,
  },
  {
    id: 'react-hooks-dispatch-stable-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'useState',
    question: '为什么 useState 的 setState 是稳定的？',
    answer: `setState 稳定性的原因：

React 内部实现：
• useState 返回的 setState 被 memoized
• 组件每次渲染返回同一个函数引用
• 不会因为 state 变化而变化

设计考量：
• 避免子组件因父组件重渲染而重渲染
• useCallback 不需要包裹 setState
• 传递给子组件的回调不需要 useCallback

性能优势：
• 减少不必要的子组件重渲染
• 简化依赖数组`,
    tags: ['React', 'Hooks', 'useState'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hooks-async-suspense-001',
    module: 'core',
    chapterId: 'react-hooks',
    category: 'Suspense',
    question: 'Suspense 和 ErrorBoundary 有什么关系？可以嵌套吗？',
    answer: `Suspense 与 ErrorBoundary：

Suspense：
• 处理异步加载状态
• 展示 fallback
• 搭配 lazy 使用

ErrorBoundary：
• 捕获渲染错误
• 展示降级 UI
• 替代 componentDidCatch

关系：
• 可嵌套使用
• ErrorBoundary 捕获 Suspense 错误
• Suspense 包裹 ErrorBoundary 各自处理

嵌套示例：
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>`,
    tags: ['React', 'Hooks', 'Suspense', 'ErrorBoundary'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

const reactHooksChapter: Chapter = {
  id: 'react-hooks',
  module: 'core',
  title: 'React Hooks深入',
  description: 'Hooks规则、useState原理、useEffect陷阱、useCallback/useMemo',
  cardCount: reactHooksCards.length,
  icon: '🪝',
};

export const coreChapters: Chapter[] = [
  javascriptChapter,
  typescriptChapter,
  htmlCssChapter,
  browserChapter,
  reactCoreChapter,
  reactHooksChapter,
  engineeringChapter,
  performanceChapter,
  aiEngineeringChapter,
  systemDesignChapter,
];

export const coreCards: FlashCard[] = [
  ...javascriptCards,
  ...typescriptCards,
  ...htmlCssCards,
  ...browserCards,
  ...reactCoreCards,
  ...reactHooksCards,
  ...engineeringCards,
  ...performanceCards,
  ...aiEngineeringCards,
  ...systemDesignCards,
];
