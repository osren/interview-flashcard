import { FlashCard, Chapter } from '@/types';

export const algorithmCards: FlashCard[] = [
  // 手撕代码
  {
    id: 'algo-promise-all-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 Promise.all，描述实现思路',
    answer: `实现思路：

1. 参数是 Promise 数组
2. 返回一个新 Promise
3. 收集所有成功结果
4. 任意一个失败，整体失败

关键点：
• 需要计数器记录完成数量
• 结果数组顺序与输入顺序一致
• 使用 Promise.resolve 处理非 Promise 值`,
    tags: ['算法', 'Promise', '手撕代码'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('必须传入数组'));
    }

    const results = [];
    let completed = 0;

    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          reject(reason);
        }
      );
    });

    if (promises.length === 0) {
      resolve([]);
    }
  });
};`,
  },
  {
    id: 'algo-debounce-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现防抖函数 Debounce',
    answer: `防抖原理：
事件触发后，等待 N 秒再执行。
如果 N 秒内再次触发，则重新计时。

应用场景：
• 搜索框输入（用户停止输入后才搜索）
• 窗口调整大小
• 按钮点击防重复`,
    tags: ['算法', '防抖', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
const debouncedSearch = debounce(search, 300);`,
  },
  {
    id: 'algo-throttle-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现节流函数 Throttle',
    answer: `节流原理：
事件触发后，立即执行。
之后无论触发多少次，都要等待 N 秒才能再次执行。

应用场景：
• 滚动事件（滚动时限制执行频率）
• 鼠标移动
• 抢购按钮（防止重复点击）`,
    tags: ['算法', '节流', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `function throttle(fn, delay) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 或者用定时器实现（最后一次也执行）
function throttle(fn, delay) {
  let timer = null;

  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}`,
  },
  {
    id: 'algo-deep-clone-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现深拷贝函数，考虑循环引用和特殊类型',
    answer: `需要处理的情况：
1. 基本类型
2. 对象和数组
3. 循环引用（用 WeakMap 记录已拷贝的对象）
4. Date、RegExp 等特殊类型
5. Map、Set
6. 函数（根据场景决定是否拷贝）`,
    tags: ['算法', '深拷贝', '手撕代码'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `function deepClone(obj, hash = new WeakMap()) {
  // 基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  // Map
  if (obj instanceof Map) {
    const cloneMap = new Map();
    hash.set(obj, cloneMap);
    obj.forEach((v, k) => {
      cloneMap.set(deepClone(k, hash), deepClone(v, hash));
    });
    return cloneMap;
  }

  // Set
  if (obj instanceof Set) {
    const cloneSet = new Set();
    hash.set(obj, cloneSet);
    obj.forEach(v => cloneSet.add(deepClone(v, hash)));
    return cloneSet;
  }

  // Array / Object
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);

  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], hash);
  }

  return clone;
}`,
  },
  {
    id: 'algo-flatten-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现数组扁平化函数 flatten',
    answer: `多种实现方式：

1. reduce + concat
2. toString + split
3. flat() 方法
4. 递归实现（支持深度）`,
    tags: ['算法', '数组', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// 方式1：reduce + concat（只能扁平一层）
const flatten1 = (arr) =>
  arr.reduce((acc, val) => acc.concat(val), []);

// 方式2：flat(Infinity) 扁平任意深度
const flatten2 = (arr) => arr.flat(Infinity);

// 方式3：递归（经典实现）
const flatten3 = (arr, depth = Infinity) => {
  if (depth === 0) return arr;

  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(flatten3(val, depth - 1));
    }
    return acc.concat(val);
  }, []);
};

// 方式4：使用 Generator（惰性）
function* flattenGenerator(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flattenGenerator(item);
    } else {
      yield item;
    }
  }
}`,
  },
  // 概念解释
  {
    id: 'algo-event-loop-concept-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '解释 JavaScript 事件循环的执行机制',
    answer: `事件循环机制：

1. 调用栈执行同步代码
2. 遇到异步任务：
   - 微任务（Promise）→ 微任务队列
   - 宏任务（setTimeout）→ 宏任务队列
3. 同步代码执行完毕
4. 执行所有微任务（while 循环）
5. 尝试渲染（如果需要）
6. 取一个宏任务执行
7. 重复步骤 4

注意：每个宏任务执行完后，都会检查并执行所有微任务`,
    tags: ['算法', '概念', '事件循环'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // 场景设计
  {
    id: 'algo-sdk-design-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个前端监控 SDK？需要考虑哪些方面？',
    answer: `设计要点：

1. 采集数据
   • 性能数据：LCP、FID、CLS
   • 错误数据：JS Error、Promise  rejection
   • 行为数据：点击、滚动、停留时间

2. 数据上报
   • 统一上报接口
   • 采样率控制
   • 请求合并（ beacon API）
   • 离线缓冲（IndexedDB）

3. 异常处理
   • 循环引用捕获
   • 上报失败重试
   • 内存占用控制

4. 兼容性
   • 多种环境（Web、Node）
   • SourceMap 解析`,
    tags: ['算法', '场景设计', '系统设计'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'algo-permission-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个前端权限控制系统？',
    answer: `权限控制设计方案：

1. 权限模型
   • RBAC：角色-权限-用户
   • 页面权限 + 按钮权限 + 数据权限

2. 前端存储
   • 用户信息 + 权限列表存 Vuex/Pinia
   • 本地持久化（刷新不丢失）

3. 路由守卫
   • 路由 meta 标记所需权限
   • beforeEach 拦截检查

4. 组件级别控制
   • v-if / v-show 控制显示
   • 自定义指令封装

5. 动态权限
   • 按钮权限可运行时变更
   • 依赖注入方式传递权限函数`,
    tags: ['算法', '场景设计', '权限系统'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'algo-collaboration-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个在线文档协作系统？',
    answer: `核心架构：

1. 数据同步
   • CRDT/OT 算法处理冲突
   • WebSocket 实时同步
   • 离线队列 + 增量同步

2. 多人协作
   • 光标位置同步
   • 用户在线状态
   • 锁定机制（编辑锁）

3. 性能优化
   • 虚拟化渲染（长文档）
   • 操作转换（减少传输）
   • 懒加载历史版本

4. 冲突处理
   • 乐观锁：本地先更新
   • 服务端仲裁
   • 用户感知：冲突提示`,
    tags: ['算法', '场景设计', '实时协作'],
    status: 'unvisited',
    difficulty: 'hard',
  },
];

export const algorithmChapters: Chapter[] = [
  {
    id: 'coding',
    module: 'algorithms',
    title: '手撕代码',
    description: 'Promise、Debounce、深拷贝等高频手写题',
    cardCount: algorithmCards.filter((c) => c.category === '手撕代码').length,
    icon: '💻',
  },
  {
    id: 'concept',
    module: 'algorithms',
    title: '概念解释',
    description: '核心概念的深入解释',
    cardCount: algorithmCards.filter((c) => c.category === '概念解释').length,
    icon: '📖',
  },
  {
    id: 'scenario',
    module: 'algorithms',
    title: '场景设计',
    description: '系统设计、架构设计题',
    cardCount: algorithmCards.filter((c) => c.category === '场景设计').length,
    icon: '🎯',
  },
];
