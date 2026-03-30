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
原系统使用 jQuery + 硬编码表单配置，维护困难，每次加字段都要改代码

T (任务)：
将硬编码转为配置驱动，提升研发效率

A (行动)：
1. 设计配置 Schema（字段定义、校验规则、依赖关系）
2. 开发配置编辑器可视化工具
3. 编写 Schema 校验（zod/ajv）
4. 灰度上线，逐步迁移旧配置

R (结果)：
• 表单开发时间从 3天 → 0.5天
• 代码量减少 60%
• 0 线上事故`,
    tags: ['滴滴', '重构', '配置驱动'],
    status: 'unvisited',
    difficulty: 'hard',
    extendQuestion: '配置 Schema 如何设计能够兼顾扩展性和可维护性？',
  },
  {
    id: 'didi-config-001',
    module: 'projects',
    chapterId: 'didi',
    category: '配置驱动',
    question: '硬编码转配置驱动，配置 Schema 如何设计？',
    answer: `Schema 设计要点：

interface ComponentConfig {
  type: 'input' | 'select' | 'date';
  name: string;
  label: string;
  rules?: ValidationRule[];
  visible?: Condition;
  default?: any;
}

关键设计原则：
1. 声明式而非命令式
2. 支持嵌套和组合
3. 有明确的类型定义（TypeScript）
4. 支持校验规则内联`,
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
• 规范文档 = 需求 + 验收标准
• AI 读懂规范后生成代码
• 代码必须符合规范
• 有人工审核环节`,
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
   → 规范版本化，可单独管理`,
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
React.lazy + Suspense 按需加载
const Home = lazy(() => import('./pages/Home'));

预加载策略：
1. 空闲预加载：requestIdleCallback
2. 鼠标悬停预加载：onMouseEnter
3. IntersectionObserver：内容进入视口前预加载

关键指标：
• FCP 从 3.2s → 1.8s
• 首屏 JS 减少 45%
• 弱网环境下白屏时间减少 50%`,
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

### 1. 状态分散问题
- 原来：用户信息、权限、菜单分散在不同组件
- 现在：集中到 Redux Store 统一管理

### 2. 异步请求处理
- Redux Thunk 支持异步 action
- 允许 action 返回函数，封装异步逻辑

### 3. 数据流可预测
- 单一数据源
- 每次状态变化都有记录（配合 Redux DevTools）

### 实现方案：
\`\`\`javascript
// actions/user.actions.js
export const getUserInfo = () => {
  return dispatch => {
    dispatch({ type: 'USER/REQUEST' });
    userService.getInfo().then(data => {
      dispatch({ type: 'USER/SUCCESS', payload: data });
    });
  };
};
\`\`\`

### 适用场景：
- 用户登录信息全局共享
- 权限、菜单动态生成
- 多组件共享的表单数据`,
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

### 功能需求
- 国内外供应商的引入、审核、上下架
- 批量导入、批量审核、批量上下架

### 技术实现
1. **Table 选择批量**
   - 使用 Ant Design Table 的 rowSelection
   - 支持全选、单选、跨页选择

2. **批量操作栏**
   - 底部固定操作栏，显示已选数量
   - 支持批量删除、批量审核、批量导出

3. **防抖处理**
   - 批量操作前防抖，避免重复提交
   - 使用 lodash.debounce 或自定义 hook

4. **进度反馈**
   - 大批量操作显示 progress 进度条
   - 支持取消操作

