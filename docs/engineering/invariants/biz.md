# 业务规则

## React 组件开发规范

### 组件结构

```tsx
// 好的示例
import { useState } from 'react'

interface Props {
  title: string
  onSubmit: (value: string) => void
}

export function MyComponent({ title, onSubmit }: Props) {
  const [value, setValue] = useState('')

  return (
    <div>
      <h1>{title}</h1>
      {/* component content */}
    </div>
  )
}
```

### 规则

1. **组件文件命名**: 使用 kebab-case 或 PascalCase
2. **Props 类型**: 使用 interface 定义，明确类型
3. **禁止 any**: TypeScript 禁止使用 any 类型
4. **优先使用函数组件**: 不使用类组件
5. **Hook 依赖**: useEffect 依赖数组必须完整

## TypeScript 规则

### 不变量

1. **禁止 any**: 严格禁止 `any` 类型，使用 `unknown` 替代
2. **严格的类型推断**: 优先使用类型推断，避免冗余类型标注
3. **null 检查**: 使用可选链 `?.` 和空值合并 `??`
4. **接口优先**: 优先使用 interface 而非 type（可扩展性）

## Tailwind CSS 规则

### 不变量

1. **使用工具类**: 使用 Tailwind 工具类而非内联样式
2. **响应式设计**: 使用响应式前缀 (sm:, md:, lg:)
3. **深色模式**: 支持 dark: 前缀
4. **自定义配置**: 在 tailwind.config.js 中扩展主题