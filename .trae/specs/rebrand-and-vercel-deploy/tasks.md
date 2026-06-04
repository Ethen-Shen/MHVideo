# Tasks

- [x] Task 1: 复制 SVG Logo 到正确位置
  - [x] SubTask 1.1: 将 `packages/admin/src/styles/logo.svg` 复制到 `packages/admin/src/assets/logo.svg`
  - [x] SubTask 1.2: 将 logo.svg 复制到 `packages/miniapp/src/static/logo.svg`

- [x] Task 2: 更新后台管理系统品牌名和 Logo
  - [x] SubTask 2.1: 更新 `DefaultLayout.vue` — 侧边栏使用 logo.svg 替代播放图标，标题改为「墨焕影视 管理后台」
  - [x] SubTask 2.2: 更新 `Login.vue` — 登录页使用 logo.svg，标题改为「墨焕影视 管理后台」，页脚版权改为公司全称
  - [x] SubTask 2.3: 更新 `Dashboard.vue` — 仪表盘标题改为「墨焕影视」

- [x] Task 3: 更新小程序品牌名和 Logo
  - [x] SubTask 3.1: 更新 `pages.json` — 导航栏标题改为「墨焕影视」
  - [x] SubTask 3.2: 更新 `manifest.json` — 应用名改为「墨焕影视」
  - [x] SubTask 3.3: 更新 `pages/login/index.vue` — 登录页使用 logo.svg，标题改为「墨焕影视」
  - [x] SubTask 3.4: 更新 `pages/user/index.vue` — 用户中心标题改为「墨焕影视」

- [x] Task 4: 更新多语言包品牌名
  - [x] SubTask 4.1: 更新 `packages/shared/src/i18n/zh-CN.json` — MHVideo → 墨焕影视
  - [x] SubTask 4.2: 更新其他语言包（zh-TW, en, ja, ko, th, es）中的品牌名

- [x] Task 5: 适配 Vercel 部署配置
  - [x] SubTask 5.1: 更新根目录 `package.json` — 添加 `vercel-build` 脚本
  - [x] SubTask 5.2: 重写 `vercel.json` — 适配 Vercel 标准构建流程
  - [x] SubTask 5.3: 创建 `public` 目录和占位文件确保仓库非空
  - [x] SubTask 5.4: 更新 `packages/api/package.json` — 添加 `vercel-build` 脚本
  - [x] SubTask 5.5: 更新 `packages/admin/package.json` — 确保 build 脚本正确

- [x] Task 6: 完善 .env 配置文件
  - [x] SubTask 6.1: 更新 `packages/api/.env.example` — 添加详细中文注释说明每个变量
  - [x] SubTask 6.2: 更新根目录 `.env.example` — 添加 Vercel 部署指南和中文注释

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 无依赖，可并行
- Task 5 无依赖，可并行
- Task 6 无依赖，可并行
