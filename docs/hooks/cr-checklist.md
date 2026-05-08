# CR 检查清单

Code Review 检查清单，用于代码提交前自查。

## 通用检查

### 代码规范

- [ ] 无 `any` 类型
- [ ] 无 `console.log` (调试代码)
- [ ] 无 TODO (未完成的代码)
- [ ] 变量命名符合规范

### TypeScript

- [ ] 类型定义完整
- [ ] 无隐式 any
- [ ] Props 接口定义

### React

- [ ] 使用函数组件
- [ ] useEffect 依赖完整
- [ ] 无内存泄漏

### Tailwind CSS

- [ ] 使用工具类
- [ ] 响应式设计

### 功能

- [ ] 代码逻辑正确
- [ ] 边界处理
- [ ] 错误处理

## 提交前自检

1. 运行 `npm run lint`
2. 运行 `npm run build`
3. 检查无警告

## OpenHarness 命令

- `/oh:propose` - 新需求提案
- `/oh:apply` - 执行需求
- `/oh:verify` - 独立验收
- `/oh:review` - 综合 review
- `/oh:archive` - 归档需求