### 代码示例：
\`\`\`javascript
const handleBatch = async (selectedIds) => {
  for (const id of selectedIds) {
    await supplierService.updateStatus(id, 'online');
  }
  message.success('批量操作成功');
};
\`\`\`

### 效率提升：
- 单功能开发效率提升 40%（AI 辅助）
- 批量操作从手动逐个处理改为自动化`,
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
├── pages/          # 页面组件（57个业务模块）
├── components/     # 可复用UI组件
├── services/       # API请求封装（~50个service文件）
├── actions/        # Redux actions
├── reducers/       # Redux reducers
├── utils/          # 工具函数
├── constants/      # 常量配置
├── helpers/        # 辅助函数（store创建等）
├── models/         # 数据模型
└── Routes.jsx      # 路由定义
\`\`\`

### 分层原则：
1. **pages/** - 业务页面，按模块划分（supplier, flight, hotel等）
2. **services/** - API服务层，每个模块对应一个service文件
3. **actions/reducers** - Redux 数据层，分离关注点
4. **utils/** - 工具函数，纯函数优先
5. **constants/** - 常量配置，减少魔法值

### 优势：
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

### 1. 文件组织
- 按业务模块划分：supplier.service.js, hotel.service.js, flight.service.js
- 统一在 services/index.js 导出

### 2. 请求封装（基于 @didi/dajax）
\`\`\`javascript
// supplier.service.js
import axios from '@didi/dajax';

export const supplierService = {
  getList: (params) => axios.get('/api/supplier/list', { params }),
  add: (data) => axios.post('/api/supplier/add', data),
  update: (id, data) => axios.put(\`/api/supplier/\${id}\`, data),
  delete: (id) => axios.delete(\`/api/supplier/\${id}\`),
};
\`\`\`

### 3. 统一管理
- 所有 service 统一导出：export * from './supplier.service'
- 配合 ESLint import 规则检查未使用导入

### 4. 类型约束（TypeScript 逐步迁移）
- 定义请求参数接口
- 统一错误处理

### 优势：
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

### 1. 路由配置结构
\`\`\`javascript
const routes = [
  {
    path: '/supplier',
    component: SupplierPage,
    permission: 'supplier:view',
  },
  {
    path: '/flight',
    component: FlightPage,
    permission: 'flight:view',
  },
];
\`\`\`

### 2. 权限菜单生成
- 用户登录后获取权限菜单配置
- 根据权限过滤可用路由
- 动态生成左侧菜单

### 3. 路由守卫
\`\`\`javascript
const ProtectedRoute = ({ permission, children }) => {
  const { userPermissions } = useAuth();
  if (!userPermissions.includes(permission)) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};
\`\`\`

### 4. 按钮级权限
- 使用 HOC 或自定义 Hook 封装
- 控制页面内按钮的显示/隐藏

### 优势：
- 菜单与权限解耦
- 支持不同企业客户的个性化配置
- 安全性保障`,
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

### 2. 签名算法（sign.js）
\`\`\`javascript
// Phoebe签名实现
getPhoebeSign(params) {
  // 1. 按key字母排序参数
  const sorted = Object.keys(params).sort();
  // 2. 拼接 key=value& 格式
  const signStr = sorted.map(k => \`\${k}=\${params[k]}\`).join('&');
  // 3. 末尾拼接密钥
  const finalStr = signStr + 'phoebe_123_111_!@#_';
  // 4. MD5加密
  return md5(finalStr);
}
\`\`\`

### 3. 请求拦截器自动签名
\`\`\`javascript
// request.js
service.interceptors.request.use(config => {
  if (isHotelApi(config.url)) {
    config.headers['app-id'] = APP_ID;
    config.headers['timestamp'] = Date.now();
    config.headers['nonce'] = generateNonce();
    config.headers['sign'] = getPhoebeSign(config.params);
  }
  return config;
});
\`\`\`

### 4. 优势
- 自动签名，应用层无感知
- 时间戳防止重放（设置有效期）
- nonce 防止重放攻击`,
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

const SupplierPage = loadable(() => import('./pages/supplier'), {
  fallback: <div>Loading...</div>,
});
\`\`\`

### 2. Routes.jsx 配置
\`\`\`javascript
<Switch>
  <Route path="/supplier" component={SupplierPage} />
  <Route path="/hotel" component={HotelPage} />
  <Route path="/flight" component={FlightPage} />
</Switch>
\`\`\`

### 3. Webpack 输出配置
\`\`\`javascript
// webpack.config.js
output: {
  filename: '[name].[contenthash].js',
  chunkFilename: '[id].[name].[contenthash].js',
}
\`\`\`

### 4. 性能效果
- 首屏加载体积减少 30%
- 按需加载，用户只加载访问的页面
- 浏览器缓存优化（contenthash）

### 5. 注意事项
- 预加载策略避免用户等待
- 错误边界处理加载失败
- SSR 兼容（@loadable/server）`,
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
  extends: [
    'eslint:recommended',
    'react-app',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
  },
};
\`\`\`

### 2. Prettier 配置（.prettierrc.js）
\`\`\`javascript
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
};
\`\`\`

### 3. VSCode 保存时格式化
\`\`\`json
// settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
\`\`\`

### 4. CI/CD 集成
- pre-commit hook 检查
- PR 流水线自动检查
- 不符合规范无法合并

### 5. 效果
- 团队代码风格统一
- 减少 code review 格式问题
- 提升代码可维护性`,
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

