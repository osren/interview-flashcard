# BUG 修复记录

> 记录 InterviewFlash 项目中发现的问题及修复方案

---

## Bug #1: 卡片翻转无内容

### 问题描述
点击卡片翻转后，背面（答案面）显示为空或内容不可见。

### 根本原因
1. `motion.div` 的 `animate` 属性使用了条件表达式 `rotateY: isFlipped ? 180 : 0`
2. 当 `isFlipped` 初始为 `false` 时，动画状态未正确初始化
3. CSS `backface-visibility: hidden` 与 Framer Motion 动画可能存在冲突

### 修复方案
```tsx
// 修复前
<motion.div
  className="relative w-full h-full"
  initial={false}
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6, ease: 'easeInOut' }}
  style={{ transformStyle: 'preserve-3d' }}
>
  <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
    {/* 背面内容 */}
  </div>
</motion.div>

// 修复后 - 简化方案：使用 AnimatePresence 控制显示
<div className="relative" style={{ perspective: '1000px' }}>
  <AnimatePresence mode="wait">
    {isFlipped ? (
      <motion.div
        key="back"
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 180, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 ..."
      >
        {/* 背面内容 */}
      </motion.div>
    ) : (
      <motion.div
        key="front"
        initial={{ rotateY: 0, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -180, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 ..."
      >
        {/* 正面内容 */}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### 经验总结
- Framer Motion 的条件动画可能不稳定，特别是与 `backface-visibility` 配合时
- 使用 `AnimatePresence` + 条件渲染更可靠
- 背面元素需要明确设置 `transform: rotateY(180deg)`

---

## Bug #2: 卡片布局遮挡标题

### 问题描述
1. 卡片占据了整个页面高度，遮挡了顶部的"TypeScript 1 of 8"标题
2. 卡片呈条状（高度过大），而不是理想的长方形布局

### 根本原因
```tsx
// 问题代码
<div className="relative cursor-pointer perspective-1000 min-h-[400px]">
  {/* min-h-[400px] 导致卡片过高，在小屏幕上遮挡顶部 */}
