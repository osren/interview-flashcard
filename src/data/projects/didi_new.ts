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
2. **数据兼容处理**：老数据编辑时正确推导新字段初始值
3. **隐性规则显性化**：将业务规则提取为配置（如会员类型联动规则）
4. **UI嵌套优化**：提取渲染函数解决深度超标问题
5. **渐进式重构**：第一阶段统一数据模型，第二阶段合并UI组件，第三阶段移除重复代码

R (结果)：
- 国内/国际代码合并为统一模块，维护效率提升
- 隐性规则配置化，新业务只需添加配置无需改代码
- 0 线上事故（机票价格政策涉及财务，变更风险极高）`,
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
    question: '硬编码转配置驱动，配置 Schema 如何设计？以及配置驱动机制是什么？',
    answer: `一、项目中的配置驱动实践

1. 枚举类配置（硬编码转为配置）：
\`\`\`javascript
// 硬编码（Before）
<Select placeholder="请选择航线类型">
  <Option value={1}>国内机票</Option>
  <Option value={2}>国际机票</Option>
</Select>

// 配置化（After）- FlightBookingNotice.jsx
const AIRLINE_TYPE_MAP = {
  1: '国内',
  2: '国际',
};

// 渲染时使用配置
render: (value) => AIRLINE_TYPE_MAP[value] || '-'
\`\`\`

2. 字段级配置 + 联动逻辑：
\`\`\`javascript
// EditSpecialPolicy.jsx - 会员类型联动
case "member_types":
  const onlyNewMember = value.length === 1 && value.includes("1");
  this.setState({ showOldMemberFields: !onlyNewMember });
  break;

// 配置化的联动规则
const MEMBER_TYPE_LINKAGE = {
  '1': { showFields: [] },           // 仅新会员
  '2': { showFields: ['ticket_channels', 'history_booking_days'] },
};
\`\`\`

3. 动态表单组件：
\`\`\`javascript
// DynamicForm.jsx - 读取配置生成表单
const DynamicForm = ({ conf, handleSubmit }) => {
  // conf.conf_data 是配置数组
  const values = conf?.conf_data?.reduce((acc, item) => {
    // 根据 conf_item_type 渲染不同组件
  }, {});
};
\`\`\`

二、Schema 设计要点

interface ComponentConfig {
  type: 'input' | 'select' | 'date';
  name: string;
  label: string;
  rules?: ValidationRule[];
  visible?: Condition;    // 联动条件
  default?: any;
}

三、关键设计原则
1. 声明式而非命令式
2. 支持嵌套和组合
3. 有明确的类型定义
4. 支持校验规则内联
5. 联动逻辑可配置`,
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

SSD = "规范说明书"驱动 AI 写代码

类比：
传统：告诉装修师傅"我要简约风格" → 装修师傅自己理解 → 结果可能不符合预期
SSD：给装修师傅一份详细的"装修规范书" → 师傅按规范执行 → 结果可控

核心：
- 规范文档 = 需求 + 验收标准
- AI 读懂规范后生成代码
- 代码必须符合规范
- 有人工审核环节

