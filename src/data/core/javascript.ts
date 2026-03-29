import { FlashCard, Chapter } from '@/types';

export const javascriptCards: FlashCard[] = [
  {
    id: 'js-execution-context-001',
    module: 'core',
    chapterId: 'javascript',
    category: '执行上下文',
    question: '什么是执行上下文？执行上下文有哪几种类型？',
    answer: `## 执行上下文

**执行上下文**是 JavaScript 引擎执行代码时的"运行环境"。

### 三种类型

1. **全局执行上下文**
   - 代码运行前创建
   - 浏览器中为 window 对象

2. **函数执行上下文**
   - 每次调用函数时创建

3. **Eval 执行上下文**
   - 不推荐使用

### 三个组成部分

- **变量环境 (Variable Environment)**
- **词法环境 (Lexical Environment)**
- **this 绑定**`,
    tags: ['JavaScript', '执行上下文', '基础概念'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'js-call-stack-001',
    module: 'core',
    chapterId: 'javascript',
    category: '调用栈',
    question: '什么是调用栈？它有什么特点？为什么递归可能导致栈溢出？',
    answer: `## 调用栈

**调用栈**是一种 LIFO（后进先出）的数据结构，用于管理函数调用顺序。

### 特点

- 同步执行，遵循 **LIFO 原则**
- 栈溢出发生在递归没有终止条件时
- JavaScript 是单线程，调用栈是**唯一的**

### 为什么递归会栈溢出

每次递归调用都会在栈上创建新的函数执行上下文，
如果递归深度太大，**栈空间耗尽**，就会溢出。

### 优化方法

1. **记忆化 (Memoization)**
2. **改用循环**（尾递归优化）`,
    tags: ['JavaScript', '调用栈', '递归'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}`,
  },
  {
    id: 'js-scope-chain-001',
    module: 'core',
    chapterId: 'javascript',
    category: '作用域链',
    question: '什么是作用域链？JavaScript 变量查找的顺序是什么？',
    answer: `## 作用域链

**作用域链**是 JavaScript 引擎查找变量时追溯的链路。

### 查找顺序（从内到外）

1. 当前作用域的变量
2. 父级作用域的变量
3. 祖父级作用域的变量
4. ... 直到**全局作用域**
5. 找不到则报错 **ReferenceError**`,
    tags: ['JavaScript', '作用域', '作用域链'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'js-closure-001',
    module: 'core',
    chapterId: 'javascript',
    category: '闭包',
    question: '什么是闭包？闭包有什么应用场景？',
    answer: `## 闭包

**定义**：函数能够记住并访问其词法作用域，即使该函数在其词法作用域之外执行。

### 应用场景

1. **数据私有化/模块化**
2. **函数柯里化**
3. **防抖和节流**
4. **缓存计算结果**`,
    tags: ['JavaScript', '闭包', '作用域'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 数据私有化
function counter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}
const c = counter();
c.increment(); // 1
c.getCount();  // 1
// count 无法从外部直接访问`,
    extendQuestion: '闭包在 React Hooks 中有什么陷阱？如何避免？',
  },
  {
    id: 'js-closure-trap-001',
    module: 'core',
    chapterId: 'javascript',
    category: '闭包陷阱',
    question: '闭包在 React Hooks 中的典型陷阱是什么？请举例说明',
    answer: `## 闭包陷阱

**典型问题**：useEffect 中使用 setInterval 时的闭包问题

### 问题代码

\`\`\`javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count 是旧值！
  }, 1000);
  return () => clearInterval(id);
}, []); // count 永不更新
\`\`\`

### 原因分析

setInterval 的回调函数形成了**闭包**，
捕获的是创建时的 count 值（0），**永远不变**。

### 解决方案

1. **使用函数式更新**：\`setCount(prev => prev + 1)\`
2. **将 count 加入依赖数组**（但会重建定时器）`,
    tags: ['JavaScript', 'React', 'Hooks', '闭包陷阱'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 解决方案1：函数式更新 ✅
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);

// 解决方案2：加入依赖（定时器会重建）
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);`,
  },
  {
    id: 'js-prototype-chain-001',
    module: 'core',
    chapterId: 'javascript',
    category: '原型链',
    question: '什么是原型链？请画出 alice 对象的原型链',
    answer: `## 原型链

**原型链**是 JavaScript 中对象继承的机制，每个对象有 [[Prototype]] 指向另一个对象。

### 原型链查找

\`对象 → 构造函数.prototype → Object.prototype → null\`

### 示例

\`\`\`javascript
function Person(name) { this.name = name; }
Person.prototype.greet = function() {
  return \`Hello, I'm \${this.name}\`;
};
const alice = new Person('Alice');

// 原型链：
alice.__proto__ === Person.prototype  // ✅
Person.prototype.__proto__ === Object.prototype  // ✅
Object.prototype.__proto__ === null  // ✅
\`\`\``,
    tags: ['JavaScript', '原型链', '继承'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'js-instanceof-001',
    module: 'core',
    chapterId: 'javascript',
    category: '原型链',
    question: 'instanceof 的原理是什么？',
    answer: `## instanceof 原理

**instanceof** 检查构造函数的 prototype 属性是否在对象的原型链上。

### 原理

沿着对象的原型链，逐一检查是否存在构造函数的 prototype。

### 示例

\`\`\`javascript
alice instanceof Person     // true
alice instanceof Object     // true
alice instanceof Array      // false
\`\`\`

### 等价判断

\`Person.prototype.isPrototypeOf(alice)\``,
    tags: ['JavaScript', '原型链', 'instanceof'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'js-class-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'Class',
    question: 'ES6 Class 和 ES5 原型继承有什么区别？',
    answer: `## ES6 Class vs ES5 原型继承

### 主要区别

| 特性 | Class | 原型 |
|------|-------|------|
| **语法** | 更简洁，是语法糖 | 较繁琐 |
| **方法枚举** | 不可枚举 | 可枚举 |
| **调用方式** | 只能 new | 可像函数调用 |
| **严格模式** | 默认启用 | 不启用 |

### 本质

**本质上 Class 只是原型继承的语法糖**，
内部仍然是基于原型的实现。`,
    tags: ['JavaScript', 'Class', '继承'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'js-event-loop-001',
    module: 'core',
    chapterId: 'javascript',
    category: '事件循环',
    question: '什么是事件循环？宏任务和微任务有什么区别？',
    answer: `## 事件循环

**事件循环**是 JavaScript 处理异步任务的机制。

### 宏任务 vs 微任务

| 类型 | 包含 |
|------|------|
| **宏任务** | setTimeout, setInterval, I/O, UI rendering, requestAnimationFrame |
| **微任务** | Promise.then/catch/finally, MutationObserver, queueMicrotask |

### 执行顺序

\`调用栈空 → 执行所有微任务 → 执行一个宏任务 → 重复\``,
    tags: ['JavaScript', '事件循环', '异步'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('5');
// 输出顺序：1 → 5 → 3 → 2`,
  },
  {
    id: 'js-event-loop-002',
    module: 'core',
    chapterId: 'javascript',
    category: '事件循环',
    question: '请分析这段代码的输出顺序：\n\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => setTimeout(() => console.log("4"), 0));\nPromise.resolve().then(() => console.log("3"));\nconsole.log("5");',
    answer: `## 执行分析

### 1. 同步代码

\`\`\`javascript
console.log("1");      // → 输出 1
console.log("5");      // → 输出 5
\`\`\`

### 2. 微任务队列注册

- \`Promise.resolve().then()\` → 微任务A
- \`Promise.resolve().then()\` → 微任务B

### 3. 执行微任务

- **微任务A**：\`setTimeout(() => console.log("4"), 0)\` → 注册宏任务
- **微任务B**：\`console.log("3")\` → 输出 3

### 4. 宏任务执行

- \`setTimeout(() => console.log("2"), 0)\` → 输出 2
- \`setTimeout(() => console.log("4"), 0)\` → 输出 4

## 最终答案

**1 → 5 → 3 → 2 → 4**`,
    tags: ['JavaScript', '事件循环', '异步', '手撕代码'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'js-promise-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'Promise',
    question: 'Promise 有哪三种状态？状态可以逆转吗？',
    answer: `## Promise 三种状态

| 状态 | 含义 |
|------|------|
| **pending** | 初始状态 |
| **fulfilled** | 已成功 |
| **rejected** | 已失败 |

### 核心特点

**状态一旦改变就不可逆！**

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  resolve('success');     // 状态变为 fulfilled
  reject('error');        // 这行无效！
  resolve('another');      // 这行也无效！
});
\`\`\``,
    tags: ['JavaScript', 'Promise', '异步'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `const promise = new Promise((resolve, reject) => {
  resolve('success');     // 状态变为 fulfilled
  reject('error');         // 这行无效！
  resolve('another');       // 这行也无效！
});`,
  },
  {
    id: 'js-async-await-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'async/await',
    question: 'async/await 的执行顺序是什么？为什么？',
    answer: `## async/await 执行顺序

### 执行规则

- async 函数内的**同步代码立即执行**
- **await** 会暂停函数执行，将后续代码放入**微任务**
- await Promise 完成后，继续执行后续代码

### 关键点

**await 会阻塞当前 async 函数执行，但不会阻塞外部代码**

### 示例分析

\`\`\`javascript
async function foo() {
  console.log('2');              // 同步执行
  const result = await bar();      // 暂停
  console.log('4');                // 微任务
}

console.log('1');                  // 同步
foo();                             // 同步启动
console.log('3');                  // 同步

// 输出：1 → 2 → 3 → 4
\`\`\``,
    tags: ['JavaScript', 'async', 'await', '异步'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `async function foo() {
  console.log('2');              // 同步执行
  const result = await bar();    // 暂停
  console.log('4');              // 微任务
}

console.log('1');                // 同步
foo();                           // 同步启动
console.log('3');                // 同步

// 输出：1 → 2 → 3 → 4`,
  },
  {
    id: 'js-memory-leak-001',
    module: 'core',
    chapterId: 'javascript',
    category: '内存管理',
    question: '内存泄漏的常见原因有哪些？如何避免？',
    answer: `## 内存泄漏常见原因

1. **意外全局变量**：\`function f() { a = 1; }\`
2. **闭包未释放**：长期持有大对象引用
3. **定时器未清除**：setInterval 不清理
4. **事件监听未移除**：addEventListener 无对应 remove
5. **循环引用**：现代 GC 已能处理，但 DOM 引用需注意

### 解决方案

- 使用 **let/const** 避免全局变量
- 及时**清理定时器**
- 组件卸载时**移除事件监听**
- 使用 **WeakMap/WeakSet**`,
    tags: ['JavaScript', '内存管理', '内存泄漏'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'js-weakmap-001',
    module: 'core',
    chapterId: 'javascript',
    category: '内存管理',
    question: 'WeakMap 和普通 Map 有什么区别？WeakMap 有什么应用场景？',
    answer: `## 核心区别

| 类型 | 键引用 | GC 回收 |
|------|--------|--------|
| **Map** | 强引用 | 不会自动回收 |
| **WeakMap** | 弱引用 | 可自动回收 |

### WeakMap 应用场景

- **存储对象的私有数据**
- **避免循环引用**导致的内存泄漏
- **DOM 节点作为键**，DOM 被移除时自动清理

### 示例

\`\`\`javascript
const wm = new WeakMap();
let obj = {};
wm.set(obj, 'value');
obj = null; // 消除引用后，WeakMap 中的条目可被 GC
\`\`\``,
    tags: ['JavaScript', 'WeakMap', '内存管理'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `const wm = new WeakMap();
let obj = {};
wm.set(obj, 'value');
obj = null; // 消除引用后，WeakMap 中的条目可被 GC`,
  },
  {
    id: 'js-this-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'this指向',
    question: 'this 的绑定规则有哪几种？请分别说明',
    answer: `## this 五大绑定规则

**优先级从高到低**：

### 1. new 绑定

\`new Foo()\` → this 指向**新对象**

### 2. 显式绑定

\`call/apply/bind\` → this 指向**指定对象**

### 3. 隐式绑定

\`obj.method()\` → this 指向 **obj**

### 4. 默认绑定

独立调用 → **全局对象**（或 undefined in strict）

### 5. 箭头函数

**从外部作用域继承 this**`,
    tags: ['JavaScript', 'this', '执行上下文'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `function foo() {
  console.log(this.a);
}

const obj = { a: 1, foo };
const obj2 = { a: 2, foo };

obj.foo();      // 1，隐式绑定
obj.foo.call(obj2); // 2，显式绑定优先于隐式`,
  },
  {
    id: 'js-this-bind-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'this指向',
    question: '如何改变函数内部的 this 指向？call、apply、bind 有什么区别？',
    answer: `## 改变 this 指向的三种方法

### 1. call

\`call(thisArg, ...args)\` - **立即调用**，参数逐个传入

### 2. apply

\`apply(thisArg, [args])\` - **立即调用**，参数以数组传入

### 3. bind

\`bind(thisArg, ...args)\` - **返回新函数**，不立即调用

### 核心区别

**call/apply 立即执行，bind 返回绑定后的函数引用**

### 示例

\`\`\`javascript
function greet(name) {
  return \`Hello, I'm \${this.name}, nice to \${name}\`;
}

const person = { name: 'Alice' };

greet.call(person, 'Alice');        // 立即调用
greet.apply(person, ['Bob']);       // 数组传参
const bound = greet.bind(person);   // 返回绑定函数
bound('Charlie');
\`\`\``,
    tags: ['JavaScript', 'this', 'call', 'apply', 'bind'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `function greet(name) {
  return \`Hello, I'm \${this.name}, nice to \${name}\`;
}

const person = { name: 'Alice' };

greet.call(person, 'Alice');       // 立即调用
greet.apply(person, ['Bob']);     // 数组传参
const bound = greet.bind(person);  // 返回绑定函数
bound('Charlie');`,
  },
  {
    id: 'js-new-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'new操作符',
    question: 'new 操作符做了什么？手动实现一个 new',
    answer: `## new 操作符原理

### 执行步骤

1. **创建空对象** \`{}\`
2. **设置原型链**：\`obj.__proto__ = Constructor.prototype\`
3. **绑定 this**：\`Constructor.call(obj, ...args)\`
4. **返回对象**：如果构造函数返回对象则用它，否则返回 obj

### 手写实现

\`\`\`javascript
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}
\`\`\``,
    tags: ['JavaScript', 'new', '原型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}

function Person(name) { this.name = name; }
const p = myNew(Person, 'Alice');
console.log(p instanceof Person); // true`,
  },
  {
    id: 'js-instanceof-impl-001',
    module: 'core',
    chapterId: 'javascript',
    category: '原型链',
    question: 'instanceof 的实现原理是什么？如何手写一个 instanceof？',
    answer: `## instanceof 原理

### 核心原理

检查构造函数的 **prototype** 是否在对象的原型链上。

### 手写实现

\`\`\`javascript
function myInstanceof(obj, Constructor) {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
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
    tags: ['JavaScript', 'instanceof', '原型链'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `function myInstanceof(obj, Constructor) {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  let proto = obj.__proto__;
  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = proto.__proto__;
  }
  return false;
}

console.log(myInstanceof([], Array)); // true`,
  },
  {
    id: 'js-promisify-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'Promise',
    question: '如何将回调函数 promisify 化？实现一个 promisify 函数',
    answer: `## promisify 实现

**promisify**：将回调风格的函数转为 Promise 风格。

### 核心思路

1. 返回一个新函数
2. 包装为 Promise
3. 原有回调作为 resolve/reject

### 实现代码

\`\`\`javascript
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
}
\`\`\``,
    tags: ['JavaScript', 'Promise', ' promisify'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
}

// 示例
const fs = require('fs');
const readFile = promisify(fs.readFile);
readFile('test.txt', 'utf8').then(console.log);`,
  },
  {
    id: 'js-promise-all-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'Promise',
    question: 'Promise.all、Promise.race、Promise.allSettled 有什么区别？',
    answer: `## Promise.all vs Promise.race vs Promise.allSettled

### Promise.all

- **全部成功才成功**，一个失败就失败
- 返回值**按顺序**对应输入数组

### Promise.race

- 返回**最快的一个**（无论成功/失败）

### Promise.allSettled

- **等全部结束**才返回
- 无论成功失败都记录在结果中

### 示例

\`\`\`javascript
const p1 = Promise.resolve(1);
const p2 = Promise.reject('error');
const p3 = Promise.resolve(3);

Promise.all([p1, p3]).then(console.log);        // [1, 3]
Promise.all([p1, p2]).catch(console.log);       // error
Promise.allSettled([p1, p2, p3]).then(console.log);
// [{status: 'fulfilled', value: 1},
//  {status: 'rejected', reason: 'error'},
//  {status: 'fulfilled', value: 3}]
\`\`\``,
    tags: ['JavaScript', 'Promise', 'all', 'race'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `const p1 = Promise.resolve(1);
const p2 = Promise.reject('error');
const p3 = Promise.resolve(3);

Promise.all([p1, p3]).then(console.log);       // [1, 3]
Promise.all([p1, p2]).catch(console.log);     // error
Promise.allSettled([p1, p2, p3]).then(console.log);
// [{status: 'fulfilled', value: 1},
//  {status: 'rejected', reason: 'error'},
//  {status: 'fulfilled', value: 3}]`,
  },
  {
    id: 'js-async-errors-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'async/await',
    question: 'async/await 如何正确处理错误？有哪几种方式？',
    answer: `## async/await 错误处理

### 三种方式

1. **try/catch**：最常用
2. **.catch()** on Promise
3. **全局 unhandledrejection** 事件

### 注意

**await 后的 reject 会抛出异常，需要 catch**

### 示例

\`\`\`javascript
// 方式1：try/catch
async function foo() {
  try {
    const data = await fetchData();
  } catch (err) {
    console.error(err);
  }
}

// 方式2：.catch
const data = await fetchData().catch(err => {
  console.error(err);
  return defaultValue;
});

// 方式3：全局处理
process.on('unhandledrejection', (err) => {});
\`\`\``,
    tags: ['JavaScript', 'async', 'await', '错误处理'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 方式1：try/catch
async function foo() {
  try {
    const data = await fetchData();
  } catch (err) {
    console.error(err);
  }
}

// 方式2：.catch
const data = await fetchData().catch(err => {
  console.error(err);
  return defaultValue;
});

// 方式3：全局处理
process.on('unhandledrejection', (err) => {});`,
  },
  {
    id: 'js-iteration-001',
    module: 'core',
    chapterId: 'javascript',
    category: '迭代器',
    question: '什么是迭代器协议和可迭代协议？哪些数据结构实现了可迭代？',
    answer: `## 迭代器协议 vs 可迭代协议

### 迭代器协议

具有 \`next()\` 方法，返回 \`{done, value}\`

### 可迭代协议

对象实现 \`[Symbol.iterator]()\` 方法

### 可迭代对象

- **Array**, **String**, **Map**, **Set**
- **arguments**, **NodeList**
- **生成器函数**

### 应用场景

\`for...of\`、**展开运算符**、**解构赋值**都依赖可迭代协议`,
    tags: ['JavaScript', '迭代器', 'Symbol'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 自定义迭代器
const counter = {
  [Symbol.iterator]() {
    let count = 0;
    return {
      next() {
        return count < 3
          ? { value: ++count, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const num of counter) {
  console.log(num); // 1, 2, 3
}`,
  },
  {
    id: 'js-generator-001',
    module: 'core',
    chapterId: 'javascript',
    category: '生成器',
    question: '什么是生成器函数？它和普通函数有什么区别？',
    answer: `## 生成器函数

**生成器函数**：\`function*\`，可以**暂停和恢复执行**。

### 特点

- 调用时**不立即执行**，返回迭代器
- \`next()\` 执行到下一个 **yield**
- 可 **yield 多次**
- 支持 **return** 结束`,
    tags: ['JavaScript', '生成器', 'yield'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const gen = fibonacci();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3`,
  },
  {
    id: 'js-proxy-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'Proxy',
    question: 'Proxy 可以拦截哪些操作？请列举13种拦截方法',
    answer: `## Proxy 13种拦截方法

| 方法 | 拦截操作 |
|------|----------|
| **get** | 读取属性 |
| **set** | 设置属性 |
| **has** | in 运算符 |
| **deleteProperty** | delete |
| **apply** | 函数调用 |
| **construct** | new 操作 |
| **getPrototypeOf** | Object.getPrototypeOf |
| **setPrototypeOf** | Object.setPrototypeOf |
| **isExtensible** | Object.isExtensible |
| **preventExtensions** | Object.preventExtensions |
| **getOwnPropertyDescriptor** | Object.getOwnPropertyDescriptor |
| **defineProperty** | Object.defineProperty |
| **ownKeys** | Object.keys/for...in |`,
    tags: ['JavaScript', 'Proxy', 'Reflect'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `const handler = {
  get(target, prop) {
    if (!(prop in target)) {
      throw new ReferenceError(\`\${prop} doesn't exist\`);
    }
    return Reflect.get(...arguments);
  }
};

const p = new Proxy({ name: 'Alice' }, handler);
console.log(p.name);     // Alice
console.log(p.age);      // ReferenceError`,
  },
  {
    id: 'js-symbol-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'Symbol',
    question: 'Symbol 有哪些内置值？它们有什么作用？',
    answer: `## 常见的内置 Symbol

| Symbol | 作用 |
|--------|------|
| **Symbol.iterator** | 可迭代协议 |
| **Symbol.hasInstance** | instanceof 行为 |
| **Symbol.toPrimitive** | 转原始类型 |
| **Symbol.toStringTag** | Object.prototype.toString |
| **Symbol.species** | 创建实例的构造函数 |
| **Symbol.match** | 正则匹配 |
| **Symbol.replace** | 字符串替换 |`,
    tags: ['JavaScript', 'Symbol', '内置方法'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// Symbol.toStringTag
const obj = { [Symbol.toStringTag]: 'MyObject' };
console.log(obj.toString()); // "[object MyObject]"

// Symbol.iterator
const arr = [1, 2];
console.log(arr[Symbol.iterator]()); // Array Iterator`,
  },
  {
    id: 'js-bigint-001',
    module: 'core',
    chapterId: 'javascript',
    category: 'BigInt',
    question: 'BigInt 是什么？为什么需要它？有什么限制？',
    answer: `## BigInt

**BigInt**：表示**任意精度整数**。

### 为什么需要

- **Number.MAX_SAFE_INTEGER = 2^53 - 1**
- 超过这个值的整数会**丢失精度**
- BigInt 可以**安全处理大整数**

### 限制

- **不能**和 Number 混合运算
- **不能**用于 JSON
- 需要用 \`BigInt()\` 构造函数创建`,
    tags: ['JavaScript', 'BigInt', '数字精度'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `const bigNum = 9007199254740991n;
const bigger = bigNum + 1n; // 9007199254740992n

// 不能混合运算
// bigNum + 1; // TypeError

// 正确做法
bigNum + BigInt(1); // ✅

// Number 互转
Number(bigNum);    // 9007199254740991
BigInt(9007199254740991); // 9007199254740991n`,
  },
  {
    id: 'js-event-loop-micro-001',
    module: 'core',
    chapterId: 'javascript',
    category: '事件循环',
    question: `请分析这段代码的执行顺序：

setTimeout(() => console.log("setTimeout"), 0);
Promise.resolve().then(() => console.log("Promise1"));
Promise.resolve().then(() => Promise.resolve().then(() => console.log("Promise2")));
console.log("sync");`,
    answer: `## 执行分析

### 1. 同步代码

\`\`\`javascript
console.log("sync") → 输出 sync
\`\`\`

### 2. 微任务队列注册

- \`Promise.resolve().then()\` → **微任务A**
- \`Promise.resolve().then()\` → **微任务B**

### 3. 清空微任务队列

- **微任务A**：\`console.log("Promise1")\` → 输出 Promise1
- **微任务B**：\`Promise.resolve().then()\` 注册微任务C
- **微任务C**：\`console.log("Promise2")\` → 输出 Promise2

### 4. 宏任务

**setTimeout** → 输出 setTimeout

## 最终答案

**sync → Promise1 → Promise2 → setTimeout**`,
    tags: ['JavaScript', '事件循环', '微任务', '宏任务'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'js-garbage-collection-001',
    module: 'core',
    chapterId: 'javascript',
    category: '垃圾回收',
    question: 'V8 引擎的垃圾回收算法有哪些？标记清除和增量标记有什么区别？',
    answer: `## V8 垃圾回收算法

### 1. Scavenge（新生代）

- 对象存活时间**短**
- From/To 空间互换

### 2. 标记清除（老生代）

- 标记**存活对象**
- 清除未标记对象
- 产生**内存碎片**

### 3. 增量标记

- 将标记过程**分段执行**
- 避免长时间停顿
- 与 JS 执行**交替进行**

### 4. 压缩整理

- 移动**存活对象**
- 解决**内存碎片**`,
    tags: ['JavaScript', '垃圾回收', 'V8', '内存'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'js-immutable-001',
    module: 'core',
    chapterId: 'javascript',
    category: '不可变性',
    question: '什么是不可变性（Immutability）？在前端开发中有什么应用？',
    answer: `## 不可变性

**不可变性**：创建后**不能被修改**。

### 实现方式

- \`const\` 声明对象，对象属性仍可修改
- **Object.freeze()** 浅冻结
- **深拷贝**：\`JSON.parse(JSON.stringify())\` 或递归
- 第三方库：**Immer**、**Immutable.js**

### 应用场景

- **React 状态管理**（prevState 不应直接修改）
- **Redux** 数据流
- **撤销/重做**功能
- **并发编程**`,
    tags: ['JavaScript', '不可变性', ' Immutable'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 浅冻结
const frozen = Object.freeze({ a: 1, b: { c: 2 } });
// frozen.a = 10; // 严格模式下报错
// frozen.b.c = 10; // 仍可修改！

// 深拷贝 + freeze
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach(val => {
    if (typeof val === 'object') deepFreeze(val);
  });
  return obj;
}`,
  },
  {
    id: 'js-decorators-001',
    module: 'core',
    chapterId: 'javascript',
    category: '装饰器',
    question: '什么是装饰器（Decorator）？它有什么应用场景？',
    answer: `## 装饰器

**装饰器**：ES2019 提案，用于修改类或类成员行为。

### 应用场景

- **@autobind** - 绑定 this
- **@readonly** - 只读属性
- **@debounce** - 防抖
- **@memoize** - 缓存结果
- **依赖注入**

### 注意

当前为 **Stage 2 提案**，需用 Babel 转译`,
    tags: ['JavaScript', '装饰器', 'Decorator'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 类装饰器
function sealed(target) {
  Object.seal(target);
  Object.seal(target.prototype);
}

// 方法装饰器
function log(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(\`Calling \${name} with \${args}\`);
    return original.apply(this, args);
  };
  return descriptor;
}

class Calculator {
  @log
  add(a, b) { return a + b; }
}`,
  },
];

export const javascriptChapter: Chapter = {
  id: 'javascript',
  module: 'core',
  title: 'JavaScript 核心基础',
  description: '执行上下文、作用域链、闭包、原型链、事件循环等',
  cardCount: javascriptCards.length,
  icon: '📚',
};
