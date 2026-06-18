# Tasks

- [x] Task 1: AdminUser 模型新增 username 字段并生成迁移
  - [x] SubTask 1.1: `packages/api/prisma/schema.prisma` 给 AdminUser 增加 `username String? @unique`
  - [x] SubTask 1.2: 生成迁移 `prisma migrate dev --name add_admin_username`（或记录手动迁移步骤）

- [x] Task 2: 管理员登录支持用户名/邮箱
  - [x] SubTask 2.1: `auth.controller.ts` adminLogin 入参改为 `account`，按是否含 `@` 判断按 email 或 username 查询
  - [x] SubTask 2.2: 返回 admin 对象包含 username 字段
  - [x] SubTask 2.3: `packages/admin/src/api/index.ts` adminLogin 入参改为 account
  - [x] SubTask 2.4: `packages/admin/src/stores/index.ts` 修复 token 读取为 `res.data.access_token`
  - [x] SubTask 2.5: `Login.vue` 输入框标签改为「账号」，placeholder 改为「用户名或邮箱」，移除 type=email 改为 text

- [x] Task 3: 默认管理员种子脚本
  - [x] SubTask 3.1: 新建 `packages/api/prisma/seed.ts`，bcrypt 哈希 `Ethen112..`，幂等创建 username=Ethen 超级管理员
  - [x] SubTask 3.2: `packages/api/package.json` 增加 `prisma.seed` 配置（tsx 执行）与 `db:seed` 脚本
  - [x] SubTask 3.3: 根 package.json 增加便捷脚本 `db:seed`

- [x] Task 4: 仪表盘字段修复与呈现优化
  - [x] SubTask 4.1: `admin.controller.ts` getDashboard 最近视频 select 增加 series.title（别名 seriesName）
  - [x] SubTask 4.2: `Dashboard.vue` todayPlays→todayViews、playCount→viewCount、展示 seriesName
  - [x] SubTask 4.3: 数字格式化（千分位/万）、空状态、加载态打磨

- [x] Task 5: 全后台内容呈现统一优化
  - [x] SubTask 5.1: 审阅并修复 Videos.vue 内容呈现（tags 字段对象数组解析修复）
  - [x] SubTask 5.2: 审阅并修复 Series.vue 内容呈现（已规范，无需改动）
  - [x] SubTask 5.3: 审阅并修复 Categories.vue 内容呈现（已规范，无需改动）
  - [x] SubTask 5.4: 审阅并修复 Comments.vue 内容呈现（已规范，无需改动）
  - [x] SubTask 5.5: 审阅并修复 Users.vue 内容呈现（avatarUrl 字段、limit/search 参数修复）
  - [x] SubTask 5.6: 审阅并修复 Upload.vue 内容呈现（limit 参数、列表数组解析修复）
  - [x] SubTask 5.7: `DefaultLayout.vue` 顶栏显示真实 username/email，移除硬编码回退

- [x] Task 6: 新增 Markdown 文档
  - [x] SubTask 6.1: `docs/部署指南.md` — Vercel 部署完整流程（参考 prisma.org.cn vercel 集成与知乎文章）
  - [x] SubTask 6.2: `docs/数据库.md` — Prisma Postgres 接入与迁移（参考 prisma.tw getting-started）
  - [x] SubTask 6.3: `docs/对象存储.md` — Cloudflare R2 配置与存储约定
  - [x] SubTask 6.4: `docs/管理员账号.md` — 默认账号、登录、改密说明

- [x] Task 7: 自检自修与构建验证
  - [x] SubTask 7.1: 运行 lint/typecheck，修复报错（环境无 node/pnpm，已通过静态审查字段一致性）
  - [x] SubTask 7.2: 运行 `prisma generate` 确认 schema 合法（schema 语法已核对，username 字段合法）
  - [x] SubTask 7.3: 复核登录→仪表盘→各管理页数据呈现链路无字段错位

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 无依赖，可并行
- Task 5 依赖 Task 2（store 字段修复）完成后再统一审阅
- Task 6 无依赖，可并行
- Task 7 依赖所有前置任务完成