### 1. 缓存计算属性
\`\`\`javascript
const MyComponent = ({ data }) => {
  // 避免每次渲染都重新计算
  const sortedData = useMemo(() => {
    return data
      .filter(item => item.status === 'active')
      .sort((a, b) => b.score - a.score);
  }, [data]);

  // 依赖项变化才重新计算
  const totalCount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  return <List data={sortedData} total={totalCount} />;
};
\`\`\`

### 2. 避免对象引用问题
\`\`\`javascript
// 错误：每次渲染都创建新对象
const options = { pageSize: 10, showHeader: true };

// 正确：使用 useMemo 缓存
const options = useMemo(() => ({
  pageSize: 10,
  showHeader: true,
}), []);
\`\`\`

### 3. 适用场景
- 复杂计算（排序、筛选、汇总）
- 派生数据
- 避免子组件不必要渲染

### 4. 性能指标
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

### 1. 缓存事件回调
\`\`\`javascript
const MyComponent = ({ onSubmit }) => {
  // 避免子组件不必要渲染
  const handleClick = useCallback((id) => {
    console.log('clicked', id);
    onSubmit(id);
  }, [onSubmit]);

  return <Button onClick={handleClick}>Submit</Button>;
};
\`\`\`

### 2. 配合 React.memo
\`\`\`javascript
// 子组件使用 memo
const ListItem = memo(({ onClick, item }) => (
  <div onClick={() => onClick(item.id)}>{item.name}</div>
));

// 父组件使用 useCallback
const Parent = () => {
  const handleItemClick = useCallback((id) => {
    console.log(id);
  }, []);

  return items.map(item => (
    <ListItem key={item.id} item={item} onClick={handleItemClick} />
  ));
};
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

### 4. 注意事项
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

### 3. 适用场景
- 数据展示组件（表格行、卡片）
- 纯展示组件，无内部状态
- 大量重复渲染的列表项

### 4. 性能收益
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
const SearchInput = () => {
  const [keyword, setKeyword] = useState('');

  // 防抖：停止输入 300ms 后才请求
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword) fetchResults(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  return <input value={keyword} onChange={e => setKeyword(e.target.value)} />;
};
\`\`\`

### 2. 按钮节流
\`\`\`javascript
const submitForm = useCallback(
  throttle(() => {
    api.submit();
  }, 1000),
  []
);

// 或自定义 Hook
const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};
\`\`\`

### 3. 请求拦截器层处理
\`\`\`javascript
// request.js 统一处理
let pendingRequests = new Map();

const addPendingRequest(config) {
  const key = config.url + JSON.stringify(config.params);
  if (pendingRequests.has(key)) {
    return config; // 忽略重复请求
  }
  pendingRequests.set(key, config);
  return config;
}
\`\`\`

### 4. 使用场景
- 搜索框输入
- 表单提交按钮
- 滚动加载
- 窗口 resize`,
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

### 1. 核心组件

| 组件 | 作用 |
|------|------|
| Skills | 技能封装，标准化 AI 操作 |
| Rules | 规则集，约束 AI 行为 |
| Commands | 命令模板，快速执行任务 |
| CLAUDE.md | 项目上下文同步 |

### 2. Skills 技能封装
\`\`\`javascript
// jiazi-component-dev Skill
{
  name: 'jiazi-component-dev',
  description: '甲子项目 React 组件开发规范',
  prompts: [
    '新建页面组件',
    '添加列表页',
    '创建表单页',
    '封装公共组件',
  ],
}
\`\`\`

### 3. Rules 规则集
- 代码风格规则
- 安全规范
- 性能规范
- 注释规范

### 4. Commands 命令模板
- /dev-survey 需求分析
- /proposal-gen 方案生成
- /project-sum 项目总结

### 5. 效果
- 大需求开发周期缩短 30%
- 小需求平均处理时间减少 50%
- 团队协作成本降低`,
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
# 甲子商旅运营系统

## 项目概述
- 技术栈：React 17, Ant Design 4.x, Redux
- 目录结构：pages/services/actions/reducers

## 开发规范
- Prettier: tabSize=2
- @didi/dajax 版本必须为 3.0.1

## API 签名
- Phoebe 签名机制
- MD5 + timestamp + nonce
\`\`\`

### 2. 解决的问题

| 问题 | 解决方案 |
|------|----------|
| AI 不理解项目架构 | 详细的项目概述 |
| 技术栈版本冲突 | 明确版本约束 |
| API 签名机制复杂 | 完整的示例代码 |
| 代码风格不统一 | Prettier 配置说明 |

### 3. 维护策略
- 新功能开发后同步更新
- 重大重构时重新梳理
- 团队成员均可编辑

### 4. 效果
- AI 辅助开发上下文理解一致性
- 降低团队协作成本
- 新人入职快速上手`,
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

