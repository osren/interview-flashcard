# MPX 入门语法大全

> 本文档基于滴滴出行小程序框架 MPX（基于 Vue 2.7）的实际项目代码编写，包含完整的语法说明、用法和实例 Demo。

---

## 目录

1. [MPX 概述](#1-mpx-概述)
2. [文件结构](#2-文件结构)
3. [模板语法 Template](#3-模板语法-template)
4. [样式语法 Style](#4-样式语法-style)
5. [脚本语法 Script](#5-脚本语法-script)
6. [组件系统](#6-组件系统)
7. [计算属性 Computed](#7-计算属性-computed)
8. [监听器 Watch](#8-监听器-watch)
9. [生命周期](#9-生命周期)
10. [状态管理 Store](#10-状态管理-store)
11. [Mixins 混入](#11-mixins-混入)
12. [组件通信](#12-组件通信)
13. [插槽 Slot](#13-插槽-slot)
14. [WXS 过滤器](#14-wxs-过滤器)
15. [进阶用法](#15-进阶用法)

---

## 1. MPX 概述

MPX 是滴滴出行开源的小程序增强框架，基于 Vue 2.7 构建，支持：
- **多端编译**：微信小程序、支付宝小程序、滴滴小程序、H5 Web
- **类 Vue 语法**：支持 Vue 的指令、计算属性、监听器等
- **增强能力**：跨平台适配、样式隔离、原生组件支持

---

## 2. 文件结构

### 2.1 MPX 文件结构

```html
<!-- 1. json 配置区域 -->
<script name="json">
  module.exports = {
    component: true,
    usingComponents: {
      'es-icon': '@didi/es-mpx-ui/lib/icon'
    }
  }
</script>

<!-- 2. 模板区域 -->
<template>
  <!-- 页面/组件结构 -->
</template>

<!-- 3. 样式区域 -->
<style>
  /* 样式代码 */
</style>

<!-- 4. 脚本区域 -->
<script>
  /* JavaScript 代码 */
</script>
```

### 2.2 模板声明

```html
<!-- 必须指定 minapp="mpx" 和 xlang="wxml" -->
<template minapp="mpx" xlang="wxml">
  ...
</template>
```

### 2.3 页面 vs 组件

```html
<!-- 页面 -->
<template minapp="mpx" xlang="wxml">
  <!-- 页面内容 -->
</template>

<!-- 组件需要 component: true -->
<script name="json">
  module.exports = {
    component: true  // 声明为组件
  }
</script>
```

---

## 3. 模板语法 Template

### 3.1 文本插值

```html
<!-- 基本插值 -->
<text>{{ message }}</text>

<!-- 表达式运算 -->
<text>{{ count + 1 }}</text>

<!-- 三元运算符 -->
<text>{{ isActive ? '激活' : '未激活' }}</text>

<!-- 调用方法 -->
<text>{{ formatPrice(price) }}</text>

<!-- 调用 WXS 模块方法 -->
<text>{{ tools.formatDate(time) }}</text>
```

### 3.2 条件渲染

```html
<!-- wx:if 单条件 -->
<view wx:if="{{show}}">显示内容</view>

<!-- wx:if / wx:elif / wx:else 链 -->
<view wx:if="{{type === 'A'}}">类型 A</view>
<view wx:elif="{{type === 'B'}}">类型 B</view>
<view wx:else>默认类型</view>

<!-- wx:show 条件显示（不销毁DOM） -->
<view wx:show="{{visible}}">始终存在于 DOM</view>

<!-- 结合 block 使用 -->
<block wx:if="{{hasHeader}}">
  <view class="header">头部</view>
  <view class="content">内容</view>
</block>
```

### 3.3 列表渲染

```html
<!-- 基础遍历 -->
<view wx:for="{{list}}" wx:key="id">
  <text>{{ item.name }}</text>
</view>

<!-- 带索引 -->
<view wx:for="{{list}}" wx:for-index="idx" wx:for-item="element" wx:key="id">
  <text>{{ idx }}: {{ element.name }}</text>
</view>

<!-- 嵌套遍历 -->
<view wx:for="{{dataList}}" wx:key="index">
  <view wx:for="{{item.children}}" wx:key="childId">
    {{ item.title }} - {{ childItem.name }}
  </view>
</view>

<!-- 遍历对象（不推荐小程序中使用） -->
<view wx:for="{{obj}}" wx:for-item="value" wx:key="key">
  {{ key }}: {{ value }}
</view>
```

### 3.4 事件绑定

```html
<!-- 点击事件 -->
<view bindtap="handleClick">点击</view>

<!-- 阻止冒泡 -->
<view catchtap="handleClick">阻止冒泡</view>

<!-- 捕获阶段 -->
<view capture-catch:tap="handleCapture">捕获阶段阻止</view>

<!-- 事件传参 -->
<view bindtap="handleClick({{item}})">通过模板传参</view>

<!-- 事件对象传递 -->
<view bindtap="handleClick" data-id="{{item.id}}" data-name="{{item.name}}">
  通过 data-* 属性传参
</view>
```

```javascript
// 事件处理方法
methods: {
  handleClick(e) {
    // 获取 data-* 属性
    const { id, name } = e.currentTarget.dataset
    console.log(id, name)
  },

  // 使用箭头函数
  handleClick: (item) => {
    console.log(item)
  }
}
```

### 3.5 样式绑定

```html
<!-- 对象语法 -->
<view wx:style="{{ { color: textColor, fontSize: fontSize + 'px' } }}">
  动态样式
</view>

<!-- 字符串拼接 -->
<view wx:style="color: {{color}}; padding: {{padding}}px;">
  内联样式
</view>

<!-- 条件样式 -->
<view wx:style="{{ isActive ? 'color: red' : 'color: blue' }}">
  条件样式
</view>
```

### 3.6 类名绑定

```html
<!-- 对象语法 -->
<view wx:class="{{ { 'active': isActive, 'disabled': isDisabled } }}">
  动态类名
</view>

<!-- 字符串拼接 -->
<view wx:class="base-class {{ isActive ? 'active' : '' }}">
  混合类名
</view>

<!-- 三元运算符 -->
<view wx:class="{{ isFirst ? 'first-item' : 'item' }}">
  类名切换
</view>

<!-- 数组语法 -->
<view wx:class="{{ [baseClass, isActive ? 'active' : ''] }}">
  数组类名
</view>
```

### 3.7 双向绑定

```html
<!-- input 双向绑定 -->
<input
  type="text"
  value="{{inputValue}}"
  bindinput="handleInput"
/>

<!-- textarea 双向绑定 -->
<textarea
  value="{{content}}"
  bindinput="handleInput"
  maxlength="200"
/>

<!-- checkbox 双向绑定 -->
<checkbox-group bindchange="handleChange">
  <checkbox value="{{item.value}}" checked="{{item.checked}}" />
</checkbox-group>
```

```javascript
methods: {
  handleInput(e) {
    this.inputValue = e.detail.value
  }
}
```

### 3.8 表单绑定

```html
<!-- 表单提交 -->
<form bindsubmit="handleSubmit" bindreset="handleReset">
  <input name="username" value="{{username}}" />
  <input name="password" type="password" value="{{password}}" />
  <button form-type="submit">提交</button>
  <button form-type="reset">重置</button>
</form>
```

```javascript
handleSubmit(e) {
  const { username, password } = e.detail.value
  console.log(username, password)
}
```

---

## 4. 样式语法 Style

### 4.1 基本样式

```html
<style>
  .container {
    padding: 20px;
    background-color: #ffffff;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
</style>
```

### 4.2 Scoped 样式隔离

```html
<style scoped>
  /* 仅对当前组件生效，不会影响其他组件 */
  .local-class {
    color: red;
  }
</style>
```

### 4.3 支持预处理器

```html
<!-- 使用 Stylus -->
<style lang="stylus" scoped>
  .card
    margin 10px
    padding 20px
    background #fff
    border-radius 8px

    .title
      font-size 16px
      color $theme-color  // 使用变量
</style>

<!-- 使用 Less -->
<style lang="less" scoped>
  .container {
    .header {
      color: @primary-color;
    }
  }
</style>

<!-- 使用 Scss -->
<style lang="scss" scoped>
  .container {
    .header {
      color: $theme-color;
    }
  }
</style>
```

### 4.4 全局样式导入

```javascript
// 在 app.mpx 中引入全局样式
import '@/assets/styles/global.styl'

// 在组件中导入
<style>
  @import '@/assets/styles/variables.styl';

  .title {
    color: $primary-color;
  }
</style>
```

---

## 5. 脚本语法 Script

### 5.1 组件创建

```javascript
import { createComponent } from '@didi/es-mpx-creator'

createComponent({
  // 组件选项
})
```

### 5.2 App 创建

```javascript
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
```

### 5.3 data 数据定义

```javascript
data() {
  return {
    // 字符串
    message: 'Hello MPX',

    // 数字
    count: 0,

    // 布尔值
    isLoading: false,

    // 数组
    list: [],

    // 对象
    userInfo: {},

    // 多层级对象
    flightDetail: {
      departure: { time: '', airport: '' },
      arrival: { time: '', airport: '' }
    }
  }
}

// 简写形式
data: {
  return {
    title: '默认标题'
  }
}
```

### 5.4 props 属性定义

```javascript
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
  },

  // Object/Array 默认值必须使用函数
  list: {
    type: Array,
    value: () => []
  },
  config: {
    type: Object,
    value: () => ({})
  },

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
```

### 5.5 methods 方法定义

```javascript
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
```

### 5.6 组件间方法调用

```javascript
// 获取子组件实例
this.$refs.childComponent.methodName()

// 获取组件实例
this.$refs.myComponent  // 在模板中设置 ref="myComponent"

// 调用子组件方法
this.$refs.cabinCard.initData()
```

---

## 6. 组件系统

### 6.1 引入组件（json 配置）

```html
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
      'order-bottom-bar': '@/components/order-bottom-bar/index',

      // 别名
      'skeleton': '@/components/list-skeleton/index'
    }
  }
</script>
```

### 6.2 使用组件

```html
<!-- 基础使用 -->
<es-icon name="arrow" />

<!-- 传 props -->
<cabin-card
  cabinDetail="{{item}}"
  isShowTaxInGo="{{isShowTaxInGo}}"
  cabinIndex="{{idx}}"
/>

<!-- 监听事件 -->
<order-bottom-bar
  bind:buttonTapped="handleOrder"
  bind:handleCancel="handleCancel"
/>

<!-- 传 slot -->
<custom-card>
  <view slot="header">标题</view>
  <view slot="content">内容</view>
</custom-card>
```

### 6.3 动态组件

```javascript
import radio from '../radio/index?resolve'

createComponent({
  child: radio,
  componentName: 'RadioGroup'
})
```

### 6.4 组件类型

| 类型 | 声明 | 用途 |
|-----|------|-----|
| 页面 | 无 component | 页面路由入口 |
| 组件 | component: true | 可复用的 UI 组件 |
| 动态组件 | child: component | 运行时决定渲染哪个组件 |

---

## 7. 计算属性 Computed

### 7.1 基础用法

```javascript
computed: {
  // 基本计算
  doubleCount() {
    return this.count * 2
  },

  // 依赖多个值
  totalPrice() {
    return this.price * this.quantity
  },

  // 复杂计算
  flightList() {
    return this.rawList.map(item => ({
      ...item,
      displayTime: this.formatTime(item.time)
    }))
  },

  // 返回布尔值
  isEmpty() {
    return this.list.length === 0
  }
}
```

### 7.2 结合 Store

```javascript
computed: {
  ...store.mapState({
    // 直接映射
    userInfo: 'user.userInfo',
    flightConfig: 'flightList.flightConfig',

    // 重命名
    isIntl: (state) => state.travel.isIntlCity
  }),

  ...store.mapGetters({
    // 映射 getters
    currentId: 'travel.currentId',
    onlyBookingForSelf: 'rule.onlyBookingForSelf'
  })
}
```

### 7.3 getter/setter

```javascript
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
  },

  cabinType: {
    get() {
      return this.cabin_types_tab?.find(x => x.selected)?.cabin_type || ''
    },
    set(val) {
      this.cabin_type = val
    }
  }
}
```

### 7.4 使用场景

```javascript
computed: {
  // 过滤列表
  activeList() {
    return this.list.filter(item => item.status === 'active')
  },

  // 格式化数据
  formattedPrice() {
    return `¥${(this.price / 100).toFixed(2)}`
  },

  // 条件判断
  canSubmit() {
    return this.username && this.password && !this.loading
  },

  // 数组搜索
  selectedItem() {
    return this.list.find(item => item.id === this.selectedId)
  }
}
```

---

## 8. 监听器 Watch

### 8.1 基础用法

```javascript
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
```

### 8.2 深度监听

```javascript
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
```

### 8.3 immediate 选项

```javascript
watch: {
  // 立即执行
  initialData: {
    immediate: true,
    handler(newVal) {
      console.log('初始化时立即执行:', newVal)
      this.processData(newVal)
    }
  }
}
```

### 8.4 监听嵌套属性

```javascript
watch: {
  // 监听嵌套属性
  'obj.nested.key'(newVal) {
    console.log('嵌套属性变化:', newVal)
  }
}
```

### 8.5 同步监听

```javascript
watch: {
  // 同步监听（不建议使用 async）
  data(newVal) {
    this.localData = newVal
  }
}
```

### 8.6 使用示例

```javascript
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
  },

  // 联动更新
  selectedId: {
    handler(id) {
      const item = this.list.find(x => x.id === id)
      if (item) {
        this.selectedDetail = item
      }
    }
  },

  // 条件触发
  isVisible: {
    handler(visible) {
      if (visible) {
        this.loadData()
      }
    }
  }
}
```

---

## 9. 生命周期

### 9.1 页面生命周期

| 钩子 | 说明 | 常用场景 |
|-----|------|---------|
| onLoad | 页面加载 | 获取参数、初始化数据 |
| onShow | 页面显示 | 状态恢复、数据刷新 |
| onReady | 初次渲染完成 | 获取节点信息、性能监控 |
| onHide | 页面隐藏 | 暂停动画、释放资源 |
| onUnload | 页面卸载 | 清理定时器、解绑事件 |
| onError | 页面错误 | 错误上报 |

```javascript
// 页面示例
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
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  onError(error) {
    console.error('页面错误:', error)
    // 上报错误
  }
})
```

### 9.2 组件生命周期

| 钩子 | 说明 | 常用场景 |
|-----|------|---------|
| created | 实例创建 | 初始化 data |
| attached | 节点树 attach | 获取组件节点、初始化插件 |
| ready | 渲染完成 | DOM 操作 |
| detached | 节点树 detach | 清理资源 |
| moved | 组件移动 | （较少使用） |

```javascript
createComponent({
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
})
```

### 9.3 组件所在页面生命周期

```javascript
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
```

---

## 10. 状态管理 Store

### 10.1 基本用法

```javascript
import store from '@/store'

// mapState - 映射 state 到 computed
computed: {
  ...store.mapState({
    userInfo: 'user.userInfo',
    flightConfig: 'flightList.flightConfig',
    isIntlCity: 'travel.isIntlCity'
  })
}

// mapGetters - 映射 getters
computed: {
  ...store.mapGetters({
    currentId: 'travel.currentId'
  })
}
```

### 10.2 mapMutations

```javascript
methods: {
  ...store.mapMutations({
    setUserInfo: 'user.setUserInfo',
    setFlightDetail: 'flightList.setFlightDetail',
    clearOrder: 'order.clearOrder'
  }),

  // 使用
  updateUser(data) {
    this.setUserInfo(data)
  }
}
```

### 10.3 dispatch action

```javascript
// 直接 dispatch
store.dispatch('beforeOrderCreate.setMatchGuaranteeFromPriceData', item)

// 在 methods 中调用
methods: {
  async fetchOrderDetail(orderId) {
    const detail = await store.dispatch('order/fetchDetail', orderId)
    this.orderDetail = detail
  }
}
```

### 10.4 Store 模块划分

```javascript
// store/modules/ 下有多个模块
// user.js, travel.js, order.js, makeOrder.js 等

// 使用时通过路径引用
store.mapState({
  orderDetail: 'order.detail',
  orderStatus: 'order.status'
})
```

### 10.5 在组件中直接使用 store

```javascript
import store from '@/store'

createComponent({
  computed: {
    ...store.mapState({
      systemInfo: 'system.systemInfo'
    })
  },

  methods: {
    updateData() {
      store.commit('order.setDetail', this.newData)
    }
  }
})
```

---

## 11. Mixins 混入

### 11.1 全局 Mixin

```javascript
// src/mixins/index.js
export default (app) => {
  // 全局生效的 mixin
  app.injectMixins({
    computed: {
      ...store.mapState({
        sourceId: 'common.sourceId'
      })
    }
  })

  // 仅对 page 生效
  app.injectMixins(
    {
      onLoad() {
        console.log('页面加载')
      }
    },
    {
      types: 'page'  // 'page' | 'component'
    }
  )
}

// app.mpx 中引入
import mixins from '@/mixins/index'

createApp({
  plugins: [mixins, usex, ...getPlugins()]
})
```

### 11.2 局部 Mixin

```javascript
// myMixin.js
export default {
  data() {
    return {
      mixinData: '来自 mixin'
    }
  },

  computed: {
    mixinComputed() {
      return 'computed in mixin'
    }
  },

  methods: {
    mixinMethod() {
      console.log('mixin method')
    }
  }
}

// 组件中使用
import myMixin from './myMixin'

createComponent({
  mixins: [myMixin],

  // 组件自身选项会覆盖 mixin 的
  data() {
    return {
      // mixinData 会被覆盖
      mixinData: '组件自身数据'
    }
  }
})
```

### 11.3 混入规则

```javascript
// 合并策略
// 1. data 合并：组件自身 data 优先
// 2. 生命周期：混合调用（先 mixin 后组件）
// 3. methods：组件自身方法优先
// 4. computed：组件自身 computed 优先

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
```

### 11.4 常用 Mixin 示例

```javascript
// popupMixin.js - 弹窗控制
export default {
  data() {
    return {
      showDialog: false,
      dialogContent: ''
    }
  },

  methods: {
    showPopup(content) {
      this.dialogContent = content
      this.showDialog = true
    },

    closePopup() {
      this.showDialog = false
    }
  }
}

// requestMixin.js - 网络请求
export default {
  methods: {
    async request(url, data) {
      try {
        const res = await mpx.$http.post(url, { data })
        return res
      } catch (error) {
        console.error('请求失败:', error)
        throw error
      }
    }
  }
}

// paymentCallbackMixin.js - 支付回调
export default {
  methods: {
    handlePaySuccess() {
      console.log('支付成功')
      this.toResultPage()
    },

    handlePayFail() {
      console.log('支付失败')
      this.showRetainDialog()
    },

    handlePaymentClose() {
      console.log('支付取消')
      this.showRetainDialog()
    }
  }
}
```

---

## 12. 组件通信

### 12.1 父子通信 - Props 向下传递

```html
<!-- 父组件 -->
<cabin-card
  cabinDetail="{{item}}"
  isShowTaxInGo="{{isShowTaxInGo}}"
  cabinIndex="{{idx}}"
  isSelected="{{selectedId === item.id}}"
  bind:changeBaggage="onChangeBaggage"
  bind:handleOrder="onHandleOrder"
/>
```

```javascript
// 子组件定义 props
props: {
  cabinDetail: {
    type: Object,
    required: true
  },
  isShowTaxInGo: Boolean,
  cabinIndex: Number,
  isSelected: {
    type: Boolean,
    default: false
  }
}
```

### 12.2 子父通信 - 事件向上传递

```javascript
// 子组件中触发事件
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
```

```html
<!-- 父组件中监听 -->
<child-component
  bind:select="onSelect"
  bind:change="onChange"
/>
```

```javascript
// 父组件中处理
methods: {
  onSelect(e) {
    const { item, index } = e.detail
    console.log('子组件选择:', item, index)
  }
}
```

### 12.3 使用 $trigger

```javascript
// 某些组件可能使用 $trigger
methods: {
  handleInput(keyword) {
    this.$trigger('input', { value: keyword })
  },

  handleClose() {
    this.$trigger('close')
  }
}
```

### 12.4 获取组件实例

```html
<!-- 模板中设置 ref -->
<cabin-card ref="cabinCard" />
<order-bottom-bar ref="bottomBar" />
```

```javascript
// 调用组件方法
this.$refs.cabinCard.initData()
this.$refs.bottomBar.enable()

// 获取组件数据
const cardData = this.$refs.cabinCard.cardData
```

### 12.5 跨层级通信

```javascript
// 通过 provide/inject（如果框架支持）
// 或通过事件冒泡/广播模式

// 常见做法：父组件作为中间层
// Parent -> Child1 (triggerEvent) -> Parent (handler) -> Child2 (props)
```

---

## 13. 插槽 Slot

### 13.1 默认插槽

```html
<!-- 子组件 -->
<view class="container">
  <slot></slot>
</view>

<!-- 父组件 -->
<custom-card>
  <view class="content">插槽内容</view>
</custom-card>
```

### 13.2 命名插槽

```html
<!-- 子组件 -->
<view class="header">
  <slot name="header">默认标题</slot>
</view>
<view class="content">
  <slot name="content">默认内容</slot>
</view>
<view class="footer">
  <slot name="footer"></slot>
</view>

<!-- 父组件 -->
<order-bottom-bar>
  <view slot="header">自定义头部</view>
  <view slot="content">自定义内容</view>
  <view slot="footer" class="footer-content">自定义底部</view>
</order-bottom-bar>
```

### 13.3 条件插槽

```html
<!-- 子组件 -->
<slot wx:if="{{showTag}}" name="tag" />
<slot wx:else name="default" />

<!-- 父组件 -->
<custom-card>
  <view slot="tag" wx:if="{{hasTag}}">标签内容</view>
</custom-card>
```

### 13.4 作用域插槽

```html
<!-- 子组件 - 传递数据给父组件 -->
<view class="item" wx:for="{{list}}">
  <slot name="item" item="{{item}}" index="{{index}}">
    默认内容: {{item.name}}
  </slot>
</view>

<!-- 父组件 - 接收并使用数据 -->
<custom-list>
  <view slot="item" slot-scope="scope">
    自定义内容: {{scope.item.name}}, 索引: {{scope.index}}
  </view>
</custom-list>
```

### 13.5 动态插槽名

```html
<!-- 子组件 -->
<slot name="{{dynamicName}}" />

<!-- 父组件 -->
<custom-component>
  <view slot="{{currentSlot}}">动态插槽内容</view>
</custom-component>
```

---

## 14. WXS 过滤器

### 14.1 WXS 文件创建

```javascript
// src/pages/make-order/index.wxs

// 格式化价格
function formatPrice(price) {
  if (!price) return '0'
  return (price / 100).toFixed(2)
}

// 格式化日期
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

// 获取航班显示名
function getFlightName(airlineInfo) {
  if (!airlineInfo) return ''
  return airlineInfo.airline_short_name + ' ' + airlineInfo.flight_number
}

// 判断是否显示折扣标签
function showDiscountTag(originalPrice, currentPrice) {
  if (!originalPrice || !currentPrice) return false
  return originalPrice > currentPrice
}

module.exports = {
  formatPrice: formatPrice,
  formatDate: formatDate,
  getFlightName: getFlightName,
  showDiscountTag: showDiscountTag
}
```

### 14.2 在模板中引用 WXS

```html
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

  <view class="flight-name">
    <text>{{ tools.getFlightName(item.airline_info) }}</text>
  </view>

  <!-- 在表达式中使用 -->
  <view wx:if="{{tools.showDiscountTag(item.original_price, item.current_price)}}" class="discount-tag">
    折扣
  </view>
</template>
```

### 14.3 WXS 特点

| 特点 | 说明 |
|-----|------|
| 基于 ES5 | WXS 只能用 ES5 语法，不支持 ES6+ |
| 与 JS 隔离 | WXS 不能调用其他 JS 文件的函数 |
| 性能高 | WXS 在渲染层执行，比 JS 调用更高效 |
| 有限 API | 不支持 wx 等小程序 API |

### 14.4 WXS vs JS 方法

| 对比项 | WXS | JS methods |
|-------|-----|------------|
| 执行环境 | 渲染层 | 逻辑层 |
| 调用次数 | 每次渲染都执行 | 仅显式调用 |
| 传参 | 只能通过模板 | 可以处理复杂逻辑 |
| 适用场景 | 简单格式化 | 复杂业务逻辑 |

---

## 15. 进阶用法

### 15.1 动态 class

```html
<!-- 组合多个类名 -->
<view class="container {{ isActive ? 'active' : '' }} {{ isLarge ? 'large' : '' }}">
</view>

<!-- 对象语法 -->
<view wx:class="{{ {
  'active': isActive,
  'large': isLarge,
  'disabled': isDisabled
} }}">
</view>

<!-- 数组语法 -->
<view wx:class="{{ [baseClass, isActive ? 'active' : '', extraClass] }}">
</view>
```

### 15.2 动态样式

```html
<!-- 对象语法 -->
<view wx:style="{{ {
  color: textColor,
  fontSize: fontSize + 'px',
  padding: padding + 'px ' + padding * 2 + 'px'
}}">
</view>

<!-- 字符串语法 -->
<view wx:style="color: {{color}}; font-size: {{fontSize}}px;">
</view>

<!-- 三元运算 -->
<view wx:style="{{ isCenter ? 'text-align: center' : 'text-align: left' }}">
</view>
```

### 15.3 外部样式类

```html
<!-- 组件定义 externalClasses -->
<script>
createComponent({
  externalClasses: ['custom-class', 'label-class', 'icon-class']
})
</script>

<!-- 子组件模板 -->
<view class="custom-class">使用外部样式</view>
<text class="label-class">标签样式</text>

<!-- 父组件传入 -->
<my-component
  custom-class="my-custom-style"
  label-class="my-label-style"
/>
```

### 15.4 节点操作

```javascript
// 创建选择器
const query = this.createSelectorQuery()

// 查询单个节点
query.select('.container').boundingClientRect((rect) => {
  console.log('节点信息:', rect)
})

// 查询多个节点
query.selectAll('.item').boundingClientRect((rects) => {
  console.log('所有 item 节点:', rects)
})

// 执行查询
query.exec(() => {
  console.log('查询完成')
})
```

### 15.5 动画

```javascript
// 创建动画
this.animation = this.createAnimation({
  duration: 300,
  timingFunction: 'ease'
})

// 执行动画
this.animation
  .opacity(0)
  .translateY(20)
  .step()

// 导出动画
this.setData({
  animation: this.animation.export()
})
```

### 15.6 条件编译

```javascript
// 平台判断
if (__mpx_mode__ !== 'web') {
  // 非 H5 平台执行
  config.packages.push('@didi/fe-escontact/src/app.mpx?root=contact')
}

// 支付宝小程序
if (__mpx_mode__ === 'ali') {
  // 支付宝小程序逻辑
}

// 微信小程序
if (__mpx_mode__ === 'wx') {
  // 微信小程序逻辑
}
```

### 15.7 页面间通信

```javascript
// 获取当前页面实例
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]

// 传参数到上一个页面
currentPage.setData({
  refresh: true
})

// 触发上一个页面的方法
currentPage.onRefresh()
```

### 15.8 全局数据

```javascript
// app.mpx 中定义 globalData
createApp({
  globalData: {
    harmonyStatusBarHeight: 30,
    isOnline: true,
    userToken: ''
  }
})

// 在页面/组件中访问
const app = getApp()
console.log(app.globalData.userToken)
```

### 15.9 插件系统

```javascript
// src/plugins/request.js
export default (mpx) => {
  // 添加全局请求拦截
  mpx.$http.intercept('request', (config) => {
    // 添加 token
    config.header = config.header || {}
    config.header['Authorization'] = getApp().globalData.userToken
    return config
  })

  // 添加全局响应拦截
  mpx.$http.intercept('response', (response) => {
    // 处理响应
    return response
  })
}

// app.mpx 中使用
import requestPlugin from '@/plugins/request'

createApp({
  plugins: [requestPlugin]
})
```

### 15.10 性能优化建议

```javascript
// 1. 合理使用 computed，避免复杂计算
computed: {
  // ✅ 好：简单的派生数据
  filteredList() {
    return this.list.filter(x => x.active)
  },

  // ❌ 差：过于复杂的计算
  complexData() {
    return this.list.map(x => {
      // 复杂处理
      return this.process(x)
    })
  }
}

// 2. 使用 wx:if 而非 wx:show 来控制是否渲染
<view wx:if="{{showLargeList}}">  // 条件不常为 true 时使用
  <large-list />
</view>

// 3. 合理使用 watch，避免深度监听
watch: {
  // ✅ 好：监听特定字段
  'obj.field'(newVal) {
    console.log(newVal)
  }
}

// 4. 列表渲染指定 wx:key
<view wx:for="{{list}}" wx:key="id">  // 使用唯一 ID
  {{item.name}}
</view>

// 5. 避免在模板中调用方法
// ❌ 差：每次渲染都调用
<text>{{ formatPrice(item.price) }}</text>

// ✅ 好：使用 computed 或预先处理
<text>{{ item.formattedPrice }}</text>
```

---

## 附录

### A. 常用命令

```bash
# 安装依赖
npm install

# 开发环境
npm run dev

# 生产构建
npm run build

# 小程序预览
npm run preview
```

### B. 项目结构

```
src/
├── app.mpx              # 应用入口
├── appInit.js           # 应用初始化
├── api/                  # API 接口
├── components/           # 公共组件
├── pages/                # 页面
│   ├── home/            # 首页
│   ├── search/          # 搜索
│   ├── make-order/      # 创单
│   └── order/           # 订单
├── store/               # 状态管理
│   └── modules/         # store 模块
├── mixins/              # 混入
├── utils/               # 工具函数
└── common/              # 公共模块
```

### C. 官方资源

- [MPX 官方文档](https://didi.github.io/mpx/)
- [MPX GitHub](https://github.com/didi/mpx)

---

> 本文档由代码分析工具自动生成，基于实际项目代码编写。如有疏漏，欢迎指正。