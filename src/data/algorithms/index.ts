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
  // ===== Promise.race =====
  {
    id: 'algo-promise-race-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 Promise.race',
    answer: `Promise.race 实现原理：

### 概念
返回第一个完成（无论成功或失败）的 Promise 的结果。

### 关键点
- 只返回最快的那个结果
- 不关心成功或失败`,
    tags: ['算法', 'Promise', '手撕代码'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => {
      Promise.resolve(p).then(
        resolve,
        reject
      );
    });
  });
};

// 测试
Promise.race([
  new Promise(r => setTimeout(() => r(1), 100)),
  new Promise(r => setTimeout(() => r(2), 50))
]).then(console.log); // 2（先完成）`,
  },
  // ===== Promise.allSettled =====
  {
    id: 'algo-promise-allsettled-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 Promise.allSettled',
    answer: `Promise.allSettled 实现原理：

### 概念
等所有 Promise 都完成（无论成功或失败），返回每个 Promise 的状态和结果。

### 关键点
- 不会因为某个 Promise 失败而失败
- 返回格式：{ status: 'fulfilled' | 'rejected', value | reason }`,
    tags: ['算法', 'Promise', '手撕代码'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `Promise.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) {
      return resolve([]);
    }

    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => {
          results[index] = { status: 'fulfilled', value };
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          results[index] = { status: 'rejected', reason };
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        }
      );
    });
  });
};`,
  },
  // ===== Promise.any =====
  {
    id: 'algo-promise-any-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 Promise.any',
    answer: `Promise.any 实现原理：

### 概念
返回第一个成功的 Promise，如果没有成功的则返回 AggregateError。

### 关键点
- 忽略失败的 Promise
- 至少要有一个成功`,
    tags: ['算法', 'Promise', '手撕代码'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let rejectedCount = 0;

    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        resolve,
        (error) => {
          errors[index] = error;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};`,
  },
  // ===== 柯里化函数 =====
  {
    id: 'algo-curry-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 curry 函数（函数柯里化）',
    answer: `函数柯里化原理：

### 概念
将多参数函数转换为一系列单参数函数。

### 应用
- 参数复用
- 延迟执行
- 函数组合`,
    tags: ['算法', '柯里化', '手撕代码'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 基础版：固定参数个数
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// 高级版：支持占位符
function curryWithPlaceholder(fn) {
  const placeholder = Symbol('placeholder');

  return function curried(...args) {
    const newArgs = args.map(arg =>
      arg === placeholder && curried.placeholder
        ? placeholder
        : arg
    );

    const isComplete = newArgs.every(
      arg => arg !== placeholder || arg === curried.placeholder
    );

    if (isComplete && newArgs.length >= fn.length) {
      return fn.apply(this, newArgs);
    }

    return function(...nextArgs) {
      const combined = newArgs.map((arg, i) =>
        arg === placeholder && nextArgs.length > 0
          ? nextArgs.shift()
          : arg
      );
      return curried.apply(this, [...combined, ...nextArgs]);
    };
  };
}

curried.placeholder = placeholder;

// 使用
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6`,
  },
  // ===== compose 函数 =====
  {
    id: 'algo-compose-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 compose 和 pipe 函数',
    answer: `函数组合原理：

### compose
从右到左执行函数

### pipe
从左到右执行函数`,
    tags: ['算法', '函数组合', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// compose: 从右到左执行
const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));

// pipe: 从左到右执行
const pipe = (...fns) =>
  fns.reduce((f, g) => (...args) => g(f(...args)));

// 示例
const add1 = x => x + 1;
const multiply2 = x => x * 2;
const subtract3 = x => x - 3;

const composed = compose(subtract3, multiply2, add1);
// 等价于: subtract3(multiply2(add1(1)))

composed(1); // (1 + 1) * 2 - 3 = 1

const piped = pipe(add1, multiply2, subtract3);
// 等价于: subtract3(multiply2(add1(1)))

piped(1); // 1`,
  },
  // ===== LRU 缓存 =====
  {
    id: 'algo-lru-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现 LRU（最近最少使用）缓存',
    answer: `LRU 缓存原理：

### 核心思想
当缓存满时，删除最近最少使用的项。

### 使用场景
- 浏览器缓存
- 数据库连接池
- 内存管理`,
    tags: ['算法', 'LRU', '手撕代码'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;

    // 移到末尾（最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  put(key, value) {
    // 已存在，更新并移到末尾
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else {
      // 达到容量，删除最老的（第一个）
      if (this.cache.size >= this.capacity) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }
}

// 使用
const cache = new LRUCache(3);
cache.put('a', 1);
cache.put('b', 2);
cache.put('c', 3);
cache.get('a'); // 1，a 变为最近使用
cache.put('d', 4); // 删除 b（最久未使用）
cache.get('b'); // -1`,
  },
  // ===== 快速排序 =====
  {
    id: 'algo-quick-sort-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现快速排序算法',
    answer: `快速排序原理：

### 核心思想
选择一个基准元素，将数组分为两部分：
- 左侧都小于基准
- 右侧都大于基准
然后递归排序。

### 时间复杂度
- 平均：O(n log n)
- 最差：O(n²)`,
    tags: ['算法', '排序', '手撕代码'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 方法1：原地分区
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;

  const pivotIndex = partition(arr, left, right);
  quickSort(arr, left, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, right);

  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }

  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

// 方法2：非原地（更简洁）
function quickSort2(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);

  return [...quickSort2(left), pivot, ...quickSort2(right)];
}

// 测试
console.log(quickSort([3, 6, 8, 10, 1, 2, 1]));
// [1, 1, 2, 3, 6, 8, 10]`,
  },
  // ===== 二分查找 =====
  {
    id: 'algo-binary-search-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '实现二分查找算法',
    answer: `二分查找原理：

### 核心思想
在有序数组中，通过折半查找来定位目标元素。

### 适用场景
- 有序数组查找
- 寻找边界
- 旋转数组查找`,
    tags: ['算法', '查找', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// 标准二分查找
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

// 查找左边界
function lowerBound(arr, target) {
  let left = 0;
  let right = arr.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// 查找右边界
function upperBound(arr, target) {
  let left = 0;
  let right = arr.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// 测试
console.log(binarySearch([1, 2, 3, 4, 5], 3)); // 2
console.log(lowerBound([1, 2, 2, 2, 3], 2)); // 1
console.log(upperBound([1, 2, 2, 2, 3], 2)); // 4`,
  },
  // ===== 合并两个有序链表 =====
  {
    id: 'algo-merge-list-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '合并两个有序链表',
    answer: `合并有序链表原理：

### 核心思想
使用双指针比较两个链表的节点，选择较小的加入结果链表。`,
    tags: ['算法', '链表', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `function mergeTwoLists(l1, l2) {
  const dummy = { val: 0, next: null };
  let current = dummy;

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }

  // 连接剩余部分
  current.next = l1 || l2;

  return dummy.next;
}

// 递归版本
function mergeTwoListsRecursive(l1, l2) {
  if (!l1) return l2;
  if (!l2) return l1;

  if (l1.val <= l2.val) {
    l1.next = mergeTwoListsRecursive(l1.next, l2);
    return l1;
  } else {
    l2.next = mergeTwoListsRecursive(l1, l2.next);
    return l2;
  }
}`,
  },
  // ===== 反转链表 =====
  {
    id: 'algo-reverse-list-001',
    module: 'algorithms',
    chapterId: 'coding',
    category: '手撕代码',
    question: '反转链表（迭代和递归）',
    answer: `反转链表原理：

### 迭代方法
使用三个指针：prev、current、next
逐步反转每个节点的指向。

### 递归方法
反转思路：反转子链表，将当前节点接在后面。`,
    tags: ['算法', '链表', '手撕代码'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// 迭代反转
function reverseList(head) {
  let prev = null;
  let current = head;

  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  return prev;
}

// 递归反转
function reverseListRecursive(head) {
  if (!head || !head.next) return head;

  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;

  return newHead;
}

// 反转前 N 个节点
function reverseN(head, n) {
  if (n === 1) return head;

  const successor = reverseN(head.next, n - 1);
  head.next.next = head;
  head.next = successor;

  return head;
}

// 反转区间 [m, n]
function reverseBetween(head, m, n) {
  const dummy = { next: head };
  let prev = dummy;

  for (let i = 0; i < m - 1; i++) {
    prev = prev.next;
  }

  let current = prev.next;
  for (let i = 0; i < n - m; i++) {
    const next = current.next;
    current.next = next.next;
    next.next = prev.next;
    prev.next = next;
  }

  return dummy.next;
}`,
  },
  // ===== 概念解释 =====
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
  // ===== 执行上下文 =====
  {
    id: 'algo-execution-context-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '什么是执行上下文？JavaScript 中有几种执行上下文类型？',
    answer: `执行上下文（Execution Context）：

### 1. 定义
执行上下文是 JavaScript 引擎执行代码时的环境，包含了代码执行所需的所有信息。

### 2. 三种类型

#### 全局执行上下文
- 最外层的执行上下文
- 创建全局对象（window/globalThis）
- this 指向全局对象

#### 函数执行上下文
- 每调用一个函数创建一个
- 独立的作用域
- 闭包的基础

#### Eval 执行上下文（较少使用）
- eval() 函数内部

### 3. 包含内容

\`\`\`javascript
ExecutionContext = {
  thisBinding,      // this 指向
  lexicalEnv,      // 词法环境（变量环境）
  variableEnv,     // 变量环境（var 声明）
}
\`\`\`

### 4. 执行栈
- 后进先出（LIFO）的调用栈
- 函数调用时会压入新的执行上下文
- 函数执行完毕后弹出`,
    tags: ['算法', '概念', '执行上下文'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 闭包 =====
  {
    id: 'algo-closure-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '什么是闭包？闭包是如何形成的？闭包有哪些实际应用场景？',
    answer: `闭包（Closure）：

### 1. 定义
闭包是指一个函数能够"记住"其创建时的作用域（词法环境），即使这个函数在其作用域外部执行。

### 2. 形成原理

\`\`\`javascript
function outer() {
  const a = 1;

  function inner() {
    console.log(a); // inner 可以访问 outer 的变量
  }

  return inner; // 返回 inner 函数，形成闭包
}

const fn = outer();
fn(); // 输出 1
\`\`\`

### 3. 应用场景

#### 私有变量
\`\`\`javascript
function createCounter() {
  let count = 0;

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}
\`\`\`

#### 函数柯里化
\`\`\`javascript
const curry = (fn) => (a) => (b) => fn(a, b);
const add = (a, b) => a + b;
const add10 = curry(add)(10);
add10(5); // 15
\`\`\`

#### 防抖节流（已实现）

#### 模拟块级作用域
\`\`\`javascript
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
\`\`\`

### 4. 注意事项
- 内存泄漏风险（谨慎使用）
- 避免在循环中创建闭包`,
    tags: ['算法', '概念', '闭包'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 原型链 =====
  {
    id: 'algo-prototype-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '详细解释 JavaScript 原型链的工作机制',
    answer: `原型链（Prototype Chain）：

### 1. 核心概念

#### prototype（显式原型）
- 每个函数都有一个 prototype 属性
- 指向一个对象（原型）
- 用于创建实例对象的原型

#### __proto__（隐式原型）
- 每个对象都有 __proto__ 属性
- 指向创建它的构造函数的 prototype

#### constructor
- prototype 对象有 constructor 属性
- 指回构造函数

### 2. 原型链查找

\`\`\`javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  return \`Hello, I'm \${this.name}\`;
};

const p = new Person('Tom');
p.sayHello(); // 查找顺序：p → p.__proto__ → Person.prototype → sayHello
\`\`\`

### 3. 原型链图示

\`\`\`
实例对象
  ↓ __proto__
构造函数.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null（原型链终点）
\`\`\`

### 4. instanceof 原理
\`\`\`javascript
function instanceOf(obj, Constructor) {
  let proto = obj.__proto__;

  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = proto.__proto__;
  }

  return false;
}
\`\`\``,
    tags: ['算法', '概念', '原型链'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 宏任务 vs 微任务 =====
  {
    id: 'algo-micro-macro-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '宏任务和微任务有什么区别？请举例说明它们的执行顺序',
    answer: `宏任务 vs 微任务：

### 1. 区别

| 维度 | 宏任务（Macro Task） | 微任务（Micro Task） |
|------|---------------------|---------------------|
| 执行时机 | 当前任务结束后执行 | 当前宏任务结束后、下一个宏任务开始前 |
| 队列 | 宏任务队列（多个） | 微任务队列（单个） |
| 优先级 | 较低 | 较高 |
| 示例 | setTimeout, setInterval, I/O | Promise, MutationObserver, queueMicrotask |

### 2. 执行顺序

\`\`\`javascript
console.log('1. 同步代码');

setTimeout(() => {
  console.log('2. 宏任务 setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3. 微任务 Promise 1');
});

Promise.resolve().then(() => {
  console.log('4. 微任务 Promise 2');
});

console.log('5. 同步代码结束');

// 输出顺序：1 → 5 → 3 → 4 → 2
\`\`\`

### 3. 经典面试题

\`\`\`javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

new Promise((resolve) => {
  console.log('4');
  resolve();
}).then(() => console.log('5'));

setTimeout(() => console.log('6'), 0);

console.log('7');

// 输出：1 → 4 → 7 → 5 → 2 → 3 → 6
\`\`\`

### 4. 渲染时机
- 微任务执行完后会尝试渲染
- 这就是为什么 Promise 比 setTimeout 更适合用于动画`,
    tags: ['算法', '概念', '宏任务', '微任务'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 内存泄漏 =====
  {
    id: 'algo-memory-leak-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '什么是内存泄漏？JavaScript 中常见的内存泄漏场景有哪些？',
    answer: `内存泄漏（Memory Leak）：

### 1. 定义
内存泄漏是指程序在申请内存后，无法释放已申请的内存，导致内存占用持续增长，最终可能导致内存溢出。

### 2. 常见场景

#### 意外全局变量
\`\`\`javascript
// 错误：未声明的变量会成为全局变量
function leak() {
  bigData = new Array(1000000); // 泄漏
}

// 正确：使用严格模式或声明变量
function noLeak() {
  const bigData = new Array(1000000);
}
\`\`\`

#### 闭包
\`\`\`javascript
// 闭包持有对大对象的引用
function leak() {
  const bigData = new Array(1000000);

  return function() {
    console.log(bigData.length);
  };
}
\`\`\`

#### 定时器未清理
\`\`\`javascript
// 组件销毁时未清除定时器
useEffect(() => {
  const timer = setInterval(() => {
    // ...
  }, 1000);

  // 需要在 cleanup 中清除
  return () => clearInterval(timer);
}, []);
\`\`\`

#### 事件监听器未移除
\`\`\`javascript
// 组件销毁时未移除事件
window.addEventListener('resize', handler);

// 需要在 cleanup 中移除
window.removeEventListener('resize', handler);
\`\`\`

#### DOM 引用未清除
\`\`\`javascript
const elements = [];
function addElement() {
  const div = document.createElement('div');
  elements.push(div); // 持有 DOM 引用
}

// 清理
elements.length = 0;
\`\`\`

### 3. 排查工具
- Chrome DevTools Memory Profiler
- performance monitor
- heap snapshot`,
    tags: ['算法', '概念', '内存泄漏'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  // ===== 回流与重绘 =====
  {
    id: 'algo-reflow-repaint-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '什么是回流和重绘？如何优化避免频繁触发？',
    answer: `回流（Reflow）与重绘（Repaint）：

### 1. 定义

#### 回流（Reflow）
- 几何属性变化（尺寸、位置）
- 需要重新计算布局
- 代价较高

#### 重绘（Repaint）
- 外观属性变化（颜色、背景）
- 不影响布局
- 代价较低

### 2. 触发条件

\`\`\`javascript
// 回流：几何属性变化
element.style.width = '100px';      // 宽度
element.style.padding = '10px';     // 内边距
element.style.position = 'fixed';    // 定位

// 重绘：仅外观变化
element.style.backgroundColor = 'red';  // 背景色
element.style.color = 'blue';            // 文字颜色
\`\`\`

### 3. 优化策略

#### 1. 批量修改样式
\`\`\`javascript
// 错误：多次触发回流
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 正确：使用 class
element.classList.add('active');
\`\`\`

#### 2. 使用 transform 代替 top/left
\`\`\`javascript
// 错误：触发回流
element.style.top = '100px';
element.style.left = '100px';

// 正确：触发合成
element.style.transform = 'translate(100px, 100px)';
\`\`\`

#### 3. 避免频繁读取布局属性
\`\`\`javascript
// 错误：强制触发回流
const width = element.offsetWidth;
element.style.width = width + 1 + 'px';
const height = element.offsetHeight;

// 正确：缓存值
const { offsetWidth, offsetHeight } = element;
element.style.width = offsetWidth + 1 + 'px';
\`\`\`

#### 4. 使用 DocumentFragment
\`\`\`javascript
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
container.appendChild(fragment); // 只触发一次回流
\`\`\``,
    tags: ['算法', '概念', '回流', '重绘'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== VDOM 与 Diff =====
  {
    id: 'algo-vdom-diff-001',
    module: 'algorithms',
    chapterId: 'concept',
    category: '概念解释',
    question: '虚拟 DOM 是什么？Diff 算法是如何工作的？',
    answer: `虚拟 DOM 与 Diff 算法：

### 1. 虚拟 DOM
用 JavaScript 对象描述真实 DOM 树结构：

\`\`\`javascript
// 真实 DOM
<div class="container">
  <h1>Title</h1>
</div>

// VDOM
{
  tag: 'div',
  props: { className: 'container' },
  children: [
    { tag: 'h1', props: {}, children: ['Title'] }
  ]
}
\`\`\`

### 2. Diff 算法核心

#### 同层比较
只比较同一层级的节点，不跨层级比较。

#### 类型不同
\`\`\`
旧：<div>
新：<span>
直接替换整个子树
\`\`\`

#### 类型相同
比较属性变化，更新属性。

#### 列表比较（Key 的作用）
\`\`\`javascript
// 使用 key 帮助 Diff 算法识别移动
// 正确：key 帮助识别是同一元素
[1, 2, 3] → [1, 3, 2] // key 相同，位置变化

// 错误：没有 key 会导致重新创建
[1, 2, 3] → [3, 1, 2] // 没有 key，所有元素都被替换
\`\`\`

### 3. Diff 流程

\`\`\`
旧树 → 新树
  ↓
深度优先遍历
  ↓
比较节点
  ↓
标记差异（INSERT / DELETE / UPDATE）
  ↓
应用最小更新
\`\`\`

### 4. React 中的优化
- 调和（Reconciliation）
-  fiber 架构支持可中断更新
-  启发式算法（稳定的 Key）`,
    tags: ['算法', '概念', 'VDOM', 'Diff'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  // ===== 场景设计 =====
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
    codeExample: `// 1. 初始化 SDK
class MonitorSDK {
  constructor(config) {
    this.config = config;
    this.queue = [];
    this.init();
  }

  init() {
    // 绑定错误监听
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleReject.bind(this));

    // 性能监控
    this.observePerformance();

    // 行为数据
    this.bindBehavior();
  }

  // 2. 错误采集
  handleError(event) {
    this.report('error', {
      message: event.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now()
    });
  }

  handleReject(event) {
    this.report('unhandledrejection', {
      reason: event.reason,
      timestamp: Date.now()
    });
  }

  // 3. 性能监控
  observePerformance() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report('performance', entry.entry);
      }
    });
    observer.observe({ entryTypes: ['paint', 'layout-shift', 'largest-contentful-paint'] });
  }

  // 4. 数据上报
  report(type, data) {
    this.queue.push({ type, ...data, url: location.href });

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  flush() {
    if (this.queue.length === 0) return;

    const data = [...this.queue];
    this.queue = [];

    navigator.sendBeacon('/api/monitor', JSON.stringify(data));
  }
}

// 使用
const monitor = new MonitorSDK({ appId: 'xxx', sampleRate: 0.1 });`,
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
    codeExample: `// 1. 权限存储
const usePermissionStore = create((set) => ({
  permissions: [],
  setPermissions: (perms) => set({ permissions: perms }),
  hasPermission: (code) => {
    const { permissions } = get();
    return permissions.includes(code);
  }
}));

// 2. 路由守卫
router.beforeEach((to, from, next) => {
  const { hasPermission } = usePermissionStore.getState();

  // 检查页面权限
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    if (!token) return next('/login');
  }

  // 检查权限
  if (to.meta.permission && !hasPermission(to.meta.permission)) {
    return next('/403');
  }

  next();
});

// 3. 按钮权限指令
const permission = {
  mounted(el, binding) {
    const { hasPermission } = usePermissionStore.getState();
    if (!hasPermission(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  }
};

// 使用
<button v-permission="'user:create'">创建用户</button>`,
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
    codeExample: `// 1. CRDT 同步（以 GResume 为例）
import Automerge from '@automerge/automerge';

const doc = Automerge.init();
const change = Automerge.change(doc, (d) => {
  d.content = '新内容';
});

// 2. WebSocket 同步
class SyncClient {
  constructor() {
    this.ws = new WebSocket('wss://sync.example.com');
    this.pendingOps = [];
  }

  sendOperation(op) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(op));
    } else {
      this.pendingOps.push(op); // 离线队列
    }
  }

  onMessage(data) {
    const { type, op, userId } = data;
    if (type === 'operation') {
      this.applyRemoteOp(op);
    } else if (type === 'cursor') {
      this.updateRemoteCursor(userId, op.position);
    }
  }
}

// 3. 冲突处理
function resolveConflict(local, remote) {
  // 最后写入者胜出（简单策略）
  // 或基于时间戳合并
  return local.timestamp > remote.timestamp ? local : remote;
}`,
  },
  // ===== 前端路由设计 =====
  {
    id: 'algo-router-design-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个前端路由系统？需要考虑哪些方面？',
    answer: `前端路由系统设计：

### 1. 核心功能
- 路由匹配（路径 → 组件）
- 路由守卫（权限验证）
- 路由参数解析
- 路由切换动画

### 2. 实现方式

#### Hash 模式
\`\`\`javascript
// 基于 window.location.hash
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  matchRoute(hash);
});
\`\`\`

#### History 模式
\`\`\`javascript
// 基于 History API
window.history.pushState(state, title, url);
window.addEventListener('popstate', () => {
  matchRoute(window.location.pathname);
});
\`\`\`

### 3. 路由守卫设计

\`\`\`javascript
// 全局守卫
router.beforeEach((to, from, next) => {
  // 登录检查
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login');
  }

  // 权限检查
  if (to.meta.permission && !hasPermission(to.meta.permission)) {
    return next('/403');
  }

  next();
});
\`\`\`

### 4. 动态路由

\`\`\`javascript
// 权限动态添加
const dynamicRoutes = permissions.map(p => ({
  path: p.path,
  component: p.component,
  meta: { permission: p.name }
}));

router.addRoutes(dynamicRoutes);
\`\`\`

### 5. 路由懒加载
\`\`\`javascript
const UserProfile = () => import('./UserProfile.vue');
const routes = [
  { path: '/user/:id', component: UserProfile }
];
\`\`\``,
    tags: ['算法', '场景设计', '路由'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 缓存策略设计 =====
  {
    id: 'algo-cache-design-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个前端缓存系统？包括内存缓存和持久化缓存',
    answer: `前端缓存系统设计：

### 1. 多级缓存架构

\`\`\`
请求 → 内存缓存 → 持久化缓存 → HTTP 缓存 → 服务端
\`\`\`

### 2. 内存缓存（Memory Cache）

\`\`\`javascript
class MemoryCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return null;

    // LRU：将访问的移到末尾
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // 删除最老的（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}
\`\`\`

### 3. 持久化缓存（Storage）

\`\`\`javascript
class StorageCache {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  set(key, value, expire = 0) {
    const data = {
      value,
      expire: expire ? Date.now() + expire : 0
    };
    this.storage.setItem(key, JSON.stringify(data));
  }

  get(key) {
    const raw = this.storage.getItem(key);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (data.expire && Date.now() > data.expire) {
      this.storage.removeItem(key);
      return null;
    }

    return data.value;
  }
}
\`\`\`

### 4. 缓存策略

| 策略 | 适用场景 | 刷新时机 |
|------|---------|---------|
| 强缓存 | 静态资源 | 版本更新 |
| 协商缓存 | API 数据 | ETag/Last-Modified |
| 惰性加载 | 大数据 | 首次访问 |
| 预加载 | 关键路径 | 空闲时 |

### 5. 缓存淘汰算法
- LRU（最近最少使用）
- LFU（最不经常使用）
- FIFO（先进先出）`,
    tags: ['算法', '场景设计', '缓存'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 多级缓存实现
class CacheSystem {
  constructor() {
    this.memory = new MemoryCache(100); // 内存缓存
    this.storage = new StorageCache(localStorage); // 持久化
    this.httpCache = new Map(); // HTTP 缓存
  }

  async get(key) {
    // 1. 查内存
    let value = this.memory.get(key);
    if (value) return value;

    // 2. 查存储
    value = this.storage.get(key);
    if (value) {
      this.memory.set(key, value); // 回填内存
      return value;
    }

    // 3. 查服务端（带 HTTP 缓存）
    value = await this.fetch(key);
    this.memory.set(key, value);
    this.storage.set(key, value);
    return value;
  }
}`,
  },
  // ===== 列表性能优化 =====
  {
    id: 'algo-list-optimize-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个高性能的长列表？10万条数据如何流畅渲染？',
    answer: `长列表性能优化：

### 1. 核心问题
- DOM 节点过多导致卡顿
- 内存占用过高
- 滚动不流畅

### 2. 虚拟列表（Virtual Scroll）

\`\`\`javascript
// 只渲染可视区域内的元素
class VirtualList {
  constructor(container, list, itemHeight) {
    this.container = container;
    this.list = list;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);

    container.addEventListener('scroll', () => this.render());
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;

    // 截取可见数据
    const visibleData = this.list.slice(startIndex, endIndex);

    // 偏移量
    const offsetY = startIndex * this.itemHeight;

    // 渲染（只创建可见数量的 DOM）
    this.container.innerHTML = visibleData.map(...).join('');
    this.container.style.transform = \`translateY(\${offsetY}px)\`;
  }
}
\`\`\`

### 3. 虚拟表格（react-virtualized）

\`\`\`javascript
import { FixedSizeList } from 'react-virtualized';

<List
  height={500}
  width={800}
  rowCount={100000}
  rowHeight={50}
  rowRenderer={({ index, style }) => (
    <div style={style}>{list[index].name}</div>
  )}
/>
\`\`\`

### 4. 其他优化手段

#### 分页加载
\`\`\`javascript
// 滚动到底部加载更多
const loadMore = async () => {
  const data = await fetchPage(page++, pageSize);
  setList(prev => [...prev, ...data]);
};
\`\`\`

#### 图片懒加载
\`\`\`javascript
// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
    }
  });
});
\`\`\`

#### 骨架屏
- 加载时显示占位结构
- 提升感知性能

### 5. 性能指标
- 首屏渲染 < 1s
- 滚动帧率 > 30fps（最好 60fps）
- 内存占用 < 100MB`,
    tags: ['算法', '场景设计', '性能优化'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  // ===== 埋点系统设计 =====
  {
    id: 'algo-tracking-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个前端埋点系统？支持自动埋点和手动埋点？',
    answer: `前端埋点系统设计：

### 1. 埋点类型

#### 曝光埋点
元素进入可视区域时触发

\`\`\`javascript
// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      track('曝光', { element: entry.target.dataset.trackId });
    }
  });
});
\`\`\`

#### 点击埋点
用户点击时触发

\`\`\`javascript
// 事件委托
document.addEventListener('click', (e) => {
  const trackId = e.target.closest('[data-track-id]')?.dataset.trackId;
  if (trackId) {
    track('点击', { element: trackId });
  }
});
\`\`\`

#### 行为埋点
路由切换、页面停留等

\`\`\`javascript
// 路由变化
router.afterEach((to) => {
  track('页面浏览', { path: to.path, title: to.meta.title });
});
\`\`\`

### 2. 采集队列

\`\`\`javascript
class Tracker {
  constructor() {
    this.queue = [];
    this.isSending = false;
  }

  send(data) {
    this.queue.push(data);
    this.flush();
  }

  flush() {
    if (this.isSending || this.queue.length === 0) return;

    this.isSending = true;
    navigator.sendBeacon('/api/track', JSON.stringify(this.queue));

    this.queue = [];
    this.isSending = false;
  }
}
\`\`\`

### 3. 数据结构

\`\`\`javascript
{
  event: 'click',
  category: 'button',
  label: '立即购买',
  value: 'product_123',
  timestamp: 1699999999999,
  userId: 'xxx',
  device: 'mobile',
  url: '/product/123'
}
\`\`\`

### 4. 采样率控制
\`\`\`javascript
const shouldTrack = Math.random() < sampleRate; // 0-1
\`\`\`

### 5. 异常保护
- try-catch 包裹
- 不影响业务性能
- 静默失败`,
    tags: ['算法', '场景设计', '埋点'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 国际化方案 =====
  {
    id: 'algo-i18n-001',
    module: 'algorithms',
    chapterId: 'scenario',
    category: '场景设计',
    question: '如何设计一个前端国际化（i18n）方案？',
    answer: `前端国际化（i18n）方案设计：

### 1. 整体架构

\`\`\`
语言文件（JSON/YAML）
    ↓
翻译函数 t()
    ↓
组件 + Hook
    ↓
运行时切换语言
\`\`\`

### 2. 语言文件结构

\`\`\`json
// zh-CN.json
{
  "common": {
    "submit": "提交",
    "cancel": "取消"
  },
  "product": {
    "name": "商品名称",
    "price": "价格"
  }
}

// en.json
{
  "common": {
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "product": {
    "name": "Product Name",
    "price": "Price"
  }
}
\`\`\`

### 3. 翻译函数

\`\`\`javascript
function t(key, params = {}) {
  const keys = key.split('.');
  let value = currentLocale;

  for (const k of keys) {
    value = value?.[k];
  }

  // 参数替换
  return value?.replace(/\\{(\\w+)\\}/g, (_, k) => params[k]) || key;
}

// 使用
t('product.name', { name: 'iPhone' }) // "iPhone 的名称"
\`\`\`

### 4. React i18n 方案

\`\`\`javascript
// 使用 react-i18next
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();

  return <h1>{t('common.title')}</h1>;
}
\`\`\`

### 5. 语言检测与切换

\`\`\`javascript
// 1. 检测浏览器语言
const detectLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith('zh') ? 'zh-CN' : 'en';
};

// 2. 从 URL 读取
const lang = new URLSearchParams(location.search).get('lang');

// 3. 从存储读取
const savedLang = localStorage.getItem('lang');

// 优先级：URL > 存储 > 浏览器 > 默认
\`\`\`

### 6. 动态加载语言包
\`\`\`javascript
const loadLanguage = async (lang) => {
  const messages = await import(\`./locales/\${lang}.json\`);
  i18n.addResourceBundle(lang, 'translation', messages.default);
};
\`\`\``,
    tags: ['算法', '场景设计', '国际化'],
    status: 'unvisited',
    difficulty: 'medium',
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
