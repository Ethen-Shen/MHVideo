import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 获取个人信息
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        locale: true,
        themePreference: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    return res.json({ code: 0, data: user });
  } catch (error) {
    console.error('获取个人信息失败:', error);
    return res.status(500).json({ code: 500, message: '获取个人信息失败' });
  }
}

// 更新个人信息
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }

    const { nickname, avatarUrl, locale, themePreference } = req.body;

    const data: Record<string, unknown> = {};
    if (nickname !== undefined) data.nickname = nickname;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (locale !== undefined) data.locale = locale;
    if (themePreference !== undefined) data.themePreference = themePreference;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ code: 400, message: '没有需要更新的字段' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        locale: true,
        themePreference: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ code: 0, data: user, message: '更新成功' });
  } catch (error) {
    console.error('更新个人信息失败:', error);
    return res.status(500).json({ code: 500, message: '更新个人信息失败' });
  }
}
