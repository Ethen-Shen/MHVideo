# 管理员账号与全后台内容呈现优化 Spec

## Why
墨焕影视管理后台当前存在多处内容呈现缺陷：管理员登录态字段不匹配导致登录后 token 丢失、仪表盘统计字段名对不上接口返回值导致数据恒为 0、各管理页缺少统一的空状态/加载态/排版规范；同时需要新增「Ethen」管理员账号并补充项目部署相关的 Markdown 文档，使后台可用、可部署、可维护。

## What Changes
- 给 `AdminUser` 模型新增 `username` 唯一字段，管理员登录支持「用户名或邮箱」
- 新增 Prisma seed 脚本，创建默认超级管理员：username=`Ethen`、password=`Ethen112..`、role=`super_admin`
- 修复登录链路字段不匹配：后端返回 `access_token`，前端 store 读取 `token` → 统一为 `access_token`
- 后台登录页输入框由「邮箱」改为「账号」，支持用户名/邮箱登录
- 修复仪表盘字段错位：`todayPlays`→`todayViews`、`playCount`→`viewCount`、补齐系列名
- 全后台内容呈现优化：统一空状态、加载态、表格排版、状态徽标、数字格式化、面包屑与标题
- 新增 `docs/` 目录 Markdown 文档：部署指南、Prisma Postgres 数据库、Cloudflare R2 对象存储、管理员账号说明（参考用户提供的 4 篇文档）

## Impact
- Affected specs: build-mhvideo-platform（AdminUser 模型与登录流程变更）、rebrand-and-vercel-deploy（登录页文案）
- Affected code:
  - `packages/api/prisma/schema.prisma` — AdminUser 新增 username 字段
  - `packages/api/prisma/seed.ts` — 新增种子脚本
  - `packages/api/package.json` — 配置 prisma seed
  - `packages/api/src/controllers/auth.controller.ts` — adminLogin 支持用户名/邮箱
  - `packages/admin/src/api/index.ts` — 登录响应字段对齐
  - `packages/admin/src/stores/index.ts` — token 字段修复
  - `packages/admin/src/views/Login.vue` — 账号输入框
  - `packages/admin/src/views/Dashboard.vue` — 字段修复与呈现优化
  - `packages/admin/src/views/Videos.vue` / `Series.vue` / `Categories.vue` / `Comments.vue` / `Users.vue` / `Upload.vue` — 内容呈现统一优化
  - `packages/admin/src/layouts/DefaultLayout.vue` — 顶栏管理员信息显示
  - `docs/*.md` — 新增文档

## ADDED Requirements

### Requirement: 管理员用户名登录
系统 SHALL 在 `AdminUser` 模型新增 `username` 唯一可选字段，管理员登录接口 `/api/auth/admin-login` SHALL 接受「用户名或邮箱」作为登录标识：
- 请求体字段名由 `email` 改为 `account`（兼容：若传值像邮箱则按 email 查询，否则按 username 查询）
- 密码校验通过后返回与原结构一致的 `access_token` / `refresh_token` / `admin`
- `admin` 对象包含 `id`、`username`、`email`、`role`

#### Scenario: 用户名登录
- **WHEN** 管理员以 username=`Ethen`、password=`Ethen112..` 登录
- **THEN** 返回 200 与有效 access_token，前端写入 localStorage 并跳转仪表盘

#### Scenario: 邮箱登录兼容
- **WHEN** 管理员以邮箱登录
- **THEN** 仍可正常登录，行为不变

### Requirement: 默认管理员种子数据
系统 SHALL 提供 Prisma seed 脚本 `packages/api/prisma/seed.ts`：
- 使用 bcrypt 哈希密码（salt rounds 10）
- 幂等创建超级管理员：username=`Ethen`、email=`ethen@mhvideo.com`、password=`Ethen112..`、role=`super_admin`
- 已存在则跳过（按 username 查询）
- `packages/api/package.json` 配置 `prisma.seed` 执行该脚本

#### Scenario: 执行种子
- **WHEN** 运行 `pnpm --filter @mhvideo/api exec prisma db seed`
- **THEN** 数据库存在 Ethen 超级管理员，重复执行不报错不重复创建

### Requirement: 项目 Markdown 文档
系统 SHALL 在 `docs/` 目录提供以下中文 Markdown 文档：
- `docs/部署指南.md` — Vercel 部署完整流程（构建命令、环境变量、自定义域名），参考 https://prisma.org.cn/docs/postgres/integrations/vercel 与 https://zhuanlan.zhihu.com/p/658058503
- `docs/数据库.md` — Prisma Postgres 接入与迁移流程，参考 https://prisma.tw/docs/postgres/introduction/getting-started
- `docs/对象存储.md` — Cloudflare R2 配置与视频/封面存储约定
- `docs/管理员账号.md` — 默认管理员账号、登录方式、修改密码说明

每篇文档 SHALL 包含：概述、前置条件、操作步骤、环境变量说明、常见问题。

#### Scenario: 文档可读
- **WHEN** 开发者打开 `docs/部署指南.md`
- **THEN** 能按步骤完成 Vercel + Prisma Postgres + R2 部署

## MODIFIED Requirements

### Requirement: 管理员登录链路字段对齐
后端 `adminLogin` 返回 `data.access_token`，前端 store SHALL 读取 `res.data.access_token` 并写入 `localStorage('admin_token')`；api 拦截器与路由守卫保持一致。

### Requirement: 仪表盘数据呈现
仪表盘 SHALL 正确映射接口字段：
- 今日播放量读取 `todayViews`
- 热门视频播放量读取 `viewCount`
- 最近视频展示系列名（接口需返回 series.title）
- 数字超过 1000 使用千分位/万级格式化

### Requirement: 全后台内容呈现统一
所有后台管理页（视频/系列/分类/评论/用户/上传）SHALL 遵循统一呈现规范：
- 加载态使用居中 spinner
- 空状态显示图标 + 文案 + （可选）操作按钮
- 表格统一表头、行高、悬浮态、状态徽标配色
- 分页组件统一
- 时间格式统一为 `YYYY-MM-DD HH:mm`
- 顶栏管理员信息显示真实 username/email，不再回退到硬编码 `admin@mhvideo.com`

## REMOVED Requirements
（无删除项）