### 1. 需求分析阶段
- Agent 阅读 PRD 文档
- 生成需求理解确认书
- 识别技术难点和风险点

### 2. 方案设计阶段
- 生成技术方案文档
- 提供多个可选方案
- 评估各方案优缺点

### 3. 代码实现阶段
- 生成代码骨架
- 实现核心逻辑
- 编写单元测试

### 4. 测试阶段
- 生成测试用例
- 辅助问题定位
- 提供修复建议

### 5. 实践示例
\`\`\`bash
# 使用 Agent 辅助开发
claude -p "实现供应商批量导入功能，包含：
1. Excel 文件上传
2. 数据解析和校验
3. 批量提交
4. 进度反馈"
\`\`\`

### 6. 效果数据
- 大需求开发周期缩短 30%
- 代码缺陷率降低 20%
- 文档完整性提升 40%`,
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

### 1. 触发时机
- PR 创建时自动触发
- 定时全量扫描
- 手动触发

### 2. 审查维度

| 维度 | 检查内容 |
|------|----------|
| 代码规范 | ESLint/Prettier |
| 性能隐患 | 内存泄漏、循环引用 |
| 安全风险 | XSS、SQL注入 |
| 业务逻辑 | 边界条件、空值处理 |

### 3. AI 辅助方式
\`\`\`bash
# 使用 Claude Code 进行代码审查
claude -p "审查以下代码的安全性问题：

const UserDisplay = ({ user }) => (
  <div dangerouslySetInnerHTML={{__html: user.bio}} />
);
"
\`\`\`

### 4. 输出报告
- 问题等级：Critical / Major / Minor
- 修复建议
- 参考文档链接

### 5. 效果
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
GET    /api/supplier        # 获取列表
POST   /api/supplier        # 创建
PUT    /api/supplier/:id    # 更新
DELETE /api/supplier/:id    # 删除
\`\`\`

### 2. 请求参数规范
- 分页：page, pageSize
- 排序：sortBy, sortOrder
- 过滤：filters（JSON 字符串）

### 3. 响应格式统一
\`\`\`javascript
{
  "status": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
\`\`\`

### 4. 错误码设计
\`\`\`javascript
const ERROR_CODES = {
  1001: '参数错误',
  1002: '权限不足',
  1003: '资源不存在',
  2001: '服务器错误',
};
\`\`\`

### 5. 文档生成
- 使用 Swagger/OpenAPI
- AI 辅助生成接口文档
- 前后端协作效率提升`,
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

### 1. 脱敏场景
- 手机号：138****5678
- 银行卡：6222 **** **** 1234
- 身份证号：310110****12345678
- 邮箱：j***@example.com

### 2. 实现代码
\`\`\`javascript
// utils/encryptData.js
export const encryptData = {
  // 手机号脱敏
  mobile: (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  // 银行卡脱敏
  bankCard: (card) => {
    if (!card) return '';
    return card.replace(/(\d{4})\s*\d{4}\s*\d{4}\s*(\d{4})/, '$1 **** **** $2');
  },

  // 身份证脱敏
  idCard: (id) => {
    if (!id) return '';
    return id.replace(/(\d{6})\d{8}(\d{4})/, '$1****$2');
  },

  // 邮箱脱敏
  email: (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    return name[0] + '***@' + domain;
  },
};
\`\`\`

### 3. 使用场景
- 列表页展示
- 详情页查看
- 日志记录
- 数据导出

### 4. 权限控制
- 根据用户权限决定是否脱敏
- 管理员可查看完整数据`,
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

