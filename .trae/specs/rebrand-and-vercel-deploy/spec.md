# 品牌重塑与 Vercel 部署适配 Spec

## Why
项目当前使用 "MHVideo" 作为品牌名，需要统一更换为「墨焕影视」，并适配 Vercel 部署要求（构建命令、输出目录、非空仓库、.env 配置），使项目可以直接部署上线。

## What Changes
- 将所有 "MHVideo" 品牌名替换为「墨焕影视」
- 将现有 SVG logo（`packages/admin/src/styles/logo.svg`）复制到正确位置并在所有页面使用
- 公司名更新为「墨焕（上海）互联网科技有限公司」
- 适配 Vercel 构建配置：构建命令 `npm run vercel-build`，输出目录调整
- 创建可直接使用的 `.env` 配置文件（带占位值和注释说明）
- 确保仓库非空（添加 `public` 目录占位文件）
- **BREAKING**：vercel.json 构建配置重写，适配 Vercel 标准构建流程

## Impact
- Affected specs: build-mhvideo-platform（品牌名称变更）
- Affected code:
  - `packages/admin/src/layouts/DefaultLayout.vue` — 侧边栏 logo 和标题
  - `packages/admin/src/views/Login.vue` — 登录页 logo 和标题
  - `packages/admin/src/views/Dashboard.vue` — 仪表盘标题
  - `packages/miniapp/src/pages/index/index.vue` — 小程序首页
  - `packages/miniapp/src/pages/login/index.vue` — 小程序登录页
  - `packages/miniapp/src/pages/user/index.vue` — 小程序用户中心
  - `packages/miniapp/src/manifest.json` — 小程序应用名
  - `packages/miniapp/src/pages.json` — 小程序导航栏标题
  - `packages/shared/src/i18n/*.json` — 多语言包中的品牌名
  - `vercel.json` — Vercel 构建配置
  - `package.json` — 根目录构建脚本
  - `packages/api/.env.example` — 环境变量模板
  - `.env.example` — 根目录环境变量模板

## ADDED Requirements

### Requirement: 品牌统一为「墨焕影视」
系统 SHALL 在所有用户可见位置使用「墨焕影视」作为品牌名，包括：
- 后台管理系统侧边栏标题：墨焕影视 管理后台
- 后台管理系统登录页标题：墨焕影视 管理后台
- 小程序首页导航栏标题：墨焕影视
- 小程序登录页标题：墨焕影视
- 小程序用户中心标题：墨焕影视
- 页脚版权信息：© 2026 墨焕（上海）互联网科技有限公司
- 多语言包中的品牌名翻译

#### Scenario: 品牌名显示
- **WHEN** 用户访问任何页面
- **THEN** 品牌名显示为「墨焕影视」，版权信息显示公司全称

### Requirement: SVG Logo 使用
系统 SHALL 使用 `logo.svg` 作为品牌 logo，放置在以下位置：
- `packages/admin/src/assets/logo.svg` — 后台管理系统
- `packages/miniapp/src/static/logo.svg` — 小程序

在以下位置使用 logo：
- 后台管理系统侧边栏（替代播放图标）
- 后台管理系统登录页（替代播放图标）
- 小程序登录页

#### Scenario: Logo 显示
- **WHEN** 用户查看侧边栏或登录页
- **THEN** 显示墨焕 SVG logo，而非通用播放图标

### Requirement: Vercel 部署适配
系统 SHALL 适配 Vercel 标准构建流程：
- 根目录 `package.json` 添加 `vercel-build` 脚本
- `vercel.json` 配置正确的构建命令和输出目录
- 创建 `public` 目录（含占位文件）确保仓库非空
- API 部署为 Serverless Functions
- Admin 部署为静态站点

#### Scenario: Vercel 构建
- **WHEN** Vercel 执行 `npm run vercel-build`
- **THEN** API 编译到 `dist/`，Admin 构建到 `packages/admin/dist/`

### Requirement: .env 配置文件
系统 SHALL 提供完整的 `.env` 配置文件模板：
- `packages/api/.env` — 包含所有环境变量，带占位值和中文注释
- 每个变量附带说明，用户只需填入实际值即可
- Vercel 部署时通过 Dashboard 粘贴 .env 内容配置环境变量

#### Scenario: 环境变量配置
- **WHEN** 用户复制 .env.example 为 .env 并填入实际值
- **THEN** API 服务可正常启动并连接数据库和 R2

## MODIFIED Requirements

### Requirement: 后台管理系统布局
侧边栏 Logo 区域使用墨焕 SVG logo + "墨焕影视 管理后台"文字，替代原播放图标 + "MHVideo 管理后台"。

### Requirement: Vercel 部署配置
vercel.json 重写为适配 Vercel 标准构建流程的配置，使用 `vercel-build` 命令。

## REMOVED Requirements
（无删除项）
