# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HajimiBot Web是一个基于React + TypeScript + Vite构建的现代化Web管理后台，用于管理QQ机器人。项目使用TailwindCSS进行样式设计，集成Radix UI组件库，支持插件系统和群聊管理。

## Development Commands

### 本地开发
- `npm run dev` - 启动开发服务器 (http://localhost:5173)
- `npm run build` - 构建生产版本到dist目录
- `npm run preview` - 预览构建后的生产版本
- `npm run start:prod` - 启动生产环境，监听所有接口
- `npm run lint` - 运行ESLint代码检查

### 代码格式化
- 使用ESLint进行代码质量控制，配置文件：`eslint.config.js`
- TypeScript配置：`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

## Project Architecture

### 核心技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite (基础路径: `/admin/`)
- **样式**: TailwindCSS + PostCSS
- **UI组件**: Radix UI (@radix-ui/themes, @radix-ui/react-*)
- **路由**: React Router DOM
- **HTTP客户端**: Axios
- **数学公式渲染**: KaTeX + react-katex

### 项目结构
```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件 (基于Radix UI)
│   ├── chat/           # 聊天相关组件
│   └── plugins/        # 插件管理组件
├── context/            # React Context (Auth, Theme, Toast)
├── pages/              # 页面组件
├── services/           # API服务层
├── types/              # TypeScript类型定义
├── lib/                # 工具函数
└── config/             # 配置文件
```

### 关键架构模式

#### API服务层 (`src/services/api.ts`)
- 基于Axios的HTTP客户端，支持请求/响应拦截器
- 自动处理认证token (Bearer token通过cookie)
- 开发环境API地址: `http://127.0.0.1:12455/api`
- 生产环境使用相对路径: `/api`
- 401错误自动重定向到登录页

#### 认证系统
- 基于token的认证，token存储在cookie中
- `AuthContext`提供全局认证状态管理
- `ProtectedRoute`组件保护需要认证的路由

#### 主题系统
- `ThemeContext`支持深色/浅色主题切换
- 与Radix UI主题系统集成
- 主题状态持久化

#### 插件系统
- 动态插件配置管理
- 支持多种配置字段类型：boolean, string, number, array, object, stringArray, numberArray
- 插件配置实时保存和重新加载
- 插件操作触发功能

#### 类型系统 (`src/types/index.ts`)
主要类型定义：
- `BotInfo` - 机器人信息
- `ChatGroup` - 群聊信息
- `Plugin` - 插件配置
- `PluginSetting` - 插件设置字段
- `User` - 用户信息

### 路由结构
- 基础路径：`/admin/`
- `/login` - 登录页面
- `/dashboard` - 管理后台主页面
- 默认重定向到 `/dashboard`

### 构建和部署
- Vite别名配置：`@` 指向 `./src`
- 支持Docker容器化部署
- 生产构建输出到 `dist/` 目录
- 支持Nginx代理配置 (`nginx.conf`)

## Development Guidelines

### 组件开发
- 遵循现有的组件模式，使用Radix UI作为基础
- UI组件位于 `src/components/ui/`，使用Tailwind进行样式设计
- 业务组件按功能模块组织

### API集成
- 所有API调用通过 `src/services/api.ts` 统一管理
- 新增API时需更新相应的TypeScript类型定义
- 错误处理遵循现有的拦截器模式

### 状态管理
- 使用React Context进行全局状态管理
- 认证状态、主题状态、提示消息状态分别管理

### 样式开发
- 使用TailwindCSS工具类进行样式开发
- 响应式设计适配移动端和桌面端
- 配合Radix UI组件的内置样式系统