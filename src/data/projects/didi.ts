import { FlashCard, Chapter } from '@/types';

export const didiCards: FlashCard[] = [
  {
    id: 'didi-refactor-001',
    module: 'projects',
    chapterId: 'didi',
    category: '遗留系统重构',
    question: '描述一下你在滴滴"遗留系统拆解与重构"中的最难案例',
    answer: `STAR 法则回答：

S (情境)：
机票政策模块（plane_policy）是55个业务模块中最复杂的，单文件超2000行代码，运行超5年。国内/国际两套代码分离，重复开发，维护成本倍增。

T (任务)：
拆解遗留系统，统一国内/国际机票政策模块，抽象通用定价模型

A (行动)：
1. **抽象统一模型**：提取国内/国际共性为基类，差异通过配置扩展
   \`\`\`javascript
   const BASE_POLICY_FIELDS = ['policy_code', 'airline_codes', 'cabin_codes', ...];
   const DOMESTIC_EXTENSIONS = ['member_types', 'ticket_channels'];
   const INTERNATIONAL_EXTENSIONS = ['intl_airline_codes'];
   \`\`\`

2. **数据兼容处理**：老数据编辑时正确推导新字段初始值
   \`\`\`javascript
   // 新增字段，老数据为空需设置默认值
   current_policy.member_types = [];
   // 根据会员类型设置初始状态
   const onlyNewMember = memberTypes.length === 1 && memberTypes.includes("1");
   \`\`\`

3. **隐性规则显性化**：将业务规则提取为配置
   \`\`\`javascript
   const MEMBER_TYPE_LINKAGE = {
     '1': { showFields: [] },
     '2': { showFields: ['ticket_channels', 'history_booking_days'] },
   };
   \`\`\`

4. **UI嵌套优化**：提取渲染函数解决深度超标问题
   \`\`\`javascript
   const renderAirlineTypeSelect = () => (
     <Select>...</Select>
   );
   // 使用时嵌套深度从7层降到5层
   \`\`\`

5. **渐进式重构**：第一阶段统一数据模型，第二阶段合并UI组件，第三阶段移除重复代码

R (结果)：
• 国内/国际代码合并为统一模块，维护效率提升
• 隐性规则配置化，新业务只需添加配置无需改代码
• 0 线上事故（机票价格政策涉及财务，变更风险极高）`,
    tags: ['滴滴', '重构', '遗留系统', '机票政策'],
    status: 'unvisited',
    difficulty: 'hard',
    extendQuestion: '如何平衡重构进度与业务稳定性？',
  },
  {
    id: 'didi-config-001',
    module: 'projects',
    chapterId: 'didi',
    category: '配置驱动',
    question: '硬编码转配置驱动，配置 Schema 如何设计？',
    answer: `Schema 设计实践：

### 1. 枚举类配置
\`\`\`javascript
// 硬编码 → 配置化
const AIRLINE_TYPE_SCHEMA = {
  type: 'enum',
  options: [
    { value: 1, label: '国内机票' },
    { value: 2, label: '国际机票' },
  ],
  map: { 1: 'domestic', 2: 'international' }
};

// 通用渲染
const EnumSelect = ({ schema, ...props }) => (
  <Select {...props}>
    {schema.options.map(opt => (
      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
    ))}
  </Select>
);
\`\`\`

### 2. 字段级配置（JSON Schema 风格）
\`\`\`javascript
const FIELD_SCHEMA = {
  airline_code: {
    type: 'string',
    label: '航司二字码',
    required: true,
    rules: [{ pattern: /^[A-Z0-9,]+$/i, message: '格式不正确' }],
    visibility: (values) => values.airline_type === 1,
  },
  member_types: {
    type: 'multi-select',
    label: '会员类型',
    linkage: {
      showFields: ['ticket_channels', 'history_booking_days'],
      condition: (value) => !(value.length === 1 && value.includes('1')),
    }
  },
};
\`\`\`

### 3. 业务规则配置
\`\`\`javascript
// 会员类型联动规则
const MEMBER_TYPE_LINKAGE = {
  '1': { showFields: [] },  // 仅新会员，隐藏字段
  '2': { showFields: ['ticket_channels', 'history_booking_days', 'purchase_segment_count'] },
  '1,2': { showFields: ['ticket_channels', 'history_booking_days', 'purchase_segment_count'] },
};

// 票价类别交叉校验
const FARE_CATEGORY_RULES = {
  crossValidate: [{
    fields: ['fare_bases', 'match_type', 'fbc_rule'],
    validate: (values) => {
      const oldFilled = values.fare_bases && values.match_type;
      const newFilled = values.fbc_rule;
      if (!oldFilled && !newFilled) return { ok: false, msg: '需填写票价类别或通配符定义' };
      return { ok: true };
    }
  }]
};
\`\`\`

### 4. 设计原则
| 原则 | 说明 |
|------|------|
| 单一职责 | 每个 Schema 只描述一种配置类型 |
| 可扩展 | 支持新增选项、字段而不破坏现有结构 |
| 类型安全 | 配合 TypeScript 进行校验 |
| 版本管理 | 配置变更记录版本，便于回滚 |

### 5. 收益
• 新增选项无需改代码，配置即可生效
• 统一配置源，避免散落在各处
• 通过 JSON Schema 实现复杂表单的动态生成`,
    tags: ['滴滴', '配置驱动', 'Schema'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-ssd-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'SSD规范',
    question: '什么是 SSD 规范驱动模式？用通俗语言解释',
    answer: `通俗解释：

**SSD = "先定规范，再写代码"**

类比：建房子
- 传统开发：边想边盖，边改边修，工人现场决定尺寸
- SSD 模式：先画详细蓝图，按图施工，有据可依

技术类比：接口文档
- 传统：先写代码，后补文档，文档和代码可能不一致
- SSD：先用 OpenAPI 定义规范，代码自动生成或严格遵守

### 项目实践：OpenSpec 体系

\`\`\`yaml
# .openspec.yaml - 变更规范
schema: spec-driven
change_type: feature
created: 2026-03-27
\`\`\`

\`\`\`markdown
# design.md - 设计文档
## 需求背景
新增会员类型字段，支持区分新会员/老会员

## 方案设计
- member_types: 多选，会员类型
- 联动逻辑：仅选"新会员"时，隐藏后续三个字段
\`\`\`

### 解决的问题
1. **需求传递失真**：产品→设计→开发逐步失真，返工率高
2. **代码质量不一**：有人用 class，有人用 function
3. **知识传承困难**：老代码看不懂，新人上手慢
4. **AI 辅助落地难**：AI 不知道业务背景，产出质量不可控

**一句话总结**：SSD 规范驱动就是"用文档代替口头沟通，让代码有据可依，让 AI 有章可循"。`,
    tags: ['滴滴', 'SSD', 'AI工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-openspec-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'OpenSpec',
    question: 'OpenSpec 在项目中解决了什么问题？',
    answer: `解决的问题：

### 1. 需求传递失真
- 产品写 PRD，设计师出 UI，开发凭理解
- 环节越多，信息损耗越大
- **解决**：用结构化规范文档作为唯一真相源

### 2. 代码质量参差不齐
- 有人用 Class 组件，有人用 Hooks
- Redux / useState 混用，命名风格不统一
- **解决**：规范中定义代码风格和最佳实践

\`\`\`yaml
code_standards:
  - 使用函数组件 + Hooks
  - 优先使用 useState 管理组件状态
  - 组件命名使用 PascalCase
\`\`\`

### 3. 历史代码难以维护
- 代码没有文档注释，隐性业务逻辑无人知晓
- 改代码像拆炸弹，不知道会触发什么
- **解决**：每个变更都有完整的规范文档

### 4. 多人协作混乱
- 同时开发多个需求，不知道别人改了什么
- **解决**：用统一工作流串联，任务拆分，状态追踪

### 5. AI 辅助开发难落地
- AI 不了解业务背景，生成代码不符合规范
- **解决**：规范文档为 AI 提供业务上下文

\`\`\`
需求 → 规范文档 → AI 基于规范生成 → 人工 Review → 产出符合预期
\`\`\`

### 效果数据
| 指标 | 改善前 | 改善后 |
|------|--------|--------|
| 需求理解偏差 | 30% 返工 | <5% |
| 代码风格一致性 | 依赖个人 | 规范约束 |
| AI 辅助效率 | 需大量校正 | 产出精准 |`,
    tags: ['滴滴', 'OpenSpec', 'AI工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '弱网场景的路由分割和预加载具体是怎么实施的？',
    answer: `问题背景：55+ 业务模块的巨型应用，弱网环境下首次加载需下载全部代码，FCP 超 10s。

### 1. 路由分割（@loadable/component）

\`\`\`javascript
// Routes.jsx
import loadable from '@loadable/component';

const ROUTETOCOMPONENTS = {
  '/plane_policy': loadable(() => import('./pages/plane_policy'), {
    fallback: <div>Loading...</div>,
  }),
  '/trust': loadable(() => import('./pages/trust'), {
    fallback: <div>Loading...</div>,
  }),
};

// Vite 配置
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-antd': ['antd', '@ant-design/icons'],
      }
    }
  }
}
\`\`\`

### 2. 预加载策略

\`\`\`javascript
// 1. 鼠标悬停预加载
<Link to="/plane_policy/special" onMouseEnter={() => PolicySpecial.preload()}>
  特殊政策
</Link>

// 2. webpackPrefetch 空闲预加载
import(/* webpackPrefetch: true */ './pages/PolicyDetail');

// 3. 空闲时间预加载（requestIdleCallback）
requestIdleCallback(() => {
  prefetchModule('/high-priority');
});
\`\`\`

### 3. 带宽竞争处理
\`\`\`javascript
// 弱网时禁用预加载
const shouldPrefetch = () => {
  const ect = navigator.connection?.effectiveType;
  return ect === '4g' || ect === undefined;
};
\`\`\`

### 4. 关键指标
| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 首屏加载 | 10s+ | 2-3s |
| FCP | 3.5s | 1.2s |
| JS 包体积 | 2.5MB | 1.2MB |

**核心思路**：不是一次性加载所有，而是"让用户看到什么，就先加载什么"。`,
    tags: ['滴滴', '性能优化', '路由分割', '预加载'],
    status: 'unvisited',
    difficulty: 'hard',
    extendQuestion: '预加载的触发时机是什么？如何避免预加载影响当前页面加载？',
  },
  // ===== 简历版本1: 业务功能型 =====
  {
    id: 'didi-antd-001',
    module: 'projects',
    chapterId: 'didi',
    category: '技术选型',
    question: '为什么选择 Ant Design 4.x 作为 UI 组件库？它的优势是什么？',
    answer: `选择 Ant Design 的原因：

### 1. 企业级特性
- 完整的组件生态：Table、Form、Modal、Upload 等 70+ 组件
- 统一的设计语言，适合 B 端业务系统
- 丰富的 API，支持深度定制

### 2. 开发效率
- 表格表单等复杂场景开箱即用
- 支持 Form / Table 数据联动
- 国际化支持（57个模块涉及国内外业务）

### 3. 生态兼容
- 与 Redux 状态管理方案无缝集成
- 支持 TypeScript（4.x 版本）
- 活跃的社区和持续的版本维护

### 对比其他方案：
| 特性 | Ant Design | Material-UI | Element Plus |
|------|------------|--------------|--------------|
| B端适用性 | ★★★★★ | ★★★★ | ★★★★ |
| 中文文档 | ★★★★★ | ★★★ | ★★★★ |
| 滴滴内部兼容 | ★★★★★ | ★★ | ★★ |`,
    tags: ['滴滴', 'Ant Design', '技术选型'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-redux-001',
    module: 'projects',
    chapterId: 'didi',
    category: '状态管理',
    question: 'Redux + Redux Thunk 状态管理方案解决了什么问题？',
    answer: `解决的问题：

### 1. 全局状态共享
- 痛点：组件间需要传递数据 props 层层传递，兄弟组件通信困难
- 解决：统一的状态仓库 Store

\`\`\`javascript
// 组件 A                    组件 B
   ↓                        ↓
   └────────┬───────────────┘
            ↓
      Redux Store
            ↓
   ┌────────┴────────┐
状态: {           状态:
  user: {...}        menus: [...]
}
\`\`\`

### 2. 异步请求处理
- 痛点：接口请求代码散落在组件各处，重复逻辑，无法统一管理 loading/error
- 解决：Redux Thunk 封装异步 action

\`\`\`javascript
// actions/user.actions.js
export const userActions = {
  getUserInfo: () => (dispatch) => {
    dispatch({ type: 'USER_INFO_REQUEST' });
    userService.getInfo()
      .then((res) => dispatch({ type: 'USER_INFO_SUCCESS', payload: res.data }))
      .catch((err) => dispatch({ type: 'USER_INFO_FAILURE', error: err }));
  }
};

// 组件内使用
const dispatch = useDispatch();
useEffect(() => { dispatch(userActions.getUserInfo()); }, []);
\`\`\`

### 3. 服务层统一封装
\`\`\`javascript
// services/planePolicy.service.js
export const planePolicyService = {
  getSpecialPolicyList: (params) =>
    request.post('/api/flight/huidu/company/specialPolicy/queryList/v1.0', params),
  addSpecialPolicy: (data) =>
    request.post('/api/flight/huidu/company/specialPolicy/add/v1.0', data),
};
\`\`\`

### 4. 用户信息与权限
典型应用：用户登录信息、菜单权限、动态路由配置

### 方案优势
| 维度 | 说明 |
|------|------|
| 可预测 | 单一数据源，状态变化可追踪 |
| 可维护 | 逻辑集中在 action/reducer |
| 可测试 | action 和 reducer 可单独测试 |
| 可扩展 | 中间件机制可扩展功能 |`,
    tags: ['滴滴', 'Redux', '状态管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-crud-001',
    module: 'projects',
    chapterId: 'didi',
    category: '业务开发',
    question: '供应商管理模块的批量操作功能是如何实现的？',
    answer: `批量操作实现方案：

### 1. 表格多选配置
\`\`\`javascript
const rowSelection = {
  selectedRowKeys,
  onChange: (keys) => setSelectedRowKeys(keys),
  getCheckboxProps: (record) => ({
    disabled: record.status === 'locked',  // 锁定项不可选择
  }),
};

<Table rowSelection={rowSelection} columns={columns} dataSource={data} />
\`\`\`

### 2. 批量删除
\`\`\`javascript
const handleBatchDelete = async () => {
  const res = await supplierService.batchDeleteSupplier({
    ids: selectedRowKeys.join(','),  // 逗号分隔 IDs
    operator: operatorName,
  });
  if (res.errno === 0) {
    message.success('删除成功');
    loadTableData();
    setSelectedRowKeys([]);
  }
};
\`\`\`

### 3. 批量启用/禁用
\`\`\`javascript
const handleBatchEnable = async (status) => {
  await supplierService.batchUpdateStatus({
    ids: selectedRowKeys.join(','),
    status,  // 1-启用 0-禁用
    operator: operatorName,
  });
};

<Popconfirm title="确定批量启用选中的供应商吗？" onConfirm={() => handleBatchEnable(1)}>
  <Button>批量启用</Button>
</Popconfirm>
\`\`\`

### 4. 批量导入
\`\`\`javascript
const handleBatchImport = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return supplierService.importSupplier(formData)
    .then(res => message.success(\`成功导入 \${res.data.successCount} 条\`));
};

<Upload beforeUpload={(file) => {
  const isExcel = file.type === 'application/vnd.ms-excel' || ...;
  if (!isExcel) { message.error('只能上传 Excel 文件！'); return false; }
  handleBatchImport(file);
  return false;
}}>
  <Button>批量导入</Button>
</Upload>
\`\`\`

### 5. 批量导出
\`\`\`javascript
const handleBatchExport = () => {
  downloadFile('/api/supplier/export', {
    ...searchParams,
    ids: selectedRowKeys.join(','),
  });
};
\`\`\`

### 6. 错误处理与回滚
\`\`\`javascript
const handleBatchWithRollback = async () => {
  const res = await supplierService.batchOperate(params);
  if (res.data?.failedIds?.length > 0) {
    message.warning(\`成功 \${res.data.successCount} 条，失败 \${res.data.failedIds.length} 条\`);
    setSelectedRowKeys(res.data.failedIds);  // 保留选中失败的项
  }
};
\`\`\`

### 操作类型总结
| 操作 | 实现方式 | 关键点 |
|------|----------|--------|
| 批量删除 | 逗号分隔 IDs | 确认弹窗，防止误删 |
| 批量启用/禁用 | status 字段控制 | 锁定项不可操作 |
| 批量导入 | FormData + Excel | 格式校验 + 错误报告 |
| 批量导出 | form 提交 | 大数据量分页导出 |`,
    tags: ['滴滴', 'CRUD', '批量操作', 'Ant Design'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 简历版本2: 技术架构型 =====
  {
    id: 'didi-folder-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '前端目录结构规范是如何设计的？每个文件夹的职责是什么？',
    answer: `目录结构设计：

\`\`\`
src/
├── pages/                 # 页面组件（55+业务模块）
│   ├── plane_policy/      # 机票政策模块
│   │   ├── index.jsx     # 路由入口
│   │   ├── components/   # 模块级公共组件
│   │   └── page/         # 子页面
│   │       └── plane_policy_special/
│   │           ├── index.jsx
│   │           └── page/
│   │               ├── PolicySpecial.jsx
│   │               └── EditSpecialPolicy.jsx
│   ├── trust/             # 酒店托管模块（30+ 组件）
│   └── supplier/          # 供应商模块
├── components/            # 公共组件（~10个）
│   ├── DynamicForm.jsx   # 动态表单引擎
│   ├── UploadModal.jsx   # 上传弹窗
│   └── MyParagraph.jsx   # 文本省略组件
├── services/              # API 服务层（~50个 service 文件）
├── actions/               # Redux actions（部分使用）
├── reducers/              # Redux reducers
├── utils/                 # 工具函数
│   ├── request.js        # HTTP 请求封装
│   ├── browserStorage.js # 存储封装
│   └── util.js            # 通用工具
├── constants/             # 常量定义
└── Routes.jsx             # 路由配置
\`\`\`

### 文件命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 页面组件 | PascalCase | PolicySpecial.jsx |
| 列表页 | {业务名}List.jsx | SupplierList.jsx |
| 编辑页 | Edit{业务名}.jsx | EditSpecialPolicy.jsx |
| 服务层 | camelCase | planePolicy.service.js |

### 优势
- 模块间解耦，修改影响范围可控
- 便于团队协作，减少冲突
- 新人入职快速定位代码位置`,
    tags: ['滴滴', '目录结构', '架构设计'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-service-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '服务层封装方案是怎样的？如何管理约50个service文件？',
    answer: `服务层封装方案：

### 1. 目录结构
\`\`\`
src/services/
├── planePolicy.service.js    # 机票政策接口
├── planeAgreement.service.js # 协议价接口
├── supplier.service.js       # 供应商接口
└── user.service.js            # 用户接口
\`\`\`

### 2. 封装模式
\`\`\`javascript
// services/planePolicy.service.js
import request from '../utils/request';
import config from 'config';

const BASE_URL = config.yichou;

export const planePolicyService = {
  // 列表
  getSpecialPolicyList: (params) =>
    request.post(\`\${BASE_URL}/api/flight/huidu/company/specialPolicy/queryList/v1.0\`, params),
  // 新增
  addSpecialPolicy: (data) =>
    request.post(\`\${BASE_URL}/api/flight/huidu/company/specialPolicy/add/v1.0\`, data),
  // 修改
  updateSpecialPolicy: (data) =>
    request.post(\`\${BASE_URL}/api/flight/huidu/company/specialPolicy/update/v1.0\`, data),
  // 删除
  deleteSpecialPolicy: (params) =>
    request.post(\`\${BASE_URL}/api/flight/huidu/company/specialPolicy/delete/v1.0\`, params),
};
\`\`\`

### 3. 方法命名规范
| 操作 | 命名 |
|------|------|
| 列表获取 | getXxxList / queryXxxList |
| 单条获取 | getXxx / queryXxx |
| 新增 | addXxx / createXxx |
| 修改 | updateXxx / editXxx |
| 删除 | deleteXxx / removeXxx |
| 批量操作 | batchXxx |

### 4. 50 个文件分类
\`\`\`
services/
├── 机票相关 (8个)   # planePolicy, planeAgreement, planeCabin...
├── 酒店相关 (10个)  # hotelSupplier, hotelBonus, hotelChannel...
├── 火车票相关 (2个) # train, trainSupplier
├── 用户/权限 (2个)  # user, permission
└── 其他 (~30个)     # 增值服务、保险、标签等
\`\`\`

### 5. 管理策略
| 策略 | 说明 |
|------|------|
| 按业务模块划分 | 每个模块对应一个 service 文件 |
| 命名一致性 | xxx.service.js 格式 |
| 单一职责 | 每个文件只对应一个业务域 |
| 版本管理 | URL 中带版本号（v1.0） |

### 优势
- API 集中管理，修改只需改一处
- 统一错误处理、请求拦截
- 便于接口调试和文档生成`,
    tags: ['滴滴', '服务层', 'API封装'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-router-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '动态路由和权限菜单是如何实现的？',
    answer: `动态路由实现方案：

### 1. 路由来源
路由不是硬编码的，而是从后端获取的菜单配置动态生成：

\`\`\`javascript
// Routes.jsx
const Routes = () => {
  const routes = useSelector(state => getRoutes(state.user.menus));

  return (
    <Switch>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} component={ROUTETOCOMPONENTS[route.path]} />
      ))}
    </Switch>
  );
};
\`\`\`

### 2. 菜单数据结构
\`\`\`javascript
const menus = [
  {
    id: 1,
    name: '机票管理',
    url: '/plane_policy',
    cmenus: [
      { id: 11, name: '特殊政策', url: '/plane_policy/special' },
      { id: 12, name: '普通政策', url: '/plane_policy/ordinary' },
    ]
  },
];
\`\`\`

### 3. 路由映射表
\`\`\`javascript
const ROUTETOCOMPONENTS = {
  '/plane_policy': loadable(() => import('./pages/plane_policy')),
  '/trust': loadable(() => import('./pages/trust')),
  '/supplier': loadable(() => import('./pages/supplier')),
};
\`\`\`

### 4. 按钮级权限
\`\`\`javascript
const usePermission = (permission) => {
  const permissions = useSelector(state => state.user.permissions);
  return permissions.includes(permission);
};

const DeleteButton = ({ record }) => {
  const canDelete = usePermission('policy:delete');
  if (!canDelete) return null;
  return <Button onClick={handleDelete}>删除</Button>;
};
\`\`\`

### 5. 路由守卫
\`\`\`javascript
const ProtectedRoute = ({ component: Component, ...props }) => {
  const isLoggedIn = useSelector(state => state.user.isLoggedIn);
  if (!isLoggedIn) return <Redirect to="/login" />;
  return <Component {...props} />;
};
\`\`\`

### 机制总结
| 机制 | 实现方式 |
|------|----------|
| 菜单来源 | 后端返回，存储在 Redux |
| 路由生成 | 递归解析菜单，动态生成 Route |
| 权限控制 | 按钮级 + 页面级权限校验 |`,
    tags: ['滴滴', '动态路由', '权限管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-sign-001',
    module: 'projects',
    chapterId: 'didi',
    category: '安全机制',
    question: 'API 签名机制（MD5 + timestamp + nonce）是如何实现的？',
    answer: `API 签名机制实现：

### 1. 签名目的
- 防止请求被篡改
- 防止请求被重放攻击
- 验证请求合法性

### 2. 签名算法
\`\`\`javascript
// utils/signature.js
export const generateNonce = () => {
  return Math.random().toString(36).substring(2, 10);
};

export const generateSignature = (config, secret = 'your-app-secret') => {
  const { method, url, params, data } = config;

  // 1. 排序所有参数
  const sortedParams = sortObjectKeys({ ...params, ...data });

  // 2. 拼接字符串
  const signString = [method.toUpperCase(), url, sortedParams, timestamp, nonce, secret].join('&');

  // 3. MD5 加密
  return md5(signString);
};
\`\`\`

### 3. 请求拦截器自动签名
\`\`\`javascript
// utils/request.js
request.interceptors.request.use((config) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = generateNonce();
  const signature = generateSignature(config);

  config.headers['X-Timestamp'] = timestamp;
  config.headers['X-Nonce'] = nonce;
  config.headers['X-Signature'] = signature;

  return config;
});
\`\`\`

### 4. 服务端验证
\`\`\`javascript
// 1. 检查 timestamp 是否在有效时间范围内（如 5 分钟）
// 2. 检查 nonce 是否已使用（防止重放）
// 3. 重新计算 signature，与请求中的 signature 比较
\`\`\`

### 安全考虑
| 机制 | 作用 |
|------|------|
| MD5 签名 | 防止请求被篡改 |
| timestamp | 限制请求有效期，防止重放 |
| nonce | 唯一标识每次请求，防止重放攻击 |
| 参数排序 | 相同参数不同顺序产生相同签名 |`,
    tags: ['滴滴', 'API签名', '安全机制', 'MD5'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-loadable-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '基于 loadable 的路由级代码分割是如何实现的？',
    answer: `路由级代码分割实现：

### 1. 使用 @loadable/component
\`\`\`javascript
import loadable from '@loadable/component';

const PolicySpecial = loadable(() => import('./pages/plane_policy/page/plane_policy_special'), {
  fallback: <div>Loading...</div>,
});
\`\`\`

### 2. 路由配置
\`\`\`javascript
const ROUTETOCOMPONENTS = {
  '/plane_policy': loadable(() => import('./pages/plane_policy'), {
    fallback: <div>Loading...</div>,
  }),
  '/trust': loadable(() => import('./pages/trust'), {
    fallback: <div>Loading...</div>,
  }),
};
\`\`\`

### 3. Vite 配置
\`\`\`javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'policy': ['./pages/plane_policy/**'],
          'trust': ['./pages/trust/**'],
        }
      }
    }
  }
};
\`\`\`

### 4. 构建产物对比
\`\`\`
优化前：bundle.js → 2.5MB（全部代码）

优化后：
main.js      → 500KB（框架 + 路由）
1.js         → 300KB（机票政策）
2.js         → 400KB（酒店托管）
3.js         → 350KB（供应商）
...按需加载
\`\`\`

### 5. 预加载优化
\`\`\`javascript
// 鼠标 hover 时预加载
<Link to="/plane_policy/special" onMouseEnter={() => PolicySpecial.preload()}>
  特殊政策
</Link>

// 或使用 webpackPrefetch
import(/* webpackPrefetch: true */ './pages/PolicyDetail');
\`\`\`

### 性能效果
- 首屏加载体积减少 50%+
- 按需加载，用户只加载访问的页面
- 浏览器缓存优化（contenthash）`,
    tags: ['滴滴', '代码分割', 'loadable', 'Webpack'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-eslint-001',
    module: 'projects',
    chapterId: 'didi',
    category: '工程化',
    question: 'ESLint + Prettier 代码规范化是如何配置的？',
    answer: `代码规范化配置：

### 1. ESLint 配置（.eslintrc.js）
\`\`\`javascript
module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'plugin:react/recommended'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/prop-types': 'off',
    'camelcase': 'off',  // 业务字段常用下划线
  },
};
\`\`\`

### 2. Prettier 配置（.prettierrc）
\`\`\`json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
\`\`\`

### 3. VSCode 保存时格式化
\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
\`\`\`

### 4. Git Hooks 集成
\`\`\`javascript
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
\`\`\`

### 工具对比
| 工具 | 作用 |
|------|------|
| ESLint | 代码检查、问题发现 |
| Prettier | 代码格式统一 |
| VS Code 插件 | 保存时自动格式化 |
| Husky + lint-staged | Git 提交前检查 |`,
    tags: ['滴滴', 'ESLint', 'Prettier', '工程化'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  // ===== 简历版本3: 性能优化型 =====
  {
    id: 'didi-usememo-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: 'useMemo 在列表页面渲染优化中是如何使用的？',
    answer: `useMemo 优化实践：

### 1. 表格列配置缓存
\`\`\`javascript
// 避免每次渲染重新生成 columns
const columns = useMemo(() => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '政策名称',
    dataIndex: 'policy_name',
    key: 'policy_name',
    render: (value) => <MyParagraph content={value} rows={1} />,
  },
], []); // 空依赖，只计算一次
\`\`\`

### 2. 映射数据缓存
\`\`\`javascript
const tableData = useMemo(() => {
  return listData.map((item, index) => ({
    key: item.id || index,
    ...item,
    statusText: STATUS_MAP[item.status],
    typeText: TYPE_MAP[item.type],
  }));
}, [listData]);
\`\`\`

### 3. 搜索参数构建
\`\`\`javascript
const searchParams = useMemo(() => {
  const params = {};
  if (values.airline_code) params.airline_code = values.airline_code;
  if (values.status) params.status = values.status;
  return params;
}, [values.airline_code, values.status]);
\`\`\`

### 4. 分页参数
\`\`\`javascript
const pagination = useMemo(() => ({
  current: pageNum + 1,
  pageSize: pageSize,
  total: totalCount,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => \`共 \${total} 条\`,
}), [pageNum, pageSize, totalCount]);
\`\`\`

### 适用场景
- 复杂计算（排序、筛选、汇总）
- 派生数据
- 避免子组件不必要渲染

### 性能收益
- 大数据列表渲染时间减少 40%
- 减少主线程阻塞`,
    tags: ['滴滴', 'React Hooks', 'useMemo', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-usecallback-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: 'useCallback 在回调函数优化中是如何使用的？',
    answer: `useCallback 优化实践：

### 1. 表格操作回调
\`\`\`javascript
// 传递给 Table 的回调函数
const handleEdit = useCallback((record) => {
  setEditRecord(record);
  setEditModalVisible(true);
}, []); // 空依赖，函数引用不变

const handleDelete = useCallback((record) => {
  Modal.confirm({
    title: '确认删除',
    onOk: () => deleteRecord(record.id);
  });
}, [deleteRecord]); // 依赖 deleteRecord
\`\`\`

### 2. 配合 React.memo
\`\`\`javascript
// 子组件使用 memo
const ListItem = memo(({ onClick, item }) => (
  <div onClick={() => onClick(item.id)}>{item.name}</div>
));

// 父组件使用 useCallback
const handleItemClick = useCallback((id) => {
  console.log(id);
}, []);

return items.map(item => (
  <ListItem key={item.id} item={item} onClick={handleItemClick} />
));
\`\`\`

### 3. 防抖/节流场景
\`\`\`javascript
const handleSearch = useCallback(
  debounce((value) => {
    fetchData(value);
  }, 300),
  []
);
\`\`\`

### 4. 表单提交回调
\`\`\`javascript
const handleSubmit = useCallback(async (values) => {
  setLoading(true);
  try {
    const res = await submitData(values);
    if (res.errno === 0) {
      message.success('提交成功');
      onSuccess?.();
    }
  } finally {
    setLoading(false);
  }
}, [submitData, onSuccess]);
\`\`\`

### 注意事项
- 不要过度使用，只在性能瓶颈处使用
- 依赖项正确设置
- 配合 React DevTools Profiler 分析`,
    tags: ['滴滴', 'React Hooks', 'useCallback', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-memo-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: 'React.memo 纯组件优化是如何实现的？',
    answer: `React.memo 优化实践：

### 1. 基本用法
\`\`\`javascript
import { memo } from 'react';

// 数据展示组件使用 memo
const UserAvatar = memo(({ src, name }) => (
  <img src={src} alt={name} />
));

// 父组件
const Parent = () => {
  const [count, setCount] = useState(0);
  // count 变化时，UserAvatar 不会重新渲染
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <UserAvatar src="/avatar.png" name="John" />
    </div>
  );
};
\`\`\`

### 2. 自定义比较函数
\`\`\`javascript
const ListItem = memo(({ item }) => (
  <div>{item.name}</div>
), (prevProps, nextProps) => {
  // 自定义比较：只有 id 变化才重新渲染
  return prevProps.item.id === nextProps.item.id;
});
\`\`\`

### 3. 表格列渲染
\`\`\`javascript
const StatusCell = memo(({ status }) => {
  const statusMap = { 1: '未生效', 2: '生效中', 3: '已过期' };
  return <Tag color={getColor(status)}>{statusMap[status]}</Tag>;
});
\`\`\`

### 4. 列表项组件
\`\`\`javascript
const PolicyRow = memo(({ data, onEdit, onDelete }) => (
  <div className="policy-row">
    <span>{data.policy_name}</span>
    <Space>
      <Button onClick={() => onEdit(data.id)}>编辑</Button>
      <Button onClick={() => onDelete(data.id)}>删除</Button>
    </Space>
  </div>
));
\`\`\`

### 适用场景
- 数据展示组件（表格行、卡片）
- 纯展示组件，无内部状态
- 大量重复渲染的列表项

### 性能收益
- 减少不必要的渲染
- 列表渲染性能提升 50%+`,
    tags: ['滴滴', 'React.memo', '纯组件', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-debounce-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '高频请求接口的防抖和节流是如何处理的？',
    answer: `防抖/节流处理：

### 1. 搜索框防抖
\`\`\`javascript
const [searchValue, setSearchValue] = useState('');
const [debouncedValue, setDebouncedValue] = useState('');

// 使用 useEffect 实现防抖
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(searchValue);
  }, 300); // 300ms 延迟

  return () => clearTimeout(timer);
}, [searchValue]);

// debouncedValue 变化时请求
useEffect(() => {
  if (debouncedValue) {
    loadTableData({ keyword: debouncedValue });
  }
}, [debouncedValue]);
\`\`\`

### 2. 防抖 Hook 封装
\`\`\`javascript
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// 使用
const debouncedKeyword = useDebounce(keyword, 500);
\`\`\`

### 3. 按钮点击节流
\`\`\`javascript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (submitting) return; // 防止重复提交

  setSubmitting(true);
  try {
    await submitData(values);
    message.success('提交成功');
  } finally {
    setSubmitting(false);
  }
};

<Button loading={submitting} onClick={handleSubmit}>提交</Button>
\`\`\`

### 4. 滚动加载节流
\`\`\`javascript
const handleScroll = useCallback((e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;

  if (scrollHeight - scrollTop - clientHeight < 100) {
    if (!loading && hasMore) {
      loadMoreData();
    }
  }
}, [loading, hasName, loadMoreData]);
\`\`\`

### 概念区分
| 概念 | 说明 | 场景 |
|------|------|------|
| 防抖 (Debounce) | 触发后等待 N 秒，若再次触发则重置 | 搜索框输入 |
| 节流 (Throttle) | 触发后固定间隔执行一次 | 按钮点击、滚动 |`,
    tags: ['滴滴', '防抖', '节流', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 简历版本4: AI 提效型 =====
  {
    id: 'didi-ssd-002',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'SSD 智能体开发规范是什么？包含哪些核心组件？',
    answer: `SSD 规范体系：

### 1. OpenSpec 变更体系
\`\`\`yaml
# .openspec.yaml
schema: spec-driven
change_type: feature
created: 2026-03-27
owner: patricktan
status: in_progress
\`\`\`

### 2. Skills 封装标准
\`\`\`javascript
const skills = {
  // 生成组件
  'gen:component': {
    description: '生成标准 React 组件',
    template: '...',
    rules: ['使用函数组件', '使用 hooks'],
  },
  // 生成 Service
  'gen:service': {
    description: '生成 API Service 文件',
    template: '...',
    rules: ['使用 request.post', '错误处理'],
  },
  // 重构建议
  'refactor:optimize': {
    description: '代码优化建议',
    rules: ['避免 useEffect 循环', 'useMemo 优化'],
  },
};
\`\`\`

### 3. 目录结构
\`\`\`
openspec/
├── changes/
│   ├── add-airline-member-pricing/
│   │   ├── .openspec.yaml      # 变更元信息
│   │   ├── proposal.md         # 提案
│   │   ├── design.md          # 设计
│   │   ├── tasks.md           # 任务
│   │   └── specs/
│   │       └── airline-member-pricing/
│   │           └── spec.md   # 技术规格
│   └── ...
└── templates/                  # 模板库
    ├── component.md
    └── service.md
\`\`\`

### 解决的问题
| 问题 | 解决方案 |
|------|----------|
| AI 生成代码质量不一 | 基于规范生成，产出更标准 |
| 需求传递失真 | 结构化文档，统一理解 |
| 多人协作混乱 | 任务拆分，状态追踪 |
| 历史代码难维护 | 规范沉淀，知识传承 |

**核心**：用文档代替口头沟通，让 AI 有章可循。`,
    tags: ['滴滴', 'SSD', 'AI工程化', 'Skills'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-claude-md-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'CLAUDE.md 项目知识库是如何维护的？解决了什么问题？',
    answer: `CLAUDE.md 维护方案：

### 1. 文件结构
\`\`\`markdown
# 甲子 (jiazi) 商旅运营系统

## 项目概述
- 技术栈：React 17, Ant Design 4.x, Redux + Redux Thunk
- 目录结构：pages/services/actions/reducers

## 常用命令
npm run dev
npm run build

## 开发规范
- Prettier: tabSize=2
- @didi/dajax 版本必须为 3.0.1

## API 签名
- Phoebe 签名机制
- MD5 + timestamp + nonce
\`\`\`

### 2. 项目规则（.claude/rules/）
\`\`\`
.claude/
├── rules/
│   ├── ai-development.md   # AI 开发规范
│   └── code-style.md       # 代码风格指南
└── commands/               # 自定义命令
\`\`\`

### 3. 解决的问题
| 维度 | 效果 |
|------|------|
| 技术栈 | AI 知道用什么框架/库 |
| 目录结构 | AI 知道文件放哪里 |
| 命名规范 | AI 知道怎么命名 |
| 代码风格 | AI 知道按什么风格写 |

### 4. 解决重复说明
- 不用每次都解释项目背景
- AI 自动遵循项目规范
- 减少沟通成本

### 5. 内容维护建议
| 内容 | 说明 |
|------|------|
| 项目概述 | 一句话介绍项目 |
| 技术栈 | 关键依赖版本 |
| 目录结构 | 主要目录职责 |
| 编码规范 | 团队约定 |
| 常用命令 | 开发/构建/部署 |

**一句话总结**：CLAUDE.md 让 AI 成为"了解项目的人"，而不是"陌生的助手"。`,
    tags: ['滴滴', 'CLAUDE.md', 'AI集成'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-agent-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'Claude Code Agent 是如何辅助大需求全流程开发的？',
    answer: `Claude Code Agent 辅助开发流程：

### 1. 需求理解阶段
\`\`\`
用户描述需求 → Claude 分析 → 生成技术方案
\`\`\`
- 阅读现有代码，理解业务逻辑
- 分析需求可行性
- 提供技术建议

### 2. 设计阶段
\`\`\`
OpenSpec 规范 → Claude 参与 → 设计文档
\`\`\`
- 生成标准的设计模板
- 检查设计完整性
- 提供最佳实践建议

### 3. 开发阶段
\`\`\`
规范文档 → Claude 生成代码 → 人工 Review
\`\`\`
- 基于规范生成代码
- 自动添加注释
- 遵循代码规范

### 4. 审查阶段
\`\`\`
代码 → Claude Review → 问题修复
\`\`\`
- 检查潜在 bug
- 提示性能问题
- 建议代码优化

### 实践案例

#### 需求：新增会员类型字段
1. 需求描述给 Claude
2. Claude 分析并生成 tasks.md
3. 逐步实现任务
4. Claude 代码 Review

#### 优化：JSX 嵌套深度
1. ESLint 报错
2. Claude 分析代码结构
3. 提取为渲染函数
4. 验证功能无损

### 效果数据
- 大需求开发周期缩短 30%
- 代码缺陷率降低 20%
- 文档完整性提升 40%

**核心价值**：让 AI 成为开发伙伴，而不是工具。`,
    tags: ['滴滴', 'Claude Code', 'AI辅助开发', 'Agent'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'didi-code-review-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'AI 代码审查工作流是如何设计的？',
    answer: `AI 代码审查流程：

### 1. 审查流程
\`\`\`
代码提交 → Claude 审查 → 问题报告 → 人工确认 → 修复
\`\`\`

### 2. 审查维度

| 维度 | 检查内容 |
|------|----------|
| 语法与规范 | ESLint 规则检查、代码格式、命名规范 |
| 逻辑问题 | useEffect 依赖、循环调用、边界条件 |
| 性能问题 | useMemo/useCallback 缺失、内存泄漏 |
| 安全风险 | XSS、eval、SQL 注入 |

### 3. 具体检查示例
\`\`\`javascript
// 逻辑问题
useEffect(() => {
  fetchData(); // 每次渲染都执行
}, [data]);    // 依赖包含 data，但 data 变化又会触发

// 建议
useEffect(() => {
  fetchData();
}, []); // 应该在组件挂载时执行一次

// 性能问题
const items = data.map(item => (
  <ChildComponent
    onClick={() => handleClick(item.id)} // 每次创建新函数
  />
));

// 建议
const handleClick = useCallback((id) => {
  handleItemClick(id);
}, [handleItemClick]);

// 安全问题
eval(userInput);           // 危险
innerHTML = userContent;   // XSS 风险
\`\`\`

### 4. 审查输出
\`\`\`markdown
## 代码审查报告

### 问题
- [高] 第 23 行：useEffect 依赖导致循环调用
- [中] 第 45 行：未使用 useMemo 优化
- [低] 第 67 行：缺少分号

### 建议
- 使用 useCallback 缓存函数
- 提取重复代码为公共方法

### 总结
共 3 个问题，建议修复后合并
\`\`\`

### 效果
- 发现潜在问题 30%+
- 人工 review 效率提升
- 团队代码质量提升`,
    tags: ['滴滴', 'AI代码审查', '代码质量'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 简历版本5: 全栈综合型 =====
  {
    id: 'didi-api-design-001',
    module: 'projects',
    chapterId: 'didi',
    category: '技术选型',
    question: '前后端 API 接口设计是如何规范的？',
    answer: `API 接口设计规范：

### 1. RESTful 风格
\`\`\`
GET    /api/flight/huidu/company/specialPolicy/queryList/v1.0  # 获取列表
POST   /api/flight/huidu/company/specialPolicy/add/v1.0        # 新增
POST   /api/flight/huidu/company/specialPolicy/update/v1.0    # 修改
POST   /api/flight/huidu/company/specialPolicy/delete/v1.0    # 删除
\`\`\`

### 2. 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 资源 | 名词复数 | policies |
| 版本 | v1.0, v1.1 | v1.0 |
| 动作 | 查询用 query | queryList |

### 3. 请求格式
\`\`\`javascript
// GET 请求
GET /api/xxx?page_num=0&page_size=10

// POST 请求
POST /api/xxx
Content-Type: application/json

{
  "policy_code": "POL001",
  "airline_codes": "CA,CZ"
}
\`\`\`

### 4. 响应格式
\`\`\`javascript
// 成功
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "content": [...],
    "total_num": 100
  }
}

// 失败
{
  "errno": 1001,
  "errmsg": "参数错误"
}
\`\`\`

### 5. 错误码设计
\`\`\`javascript
const ERROR_CODES = {
  SUCCESS: 0,
  // 客户端错误
  PARAM_ERROR: 1001,    // 参数错误
  NOT_FOUND: 1002,     // 资源不存在
  PERMISSION_DENIED: 1003,  // 权限不足
  // 服务端错误
  SERVER_ERROR: 2001,   // 服务器错误
  // 业务错误
  POLICY_EXIST: 3001,   // 政策已存在
};
\`\`\`

### 总结
| 维度 | 规范 |
|------|------|
| URL | RESTful 风格，版本号 |
| 请求 | GET/POST 分离 |
| 响应 | errno + errmsg + data |
| 错误码 | 分类定义 |`,
    tags: ['滴滴', 'API设计', 'RESTful', '前后端协作'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-desensitize-001',
    module: 'projects',
    chapterId: 'didi',
    category: '安全机制',
    question: '数据脱敏工具是如何实现的？',
    answer: `数据脱敏实现：

### 1. 常见脱敏场景
| 类型 | 示例 | 处理方式 |
|------|------|----------|
| 手机号 | 13812345678 → 138****5678 | 保留前后各3位 |
| 身份证 | 110101199001011234 → 110101********1234 | 保留前后各4位 |
| 银行卡 | 6222021234567890123 → 6222 **** **** 0123 | 保留前4后4 |
| 姓名 | 张三 → 张* | 保留姓，隐藏名 |
| 邮箱 | zhangsan@email.com → z***n@email.com | 隐藏中间部分 |

### 2. 工具函数实现
\`\`\`javascript
// utils/mask.js

// 手机号脱敏
export const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\\d{3})\\d{4}(\\d{4})/, '$1****$2');
};

// 身份证脱敏
export const maskIdCard = (idCard) => {
  if (!idCard) return '';
  return idCard.replace(/(\\d{4})\\d{10}(\\d{4})/, '$1**********$2');
};

// 银行卡脱敏
export const maskBankCard = (cardNo) => {
  if (!cardNo) return '';
  return cardNo.replace(/(\\d{4})\\d+(\\d{4})/, '$1 **** **** $2');
};

// 姓名脱敏
export const maskName = (name) => {
  if (!name) return '';
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 1) + name[name.length - 1];
};

// 邮箱脱敏
export const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length > 2
    ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
    : name[0] + '*';
  return \`\${maskedName}@\${domain}\`;
};
\`\`\`

### 3. 表格列配置使用
\`\`\`javascript
const columns = [
  { title: '手机号', dataIndex: 'phone', render: (value) => maskPhone(value) },
  { title: '身份证', dataIndex: 'idCard', render: (value) => maskIdCard(value) },
  { title: '姓名', dataIndex: 'name', render: (value) => maskName(value) },
];
\`\`\`

### 4. 前端脱敏原则
⚠️ 注意：前端脱敏只是展示层安全，敏感数据不应传给前端，或后端返回脱敏后的数据

### 总结
| 场景 | 方法 |
|------|------|
| 手机号 | 保留前3后4位 |
| 身份证 | 保留前4后4位 |
| 银行卡 | 保留前4后4位 |
| 姓名 | 保留姓 |`,
    tags: ['滴滴', '数据脱敏', '安全机制'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-precision-001',
    module: 'projects',
    chapterId: 'didi',
    category: '技术选型',
    question: '金额精度计算是如何处理的？浮点数精度问题怎么解决？',
    answer: `金额精度计算方案：

### 1. 浮点数精度问题
\`\`\`javascript
// ❌ 错误示例
0.1 + 0.2 = 0.30000000000000004
0.7 * 100 = 70.00000000000001
1.1 - 0.1 = 1.0000000000000002
\`\`\`

### 2. 金额单位转换（元 ↔ 分）
\`\`\`javascript
// 金额单位转换（元 -> 分）
export const yuanToFen = (yuan) => {
  if (yuan == null) return 0;
  return Math.round(Number(yuan) * 100);
};

// 金额单位转换（分 -> 元）
export const fenToYuan = (fen) => {
  if (fen == null) return 0;
  return Number(fen) / 100;
};
\`\`\`

### 3. 精度处理工具（整数计算）
\`\`\`javascript
// 避免浮点数精度问题：先转为整数，计算后转回
export const add = (a, b) => {
  const aInt = Math.round(a * 100);
  const bInt = Math.round(b * 100);
  return (aInt + bInt) / 100;
};

export const subtract = (a, b) => {
  const aInt = Math.round(a * 100);
  const bInt = Math.round(b * 100);
  return (aInt - bInt) / 100;
};

export const multiply = (a, b) => {
  const aInt = Math.round(a * 100);
  return Math.round(aInt * b) / 100;
};

export const divide = (a, b) => {
  const aInt = Math.round(a * 100);
  return Math.round(aInt / b * 100) / 100;
};

// 金额格式化显示
export const formatMoney = (amount) => {
  if (amount == null) return '0.00';
  return Number(amount).toFixed(2);
};
\`\`\`

### 4. 后端交互
\`\`\`javascript
// 提交时：元转分
const submitAmount = (values) => {
  const params = {
    amount: yuanToFen(values.amount), // 100.5 -> 10050
    discount: yuanToFen(values.discount),
  };
  request.post('/api/xxx', params);
};

// 接收时：分转元
const formatAmount = (data) => ({
  amount: fenToYuan(data.amount), // 10050 -> 100.5
});
\`\`\`

### 总结
| 方法 | 说明 |
|------|------|
| 整数计算 | 先 *100 转整数，计算后 /100 |
| toFixed | 用于展示，保留2位小数 |
| 前后端统一 | 后端存分，前端负责显示转换 |`,
    tags: ['滴滴', '金额计算', '浮点数精度'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-storage-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '浏览器存储方案是如何设计的？sessionStorage 和 localStorage 如何选择？',
    answer: `浏览器存储方案：

### 1. 两种存储对比
| 特性 | sessionStorage | localStorage |
|------|----------------|--------------|
| 生命周期 | 标签页关闭 | 永久（手动清除） |
| 作用域 | 同标签页 | 同源（跨标签页） |
| 容量 | 约 5MB | 约 5MB |

### 2. 项目中的封装
\`\`\`javascript
// utils/browserStorage.js
const PREFIX = 'jiazi_';

export const browserStorage = {
  // sessionStorage
  setSessionStorage: (key, value) => {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(PREFIX + key, data);
    } catch (e) { console.error('sessionStorage set error:', e); }
  },

  getSessionStorage: (key) => {
    try {
      const data = sessionStorage.getItem(PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  // localStorage
  setLocalStorage: (key, value) => {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(PREFIX + key, data);
    } catch (e) { console.error('localStorage set error:', e); }
  },

  getLocalStorage: (key) => {
    try {
      const data = localStorage.getItem(PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
};
\`\`\`

### 3. 使用场景
\`\`\`javascript
// sessionStorage（临时数据）
browserStorage.setSessionStorage('user_info', userInfo);
browserStorage.setSessionStorage('form_draft', formData);

// localStorage（持久数据）
browserStorage.setLocalStorage('theme', 'dark');
browserStorage.setLocalStorage('table_columns', columnConfig);
\`\`\`

### 4. 选择原则
| 场景 | 存储方式 |
|------|----------|
| 用户信息 | sessionStorage |
| 临时表单数据 | sessionStorage |
| 登录凭证 | sessionStorage（安全） |
| 个性化设置 | localStorage |
| 离线数据缓存 | localStorage |
| 敏感信息 | ❌ 不建议存储 |

### 5. 注意事项
⚠️ 敏感信息不应存储：使用内存或 HttpOnly Cookie

### 总结
| 维度 | sessionStorage | localStorage |
|------|----------------|---------------|
| 用途 | 临时数据 | 持久数据 |
| 安全 | 相对安全 | 相对不安全 |
| 清除 | 自动 | 手动/过期 |`,
    tags: ['滴滴', '浏览器存储', 'localStorage', 'sessionStorage'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-interceptor-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: 'HTTP 请求拦截器和响应拦截器是如何设计的？',
    answer: `HTTP 拦截器架构：

### 1. request.js 封装
\`\`\`javascript
// utils/request.js
import axios from 'axios';

const request = axios.create({
  baseURL: config.yichou,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
\`\`\`

### 2. 请求拦截器
\`\`\`javascript
request.interceptors.request.use(
  (config) => {
    // 1. 添加用户信息
    const userInfo = JSON.parse(browserStorage.getSessionStorage('user_info') || '{}');
    if (userInfo.userId) {
      config.headers['X-User-Id'] = userInfo.userId;
    }

    // 2. 添加签名
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(2, 10);
    const signature = generateSignature(config);
    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Nonce'] = nonce;
    config.headers['X-Signature'] = signature;

    // 3. 添加租户信息
    config.headers['X-Tenant-Id'] = userInfo.tenantId || '';

    return config;
  },
  (error) => Promise.reject(error)
);
\`\`\`

### 3. 响应拦截器
\`\`\`javascript
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 业务层错误处理
    if (data.errno !== undefined && data.errno !== 0) {
      message.error(data.errmsg || '请求失败');
      return Promise.reject(data);
    }
    return data;
  },
  (error) => {
    // 网络错误处理
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          browserStorage.removeSessionStorage('user_info');
          window.location.href = '/login';
          break;
        case 403: message.error('没有权限'); break;
        case 404: message.error('请求资源不存在'); break;
        case 500: message.error('服务器错误'); break;
        default: message.error(error.message || '网络错误');
      }
    } else {
      message.error('网络连接失败');
    }
    return Promise.reject(error);
  }
);
\`\`\`

### 拦截器职责
| 拦截器 | 职责 |
|--------|------|
| 请求前 | 添加签名、用户信息、租户 ID |
| 响应成功 | 统一处理业务错误 (errno) |
| 响应失败 | 处理 401/403/500 等 HTTP 状态 |`,
    tags: ['滴滴', '拦截器', 'HTTP', 'axios'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 业务理解 =====
  {
    id: 'didi-business-001',
    module: 'projects',
    chapterId: 'didi',
    category: '业务理解',
    question: '滴滴企业版商旅系统主要解决什么问题？',
    answer: `商旅系统业务理解：

### 一、系统定位
滴滴企业版商旅系统（代号"甲子"）是**一站式企业差旅管理平台**，为企业提供机票、酒店、火车票、用车等全品类差旅服务。

### 二、核心问题

#### 2.1 企业差旅管理分散
| 痛点 | 解决方案 |
|------|----------|
| 多供应商对接麻烦 | 统一 API 接入 |
| 财务核对困难 | 统一账单管理 |
| 政策执行不严 | 差旅政策配置 |

#### 2.2 供应链整合
- 航空公司协议价管理
- 酒店托管与分销
- 供应商价格策略

#### 2.3 运营效率
- 政策配置管理
- 价格规则引擎
- 订单数据可视化

### 三、总结
让企业差旅"更省心、更合规、更高效"。`,
    tags: ['滴滴', '商旅系统', '业务理解'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-module-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '57个业务模块是如何组织管理的？',
    answer: `业务模块组织管理：

### 一、模块分类
\`\`\`
src/pages/
├── 机票相关 (约12个)
│   ├── plane_policy/         # 机票政策
│   ├── plane_policy_intl/   # 国际机票政策
│   ├── plane_basic_data/   # 基础数据
│   └── ...
│
├── 酒店相关 (约10个)
│   ├── trust/               # 酒店托管
│   ├── supplier/            # 酒店供应商
│   ├── static/              # 国内静态数据
│   └── ...
│
├── 火车票相关 (约3个)
├── 用车相关 (约3个)
├── 配置与权限 (约10个)
└── 其他 (约20个)
\`\`\`

### 二、组织原则
| 原则 | 说明 |
|------|------|
| 按业务线 | 机票、酒店、火车票分目录 |
| 按功能 | 列表页、编辑页、详情页分文件 |
| 公共抽取 | 通用组件放 components/ |

### 三、路由注册
\`\`\`javascript
// Routes.jsx - 路由与模块映射
const ROUTETOCOMPONENTS = {
  '/plane_policy': loadable(() => import('./pages/plane_policy')),
  '/trust': loadable(() => import('./pages/trust')),
};
\`\`\`

### 四、总结
57个模块按"业务线 → 功能模块 → 页面"三层组织。`,
    tags: ['滴滴', '模块化', '目录结构'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  // ===== 补充问题：核心架构重构 =====
  {
    id: 'didi-schema-error-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '当业务方配置了非法的 JSON Schema（如循环引用、不存在的组件名）时，动态表单引擎是如何处理的？',
    answer: `非法 Schema 的容错处理：

### 1. 校验层设计
在解析阶段使用 **AJV** 进行 Schema 预校验：
\`\`\`javascript
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

const validateSchema = (schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(schema);
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(e => ({
        path: e.instancePath,
        message: e.message,
      })),
    };
  }
  return { valid: true };
};
\`\`\`

### 2. 循环引用检测
\`\`\`javascript
const detectCircular = (schema, path = new Set()) => {
  if (typeof schema !== 'object') return false;
  const key = JSON.stringify(schema);
  if (path.has(key)) return true;
  path.add(key);
  return Object.values(schema).some(v => detectCircular(v, path));
};
\`\`\`

### 3. 组件名不存在处理
\`\`\`javascript
const COMPONENT_REGISTRY = {
  Input: InputComponent,
  Select: SelectComponent,
  DatePicker: DatePickerComponent,
};

const resolveComponent = (type) => {
  if (!COMPONENT_REGISTRY[type]) {
    console.warn(\`组件 \${type} 不存在，使用默认 Fallback\`);
    return FallbackComponent;
  }
  return COMPONENT_REGISTRY[type];
};
\`\`\`

### 4. UI 层优雅降级
\`\`\`javascript
const SchemaRenderer = ({ schema }) => {
  const validation = validateSchema(schema);

  if (!validation.valid) {
    return (
      <div className="schema-error">
        <Alert
          type="error"
          message="配置错误"
          description={validation.errors.map(e => e.message).join(', ')}
        />
      </div>
    );
  }

  return <FormRenderer schema={schema} />;
};
\`\`\`

### 5. 生产环境效果
- 不会白屏崩溃
- 显示友好错误提示（红色边框 + 具体错误信息）
- 不影响其他正常表单
- 错误日志上报 Sentry`,
    tags: ['滴滴', 'JSON Schema', '动态表单', '容错处理'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'didi-schema-design-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '通用定价模型是如何设计的？如何兼容满减、折扣、时段价、人群价等复杂业务场景？',
    answer: `通用定价模型设计：

### 1. 业务场景分析
| 场景 | 条件 | 动作 |
|------|------|------|
| 满减 | 订单金额 >= X | 减 Y 元 |
| 折扣 | 用户类型 = VIP | 打 Y 折 |
| 时段价 | 当前时间 in [A, B] | 价格 = Y |
| 人群价 | 用户部门 = 销售部 | 价格 = Y |

### 2. 规则引擎设计
采用 **规则引擎 + 策略模式**：

\`\`\`javascript
// 规则配置（存储在数据库）
const pricingRules = [
  {
    id: 'rule_001',
    name: 'VIP折扣',
    condition: {
      type: 'user_type',
      operator: 'eq',
      value: 'VIP',
    },
    action: {
      type: 'discount',
      value: 0.9, // 9折
    },
    priority: 10,
  },
  {
    id: 'rule_002',
    name: '满100减10',
    condition: {
      type: 'order_amount',
      operator: 'gte',
      value: 100,
    },
    action: {
      type: 'subtract',
      value: 10,
    },
    priority: 5,
  },
];
\`\`\`

### 3. 引擎执行逻辑
\`\`\`javascript
class PricingEngine {
  calculate(order, rules) {
    let price = order.basePrice;
    const appliedRules = [];

    // 按优先级排序
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.matchCondition(rule.condition, order)) {
        price = this.applyAction(rule.action, price);
        appliedRules.push(rule);
      }
    }

    return { finalPrice: price, appliedRules };
  }

  matchCondition(condition, order) {
    const value = this.getValue(condition.type, order);
    switch (condition.operator) {
      case 'eq': return value === condition.value;
      case 'gte': return value >= condition.value;
      case 'in': return condition.value.includes(value);
      default: return false;
    }
  }

  applyAction(action, price) {
    switch (action.type) {
      case 'discount': return price * action.value;
      case 'subtract': return price - action.value;
      case 'fixed': return action.value;
      default: return price;
    }
  }
}
\`\`\`

### 4. 自定义 Hook 扩展
对于无法用配置覆盖的"特例"：
\`\`\`javascript
const pricingRules = [
  {
    id: 'rule_custom',
    name: '自定义规则',
    condition: { type: 'custom', script: 'order.items.length > 5' },
    action: { type: 'custom', script: 'price * 0.85' },
  },
];

// 注意：生产环境需要沙箱隔离
const executeCustomScript = (script, context) => {
  return new Function('order', script)(context);
};
\`\`\`

### 5. 模型优势
- 配置化而非硬编码
- 新业务只需添加规则，无需改代码
- 规则可配置优先级
- 支持规则组合（先折扣再满减）`,
    tags: ['滴滴', '定价模型', '规则引擎', '策略模式'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  // ===== 补充问题：性能优化 =====
  {
    id: 'didi-preload-timing-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '路由预加载的具体时机是如何判断的？如果预加载资源很大，如何避免影响当前页面加载？',
    answer: `预加载策略详解：

### 1. 预加载时机选择

#### a. 鼠标悬停预加载（最常用）
\`\`\`javascript
<Link to="/supplier" onMouseEnter={() => handlePrefetch('/supplier')}>
  供应商管理
</Link>

const handlePrefetch = (path) => {
  const module = getModuleByPath(path);
  if (module && !module.loaded) {
    import(/* webpackPrefetch: true */ \`./pages/\${module.name}\`);
  }
};
\`\`\`

#### b. 空闲时间预加载（requestIdleCallback）
\`\`\`javascript
// 用户无操作时预加载
const prefetchOnIdle = (paths) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      paths.forEach(path => prefetchModule(path));
    });
  } else {
    setTimeout(() => {
      paths.forEach(path => prefetchModule(path));
    }, 3000);
  }
};
\`\`\`

#### c. 基于用户行为预测
\`\`\`javascript
// 登录页预加载首页资源
const LoginPage = () => {
  useEffect(() => {
    // 用户可能下一步去首页
    prefetchModule('/home');
    // 或用户可能去个人中心
    prefetchModule('/profile');
  }, []);

  return <LoginForm />;
};
\`\`\`

### 2. Resource Hints 优化
\`\`\`html
<!-- 关键资源预加载 -->
<link rel="preload" as="script" href="/bundle.js">

<!-- 空闲时间预加载（不阻塞） -->
<link rel="prefetch" as="script" href="/supplier.js">
\`\`\`

### 3. 带宽竞争处理
\`\`\`javascript
// 检测网络状态
const getEffectiveConnectionType = () => {
  const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return nav?.effectiveType; // '4g', '3g', '2g', 'slow-2g'
};

// 弱网时禁用预加载
const shouldPrefetch = () => {
  const ect = getEffectiveConnectionType();
  return ect === '4g' || ect === undefined; // 4G 或有线网络才预加载
};
\`\`\`

### 4. 优先级控制
\`\`\`javascript
// Webpack 配置动态 import 优先级
import(/* webpackPrefetch: 0 */ './pages/Home')  // 高优先级
import(/* webpackPrefetch: 10 */ './pages/About') // 低优先级
\`\`\`

### 5. 效果数据
- FCP 从 3.2s → 1.8s
- 预加载命中率 70%+
- 弱网下不影响主流程加载`,
    tags: ['滴滴', '预加载', 'Resource Hints', '性能优化'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'didi-bundle-optimize-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '你是如何发现冗余依赖的？能分享一个具体的包体积优化案例吗？',
    answer: `包体积优化实践：

### 1. 分析工具

#### Bundle Analyzer（Webpack）
\`\`\`javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
    }),
  ],
};
\`\`\`

#### rollup-plugin-visualizer（Vite）
\`\`\`javascript
// vite.config.js
import visualizer from 'rollup-plugin-visualizer';

plugins: [
  visualizer({
    filename: 'stats.html',
    open: true,
  }),
];
\`\`\`

### 2. 典型优化案例

#### Case 1: lodash → lodash-es（按需引入）
\`\`\`javascript
// ❌ 错误：全量引入
import _ from 'lodash';
_.cloneDeep(obj);
_.groupBy(arr, 'key');

// ✅ 正确：按需引入
import cloneDeep from 'lodash-es/cloneDeep';
import groupBy from 'lodash-es/groupBy';

// 结果：lodash 包从 70KB → 3KB
\`\`\`

#### Case 2: moment.js → dayjs
\`\`\`javascript
// ❌ 错误：moment.js 打包后 300KB+
import moment from 'moment';
moment().format('YYYY-MM-DD');

// ✅ 正确：dayjs 只有 2KB
import dayjs from 'dayjs';
dayjs().format('YYYY-MM-DD');
\`\`\`

#### Case 3: Ant Design 按需引入
\`\`\`javascript
// ❌ 错误：全量引入
import { Button, Table, Form, Modal } from 'antd';

// ✅ 正确：babel-plugin-import
// 配置 .babelrc
{
  "plugins": [
    ["import", { "libraryName": "antd", "libraryDirectory": "es" }]
  ]
}
// 使用时自动按需引入
import { Button } from 'antd';
\`\`\`

### 3. 其他优化手段

| 优化点 | 方法 | 收益 |
|--------|------|------|
| 图片压缩 | image-webpack-loader | 30%+ |
| 代码压缩 | terser-webpack-plugin | 40%+ |
| Tree Shaking | ES Module | 20%+ |
| CDN 引入 | external 配置 | 50%+ |
| gzip 压缩 | 服务端开启 | 70%+ |

### 4. 最终效果
- 首屏 JS 减少 45%
- 整体包体积减少 30%
- 弱网 FCP 提升 50%`,
    tags: ['滴滴', 'Bundle Analyzer', '包体积优化', 'lodash', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-component-api-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '你提到封装了高内聚业务组件，当父组件需要控制组件的 loading 状态或缓存数据时，你会暴露哪些接口？',
    answer: `组件 API 设计实践：

### 1. 受控（Controlled）与非受控（Uncontrolled）模式
\`\`\`javascript
const SearchSelect = ({
  // 受控模式
  value,
  onChange,
  loading,
  // 非受控模式（内部状态）
  defaultValue,
  defaultOptions,
  // 通用
  placeholder,
  onSearch,
}) => {
  // 内部状态
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [options, setOptions] = useState(defaultOptions || []);

  // 受控优先
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <Select
      value={currentValue}
      onChange={handleChange}
      loading={loading}
      options={options}
    />
  );
};
\`\`\`

### 2. 暴露的接口设计

| 接口类型 | 示例 | 说明 |
|----------|------|------|
| 数据相关 | value/onChange | 受控模式入口 |
| 加载状态 | loading | 外部控制请求状态 |
| 数据注入 | options | 外部传入数据 |
| 事件回调 | onSearch | 搜索事件通知 |
| 方法暴露 | ref.search() | 主动触发搜索 |
| 缓存控制 | cacheKey | 相同 key 复用数据 |

### 3. 高级：自定义 Hook 暴露
\`\`\`javascript
// 组件内部暴露数据给外部
const useSearchSelect = (props) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (keyword) => {
    setLoading(true);
    const result = await fetchOptions(keyword);
    setOptions(result);
    setLoading(false);
  };

  // 暴露给外部
  return {
    options,
    loading,
    search,
    clear: () => setOptions([]),
  };
};

// 使用
const Parent = () => {
  const { options, loading, search } = useSearchSelect();

  return (
    <SearchSelect
      options={options}
      loading={loading}
      onSearch={search}
    />
  );
};
\`\`\`

### 4. 实际应用案例
\`\`\`javascript
// 供应商选择组件
<SupplierSelect
  value={selectedSupplier}
  onChange={setSelectedSupplier}
  loading={loading}
  onSearch={handleSearch}
  cacheKey="supplier-list"  // 缓存 key
  ref={supplierSelectRef}   // 暴露方法
/>
\`\`\`

### 5. 设计原则
- 保持内部状态简洁
- 受控/非受控兼容
- 暴露必要的控制力
- 不过度设计`,
    tags: ['滴滴', '组件设计', '受控模式', 'API设计'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  // ===== 补充问题：AI 工程化 =====
  {
    id: 'didi-openspec-challenge-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: '制定 OpenSpec 标准容易，但推行难。AI 生成代码经常不符合标准（如 ESLint 报错或用了危险 API），你是怎么解决的？',
    answer: `OpenSpec 落地挑战解决方案：

### 1. System Prompt 约束
在 AI 的 System Prompt 中明确写入规范：
\`\`\`markdown
# 开发规范

## 代码规范
1. 禁止使用 any 类型，必须显式声明类型
2. 禁止使用 eval、new Function 等危险 API
3. 变量命名使用 camelCase
4. 组件必须使用 React.FC 声明

## ESLint 规则
- no-unused-vars: warn
- no-console: off（允许调试）
- react/prop-types: off（使用 TS）

## OpenSpec 输出格式
\`\`\`json
{
  "type": "component",
  "name": "SupplierTable",
  "props": {...},
  "code": "..."
}
\`\`\`
\`\`\`

### 2. 后处理（Post-process）机制
\`\`\`javascript
// AI 生成代码后处理
const postProcess = (code) => {
  // 1. 类型修复
  code = code.replace(/: any/g, ': unknown');

  // 2. 危险 API 检测
  if (code.includes('eval(') || code.includes('new Function(')) {
    throw new Error('检测到危险 API');
  }

  // 3. 自动格式化
  code = prettier.format(code);

  // 4. ESLint 自动修复
  code = eslintFix(code);

  return code;
};
\`\`\`

### 3. 人工审核环节
\`\`\`markdown
## Code Review 流程

1. AI 生成代码
2. 自动执行 ESLint + Prettier
3. 显示修复建议
4. 人工确认是否采纳
5. 合并到主干

> AI 负责 80% 基础工作，人工负责 20% 关键决策
\`\`\`

### 4. 错误反馈循环
\`\`\`javascript
// 将错误信息反馈给 AI
const handleError = (error) => {
  return ai.generate(\`修复以下错误：

\`\`\`
\${error.message}
\`\`\`

原代码：
\`\`\`
\${originalCode}
\`\`\`
\`);
};
\`\`\`

### 5. 效果
- ESLint 错误减少 60%
- 代码格式问题 0
- 人工 review 效率提升 50%`,
    tags: ['滴滴', 'OpenSpec', 'AI工程化', 'Prompt Engineering'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'didi-ai-limit-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'AI 适合做"架构重构"吗？在遗留系统拆解中，AI 具体帮了什么忙？是写代码还是写文档？',
    answer: `AI 在重构中的边界与实践：

### 1. AI 适合的场景

| 场景 | AI 能力 | 适用程度 |
|------|---------|----------|
| 生成单元测试 | ★★★★★ | 高 |
| 代码注释/文档 | ★★★★☆ | 高 |
| 模式识别/总结 | ★★★☆☆ | 中 |
| 复杂逻辑设计 | ★★☆☆☆ | 低 |
| 架构决策 | ★☆☆☆☆ | 低 |

### 2. 实际工作分配

#### AI 负责（80%）
\`\`\`javascript
// 1. 生成单元测试
// AI：根据现有函数生成测试用例
describe('PricingEngine', () => {
  test('满减规则正确计算', () => {
    const engine = new PricingEngine();
    const result = engine.calculate(
      { basePrice: 150 },
      [{ condition: { type: 'amount', value: 100 }, action: { type: 'subtract', value: 10 } }]
    );
    expect(result.finalPrice).toBe(140);
  });
});

// 2. 代码注释
// AI：为老代码生成 JSDoc 注释
/**
 * 计算订单最终价格
 * @param {Order} order - 订单对象
 * @param {Rule[]} rules - 定价规则数组
 * @returns {Object} { finalPrice, appliedRules }
 */
function calculatePrice(order, rules) { ... }
\`\`\`

#### 人类负责（20%）
\`\`\`javascript
// 1. Schema 设计决策
const pricingSchema = {
  // 定价模型抽象成什么结构？
  // 策略模式还是规则引擎？
  // 这个决策必须由人来做
};

// 2. 拆解策略
// 哪些模块先拆？哪些后拆？
// 依赖关系如何处理？
// 灰度方案是什么？
\`\`\`

### 3. 重构工作流
\`\`\`markdown
## 人机协作重构流程

1. **人工分析**（人类）
   - 分析代码依赖关系
   - 确定拆解顺序
   - 设计新架构

2. **AI 辅助理解**（AI）
   - 生成代码文档
   - 分析潜在的调用链路
   - 识别循环依赖

3. **AI 生成测试**（AI）
   - 为旧代码生成单元测试
   - 覆盖率目标 80%+

4. **人工实现新逻辑**（人类）
   - 实现新的 Schema 引擎
   - 配置驱动替代硬编码

5. **AI 对比差异**（AI）
   - 验证新旧逻辑等价
   - 生成回归测试
\`\`\`

### 4. 客观认知
- AI 是**辅助工具**，不是**决策者**
- 复杂业务逻辑需要人类把控
- 重构的**安全感**来自测试，不是 AI
- 文档可以 AI 生成，但架构必须人设计`,
    tags: ['滴滴', 'AI辅助开发', '重构', '人机协作'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-ssd-def-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'SSD 智能体的定义是什么？它与普通的 AI 提示词有什么区别？',
    answer: `SSD 智能体定义：

### 1. 什么是 SSD
\`\`\`
SSD = Smart Specification Driven
智能体规范驱动开发
\`\`\`

### 2. 对比普通 Prompt

| 维度 | 普通 Prompt | SSD 智能体 |
|------|-------------|------------|
| 形式 | 一次性对话 | 持久化配置 |
| 约束力 | 低 | 高 |
| 复用性 | 低 | 高 |
| 标准化 | 无 | 有 |

### 3. SSD 结构
\`\`\`yaml
# jiazi-component-dev Skill
name: jiazi-component-dev
description: 甲子项目 React 组件开发规范

# 约束条件
constraints:
  - 技术栈: React 17, TypeScript, Ant Design 4.x
  - 禁止: any 类型、eval、console.log
  - 路径别名: @ -> src/

# 输入模板
templates:
  - "新建页面组件"
  - "添加列表页"
  - "创建表单页"

# 输出格式
output:
  format: json
  schema:
    code: string
    tests: string
    docs: string
\`\`\`

### 4. Skills 封装示例
\`\`\`javascript
// .claude/skills/jiazi-component-dev/SKILL.md
# 甲子项目 React 组件开发规范

## 适用场景
- 新建页面组件
- 添加列表页
- 创建表单页
- 封装公共组件

## 技术约束
1. 使用 React Hooks（useState, useEffect, useMemo）
2. 使用 TypeScript（严格模式）
3. 使用 Ant Design 组件
4. 使用 @ 路径别名
5. 禁止使用 any 类型

## 代码规范
- 组件文件：PascalCase
- 样式文件：同名的 .module.css
- 测试文件：同名的 .test.tsx
- 导出使用 export default

## 输出格式
\`\`\`typescript
// 输出示例
export interface ComponentProps {
  // ...
}

const MyComponent: React.FC<ComponentProps> = ({ ... }) => {
  // ...
};

export default MyComponent;
\`\`\`
\`\`\`

### 5. 效果
- 团队成员可复用同一套规范
- AI 生成代码质量稳定
- 新人上手成本降低`,
    tags: ['滴滴', 'SSD', 'AI智能体', 'Skills'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

export const didiChapter: Chapter = {
  id: 'didi',
  module: 'projects',
  title: '滴滴企业版 - 商旅体验',
  description: '遗留系统重构、AI工程化转型、弱网性能优化、业务功能开发、技术架构设计、性能优化',
  cardCount: didiCards.length,
  icon: '🚗',
};
