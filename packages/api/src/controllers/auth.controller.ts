import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { generateToken, generateRefreshToken, verifyToken, TokenPayload } from '../lib/jwt';

// Zod 验证 schemas
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50个字符'),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

const miniappLoginSchema = z.object({
  code: z.string().min(1, 'code不能为空'),
  platform: z.enum(['wechat', 'douyin', 'tiktok'], { message: '不支持的平台类型' }),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken不能为空'),
});

const adminLoginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

// 构建用户 token payload，处理 null email
function buildUserPayload(user: { id: string; email: string | null; role?: string }): TokenPayload {
  return {
    userId: user.id,
    email: user.email ?? undefined,
    role: user.role ?? 'user',
  };
}

// 邮箱注册
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, nickname } = registerSchema.parse(req.body);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ code: 409, message: '该邮箱已注册' });
      return;
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname,
      },
    });

    // 生成 token
    const payload = buildUserPayload(user);
    const access_token = generateToken(payload);
    const refresh_token = generateRefreshToken(payload);

    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.errors[0].message });
      return;
    }
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: '注册失败' });
  }
}

// 邮箱登录
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ code: 401, message: '邮箱或密码错误' });
      return;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ code: 401, message: '邮箱或密码错误' });
      return;
    }

    // 检查用户状态
    if (user.status === 'banned') {
      res.status(403).json({ code: 403, message: '账号已被封禁' });
      return;
    }

    // 生成 token
    const payload = buildUserPayload(user);
    const access_token = generateToken(payload);
    const refresh_token = generateRefreshToken(payload);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.errors[0].message });
      return;
    }
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
}

// 小程序登录
export async function miniappLogin(req: Request, res: Response): Promise<void> {
  try {
    const { code, platform } = miniappLoginSchema.parse(req.body);

    // 根据平台获取 openid（预留接口，先用 code 作为 openid 的模拟）
    let openid: string;

    // 根据平台确定 openid 字段和查找/创建逻辑
    let user: Awaited<ReturnType<typeof prisma.user.findUnique>>;

    switch (platform) {
      case 'wechat':
        // TODO: 调用微信 API 获取 openid
        openid = code;
        user = await prisma.user.findUnique({ where: { wechatOpenid: openid } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              wechatOpenid: openid,
              nickname: `wechat_user_${openid.slice(0, 8)}`,
            },
          });
        }
        break;
      case 'douyin':
        // TODO: 调用抖音 API 获取 openid
        openid = code;
        user = await prisma.user.findUnique({ where: { douyinOpenid: openid } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              douyinOpenid: openid,
              nickname: `douyin_user_${openid.slice(0, 8)}`,
            },
          });
        }
        break;
      case 'tiktok':
        // TODO: 调用 TikTok API 获取 openid
        openid = code;
        user = await prisma.user.findUnique({ where: { tiktokOpenid: openid } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              tiktokOpenid: openid,
              nickname: `tiktok_user_${openid.slice(0, 8)}`,
            },
          });
        }
        break;
    }

    // 检查用户状态
    if (user!.status === 'banned') {
      res.status(403).json({ code: 403, message: '账号已被封禁' });
      return;
    }

    // 生成 token
    const payload = buildUserPayload(user!);
    const access_token = generateToken(payload);
    const refresh_token = generateRefreshToken(payload);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        access_token,
        refresh_token,
        user: {
          id: user!.id,
          email: user!.email,
          nickname: user!.nickname,
          avatarUrl: user!.avatarUrl,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.errors[0].message });
      return;
    }
    console.error('小程序登录失败:', error);
    res.status(500).json({ code: 500, message: '小程序登录失败' });
  }
}

// 刷新 Token
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = refreshTokenSchema.parse(req.body);

    // 验证 refreshToken
    const decoded = verifyToken(token);

    // 生成新的 access_token
    const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    const access_token = generateToken(payload);

    res.json({
      code: 200,
      message: '刷新成功',
      data: {
        access_token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.errors[0].message });
      return;
    }
    res.status(401).json({ code: 401, message: '无效或过期的 refreshToken' });
  }
}

// 管理员登录
export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = adminLoginSchema.parse(req.body);

    // 查找管理员
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ code: 401, message: '邮箱或密码错误' });
      return;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ code: 401, message: '邮箱或密码错误' });
      return;
    }

    // 生成 token
    const payload = { userId: admin.id, email: admin.email, role: admin.role };
    const access_token = generateToken(payload);
    const refresh_token = generateRefreshToken(payload);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        access_token,
        refresh_token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.errors[0].message });
      return;
    }
    console.error('管理员登录失败:', error);
    res.status(500).json({ code: 500, message: '管理员登录失败' });
  }
}

// 登出
export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({
    code: 200,
    message: '登出成功',
  });
}
