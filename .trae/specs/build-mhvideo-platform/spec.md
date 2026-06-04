# MHVideo 多平台短剧网站 Spec

## Why
当前缺乏一个统一的多平台短剧分发与管理系统，需要支持微信小程序、抖音小程序、TikTok小程序三大平台，同时提供完整的后台管理、用户互动和多语言能力。

## What Changes
- 搭建 monorepo 项目结构，包含前端小程序（uni-app）、后台管理系统（Vue 3）、后端 API（Node.js/Express）
- 集成 Cloudflare R2 Object Storage 作为视频图片存储仓库
- 使用 Prisma ORM + Vercel Postgres 作为数据库方案
- 部署到 Vercel 平台
- 实现用户注册登录、视频搜索、评论、点赞/收藏/评分/历史观看、个性化主题等核心功能
- 提供多语言（i18n）支持，覆盖常见语种

## Impact
- Affected code: 全新项目，无既有代码影响
- 技术栈：Vue 3 + TypeScript + Vite + Tailwind CSS + uni-app + Node.js/Express + Prisma + Vercel Postgres + Cloudflare R2

---

## ADDED Requirements

### Requirement: 项目架构与 Monorepo 搭建
系统 SHALL 采用 monorepo 结构组织代码，包含以下子项目：
- `packages/shared`：共享类型、工具函数、常量
- `packages/api`：后端 API 服务（Node.js/Express + Prisma）
- `packages/admin`：后台管理系统（Vue 3 + Vite + Tailwind CSS）
- `packages/miniapp`：多平台小程序（uni-app，编译到微信/抖音/TikTok）

#### Scenario: Monorepo 初始化
- **WHEN** 开发者克隆项目并运行安装命令
- **THEN** 所有子项目依赖正确安装，开发服务器可正常启动

---

### Requirement: 数据库设计（Prisma + Vercel Postgres）
系统 SHALL 使用 Prisma ORM 定义以下核心数据模型：

- **User**：id, email, phone, password_hash, nickname, avatar_url, locale, theme_preference, created_at, updated_at
- **Video**：id, title, description, cover_url, video_url, duration, category, tags, episode_number, series_id, view_count, status(published/draft), created_at, updated_at
- **Series**：id, title, description, cover_url, category, tags, status, created_at, updated_at
- **Comment**：id, user_id, video_id, content, parent_id(支持回复), created_at, updated_at
- **Like**：id, user_id, video_id, created_at
- **Favorite**：id, user_id, video_id, folder_id, created_at
- **FavoriteFolder**：id, user_id, name, created_at
- **Rating**：id, user_id, video_id, score(1-5), created_at
- **WatchHistory**：id, user_id, video_id, progress(秒), completed, created_at
- **Category**：id, name, icon_url, sort_order
- **AdminUser**：id, email, password_hash, role(super_admin/editor), created_at

#### Scenario: 数据库迁移
- **WHEN** 运行 Prisma 迁移命令
- **THEN** Vercel Postgres 中创建所有表及关系，索引正确建立

---

### Requirement: 后端 API 服务
系统 SHALL 提供 RESTful API，包含以下模块：

**认证模块**
- POST `/api/auth/register`：用户注册（邮箱/手机号）
- POST `/api/auth/login`：用户登录（返回 JWT）
- POST `/api/auth/refresh`：刷新 Token
- POST `/api/auth/logout`：登出

**视频模块**
- GET `/api/videos`：视频列表（分页、筛选、排序）
- GET `/api/videos/:id`：视频详情
- GET `/api/videos/search`：视频搜索（关键词、分类、标签）
- POST `/api/admin/videos`：创建视频（管理员）
- PUT `/api/admin/videos/:id`：更新视频（管理员）
- DELETE `/api/admin/videos/:id`：删除视频（管理员）
- POST `/api/admin/videos/:id/publish`：发布视频（管理员）

**系列模块**
- GET `/api/series`：系列列表
- GET `/api/series/:id`：系列详情（含剧集列表）
- POST `/api/admin/series`：创建系列（管理员）
- PUT `/api/admin/series/:id`：更新系列（管理员）

**评论模块**
- GET `/api/videos/:id/comments`：获取评论列表
- POST `/api/comments`：发表评论（需登录）
- DELETE `/api/comments/:id`：删除评论（本人或管理员）

**互动模块**
- POST `/api/videos/:id/like`：点赞/取消点赞
- POST `/api/videos/:id/favorite`：收藏/取消收藏
- POST `/api/videos/:id/rating`：评分
- GET `/api/videos/:id/rating`：获取评分

**用户模块**
- GET `/api/user/profile`：获取个人信息
- PUT `/api/user/profile`：更新个人信息
- GET `/api/user/history`：观看历史
- GET `/api/user/favorites`：收藏列表
- GET `/api/user/likes`：点赞列表

**上传模块**
- POST `/api/admin/upload`：上传视频/图片到 R2（管理员）
- GET `/api/admin/upload/presign`：获取 R2 预签名 URL

**管理模块**
- GET `/api/admin/dashboard`：仪表盘数据
- GET `/api/admin/users`：用户管理列表
- PUT `/api/admin/users/:id`：管理用户状态

#### Scenario: API 访问控制
- **WHEN** 未登录用户访问需认证的 API
- **THEN** 返回 401 状态码和错误信息

#### Scenario: 管理员权限
- **WHEN** 非管理员用户访问 admin API
- **THEN** 返回 403 状态码和权限不足信息

---

