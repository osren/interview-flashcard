# 1.ai 机火建设 - 项目使用情况
1.项目：机票品类
需求：机票列表页优化
使用情况：在对机票报价页重构逻辑上，使用ai工具分析修改的逻辑，保证线上逻辑稳定。
2.项目：机票品类：
需求：制度解耦
使用情况：使用AI对代码逻辑进行分析，包括代码eslint修复、大文件拆解、关键逻辑思维导图输出、品类首页逻辑按照组内规范进行拆分，将mpx的option 写法修改为 Composition写法，保证原来的逻辑业务不受较大的影响。
3.项目：机票品类：
需求：凤凰知音会员
使用情况：使用ai输出spec方案，在输出具体代码。最终代码大概50%由ai生成。ai生成后ui需要手动调整，组合式api写法也有缺点，不符合mpx要求。
4. 项目：机票品类h5、pc
需求：甲子系统增加购票须知模块
使用情况：使用50% ai开发，对老代码的分析，数据流向整理，新页面逻辑绘制使用。
在小程序星河上的兼容问题较大，需要手动调优，更换兼容写法代码
在样式还原上有差距，需要对页面的布局进行优化，部分需要重写
pc采用的react 实现，代码ai生成后修改较少
5. 项目：机票品类
需求：优化接口增加ts文件
使用情况：根据后台的数据struct，生成了30+接口的ts 规范，后续每个接口接入ts 原数据，避免数据流修改混乱与缺失，为后续接口数据精简与前端高效渲染做准备。
6. 项目：火车票品类
需求：12306直付
使用情况：梳理火车票预定流程，使用ai coding 生成收银台ui。收银台跳转逻辑，bridge已经其他端跳转逻辑。整个ai 逻辑占比 80% 以上。手动微调部分逻辑细节和ui样式问题。
7. 项目：火车票品类
需求：火车票本人退票
使用情况：及到订单确认页，详情页，12306关联页，人脸核验页，使用AI按照需求和多轮对话生成依次生成spec、tasks、checkList、summary、report文档，代码整体效果很好，需要手动修改的是样式部分，业务逻辑Ai的生成的可以直接使用，改动较小，复用率占比90%。
8. 项目：火车票品类
需求：火车票改签
使用情况：火车票品类: 火车票改签，利用AI梳理火车票改签流程，使用AI完成改签逻辑，生成的代码目前用到了50%，一半需要手动修改
9. 项目：机票品类
需求：【金螳螂】机票列表默认价格倒序（低价优先）
使用情况：优化接口增加ts文件根据sort字段，列表页加载展示对应标签，ai生成代码20%冗余，比如去程和回程分开考虑，实际情况是去程和回程是拿到相同的sort，不用写这段代码。
10. 项目：机票品类
需求：凤凰知音需求
使用情况：使用ai读接口文档，把相应字段对应到原来的测试字段，以及mock测试数据。ai大概生成70%代码，其中的逻辑梳理需要手动增加
11. 项目：火车票品类
需求：火车票本人退票 火车票12306直付需求
使用情况：使用推荐的skill配合AI实现：支付宝和微信支付方案的部分逻辑，支付完成后回页的监听处理完成支付后代码的完善，适配了安卓回页检测不触发的问题。效果和适配的过程都很不错
12. 项目：机票品类
需求：贵必赔和省立返
使用情况：修改贵必赔和省立返跳转时，涉及到多个需要更改的跳转逻辑，包含banner位，理赔详情规则，品类首页，品类大首页等，涉及到MPX，RN，V4Home等多个仓库，使用ai帮助快速定位跳转代码位置，对整个链路进行快速分析，通过提前写好的跳转模版可以实现快速更新跳转逻辑，不同端只需要修改一些语法问题
13. 项目：机票品类
需求：退改签数据结构优化支持X小时前免费改签需求
使用情况：利用spec快速定位并且修改ui，mpx项目修改效果一般，需要手动去修改合并逻辑包括ui样式，pc端的生成效果较好，占比能达到80%
14. 项目：机票品类
需求：低价高亮提醒
使用情况：低价高亮提醒组件开发业务逻辑正确，样式需手动调整。现有业务逻辑、组件封装，会有常量引入缺失问题。线上问题排查给予清晰的问题描述，可以快速定位，并给予修复建议。
15. 项目：火车票品类
需求：差异化能力建设-超标预警提醒
使用情况：使用AI实现需求的梳理，代码开发，接口联调，代码复用率达到100%，没有手动编写一行代码，全部使用对话方式让AI解决
16. 项目：火车票品类
需求：火车票企业码需求
使用情况：先试用ai对prd进行处理，生成技术方案，根据技术方案生成大部分代码，然后一些细节通过与ai对话进行解决。大概90%代码由ai生成
17. 项目：火车票品类
需求：火车票H5监控平台告警治理Bugfix
使用情况：将天眼平台上告警的用户轨迹信息转化为Prompt，利用AI梳理当前页面链路上可能会发生问题的地方，定位具体问题后与产品确认修改方案后让AI进行修改，目前能解决90%以上的线上告警问题。
考虑组内全部人员都使用ai编程，ai接受率较高。暂不统计需求使用
表格：
品类
需求
使用情况
机票品类
机票报价页重构逻辑分析
在对机票报价页重构逻辑上，使用ai工具分析修改的逻辑，保证线上逻辑稳定。
机票品类
制度解耦
使用AI对代码逻辑进行分析，包括代码eslint修复、大文件拆解、关键逻辑思维导图输出、品类首页逻辑按照组内规范进行拆分，将mpx的option写法修改为Composition写法，保证原来的逻辑业务不受较大的影响。
机票品类
凤凰知音会员（spec+代码生成）
使用ai输出spec方案，再输出具体代码。最终代码大概50%由ai生成。ai生成后ui需要手动调整，组合式api写法也有缺点，不符合mpx要求。
机票品类
甲子系统增加购票须知模块配置
使用50% ai开发，对老代码的分析，数据流向整理，新页面逻辑绘制使用。在小程序星河上的兼容问题较大，需要手动调优，更换兼容写法代码；在样式还原上有差距，需要对页面的布局进行优化，部分需要重写；pc采用的react实现，代码ai生成后修改较少。
机票品类
接口TS规范生成
根据后台的数据struct，生成了30+接口的ts规范，后续每个接口接入ts原数据，避免数据流修改混乱与缺失，为后续接口数据精简与前端高效渲染做准备。
火车票品类
火车票预定流程收银台UI
梳理火车票预定流程，使用ai coding生成收银台ui。收银台跳转逻辑，bridge已经其他端跳转逻辑。整个ai逻辑占比80%以上。手动微调部分逻辑细节和ui样式问题。
火车票品类
火车票本人退票
涉及到订单确认页，详情页，12306关联页，人脸核验页，使用AI按照需求和多轮对话生成依次生成spec、tasks、checkList、summary、report文档，代码整体效果很好，需要手动修改的是样式部分，业务逻辑Ai的生成的可以直接使用，改动较小，复用率占比90%。
火车票品类
火车票改签
利用AI梳理火车票改签流程，使用AI完成改签逻辑，生成的代码目前用到了50%，一半需要手动修改。
机票品类
列表页sort标签加载
根据sort字段，列表页加载展示对应标签，ai生成代码20%冗余，比如去程和回程分开考虑，实际情况是去程和回程是拿到相同的sort，不用写这段代码。
机票品类
凤凰知音（接口文档字段映射）
使用ai读接口文档，把相应字段对应到原来的测试字段，以及mock测试数据。ai大概生成70%代码，其中的逻辑梳理需要手动增加。
火车票品类
火车票12306直付
使用推荐的skill配合AI实现：支付宝和微信支付方案的部分逻辑，支付完成后回页的监听处理完成支付后代码的完善，适配了安卓回页检测不触发的问题。效果和适配的过程都很不错。
机票品类
修改贵必赔和省立返跳转逻辑
涉及到多个需要更改的跳转逻辑，包含banner位，理赔详情规则，品类首页，品类大首页等，涉及到MPX，RN，V4Home等多个仓库，使用ai帮助快速定位跳转代码位置，对整个链路进行快速分析，通过提前写好的跳转模版可以实现快速更新跳转逻辑，不同端只需要修改一些语法问题。
机票品类
退改签数据结构优化（X小时前免费改签）
利用spec快速定位并且修改ui，mpx项目修改效果一般，需要手动去修改合并逻辑包括ui样式，pc端的生成效果较好，占比能达到80%。
机票品类
低价高亮提醒组件开发
业务逻辑正确，样式需手动调整。现有业务逻辑、组件封装，会有常量引入缺失问题。线上问题排查给予清晰的问题描述，可以快速定位，并给予修复建议。
机票品类
常飞优享、凤凰知音
优化会员价样式处理，需手动调整
机票品类
优化首页接口反复多次请求
ai生成逻辑图谱，再生成代码能直接使用
机票品类
填单页埋点
使用ai分析首次出票埋点整个流程
火车票品类
差异化能力建设-超标预警提醒
使用AI实现需求的梳理，代码开发，接口联调，代码复用率达到100%，没有手动编写一行代码，全部使用对话方式让AI解决
火车票品类
火车票企业码需求
先试用ai对prd进行处理，生成技术方案，根据技术方案生成大部分代码，然后一些细节通过与ai对话进行解决。大概90%代码由ai生成
机票品类
火车票H5监控平台告警治理Bugfix
将天眼平台上告警的用户轨迹信息转化为Prompt，利用AI梳理当前页面链路上可能会发生问题的地方，定位具体问题后与产品确认修改方案后让AI进行修改，目前能解决90%以上的线上告警问题。

