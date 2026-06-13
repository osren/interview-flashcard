/*
 * @Author: tancheng
 * @Date: 2026-05-21 10:43:24
 * @LastEditors: tancheng
 * @LastEditTime: 2026-06-06
 * @FilePath: /interview-flashcard/src/data/mpx/mpx.ts
 * @Description: MPX 闪卡数据
 */
import { FlashCard, Chapter, ModuleType } from '@/types';
import mpxGuideRaw from '@/../docs/Mpx/mpx-guide.md?raw';
import mpxArchitectureRaw from '@/../docs/Mpx/mpx-architecture.md?raw';
import devGuideRaw from '@/../docs/Mpx/dev-guide.md?raw';

/**
 * Parse technical documentation format:
 * ## 1. 标题\n\n内容\n\n---\n\n## 2. 标题\n\n内容
 */
function parseTechDocCards(
  content: string,
  chapterId: string,
  module: ModuleType = 'mpx'
): FlashCard[] {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const sections = normalized.split(/\n---\n/);

  const cards: FlashCard[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ')) continue;

    const lines = trimmed.split('\n');
    const firstLine = lines[0].trim();
    const match = firstLine.match(/^## (\d+)\.\s+(.+)$/);

    if (match) {
      const num = match[1];
      const title = match[2].trim();
      const contentLines = lines.slice(1).join('\n').trim();

      if (contentLines) {
        const card: FlashCard = {
          id: `${chapterId}-${num}`,
          module,
          chapterId,
          question: title,
          answer: contentLines,
          tags: [chapterId],
          status: 'unvisited',
        };
        cards.push(card);
      }
    }
  }

  return cards;
}

function getChapterTitle(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

// ============================================================
// 结构化 MPX 基础语法闪卡（mpx-basic 章节）
// 内容来源: docs/Mpx/mpx-guide.md
// ============================================================

export const mpxBasicCards: FlashCard[] = [
  // ==================== 模板语法 (tmpl) ====================

  {
    id: 'mpx-tmpl-001',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 中如何实现条件渲染？wx:if 和 wx:show 有什么区别？',
    answer: `## 条件渲染

### wx:if vs wx:show

| 特性 | wx:if | wx:show |
|------|-------|---------|
| 原理 | 控制 DOM 的创建/销毁 | 仅切换 CSS display |
| 性能 | 切换开销高 | 切换开销低 |
| 适用 | 条件不常切换 | 频繁切换 |

### 代码示例

\`\`\`html
<!-- wx:if: 条件为 false 时销毁 DOM -->
<view wx:if="{{show}}">显示内容</view>

<!-- wx:show: 始终存在于 DOM，仅隐藏 -->
<view wx:show="{{visible}}">始终存在于 DOM</view>
\`\`\`

### 链式条件

\`\`\`html
<view wx:if="{{type === 'A'}}">类型 A</view>
<view wx:elif="{{type === 'B'}}">类型 B</view>
<view wx:else>默认类型</view>
\`\`\``,
    tags: ['MPX', '模板语法', '条件渲染', 'wx:if', 'wx:show'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-002',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 列表渲染的基本语法是什么？wx:key 的作用是什么？',
    answer: `## 列表渲染

### 基本语法

\`\`\`html
<view wx:for="{{list}}" wx:key="id">
  <text>{{ item.name }}</text>
</view>
\`\`\`

### wx:key 的作用

- **作用**：为每个列表项指定唯一标识符，帮助 MPX 高效更新列表
- **推荐做法**：使用数据中具有唯一性的字段（如 id）
- **不推荐**：使用 index（列表中间插入/删除时会导致状态错位）

### 带索引遍历

\`\`\`html
<view wx:for="{{list}}" wx:for-index="idx" wx:for-item="element" wx:key="id">
  <text>{{ idx }}: {{ element.name }}</text>
</view>
\`\`\`

### 嵌套遍历

\`\`\`html
<view wx:for="{{dataList}}" wx:key="index">
  <view wx:for="{{item.children}}" wx:key="childId">
    {{ item.title }} - {{ childItem.name }}
  </view>
</view>
\`\`\``,
    tags: ['MPX', '模板语法', '列表渲染', 'wx:for', 'wx:key'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-003',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 中如何绑定事件？bindtap 和 catchtap 的区别是什么？',
    answer: `## 事件绑定

### 基本语法

\`\`\`html
<!-- 点击事件 -->
<view bindtap="handleClick">点击</view>

<!-- 阻止冒泡 -->
<view catchtap="handleClick">阻止冒泡</view>

<!-- 捕获阶段 -->
<view capture-catch:tap="handleCapture">捕获阶段阻止</view>
\`\`\`

### bindtap vs catchtap

| 模式 | 说明 |
|------|------|
| bindtap | 标准冒泡，事件会向上传播 |
| catchtap | 阻止冒泡，事件不会继续向上传播 |
| capture-catch:tap | 在捕获阶段阻止 |

### 事件传参

\`\`\`html
<!-- 通过 data-* 属性传参 -->
<view bindtap="handleClick" data-id="{{item.id}}" data-name="{{item.name}}">
  点击
</view>
\`\`\`

\`\`\`javascript
methods: {
  handleClick(e) {
    const { id, name } = e.currentTarget.dataset
    console.log(id, name)
  }
}
\`\`\``,
    tags: ['MPX', '模板语法', '事件绑定', 'bindtap', 'catchtap'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-004',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 模板中如何动态绑定类名？wx:class 的用法有哪些？',
    answer: `## 类名绑定

### 对象语法

\`\`\`html
<view wx:class="{{ { 'active': isActive, 'disabled': isDisabled } }}">
  动态类名
</view>
\`\`\`

### 字符串拼接

\`\`\`html
<view wx:class="base-class {{ isActive ? 'active' : '' }}">
  混合类名
</view>
\`\`\`

### 三元运算符

\`\`\`html
<view wx:class="{{ isFirst ? 'first-item' : 'item' }}">
  类名切换
</view>
\`\`\`

### 数组语法

\`\`\`html
<view wx:class="{{ [baseClass, isActive ? 'active' : '', extraClass] }}">
  数组类名
</view>
\`\`\``,
    tags: ['MPX', '模板语法', '类名绑定', 'wx:class'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-005',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 模板中如何动态绑定内联样式？wx:style 的用法是什么？',
    answer: `## 样式绑定

### 对象语法

\`\`\`html
<view wx:style="{{ { color: textColor, fontSize: fontSize + 'px' } }}">
  动态样式
</view>
\`\`\`

### 字符串拼接

\`\`\`html
<view wx:style="color: {{color}}; padding: {{padding}}px;">
  内联样式
</view>
\`\`\`

### 三元运算

\`\`\`html
<view wx:style="{{ isCenter ? 'text-align: center' : 'text-align: left' }}">
  条件样式
</view>
\`\`\``,
    tags: ['MPX', '模板语法', '样式绑定', 'wx:style'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-006',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 中如何实现双向绑定？input/textarea 的双向绑定写法是什么？',
    answer: `## 双向绑定

### input 双向绑定

\`\`\`html
<input
  type="text"
  value="{{inputValue}}"
  bindinput="handleInput"
/>
\`\`\`

\`\`\`javascript
methods: {
  handleInput(e) {
    this.inputValue = e.detail.value
  }
}
\`\`\`

### textarea 双向绑定

\`\`\`html
<textarea
  value="{{content}}"
  bindinput="handleInput"
  maxlength="200"
/>
\`\`\`

### checkbox 双向绑定

\`\`\`html
<checkbox-group bindchange="handleChange">
  <checkbox value="{{item.value}}" checked="{{item.checked}}" />
</checkbox-group>
\`\`\`

### 表单整体提交

\`\`\`html
<form bindsubmit="handleSubmit" bindreset="handleReset">
  <input name="username" value="{{username}}" />
  <button form-type="submit">提交</button>
</form>
\`\`\`

\`\`\`javascript
handleSubmit(e) {
  const { username } = e.detail.value
  console.log(username)
}
\`\`\``,
    tags: ['MPX', '模板语法', '双向绑定', '表单', 'bindinput'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-tmpl-007',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 文本插值的语法是什么？可以包含哪些表达式？',
    answer: `## 文本插值

### 基本语法

\`\`\`html
<text>{{ message }}</text>
\`\`\`

### 支持的表达式

\`\`\`html
<!-- 算术运算 -->
<text>{{ count + 1 }}</text>

<!-- 三元运算符 -->
<text>{{ isActive ? '激活' : '未激活' }}</text>

<!-- 调用方法 -->
<text>{{ formatPrice(price) }}</text>

<!-- 调用 WXS 模块方法 -->
<text>{{ tools.formatDate(time) }}</text>
\`\`\`

### 注意

- 模板中调用方法每次渲染都会执行，影响性能
- 推荐使用 computed 或预先处理数据`,
    tags: ['MPX', '模板语法', '文本插值', '{{}}'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-008',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 中 block 标签的作用是什么？适合在哪些场景使用？',
    answer: `## block 标签

### 作用

\`\`\`html
<block wx:if="{{hasHeader}}">
  <view class="header">头部</view>
  <view class="content">内容</view>
</block>
\`\`\`

- **block** 是一个包装元素，不会渲染成实际 DOM 节点
- 用于对多个元素进行条件/循环控制
- 支持 wx:if、wx:for、wx:elif 等指令

### 使用场景

1. **条件渲染多个元素**：用一个 wx:if 控制多个子元素
2. **列表渲染分组**：对一组相关元素统一渲染
3. **配合 wx:elif 使用**：

\`\`\`html
<block wx:if="{{type === 'A'}}">
  <view>内容 A1</view>
  <view>内容 A2</view>
</block>
<block wx:elif="{{type === 'B'}}">
  <view>内容 B</view>
</block>
\`\`\``,
    tags: ['MPX', '模板语法', 'block', '条件渲染'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  // ==================== 响应式 (reactive) ====================

  {
    id: 'mpx-reactive-001',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 中如何定义响应式数据？data 选项的写法是什么？',
    answer: `## 响应式数据定义

### 基本语法

\`\`\`javascript
data() {
  return {
    message: 'Hello MPX',
    count: 0,
    isLoading: false,
    list: [],
    userInfo: {},
    flightDetail: {
      departure: { time: '', airport: '' },
      arrival: { time: '', airport: '' }
    }
  }
}
\`\`\`

### 关键约束

- data 必须是一个**函数**（组件实例）
- 返回的对象属性会自动成为响应式
- 顶层属性必须是对象，不支持嵌套函数的响应式

### 简写形式

\`\`\`javascript
data: {
  return {
    title: '默认标题'
  }
}
\`\`\`

### 使用示例

\`\`\`javascript
// 读取
console.log(this.message)

// 写入（必须是响应式路径）
this.message = 'new value'
this.count = this.count + 1
\`\`\``,
    tags: ['MPX', '响应式', 'data', '状态定义'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-reactive-002',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 计算属性的基本语法是什么？computed 和 data 的区别是什么？',
    answer: `## 计算属性

### 基本语法

\`\`\`javascript
computed: {
  // 基本计算
  doubleCount() {
    return this.count * 2
  },

  // 依赖多个值
  totalPrice() {
    return this.price * this.quantity
  },

  // 返回布尔值
  isEmpty() {
    return this.list.length === 0
  }
}
\`\`\`

### computed vs data

| 特性 | data | computed |
|------|------|---------|
| 用途 | 存储状态 | 派生状态 |
| 更新 | 手动修改 | 自动计算 |
| 缓存 | 无 | 有（依赖不变时不重算） |

### 使用场景

\`\`\`javascript
computed: {
  // 过滤列表
  activeList() {
    return this.list.filter(item => item.status === 'active')
  },

  // 格式化数据
  formattedPrice() {
    return \`¥\${(this.price / 100).toFixed(2)}\`
  },

  // 条件判断
  canSubmit() {
    return this.username && this.password && !this.loading
  }
}
\`\`\``,
    tags: ['MPX', '响应式', 'computed', '计算属性'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-reactive-003',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 计算属性如何与 Store 结合使用？mapState 的用法是什么？',
    answer: `## 计算属性与 Store

### mapState 基本用法

\`\`\`javascript
computed: {
  ...store.mapState({
    // 直接映射
    userInfo: 'user.userInfo',
    flightConfig: 'flightList.flightConfig',

    // 重命名
    isIntl: (state) => state.travel.isIntlCity
  })
}
\`\`\`

### mapGetters

\`\`\`javascript
computed: {
  ...store.mapGetters({
    // 映射 getters
    currentId: 'travel.currentId',
    onlyBookingForSelf: 'rule.onlyBookingForSelf'
  })
}
\`\`\`

### 直接访问

\`\`\`javascript
import store from '@/store'

computed: {
  ...store.mapState({
    systemInfo: 'system.systemInfo'
  })
}
\`\`\`

### 更新 Store 数据

\`\`\`javascript
methods: {
  updateData() {
    store.commit('order.setDetail', this.newData)
  }
}
\`\`\``,
    tags: ['MPX', '响应式', 'computed', 'Store', 'mapState'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-reactive-004',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 计算属性支持 getter/setter 吗？如何使用？',
    answer: `## 计算属性 getter/setter

### 基本语法

\`\`\`javascript
computed: {
  fullName: {
    get() {
      return this.firstName + ' ' + this.lastName
    },
    set(value) {
      const [first, last] = value.split(' ')
      this.firstName = first
      this.lastName = last
    }
  }
}
\`\`\`

### 实际应用示例

\`\`\`javascript
computed: {
  cabinType: {
    get() {
      return this.cabin_types_tab?.find(x => x.selected)?.cabin_type || ''
    },
    set(val) {
      this.cabin_type = val
    }
  }
}
\`\`\`

### 使用场景

- 需要**读取**和**写入**同一个派生值时
- 双向绑定中需要同步更新多个相关状态时
- 格式化输入值（如价格分为转元）`,
    tags: ['MPX', '响应式', 'computed', 'getter', 'setter'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-reactive-005',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 监听器（watch）的基本语法是什么？如何监听单个值？',
    answer: `## 监听器 watch

### 基本语法

\`\`\`javascript
watch: {
  // 监听简单值
  inputValue(newVal, oldVal) {
    console.log('值变化:', newVal, oldVal)
    this.showClear = newVal.length > 0
  },

  // 监听对象
  userInfo(newVal) {
    console.log('用户信息变化:', newVal)
  }
}
\`\`\`

### 监听器回调参数

- **newVal**: 变化后的值
- **oldVal**: 变化前的值（简单值类型可用，对象类型与 newVal 相同引用）

### 使用场景

\`\`\`javascript
watch: {
  // 搜索防抖
  searchKey: {
    handler(newVal) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.fetchData(newVal)
      }, 300)
    }
  },

  // 分页切换
  currentPage: {
    handler(page) {
      this.fetchList(page)
    }
  }
}
\`\`\``,
    tags: ['MPX', '响应式', 'watch', '监听器'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-reactive-006',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX watch 如何进行深度监听？deep: true 的用法是什么？',
    answer: `## 深度监听

### 基本语法

\`\`\`javascript
watch: {
  // 深度监听对象变化
  flightDetail: {
    deep: true,
    handler(newVal) {
      console.log('航班详情变化:', newVal)
    }
  },

  // 深度监听数组
  cabinList: {
    deep: true,
    handler(newList) {
      this.updateCabinDisplay(newList)
    }
  }
}
\`\`\`

### 深度监听特点

- **deep: true** 会监听对象/数组内部所有层级的变化
- 性能开销较大，优先使用**监听特定路径**代替

### 监听嵌套属性（推荐）

\`\`\`javascript
watch: {
  // 监听嵌套属性（更高效）
  'obj.nested.key'(newVal) {
    console.log('嵌套属性变化:', newVal)
  }
}
\`\`\`

### immediate 选项

\`\`\`javascript
watch: {
  initialData: {
    immediate: true,
    handler(newVal) {
      console.log('初始化时立即执行:', newVal)
      this.processData(newVal)
    }
  }
}
\`\`\``,
    tags: ['MPX', '响应式', 'watch', '深度监听', 'deep'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-reactive-007',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 中 computed 和 watch 的区别是什么？各自适合什么场景？',
    answer: `## computed vs watch

### 核心区别

| 特性 | computed | watch |
|------|---------|-------|
| 用途 | 派生新数据 | 响应变化后执行副作用 |
| 缓存 | 有（依赖不变时不重算） | 无 |
| 同步/异步 | 同步 | 同步或异步 |
| 场景 | 数据转换/计算 | 异步操作/外部调用 |

### computed 适用场景

- 数据转换（如分转元、格式化）
- 条件派生（根据多个状态计算布尔值）
- 列表过滤/排序

### watch 适用场景

- 异步操作（网络请求、防抖）
- 外部交互（DOM 操作、第三方 SDK）
- 交叉关注点（当 X 变化时执行 Y）

### 示例对比

\`\`\`javascript
// computed：适合派生
computed: {
  totalPrice() {
    return this.price * this.count
  }
}

// watch：适合副作用
watch: {
  searchKey(newVal) {
    this.fetchResults(newVal) // 异步请求
  }
}
\`\`\``,
    tags: ['MPX', '响应式', 'computed', 'watch', '对比'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  // ==================== 组件基础 (comp) ====================

  {
    id: 'mpx-comp-001',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 组件如何定义 props？有哪些类型定义方式？',
    answer: `## Props 定义

### 基本语法

\`\`\`javascript
props: {
  // 基础类型
  title: String,
  count: Number,
  isShow: Boolean,

  // 带默认值
  placeholder: {
    type: String,
    value: '请输入'
  },
  interval: {
    type: Number,
    value: 3000
  }
}
\`\`\`

### Object/Array 默认值必须使用函数

\`\`\`javascript
props: {
  list: {
    type: Array,
    value: () => []
  },
  config: {
    type: Object,
    value: () => ({})
  }
}
\`\`\`

### 多类型和必须传值

\`\`\`javascript
props: {
  // 多类型
  value: {
    type: [String, Number],
    value: ''
  },

  // 必须传值
  required: {
    type: String,
    required: true
  }
}
\`\`\`

### 父组件传值

\`\`\`html
<cabin-card
  cabinDetail="{{item}}"
  isShowTaxInGo="{{isShowTaxInGo}}"
  cabinIndex="{{idx}}"
/>
\`\`\``,
    tags: ['MPX', '组件基础', 'props', '父子通信'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-comp-002',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 组件如何定义 methods？有哪些写法？',
    answer: `## Methods 定义

### 基本语法

\`\`\`javascript
methods: {
  // 基础方法
  handleClick() {
    console.log('clicked')
  },

  // 带参数
  handleSelect(id) {
    this.selectedId = id
  },

  // 箭头函数
  handleReset: () => {
    this.inputValue = ''
  },

  // 调用其他方法
  handleSubmit() {
    if (this.validate()) {
      this.submitData()
    }
  },

  validate() {
    return this.inputValue.length > 0
  }
}
\`\`\`

### 事件处理方法

\`\`\`javascript
methods: {
  handleClick(e) {
    const { id, name } = e.currentTarget.dataset
    console.log(id, name)
  }
}
\`\`\`

### 父子组件方法调用

\`\`\`javascript
// 获取子组件实例
this.$refs.childComponent.methodName()

// 获取组件实例
this.$refs.myComponent

// 调用子组件方法
this.$refs.cabinCard.initData()
\`\`\``,
    tags: ['MPX', '组件基础', 'methods', '事件处理'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-comp-003',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 子组件如何向父组件通信？triggerEvent 的用法是什么？',
    answer: `## 子父通信

### 子组件触发事件

\`\`\`javascript
methods: {
  handleSelect(item) {
    this.triggerEvent('select', {
      item,
      index: this.cabinIndex
    })
  },

  handleChange() {
    this.triggerEvent('change', {
      value: this.currentValue
    })
  }
}
\`\`\`

### 父组件监听

\`\`\`html
<child-component
  bind:select="onSelect"
  bind:change="onChange"
/>
\`\`\`

### 父组件处理

\`\`\`javascript
methods: {
  onSelect(e) {
    const { item, index } = e.detail
    console.log('子组件选择:', item, index)
  }
}
\`\`\`

### triggerEvent 参数

- **第一个参数**：事件名（字符串）
- **第二个参数**：传递给父组件的数据（对象）

### $trigger 用法（某些组件）

\`\`\`javascript
methods: {
  handleInput(keyword) {
    this.$trigger('input', { value: keyword })
  }
}
\`\`\``,
    tags: ['MPX', '组件基础', '父子通信', 'triggerEvent'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-comp-004',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 如何使用 $refs 获取组件实例？有哪些注意事项？',
    answer: `## \$refs 用法

### 模板中设置 ref

\`\`\`html
<cabin-card ref="cabinCard" />
<order-bottom-bar ref="bottomBar" />
\`\`\`

### 调用组件方法

\`\`\`javascript
// 调用组件方法
this.$refs.cabinCard.initData()
this.$refs.bottomBar.enable()

// 获取组件数据
const cardData = this.$refs.cabinCard.cardData
\`\`\`

### 注意事项

1. **时机**：必须在组件 ready 后才能调用
2. **命名**：ref 名称在模板中必须唯一
3. **类型**：获取的是组件实例，可调用其 methods 和访问 data

### 动态组件 ref

\`\`\`javascript
// 动态组件
import radio from '../radio/index?resolve'

createComponent({
  child: radio,
  componentName: 'RadioGroup'
})
\`\`\``,
    tags: ['MPX', '组件基础', '$refs', '组件实例'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-comp-005',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 组件如何引入外部组件？usingComponents 的配置方法是什么？',
    answer: `## 引入外部组件

### json 配置

\`\`\`html
<script name="json">
  module.exports = {
    component: true,
    usingComponents: {
      // 第三方组件
      'es-icon': '@didi/es-mpx-ui/lib/icon',
      'es-dialog': '@didi/es-mpx-ui/lib/dialog/index',
      'es-button': '@didi/es-mpx-ui/lib/button/index',

      // 业务组件
      'cabin-card': '@/components/cabin-list/cabin-card/index',
      'flight-info': '@/components/flight-info/index',

      // 别名
      'skeleton': '@/components/list-skeleton/index'
    }
  }
</script>
\`\`\`

### 组件类型

| 类型 | 声明 | 用途 |
|-----|------|-----|
| 页面 | 无 component | 页面路由入口 |
| 组件 | component: true | 可复用的 UI 组件 |
| 动态组件 | child: component | 运行时决定渲染哪个组件 |

### 使用组件

\`\`\`html
<!-- 基础使用 -->
<es-icon name="arrow" />

<!-- 传 props -->
<cabin-card
  cabinDetail="{{item}}"
  isShowTaxInGo="{{isShowTaxInGo}}"
/>

<!-- 监听事件 -->
<order-bottom-bar
  bind:buttonTapped="handleOrder"
  bind:handleCancel="handleCancel"
/>
\`\`\``,
    tags: ['MPX', '组件基础', 'usingComponents', '组件引入'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-comp-006',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX Mixins 的合并规则是什么？组件选项和 mixin 选项冲突时谁优先？',
    answer: `## Mixins 合并规则

### 合并策略

| 选项 | 合并规则 |
|------|---------|
| data | 组件自身 data 优先，mixin 数据会被覆盖 |
| 生命周期 | 混合调用（先 mixin 后组件） |
| methods | 组件自身方法优先 |
| computed | 组件自身 computed 优先 |

### 示例

\`\`\`javascript
// Mixin
{
  data() { return { a: 1, b: 2 } },
  computed: { sum() { return this.a + this.b } },
  onLoad() { console.log('mixin onLoad') }
}

// Component
{
  data() { return { b: 3, c: 4 } },
  computed: { sum() { return this.a + this.b + this.c } },
  onLoad() { console.log('component onLoad') }
}

// 最终结果
{
  data() { return { a: 1, b: 3, c: 4 } },  // 组件 b 覆盖 mixin b
  computed: { sum() { return this.a + this.b + this.c } },  // 组件优先
  onLoad() {
    console.log('mixin onLoad')  // 先调用
    console.log('component onLoad')  // 后调用
  }
}
\`\`\``,
    tags: ['MPX', '组件基础', 'Mixins', '合并规则'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  // ==================== 生命周期 (lifecycle) ====================

  {
    id: 'mpx-lifecycle-001',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX 页面生命周期钩子有哪些？各自在什么时机触发？',
    answer: `## 页面生命周期

| 钩子 | 触发时机 | 常用场景 |
|-----|---------|---------|
| onLoad | 页面加载完成 | 获取参数、初始化数据 |
| onShow | 页面显示 | 状态恢复、数据刷新 |
| onReady | 初次渲染完成 | 获取节点信息、性能监控 |
| onHide | 页面隐藏 | 暂停动画、释放资源 |
| onUnload | 页面卸载 | 清理定时器、解绑事件 |
| onError | 页面错误 | 错误上报 |

### 完整示例

\`\`\`javascript
createPage({
  onLoad(options) {
    console.log('页面参数:', options)
    this.orderId = options.orderId
    this.initPage()
  },

  onShow() {
    getApp().globalData.onHide = false
    // 每次显示都刷新某些状态
  },

  onReady() {
    const startTime = getStorage(STORAGE_PERFORMANCE_TIME)
    this.reportPerformance(startTime)
  },

  onHide() {
    getApp().globalData.onHide = true
    // 暂停某些操作
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  onError(error) {
    console.error('页面错误:', error)
  }
})
\`\`\``,
    tags: ['MPX', '生命周期', '页面钩子', 'onLoad', 'onShow'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-lifecycle-002',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX 组件生命周期钩子有哪些？created 和 attached 的区别是什么？',
    answer: `## 组件生命周期

| 钩子 | 触发时机 | 常用场景 |
|-----|---------|---------|
| created | 实例创建 | 初始化 data（不能操作 DOM） |
| attached | 节点树 attach | 获取组件节点、初始化插件 |
| ready | 渲染完成 | DOM 操作 |
| detached | 节点树 detach | 清理资源 |
| moved | 组件移动 | （较少使用） |

### created vs attached

\`\`\`javascript
created() {
  // 组件实例创建，此时还不能操作 DOM
  this.keywords = this.defaultValue
  console.log('组件 created')
},

attached() {
  // 组件进入页面节点树，此时可以获取节点信息
  this.initPlugin()
  console.log('组件 attached')
},

ready() {
  // 组件渲染完成
  const query = this.createSelectorQuery()
  query.select('.container').boundingClientRect()
},

detached() {
  // 组件离开节点树，清理资源
  if (this.timer) {
    clearInterval(this.timer)
  }
}
\`\`\``,
    tags: ['MPX', '生命周期', '组件钩子', 'created', 'attached'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-lifecycle-003',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX 组件中如何监听所在页面的生命周期？pageLifetimes 的用法是什么？',
    answer: `## pageLifetimes

### 基本语法

\`\`\`javascript
// 在组件中监听所在页面的生命周期
pageLifetimes: {
  show() {
    // 页面显示时执行
    console.log('组件所在页面显示')
  },
  hide() {
    // 页面隐藏时执行
    console.log('组件所在页面隐藏')
  }
}
\`\`\`

### 使用场景

1. **数据懒加载**：页面显示时才加载数据
2. **状态同步**：页面显示时从全局状态同步数据
3. **资源管理**：页面隐藏时暂停动画或释放资源

### 示例

\`\`\`javascript
createComponent({
  data() {
    return {
      showDialog: false
    }
  },

  pageLifetimes: {
    show() {
      // 页面每次显示都重新获取最新状态
      this.syncData()
    },
    hide() {
      // 页面隐藏时暂停
      this.pauseAnimation()
    }
  },

  methods: {
    syncData() {
      const app = getApp()
      this.userInfo = app.globalData.userInfo
    }
  }
})
\`\`\``,
    tags: ['MPX', '生命周期', 'pageLifetimes', '组件通信'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-lifecycle-004',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX onLoad 和 onShow 的区别是什么？各自适合什么场景？',
    answer: `## onLoad vs onShow

### 核心区别

| 特性 | onLoad | onShow |
|------|--------|--------|
| 触发次数 | 仅首次加载时触发一次 | 每次页面显示都触发 |
| 参数 | 页面启动参数（从其他页面跳转） | 无 |
| 数据恢复 | 适合一次性初始化 | 适合状态同步/刷新 |

### onLoad 适用场景

- 获取页面启动参数（options）
- 一次性数据初始化
- 需要在页面整个生命周期只执行一次的操作

### onShow 适用场景

- 每次进入页面都刷新数据
- 状态恢复（如用户从其他页面返回）
- 检查全局状态变化

### 典型用法

\`\`\`javascript
createPage({
  onLoad(options) {
    // 只执行一次：获取参数、初始化静态数据
    this.orderId = options.orderId
    this.initStaticData()
  },

  onShow() {
    // 每次显示都执行：刷新动态数据、同步状态
    this.syncUserState()
    this.refreshList()
  }
})
\`\`\``,
    tags: ['MPX', '生命周期', 'onLoad', 'onShow', '页面钩子'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-lifecycle-005',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX 中如何清理定时器？onUnload 中需要做哪些清理工作？',
    answer: `## 资源清理

### 清理定时器

\`\`\`javascript
createPage({
  data() {
    return {
      timer: null,
      intervalId: null
    }
  },

  onLoad() {
    // 启动定时器
    this.timer = setTimeout(() => {
      this.fetchData()
    }, 1000)

    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)
  },

  onUnload() {
    // 清理定时器
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
})
\`\`\`

### onUnload 清理清单

1. **定时器**：setTimeout / setInterval
2. **事件监听**：removeEventListener
3. **动画**：cancelAnimationFrame
4. **网络请求**：abort（如果支持）

### 组件清理

\`\`\`javascript
createComponent({
  detached() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    // 清理其他资源
  }
})
\`\`\``,
    tags: ['MPX', '生命周期', 'onUnload', '资源清理', '定时器'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  // ==================== 插槽 (slot) ====================

  {
    id: 'mpx-slot-001',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '插槽',
    question: 'MPX 默认插槽的基本用法是什么？父组件如何向子组件传递内容？',
    answer: `## 默认插槽

### 子组件定义

\`\`\`html
<view class="container">
  <slot></slot>
</view>
\`\`\`

### 父组件传值

\`\`\`html
<custom-card>
  <view class="content">插槽内容</view>
</custom-card>
\`\`\`

### 渲染结果

\`\`\`html
<!-- 最终渲染为 -->
<view class="container">
  <view class="content">插槽内容</view>
</view>
\`\`\`

### 默认内容

\`\`\`html
<!-- 插槽可指定默认内容 -->
<view class="container">
  <slot>默认内容</slot>
</view>
\`\`\`

当父组件没有传入内容时，显示默认内容。`,
    tags: ['MPX', '插槽', '默认插槽', 'slot'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-slot-002',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '插槽',
    question: 'MPX 命名插槽如何定义和使用？slot name 的用法是什么？',
    answer: `## 命名插槽

### 子组件定义

\`\`\`html
<view class="header">
  <slot name="header">默认标题</slot>
</view>
<view class="content">
  <slot name="content">默认内容</slot>
</view>
<view class="footer">
  <slot name="footer"></slot>
</view>
\`\`\`

### 父组件使用

\`\`\`html
<order-bottom-bar>
  <view slot="header">自定义头部</view>
  <view slot="content">自定义内容</view>
  <view slot="footer" class="footer-content">自定义底部</view>
</order-bottom-bar>
\`\`\`

### 条件插槽

\`\`\`html
<!-- 子组件 -->
<slot wx:if="{{showTag}}" name="tag" />
<slot wx:else name="default" />

<!-- 父组件 -->
<custom-card>
  <view slot="tag" wx:if="{{hasTag}}">标签内容</view>
</custom-card>
\`\`\``,
    tags: ['MPX', '插槽', '命名插槽', 'slot name'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-slot-003',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '插槽',
    question: 'MPX 作用域插槽是什么？slot-scope 的用法是什么？',
    answer: `## 作用域插槽

### 子组件传递数据

\`\`\`html
<!-- 子组件 - 传递数据给父组件 -->
<view class="item" wx:for="{{list}}">
  <slot name="item" item="{{item}}" index="{{index}}">
    默认内容: {{item.name}}
  </slot>
</view>
\`\`\`

### 父组件接收数据

\`\`\`html
<custom-list>
  <view slot="item" slot-scope="scope">
    自定义内容: {{scope.item.name}}, 索引: {{scope.index}}
  </view>
</custom-list>
\`\`\`

### slot-scope 参数

- **scope**：包含子组件传递的所有数据
- 可以是任意命名（如 \`scope\`、\`props\`、\`data\` 等）

### 使用场景

- 列表组件需要父组件自定义每一项的渲染方式
- 子组件提供数据，父组件控制渲染逻辑
- 需要在父组件中使用子组件内部状态`,
    tags: ['MPX', '插槽', '作用域插槽', 'slot-scope'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-slot-004',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '插槽',
    question: 'MPX 动态插槽名如何使用？slot="{{dynamicName}}" 的用法是什么？',
    answer: `## 动态插槽名

### 子组件定义

\`\`\`html
<slot name="{{dynamicName}}" />
\`\`\`

### 父组件使用

\`\`\`html
<custom-component>
  <view slot="{{currentSlot}}">动态插槽内容</view>
</custom-component>
\`\`\`

### 使用场景

\`\`\`javascript
data() {
  return {
    currentSlot: 'header'
  }
}
\`\`\`

\`\`\`html
<!-- 根据 currentSlot 的值切换插槽 -->
<custom-card>
  <view slot="header" wx:if="{{currentSlot === 'header'}}">头部内容</view>
  <view slot="content" wx:if="{{currentSlot === 'content'}}">内容区域</view>
</custom-card>
\`\`\`

### 注意事项

- 动态插槽名需要在模板中明确条件判断
- 适用于需要动态切换显示内容的场景`,
    tags: ['MPX', '插槽', '动态插槽', 'slot name'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  // ==================== 模板语法补充 (tmpl) ====================

  {
    id: 'mpx-tmpl-009',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 事件处理中如何获取 data-* 属性？dataset 的用法是什么？',
    answer: `## data-* 属性传参

### 模板中设置 data-*

\`\`\`html
<view
  bindtap="handleClick"
  data-id="{{item.id}}"
  data-name="{{item.name}}"
  data-type="{{item.type}}"
>
  点击
</view>
\`\`\`

### JS 中获取

\`\`\`javascript
methods: {
  handleClick(e) {
    // 通过 currentTarget.dataset 获取
    const { id, name, type } = e.currentTarget.dataset
    console.log(id, name, type)
  }
}
\`\`\`

### 注意事项

- data-* 属性名会自动转成小写（data-idName → idName）
- 多个下划线会合并（data-user_name → userName）
- dataset 只能在 currentTarget 上获取，不能从 target 获取`,
    tags: ['MPX', '模板语法', '事件处理', 'data-*', 'dataset'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-tmpl-010',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 表单组件中 checkbox/radio/picker 如何使用？',
    answer: `## 表单组件高级用法

### checkbox-group

\`\`\`html
<checkbox-group bindchange="handleCheckChange">
  <label wx:for="{{options}}" wx:key="value">
    <checkbox value="{{item.value}}" checked="{{item.checked}}" />
    <text>{{ item.label }}</text>
  </label>
</checkbox-group>
\`\`\`

### radio-group

\`\`\`html
<radio-group bindchange="handleRadioChange">
  <radio wx:for="{{genders}}" wx:key="value" value="{{item.value}}" />
</radio-group>
\`\`\`

### picker 选择器

\`\`\`html
<!-- 普通选择器 -->
<picker mode="selector" range="{{array}}" bindchange="onChange">
  <view>{{selectedText}}</view>
</picker>

<!-- 多列选择器 -->
<picker mode="multiSelector" range="{{multiArray}}" bindchange="onMultiChange">
  <view>{{displayText}}</view>
</picker>

<!-- 时间选择器 -->
<picker mode="time" value="{{time}}" bindchange="onTimeChange">
  <view>{{time}}</view>
</picker>
\`\`\``,
    tags: ['MPX', '模板语法', '表单', 'checkbox', 'radio', 'picker'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-tmpl-011',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 模板中如何调用 WXS 模块？wxs 标签的用法是什么？',
    answer: `## WXS 模块调用

### 定义 WXS 文件

\`\`\`javascript
// src/pages/make-order/index.wxs
function formatPrice(price) {
  if (!price) return '0'
  return (price / 100).toFixed(2)
}

function formatDate(date, format) {
  if (!date) return ''
  var d = getDate(date)
  var year = d.getFullYear()
  var month = d.getMonth() + 1
  var day = d.getDate()
  if (format === 'MM-dd') {
    return month + '月' + day + '日'
  }
  return year + '-' + month + '-' + day
}

module.exports = {
  formatPrice: formatPrice,
  formatDate: formatDate
}
\`\`\`

### 模板中引用

\`\`\`html
<template minapp="mpx" xlang="wxml">
  <!-- 引用 WXS 模块 -->
  <wxs src="./index.wxs" module="tools" />

  <!-- 使用模块方法 -->
  <view class="price">
    <text>¥{{ tools.formatPrice(cabinInfo.sale_price) }}</text>
  </view>

  <view class="date">
    <text>{{ tools.formatDate(item.departure_ts * 1000, 'MM-dd') }}</text>
  </view>
</template>
\`\`\`

### WXS vs JS

| 对比项 | WXS | JS |
|-------|-----|-----|
| 执行环境 | 渲染层 | 逻辑层 |
| 语法 | 仅 ES5 | ES6+ |
| 调用方式 | 模板中调用 | methods 中调用 |`,
    tags: ['MPX', '模板语法', 'WXS', '过滤器'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-tmpl-012',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '模板语法',
    question: 'MPX 表单中 input 的 type 类型有哪些？各自用途是什么？',
    answer: `## input type 类型

### 常见 type 值

| type | 用途 | 键盘 |
|------|------|-----|
| text | 普通文本 | 文本 |
| number | 数字输入 | 数字 |
| idcard | 身份证 | 数字 |
| digit | 带小数点数字 | 数字键盘 |
| password | 密码 | 明文 |

### 代码示例

\`\`\`html
<!-- 普通文本 -->
<input type="text" value="{{name}}" placeholder="请输入姓名" />

<!-- 数字（手机号） -->
<input type="number" value="{{phone}}" placeholder="请输入手机号" maxlength="11" />

<!-- 带小数点（价格） -->
<input type="digit" value="{{price}}" placeholder="请输入价格" />

<!-- 密码 -->
<input type="password" value="{{password}}" placeholder="请输入密码" />

<!-- 多行文本 -->
<textarea value="{{remark}}" placeholder="请输入备注" maxlength="200" />
\`\`\``,
    tags: ['MPX', '模板语法', '表单', 'input', 'textarea'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  // ==================== 响应式补充 (reactive) ====================

  {
    id: 'mpx-reactive-008',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX watch 中如何监听嵌套属性？\`obj.nested.key\` 语法是什么？',
    answer: `## 监听嵌套属性

### 字符串路径语法

\`\`\`javascript
watch: {
  // 监听嵌套属性（推荐）
  'obj.nested.key'(newVal) {
    console.log('嵌套属性变化:', newVal)
  },

  // 监听对象下的某个属性
  'userInfo.name'(newVal) {
    console.log('用户名变化:', newVal)
  },

  // 监听数组项的属性
  'list[0].title'(newVal) {
    console.log('第一项标题变化:', newVal)
  }
}
\`\`\`

### 深度监听 vs 嵌套路径

\`\`\`javascript
// 深度监听（性能开销大）
watch: {
  obj: {
    deep: true,
    handler(newVal) { /* ... */ }
  }
}

// 嵌套路径（推荐，性能更好）
watch: {
  'obj.field'(newVal) { /* ... */ }
}
\`\`\`

### 注意事项

- 嵌套路径比 deep: true 性能更优
- 路径中支持数组索引，如 \`list[0].name\``,
    tags: ['MPX', '响应式', 'watch', '嵌套属性'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-reactive-009',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX watch 中 immediate 选项的作用是什么？何时使用？',
    answer: `## watch immediate 选项

### 基本语法

\`\`\`javascript
watch: {
  initialData: {
    immediate: true,
    handler(newVal) {
      console.log('初始化时立即执行:', newVal)
      this.processData(newVal)
    }
  }
}
\`\`\`

### 作用

- **默认行为**：watch 只在数据变化后才执行回调
- **immediate: true**：在组件创建时立即执行一次（类似 created 钩子）

### 使用场景

1. **数据初始化**：组件创建时需要立即处理初始数据
2. **从 Store 同步数据**：从全局状态初始化组件状态
3. **表单默认值**：根据初始值设置表单初始状态

### 示例

\`\`\`javascript
watch: {
  config: {
    immediate: true,
    handler(config) {
      // 组件创建时立即应用配置
      this.applyConfig(config)
      this.fetchInitialData()
    }
  }
}
\`\`\``,
    tags: ['MPX', '响应式', 'watch', 'immediate'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-reactive-010',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '响应式',
    question: 'MPX 中 computed 的缓存机制是什么？依赖不变时会发生什么？',
    answer: `## computed 缓存机制

### 缓存原理

\`\`\`javascript
computed: {
  // 只有当 this.price 或 this.quantity 变化时才会重新计算
  totalPrice() {
    console.log('计算 totalPrice') // 仅在依赖变化时执行
    return this.price * this.quantity
  }
}
\`\`\`

### 缓存行为

- 当 computed 的所有依赖项未变化时，**直接返回缓存值**，不重新计算
- 当任意依赖项变化时，**立即失效缓存**，下次访问触发重新计算

### 使用注意

\`\`\`javascript
// 好：computed 用于派生值
computed: {
  filteredList() {
    return this.list.filter(x => x.active) // 有缓存
  }
}

// 差：computed 中执行副作用（不要这样做）
computed: {
  // 每次渲染都会执行，违反 computed 设计原则
  doSomething() {
    this.fetchData() // 不要在 computed 中执行副作用
  }
}
\`\`\`

### vs methods

- **computed**：有缓存，适合派生状态
- **methods**：无缓存，每次调用都执行`,
    tags: ['MPX', '响应式', 'computed', '缓存'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  // ==================== 组件基础补充 (comp) ====================

  {
    id: 'mpx-comp-007',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX Store 状态管理如何用 mapMutations 和 mapActions？',
    answer: `## Store Mutations 与 Actions

### mapMutations

\`\`\`javascript
methods: {
  ...store.mapMutations({
    setUserInfo: 'user.setUserInfo',
    setFlightDetail: 'flightList.setDetail',
    clearOrder: 'order.clearOrder'
  }),

  // 使用
  updateUser(data) {
    this.setUserInfo(data) // 直接调用
  }
}
\`\`\`

### mapActions（异步操作）

\`\`\`javascript
methods: {
  ...store.mapActions({
    fetchUserInfo: 'user/fetchInfo',
    submitOrder: 'order/submit'
  }),

  // 使用（返回 Promise）
  async loadUser() {
    await this.fetchUserInfo(userId)
  }
}
\`\`\`

### 直接 commit/dispatch

\`\`\`javascript
import store from '@/store'

methods: {
  updateData() {
    // 同步
    store.commit('order.setDetail', this.newData)
  },

  async fetchOrder() {
    // 异步
    const detail = await store.dispatch('order/fetchDetail', orderId)
    this.orderDetail = detail
  }
}
\`\`\``,
    tags: ['MPX', '组件基础', 'Store', 'mapMutations', 'mapActions'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-comp-008',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 组件中 externalClasses 的作用是什么？如何使用外部样式类？',
    answer: `## 外部样式类

### 定义 externalClasses

\`\`\`javascript
// 子组件
createComponent({
  externalClasses: ['custom-class', 'label-class', 'icon-class']
})
\`\`\`

### 子组件模板使用

\`\`\`html
<view class="custom-class">使用外部样式</view>
<text class="label-class">标签样式</text>
<view class="icon-class">图标样式</view>
\`\`\`

### 父组件传入

\`\`\`html
<my-component
  custom-class="my-custom-style"
  label-class="my-label-style"
  icon-class="my-icon-style"
/>
\`\`\`

### 使用场景

- 需要父组件自定义组件内部样式时
- 组件库中组件样式定制化
- 与第三方样式系统配合使用`,
    tags: ['MPX', '组件基础', 'externalClasses', '样式'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  {
    id: 'mpx-comp-009',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX createApp 和 createComponent 的区别是什么？各自用途？',
    answer: `## createApp vs createComponent

### createApp（应用入口）

\`\`\`javascript
import { createApp } from '@didi/es-mpx-creator'

createApp({
  plugins: [mixins, usex, ...getPlugins()],
  globalData: {
    harmonyStatusBarHeight: 30,
    isOnline: true
  },
  onLaunch(options) {
    console.log('App launched', options)
  },
  onError(error) {
    console.error('App error:', error)
  }
})
\`\`\`

### createComponent（组件）

\`\`\`javascript
import { createComponent } from '@didi/es-mpx-creator'

createComponent({
  // 组件选项
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  attached() {}
})
\`\`\`

### createPage（页面）

\`\`\`javascript
createPage({
  onLoad(options) {},
  onShow() {},
  // 页面生命周期
})
\`\`\`

### 区别

| 函数 | 用途 | 生命周期 |
|------|------|---------|
| createApp | 应用入口 | onLaunch/onError |
| createPage | 页面 | onLoad/onShow 等 |
| createComponent | 组件 | created/attached 等 |`,
    tags: ['MPX', '组件基础', 'createApp', 'createComponent', 'createPage'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-comp-010',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '组件基础',
    question: 'MPX 组件中如何实现组件间方法调用？$refs 的完整用法？',
    answer: `## 组件间方法调用

### 获取组件实例

\`\`\`html
<!-- 模板中设置 ref -->
<cabin-card ref="cabinCard" />
<order-bottom-bar ref="bottomBar" />
\`\`\`

### 调用组件方法

\`\`\`javascript
methods: {
  // 调用子组件方法
  handleRefresh() {
    this.$refs.cabinCard.initData()
    this.$refs.bottomBar.enable()
  },

  // 获取子组件数据
  handleGetData() {
    const cardData = this.$refs.cabinCard.cardData
    console.log(cardData)
  },

  // 调用页面方法
  handlePageMethod() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    currentPage.onRefresh()
  }
}
\`\`\`

### 注意事项

1. **时机**：必须在组件 ready 后才能调用
2. **命名**：ref 名称在模板中必须唯一
3. **类型**：获取的是组件实例，可调用其 methods 和访问 data`,
    tags: ['MPX', '组件基础', '$refs', '组件通信'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  // ==================== 生命周期补充 (lifecycle) ====================

  {
    id: 'mpx-lifecycle-006',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX App 级别的生命周期钩子有哪些？onLaunch/onShow/onHide/onError？',
    answer: `## App 生命周期

### App 钩子

\`\`\`javascript
import { createApp } from '@didi/es-mpx-creator'

createApp({
  globalData: {
    harmonyStatusBarHeight: 30,
    isOnline: true,
    userToken: ''
  },

  onLaunch(options) {
    // 应用首次启动
    console.log('App launched', options)
    this.checkLoginStatus()
  },

  onShow(options) {
    // 应用从后台切换到前台
    console.log('App showed', options)
  },

  onHide() {
    // 应用进入后台
    console.log('App hide')
  },

  onError(error) {
    // 应用报错
    console.error('App error:', error)
    this.reportError(error)
  }
})
\`\`\`

### 全局数据访问

\`\`\`javascript
// 在页面/组件中访问 globalData
const app = getApp()
console.log(app.globalData.userToken)

// 修改 globalData
app.globalData.userToken = 'new_token'
\`\`\``,
    tags: ['MPX', '生命周期', 'App', 'onLaunch', 'globalData'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-lifecycle-007',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '生命周期',
    question: 'MPX 性能优化中与生命周期相关的最佳实践有哪些？',
    answer: `## 生命周期性能优化

### 数据懒加载

\`\`\`javascript
createComponent({
  pageLifetimes: {
    show() {
      // 页面显示时才加载数据
      if (!this.dataLoaded) {
        this.loadData()
      }
    },
    hide() {
      // 页面隐藏时清理
      this.cleanup()
    }
  }
})
\`\`\`

### 定时器清理

\`\`\`javascript
createPage({
  onLoad() {
    // 启动定时器
    this.timer = setInterval(() => {
      this.tick()
    }, 1000)
  },

  onUnload() {
    // 页面卸载时必须清理
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
})
\`\`\`

### onShow vs onLoad 区分

\`\`\`javascript
createPage({
  onLoad() {
    // 仅执行一次
    this.initPageConfig()
  },

  onShow() {
    // 每次显示都执行
    this.syncGlobalState()
    this.refreshDataIfNeeded()
  }
})
\`\`\``,
    tags: ['MPX', '生命周期', '性能优化', '最佳实践'],
    status: 'unvisited',
    difficulty: 'medium'
  },

  // ==================== 插槽补充 (slot) ====================

  {
    id: 'mpx-slot-005',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '插槽',
    question: 'MPX 中 slot 的默认内容如何设置？子组件如何提供 fallback 内容？',
    answer: `## 插槽默认内容

### 子组件定义默认内容

\`\`\`html
<view class="container">
  <slot>默认内容：当父组件没有传入时显示</slot>
</view>
\`\`\`

### 条件默认内容

\`\`\`html
<view class="dialog">
  <slot name="title">
    <text class="default-title">默认标题</text>
  </slot>
  <view class="content">
    <slot name="content">
      <text>默认内容区域</text>
    </slot>
  </view>
</view>
\`\`\`

### 动态默认内容

\`\`\`html
<!-- 子组件根据 showTag 决定默认内容 -->
<view class="header">
  <slot wx:if="{{showTag}}" name="tag">
    <text class="tag">默认标签</text>
  </slot>
  <slot wx:else name="default">
    <text class="default">默认文本</text>
  </slot>
</view>
\`\`\`

### 父组件覆盖

\`\`\`html
<!-- 父组件传入内容时，默认内容被覆盖 -->
<custom-dialog>
  <text slot="title">自定义标题</text>
  <text slot="content">自定义内容</text>
</custom-dialog>
\`\`\``,
    tags: ['MPX', '插槽', '默认内容', 'fallback'],
    status: 'unvisited',
    difficulty: 'easy'
  },

  {
    id: 'mpx-slot-006',
    module: 'mpx',
    chapterId: 'mpx-basic',
    category: '插槽',
    question: 'MPX 中如何使用动态 slot？slot="{{variable}}" 的实际应用场景？',
    answer: `## 动态插槽名应用

### 基础用法

\`\`\`javascript
data() {
  return {
    currentSlot: 'header'
  }
}
\`\`\`

\`\`\`html
<!-- 子组件 -->
<view class="dialog">
  <slot name="{{currentSlot}}">动态插槽内容</slot>
</view>
\`\`\`

### Tab 切换场景

\`\`\`javascript
data() {
  return {
    activeTab: 'home'
  }
}
\`\`\`

\`\`\`html
<!-- 父组件 -->
<tab-container>
  <view slot="home">首页内容</view>
  <view slot="profile">个人中心</view>
  <view slot="settings">设置</view>
</tab-container>
\`\`\`

### 条件插槽

\`\`\`html
<!-- 父组件根据状态动态决定插槽 -->
<list-component>
  <view slot="{{isEmpty ? 'empty' : 'item'}}">
    {{ isEmpty ? '暂无数据' : '列表项内容' }}
  </view>
</list-component>
\`\`\`

### 实际应用场景

1. **多形态组件**：同一组件根据状态切换不同内容区域
2. **动态表单**：不同表单类型使用不同插槽
3. **步骤组件**：不同步骤显示不同内容`,
    tags: ['MPX', '插槽', '动态插槽', 'slot name'],
    status: 'unvisited',
    difficulty: 'medium'
  }
];

// ============================================================
// mpx-basic 章节配置
// ============================================================

const mpxBasicChapters: Chapter[] = [
  {
    module: "mpx" as const,
    id: 'mpx-basic',
    title: 'MPX 基础语法',
    description: 'MPX 框架核心语法闪卡，涵盖模板、响应式、组件、生命周期、插槽',
    cardCount: mpxBasicCards.length
  }
];

// ============================================================
// 合并导出（现有解析卡片 + 新增结构化卡片）
// ============================================================

export const mpxCards: FlashCard[] = [
  ...parseTechDocCards(mpxGuideRaw, 'mpx-guide'),
  ...parseTechDocCards(mpxArchitectureRaw, 'mpx-architecture'),
  ...parseTechDocCards(devGuideRaw, 'dev-guide'),
  ...mpxBasicCards
];

export const mpxChapters: Chapter[] = [
  {
    module: "mpx" as const,
    id: 'mpx-guide',
    title: getChapterTitle(mpxGuideRaw) || 'MPX 入门语法',
    description: 'MPX 入门语法大全，包含模板、样式、脚本、组件等核心语法',
    cardCount: mpxCards.filter(c => c.chapterId === 'mpx-guide').length
  },
  {
    module: "mpx" as const,
    id: 'mpx-architecture',
    title: getChapterTitle(mpxArchitectureRaw) || 'MPX 系统架构',
    description: 'MPX 系统架构拆解，宏观层面设计解析',
    cardCount: mpxCards.filter(c => c.chapterId === 'mpx-architecture').length
  },
  {
    module: "mpx" as const,
    id: 'dev-guide',
    title: getChapterTitle(devGuideRaw) || 'MPX 开发指南',
    description: 'fe-esflight 开发流程指南，适用于新入职前端实习生',
    cardCount: mpxCards.filter(c => c.chapterId === 'dev-guide').length
  },
  ...mpxBasicChapters
];