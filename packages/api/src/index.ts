import 'dotenv/config';
import { app } from './app';
import { config } from './config';

// 只在非 Vercel 环境下启动 HTTP 服务器
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = config.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[MHVideo API] Server running on http://localhost:${PORT}`);
    console.log(`[MHVideo API] Environment: ${config.NODE_ENV}`);
  });
}

// 导出 app 供 Vercel Serverless Functions 使用
export default app;