### Requirement: Cloudflare R2 存储集成
系统 SHALL 使用 Cloudflare R2 作为视频和图片的存储服务：
- 支持服务端直传和客户端预签名 URL 上传
- 视频文件存储路径：`videos/{series_id}/{episode_number}.mp4`
- 封面图片存储路径：`covers/{series_id}/{episode_number}.jpg`
- 用户头像存储路径：`avatars/{user_id}.jpg`
- 支持通过 R2 公开访问域名获取资源

#### Scenario: 视频上传
- **WHEN** 管理员通过后台上传视频文件
- **THEN** 文件上传至 R2 指定路径，返回可访问的公开 URL

---

### Requirement: 后台管理系统
系统 SHALL 提供基于 Vue 3 + Vite + Tailwind CSS 的后台管理界面，包含：

- **仪表盘**：总视频数、总用户数、今日播放量、热门视频
- **视频管理**：视频列表（CRUD）、批量上架/下架、排序
- **系列管理**：系列列表（CRUD）、剧集排序
- **分类管理**：分类列表（CRUD）
- **评论管理**：评论列表、审核/删除
- **用户管理**：用户列表、禁用/启用
- **上传中心**：视频/图片上传到 R2
- **管理员登录**：独立的登录页面

#### Scenario: 视频上架
- **WHEN** 管理员在后台填写视频信息并上传视频文件到 R2
- **THEN** 视频信息保存到数据库，状态为已发布，小程序端可查看

---

### Requirement: 多平台小程序（uni-app）
系统 SHALL 使用 uni-app 框架开发小程序，编译目标为：
- 微信小程序
- 抖音小程序
- TikTok 小程序

小程序功能包含：
- **首页**：推荐视频、分类导航、搜索入口
- **搜索**：关键词搜索、搜索历史、热门搜索
- **视频播放**：视频播放器、剧集切换、点赞/收藏/评分
- **评论区**：评论列表、发表评论、回复评论
- **个人中心**：登录/注册、观看历史、收藏列表、主题切换、语言切换

#### Scenario: 小程序编译
- **WHEN** 运行 uni-app 编译命令指定目标平台
- **THEN** 生成对应平台的小程序代码包，可正常预览和发布

---

### Requirement: 用户注册登录
系统 SHALL 支持以下注册登录方式：
- 邮箱 + 密码注册/登录
- 手机号 + 验证码注册/登录（预留接口）
- 微信/抖音/TikTok 小程序一键登录（获取平台 openid）
- JWT Token 认证，支持 Token 刷新

#### Scenario: 邮箱注册
- **WHEN** 用户提交有效邮箱和密码
- **THEN** 创建用户账号，返回 JWT Token

#### Scenario: 小程序登录
- **WHEN** 用户在小程序中点击一键登录
- **THEN** 获取平台 openid，创建或关联用户账号，返回 JWT Token

---

### Requirement: 视频搜索
系统 SHALL 提供视频搜索功能：
- 支持按关键词搜索（标题、描述）
- 支持按分类筛选
- 支持按标签筛选
- 支持搜索结果排序（最新、最热、评分最高）
- 搜索历史记录（本地存储）
- 热门搜索词展示

#### Scenario: 关键词搜索
- **WHEN** 用户输入关键词并搜索
- **THEN** 返回匹配的视频列表，按相关度排序

---

### Requirement: 视频评论区
系统 SHALL 提供视频评论功能：
- 评论列表（分页加载）
- 发表评论（需登录）
- 回复评论（支持一级回复）
- 删除自己的评论
- 管理员删除任意评论
- 评论按时间倒序排列

#### Scenario: 发表评论
- **WHEN** 登录用户在视频详情页提交评论
- **THEN** 评论保存到数据库，实时显示在评论列表

---

### Requirement: 个性化主题
系统 SHALL 支持多主题切换：
- 浅色主题（默认）
- 深色主题（夜间模式）
- 自定义主题（可扩展）
- 主题偏好持久化存储
- 跟随系统主题选项

#### Scenario: 切换主题
- **WHEN** 用户在设置中选择深色主题
- **THEN** 界面立即切换为深色样式，偏好保存到本地和用户配置

---

### Requirement: 视频互动（点赞/收藏/评分/历史）
系统 SHALL 提供以下互动功能：

**点赞**
- 对视频点赞/取消点赞
- 视频点赞数展示

**收藏**
- 收藏视频到收藏夹
- 支持创建/管理收藏夹
- 收藏列表查看

**评分**
- 对视频评分（1-5 星）
- 显示平均评分
- 每个用户每个视频只能评一次

**观看历史**
- 自动记录观看进度
- 续播功能（从上次观看位置继续）
- 历史列表查看
- 清除历史记录

#### Scenario: 视频点赞
- **WHEN** 登录用户点击点赞按钮
- **THEN** 点赞状态切换，点赞数相应增减

#### Scenario: 续播
- **WHEN** 用户打开之前看过的视频
- **THEN** 从上次观看位置继续播放

---

### Requirement: 多语言支持（i18n）
系统 SHALL 支持多语言：
- 中文（简体）- 默认
- 中文（繁体）
- English
- 日本語
- 한국어
- ภาษาไทย
- Español
- 语言包采用 JSON 格式，可扩展
- 语言切换即时生效
- 语言偏好持久化

#### Scenario: 切换语言
- **WHEN** 用户在设置中切换语言为 English
- **THEN** 界面文字切换为英文，偏好保存

---

### Requirement: Vercel 部署
系统 SHALL 支持部署到 Vercel：
- API 服务部署为 Serverless Functions
- 后台管理系统部署为静态站点
- Prisma 数据库连接 Vercel Postgres
- 环境变量通过 Vercel Dashboard 管理
- 支持自定义域名

#### Scenario: 部署
- **WHEN** 推送代码到 GitHub 仓库
- **THEN** Vercel 自动构建和部署 API 及后台管理系统