# 2.ai 机火建设 - ai输出
rules
mpx-style.md
作用：用 stylus；颜色 6 位十六进制（#333333 不用 #333）；类名禁用 wx- 前缀（星河会替换为 dd-）；复杂样式在 computed 里算好 class/style map 再绑定
# MPX 样式规则
## 样式兼容性
### 样式语言约定
- MPX 页面和组件的 `<style>` 默认使用 `stylus`（即 `lang="stylus"`）。
- 新增样式代码时，优先延续 `stylus` 语法与现有 `.styl` 文件组织方式，避免混用其他预处理器。
### 颜色写法
- Android 小程序样式中，避免使用 3 位十六进制缩写（如 `#333`）。
- 统一使用 6 位十六进制写法（如 `#333333`）。
### 自定义类名命名
- 避免在自定义样式类名中使用 `wx-` 前缀。
- 在星河环境下，`wx-` 可能被编译替换为 `dd-`，进而导致类名匹配失效。
## 复杂样式逻辑建议
- 样式拼接逻辑复杂时，优先在 `computed` 中生成结构化结果（如 class/style map），再绑定到模板。
- 避免在模板内写复杂内联样式表达式，以减少编译差异和运行时问题。
mpx-template.md
作用：嵌套交互用 catchtap、组件内 triggerEvent 抛语义事件；模板表达式保持简单（禁函数调用 / 可选链 / 模板字符串 / 一元 + / includes·indexOf）；wx:class 用对象语法、key 不加引号；wx:style 对象末项无尾随逗号；<text> 内不放非 text 元素；es-popup 不放进 es-scroll-layout；组件标签统一 kebab-case
# MPX 模板规则
## 事件处理
### 点击事件冒泡
**实现嵌套可交互 UI 时，默认采用明确的事件归属。**
- 当内层交互元素（如 tag、label、button、列表行）点击后**不应**触发父级点击时，使用 `catchtap`。
- 仅在明确需要冒泡到父级时使用 `bindtap`。
- **在可复用组件中**：内部用 `catchtap` 接管原生点击，再通过 `triggerEvent` 向上抛出语义化自定义事件。
- 示例：`info-label` 内部使用 `catchtap`，再抛出 `labelTapped` 事件。
- 这样可以保证行为可预期，避免误触发父级导航。
### 点击行为排查
当点击行为异常（例如点击内层元素却触发了错误导航）时：
1. **先检查事件冒泡链路** —— 确认哪些 handler 被触发、触发顺序如何。
2. **再检查数据匹配逻辑** —— 确认最终命中的是原始数据列表中的正确项。
### 示例模式
```xml
<!-- 父卡片：主点击处理 -->
<view bindtap="onCardTap(item)">
<!-- 内层可交互元素：不应触发父级 -->
<view catchtap="onNestedAction">
    独立点击区域
</view>
</view>
```
### 实际案例
在航班列表中，点击共享航班行应进入该共享航班详情，而不是主航班详情：
- `share-flight-list` 行使用 `catchtap`，阻止冒泡到父卡片的 `bindtap`。
- 抛出携带具体共享航班数据的 `chooseShareFlight` 自定义事件。
- 父级列表页面接收事件后，使用正确航班信息进行跳转。
---
## 模板语法兼容性
### `{{}}` 表达式限制
**模板表达式应保持简单，复杂逻辑应移出 WXML/MPX 模板字符串。**
- 不要在模板表达式中直接调用函数（例如 `{{noneSelect(...)}}`）。
- 不要在模板中使用可选链（例如 `{{list[key]?.name}}`）。
- 不要在模板中使用一元 `+` 强制转换（例如 `{{+value}}` 或 `{{+translateX}}`）。
- 模板中不支持模板字符串（如 `` `prefix-${value}` ``）；请在脚本侧先拼接后再绑定。
- 风险写法：
    ```xml
<view>{{ `prefix-${value}` }}</view>
    ```
- 推荐写法：
    ```xml
<view>{{ prefixText }}</view>
    ```
    在 `computed` / 脚本中预先生成 `prefixText`。
- 避免在 `<template>` 表达式中使用 `includes()` / `indexOf()` 这类方法调用。
- 避免在标签与胡子语法（moustache）表达式之间插入额外换行；在部分星河构建下可能触发解析/编译异常。
- 风险写法：
    ```xml
<text>
  {{ total_time_text }}
</text>
    ```
- 推荐写法（内联）：
    ```xml
<text>{{ total_time_text }}</text>
    ```
- 推荐写法（moustache 内跨行也可）：
    ```xml
<text>{{
total_time_text
}}</text>
    ```
- 对于非简单逻辑，优先使用预计算字段、`computed` 或 `WXS`。
### `wx:class` 使用约束
**默认使用对象式 class 绑定，作为更安全的写法。**
- `wx:class` 优先使用对象语法；在兼容性敏感模块中避免数组语法。
- 对于不含特殊字符的 key，避免手动加引号。
- 风险写法：`wx:class="{{{'filter-item': true, 'active': cond}}}"`
- 推荐写法：`wx:class="{{{'filter-item': true, active: cond}}}"`
- 若 class 组合逻辑复杂，建议在 `script` / `computed` 中先计算 class map 再绑定。
### `wx:style` 对象写法约束
- 当 `wx:style` 使用对象字面量时，最后一项后**不要写尾随逗号（trailing comma）**，否则在星河环境可能报语法错误。
- 风险写法：`marginLeft: !showLogo ? '1px' : '',`
- 推荐写法：`marginLeft: !showLogo ? '1px' : ''`
### 模板结构约束
- 不要在 `<text>` 内放置非 `text` 元素（包括类似 slot 的结构）；需要容器时改用 `<view>`。
- `<text>` 嵌套 `<es-icon>` 不会显示，解决方案：改用 `<view>` 作为外层容器。
- 风险写法：`<text><es-icon name="arrow-right" /></text>`
- 推荐写法：`<view><es-icon name="arrow-right" /></view>`
### 组件组合约束
- 不要将 `<es-popup>` 放到 `<es-scroll-layout>` 中，否则弹层会跟随布局滚动。
- 当 `<swiper>` 放在 `<es-popup>` 内且数据更新后出现“无法继续滚动”时，优先重渲染 `<es-popup>` 外层，而不是只重渲染 `<swiper>`。
- 建议在 `<es-popup>` 上加 `wx:if` 控制重建。
- 为避免动画丢失，可在弹层隐藏动画结束（如 `bind:hide`）后再触发重建。
- `<es-icon>` 放在 `<es-cell>` 中时，`catchtap` 可能无法阻止事件冒泡到 `es-cell` 的点击事件。
- 规避方案：增加一个状态开关（如 `flag`）区分 icon 点击与 cell 点击，在 `cell` 点击回调中先消费该状态再决定是否继续执行。
### 模板中的组件命名
- 组件注册 key 与模板标签使用统一的 kebab-case（中划线）风格。
- 示例：注册为 `"tips-detail"`，模板中使用 `<tips-detail></tips-detail>`。
3.mpx-script.md
作用：URL 参数走 this.$mpxRoute.query（不依赖 created(e)）且解构前判空；不用 id 当业务字段；setState 不传 undefined（用 ''/0/[]/{}/false）；props function 类型先挂 data 再传；props 传值类型须与定义 type 一致；兼容性兜底才用 $forceUpdate() 
# MPX 脚本规则
## 脚本结构约定
- 组件/页面逻辑放在 `<script>` 中，配置放在 `<script name="json">` 中。
- `usingComponents` 的注册 key 与模板标签保持一致（统一使用 kebab-case / 中划线命名）。
## 生命周期兼容性
- 在星河组件中，`created()` 的入参在部分场景下可能为 `undefined`（H5 下可能有值）。
- 为兼容星河，URL 参数统一通过 `this.$mpxRoute.query` 读取，不依赖 `created(e)` 的参数。
- 当 URL 不带参数时，`this.$mpxRoute.query` 在 H5 中可能是空对象、在小程序中可能是 `undefined`，解构前需要判空。
- 示例：
    ```js
created() {
const { from } = this.$mpxRoute.query || {}
}
    ```
