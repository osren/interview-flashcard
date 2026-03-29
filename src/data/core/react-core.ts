import { FlashCard, Chapter } from '@/types';

export const reactCoreCards: FlashCard[] = [
  {
    id: 'react-fiber-why-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Fiber架构',
    question: '为什么需要 React Fiber？它解决了什么问题？',
    answer: `## React 15 的问题

- **Stack Reconciler** 是同步递归的
- 一旦开始**必须执行完成**
- 长任务会**阻塞主线程**（>16ms 就卡顿）
- **无法处理优先级**

## Fiber 解决的问题

- **可中断、可恢复**的渲染
- **任务优先级**调度
- 支持 **Concurrent Mode**
- **Suspense**、**useTransition** 等特性`,
    tags: ['React', 'Fiber', '架构'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-fiber-structure-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Fiber架构',
    question: 'Fiber 数据结构有哪些关键属性？请说明',
    answer: `## Fiber 关键属性

### 关系链表

| 属性 | 说明 |
|------|------|
| **return** | 父 Fiber |
| **child** | 第一个子 Fiber |
| **sibling** | 下一个兄弟 |

### 状态

| 属性 | 说明 |
|------|------|
| **stateNode** | 对应真实 DOM |
| **memoizedState** | Hooks 状态 |
| **memoizedProps** | 上一次 props |

### 更新

| 属性 | 说明 |
|------|------|
| **pendingProps** | 即将应用的 props |
| **updateQueue** | 更新队列 |

### 副作用

| 属性 | 说明 |
|------|------|
| **flags** | Placement/Update/Deletion |
| **lanes** | 优先级 |

### 双缓冲

**alternate**: workInProgress 树对应节点`,
    tags: ['React', 'Fiber', '数据结构'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-diff-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Diff算法',
    question: 'React Diff 算法的三大策略是什么？',
    answer: `## React Diff 三大策略

### 策略一：同级比较

- DOM 节点**不会跨层移动**
- 跨层移动会被认为**销毁+重建**

### 策略二：类型比较

- **tag**（标签名/组件类型）不同则**删重建**
- \`<div> → <span>\` 完全重建

### 策略三：Key 优化

- 通过 **key** 标记节点身份
- key 相同则**复用**，key 不同则**重建**
- 用**唯一稳定 ID**，不用 index`,
    tags: ['React', 'Diff', '调和'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-diff-key-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Diff算法',
    question: '为什么不能用 index 作为 key？会产生什么问题？',
    answer: `## 问题场景

原列表：[A, B, C]，key = [0, 1, 2]
中间插入 D 后：[A, D, B, C]，key = [0, 1, 2, 3]

## React Diff 结果

| key | 原元素 | 新元素 | 结果 |
|-----|--------|--------|------|
| **0** | A | A | 复用 ✅ |
| **1** | B | D | 错误复用！B 的状态污染 D ❌ |
| **2** | C | B | 错误复用！C 的状态污染 B ❌ |
| **3** | 无 | C | 新建 ✅ |

## 结论

**用唯一稳定的 ID 作为 key**`,
    tags: ['React', 'Diff', 'key'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-render-commit-001',
    module: 'core',
    chapterId: 'react-core',
    category: '渲染阶段',
    question: 'React 的 Render Phase 和 Commit Phase 有什么区别？',
    answer: `## 两种 Phase 对比

| Phase | 可中断 | 主要工作 |
|-------|--------|----------|
| **Render Phase** | ✅ 可中断 | 计算差异、构建 Fiber 树、标记 flags |
| **Commit Phase** | ❌ 不可中断 | 应用 DOM 变更、执行副作用、触发生命周期 |

## 为什么 Commit 不能中断？

因为 **DOM 已经修改**，用户可能看到半成品 UI`,
    tags: ['React', '渲染', 'Fiber'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-concurrent-001',
    module: 'core',
    chapterId: 'react-core',
    category: '并发模式',
    question: '什么是 Concurrent Mode？Lane 模型是什么？',
    answer: `## Concurrent Mode

React 18 引入的新特性，**同时处理多个状态更新**，根据优先级智能调度。

## Lane 模型（优先级赛道）

| 优先级 | 名称 | 用途 |
|--------|------|------|
| **最高** | SyncLane | 用户交互 |
| **高** | InputContinuousLane | 拖拽、滚动 |
| **中** | DefaultLane | 默认 |
| **低** | TransitionLane | startTransition（可中断） |
| **最低** | IdleLane | 预渲染 |

### 调度原则

**高优先级可以打断低优先级更新**`,
    tags: ['React', 'Concurrent', 'Lane'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-start-transition-001',
    module: 'core',
    chapterId: 'react-core',
    category: '并发模式',
    question: 'startTransition 解决了什么问题？什么时候用？',
    answer: `## 解决的问题

用户输入触发大量计算时，区分**"紧急更新"**和**"可等待更新"**。

### 典型场景

搜索输入时，输入框要**立即响应**，但搜索结果可以**延迟**。

## 用法

\`\`\`javascript
startTransition(() => {
  setDeferredQuery(value); // 低优先级，可中断
});

// 输入框立即更新（紧急）
setQuery(value);
\`\`\``,
    tags: ['React', 'startTransition', '并发'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `function Search() {
  const [query, setQuery] = useState('');
  const [deferredQuery, setDeferredQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value); // 紧急：输入框立即更新
    startTransition(() => {
      setDeferredQuery(e.target.value); // 低优先级
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      <List items={filterItems(deferredQuery)} />
    </>
  );
}`,
  },
  {
    id: 'react-reconciliation-001',
    module: 'core',
    chapterId: 'react-core',
    category: '调和',
    question: 'React 的调和（Reconciliation）是什么？它和渲染是什么关系？',
    answer: `## 调和 vs 渲染

| 概念 | 定义 |
|------|------|
| **调和** | Diff 算法计算差异的过程（Virtual DOM） |
| **渲染** | 将差异应用到真实 DOM |

## 两者关系

- 调和是 **Pure JS 计算**，可中断
- 渲染涉及 **DOM 变更**，不可中断
- 批量更新减少渲染次数
- concurrent mode 可**并发执行**调和`,
    tags: ['React', '调和', 'Diff'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-fiber-workloop-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Fiber架构',
    question: 'React Fiber 的工作循环是什么？什么是 workInProgress 树？',
    answer: `## 工作循环（Work Loop）

- 每次循环处理**一个 Fiber 节点**
- 判断是否可以中断（\`!sync && priority\`）
- 协调子节点或完成当前节点

## 双缓冲技术

| 树 | 作用 |
|----|------|
| **current 树** | 屏幕上显示的 |
| **workInProgress 树** | 正在构建的 |

### 切换流程

1. 完成后切换指针（同时更新 **alternate**）
2. 减少白屏和闪烁\`\``,
    tags: ['React', 'Fiber', '双缓冲'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-fiber-schedule-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Fiber架构',
    question: 'React Fiber 如何实现任务优先级调度？',
    answer: `## Lane 模型

将更新分为**不同优先级赛道**：

| 优先级 | 名称 | 用途 |
|--------|------|------|
| **最高** | SyncLane | 同步更新 |
| **高** | InputContinuousLane | 拖拽、输入 |
| **中** | DefaultLane | 默认更新 |
| **低** | TransitionLane | startTransition |
| **最低** | IdleLane | 后台预渲染 |

## 调度流程

1. 发起更新时**标记 lane**
2. 调度时根据 **lane** 决定优先级
3. **高优先级可打断低优先级**
4. 完成后**清除 lane 标记**`,
    tags: ['React', 'Fiber', '调度'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-effect-phase-001',
    module: 'core',
    chapterId: 'react-core',
    category: '渲染阶段',
    question: 'React 的 layout phase 和 passive effect 有什么区别？',
    answer: `## 两种副作用时机对比

| 阶段 | Hook | 执行时机 | 特点 |
|------|------|----------|------|
| **layout phase** | useLayoutEffect | DOM 更新后 | 同步执行，可能阻塞渲染 |
| **passive effect** | useEffect | 浏览器 paint 后 | 异步执行，不阻塞视觉更新 |

## 选择原则

- 需要**读取 DOM** → useLayoutEffect
- 需要**异步不阻塞** → useEffect

## 典型场景

- **useLayoutEffect**：DOM 测量、手动操作 DOM
- **useEffect**：订阅、数据获取、事件监听`,
    tags: ['React', 'useEffect', 'useLayoutEffect'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-suspense-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Suspense',
    question: 'React Suspense 的原理是什么？它如何与 Concurrent Mode 配合？',
    answer: `## Suspense 原理

1. 子组件**抛出 Promise**（thrown value）
2. 边界捕获后显示 **fallback**
3. Promise 完成后**重新渲染**

## Concurrent Mode 配合

- \`<Suspense>\` 可包裹 transition 更新
- 等待期间显示 **fallback**
- **不阻塞其他高优先级交互**
- 实现**"加载时仍可交互"**`,
    tags: ['React', 'Suspense', 'Concurrent'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>

// concurrent mode 配合
<Suspense fallback={<Spinner />}>
  <ShipmentList />
</Suspense>`,
  },
  {
    id: 'react-server-components-001',
    module: 'core',
    chapterId: 'react-core',
    category: '服务端组件',
    question: '什么是 React Server Components？它和 SSR 有什么区别？',
    answer: `## Server Components vs SSR

| 特性 | SSR | Server Components |
|------|-----|-------------------|
| **渲染内容** | 完整 HTML | 组件（不打包到客户端） |
| **客户端水合** | 需要（Hydration） | 不需要 |
| **资源访问** | 有限 | 直接访问数据库、文件系统 |
| **客户端 JS** | 完整 bundle | 减少 bundle |
| **渲染时机** | 每次请求重新渲染 | 按需渲染 |

### 核心优势

- **减少客户端 JS bundle**
- **流式 HTML** 配合 Suspense`,
    tags: ['React', 'RSC', '服务端渲染'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-batching-001',
    module: 'core',
    chapterId: 'react-core',
    category: '批处理',
    question: 'React 18 之前的批处理和 18 的自动批处理有什么区别？',
    answer: `## React 17 批处理

- 仅限 **React 事件处理**内的 setState
- Promise、setTimeout、原生事件内**不会**批处理

## React 18 自动批处理

- **所有 setState 自动批处理**
- 包括 Promise、setTimeout、原生事件
- 减少不必要的渲染

## 退出批处理

用 **flushSync** 退出批处理（极端情况）`,
    tags: ['React', '批处理', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// React 17
setTimeout(() => {
  setCount(1); // 触发1次渲染
  setName('Bob'); // 触发1次渲染
}, 0);
// 17: 2次渲染
// 18: 1次渲染

// 退出批处理
import { flushSync } from 'react-dom';
flushSync(() => setCount(1)); // 立即渲染
flushSync(() => setName('Bob')); // 立即渲染`,
  },
  {
    id: 'react-state-update-001',
    module: 'core',
    chapterId: 'react-core',
    category: '状态更新',
    question: 'React 中的状态更新可能同步也可能异步的原因是什么？',
    answer: `## React 状态更新行为不一致的原因

### 在 React 控制范围内（同步）

- React 事件处理（onClick 等）
- React 生命周期
- React 管理的事件系统

### 不在 React 控制范围内（可能同步）

- 原生 addEventListener
- setTimeout / setInterval
- Promise.then / Ajax 回调

### 原因分析

- React 内部有 **batching 机制**
- 外部回调可能**绕开** batching
- React 18 通过 **createRoot** 统一为自动批处理`,
    tags: ['React', '状态更新', '批处理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-setstate-001',
    module: 'core',
    chapterId: 'react-core',
    category: '状态更新',
    question: 'setState 是同步还是异步的？为什么 bulk update 是对象而非函数时有时会出问题？',
    answer: `## setState 同步/异步取决于上下文

## 对象形式问题

React 可能将多个 setState **合并（batch）**，
如果多个对象形式同时执行，后面的会**覆盖**前面的。

## 函数形式优势

函数形式 \`(prev => next)\` 保证：

- 读取**最新状态**
- 多次调用顺序**正确**
- **避免合并**问题`,
    tags: ['React', 'setState'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 问题示例
this.setState({ count: 1 });
this.setState({ count: 2 }); // 可能被合并

// 函数形式
this.setState(prev => ({ count: prev.count + 1 }));
this.setState(prev => ({ count: prev.count + 1 }));
// 两次都正确执行

// React 18 改善
// 对象形式在事件结束时也会合并
// 但函数形式始终最安全`,
  },
  {
    id: 'react-diff-recursive-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Diff算法',
    question: 'React Diff 为什么是 O(n) 复杂度？它如何做到高效比较？',
    answer: `## Diff 复杂度分析

| 类型 | 复杂度 |
|------|--------|
| **传统树 diff** | O(n³) |
| **React 优化后** | O(n) |

## 三大限制策略

1. **同层对比**：只比较同层级节点
2. **组件类型对比**：不同类型重建
3. **Key 优化**：标记身份，减少移动

## 为什么是 O(n)？

因为只**遍历一次**，**同层比较**，**跨层直接重建**`,
    tags: ['React', 'Diff', '算法复杂度'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-components-types-001',
    module: 'core',
    chapterId: 'react-core',
    category: '组件',
    question: 'React 组件有哪些类型？类组件和函数组件有什么区别？',
    answer: `## 组件类型

- **类组件**：使用 ES6 class，继承 React.Component
- **函数组件**：使用函数，返回 JSX

## 类组件 vs 函数组件

| 方面 | 类组件 | 函数组件 |
|------|--------|----------|
| **语法** | class | function |
| **状态** | this.state | useState |
| **生命周期** | 生命周期方法 | useEffect |
| **this** | 需要 bind | 无 this 问题 |
| **渲染逻辑** | render 方法 | 直接返回 |
| **Hooks** | 不支持 | 专属 |

### 现代 React

**函数组件 + Hooks 是主流**`,
    tags: ['React', '组件', '类组件', '函数组件'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'react-pure-component-001',
    module: 'core',
    chapterId: 'react-core',
    category: '性能优化',
    question: 'React.PureComponent 和 Component 有什么区别？什么时候用？',
    answer: `## PureComponent vs Component

### 区别

- **PureComponent** 实现了 shouldComponentUpdate
- **浅比较** props 和 state
- props/state 没变化时**不重渲染**

### 使用场景

- UI 相对稳定
- 大量列表渲染
- 需要优化不必要的重渲染

### 注意事项

- 有引用类型（对象、数组）时需小心
- 配合**不可变数据**使用效果最佳

### 函数组件替代方案

**React.memo** = 函数组件版的 PureComponent`,
    tags: ['React', 'PureComponent', '性能'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `class List extends React.PureComponent {
  render() {
    return (
      <ul>
        {this.props.items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
}

// 函数组件用 React.memo
const List = React.memo(({ items }) => (
  <ul>
    {items.map(item => <li key={item.id}>{item.name}</li>)}
  </ul>
));`,
  },
  {
    id: 'react-memo-001',
    module: 'core',
    chapterId: 'react-core',
    category: '性能优化',
    question: 'React.memo、useMemo、useCallback 有什么区别？分别用在什么场景？',
    answer: `## 三个优化工具对比

| 工具 | 类型 | 缓存内容 | 使用场景 |
|------|------|----------|----------|
| **React.memo** | 高阶组件 | 组件渲染结果 | props 没变则跳过渲染 |
| **useMemo** | Hook | 计算值 | expensive calculation |
| **useCallback** | Hook | 回调函数 | 配合 React.memo 传递回调 |

### 核心区别

- **React.memo**：缓存**组件**
- **useMemo**：缓存**计算结果**
- **useCallback**：缓存**函数引用**`,
    tags: ['React', 'memo', 'useMemo', 'useCallback'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// React.memo
const List = React.memo(({ items }) => (
  items.map(i => <div key={i.id}>{i.name}</div>)
));

// useMemo
const sorted = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback
const handleClick = useCallback(
  (id) => dispatch({ type: 'SELECT', payload: id }),
  [dispatch]
);`,
  },
  {
    id: 'react-context-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Context',
    question: 'React Context 的原理是什么？它有什么性能问题？',
    answer: `## Context 原理

1. **createContext** 创建 Provider/Consumer
2. **Provider** 存储 value
3. **Consumer/Hook** 订阅 Provider 变化
4. 变化时**所有订阅者重新渲染**

## 性能问题

- value 变化时，**所有 Consumer 重渲染**
- 即使只用其中**一小部分**数据

## 优化方案

1. **拆分 Context**，按需订阅
2. **useMemo** 缓存 value
3. 状态提升到**最小范围**
4. 使用 **useContextSelector**（社区方案）`,
    tags: ['React', 'Context', '性能'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 创建 Context
const ThemeContext = createContext('light');

// 使用 Provider
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// 消费（Hook 方式，推荐）
const theme = useContext(ThemeContext);

// 消费（Consumer 方式）
<ThemeContext.Consumer>
  {value => <div>{value}</div>}
</ThemeContext.Consumer>`,
  },
  {
    id: 'react-error-boundary-001',
    module: 'core',
    chapterId: 'react-core',
    category: '错误处理',
    question: '什么是 Error Boundary？它能捕获哪些错误？',
    answer: `## Error Boundary

React 16 引入的组件，用于**捕获子组件渲染错误**。

### 能捕获

- 渲染期间的错误
- 生命周期错误
- 构造函数错误

### 不能捕获

- 事件处理（用 try/catch）
- 异步代码（setTimeout）
- 服务端渲染
- Boundary **自身**的错误`,
    tags: ['React', '错误边界'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了</h1>;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>`,
  },
  {
    id: 'react-portal-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Portal',
    question: 'React Portal 是什么？有什么应用场景？',
    answer: `## Portal

将子组件渲染到**父组件 DOM 树之外**的技术。

### 应用场景

- 模态对话框（Modal）
- 工具提示（Tooltip）
- 下拉菜单（Dropdown）
- 全屏 Overlay
- 解决 **z-index** 层叠问题

### 特点

- 事件冒泡仍按 **React 树**
- DOM 位置在 **React 树之外**
- 适合**视觉脱离但逻辑不离**的场景`,
    tags: ['React', 'Portal'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal">
      {children}
    </div>,
    document.body // 渲染到 body 下
  );
}

// 事件冒泡仍正常工作
function Parent() {
  return (
    <div onClick={handleClick}>
      <Modal>
        <button onClick={handleClick}>Click</button>
      </Modal>
    </div>
  );
}`,
  },
  {
    id: 'react-ref-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Ref',
    question: 'React Ref 的三种用法是什么？createRef 和 useRef 有什么区别？',
    answer: `## Ref 三种用法

1. **createRef / useRef** 创建 ref 对象
2. **回调 ref**：\`<div ref={node => this.node = node} />\`
3. **字符串 ref**（已废弃）

## createRef vs useRef

| 特性 | createRef | useRef |
|------|-----------|--------|
| **创建时机** | 每次渲染创建新引用 | 首次渲染创建，后续复用 |
| **返回值** | ref 对象 | ref 对象 |

### useRef 特性

- **.current** 变化**不触发重渲染**
- 适合存储**不渲染相关**的值（timer ID、DOM）`,
    tags: ['React', 'Ref'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 类组件
class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }
  focus() {
    this.textInput.current.focus();
  }
  render() {
    return <input ref={this.textInput} />;
  }
}

// 函数组件
function TextInput() {
  const inputRef = useRef(null);
  return <input ref={inputRef} />;
}

// useRef 存值
function Timer() {
  const intervalRef = useRef(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => tick(), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);
}`,
  },
  {
    id: 'react-forward-ref-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Ref',
    question: 'forwardRef 是什么？为什么需要它？',
    answer: `## forwardRef

React 提供的 API，让组件能够**接收并转发 ref**。

### 为什么需要

- 默认情况下组件**不能接收 ref**
- ref 默认挂载到**最外层 DOM**
- 某些场景需要**手动控制 ref 挂载位置**（如 input）

### 常见场景

- 高阶组件包装后传递 ref
- DOM 元素转发
- 类组件需要 ref`,
    tags: ['React', 'forwardRef'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// forwardRef 用法
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 使用
const ref = useRef();
<FancyButton ref={ref}>Click me</FancyButton>;
ref.current.focus();

// HOC 转发
function withLogging(WrappedComponent) {
  return React.forwardRef((props, ref) => {
    return <WrappedComponent {...props} ref={ref} />;
  });
}`,
  },
  {
    id: 'react-component-lifecycle-001',
    module: 'core',
    chapterId: 'react-core',
    category: '生命周期',
    question: 'React 类组件的生命周期有哪些？挂载、更新、卸载阶段分别执行什么？',
    answer: `## 生命周期阶段

### 挂载阶段

\`constructor\` → \`render\` → \`componentDidMount\`

### 更新阶段

\`render\` → \`componentDidUpdate\`

### 卸载阶段

\`componentWillUnmount\`

## 各阶段详细说明

| 阶段 | 方法 | 职责 |
|------|------|------|
| **挂载** | constructor | 初始化 state、绑定方法 |
| **挂载** | render | 返回 JSX |
| **挂载** | componentDidMount | DOM 已挂载，发起请求、订阅 |
| **更新** | componentDidUpdate | DOM 已更新，响应变化 |
| **卸载** | componentWillUnmount | 清理定时器、取消订阅 |`,
    tags: ['React', '生命周期'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'react-getderivedstate-001',
    module: 'core',
    chapterId: 'react-core',
    category: '生命周期',
    question: 'getDerivedStateFromProps 和 componentDidUpdate 的组合使用场景是什么？',
    answer: `## getDerivedStateFromProps

- **静态方法**，无副作用
- 返回对象**更新 state** 或 **null**

### 使用场景

- 根据 props **初始化** state
- props 变化时**同步更新** state

### 注意

过度使用会导致**代码复杂**

### 最佳实践

- 优先考虑**受控组件**（props 直接控制）
- 或者**组件组合**（提升状态）`,
    tags: ['React', '生命周期', 'getDerivedStateFromProps'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `class EmailInput extends Component {
  state = { email: this.props.defaultEmail };

  static getDerivedStateFromProps(props, state) {
    if (props.defaultEmail !== state.prevDefaultEmail) {
      return {
        email: props.defaultEmail,
        prevDefaultEmail: props.defaultEmail
      };
    }
    return null;
  }

  handleChange = (e) => {
    this.setState({ email: e.target.value });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.defaultEmail !== this.props.defaultEmail) {
      // 可在这里处理额外逻辑
    }
  }
}`,
  },
  {
    id: 'react-keys-importance-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Diff算法',
    question: 'React 中 key 的作用是什么？不使用 key 会有什么问题？',
    answer: `## Key 的作用

- 标识列表中**每个元素**的身份
- 帮助 React 识别哪些元素**改变**了
- 优化 DOM diff，**减少不必要的更新/重建**

## 不用 key 的问题

- 列表顺序变化时，**无法高效复用**
- 可能导致**状态污染**（如输入框值错乱）
- **性能下降**，组件重建

## 最佳实践

- 用**唯一稳定 ID**
- **避免 index**（列表会变化时）
- index 可用于**纯展示列表**`,
    tags: ['React', 'key', '列表渲染'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-concurrent-features-001',
    module: 'core',
    chapterId: 'react-core',
    category: '并发模式',
    question: 'React 18 的 Concurrent 特性有哪些？',
    answer: `## Concurrent Mode 特性

### 1. 自动批处理（Automatic Batching）

- 所有 setState **自动批处理**
- 减少渲染次数

### 2. startTransition

- 标记**低优先级**更新
- 可**中断**，不阻塞 UI

### 3. Suspense for data fetching

- **流式加载**，配合 SSR
- streaming HTML

### 4. useDeferredValue

- 延迟更新**非关键 UI**
- 返回值可能"过期"`,
    tags: ['React', 'Concurrent'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'react-hydration-001',
    module: 'core',
    chapterId: 'react-core',
    category: '服务端渲染',
    question: 'React 的 Hydration 是什么？为什么需要它？',
    answer: `## Hydration（水合）

SSR 输出的 HTML 基础上，**绑定 React 事件**，使其变为可交互。

### 为什么需要

- SSR 提供**首屏内容**
- 浏览器需要**"激活"**这些 HTML
- React **接管 DOM**，添加交互

### SSR + Hydration 流程

1. **Server**：渲染组件为 HTML
2. **Client**：下载 HTML
3. **Client**：React 绑定事件（Hydration）
4. **用户可交互**`,
    tags: ['React', 'SSR', 'Hydration'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'react-imperative-handle-001',
    module: 'core',
    chapterId: 'react-core',
    category: 'Hooks',
    question: 'useImperativeHandle 是什么？有什么使用场景？',
    answer: `## useImperativeHandle

**自定义暴露给父组件的 ref 内容**。

### 使用场景

- 限制父组件能访问的 DOM 方法
- 暴露**自定义方法**而非 DOM 元素
- 实现组件的**方法式调用接口**`,
    tags: ['React', 'useImperativeHandle', 'ref'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    scrollIntoView: () => inputRef.current.scrollIntoView(),
    // 不暴露 inputRef.current
  }));

  return <input ref={inputRef} {...props} />;
});

// 父组件使用
const fancyRef = useRef();
fancyRef.current.focus(); // ✅
fancyRef.current.scrollIntoView(); // ✅`,
  },
];

export const reactCoreChapter: Chapter = {
  id: 'react-core',
  module: 'core',
  title: 'React 核心原理',
  description: 'Fiber架构、Diff算法、渲染阶段、并发模式',
  cardCount: reactCoreCards.length,
  icon: '⚛️',
};
