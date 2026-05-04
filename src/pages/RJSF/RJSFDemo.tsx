import React, { useState } from 'react';
import { Form } from '@rjsf/antd';
import { Card, Button, Typography, Space, Alert, Divider, ConfigProvider } from 'antd';
import validator from '@rjsf/validator-ajv8';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

const registrationSchema = {
  title: '用户注册',
  description: '创建新账户',
  type: 'object',
  required: ['username', 'email', 'password', 'confirmPassword', 'terms'],
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$',
      description: '3-20个字符，只能包含字母、数字和下划线',
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email',
      description: '请输入有效的邮箱地址',
    },
    password: {
      type: 'string',
      title: '密码',
      minLength: 6,
      description: '至少6个字符',
    },
    confirmPassword: {
      type: 'string',
      title: '确认密码',
      minLength: 6,
      description: '请再次输入密码',
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 13,
      maximum: 100,
      default: 18,
      description: '必须年满13岁',
    },
    bio: {
      type: 'string',
      title: '个人简介',
      maxLength: 200,
      description: '简单介绍一下自己（可选）',
    },
    interests: {
      type: 'array',
      title: '兴趣爱好',
      items: {
        type: 'string',
        enum: ['technology', 'sports', 'music', 'reading', 'travel', 'cooking'],
        enumNames: ['技术', '运动', '音乐', '阅读', '旅行', '烹饪'],
      },
      uniqueItems: true,
      description: '选择您的兴趣爱好（可多选）',
    },
    terms: {
      type: 'boolean',
      title: '我已阅读并同意服务条款',
      default: false,
    },
  },
};

const registrationUiSchema = {
  password: {
    'ui:widget': 'password',
    'ui:autofocus': true,
  },
  confirmPassword: {
    'ui:widget': 'password',
  },
  bio: {
    'ui:widget': 'textarea',
    'ui:options': {
      rows: 3,
    },
  },
  interests: {
    'ui:widget': 'checkboxes',
  },
  terms: {
    'ui:widget': 'checkbox',
    'ui:help': (
      <span>
        请阅读我们的{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert('服务条款内容：\n1. 遵守法律法规\n2. 保护用户隐私\n3. 合理使用服务');
          }}
          style={{ color: '#1890ff' }}
        >
          服务条款
        </a>
      </span>
    ),
  },
};

const initialFormData = {
  age: 18,
};

const validate = (formData: Record<string, unknown>, errors: Record<string, { addError: (msg: string) => void }>) => {
  if (
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  ) {
    errors.confirmPassword.addError('两次输入的密码不一致');
  }

  if (formData.email && !String(formData.email).includes('@')) {
    errors.email.addError('邮箱必须包含@符号');
  }

  if (formData.interests && (formData.interests as unknown[]).length > 3) {
    errors.interests.addError('最多选择3个兴趣爱好');
  }

  return errors;
};

