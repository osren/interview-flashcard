# 基础设施规范

## 本项目为纯前端应用

无后端服务依赖，所有数据存储方式：

### localStorage

- Zustand persist 中间件自动持久化
- Key: `card-storage` (进度数据)

### 文件系统

无服务端文件存储，所有静态数据在 `src/data/` 目录。

### 外部依赖

- CDN 资源 (如有)
- API 接口 (如有)

## 开发环境

```
npm run dev      # 开发服务器
npm run build   # TypeScript 检查 + 生产构建
npm run lint    # ESLint 检查
```

## 构建输出

- 目标目录: `dist/`
- 部署平台: Vercel (vercel.json 已配置)