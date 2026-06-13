# JSON Schema 动态表单方案设计

## 一、背景与目标

### 1.1 现有问题

当前 jiazi 项目中存在大量硬编码的表单页面，例如：
- 特殊价政策配置
- 行李额度配置
- 服务包配置
- 差旅政策配置

每次新增或修改字段都需要：
1. 修改 React 组件代码
2. 添加/修改 Form.Item
3. 添加字段校验逻辑
4. 添加数据回显逻辑

**痛点**：
- 字段配置与业务代码耦合
- 难以复用相同类型的表单
- 维护成本高
- 新增字段需要前端配合

### 1.2 目标

引入 JSON Schema + 渲染器，实现：
1. **配置驱动**：通过 JSON Schema 定义表单结构，前端自动渲染
2. **动态校验**：Schema 自带校验规则，无需手写校验逻辑
3. **数据回显**：Schema 与数据自动映射
4. **类型丰富**：支持多种表单类型（输入框、选择器、日期等）

---

## 二、方案设计

### 2.1 技术选型

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| react-jsonschema-form | 功能完整、社区活跃 | 包体积较大 (~500KB) | ✅ 推荐 |
| @rjsf/core | 更轻量、可自定义主题 | 文档较少 | 备选 |
| 自研渲染器 | 完全可控 | 工作量大 | 不推荐 |

**推荐方案**：react-jsonschema-form (简称 RJSF)