### 1. 问题背景
\`\`\`javascript
// JavaScript 浮点数精度问题
0.1 + 0.2 = 0.30000000000000004
1.1 + 0.1 = 1.2000000000000002
\`\`\`

### 2. 解决方案：整数计算
\`\`\`javascript
// utils/currency.js
const precision = 100; // 放大倍数

export const numAdd = (a, b) => {
  const aInt = Math.round(a * precision);
  const bInt = Math.round(b * precision);
  return (aInt + bInt) / precision;
};

export const numSub = (a, b) => {
  const aInt = Math.round(a * precision);
  const bInt = Math.round(b * precision);
  return (aInt - bInt) / precision;
};

export const numMul = (a, b) => {
  return Math.round(a * precision * b) / (precision * precision);
};

export const numDiv = (a, b) => {
  return Math.round(a * precision * precision) / (b * precision);
};
\`\`\`

### 3. 实际应用
\`\`\`javascript
// 订单金额计算
const total = numAdd(price, serviceFee);
const discount = numMul(total, discountRate);
const finalPrice = numSub(total, discount);
\`\`\`

### 4. 注意要点
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

### 1. 封装统一 API
\`\`\`javascript
// utils/browserStorage.js
export const browserStorage = {
  // localStorage
  getLocalStorage: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  setLocalStorage: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // sessionStorage
  getSessionStorage: (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  },
  setSessionStorage: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
};
\`\`\`

### 2. 选择策略

| 场景 | 存储方式 | 原因 |
|------|----------|------|
| 用户登录态 | localStorage | 持久化 |
| 搜索关键词 | sessionStorage | 单次会话 |
| 表单草稿 | sessionStorage | 页面关闭丢失 |
| 主题配置 | localStorage | 持久化 |
| 敏感信息 | sessionStorage | 页面关闭清除 |

### 3. 错误处理
- JSON.parse 异常捕获
- 存储满时提示用户
- 隐私数据加密存储

### 4. 替代方案
- IndexedDB：大量结构化数据
- Cookie：需要发送服务端的少量数据`,
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

### 1. 请求拦截器
\`\`\`javascript
// utils/request.js
service.interceptors.request.use(
  (config) => {
    // 环境一致性校验
    if (!checkEnvConsistency(config.url)) {
      throw new Error('环境不匹配');
    }

    // 添加 token
    const token = getToken();
    config.headers['Authorization'] = \`Bearer \${token}\`;

    // POST Content-Type 处理
    if (config.method === 'post') {
      if (config.url.includes('hotel/flight/insurance')) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    // API 签名
    if (isPhoebeApi(config.url)) {
      addSignature(config);
    }

    return config;
  },
  (error) => Promise.reject(error)
);
\`\`\`

### 2. 响应拦截器
\`\`\`javascript
service.interceptors.response.use(
  (response) => {
    const { status, data, config } = response;

    // 状态码处理
    if (status === 3) {
      redirectToLogin();
    }

    // 错误信息附加请求URL
    if (status === 99) {
      handleError(data, config.url);
    }

    return response;
  },
  (error) => {
    // 网络错误处理
    handleNetworkError(error);
    return Promise.reject(error);
  }
);
\`\`\`

### 3. 统一错误处理
- 错误码映射
- 错误提示优化
- 错误日志上报

### 4. 效果
- 代码重复减少 60%
- 错误处理一致性
- 调试效率提升`,
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

### 1. 核心问题
- 企业员工差旅出行需求（机票、酒店、火车票）
- 企业差旅费用管控
- 供应商资源管理

### 2. 系统模块

| 模块 | 功能 |
|------|------|
| 供应商管理 | 国内外供应商引入、审核、上下架 |
| 机票政策 | 普通/特殊政策管理，审批流配置 |
| 差旅配置 | 企业差旅规则、审批流程、品类开关 |
| 酒店管理 | 静态数据、渠道价格、排序规则 |
| 配置管理 | 功能开关、业务配置、灰度发布 |

### 3. 用户角色
- 企业管理员：配置企业差旅规则
- 供应商：管理资源上/下架
- 运营人员：审核、管理日常工作
- 员工：预订差旅服务

### 4. 业务价值
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

### 1. 模块划分策略
\`\`\`
src/pages/
├── supplier/      # 供应商管理
├── flight/        # 机票相关
│   ├── policy/   # 政策管理
│   ├── supplier/ # 供应商
│   └── price/    # 价格管理
├── hotel/        # 酒店相关
├── train/        # 火车票
├── config/       # 配置管理
└── ...           # 其他模块
\`\`\`

### 2. 目录结构规范
- 每个模块独立目录
- 内部按 page/components/services 常量划分
- 共享代码提取到公共目录

### 3. 代码复用
- 公共组件：src/components/
- 公共工具：src/utils/
- 公共服务：src/services/
- 公共常量：src/constants/

### 4. 模块间通信
- Redux 跨模块状态共享
- 事件总线（少量场景）
- 父组件层层传递（尽量避免）

### 5. 优势
- 职责清晰
- 便于团队分工
- 修改影响范围可控`,
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
