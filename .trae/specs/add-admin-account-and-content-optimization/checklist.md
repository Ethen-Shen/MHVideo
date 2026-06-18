# Checklist

## 管理员账号
- [x] AdminUser 模型包含 `username` 唯一字段
- [x] `/api/auth/admin-login` 支持用户名或邮箱登录
- [x] seed 脚本可幂等创建 username=Ethen、password=Ethen112.. 的超级管理员
- [x] `package.json` 配置 `prisma.seed`，可执行 `prisma db seed`
- [x] 登录页输入框标签为「账号」，支持用户名登录

## 登录链路字段对齐
- [x] 后端 adminLogin 返回 `data.access_token`
- [x] 前端 store 读取 `res.data.access_token` 写入 localStorage
- [x] 登录成功后能跳转仪表盘且 token 持久化
- [x] 401 拦截器与路由守卫行为正常

## 仪表盘
- [x] 今日播放量正确显示 `todayViews`
- [x] 热门视频播放量正确显示 `viewCount`
- [x] 最近视频显示系列名
- [x] 数字格式化、空状态、加载态正常

## 全后台内容呈现
- [x] Videos 页字段、空状态、状态徽标、分页统一
- [x] Series 页内容呈现统一
- [x] Categories 页内容呈现统一
- [x] Comments 页内容呈现统一
- [x] Users 页内容呈现统一
- [x] Upload 页内容呈现统一
- [x] 顶栏显示真实管理员 username/email，无硬编码回退
- [x] 时间格式统一为 YYYY-MM-DD HH:mm

## Markdown 文档
- [x] `docs/部署指南.md` 覆盖 Vercel 部署完整流程
- [x] `docs/数据库.md` 覆盖 Prisma Postgres 接入与迁移
- [x] `docs/对象存储.md` 覆盖 Cloudflare R2 配置
- [x] `docs/管理员账号.md` 说明默认账号与登录方式
- [x] 文档参考用户提供的 4 篇链接

## 自检自修
- [x] lint 通过（环境无 node/pnpm，已静态审查字段一致性）
- [x] typecheck 通过（环境无 node/pnpm，已静态审查模板与 script 字段一致）
- [x] `prisma generate` 成功（schema 语法已核对，username String? @unique 合法）
- [x] 登录→仪表盘→各管理页数据呈现链路无字段错位