export function RJSFDemo() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = ({ formData: submitted }: { formData: Record<string, unknown> }) => {
    console.log('表单提交数据:', submitted);

    setSubmitError(null);
    setSubmitSuccess(false);

    setTimeout(() => {
      if (submitted.username === 'error') {
        setSubmitError('用户名已被占用，请选择其他用户名');
      } else {
        setSubmitSuccess(true);
        setFormData(initialFormData);

        console.log('数据已成功提交到服务器:', {
          ...submitted,
          confirmPassword: undefined,
        });
      }
    }, 1000);
  };

  const handleChange = ({ formData: newData }: { formData: Record<string, unknown> }) => {
    setFormData(newData);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card
            title={
              <Space>
                <span>🚀</span>
                <Title level={2} style={{ margin: 0 }}>
                  JSON Schema & react-jsonschema-form (RJSF) 深度解析
                </Title>
              </Space>
            }
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Text type="secondary">
              使用 react-jsonschema-form + Ant Design 快速构建专业表单
            </Text>
          </Card>
          {/* 概念卡片区 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card size="small" title="📖 JSON Schema" style={{ borderRadius: 8 }}>
              <div className="space-y-2 text-sm">
                <div>
                  <Text strong>定义：</Text>
                  <Text type="secondary">基于 JSON 的声明式数据描述语言，用于描述和验证 JSON 数据结构</Text>
                </div>
                <div>
                  <Text strong>核心关键字：</Text>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['type', 'properties', 'required', 'minimum', 'maximum', 'minLength', 'pattern', 'format', 'enum'].map(k => (
                      <span key={k} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <Text strong>示例：</Text>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{`{ "type": "string", "minLength": 6 }`}</pre>
                </div>
              </div>
            </Card>

            <Card size="small" title="🧩 react-jsonschema-form (RJSF)" style={{ borderRadius: 8 }}>
              <div className="space-y-2 text-sm">
                <div>
                  <Text strong>定义：</Text>
                  <Text type="secondary">React 库，通过 JSON Schema 自动生成表单 UI 并处理验证</Text>
                </div>
                <div>
                  <Text strong>三个核心概念：</Text>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                    <li><Text code>schema</Text> — 表单数据结构定义</li>
                    <li><Text code>uiSchema</Text> — UI 表现层配置</li>
                    <li><Text code>formData</Text> — 表单数据值</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card size="small" title="🏗️ 核心包结构" style={{ borderRadius: 8 }}>
              <div className="space-y-1 text-sm">
                {[
                  { pkg: '@rjsf/core', desc: '核心引擎：表单生成、验证、数据处理' },
                  { pkg: '@rjsf/antd', desc: 'Ant Design 主题包：组件映射' },
                  { pkg: '@rjsf/validator-ajv8', desc: '验证器：基于 AJV 的 JSON Schema 校验' },
                ].map(({ pkg, desc }) => (
                  <div key={pkg} className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">{pkg}</span>
                    <Text type="secondary" className="text-xs">{desc}</Text>
                  </div>
                ))}
              </div>
            </Card>

            <Card size="small" title="🔑 字段类型映射" style={{ borderRadius: 8 }}>
              <div className="space-y-1 text-sm">
                {[
                  { type: 'string', widget: 'Input', note: '文本输入' },
                  { type: 'string:email', widget: 'Input(type=email)', note: '' },
                  { type: 'string:password', widget: 'Input.Password', note: '' },
                  { type: 'integer/number', widget: 'InputNumber', note: '' },
                  { type: 'boolean', widget: 'Switch / Checkbox', note: '' },
                  { type: 'enum', widget: 'Select', note: '单选' },
                  { type: 'array', widget: 'Select(mode=multiple)', note: '多选' },
                  { type: 'string:date', widget: 'DatePicker', note: '' },
                ].map(({ type, widget, note }) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono min-w-[80px]">{type}</span>
                    <Text type="secondary" className="text-xs">→ {widget} {note}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          {/*  常用 ui:widget 映射表 */}
          <br />
          <div>
              <Text strong style={{ fontSize: 16 }}>🗺️ 常用 ui:widget 映射表</Text>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {[
                  { widget: 'textarea', schema: 'string', desc: '多行文本输入' },
                  { widget: 'password', schema: 'string', desc: '密码输入框' },
                  { widget: 'radio', schema: 'enum', desc: '单选 radio 组' },
                  { widget: 'checkbox', schema: 'boolean', desc: '复选框' },
                  { widget: 'checkboxes', schema: 'array[enum]', desc: '多选 checkbox 组' },
                  { widget: 'select', schema: 'enum', desc: '单选下拉框' },
                  { widget: 'select', schema: 'array', desc: '多选下拉框' },
                  { widget: 'updown', schema: 'number/integer', desc: '数字输入框' },
                  { widget: 'range', schema: 'number', desc: '滑动输入条' },
                  { widget: 'hidden', schema: 'any', desc: '隐藏字段' },
                  { widget: 'alt-datetime', schema: 'string:date-time', desc: '日期时间选择' },
                  { widget: 'alt-date', schema: 'string:date', desc: '日期选择器' },
                  { widget: 'color', schema: 'string', desc: '颜色选择器' },
                  { widget: 'week', schema: 'string', desc: '周选择器' },
                  { widget: 'email', schema: 'string', desc: '邮箱输入框' },
                  { widget: 'uri', schema: 'string', desc: 'URL 输入框' },
                  { widget: 'data-url', schema: 'string', desc: '文件数据 URL' },
                  { widget: 'tel', schema: 'string', desc: '电话输入框' },
                ].map(({ widget, schema, desc }) => (
                  <div key={widget + schema} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="font-mono text-xs text-purple-600 mb-1">"{widget}"</div>
                    <div className="text-xs text-gray-500 mb-1">{schema}</div>
                    <div className="text-sm text-gray-700">{desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <Text strong className="text-yellow-700">💡 uiSchema 基本语法</Text>
                <pre className="text-xs text-gray-700 mt-2">{`"ui:widget": "widgetName"              // 全局替换
"ui:widget": "textarea"              // string → 多行文本

"ui:options": {                     // 额外配置
  "rows": 4,                        // textarea 行数
  "allowClear": true,               // 显示清除按钮
  "multiple": true,                 // select 多选
  "inline": true,                   // radio 行内显示
}`}</pre>
              </div>
          </div>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              marginBottom: 24,
            }}
          >
            <Form
              schema={registrationSchema}
              uiSchema={registrationUiSchema}
              formData={formData}
              validator={validator}
              onSubmit={handleSubmit}
              onChange={handleChange}
              validate={validate}
              onError={(errors) => console.log('验证错误:', errors)}
              liveValidate
              noHtml5Validate
              showErrorList="top"
            >
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'center',
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    width: 160,
                    height: 44,
                    fontSize: 16,
                  }}
                >
                  注册账户
                </Button>
                <Button
                  type="default"
                  onClick={handleReset}
                  size="large"
                  style={{
                    width: 160,
                    height: 44,
                    fontSize: 16,
                  }}
                >
                  重置表单
                </Button>
              </div>
            </Form>

            {submitError && (
              <Alert
                message="提交失败"
                description={submitError}
                type="error"
                showIcon
                style={{ marginTop: 24 }}
              />
            )}

            {submitSuccess && (
              <Alert
                message="注册成功！"
                description="您的账户已成功创建，欢迎使用我们的服务！"
                type="success"
                showIcon
                style={{ marginTop: 24 }}
              />
            )}
          </Card>

          <Card
            title="📊 代码实现对比"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 style={{ color: '#ff4d4f', marginBottom: 12 }}>传统方式 — 手动编写</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">{`// 传统方式：每个表单都要重复写
                  const [formData, setFormData] = useState({});
                  const [errors, setErrors] = useState({});

                  const validate = () => {
                    const errs = {};
                    if (!formData.email) {
                      errs.email = '邮箱不能为空';
                    } else if (!/@\\.com$/.test(formData.email)) {
                      errs.email = '邮箱格式不正确';
                    }
                    if (formData.password?.length < 6) {
                      errs.password = '密码至少6位';
                    }
                    // ... 重复的验证逻辑
                    setErrors(errs);
                    return Object.keys(errs).length === 0;
                  };

                  const handleSubmit = (e) => {
                    e.preventDefault();
                    if (validate()) { /* ... */ }
                  };

                  return (
                    <form onSubmit={handleSubmit}>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        status={errors.email ? 'error' : ''}
                      />
                      {errors.email && <span className="error">{errors.email}</span>}
                      <Input.Password
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        status={errors.password ? 'error' : ''}
                      />
                      {/* 每个字段都要手动写 value/onChange/status/error */}
                      <button type="submit">提交</button>
                    </form>
                  );`}
                </pre>
              </div>

              <div>
                <h3 style={{ color: '#52c41a', marginBottom: 12 }}>JSON Schema 方式 — 声明式配置</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">{`// 同样的表单，声明式配置
                  const schema = {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        title: '邮箱',
                      },
                      password: {
                        type: 'string',
                        minLength: 6,
                        title: '密码',
                      },
                    },
                  };

                  const uiSchema = {
                    email: { 'ui:widget': 'email' },
                    password: { 'ui:widget': 'password' },
                  };

                  // < 20 行代码搞定一切
                  // 自动验证、自动渲染、自动错误提示
                  return (
                    <Form
                      schema={schema}
                      uiSchema={uiSchema}
                      onSubmit={handleSubmit}
                    />
                  );`}
                </pre>
              </div>
            </div>

            <Divider />

            

            <Divider />

            <div
              style={{
                backgroundColor: '#e6f7ff',
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text strong>💡 最佳实践建议：</Text>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li>将JSON Schema定义放在单独文件中，便于复用</li>
                <li>使用TypeScript定义Schema类型，提高类型安全</li>
                <li>创建自定义组件库，统一业务组件</li>
                <li>实现表单模板系统，快速生成常用表单</li>
                <li>结合后端API，实现动态表单配置</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
}