### 2.2 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        JSON Schema                              │
│  {                                                              │
│    "type": "object",                                           │
│    "properties": {                                            │
│      "name": { "type": "string", "title": "名称" },            │
│      "price": { "type": "number", "title": "价格" }            │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Schema 解析器                               │
│  - 字段类型映射                                                 │
│  - 校验规则转换                                                 │
│  - 默认值处理                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RJSF 渲染器                                │
│  - Form 容器                                                    │
│  - Field 组件映射                                               │
│  - 自定义主题（Ant Design）                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Ant Design 组件                           │
│  <Input /> <Select /> <DatePicker /> <InputNumber />            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 核心模块

#### 2.3.1 Schema 定义规范

```json
{
  "type": "object",
  "title": "特殊价政策配置",
  "properties": {
    "policyName": {
      "type": "string",
      "title": "政策名称",
      "maxLength": 50,
      "ui:placeholder": "请输入政策名称"
    },
    "airline": {
      "type": "string",
      "title": "航空公司",
      "enum": ["CA", "MU", "CZ"],
      "enumNames": ["国航", "东航", "南航"]
    },
    "departureCity": {
      "type": "string",
      "title": "出发城市"
    },
    "arrivalCity": {
      "type": "string",
      "title": "到达城市"
    },
    "cabinClass": {
      "type": "string",
      "title": "舱位等级",
      "enum": ["Y", "C", "F"],
      "enumNames": ["经济舱", "商务舱", "头等舱"]
    },
    "price": {
      "type": "number",
      "title": "票价",
      "minimum": 0
    },
    "validDate": {
      "type": "string",
      "title": "有效期",
      "format": "date"
    },
    "remark": {
      "type": "string",
      "title": "备注",
      "ui:widget": "textarea"
    }
  },
  "required": ["policyName", "airline", "price"]
}
```

#### 2.3.2 UI 扩展字段

在标准 JSON Schema 基础上扩展 `ui:` 字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| ui:widget | 自定义组件 | `textarea`, `radio`, `checkbox` |
| ui:placeholder | 占位符 | `"请输入..."` |
| ui:disabled | 禁用状态 | `true` |
| ui:options | 传递给组件的额外选项 | `{ allowClear: true }` |
| ui:rules | 自定义校验规则 | `[{ required: true }]` |
| ui:hidden | 是否隐藏 | `true` |
| ui:dependencies | 依赖字段联动 | `{ "field": "type", "value": "vip" }` |

#### 2.3.3 自定义渲染器

```jsx
// components/JsonSchemaForm/index.jsx
import React from 'react';
import Form from 'rjsf-antd';
import { Widgets } from './widgets';
import { Fields } from './fields';

const JsonSchemaForm = ({
  schema,
  formData,
  onChange,
  onSubmit,
  readOnly = false,
  uiSchema = {}
}) => {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onChange={onChange}
      onSubmit={onSubmit}
      widgets={Widgets}
      fields={Fields}
      readOnly={readOnly}
    />
  );
};

export default JsonSchemaForm;
```

#### 2.3.4 Ant Design 主题适配

```jsx
// components/JsonSchemaForm/widgets/index.jsx
import React from 'react';
import { Input, Select, DatePicker, InputNumber, Radio } from 'antd';

export const Widgets = {
  // 文本输入
  TextWidget: (props) => (
    <Input
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      disabled={props.disabled}
    />
  ),

  // 文本域
  TextareaWidget: (props) => (
    <Input.TextArea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      rows={4}
    />
  ),

  // 数字输入
  NumberWidget: (props) => (
    <InputNumber
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      min={props.minimum}
      max={props.maximum}
      style={{ width: '100%' }}
    />
  ),

  // 下拉选择
  SelectWidget: (props) => (
    <Select
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
    >
      {props.options.enum.map((value, index) => (
        <Select.Option key={value} value={value}>
          {props.options.enumNames?.[index] || value}
        </Select.Option>
      ))}
    </Select>
  ),

  // 日期选择
  DateWidget: (props) => (
    <DatePicker
      value={props.value ? moment(props.value) : null}
      onChange={(date, dateString) => props.onChange(dateString)}
      style={{ width: '100%' }}
    />
  ),

  // 单选
  RadioWidget: (props) => (
    <Radio.Group
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.options.enum.map((value, index) => (
        <Radio key={value} value={value}>
          {props.options.enumNames?.[index] || value}
        </Radio>
      ))}
    </Radio.Group>
  ),
};
```

---

## 三、应用场景

### 3.1 机票政策配置

```javascript
// 服务端返回 Schema
const policySchema = {
  type: 'object',
  properties: {
    policyName: { type: 'string', title: '政策名称' },
    airlineCodes: { type: 'array', title: '航空公司', items: { type: 'string' } },
    routeType: { type: 'string', title: '航线类型', enum: ['single', 'round', 'transit'] },
    departureCities: { type: 'array', title: '出发城市' },
    arrivalCities: { type: 'array', title: '到达城市' },
    cabinClasses: { type: 'array', title: '舱位', items: { type: 'string' } },
    priceType: { type: 'string', title: '价格类型', enum: ['fixed', 'discount', 'special'] },
    price: { type: 'number', title: '票价' },
    discount: { type: 'number', title: '折扣率', minimum: 0, maximum: 100 },
    ticketIssueType: { type: 'string', title: '出票方式' },
    validFrom: { type: 'string', format: 'date', title: '生效日期' },
    validTo: { type: 'string', format: 'date', title: '失效日期' },
    remark: { type: 'string', title: '备注', ui: { widget: 'textarea' } },
  },
  required: ['policyName', 'airlineCodes', 'priceType'],
};

// 使用
<JsonSchemaForm
  schema={policySchema}
  formData={formData}
  onChange={handleChange}
  onSubmit={handleSubmit}
/>
```

### 3.2 服务包配置

```javascript
const packageSchema = {
  type: 'object',
  properties: {
    packageName: { type: 'string', title: '服务包名称' },
    serviceType: { type: 'string', title: '服务类型', enum: ['hotel', 'flight', 'train', 'car'] },
    price: { type: 'number', title: '价格' },
    includedServices: {
      type: 'array',
      title: '包含服务',
      items: { type: 'string' }
    },
    validPeriod: { type: 'number', title: '有效期(月)' },
    scope: {
      type: 'object',
      title: '适用范围',
      properties: {
        companies: { type: 'array', title: '适用企业' },
        departments: { type: 'array', title: '适用部门' },
        userLevels: { type: 'array', title: '适用人员级别' }
      }
    }
  }
};
```

---

## 四、实施计划

### 4.1 第一阶段：基础设施

1. 安装依赖
   ```bash
   npm install react-jsonschema-form @rjsf/core moment
   ```

2. 创建核心组件
   - `src/components/JsonSchemaForm/index.jsx` - 主组件
   - `src/components/JsonSchemaForm/widgets/index.jsx` - 自定义组件映射
   - `src/components/JsonSchemaForm/utils.js` - 工具函数

### 4.2 第二阶段：页面改造

选择 1-2 个典型页面进行改造：
1. 特殊价政策配置页
2. 行李额度配置页

### 4.3 第三阶段：Schema 管理

1. 服务端定义 Schema 接口
2. 前端动态加载 Schema
3. Schema 版本管理

---

## 五、预期结果

### 5.1 开发效率提升

| 场景 | 改造前 | 改造后 | 提升 |
|------|--------|--------|------|
| 新增字段 | 前后端联调 | 配置JSON即可 | 60%+ |
| 修改字段 | 改代码+测试 | 改配置+测试 | 50%+ |
| 表单复用 | 复制粘贴 | 复用组件 | 40%+ |

### 5.2 维护性提升

- 字段配置集中在 Schema，版本可追溯
- 校验规则随 Schema 自动应用
- 数据结构与表单解耦

### 5.3 用户体验

- 表单样式统一为 Ant Design 风格
- 支持条件字段联动
- 支持动态校验提示

---

## 六、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| Schema 定义复杂度高 | 学习成本 | 提供 Schema 生成工具 |
| 复杂交互场景受限 | 部分功能无法实现 | 保留自定义组件能力 |
| 初始投入较大 | 短期效率降低 | 选取高频页面优先改造 |

---

## 七、总结

通过引入 JSON Schema + react-jsonschema-form，可以实现：
1. 表单配置与代码解耦
2. 快速响应业务字段变更
3. 统一的数据校验机制
4. 良好的扩展性

**建议**：优先在机票政策、服务包等字段较多的页面试点，验证效果后再推广。