一句话总结：SSD 规范驱动就是"用文档代替口头沟通，让代码有据可依，让 AI 有章可循"。`,
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

1. AI 输出格式不统一
   → 定义标准 JSON Schema 约束输出

2. 难以校验生成质量
   → Schema 校验 + metadata 置信度

3. AI 与 IDE 集成困难
   → 定义通信协议

4. 难以追踪规范与代码对应
   → 规范版本化，可单独管理

工作流：
- 需求阶段：PRD → OpenSpec 提案
- 设计阶段：提案 → 设计文档 → 任务拆分
- 实现阶段：代码实现 → 更新状态
- 归档阶段：整理文档 → 沉淀知识库`,
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
    answer: `路由分割：
使用 @loadable/component 实现按需加载
const PolicySpecial = loadable(() => import('./pages/plane_policy_special'));

预加载策略：
1. 鼠标悬停预加载：onMouseEnter 时调用 .preload()
2. 空闲预加载：requestIdleCallback
3. 预测性预加载：基于用户行为预测

分割效果：
- 优化前：bundle.js 2.5MB
- 优化后：main.js 500KB + 按需加载模块

关键指标：
- FCP 从 3.2s → 1.8s
- 首屏 JS 减少 45%
- 弱网环境下白屏时间减少 50%`,
    tags: ['滴滴', '性能优化', '路由分割', '预加载'],
    status: 'unvisited',
    difficulty: 'hard',
    extendQuestion: '预加载的触发时机是什么？如何避免预加载影响当前页面加载？',
  },
  {
    id: 'didi-redux-001',
    module: 'projects',
    chapterId: 'didi',
    category: '状态管理',
    question: 'Redux + Redux Thunk 状态管理方案解决了什么问题？',
    answer: `解决的问题：

1. 状态分散问题
   - 原来：用户信息、权限、菜单分散在不同组件
   - 现在：集中到 Redux Store 统一管理

2. 异步请求处理
   - Redux Thunk 支持异步 action
   - 允许 action 返回函数，封装异步逻辑

3. 数据流可预测
   - 单一数据源
   - 每次状态变化都有记录（配合 Redux DevTools）

典型应用场景：
- 用户登录信息全局共享
- 权限、菜单动态生成
- 多组件共享的表单数据

优势：可预测、可维护、可测试、可扩展`,
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

1. **Table 选择批量**
   - 使用 Ant Design Table 的 rowSelection
   - 支持全选、单选、跨页选择

2. **批量操作栏**
   - 底部固定操作栏，显示已选数量
   - 支持批量删除、批量审核、批量导出

3. **批量导入**
   - 使用 FormData 上传 Excel 文件
   - beforeUpload 进行格式校验

4. **批量导出**
   - 使用 form 提交方式，避免 URL 长度限制

5. **错误处理**
   - 部分失败时显示成功/失败数量
   - 保留选中失败的项便于重试`,
    tags: ['滴滴', 'CRUD', '批量操作', 'Ant Design'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-folder-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '前端目录结构规范是如何设计的？每个文件夹的职责是什么？',
    answer: `目录结构设计：

src/
├── pages/          # 页面组件（57个业务模块）
├── components/     # 可复用UI组件（约10个）
├── services/       # API请求封装（~50个service文件）
├── actions/        # Redux actions
├── reducers/       # Redux reducers
├── utils/          # 工具函数
├── constants/      # 常量配置
└── Routes.jsx      # 路由定义

分层原则：
1. pages/ - 业务页面，按模块划分（supplier, flight, hotel等）
2. services/ - API服务层，每个模块对应一个service文件
3. actions/reducers - Redux 数据层
4. utils/ - 工具函数，纯函数优先
5. constants/ - 常量配置，减少魔法值

优势：模块间解耦，修改影响范围可控，便于团队协作`,
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

1. 文件组织
   - 按业务模块划分：supplier.service.js, hotel.service.js, flight.service.js
   - 统一在 services/index.js 导出

2. 请求封装（基于 @didi/dajax）
   export const planePolicyService = {
     getList: (params) => axios.get('/api/xxx', { params }),
     add: (data) => axios.post('/api/xxx', data),
   };

3. 分类管理
   - 机票相关：8个（policy, agreement, cabin...）
   - 酒店相关：10个
   - 火车票相关：2个
   - 用户/权限：2个

4. 命名规范
   - getXxxList / queryXxxList - 列表获取
   - addXxx / createXxx - 新增
   - updateXxx / editXxx - 修改
   - deleteXxx / removeXxx - 删除

优势：API 集中管理，修改只需改一处，统一错误处理`,
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

1. 路由来源
   - 路由不是硬编码，从后端获取菜单配置动态生成
   - 存储在 Redux store 中

2. 路由映射
   const ROUTETOCOMPONENTS = {
     '/plane_policy': loadable(() => import('./pages/plane_policy')),
   };

3. 权限菜单生成
   - 用户登录后获取权限菜单配置
   - 根据权限过滤可用路由
   - 动态生成左侧菜单

4. 按钮级权限
   const usePermission = (permission) => {
     const permissions = useSelector(state => state.user.permissions);
     return permissions.includes(permission);
   };

优势：菜单与权限解耦，支持不同企业客户的个性化配置`,
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

1. 签名算法
   - 参数按 key 字母排序
   - 拼接 key=value& 格式
   - 末尾拼接密钥
   - MD5 加密

2. 请求拦截器自动签名
   service.interceptors.request.use(config => {
     config.headers['X-Timestamp'] = Date.now();
     config.headers['X-Nonce'] = generateNonce();
     config.headers['X-Signature'] = getPhoebeSign(config.params);
     return config;
   });

3. 服务端验证
   - 检查 timestamp 是否在有效时间范围内（如 5 分钟）
   - 检查 nonce 是否已使用（防止重放）
   - 重新计算 signature 验证

优势：自动签名，应用层无感知，时间戳 + nonce 双重防重放`,
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

1. 使用 @loadable/component
   const SupplierPage = loadable(() => import('./pages/supplier'), {
     fallback: <div>Loading...</div>,
   });

2. Routes.jsx 配置
   const ROUTETOCOMPONENTS = {
     '/supplier': loadable(() => import('./pages/supplier')),
   };

3. 构建配置（Vite）
   rollupOptions: {
     output: {
       manualChunks: {
         'vendor-react': ['react', 'react-dom'],
         'vendor-antd': ['antd'],
       }
     }
   }

4. 预加载优化
   - Link 组件 onMouseEnter 时调用 .preload()
   - webpackPrefetch: true 空闲时预加载

效果：首屏加载体积减少 30%，用户只加载访问的页面`,
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

1. ESLint 配置（.eslintrc.js）
   - 使用 airbnb 规则
   - 禁用部分规则：camelcase, prop-types, import/extensions 等

2. Prettier 配置（.prettierrc）
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "es5",
     "tabWidth": 2
   }

3. VSCode 保存时格式化
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode"
   }

4. Git Hooks（可选）
   - pre-commit hook 检查
   - PR 流水线自动检查

效果：团队代码风格统一，减少 code review 格式问题`,
    tags: ['滴滴', 'ESLint', 'Prettier', '工程化'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-usememo-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: 'useMemo 在列表页面渲染优化中是如何使用的？',
    answer: `useMemo 优化实践：

1. 表格列配置缓存
   const columns = useMemo(() => [
     { title: 'ID', dataIndex: 'id' },
     { title: '名称', dataIndex: 'name', render: (val) => <MyParagraph content={val} /> },
   ], []); // 空依赖，只计算一次

2. 表格数据处理
   const tableData = useMemo(() => {
     return listData.map((item, index) => ({
       key: item.id || index,
       ...item,
       statusText: STATUS_MAP[item.status],
     }));
   }, [listData]);

3. 搜索参数构建
   const searchParams = useMemo(() => {
     const params = {};
     if (values.airline_code) params.airline_code = values.airline_code;
     return params;
   }, [values.airline_code]);

适用场景：复杂计算（排序、筛选）、派生数据、避免子组件不必要渲染`,
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

1. 表格操作回调
   const handleEdit = useCallback((record) => {
     setEditRecord(record);
     setEditModalVisible(true);
   }, []); // 空依赖，函数引用不变

2. 表单提交回调
   const handleSubmit = useCallback(async (values) => {
     setLoading(true);
     try {
       await submitData(values);
       message.success('提交成功');
     } finally {
       setLoading(false);
     }
   }, [submitData]);

3. 配合 React.memo 使用
   const SearchPanel = React.memo(({ onSearch }) => (
     <Button onClick={onSearch}>搜索</Button>
   ));

注意事项：
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

1. 基本用法
   const UserAvatar = memo(({ src, name }) => (
     <img src={src} alt={name} />
   ));

2. 自定义比较函数
   const ListItem = memo(({ item }) => (
     <div>{item.name}</div>
   ), (prevProps, nextProps) => {
     return prevProps.item.id === nextProps.item.id;
   });

3. 项目中实际使用
   - 文本省略组件：MyParagraph
   - 状态标签组件：StatusCell
   - 表格行组件：PolicyRow

适用场景：
- 数据展示组件（表格行、卡片）
- 纯展示组件，无内部状态
- 大量重复渲染的列表项

性能收益：列表渲染性能提升 50%+`,
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

1. 搜索框防抖（等待停止输入后执行）
   useEffect(() => {
     const timer = setTimeout(() => {
       if (searchValue) fetchResults(searchValue);
     }, 300); // 300ms 延迟
     return () => clearTimeout(timer);
   }, [searchValue]);

2. 自定义防抖 Hook
   export const useDebounce = (value, delay = 300) => {
     const [debouncedValue, setDebouncedValue] = useState(value);
     useEffect(() => {
       const handler = setTimeout(() => setDebouncedValue(value), delay);
       return () => clearTimeout(handler);
     }, [value, delay]);
     return debouncedValue;
   };

3. 按钮点击防重复
   const [submitting, setSubmitting] = useState(false);
   const handleSubmit = async () => {
     if (submitting) return;
     setSubmitting(true);
     try { await submitData(); } finally { setSubmitting(false); }
   };

场景选择：
- 防抖：搜索输入（等待用户停止输入）
- 节流：滚动加载、按钮点击（固定间隔执行）`,
    tags: ['滴滴', '防抖', '节流', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-ssd-002',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: 'SSD 智能体开发规范是什么？包含哪些核心组件？',
    answer: `SSD 规范体系：

1. 核心组件
   - Skills：技能封装，标准化 AI 操作
   - Rules：规则集，约束 AI 行为
   - Commands：命令模板，快速执行任务
   - CLAUDE.md：项目上下文同步

2. Skills 技能封装示例
   {
     name: 'jiazi-component-dev',
     description: '甲子项目 React 组件开发规范',
     prompts: ['新建页面组件', '添加列表页', '创建表单页'],
   }

3. 目录结构
   openspec/
   ├── changes/  # 变更记录
   │   └── {change_id}/
   │       ├── .openspec.yaml
   │       ├── proposal.md
   │       ├── design.md
   │       └── tasks.md
   └── templates/  # 模板库

效果：大需求开发周期缩短 30%，小需求处理时间减少 50%`,
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

1. 文件结构
   - CLAUDE.md：主配置文件（项目概述、技术栈、目录结构）
   - .claude/rules/：项目规则（ai-development.md, code-style.md）

2. 解决的问题
   | 问题 | 解决方案 |
   |------|----------|
   | AI 不理解项目架构 | 详细的项目概述 |
   | 技术栈版本冲突 | 明确版本约束（如 @didi/dajax 必须为 3.0.1） |
   | API 签名机制复杂 | 完整的示例代码 |
   | 代码风格不统一 | Prettier 配置说明 |

3. 维护策略
   - 新功能开发后同步更新
   - 重大重构时重新梳理
   - 团队成员均可编辑

效果：AI 辅助开发上下文理解一致性，降低团队协作成本`,
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

1. 需求分析阶段
   - Agent 阅读 PRD 文档
   - 生成需求理解确认书
   - 识别技术难点和风险点

2. 方案设计阶段
   - 生成技术方案文档
   - 提供多个可选方案
   - 评估各方案优缺点

3. 代码实现阶段
   - 基于 OpenSpec 规范生成代码
   - 自动添加注释
   - 遵循代码规范

4. 测试阶段
   - 生成测试用例
   - 辅助问题定位
   - 提供修复建议

5. 审查阶段
   - 代码 Review
   - 检查潜在 bug
   - 提示性能问题

效果数据：
- 大需求开发周期缩短 30%
- 代码缺陷率降低 20%`,
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

1. 触发时机
   - PR 创建时自动触发
   - 定时全量扫描
   - 手动触发

2. 审查维度
   - 代码规范：ESLint/Prettier
   - 性能隐患：内存泄漏、循环引用
   - 安全风险：XSS、SQL注入（检测 eval、innerHTML）
   - 业务逻辑：边界条件、空值处理

3. 审查输出示例
   ## 代码审查报告
   - [高] 第 23 行：useEffect 依赖导致循环调用
   - [中] 第 45 行：未使用 useMemo 优化
   - [低] 第 67 行：缺少分号
   建议：使用 useCallback 缓存函数

4. 效果
   - 发现潜在问题 30%+
   - 人工 review 效率提升
   - 团队代码质量提升`,
    tags: ['滴滴', 'AI代码审查', '代码质量'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-api-design-001',
    module: 'projects',
    chapterId: 'didi',
    category: '技术选型',
    question: '前后端 API 接口设计是如何规范的？',
    answer: `API 接口设计规范：

1. RESTful 风格
   GET  /api/flight/huidu/company/specialPolicy/queryList/v1.0
   POST /api/flight/huidu/company/specialPolicy/add/v1.0
   POST /api/flight/huidu/company/specialPolicy/update/v1.0

2. 请求参数规范
   - 分页：page_num, page_size
   - 排序：sort_by, sort_order
   - 过滤：filters（JSON 字符串）

3. 响应格式统一
   {
     "errno": 0,
     "errmsg": "success",
     "data": { "content": [], "total_num": 100 }
   }

4. 错误码设计
   - 1xxx：客户端错误（参数错误、权限不足）
   - 2xxx：服务端错误（服务器错误、数据库错误）
   - 3xxx：业务错误（政策已存在、已过期）`,
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

1. 脱敏场景
   - 手机号：13812345678 → 138****5678
   - 银行卡：6222021234567890123 → 6222 **** **** 0123
   - 身份证：110101199001011234 → 110101********1234
   - 邮箱：zhangsan@email.com → z***n@email.com

2. 实现代码
   export const maskPhone = (phone) => {
     if (!phone) return '';
     return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
   };

   export const maskIdCard = (idCard) => {
     if (!idCard) return '';
     return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
   };

3. 使用方式
   const columns = [
     { title: '手机号', dataIndex: 'phone', render: (val) => maskPhone(val) },
   ];

4. 注意
   - 前端脱敏只是展示层安全
   - 敏感数据应由后端返回脱敏后的数据`,
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

1. 问题背景
   0.1 + 0.2 = 0.30000000000000004（JavaScript 浮点数精度问题）

2. 解决方案：整数计算
   const add = (a, b) => {
     const aInt = Math.round(a * 100);
     const bInt = Math.round(b * 100);
     return (aInt + bInt) / 100;
   };

   const multiply = (a, b) => {
     const aInt = Math.round(a * 100);
     return Math.round(aInt * b) / 100;
   };

3. 单位转换
   - 提交时：元 -> 分（yuanToFen）
   - 接收时：分 -> 元（fenToYuan）

4. 展示格式化
   export const formatMoney = (amount) => {
     if (amount == null) return '0.00';
     return Number(amount).toFixed(2);
   };

注意要点：
- 后端也要统一精度处理
- 展示时格式化（千分位、货币符号）
- 存储和传输使用整数`,
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

1. 封装统一 API
   const PREFIX = 'jiazi_';
   export const browserStorage = {
     setSessionStorage: (key, value) => {
       sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
     },
     getSessionStorage: (key) => {
       return JSON.parse(sessionStorage.getItem(PREFIX + key));
     },
     // localStorage 同理
   };

2. 选择策略
   | 场景 | 存储方式 | 原因 |
   |------|----------|------|
   | 用户登录态 | sessionStorage | 相对安全，标签页关闭清除 |
   | 搜索关键词 | sessionStorage | 单次会话 |
   | 表单草稿 | sessionStorage | 页面关闭丢失 |
   | 主题配置 | localStorage | 持久化 |
   | 敏感信息 | 禁止存储 | 安全考虑 |

3. 注意
   - 使用 try-catch 包裹（防止配额满）
   - 添加前缀避免命名冲突
   - 敏感信息使用内存或 HttpOnly Cookie`,
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
    answer: `请求/响应拦截器设计：

1. 请求拦截器
   service.interceptors.request.use(config => {
     // 添加用户信息
     config.headers['X-User-Id'] = userInfo.userId;

     // 添加签名
     config.headers['X-Timestamp'] = Date.now();
     config.headers['X-Nonce'] = generateNonce();
     config.headers['X-Signature'] = generateSignature(config);

     // 添加租户信息
     config.headers['X-Tenant-Id'] = userInfo.tenantId;

     return config;
   });

2. 响应拦截器
   service.interceptors.response.use(
     (response) => {
       if (data.errno !== 0) {
         message.error(data.errmsg);
         return Promise.reject(data);
       }
       return data;
     },
     (error) => {
       if (error.response?.status === 401) {
         message.error('登录已过期');
         window.location.href = '/login';
       }
       return Promise.reject(error);
     }
   );

效果：统一处理签名、用户信息、统一错误提示、统一登录过期处理`,
    tags: ['滴滴', '拦截器', 'HTTP', 'axios'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-business-001',
    module: 'projects',
    chapterId: 'didi',
    category: '业务理解',
    question: '滴滴企业版商旅系统主要解决什么问题？',
    answer: `商旅系统业务理解：

1. 核心问题
   - 企业员工差旅出行需求（机票、酒店、火车票）
   - 企业差旅费用管控
   - 供应商资源管理

2. 系统模块
   - 供应商管理：国内外供应商引入、审核、上下架
   - 机票政策：普通/特殊政策管理，审批流配置
   - 差旅配置：企业差旅规则、审批流程、品类开关
   - 酒店管理：静态数据、渠道价格、排序规则
   - 配置管理：功能开关、业务配置、灰度发布

3. 用户角色
   - 企业管理员：配置企业差旅规则
   - 供应商：管理资源上/下架
   - 运营人员：审核、管理日常工作
   - 员工：预订差旅服务

4. 业务价值
   - 57 个业务模块全覆盖
   - 企业差旅一站式管理
   - 成本管控和效率提升`,
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

1. 模块划分策略
   src/pages/
   ├── 机票相关 (12个)
   │   ├── plane_policy/      # 机票政策
   │   ├── plane_basic_data/  # 基础数据
   │   └── plane_supplier/    # 航司供应商
   ├── 酒店相关 (10个)
   │   ├── trust/             # 酒店托管
   │   └── supplier/          # 酒店供应商
   ├── 火车票相关 (3个)
   ├── 用车相关 (3个)
   ├── 配置与权限 (10个)
   └── 其他 (约20个)

2. 目录结构规范
   - 每个模块独立目录
   - 内部按 page/components/services 常量划分
   - 共享代码提取到公共目录

3. 代码复用
   - 公共组件：src/components/
   - 公共工具：src/utils/
   - 公共服务：src/services/
   - 公共常量：src/constants/

优势：职责清晰，便于团队分工，修改影响范围可控`,
    tags: ['滴滴', '模块化', '目录结构'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-schema-error-001',
    module: 'projects',
    chapterId: 'didi',
    category: '架构设计',
    question: '当业务方配置了非法的 JSON Schema（如循环引用、不存在的组件名）时，动态表单引擎是如何处理的？',
    answer: `非法 Schema 的容错处理：

1. 循环引用检测
   const detectCircularRef = (schema, path = []) => {
     if (path.includes(schema)) {
       throw new Error('检测到循环引用');
     }
     // 递归检测
   };

2. 组件名不存在处理
   const COMPONENT_REGISTRY = {
     Input: InputComponent,
     Select: SelectComponent,
   };

   const resolveComponent = (type) => {
     if (!COMPONENT_REGISTRY[type]) {
       console.warn('组件不存在，使用默认 Fallback');
       return FallbackComponent;
     }
     return COMPONENT_REGISTRY[type];
   };

3. 校验规则异常处理
   const normalizeRules = (rules) => {
     if (rules.min > rules.max) {
       return { min: undefined, max: undefined };
     }
     return rules;
   };

4. UI 层优雅降级
   - 不白屏崩溃
   - 显示友好错误提示
   - 不影响其他正常表单

效果：防御性编程，假设配置可能非法，兜底保证不崩溃`,
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

1. 定价策略抽象
   const PricingModel = {
     basePrice: 100,
     rules: [
       { type: 'discount', value: 0.85, condition: (ctx) => ctx.userType === 'vip' },
       { type: 'full_reduce', threshold: 200, reduce: 20 },
       { type: 'time', value: -20, condition: (ctx) => ctx.advanceDays >= 7 },
     ],
     calculate: (ctx) => {
       let price = model.basePrice;
       for (const rule of model.rules) {
         if (rule.condition(ctx)) {
           price = applyRule(price, rule);
         }
       }
       return price;
     }
   };

2. 规则类型实现
   const ruleExecutors = {
     discount: (price, rule) => price * rule.value,
     subtract: (price, rule) => price - rule.value,
     full_reduce: (price, rule) => price >= rule.threshold ? price - rule.reduce : price,
   };

3. 前后端配合
   - 后端存储定价规则到数据库
   - 前端配置化生成表单

优势：配置化而非硬编码，新业务只需添加规则无需改代码，支持规则组合`,
    tags: ['滴滴', '定价模型', '规则引擎', '策略模式'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'didi-preload-timing-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '路由预加载的具体时机是如何判断的？如果预加载资源很大，如何避免影响当前页面加载？',
    answer: `预加载策略详解：

1. 预加载时机选择
   - 鼠标悬停预加载：onMouseEnter 时调用 component.preload()
   - 空闲时间预加载：requestIdleCallback
   - 基于用户行为预测：登录页预加载首页

2. 带宽竞争处理
   const shouldPrefetch = () => {
     const nav = navigator.connection;
     return nav?.effectiveType === '4g'; // 4G 或有线网络才预加载
   };

3. 优先级控制
   - webpackPrefetch: true（空闲时预加载，不阻塞）
   - webpackPreload: true（立即预加载，会阻塞）

4. Resource Hints
   <link rel="prefetch" as="script" href="/supplier.js">
   <link rel="preload" as="script" href="/bundle.js">

效果数据：
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

1. 分析工具
   - Webpack Bundle Analyzer：生成 bundle 报告
   - rollup-plugin-visualizer：Vite 环境分析

2. 典型优化案例

   Case 1: lodash → lodash-es
   import cloneDeep from 'lodash-es/cloneDeep';
   结果：lodash 包从 70KB → 3KB

   Case 2: moment.js → dayjs
   import dayjs from 'dayjs';
   结果：moment 300KB+ → dayjs 2KB

   Case 3: Ant Design 按需引入
   使用 babel-plugin-import 自动按需引入

3. 其他优化手段
   - 图片压缩：image-webpack-loader（30%+）
   - 代码压缩：terser-webpack-plugin（40%+）
   - Tree Shaking：ES Module（20%+）
   - CDN 引入：external 配置（50%+）
   - gzip 压缩：服务端开启（70%+）

最终效果：
- 首屏 JS 减少 45%
- 整体包体积减少 30%`,
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

1. 受控（Controlled）与非受控模式兼容
   const SearchSelect = ({
     value,          // 受控模式
     onChange,
     loading,        // 外部控制 loading
     defaultValue,   // 非受控模式
   }) => {
     const isControlled = value !== undefined;
     const currentValue = isControlled ? value : internalValue;
   };

2. 暴露的接口设计

   | 接口类型 | 示例 | 说明 |
   |----------|------|------|
   | 数据相关 | value/onChange | 受控模式入口 |
   | 加载状态 | loading | 外部控制请求状态 |
   | 数据注入 | options | 外部传入数据 |
   | 事件回调 | onSearch | 搜索事件通知 |
   | 方法暴露 | ref.search() | 主动触发搜索 |
   | 缓存控制 | cacheKey | 相同 key 复用数据 |

3. 使用示例
   <SupplierSelect
     value={selectedSupplier}
     onChange={setSelectedSupplier}
     loading={loading}
     onSearch={handleSearch}
     cacheKey="supplier-list"
     ref={supplierSelectRef}
   />

设计原则：保持内部状态简洁，受控/非受控兼容，暴露必要的控制力`,
    tags: ['滴滴', '组件设计', '受控模式', 'API设计'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-openspec-challenge-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'AI集成',
    question: '制定 OpenSpec 标准容易，但推行难。AI 生成代码经常不符合标准（如 ESLint 报错或用了危险 API），你是怎么解决的？',
    answer: `OpenSpec 落地挑战解决方案：

1. System Prompt 约束
   在 AI 的 System Prompt 中明确写入规范：
   - 禁止使用 any 类型，必须显式声明类型
   - 禁止使用 eval、new Function 等危险 API
   - 组件必须使用 React.FC 声明

2. 后处理（Post-process）机制
   const postProcess = (code) => {
     // 1. 类型修复
     code = code.replace(/: any/g, ': unknown');
     // 2. 危险 API 检测
     if (code.includes('eval(')) throw new Error('检测到危险 API');
     // 3. 自动格式化
     code = prettier.format(code);
     // 4. ESLint 自动修复
     code = eslintFix(code);
     return code;
   };

3. 人工审核环节
   AI 生成 → 自动执行 ESLint + Prettier → 显示修复建议 → 人工确认 → 合并

4. 错误反馈循环
   将错误信息反馈给 AI，让其修复

效果：
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

1. AI 适合的场景

   | 场景 | 适用程度 |
   |------|----------|
   | 生成单元测试 | ★★★★★ 高 |
   | 代码注释/文档 | ★★★★☆ 高 |
   | 模式识别/总结 | ★★★☆☆ 中 |
   | 复杂逻辑设计 | ★★☆☆☆ 低 |
   | 架构决策 | ★☆☆☆☆ 低 |

2. 实际工作分配

   AI 负责（80%）：
   - 生成单元测试
   - 代码注释/JSDoc
   - 文档生成

   人类负责（20%）：
   - Schema 设计决策
   - 拆解策略制定
   - 业务逻辑把控

3. 重构工作流
   1. 人工分析：分析代码依赖关系，确定拆解顺序
   2. AI 辅助理解：生成代码文档，识别循环依赖
   3. AI 生成测试：为旧代码生成单元测试
   4. 人工实现新逻辑：实现新的 Schema 引擎
   5. AI 对比差异：验证新旧逻辑等价

客观认知：AI 是辅助工具，不是决策者。重构的安全感来自测试，不是 AI。`,
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

1. 什么是 SSD
   SSD = Smart Specification Driven
   智能体规范驱动开发

2. 对比普通 Prompt

   | 维度 | 普通 Prompt | SSD 智能体 |
   |------|-------------|------------|
   | 形式 | 一次性对话 | 持久化配置 |
   | 约束力 | 低 | 高 |
   | 复用性 | 低 | 高 |
   | 标准化 | 无 | 有 |
   | 项目理解 | 每次需要说明 | 自动理解 |
   | 上下文保持 | 无 | 有 |

3. 核心能力
   - 项目理解：通过 CLAUDE.md 理解项目
   - 规范遵循：自动遵循代码规范
   - 上下文保持：多轮对话不丢失信息
   - 智能推断：根据上下文推断意图

4. 一句话总结
   SSD 智能体 = 了解项目的 AI 助手
   普通提示词是"陌生人"，SSD 智能体是"了解项目的同事"`,
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