</div>
```

### 修复方案
```tsx
// 修复后 - 使用固定高度和明确布局
<div className="relative cursor-pointer" style={{ height: '480px', perspective: '1000px' }}>
  {/* 正面 */}
  <div className="absolute inset-0 flex flex-col bg-white rounded-2xl...">
    {/* 顶部标签区 - 固定在顶部 */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <Badge>类别</Badge>
      <Badge>状态</Badge>
    </div>

    {/* 内容区 - flex-1 占据剩余空间，可滚动 */}
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <h2 className="text-lg ...">{card.question}</h2>
    </div>

    {/* 底部提示 - 固定在底部 */}
    <div className="px-6 py-3 bg-gray-50 ...">
      点击卡片查看答案
    </div>
  </div>
</div>
```

### 关键 CSS 技巧
| 技巧 | 说明 |
|------|------|
| `height: 480px` | 固定高度，确保长方形布局 |
| `flex flex-col` | 垂直布局 |
| `flex-1` | 内容区占据剩余空间 |
| `overflow-y-auto` | 内容过多时可滚动 |
| `rounded-2xl` | 圆角卡片样式 |

### 经验总结
- 不要过度依赖 `min-height`，会导致布局不可预测
- 使用固定高度 + flex 布局可以精确控制卡片比例
- 顶部和底部的固定区域用 `border` 分隔，中间内容区用 `flex-1`

---

## Bug #3: 代码块未正确渲染

### 问题描述
带有 `codeExample` 字段的卡片，代码没有放在代码块中显示，而是作为普通文本。

### 根本原因
```tsx
// 问题代码 - 代码块没有被正确包裹
{card.codeExample && (
  <div>
    <h3>💻 代码示例</h3>
    <pre className="bg-gray-900 ...">
      <code>{card.codeExample}</code>
    </pre>
  </div>
)}
```

### 修复方案
确保代码块有正确的样式和结构：

```tsx
{card.codeExample && (
  <div className="mt-4">
    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
      <span>💻</span> 代码示例
    </h4>
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">
      <code>{card.codeExample}</code>
    </pre>
  </div>
)}
```

### 代码块样式要点
| 样式类 | 作用 |
|--------|------|
| `bg-gray-900` | 深色背景，突出代码 |
| `text-gray-100` | 浅色文字 |
| `p-4` | 内边距 |
| `rounded-lg` | 圆角 |
| `text-xs` | 较小字体（代码通常用等宽小字体）|
| `overflow-x-auto` | 代码超出时水平滚动 |
| `leading-relaxed` | 行高适当增加，提高可读性 |

### 经验总结
- `<pre><code>` 是标准的代码块 HTML 结构
- Tailwind 中 `whitespace-pre-wrap` 对答案文本有用，但代码块不需要
- 代码块应该有自己的视觉样式（深色背景、等宽字体）

---

## Bug #4: 答案卡片字体过小

### 问题描述
卡片背面（答案面）的文字太小，阅读体验差。

### 根本原因
FlashCard 组件中答案内容区使用了 `text-sm` 字体。

### 修复方案
```tsx
// 修复后 - 将 text-sm 改为 text-base
<div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
  {card.answer}
</div>

<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto leading-relaxed">
  <code>{card.codeExample}</code>
</pre>

<p className="text-base text-yellow-700">
  {card.extendQuestion}
</p>
```

### 经验总结
- 答案内容应使用 `text-base`（约16px）确保可读性
- 代码块保持 `text-sm`（约14px）是因为等宽字体本身较紧凑

---

## Bug #5: 非JS/TS章节卡片显示"加载中..."

### 问题描述
点击 Browser、Performance 等非 JavaScript/TypeScript 章节时，显示"加载中..."而非实际卡片内容。

### 根本原因
CoreChapter 组件通过 Zustand store 获取卡片数据，但 `setCards` 是异步操作，组件在数据到达前就执行了 `currentCard = cards[currentIndex]`，此时 `cards` 仍为空数组。

### 修复方案
使用本地 `useState` 管理章节卡片，数据直接从 `coreCards` 过滤获取：

```tsx
// 修复后 - 使用本地 useState
const [cards, setCards] = useState<FlashCard[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
  const chapterCards = coreCards.filter((c) => c.chapterId === chapterId);
  setCards(chapterCards);
  setCurrentIndex(0); // 切换章节时重置到第一张
}, [chapterId]);

// currentCard 现在是响应式的，cards 更新后自动重新渲染
const currentCard = cards[currentIndex];
```

### 经验总结
- 组件本地的临时状态优先使用 `useState`，避免 Zustand 异步更新导致的状态不一致
- `useEffect` 监听 `chapterId` 变化，确保切换章节时重新加载数据
- 初始化时 `setCurrentIndex(0)` 防止从旧章节遗留的索引导致显示空白

---

## 内化经验总结

### 1. Framer Motion 使用规范
```
✅ 推荐：AnimatePresence + 条件渲染
❌ 避免：条件动画 + backface-visibility 混用
```

### 2. 卡片布局规范
```
✅ 固定高度 + flex 布局 + overflow 处理
❌ 避免：min-height 导致的布局不可控
```

### 3. 代码块渲染规范
```
✅ 独立样式 + 固定结构 <pre><code>
❌ 避免：普通文本样式
```

### 4. 组件开发检查清单
- [ ] 翻转动画在所有状态下正常
- [ ] 卡片高度固定，不会遮挡页面其他元素
- [ ] 内容可滚动，不会溢出容器
- [ ] 代码块有正确的语法高亮背景
- [ ] 响应式布局正常

---

## 后续开发注意事项

1. **动画优先使用 AnimatePresence**：比条件动画更稳定
2. **避免过度使用 min/max 高度**：优先使用固定值或 flex
3. **代码块必须有独立样式**：不要依赖默认文本样式
4. **测试翻转动画的所有状态**：正→反、反→正、连续点击
5. **确保内容可访问性**：滚动、焦点等
6. **组件本地状态优先 useState**：异步 store 可能导致状态不一致
7. **章节切换时重置索引**：防止遗留索引导致显示空白

---

*记录时间：2026-03-28*
