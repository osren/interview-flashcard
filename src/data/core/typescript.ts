import { FlashCard, Chapter } from '@/types';

export const typescriptCards: FlashCard[] = [
  {
    id: 'ts-basic-types-001',
    module: 'core',
    chapterId: 'typescript',
    category: '基础类型',
    question: 'TypeScript 有哪些基础类型？any 和 unknown 有什么区别？',
    answer: `## 基础类型

- **string**, **number**, **boolean**
- **array**: \`T[]\` 或 \`Array<T>\`
- **tuple**: \`[T1, T2, ...]\`
- **enum**
- **null**, **undefined**
- **void**, **never**

## any vs unknown

| 类型 | 特点 |
|------|------|
| **any** | 绕过类型检查，可以调用任意方法 |
| **unknown** | 安全的任意类型，必须做类型检查才能使用 |

### 总结

**unknown 比 any 更安全**`,
    tags: ['TypeScript', '基础类型'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'ts-interface-type-001',
    module: 'core',
    chapterId: 'typescript',
    category: '接口与类型',
    question: 'interface 和 type 有什么区别？什么时候用哪个？',
    answer: `## interface vs type 区别

| 特性 | interface | type |
|------|----------|------|
| **声明合并** | 支持 | 不支持 |
| **联合类型** | 不支持 | 支持 |
| **元组/原始类型** | 不支持 | 支持 |
| **对象结构** | 更适合 | 可用 |

### 选择建议

- 定义**对象结构** → **interface**
- 涉及**联合类型/映射类型** → **type**`,
    tags: ['TypeScript', '接口', '类型别名'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'ts-generics-001',
    module: 'core',
    chapterId: 'typescript',
    category: '泛型',
    question: '什么是泛型？为什么需要泛型？',
    answer: `## 泛型

**泛型**：类型变量，让类型在使用时再确定。

### 解决的问题

- 用 **any** 丢失类型信息
- 用多个**重载**代码冗余
- 泛型提供**类型安全**的同时保留**灵活性**`,
    tags: ['TypeScript', '泛型'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 没有泛型
function identity(arg: any): any { return arg; }

// 有泛型
function identity<T>(arg: T): T { return arg; }

const result = identity('hello');
// result 被推断为 string，获得完整提示`,
  },
  {
    id: 'ts-generics-constraint-001',
    module: 'core',
    chapterId: 'typescript',
    category: '泛型约束',
    question: '什么是泛型约束？extends 关键字有什么作用？',
    answer: `## 泛型约束

**泛型约束**限制泛型的范围，确保类型具有某些属性。

### 常用约束方式

- \`extends keyof T\`：约束为 T 的键
- \`extends { length: number }\`：必须有 length 属性
- \`extends Function\`：必须是函数类型`,
    tags: ['TypeScript', '泛型约束'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 约束 T 必须有 length 属性
function logLength<T extends { length: number }>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');     // 字符串有 length ✅
logLength([1, 2, 3]);   // 数组有 length ✅
logLength({ length: 5 }); // 有 length 属性 ✅`,
  },
  {
    id: 'ts-utility-types-001',
    module: 'core',
    chapterId: 'typescript',
    category: '工具类型',
    question: '实现 Partial<T> 和 Required<T>，说明原理',
    answer: `## Partial<T> 和 Required<T>

### Partial<T> - 全部属性变为可选

\`\`\`typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};
\`\`\`

### Required<T> - 全部属性变为必需

\`\`\`typescript
type Required<T> = {
  [P in keyof T]-?: T[P];
};
\`\`\`

### 原理

- **映射类型** + **in keyof** 遍历
- **?** 可选标记
- **-?** 是用来移除可选标记的`,
    tags: ['TypeScript', '工具类型', '映射类型'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'ts-conditional-types-001',
    module: 'core',
    chapterId: 'typescript',
    category: '条件类型',
    question: '什么是条件类型？语法是什么？',
    answer: `## 条件类型

**条件类型**：根据类型关系选择类型。

### 语法

\`\`\`typescript
T extends U ? X : Y
\`\`\`

### 原理

- 如果 **T 是 U 的子类型**，返回 **X**
- 否则返回 **Y**

### 分布式条件类型

**联合类型**会自动分发计算`,
    tags: ['TypeScript', '条件类型'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// NonNullable - 移除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;

// Extract - 从 T 中提取可赋值给 U 的类型
type Extract<T, U> = T extends U ? T : never;`,
  },
  {
    id: 'ts-infer-001',
    module: 'core',
    chapterId: 'typescript',
    category: 'infer',
    question: 'infer 关键字有什么用？请举例说明',
    answer: `## infer 关键字

**infer**：在条件类型中**推断并提取**类型。

### 常见用法

- **ReturnType<T>**：提取函数返回类型
- **Parameters<T>**：提取函数参数类型
- **First<T>**：提取元组第一个元素`,
    tags: ['TypeScript', 'infer', '条件类型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 提取返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 提取元组第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;`,
  },
  {
    id: 'ts-mapped-types-001',
    module: 'core',
    chapterId: 'typescript',
    category: '映射类型',
    question: '什么是映射类型？如何实现键名重映射？',
    answer: `## 映射类型

**映射类型**：通过 \`in\` 操作符遍历键来创建新类型。

### 键名重映射（TS 4.1+）

使用 **\`as\`** 关键字可以重新映射键名`,
    tags: ['TypeScript', '映射类型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 基础映射类型
type Flags = 'a' | 'b';
type Mapped = { [K in Flags]: boolean };
// { a: boolean; b: boolean; }

// 键名重映射
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }`,
  },
  {
    id: 'ts-enum-001',
    module: 'core',
    chapterId: 'typescript',
    category: '枚举',
    question: 'TypeScript 中 enum 和 const enum 有什么区别？什么时候用？',
    answer: `## enum vs const enum

### 区别

| 类型 | 特点 |
|------|------|
| **enum** | 编译后生成真实对象，可反向映射 |
| **const enum** | 编译时内联，删除生成代码，更高性能 |

### const enum 适用场景

- 确定只用于**类型检查**
- **不需要**反向映射
- 追求更好的**性能**

### 注意

**const enum 不能使用计算属性**`,
    tags: ['TypeScript', '枚举'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 普通 enum
enum Direction { Up, Down, Left, Right }
const d = Direction.Up;     // 0
const name = Direction[0]; // "Up"

// const enum（编译后内联）
const enum HttpStatus {
  OK = 200,
  NotFound = 404
}
const code = HttpStatus.OK; // 直接替换为 200`,
  },
  {
    id: 'ts-type-guard-001',
    module: 'core',
    chapterId: 'typescript',
    category: '类型守卫',
    question: '什么是类型守卫？有哪些实现方式？',
    answer: `## 类型守卫

**类型守卫**：收窄类型范围，让 TS 知道更精确的类型。

### 实现方式

1. **typeof**：基础类型判断
2. **instanceof**：类实例判断
3. **in**：对象属性判断
4. **字面量相等**：=== / !==
5. **自定义类型守卫函数**：is 关键字`,
    tags: ['TypeScript', '类型守卫'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 1. typeof
function pad(padding: number | string) {
  if (typeof padding === 'number') return padding + 1;
  return padding.repeat(3);
}

// 2. instanceof
function log(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toISOString());
  }
}

// 3. 自定义类型守卫
function isString(val: unknown): val is string {
  return typeof val === 'string';
}`,
  },
  {
    id: 'ts-discriminated-union-001',
    module: 'core',
    chapterId: 'typescript',
    category: '联合类型',
    question: '什么是可辨识联合类型（Discriminated Union）？有什么好处？',
    answer: `## 可辨识联合类型

类型有**公共的字面量属性**（标签），TS 据此推断具体类型。

### 好处

- **完整性和穷尽性**检查
- 编译器帮助**排除不可能的类型**
- 更好的 **IDE 支持**`,
    tags: ['TypeScript', '联合类型', '类型守卫'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `interface Circle { kind: 'circle'; radius: number; }
interface Square { kind: 'square'; side: number; }
interface Rectangle { kind: 'rectangle'; width: number; height: number; }

type Shape = Circle | Square | Rectangle;

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.side ** 2;
    case 'rectangle': return s.width * s.height;
  }
}`,
  },
  {
    id: 'ts-never-unknown-001',
    module: 'core',
    chapterId: 'typescript',
    category: '特殊类型',
    question: 'never、void、unknown、any 的区别是什么？',
    answer: `## 四种类型区别

| 类型 | 含义 | 类型安全 |
|------|------|----------|
| **any** | 任意类型，绕过类型检查 | ❌ 最不安全 |
| **unknown** | 未知类型，必须做类型检查才能使用 | 中等 |
| **void** | 函数无返回值，实际是 undefined | 较高 |
| **never** | 永不返回（抛出异常或死循环） | ✅ 最安全 |

### 类型安全排序

\`\`\any > unknown > void > never\`\`

> **never** 是 bottom type，可以赋值给任何类型`,
    tags: ['TypeScript', 'never', 'void', 'unknown'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// void：函数不返回任何值
function log(msg: string): void {
  console.log(msg);
}

// never：永不返回
function fail(msg: string): never {
  throw new Error(msg);
}

// unknown：需要类型检查
function parseJSON(str: string): unknown {
  return JSON.parse(str);
}
const data = parseJSON('{}');
if (data && typeof data === 'object') {
  // 可以安全访问
}`,
  },
  {
    id: 'ts-type-assertion-001',
    module: 'core',
    chapterId: 'typescript',
    category: '类型断言',
    question: '类型断言是什么？as 和尖括号语法有什么区别？',
    answer: `## 类型断言

告诉编译器某个值的**具体类型**。

### 两种语法

- **as 语法**：\`value as Type\`（**推荐**）
- **尖括号**：\`<Type>value\`

### 区别

| 语法 | JSX 中 | 说明 |
|------|--------|------|
| **as** | ✅ 安全 | 推荐使用 |
| **尖括号** | ❌ 冲突 | .tsx 中不推荐 |

> 两者都**不是强制转换**，不保证运行时安全`,
    tags: ['TypeScript', '类型断言'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `const str = 'hello' as string;
const num = <number>unknownValue; // JSX 中不推荐

// 非空断言（跳过 null 检查）
const elem = document.getElementById('app')!;

// 类型守卫后的断言
if (typeof value === 'string') {
  const len = (value as string).length;
}`,
  },
  {
    id: 'ts-generics-multiple-001',
    module: 'core',
    chapterId: 'typescript',
    category: '泛型',
    question: '如何约束泛型必须具有某些属性？请写出示例',
    answer: `## 三种约束方式

### 1. keyof 约束

\`\`\`typescript
T extends keyof U
\`\`\`

### 2. 属性约束

\`\`\`typescript
T extends { id: string }
\`\`\`

### 3. 继承约束

\`\`\`typescript
T extends Base
\`\`\``,
    tags: ['TypeScript', '泛型约束'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 属性约束
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

// 多重约束
type T = string & number; // never`,
  },
  {
    id: 'ts-infer-advanced-001',
    module: 'core',
    chapterId: 'typescript',
    category: 'infer',
    question: '请实现 ReturnType、Parameters、ConstructorParameters 工具类型',
    answer: `## 工具类型实现

### ReturnType<T>

提取函数**返回类型**

### Parameters<T>

提取函数**参数类型**

### ConstructorParameters<T>

提取**构造函数**参数类型`,
    tags: ['TypeScript', 'infer', '工具类型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// ReturnType
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

// Parameters
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

// ConstructorParameters
type ConstructorParameters<T extends new(...args: any) => any> =
  T extends new(...args: infer P) => any ? P : never;

// 用法
type Fn = (x: number, y: string) => boolean;
type R = ReturnType<Fn>;   // boolean
type P = Parameters<Fn>;   // [number, string]`,
  },
  {
    id: 'ts-template-literal-001',
    module: 'core',
    chapterId: 'typescript',
    category: '模板字面量',
    question: '什么是模板字面量类型？有哪些应用场景？',
    answer: `## 模板字面量类型

创建**动态字符串**类型。

### 应用场景

- 生成**事件名称**类型
- **路径参数**类型
- **CSS-in-JS** 属性类型
- **自动补全提示**`,
    tags: ['TypeScript', '模板字面量'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 基础用法
type World = 'world';
type Greeting = \`hello \${World}\`; // "hello world"

// 生成属性名
type Props = 'name' | 'age';
type.Getter = \`get\${Capitalize<Props>}\`;
// "getName" | "getAge"

// 复杂场景
type EventName = 'click' | 'focus';
type Handler = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onFocus"`,
  },
  {
    id: 'ts-distributive-001',
    module: 'core',
    chapterId: 'typescript',
    category: '条件类型',
    question: '什么是分布式条件类型？为什么联合类型会自动分发？',
    answer: `## 分布式条件类型

在**裸类型参数 T** 上使用 extends 时，
联合类型会**自动分发计算**。

### 原理

\`\`\`
(A | B) extends T ? X : Y
= (A extends T ? X : Y) | (B extends T ? X : Y)
\`\`\`

### 注意

需要 T 是**裸类型**（非包装）才能分发`,
    tags: ['TypeScript', '条件类型', '分布式'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArr = ToArray<string | number>;
// string[] | number[]

// 非分布式情况
type ToArrayNonDist<T> = [T] extends any ? T[] : never;
type test = ToArrayNonDist<string | number>;
// (string | number)[]`,
  },
  {
    id: 'ts-mapped-modifiers-001',
    module: 'core',
    chapterId: 'typescript',
    category: '映射类型',
    question: '映射类型中的 +、-、readonly、? 修饰符有什么用？',
    answer: `映射类型修饰符：

• +? 或 ?：属性变为可选
• -?：移除可选标记
• +readonly 或 readonly：属性变为只读
• -readonly：移除只读标记`,
    tags: ['TypeScript', '映射类型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `interface Person { name: string; age: number; }

// 所有属性可选
type Partial<T> = { [P in keyof T]+?: T[P] };

// 所有属性必选
type Required<T> = { [P in keyof T]-?: T[P] };

// 所有属性只读
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// 移除只读
type Mutable<T> = { -readonly [P in keyof T]: T[P] };`,
  },
  {
    id: 'ts-recursive-001',
    module: 'core',
    chapterId: 'typescript',
    category: '递归类型',
    question: '什么是递归类型？TS 对递归深度有什么限制？',
    answer: `## 递归类型

类型**引用自身**。

### 示例

- **DeepPartial**：深度可选
- **DeepReadonly**：深度只读
- **Flatten**：扁平化数组

### 递归深度限制

默认深度约 **45-50 层**，
超出后需设置 tsconfig.json 的 **complexTypeDepth**`,
    tags: ['TypeScript', '递归类型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 数组元素类型
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;

// 元组转联合类型
type ElementOf<T> = T extends (infer E)[] ? E : never;`,
  },
  {
    id: 'ts-class-parameter-properties-001',
    module: 'core',
    chapterId: 'typescript',
    category: '类',
    question: 'TypeScript 类的 parameter property 是什么？',
    answer: `parameter property：
在构造函数参数前加修饰符（public/private/protected/readonly），
自动声明并赋值成员属性。`,
    tags: ['TypeScript', '类'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// 传统写法
class Person {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// parameter property 写法
class Person {
  constructor(
    public name: string,
    private age: number,
    protected address: string
  ) {}
}

// 自动完成：声明 + 赋值`,
  },
  {
    id: 'ts-abstract-class-001',
    module: 'core',
    chapterId: 'typescript',
    category: '类',
    question: '抽象类和接口有什么区别？什么时候用抽象类？',
    answer: `## 抽象类 vs 接口

| 特性 | 抽象类 | 接口 |
|------|--------|------|
| **实现代码** | 可以有 | 只声明 |
| **继承** | 只能单继承 | 可多实现 |
| **访问修饰符** | 可以有 | 隐式抽象 |
| **用途** | 有共同逻辑的类继承 | 类型约束和契约 |

### 选择原则

- 需要**共享实现** → 抽象类
- 只需**类型约束** → 接口`,
    tags: ['TypeScript', '抽象类', '接口'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `abstract class Animal {
  abstract speak(): void; // 抽象方法
  move(): void { console.log('moving'); } // 可有实现
}

class Dog extends Animal {
  speak(): void { console.log('woof'); }
}

// 接口
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

class Logger implements Loggable, Serializable {
  log(): void { console.log('log'); }
  serialize(): string { return '{}'; }
}`,
  },
  {
    id: 'ts-this-types-001',
    module: 'core',
    chapterId: 'typescript',
    category: 'this类型',
    question: 'TypeScript 中的 this 类型是什么？如何使用？',
    answer: `## this 类型

### 作用

- **推断**函数中的 this 类型
- **显式声明** this 参数类型
- 支持**链式调用/流式 API** 设计

### 使用场景

- 显式声明函数 this 类型
- 链式调用返回 this`,
    tags: ['TypeScript', 'this类型'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// 显式声明 this 类型
function delay(fn: () => void, ms: number) {
  return function(this: any) {
    setTimeout(() => fn.apply(this), ms);
  };
}

// 链式调用
class Builder {
  private data: object = {};
  set(name: string, value: any): this {
    this.data[name] = value;
    return this;
  }
  build(): object {
    return { ...this.data };
  }
}`,
  },
  {
    id: 'ts-namespace-module-001',
    module: 'core',
    chapterId: 'typescript',
    category: '模块化',
    question: 'namespace 和 module 有什么区别？',
    answer: `历史遗留区别：
• namespace = 早期的模块语法
• module = ES6 模块（推荐）

现代 TS 实践：
• 使用 ES6 import/export
• 避免 namespace（除声明合并等特殊情况）
• esModuleInterop 处理默认导入差异`,
    tags: ['TypeScript', '模块化', 'namespace'],
    status: 'unvisited',
    difficulty: 'easy',
    codeExample: `// namespace（不推荐）
namespace Validation {
  export interface Rule { check(v: any): boolean; }
}

// ES6 module（推荐）
// validation.ts
export interface Rule { check(v: any): boolean; }

// consumer.ts
import { Rule } from './validation';`,
  },
  {
    id: 'ts-declaration-merging-001',
    module: 'core',
    chapterId: 'typescript',
    category: '声明合并',
    question: '什么是声明合并？有哪些场景？',
    answer: `声明合并：同名的多个声明合并为一个。

合并规则：
• 接口：属性交叉（后者覆盖前者）
• namespace：内部模块合并
• 类：不能直接合并，用 extends 或 mixin
• 类型别名、枚举不可合并`,
    tags: ['TypeScript', '声明合并'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// 接口合并
interface A { x: number; }
interface A { y: number; }
const a: A = { x: 1, y: 2 }; // ✅

// namespace 合并
namespace Animal {
  export class Dog {}
}
namespace Animal {
  export function bark() {}
}

// 类扩展（mixin 模式）
class Point {
  constructor(public x: number, public y: number) {}
}
function Serializable<T extends new(...args: any[]) => Point>(
  Base: T
) {
  return class extends Base {
    serialize() { return JSON.stringify(this); }
  };
}`,
  },
  {
    id: 'ts-type-compatibility-001',
    module: 'core',
    chapterId: 'typescript',
    category: '类型兼容',
    question: 'TypeScript 的类型兼容性（Structural Typing）是什么？',
    answer: `结构类型（Structural Typing）：
只要对象具有目标类型所需的所有属性，就认为兼容。

规则：
• 子类型属性可以多于父类型
• 必需属性必须兼容
• 函数参数逆变
• 函数返回值协变`,
    tags: ['TypeScript', '类型兼容'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `interface Pet { name: string; }
interface Dog { name: string; breed: string; }

let pet: Pet = { name: 'Tom' };
let dog: Dog = { name: 'Spot', breed: 'Bulldog' };

pet = dog; // ✅ Dog 有 name 属性
// dog = pet; // ❌ Pet 缺少 breed 属性

// 函数参数逆变
type Callback = (pet: Pet) => void;
let cb: Callback = (p: Pet) => console.log(p.name);
// 接受 Dog 也可，因为 Dog 是 Pet 的子类型`,
  },
  {
    id: 'ts-generics-default-001',
    module: 'core',
    chapterId: 'typescript',
    category: '泛型',
    question: '泛型默认值是什么语法？有什么作用？',
    answer: `泛型默认值：
泛型参数可设置默认类型，不指定时使用默认类型。

作用：
• API 向后兼容
• 减少类型推断负担
• 提供合理的默认行为`,
    tags: ['TypeScript', '泛型默认值'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `interface Props {
  children?: React.ReactNode;
}

interface ButtonProps extends Props {
  variant?: 'primary' | 'secondary'; // 默认 'primary'
}

// 泛型默认值
type Factory<T = string> = (input: T) => T;

const factory: Factory = (input) => input; // 默认 T = string
const numFactory: Factory<number> = (input) => input * 2;`,
  },
  {
    id: 'ts-conditional-pick-001',
    module: 'core',
    chapterId: 'typescript',
    category: '工具类型',
    question: '实现 Pick<T, K> 和 Omit<T, K>，说明原理',
    answer: `Pick<T, K> - 从 T 中选取部分属性：
Omit<T, K> - 从 T 中排除部分属性`,
    tags: ['TypeScript', '工具类型'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// Pick 实现
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit 实现
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Exclude 实现
type Exclude<T, U> = T extends U ? never : T;

// Extract 实现
type Extract<T, U> = T extends U ? T : never;

// 用法
interface Todo { title: string; desc: string; done: boolean; }
type TodoPreview = Pick<Todo, 'title' | 'done'>;
// { title: string; done: boolean; }
type TodoInfo = Omit<Todo, 'done'>;
// { title: string; desc: string; }`,
  },
  {
    id: 'ts-readonly-partial-001',
    module: 'core',
    chapterId: 'typescript',
    category: '工具类型',
    question: '实现 Readonly<T>、Required<T>、NonNullable<T>',
    answer: `工具类型实现：

Readonly<T> - 所有属性只读
Required<T> - 所有属性必选
NonNullable<T> - 移除 null 和 undefined`,
    tags: ['TypeScript', '工具类型'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// Readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Required
type Required<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选标记
};

// NonNullable
type NonNullable<T> = T extends null | undefined ? never : T;

// 用法
type T1 = Readonly<{ x: number; y?: number }>;
// { readonly x: number; readonly y?: number; }

type T2 = Required<{ x: number; y?: number }>;
// { x: number; y: number; }

type T3 = NonNullable<string | null | undefined>;
// string`,
  },
  {
    id: 'ts-record-001',
    module: 'core',
    chapterId: 'typescript',
    category: '工具类型',
    question: 'Record<K, V> 和 Map<K, V> 有什么区别？什么时候用哪个？',
    answer: `## Record vs Map

| 特性 | Record<K, V> | Map<K, V> |
|------|--------------|-----------|
| **类型检查** | 编译时 | 运行时 |
| **键类型** | 固定 | 任意类型 |
| **访问方式** | 点语法 | get/set/has API |
| **适用场景** | 固定属性集合、JSON | 动态增删 |

### 选择原则

- **固定属性集合** → Record
- **动态键值** → Map`,
    tags: ['TypeScript', 'Record', 'Map'],
    status: 'unvisited',
    difficulty: 'medium',
    codeExample: `// Record
type Page = 'home' | 'about' | 'contact';
type PageInfo = Record<Page, { title: string; path: string }>;

const pages: PageInfo = {
  home: { title: 'Home', path: '/' },
  about: { title: 'About', path: '/about' },
  contact: { title: 'Contact', path: '/contact' },
};

// Map
const map = new Map<string, number>();
map.set('a', 1);
map.has('a'); // true
map.delete('a');`,
  },
  {
    id: 'ts-mixed-001',
    module: 'core',
    chapterId: 'typescript',
    category: '特殊类型',
    question: '混合类型（Mixins）模式是什么？如何实现？',
    answer: `Mixins 模式：组合多个类功能。

实现方式：
• extends 链式继承
• 类 mixin 函数（返回扩展类）
• TS mixin 约束（Constructor 类型）`,
    tags: ['TypeScript', 'Mixins'],
    status: 'unvisited',
    difficulty: 'hard',
    codeExample: `// Mixin 函数
function Timestamped<T extends new(...args: any[]) => object>(
  Base: T
) {
  return class extends Base {
    timestamp = Date.now();
  };
}

function Serializable<T extends new(...args: any[]) => object>(
  Base: T
) {
  return class extends Base {
    serialize(): string {
      return JSON.stringify(this);
    }
  };
}

class Point { constructor(public x: number, public y: number) {} }

const TimestampPoint = Timestamped(Point);
const SerializablePoint = Serializable(Point);

// 组合多个 mixins
const FinalPoint = Serializable(Timestamped(Point));
const p = new FinalPoint(1, 2);
p.timestamp; // Date.now()
p.serialize(); // "{}"`,
  },
];

export const typescriptChapter: Chapter = {
  id: 'typescript',
  module: 'core',
  title: 'TypeScript 类型系统',
  description: '基础类型、泛型、条件类型、映射类型、工具类型',
  cardCount: typescriptCards.length,
  icon: '📘',
};
