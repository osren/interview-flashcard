# 项目上下文

## 基本信息

- **project-mode**: brownfield
- **业务领域**: 面试刷题/学习工具
- **架构风格**: 前端 SPA 单体应用
- **技术栈**: TypeScript / React 18 / Vite 5 / Tailwind CSS 3

## 判定说明

- **brownfield**: 当前仓库已有完整业务代码，包括卡片数据、页面路由、状态管理
- 评审以现有系统兼容性、影响范围、迁移成本为主

## 业务概述

InterviewFlash 是一个交互式面试刷题系统，包含：
- 前端基础 (JavaScript, TypeScript, React, Browser, 工程化)
- 项目deep dive (滴滴实习、GResume)
- 算法题目
- 真实面试问答

## 技术选型说明

- React 18: 函数组件 + Hooks
- TypeScript: 严格模式
- Zustand: 轻量级状态管理 + localStorage 持久化
- Framer Motion: 页面过渡动画
- Tailwind CSS: 原子化 CSS 框架