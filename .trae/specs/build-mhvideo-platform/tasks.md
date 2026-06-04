# Tasks

- [x] Task 1: 初始化 Monorepo 项目结构
  - [x] SubTask 1.1: 创建 monorepo 根目录结构，配置 pnpm workspace
  - [x] SubTask 1.2: 初始化 `packages/shared`（共享类型、工具函数、常量、i18n 语言包）
  - [x] SubTask 1.3: 初始化 `packages/api`（Node.js/Express 项目，安装依赖）
  - [x] SubTask 1.4: 初始化 `packages/admin`（Vue 3 + Vite + Tailwind CSS 项目）
  - [x] SubTask 1.5: 初始化 `packages/miniapp`（uni-app 项目）
  - [x] SubTask 1.6: 配置根目录 ESLint、Prettier、TypeScript 共享配置

- [x] Task 2: 数据库设计与 Prisma 配置
  - [x] SubTask 2.1: 在 `packages/api` 中初始化 Prisma，配置 Vercel Postgres 连接
  - [x] SubTask 2.2: 定义所有数据模型（User, Video, Series, Comment, Like, Favorite, FavoriteFolder, Rating, WatchHistory, Category, AdminUser）
  - [x] SubTask 2.3: 创建数据库迁移并验证

- [x] Task 3: 后端 API - 认证模块
  - [x] SubTask 3.1: 实现 JWT 认证中间件（生成、验证、刷新 Token）
  - [x] SubTask 3.2: 实现用户注册接口（邮箱+密码）
  - [x] SubTask 3.3: 实现用户登录接口（邮箱+密码）
  - [x] SubTask 3.4: 实现小程序登录接口（微信/抖音/TikTok openid）
  - [x] SubTask 3.5: 实现 Token 刷新和登出接口

- [x] Task 4: 后端 API - 视频与系列模块
  - [x] SubTask 4.1: 实现视频 CRUD 接口（管理员）
  - [x] SubTask 4.2: 实现视频列表/详情/搜索接口（公开）
  - [x] SubTask 4.3: 实现系列 CRUD 接口（管理员）
  - [x] SubTask 4.4: 实现系列列表/详情接口（公开）
  - [x] SubTask 4.5: 实现分类管理接口

- [x] Task 5: 后端 API - 评论与互动模块
  - [x] SubTask 5.1: 实现评论接口（发表、列表、删除、回复）
  - [x] SubTask 5.2: 实现点赞接口（点赞/取消点赞）
  - [x] SubTask 5.3: 实现收藏接口（收藏/取消收藏、收藏夹管理）
  - [x] SubTask 5.4: 实现评分接口（评分、获取评分）
  - [x] SubTask 5.5: 实现观看历史接口（记录进度、获取历史、续播）

- [x] Task 6: 后端 API - R2 存储与上传模块
  - [x] SubTask 6.1: 集成 Cloudflare R2 SDK，配置存储桶
  - [x] SubTask 6.2: 实现服务端直传上传接口
  - [x] SubTask 6.3: 实现预签名 URL 生成接口
  - [x] SubTask 6.4: 实现用户头像上传接口

- [x] Task 7: 后端 API - 用户与管理模块
  - [x] SubTask 7.1: 实现用户个人信息接口（获取、更新）
  - [x] SubTask 7.2: 实现管理仪表盘数据接口
  - [x] SubTask 7.3: 实现用户管理接口（列表、状态管理）
  - [x] SubTask 7.4: 实现评论管理接口（审核、删除）

- [x] Task 8: 后台管理系统 - 基础框架
  - [x] SubTask 8.1: 搭建管理后台布局（侧边栏、顶栏、内容区）
  - [x] SubTask 8.2: 实现管理员登录页面与认证流程
  - [x] SubTask 8.3: 实现路由守卫与权限控制

- [x] Task 9: 后台管理系统 - 核心功能页面
  - [x] SubTask 9.1: 实现仪表盘页面（统计数据展示）
  - [x] SubTask 9.2: 实现视频管理页面（列表、创建、编辑、上架/下架）
  - [x] SubTask 9.3: 实现系列管理页面（列表、创建、编辑、剧集排序）
  - [x] SubTask 9.4: 实现分类管理页面（列表、创建、编辑）
  - [x] SubTask 9.5: 实现评论管理页面（列表、审核、删除）
  - [x] SubTask 9.6: 实现用户管理页面（列表、禁用/启用）
  - [x] SubTask 9.7: 实现上传中心页面（视频/图片上传到 R2）

- [x] Task 10: 小程序 - 基础框架与主题
  - [x] SubTask 10.1: 搭建 uni-app 项目结构、页面路由、TabBar
  - [x] SubTask 10.2: 实现主题系统（浅色/深色/自定义主题切换）
  - [x] SubTask 10.3: 实现 i18n 多语言切换
  - [x] SubTask 10.4: 封装 API 请求模块（JWT 认证、错误处理）

- [x] Task 11: 小程序 - 首页与搜索
  - [x] SubTask 11.1: 实现首页（推荐视频、分类导航）
  - [x] SubTask 11.2: 实现搜索页面（关键词搜索、搜索历史、热门搜索、筛选排序）

- [x] Task 12: 小程序 - 视频播放与互动
  - [x] SubTask 12.1: 实现视频播放页面（播放器、剧集切换）
  - [x] SubTask 12.2: 实现点赞/收藏/评分功能
  - [x] SubTask 12.3: 实现评论区（评论列表、发表评论、回复）
  - [x] SubTask 12.4: 实现观看进度记录与续播

- [x] Task 13: 小程序 - 用户中心
  - [x] SubTask 13.1: 实现登录/注册页面（邮箱、小程序一键登录）
  - [x] SubTask 13.2: 实现个人中心页面（个人信息、主题切换、语言切换）
  - [x] SubTask 13.3: 实现观看历史页面（列表、续播、清除）
  - [x] SubTask 13.4: 实现收藏列表页面（收藏夹管理、视频列表）

- [x] Task 14: Vercel 部署配置
  - [x] SubTask 14.1: 配置 Vercel 项目（API Serverless Functions、Admin 静态站点）
  - [x] SubTask 14.2: 配置环境变量（数据库、R2、JWT 密钥等）
  - [x] SubTask 14.3: 配置 vercel.json 路由规则
  - [x] SubTask 14.4: 配置 GitHub Actions 自动部署

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 2
- Task 5 depends on Task 2
- Task 6 depends on Task 1
- Task 7 depends on Task 2
- Task 8 depends on Task 3
- Task 9 depends on Task 4, Task 5, Task 6, Task 7, Task 8
- Task 10 depends on Task 1
- Task 11 depends on Task 4, Task 10
- Task 12 depends on Task 4, Task 5, Task 10
- Task 13 depends on Task 3, Task 5, Task 10
- Task 14 depends on Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9
