# HajimiBot Web 🚀

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个基于 React + TypeScript + Vite 构建的现代化 Web 应用，使用 TailwindCSS 进行样式设计，并集成了 Radix UI 组件库。

## ✨ 特性

- 🎯 使用 TypeScript 确保代码类型安全
- ⚡️ 基于 Vite 的快速开发体验
- 🎨 使用 TailwindCSS 实现响应式设计
- 📦 使用 Radix UI 构建可访问性组件
- 🐳 支持 Docker 容器化部署
- 🔍 集成 ESLint 进行代码质量控制

## 🖥️ 界面预览

### 登录界面
- 简洁的登录表单
- 支持 QQ 账号登录
- 响应式设计，适配移动端和桌面端

### 管理后台
- 现代化的仪表盘界面
- 深色/浅色主题切换
- 响应式侧边栏导航
- 实时显示机器人状态和在线群聊

### 群聊管理
- 群聊总览页面
- 显示群聊成员数量
- 群聊基本信息展示
- 支持多群聊管理

### 插件系统
- 插件管理界面
- 插件配置实时保存
- 插件操作快速触发
- 插件状态实时反馈

## 🚀 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/merlincn/HajimiBotWeb.git
cd HajimiBotWeb
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

### 使用 Docker 运行

1. 构建 Docker 镜像
```bash
docker build -t hajimibot-web .
```

2. 运行容器
```bash
docker run -d -p 80:80 hajimibot-web
```

现在你可以通过访问 `http://localhost` 来查看应用。

### 生产环境启动

在本地或服务器上，你可以通过以下命令启动生产环境：

```bash
npm run start:prod
```

这将启动 Vite 预览服务器，监听 5173 端口，并对外暴露服务。

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: TailwindCSS
- **UI 组件**: Radix UI
- **路由**: React Router
- **HTTP 客户端**: Axios
- **容器化**: Docker + Node.js

## 📝 开发脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run start:prod` - 启动生产环境
- `npm run lint` - 运行 ESLint 检查

## 🤝 贡献

欢迎提交 Pull Requests 和 Issues！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