## 数据定义与更新
- `data` 与 `computed` 中都避免使用 `id` 作为业务字段名，避免与星河关键字冲突。
- `setState` / 数据更新时不要传 `undefined`，使用符合场景的默认值（如 `''`、`0`、`[]`、`{}`、`false`）。
- 需要数值转换时在脚本中处理，不要依赖模板表达式做隐式转换。
## 组件入参与函数类型属性
- 自定义组件 `props` 若为 `function` 类型，父组件传入时应先在 `data` 中挂载引用，再进行传递。
- 不要直接在 `methods` 中内联定义并透传函数引用，以避免在部分运行环境下失效。
## Props 数据类型一致性
- 自定义组件 `props` 传入的数据类型必须与 `props` 中定义的 `type` 类型保持一致。
- 在星河小程序中，当传入数据类型与定义类型不符时，会根据定义的 `type` 进行强制转换，这可能导致不可预期的行为。
- 示例：
  ```js
// 子组件定义
props: {
isHasWifi: {
type: Boolean
}
}
// 错误示例：传入数字 1，会被强制转换为 true
<flight-comfort-entertainment isHasWifi="{{1}}" />
// 正确示例：传入布尔值
<flight-comfort-entertainment isHasWifi="{{true}}" />
  ```
## 交互更新兜底
- 若 `input` 绑定值已更新但界面未刷新，可在确认数据已正确变更后使用 `$forceUpdate()` 兜底。
- `$forceUpdate()` 仅用于兼容性问题场景，优先保证正常响应式更新链路。
4.mpx-conpat.md
作用：星河小程序兼容性规则
# MPX 星河小程序兼容性规则
## 代码风格
### 重复 import 合并
**禁止将同一个模块的导入拆分为多行。**
- 错误写法：
```typescript
import { getCurrentInstance } from '@mpxjs/mpx'
import { ref } from '@mpxjs/mpx'
```
- 正确写法：
```typescript
import { getCurrentInstance, ref } from '@mpxjs/core'
```
### MPX 导入路径
**MPX 核心模块应从 `@mpxjs/core` 导入，不是 `@mpxjs/mpx`。**
- 错误写法：`import { ref } from '@mpxjs/mpx'`
- 正确写法：`import { ref } from '@mpxjs/core'`
## 样式兼容
### 颜色写法
**Android 小程序样式不支持 3 位十六进制缩写。**
- 错误写法：`#333`、`#666`
- 正确写法：`#333333`、`#666666`
### 自定义类名命名
**星河环境下，`wx-` 前缀会被编译替换为 `dd-`，导致类名匹配失效。**
- 禁止在自定义样式类名中使用 `wx-` 前缀
- 使用普通命名如 `filter-item`、`active-state`
### 样式对象写法
**`wx:style` 为对象时，不能有尾随逗号（trailing comma）。**
- 错误写法：`marginLeft: !showLogo ? '1px' : '',`
- 正确写法：`marginLeft: !showLogo ? '1px' : ''`
### 样式值引号
**星河不支持样式写法中有双引号的写法。**
- 错误写法：`wx:class="{{{'filter-item':true, 'active': cond}}}"`（key 带引号）
- 正确写法：`wx:class="{{{'filter-item':true, active: cond}}}"`（key 不带引号）
---
## 模板语法兼容
### wx:class 约束
**默认使用对象式 class 绑定。**
- 正确写法：`wx:class="{{{'filter-item': true, active: cond}}}"`（key 不带引号）
- 正确写法：`wx:class="{{classMap}}"`（computed 计算属性返回对象）
### 模板函数调用
**模板 `{{}}` 中不支持调用函数。**
- 错误写法：`wx:class="{{noneSelect(item.title)}}"`
- 正确写法：先在 `computed` 中计算好 classMap，再绑定 `wx:class="{{classMap}}"`
### 可选链运算符
**模板 `{{}}` 中不支持 `?.` 链判断运算符。**
- 错误写法：`{{list[key]?.name}}`
- 正确写法：先在 `computed` 中处理可选逻辑
### 数组方法调用
**`<template>` 表达式中不支持 `includes()`、`indexOf()` 等方法调用。**
- 错误写法：`wx:if="{{list.includes(item)}}"`
- 正确写法：使用 computed 或在 script 中处理
### 函数表达式
**模板 `{{}}` 中不支持一元 `+` 强制转换等表达式。**
- 错误写法：`{{+value}}`、`{{+translateX}}`
### 模板字符串
**模板中不支持模板字符串。**
- 错误写法：`<view>{{ `prefix-${value}` }}</view>`
- 正确写法：先在 `computed` 中拼接好 `prefixText`，再绑定 `{{prefixText}}`
### text 元素约束
**`<text>` 内不能放置非 `text` 元素（包括 slot）。**
- `<text>` 嵌套 `<es-icon>` 不会显示
- 解决方案：改用 `<view>` 作为外层容器
### text 换行
**`<text>` 不能换航当前行，否则可能编译异常。**
- 当前行上面增加 `<!-- prettier-ignore -->`
---
## 组件兼容
### 组件命名
**组件注册 key 与模板标签使用统一的 kebab-case（中划线）风格。**
- 注册：`"tips-detail"`
- 模板：`<tips-detail></tips-detail>`
### props function 类型
**自定义组件 `props` 若为 `function` 类型，父组件传入时应先在 `data` 中挂载引用。**
- 错误写法：在 `methods` 中内联定义并透传函数引用
- 正确写法：在 `data` 中定义函数引用，再进行传递
### picker 组件
**`<picker>` 组件如果 range 属性是数字列表，则必须绑定 value。**
- 否则选择第一项时，change 事件的 value 为空字符串
### es-popup 嵌套
**不要将 `<es-popup>` 放到 `<es-scroll-layout>` 中，否则弹层会跟随布局一起滚动。**
### swiper 在 popup 中
**`<swiper>` 组件放到 `<es-popup>` 组件中，如果数据有更新，轮播图无法滚动。**
- 解决方案：在 `<es-popup>` 上加 `wx:if` 控制重建
### es-icon 在 es-cell 中
**`<es-icon>` 放在 `<es-cell>` 中，`catchtap` 无法阻止事件冒泡。**
- 规避方案：增加状态开关区分 icon 点击与 cell 点击
---
## 生命周期与状态
### created 参数
**星河组件中，`created()` 的入参在部分场景下可能为 `undefined`。**
- URL 参数统一通过 `this.$mpxRoute.query` 读取，不依赖 `created(e)` 参数
### $mpxRoute.query 判空
**当 URL 不带参数时，`this.$mpxRoute.query` 在 H5 中是空对象、在小程序中是 `undefined`。**
- 解构前需要判空：`const { from } = this.$mpxRoute.query || {}`
### watch 全局性
**星河中 watch 是全局的，即便上个页面隐藏了，当前页面 watch 了同一个对象，还是会执行上个页面的 watch。**
- 注意避免跨页面状态污染
### mpxPageStatus
**当前页面有弹窗没关闭，通过右划或点返回按键返回到上个页面，上个页面的弹窗依然显示。**
- 解决方案：判断 `mpxPageStatus`
- 注意：H5 键盘弹起/收回时，`mpxPageStatus` 的值会变成 `resize`，使用这种方式会导致弹窗无法弹出
### 状态同步
**小程序与 H5 中的 mapState 实现不一样，导致状态不同步。**
- 需要注意跨平台状态一致性
---
## 路由与导航
### 路由替换
**路由替换不要用 `$mpxRouter.replace`，应该用 `$mpxRouter.redirect`。**
### showLoading/hideLoading
**IOS release 包下无法 `hideLoading` 之前的 `showLoading`。**
- 注意避免在 IOS 环境下的连续调用
---
## 数据更新
### setState undefined
**mpx 中 `setState` 不允许传入 `undefined` 数据，`undefined` 会被空字符串覆盖。**
- 错误写法：`setState({ value: undefined })`
- 正确写法：`setState({ value: '' })`（使用符合场景的默认值）
### input 展示不更新
**若 `input` 绑定值已更新但界面未刷新，可在确认数据已正确变更后使用 `$forceUpdate()` 兜底。**
- `$forceUpdate()` 仅用于兼容性问题场景
---
## 事件处理
### 点击事件冒泡
**实现嵌套可交互 UI 时，默认采用明确的事件归属。**
- 内层元素不应触发父级点击时，使用 `catchtap`
- 事件归属明确需要冒泡时使用 `bindtap`
### 组件事件冒泡
**当点击行为异常时，先检查事件冒泡链路，再检查数据匹配逻辑。**
5.mpx-eslint-prettier-rules.md
作用：本文档整合了项目 ESLint 规则和 Prettier 配置，用于约束代码风格和保证代码质量。
# MPX ESLint & Prettier 规范
> 本文档整合了项目 ESLint 规则和 Prettier 配置，用于约束代码风格和保证代码质量。
> 所有团队成员必须遵守本规范。
---
## 目录
- [Prettier 配置](#prettier-配置)
- [ESLint 规则（流水线）](#eslint-规则流水线)
- [MPX 特殊规范](#mpx-特殊规范)
---
## Prettier 配置
项目配置文件：[.prettierrc.js](../../.prettierrc.js)（项目根目录）
```javascript
module.exports = {
printWidth: 120,        // 超过120列换行
tabWidth: 2,           // 缩进2空格
useTabs: false,        // 使用空格缩进
semi: false,           // 不使用分号
singleQuote: true,    // 使用单引号
proseWrap: 'preserve', // 保持原有换行
arrowParens: 'always', // 箭头函数参数始终加括号
bracketSpacing: true,  // 对象括号内加空格
endOfLine: 'auto',     // 自动行尾
trailingComma: 'none', // 不使用尾逗号
vueIndentScriptAndStyle: true, // Vue/Mpx 中 script/style 标签缩进
overrides: [
    {
files: ['*.mpx'],
options: {
parser: 'vue',
printWidth: 120
      }
    }
  ]
}
```
---
## ESLint 规则（流水线）
### 1. 变量与赋值
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-constant-condition` | 禁止将常量作为分支条件判断中的测试表达式（循环中允许） | ❌ `if (true)` / ✅ `if (x > 0)` |
| `no-constant-binary-expression` | 禁止将常量作为分支条件判断中的测试表达式 | - |
| `no-duplicate-imports` | 禁止重复导入模块 | - |
| `no-redeclare` | 禁止重复定义变量 | - |
| `no-shadow` | 禁止变量名与上层作用域内已定义的变量重复 | - |
| `no-undef-init` | 禁止将 undefined 赋值给变量 | ❌ `let a = undefined` / ✅ `let a` |
| `no-unused-vars` | 已定义的变量必须使用 | - |
| `no-useless-assignment` | 禁止无用的表达式 | - |
| `no-constant-binary-expression` | 禁止将常量作为分支条件判断中的测试表达式 | - |
| `prefer-const` | 申明了后不再修改的变量必须使用 const | ❌ `let a = 1` / ✅ `const a = 1` |
| `no-var` | 禁止使用 var，使用 let/const | - |
### 2. 运算符与比较
| 规则 | 说明 | 示例 |
|------|------|------|
| `eqeqeq` | 必须使用 `===` 或 `!==`，禁止使用 `==` 或 `!=` | ❌ `==` / ✅ `===` |
| `no-compare-neg-zero` | 禁止与 -0 比较 | ❌ `x === -0` / ✅ `Object.is(x, -0)` |
| `use-isnan` | 必须使用 `isNaN(foo)` 而不是 `foo === NaN` | - |
| `restrict-plus-operands` | 使用加号时，两者必须同为数字或同为字符串 | - |
### 3. 表达式与语句
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-constant-binary-expression` | 禁止无用的表达式 | - |
| `no-else-return` | 禁止在 return/throw/break/continue 之后还有代码 | - |
| `no-empty-function` | 不允许有空函数 | ❌ `function() {}` |
| `no-return-await` | 禁止不必要的 `return await` | - |
| `no-setter-return` | 禁止 setter 有返回值 | - |
| `no-eval` | 禁止使用 eval | - |
| `no-lone-blocks` | 禁止不必要的代码块 | - |
### 4. 控制流
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-duplicate-case` | 禁止在 switch 语句中出现重复测试表达式的 case | - |
| `default-case` | switch 语句必须有 default 分支 | - |
| `no-unreachable` | 禁止在 return/throw/break/continue 之后还有代码 | - |
| `no-fallthrough` | switch case 必须有 break/return/throw | - |
### 5. 函数与参数
| 规则 | 说明 | 示例 |
|------|------|------|
| `max-params` | 函数的参数禁止超过 3 个 | ❌ `function(a,b,c,d)` |
| `max-depth` | 代码块嵌套的深度禁止超过 5 层 | - |
| `no-extra-boolean-cast` | 禁止双重否定 | ❌ `!!foo` / ✅ `Boolean(foo)` |
| `no-invalid-arguments` | 禁止无效的参数定义 | - |
| `prefer-rest-params` | 必须使用 `...args` 而不是 `arguments` | - |
### 6. 正则表达式
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-empty-character-class` | 禁止在正则表达式中使用空的字符集 `[]` | - |
| `no-invalid-regexp` | 禁止在 RegExp 构造函数中出现非法的正则表达式 | - |
| `no-useless-backreference` | 禁止正则表达式中出现无用的回溯引用 | - |
### 7. 对象与数组
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-array-constructor` | 禁止使用 Array 构造函数时传入超过一个参数 | ❌ `new Array(1,2)` / ✅ `[1,2]` |
| `prefer-object-spread` | 必须使用 `...` 而不是 `Object.assign`（除非第一个参数是变量） | - |
| `prefer-destructured-object` | 优先使用解构对象 | - |
### 8. 字符串与模板
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-console` | 禁止使用 console（生产环境） | - |
| `no-tabs` | 禁止使用 Tab 缩进 | - |
### 9. 异步与 Promise
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-await-in-loop` | 禁止在循环里使用 await（会影响性能） | - |
| `prefer-promise-reject-errors` | Promise 的 reject 中必须传入 Error 对象，而不是字面量 | ❌ `reject('error')` / ✅ `reject(new Error('error'))` |
### 10. 其他安全规则
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-eval` | 禁止使用 eval | - |
| `no-implied-eval` | 禁止使用隐式 eval | - |
| `no-new-func` | 禁止使用 `new Function` | - |
| `no-script-url` | 禁止 `javascript:void(0)` | - |
| `no-set-timeout` | 禁止在 setTimeout/setInterval 中传入字符串 | - |
| `no-with` | 禁止使用 with 语句 | - |
| `no-proto` | 禁止修改 `__proto__` | - |
---
## MPX 特殊规范
### 11. 组件与 Props
| 规则 | 说明 | 示例 |
|------|------|------|
| `no-direct-mpx-import` | 禁止直接导入 mpx 内部模块 | - |
| `no-dupe-keys` | 禁止在对象字面量中出现重复的属性 | - |
| `no-unexpected-multiline` | 禁止意外的自动分号插入 | - |
### 12. 模板语法
| 规则 | 说明 | 示例 |
|------|------|------|
| `mpx/no-unsafe-optional-chaining` | 禁止使用不安全的 optional chaining | ❌ `foo?.bar?.baz` / ✅ `foo?.bar?.baz` (安全使用) |
| `mpx/no-invalid-end-of-line` | 模板中正确结束标签 | - |
### 13. Computed 与 Methods
| 规则 | 说明 | 示例 |
|------|------|------|
| `mpx/computed-properties` | 计算属性必须有返回值 | - |
| `mpx/no-unused-properties` | 禁止出现未使用的属性 | - |
| `mpx/no-property-remutation` | 禁止在计算属性中对属性修改 | - |
### 14. 其他 MPX 规则
| 规则 | 说明 | 示例 |
|------|------|------|
| `mpx/no-raw-class` | 禁止使用动态类名拼接（使用对象语法） | ❌ `class="foo_{{bar}}"` / ✅ `class="{{ {foo: bar} }}"` |
| `mpx/no-raw-id` | 禁止使用 wx:id 动态绑定 | - |
| `mpx/require-stylesheet` | 必须正确引入样式文件 | - |
| `mpx/use-template-directives` | 优先使用模板指令 | - |
---
## 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `flightList`, `getFlightInfo()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 组件标签 | kebab-case | `<flight-card>`, `<list-filter>` |
| 类名/类型 | PascalCase | `FlightCardData`, `FlightInfo` |
| 文件名 | kebab-case 或 camelCase | `flight-card.mpx`, `useFlightList.ts` |
| Props | camelCase（MPX 中） | `flightType`, `isSelected` |
---
## 禁止的写法
```javascript
// ❌ 禁止连续赋值
foo = bar = 1
// ❌ 禁止无用的表达式
void 0
1 + 1
// ❌ 禁止自己与自己比较
x === x  // (除了 +0 === -0 这种)
// ❌ 禁止 return 语句里赋值
function() { return a = 1 }
// ❌ 禁止在 return 后还有代码
function() {
return a
  console.log('unreachable') // ❌
}
// ❌ 禁止在 setter 中返回值
set foo(val) { return this._foo = val } // ❌
// ❌ 禁止将 Error 对象序列化为字符串
reject('error string') // ❌
// ❌ 禁止修改组件的 props
this.props.foo = 'bar' // ❌
// ❌ 禁止滥用 toString
foo.toString()
num.toString()
// ❌ 禁止 location.href = javascript
location.href = 'javascript:void(0)'
// ❌ 禁止无用的 toString
String(null)
// ❌ 禁止在 getter 中返回空
get foo() { return } // ❌
```
---
## 推荐的写法
```javascript
// ✅ 使用解构赋值
const { flightList, loading } = this.data
// ✅ 使用可选链（安全场景）
const name = info?.flightNumber ?? ''
// ✅ 使用空值合并
const name = info?.flightNumber ?? '未知航班'
// ✅ 使用 isNaN
if (isNaN(value)) { ... }
// ✅ 正确使用 async/await
const result = await fetchData()
// ✅ 使用 Promise + Error
Promise.reject(new Error('error message'))
// ✅ 使用 Object spread
const merged = { ...base, ...override }
// ✅ 使用 includes
const hasItem = list.includes(item)
// ✅ 使用 getter 返回值
get formattedPrice() {
return `¥${this.price}`
}
// ✅ 使用 Object.is 做特殊比较
if (Object.is(value, -0)) { ... }
```
---
## 附录：规则 ID 速查
| 规则 ID | 说明 |
|---------|------|
| `no-constant-condition` | 禁止常量条件 |
| `eqeqeq` | 必须使用严格相等 |
| `no-compare-neg-zero` | 禁止与负零比较 |
| `prefer-const` | 优先使用 const |
| `no-duplicate-imports` | 禁止重复导入 |
| `no-redeclare` | 禁止重复声明 |
| `no-shadow` | 禁止变量遮蔽 |
| `no-unused-vars` | 禁止未使用变量 |
| `no-empty-function` | 禁止空函数 |
| `no-else-return` | 禁止 else return 后代码 |
| `no-eval` | 禁止 eval |
| `no-set-timeout` | 禁止字符串 setTimeout |
| `max-params` | 最大参数数量 |
| `max-depth` | 最大嵌套深度 |
| `no-array-constructor` | 禁止 Array 构造函数 |
| `no-await-in-loop` | 禁止循环 await |
| `prefer-promise-reject-errors` | Promise reject 必须 Error |
| `no-useless-backreference` | 禁止无用回溯引用 |
---
**文档版本**: 1.0
**更新日期**: 2026-05-26
**维护者**: 前端团队
SKills
refactor-mpx.md
触发方式
/refactor-mpx <文件路径或目录>
或描述重构需求（如「重构 src/pages/search/list.mpx，拆分为组件，控制在 800 行以内」）。
作用：文件评估 → 策略选择 → 步骤切分 → 执行 → 预检清单、策略：A 组合式 TS 全重构 / B 渐进式（Options + setup）/ C Mixin 拆解 + Composable 提取 / D–H 局部优化。
- 页面入口 `index.mpx`（≤800 行）
- 按业务域拆的 `composables/use*.ts`（纯 Composition API，`ref`/`reactive`/`computed`，**禁用 proxy/this**）
- 业务纯函数 `helper/logic/*.ts` + 常量 `helper/constant/`
- 抽离样式 `index.styl`（>100 行时，通过 `@import` 引入）
- 类型定义 `types/*.ts`
- 评估报告（行数 / 注释占比 / Mixin / Data 统计）+ 重构建议
---
name: refactor-mpx
description: |
  MPX 文件重构分析工具。对输入的 mpx 文件进行评估，判断是否需要重构，并输出符合项目规范的 TypeScript 代码。
  评估维度：文件行数、逻辑复杂度、Mixins 复杂度、Data 属性分组、ESLint 规范、星河小程序兼容性。
license: MIT
compatibility: |
  参考文档：
  - MPX 组合式 API: https://mpxjs.cn/guide/composition-api/composition-api.html
  - 项目 ESLint 规范: .eslintrc.js
  - ESLint & Prettier 规范: docs/spec/mpx-eslint-prettier-rules.md
  - MPX 规则: .claude/rules/mpx-*.md
  - 星河小程序兼容性规则: .claude/rules/mpx-compat.md
  - 目录结构规范: DIRECTORY_STRUCTURE.md
metadata:
author: didi-fintech
version: '7.0.0'
---
## 使用方式
```
/refactor-mpx <文件路径或目录>
```
或描述重构需求：
```
重构 src/pages/search/list.mpx，目标：拆分为组件，控制在 800 行以内
```
---
## 重构评估标准
### 1. 文件规模评估
| 指标 | 阈值        | 处理建议                    |
| ---- | ----------- | --------------------------- |
| 行数 | < 800 行    | 可接受，无需拆分            |
| 行数 | 800-1200 行 | 建议拆分超过 500 行的逻辑块 |
| 行数 | > 1200 行   | 必须拆分，拆分为多个组件    |
### 2. 代码质量评估
| 指标        | 要求     | 说明                                  |
| ----------- | -------- | ------------------------------------- |
| 最终行数    | ≤ 800 行 | 重构后文件必须控制在 800 行以内       |
| 注释占比    | ≥ 10%    | 注释行数 / 总行数 ≥ 10%               |
| 未使用变量  | 0 个     | 必须删除所有未使用的变量              |
| ESLint 错误 | 0 个     | 必须符合 mpx-eslint-prettier-rules.md |
### 3. CSS 样式评估
| 指标     | 阈值     | 处理建议                   |
| -------- | -------- | -------------------------- |
| CSS 行数 | ≤ 100 行 | 可保留在 mpx 文件内        |
| CSS 行数 | > 100 行 | 抽离为独立 .css/.styl 文件 |
### 4. 逻辑函数数量评估
| 指标         | 阈值    | 处理建议                               |
| ------------ | ------- | -------------------------------------- |
| methods 函数 | ≤ 10 个 | 可接受                                 |
| methods 函数 | > 10 个 | 建议抽离到 composables 或 helper/logic |
### 4.5 重复代码评估（去重优先）
**很多 mpx 文件的核心问题不是"太长"，而是"重复"。** 在评估行数前，先识别重复。
| 指标 | 阈值 | 处理建议 |
| ---- | ---- | -------- |
| 同目录存在 `xxx.mpx` 与 `xxx-round.mpx` / `xxx-intl.mpx` 等变体 | — | 必查脚本/模板/样式重复度 |
| 两文件 `<script>` 重复度 | > 70% | 抽共享 mixin / composable，文件仅保留差异 |
| 两文件唯一差异是 `usingComponents` 或个别分支 | — | 收敛为薄壳 + 共享逻辑 |
**去重检测命令：**
```bash
# 对比两个变体文件的脚本差异行数
diff <(sed -n '/<script>/,/<\/script>/p' a.mpx) \
     <(sed -n '/<script>/,/<\/script>/p' a-round.mpx) | grep -c '^[<>]'
# 查找同目录的潜在变体（round / intl / new 等后缀）
ls components/ | grep -iE '(-round|-intl|-new|-copy|2)\.mpx$'
```
> 去重通常比拆分**风险更低、收益更高**：先合并重复，再评估剩余行数是否仍超阈值。
### 5. Mixins 复杂度评估（DDD 视角）
**Mixins 分析维度：**
- Mixin 文件行数 > 500 行 → 建议拆解为独立 composable
- Mixin 中包含多个业务域的逻辑 → 按业务域拆分
- Mixin 之间存在依赖关系 → 分析依赖图，提取公共部分
**Mixin 拆解策略：**
```
Mixin 文件分析
  │
  ├─► 识别业务域（如：航班搜索、筛选排序、弹窗控制）
  │     │
  │     └─► 每个业务域 → 独立 composable
  │
  └─► 提取共享工具函数 → helper/logic/
```
**Mixins 拆解示例：**
```typescript
// ❌ 之前：一个大 Mixin 包含多个业务域
mixins: [
require('./list-mixin/filter-mixin'), // 319行 - 筛选 + 排序
require('./list-mixin/request-mixin'), // 964行 - 请求 + 缓存 + 列表处理
require('./list-mixin/popup-mixin') // 134行 - 弹窗状态
]
// ✅ 重构后：按业务域拆分为独立 composable
// composables/useFilter.ts      → 筛选逻辑
// composables/useSort.ts       → 排序逻辑
// composables/useRequest.ts    → 请求与缓存
// composables/usePopup.ts      → 弹窗状态
// composables/useExposure.ts   → 曝光上报
```
### 6. Data 属性 DDD 分组策略
**按业务层级分组：**
```typescript
// ========== Domain Layer（领域层） ==========
// 核心业务实体和聚合根相关的数据
data: {
// 航班聚合
flightList: [],           // 航班列表
goFlightList: [],         // 去程航班
backFlightList: [],       // 返程航班
connectingFlightList: [], // 中转航班
// 筛选聚合
goFilterOptionsOrg: {},   // 原始筛选项
goFinalFilter: {},        // 最终筛选项
// 排序聚合
goSortTexts: [],          // 排序文本
sortTargetFromPopup: null,// 弹窗中的排序目标
// 时间聚合
chosed: 0,                // 当前选中日期
minDate: 0,               // 最小日期
maxDate: 0,               // 最大日期
}
// ========== Application Layer（应用层） ==========
// 用例编排相关的数据
data: {
// 列表加载状态
loading: true,
showPopup: false,
showSortPopup: false,
// 用户交互状态
flightType: 1,            // 航班类型（单程/往返）
travelType: 0,            // 旅行类型（因公/因私）
// 弹窗控制
showCloseTimeTip: false,
showDiscountDescriptionPopup: false,
showCarbonPop: false,
}
// ========== Infrastructure Layer（基础设施层） ==========
// 外部服务、存储、第三方集成相关的数据
data: {
// 外部服务token
rtm_token: '',
cbt_token: '',
// 缓存相关
goTsListData: null,
goListCacheTsDataMap: {},
// 系统信息
systemInfo: {},
isGuest: false,
}
```
**Data 属性命名规范：**
- 使用 camelCase 命名
- 布尔类型添加 `is`、`has`、`should` 前缀
- 列表类型使用复数名词或后缀 `List`
- 避免使用缩写（除通用缩写如 `id`、`ts`、`dt`）
---
## Composition API 组合式写法（官方推荐）
**MPX 官方组合式 API 参考：** https://mpxjs.cn/guide/composition-api/composition-api.html
### 核心原则
1. **使用 `ref()`/`reactive` 定义响应式状态**，不依赖 mixins 或 proxy
2. **使用 `computed` 定义计算属性
3. **使用 `watch`/`watchEffect` 处理副作用
4. **Composables 返回结构化对象**，不使用 `this` 或 `proxy`
5. **完全舍弃 mixins**，所有状态管理在 composables 中完成
### 正确示例（纯 Composition API）
```typescript
// ✅ 使用 ref/reactive 定义响应式状态
import { ref, reactive, computed } from '@mpxjs/core'
export function useFilter() {
// 响应式状态
const filterOptions = reactive({
cabinType: '',
departureTime: []
  })
const isActive = computed(() => {
return filterOptions.cabinType !== '' || filterOptions.departureTime.length > 0
  })
// 方法直接操作内部状态
const applyFilter = (options) => {
Object.assign(filterOptions, options)
  }
return {
    filterOptions,
    isActive,
    applyFilter
  }
}
```
### 错误示例（避免 proxy/this）
```typescript
// ❌ 错误：使用 proxy 访问组件上下文
export function useFilter() {
const { proxy } = getCurrentInstance()
  proxy.setFilter({ filter: options }) // 不要这样做
}
// ❌ 错误：在 composable 内部使用 this
export function usePopup() {
this.showPopup = false // 不要这样做
}
```
### Composables 模式（无 proxy/this）
```typescript
// ✅ 正确的 composable 模式：所有状态在 composable 内部管理
export function usePopup() {
// 使用 ref/reactive 定义内部状态
const showPopup = ref(false)
const showSortPopup = ref(false)
// 方法直接操作内部状态
const openFilter = () => {
    showPopup.value = true
  }
const closeFilter = () => {
    showPopup.value = false
  }
// 返回响应式引用
return {
    showPopup,
    showSortPopup,
    openFilter,
    closeFilter
  }
}
```
### 在 MPX 页面中使用 Composition API
```typescript
import { useFilter } from './composables/useFilter'
import { usePopup } from './composables/usePopup'
import { store } from '@/store'
createPage({
setup() {
// 初始化 composables
const { filterOptions, applyFilter } = useFilter()
const { showPopup, openFilter, closeFilter } = usePopup()
// 直接在模板中使用（模板会自动解包 ref）
return {
      filterOptions,
      showPopup,
      applyFilter,
      openFilter,
      closeFilter
    }
  },
data: {
// 这里可以放非响应式的常量数据
flightType: 1
  }
})
```
### 响应式数据解包
在模板中，`ref` 会自动解包：
```xml
<!-- ref 自动解包，不需要 .value -->
<es-popup show="{{showPopup}}" />
```
### 组件间状态共享
使用 store 或 provide/inject：
```typescript
// 通过 store 共享状态
import { store } from '@/store'
export function useFlight() {
return {
flightList: computed(() => store.state.flightList.flightList)
  }
}
```
---
## 重构策略选择
### 策略 A：组合式 TypeScript 全面重构
**适用场景：**
- 新建页面/组件，无历史包袱
- 逻辑复杂，需要良好的类型支持
- 团队对 Composition API 熟悉
### 策略 B：渐进式重构（Options API + setup）
**适用场景：**
- 已有页面，保持稳定迭代
- 需要逐步迁移，降低风险
- 混合使用场景
### 策略 C：Mixin 拆解 + Composable 提取
**适用场景：**
- 文件行数 > 1200 行
- Mixin 文件 > 500 行
- Data 属性 > 50 个
- 多个业务域混杂
### 询问用户的问题
```
🔍 重构评估结果：
- 文件行数：XXX
- CSS 行数：XXX
- methods 函数：XXX 个
- Mixins 数量：X 个（总行数 XXX）
- Data 属性数量：XX 个
- 预估注释占比：X%
❓ 请选择重构策略：
[A] 组合式 TypeScript 全面重构
[B] 渐进式重构（Options API + setup）
[C] Mixin 拆解 + Composable 提取（推荐大文件）
[D] 仅优化注释和命名
[E] 抽离 CSS 样式
[F] 抽离业务逻辑
[G] 按 DDD 分组 Data 属性
[H] 全部执行
```
---
## 重构执行流程
> **执行顺序：链路分析 → 文件评估 → 策略选择 → 步骤切分 → 执行 → 预检。**
> 不要在未理清调用链前直接动手——重构 mpx 组件几乎总会牵动父页面、子组件、mixin 与 store。
### Step 0: 链路分析（动手前必做）
在评估单个文件前，先画出目标文件所处的**完整调用链与数据流**，识别耦合点与重复点。
**分析维度：**
1. **调用方（上游）**：谁 import / 注册 / 渲染了该组件？通过哪些 props 传入、监听哪些事件？
2. **被调用方（下游）**：该组件依赖哪些子组件、mixin、store action / mutation / getter？
3. **数据流向**：props 自上而下、`triggerEvent` 事件自下而上、store 状态的读写路径。
4. **耦合点**：跨文件的 `wx:ref` 调用契约、同名包装方法（组件 method 与 store action 重名）、大体量数据透传。
5. **重复点**：是否存在单程/往返、国内/国际等变体文件互为副本（见 4.5）。
**链路分析命令：**
```bash
# 找调用方（谁引用了目标组件）
grep -rn "目标组件名" src/pages --include=*.mpx --include=*.js
# 找下游依赖：store / mixin / 子组件
grep -nE "mapState|mapActions|mapMutations|mapGetters|usingComponents|require\(" 目标文件
# 找事件契约（triggerEvent 抛出 vs bind: 监听）
grep -n "triggerEvent" 目标文件
```
**产出：** 一段链路图（四层调用链 + 事件回流）+ 耦合点/重复点清单。
这是后续"步骤切分"的依据——**自底向上、每阶段可独立回归**。
### Step 1: 分析文件
```bash
# 获取文件行数
wc -l <file.mpx>
# 统计注释行数
grep -c "^\s*//" <file.mpx>
grep -c "^\s*/\*" <file.mpx>
# 分析 Mixin 行数
wc -l <mixin-dir>/*.js
# 分析 data 属性数量
grep -E "^\s+\w+:" <file.mpx> | wc -l
# 检查未使用变量（使用 ESLint）
npx eslint --config .eslintrc.js --no-eslintrc --no-cache src/pages/xxx/ 2>&1; echo "Exit code: $?"
```
### Step 2: 预检清单
**必须通过以下所有检查项方可输出：**
| 检查项         | 标准     | 不通过处理                    |
| -------------- | -------- | ----------------------------- |
| 文件行数       | ≤ 800 行 | 继续拆分组件或提取 composable |
| 注释占比       | ≥ 10%    | 补充注释                      |
| 未使用变量     | = 0      | 删除未使用变量                |
| ESLint 错误    | = 0      | 修复错误（Exit code: 0）      |
| 无 console.log | -        | 删除所有 console.log          |
| 无 debugger    | -        | 删除所有 debugger             |
| 无 TODO 注释   | -        | 删除或实现 TODO               |
**ESLint 检查命令（项目专用）：**
```bash
# 检查目录或文件（项目使用 .eslintrc.js 配置）
npx eslint --config .eslintrc.js --no-eslintrc --no-cache src/pages/xxx/ 2>&1; echo "Exit code: $?"
# 期望结果：Exit code: 0，无 error 输出
# 警告（warning）可接受，错误（error）必须修复
```
### Step 3: 执行重构
**1. 删除未使用变量**
- 删除声明但从未使用的 `const`/`let`/`var`
- 删除导入但未使用的模块
- 删除注释掉的代码块
**2. Mixin 拆解流程**
```
1. 识别 Mixin 中的业务域
   - filter-mixin.js (319行) → useFilter, useSort
   - request-mixin.js (964行) → useRequest, useCache, useList
   - popup-mixin.js (134行) → usePopup
2. 创建 composables/ 目录结构
   src/pages/xxx/composables/
   ├── useFilter.ts
   ├── useSort.ts
   ├── useRequest.ts
   ├── useCache.ts
   ├── usePopup.ts
   └── index.ts
3. 提取逻辑到 composable
   - 状态（data/ref）→ composable
   - 计算属性（computed）→ composable
   - 方法（methods）→ composable
4. 在页面中组合使用
   const filterState = useFilter()
   const requestState = useRequest()
```
**3. Data 属性 DDD 分组**
```
1. 识别数据所属业务域
   - 航班数据 → flightList, connectingFlightList
   - 筛选数据 → filterOptionsOrg, finalFilter
   - 弹窗数据 → showPopup, showSortPopup
2. 按层级分组
   - Domain Layer: 核心业务数据
   - Application Layer: 用例状态
   - Infrastructure Layer: 外部依赖
3. 添加分组注释
   // ========== Domain Layer ==========
   data: { ... }
```
**4. 补充注释**
- 每个函数添加 JSDoc 注释（包含 @description）
- 复杂逻辑添加行内注释说明步骤
- 变量声明添加说明注释
- Data 属性分组添加层级注释
**5. 符合 ESLint 规范**
```javascript
// ❌ 禁止：连续赋值
foo = bar = 1
// ❌ 禁止：使用 == 比较
if (a == null)
// ❌ 禁止：函数参数超过 3 个
function foo(a, b, c, d) {}
// ❌ 禁止：嵌套三元
const a = b ? c : d ? e : f
// ❌ 禁止：空函数
function empty() {}
// ❌ 禁止：修改 props
this.props.foo = 'bar'
// ❌ 禁止：console.log
console.log('debug')
// ❌ 禁止：未使用的变量
const unused = 1
```
**6. 命名规范**
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 组件标签：kebab-case
- 文件名：kebab-case 或 camelCase
- Composables：use + 业务域（如 useFlight, useFilter）
**7. CSS 抽离（> 100 行时）**
```stylus
/* index.styl */
.list-header
  background: transparent
```
**8. 逻辑抽离示例**
```typescript
/**
 * 格式化航班时间
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的时间字符串 (HH:mm)
 */
export function formatFlightTime(timestamp: number): string {
const date = new Date(timestamp)
const hours = String(date.getHours()).padStart(2, '0')
const minutes = String(date.getMinutes()).padStart(2, '0')
return `${hours}:${minutes}`
}
```
---
## 输出规范
### 文件命名
- 组件文件：kebab-case（如 `flight-card.mpx`）
- 样式文件：`index.css` / `index.styl`
- 类型定义：PascalCase（如 `FlightCard.ts`）
- Composable 文件：use + 业务域（如 `useFlightList.ts`）
### 目录结构
```
xxx/ 功能
├── index.mpx              # 页面入口（≤ 800 行）
├── index.css              # 抽离的样式（如需）
├── components/            # 组件目录
│   ├── flight-card/
│   │   ├── index.mpx
│   │   └── index.styl
│   └── price-badge/
├── composables/           # 组合函数（按业务域拆分）
│   ├── useFilter.ts       # 筛选逻辑
│   ├── useSort.ts         # 排序逻辑
│   ├── useRequest.ts      # 请求逻辑
│   ├── usePopup.ts        # 弹窗状态
│   └── index.ts           # 导出入口
├── helper/
│   ├── logic/             # 业务纯函数
│   │   ├── exposure.ts    # 曝光相关
│   │   ├── time.ts       # 时间处理
│   │   └── storage.ts    # 存储相关
│   └── constant/          # 业务常量
└── types/                 # 类型定义
    └── flight.ts
```
### Composable 设计原则
**单一职责：**
```typescript
// ✅ 一个 composable 只负责一个业务域
// useFilter.ts - 只负责筛选逻辑
export function useFilter() {
const filterOptionsOrg = ref({})
const finalFilter = ref({})
const setFilter = (options) => { ... }
const clearFilter = () => { ... }
return { filterOptionsOrg, finalFilter, setFilter, clearFilter }
}
// ❌ 不要在一个 composable 中混合多个业务域
// bad: useFlightFilterSortPopup.ts
```
**依赖注入：**
```typescript
// ✅ 通过参数或 store 注入依赖
export function useRequest(params: {
getFlightList: () => Promise<FlightData[]>
setCache: (data: FlightData[]) => void
}) {
// ...
}
```
**返回值结构化：**
```typescript
// ✅ 返回命名的属性对象
export function useFilter() {
// ...
return {
// 状态
    filterOptionsOrg,
    finalFilter,
// 方法
    applyFilter,
    resetFilter,
// 布尔值
isFilterActive: computed(() => ...),
  }
}
```
### 代码注释规范
**Composable 注释：**
```typescript
/**
 * 航班筛选 composable
 * @description 管理航班列表的筛选逻辑，包括舱位、时段、航空公司等筛选条件
 * @requires useStore - 需要访问 flightList store
 */
export function useFilter() {
// ...
}
```
**函数注释（必须包含 @description）：**
```typescript
/**
 * 处理航班卡片点击事件
 * @param flight - 航班信息对象
 * @param index - 卡片在列表中的索引
 * @description 用于导航到航班详情页，同时记录埋点信息
 */
function handleFlightTap(flight: FlightInfo, index: number): void {
// ...
}
```
**变量注释：**
```typescript
// 航班列表数据，从 store 获取
const flightList = computed(() => store.state.flightList)
// 当前选中的航班索引，用于高亮显示
const selectedIndex = ref<number>(-1)
```
**Data 分组注释：**
```typescript
data: {
// ========== Domain Layer（领域层）==========
// 航班聚合根相关数据
flightList: [],
goFlightList: [],
// ========== Application Layer（应用层）==========
// 用户交互状态
loading: true,
showPopup: false,
// ========== Infrastructure Layer（基础设施层）==========
// 外部服务集成
rtm_token: '',
}
```
**注释占比计算：**
```
注释行数 = // 单行注释 + /* */ 多行注释行数 + JSDoc 注释行数
注释占比 = 注释行数 / 总行数 * 100%
```
---
## ESLint & Prettier 规范要点
> 详细规则请参考：[docs/spec/mpx-eslint-prettier-rules.md](docs/spec/mpx-eslint-prettier-rules.md)
### 变量与赋值
- `prefer-const`：申明了后不再修改的变量必须使用 const
- `no-unused-vars`：已定义的变量必须使用
- `no-redeclare`：禁止重复定义变量
- 禁止连续赋值：`foo = bar = 1`
### 运算符与比较
- `eqeqeq`：必须使用 `===` 或 `!==`
- `use-isnan`：必须使用 `isNaN(foo)` 而不是 `foo === NaN`
### 函数与参数
- `max-params`：函数的参数禁止超过 3 个
- `max-depth`：代码块嵌套的深度禁止超过 5 层
- `no-empty-function`：不允许有空函数
### 表达式与语句
- `no-else-return`：禁止在 return 之后还有代码
- `prefer-promise-reject-errors`：Promise 的 reject 中必须传入 Error 对象
### 其他安全规则
- `no-eval`：禁止使用 eval
- `no-console`：禁止使用 console（生产环境）
- `no-set-timeout`：禁止在 setTimeout 中传入字符串
### 命名规范
| 类型        | 规范             | 示例                            |
| ----------- | ---------------- | ------------------------------- |
| 变量/函数   | camelCase        | `flightList`, `getFlightInfo()` |
| 常量        | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`               |
| 组件标签    | kebab-case       | `<flight-card>`                 |
| 类名/类型   | PascalCase       | `FlightCardData`                |
| Props       | camelCase        | `flightType`, `isSelected`      |
| Composables | use + PascalCase | `useFilter`, `useFlightList`    |
---
## 星河小程序兼容性
### 注意事项
- `id` 作为业务字段名可能与星河关键字冲突，避免使用
- URL 参数通过 `this.$mpxRoute.query` 读取
- 避免使用 `setState(undefined)`
- 不要在模板中使用可选链（`?.`）、一元 `+` 转换
- 模板表达式保持简单
### 事件处理
- 嵌套可交互 UI 使用 `catchtap` 阻止冒泡
- 可复用组件内部使用 `catchtap`，通过 `triggerEvent` 抛出语义化事件
### 星河小程序兼容性检查清单
> 完整规则请参考：`.claude/rules/mpx-compat.md`
**样式兼容：**
| 检查项 | 错误写法 | 正确写法 |
|--------|----------|----------|
| 颜色缩写 | `#333` | `#333333` |
| wx-前缀 | `wx-class` | `filter-item` |
| 尾随逗号 | `marginLeft: '1px',` | `marginLeft: '1px'` |
| 对象key引号 | `{'active': cond}` | `{active: cond}` |
**模板语法：**
| 检查项 | 错误写法 | 正确写法 |
|--------|----------|----------|
| 函数调用 | `{{noneSelect(x)}}` | 在 computed 中计算好再绑定 |
| 可选链 | `{{obj?.name}}` | 在 computed 中处理 |
| includes/indexOf | `{{list.includes(x)}}` | 在 computed 中处理 |
| 模板字符串 | `` `prefix-${x}` `` | 先拼接再绑定 |
| 一元+转换 | `{{+value}}` | 在 computed 中处理 |
| text嵌套 | `<text><es-icon/></text>` | 改用 `<view>` |
**组件兼容：**
| 检查项 | 错误写法 | 正确写法 |
|--------|----------|----------|
| 组件命名 | `flightCard` | `flight-card`（kebab-case） |
| props function | 在 methods 中定义并透传 | 在 data 中挂载引用 |
| picker value | 不绑定 value | 必须绑定 value |
| es-popup 嵌套 | 放在 es-scroll-layout 中 | 单独使用 |
| swiper 在 popup | 数据更新后无法滚动 | 加 wx:if 控制重建 |
**生命周期与状态：**
| 检查项 | 处理方式 |
|--------|----------|
| created 参数 | URL 参数用 `this.$mpxRoute.query` |
| query 判空 | `const { from } = this.$mpxRoute.query \|\| {}` |
| watch 全局性 | 避免跨页面状态污染 |
| mpxPageStatus | 弹窗状态判断 |
| setState undefined | 使用符合场景的默认值 |
**路由与事件：**
| 检查项 | 错误写法 | 正确写法 |
|--------|----------|----------|
| 路由替换 | `$mpxRouter.replace` | `$mpxRouter.redirect` |
| es-icon 在 es-cell | catchtap 无法阻止冒泡 | 增加状态开关区分 |
---
## 重构决策树
```
输入文件
  │
  ├─► 文件行数 > 800 ?
  │     │
  │     ├─► YES → 进入深度评估
  │     │     │
  │     │     ├─► CSS 行数 > 100 ? → 抽离样式到 index.css
  │     │     │
  │     │     ├─► methods 函数 > 10 ? → 建议抽离到 composable
  │     │     │
  │     │     ├─► Mixin 文件 > 500 行 ? → 分析并拆解为独立 composable
  │     │     │
  │     │     ├─► Data 属性 > 50 个 ? → 按 DDD 分组
  │     │     │
  │     │     └─► 逻辑复杂度高 ? → 询问用户选择策略
  │     │
  │     └─► NO → 检查代码质量
  │
  ├─► Mixin 分析
  │     │
  │     ├─► 识别业务域边界
  │     │
  │     ├─► 提取共享工具函数 → helper/logic/
  │     │
  │     └─► 每个业务域 → 独立 composable
  │
  ├─► Data 属性分组
  │     │
  │     ├─► Domain Layer（领域层）→ 核心业务实体
  │     │
  │     ├─► Application Layer（应用层）→ 用例状态
  │     │
  │     └─► Infrastructure Layer（基础设施层）→ 外部依赖
  │
  ├─► 预检清单检查
  │     ├─► 注释占比 < 10% ? → 补充注释
  │     ├─► 存在未使用变量 ? → 删除变量
  │     ├─► 存在 ESLint 错误 ? → 修复错误（Exit code: 0）
  │     └─► 存在 console.log ? → 删除
│     └─► 存在 TODO 注释 ? → 删除或实现
  │
  └─► 输出评估报告 + 重构建议
```
---
## 示例
**示例 1：简单文件（< 800 行）**
```
输入：/refactor-mpx src/pages/search/components/close-time-tip.mpx
评估：
  - 行数：600
  - 注释占比：8%（需补充到 10%）
  - 未使用变量：2 个
执行：
  1. 删除未使用变量
  2. 补充函数注释
  3. 验证 ESLint 通过
输出：增强注释后的完整代码（注释占比 ≥ 10%）
```
**示例 2：复杂文件（> 1200 行）+ Mixin 拆解**
```
输入：/refactor-mpx src/pages/search/list.mpx
评估：
  - 行数：1712
  - 注释占比：5%
  - 未使用变量：8 个
  - Mixins：4 个（总行数 1441）
    - filter-mixin.js: 319行
    - request-mixin.js: 964行
    - popup-mixin.js: 134行
  - Data 属性：92 个
执行：
  1. 拆分组件（header/footer/popups）
  2. 抽离 CSS 到 index.styl
  3. 拆解 Mixins：
     - useFilter.ts (来自 filter-mixin)
     - useSort.ts (来自 filter-mixin)
     - useRequest.ts (来自 request-mixin)
     - usePopup.ts (来自 popup-mixin)
  4. 按 DDD 分组 Data 属性
  5. 删除所有未使用变量
  6. 补充注释至 10%+
  7. 验证 ESLint 通过
输出：
  - list.mpx: ~750 行
  - index.css: ~140 行
  - composables/useFilter.ts: ~120 行
  - composables/useRequest.ts: ~400 行
  - composables/usePopup.ts: ~80 行
  - helper/logic/exposure.ts: ~100 行
  - helper/logic/time.ts: ~90 行
  - 注释占比：12%
```
**示例 3：Mixin 拆解详细流程**
```
原始 Mixin 结构：
├── list-mixin/
│   ├── filter-mixin.js    (319行) - 筛选 + 排序
│   ├── request-mixin.js   (964行) - 请求 + 缓存 + 列表处理
│   └── popup-mixin.js     (134行) - 弹窗状态
拆解后 Composable 结构：
├── composables/
│   ├── useFilter.ts       (提取筛选相关状态和方法)
│   │   ├── filterOptionsOrg
│   │   ├── finalFilter
│   │   ├── applyFilter()
│   │   └── resetFilter()
│   │
│   ├── useSort.ts         (提取排序相关状态和方法)
│   │   ├── sortTexts
│   │   ├── sortTarget
│   │   ├── tapSortItem()
│   │   └── updateSort()
│   │
│   ├── useRequest.ts      (提取请求相关状态和方法)
│   │   ├── loading
│   │   ├── flightList
│   │   ├── fetchFlightList()
│   │   ├── handleCache()
│   │   └── updateListByCachedData()
│   │
│   ├── usePopup.ts        (提取弹窗状态)
│   │   ├── showPopup
│   │   ├── showSortPopup
│   │   ├── openFilter()
│   │   └── closeFilter()
│   │
│   └── index.ts           (统一导出)
```
**示例 4：search-refactor 平铺目录结构**
重构输出目录采用平铺结构（直接放在 xxx/ 下，不嵌套 src/pages/，无 render 目录）：
```
search-refactor/                    # 重构输出目录（平铺）
├── index.mpx                       # 页面入口（≤800行）
├── index.styl                      # 样式文件（stylus格式）
├── components/                     # 子组件
│   ├── list-header.mpx             # 页头组件
│   ├── list-footer.mpx             # 页脚排序栏
│   ├── list-popups.mpx             # 弹窗集合
│   └── list-body.mpx               # 列表主体
├── composables/                    # 组合式函数
│   ├── useFlight.ts                # 航班数据
│   ├── useFilter.ts                # 筛选逻辑
│   ├── useSort.ts                  # 排序逻辑
│   ├── usePopup.ts                 # 弹窗状态
│   ├── useRequest.ts               # 请求与缓存
│   ├── useNavigation.ts            # 导航跳转
│   ├── useAgent.ts                 # Agent 逻辑
│   └── index.ts                    # 统一导出
└── helper/
    ├── logic/                      # 业务纯函数
    │   ├── exposure.ts              # 曝光相关
    │   └── time.ts                 # 时间处理
    └── constant/
        └── index.ts                # 业务常量
```
注意：
- 样式文件使用 `index.styl`（stylus 格式），在 mpx 文件中通过 `@import './index.styl'` 引入
- 组件内部使用旧 mixins 保持兼容性，外部逐步迁移到新 composables
---
## 文档版本
| 版本  | 日期       | 更新内容                                                      |
| ----- | ---------- | ------------------------------------------------------------- |
| 1.0.0 | 2026-05-13 | 初始版本                                                      |
| 2.0.0 | 2026-05-26 | 增加 CSS 抽离规则、函数数量评估、策略选择                     |
| 3.0.0 | 2026-05-26 | 增加未使用变量删除、ESLint 规范、800 行限制、10% 注释占比要求 |
| 4.0.0 | 2026-05-27 | 增加 Mixin 拆解策略、Data 属性 DDD 分组、Composable 设计原则  |
| 5.0.0 | 2026-05-28 | 增加 search-refactor 平铺目录结构示例、Composition API 完整示例 |
| 6.0.0 | 2026-06-02 | 增加项目 ESLint 检查命令、无 console.log/TODO 注释要求、Exit code: 0 |
| 7.0.0 | 2026-06-03 | 增加 Step 0 链路分析（动手前必做）、4.5 重复代码评估（去重优先）、明确执行顺序 |
**更新日期**: 2026-06-03
