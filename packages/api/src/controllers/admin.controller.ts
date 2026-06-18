import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 仪表盘数据
export async function getDashboard(_req: Request, res: Response) {
  try {
    const [totalVideos, totalUsers, totalSeries, todayViewsResult, recentVideos, topVideos] =
      await Promise.all([
        prisma.video.count(),
        prisma.user.count(),
        prisma.series.count(),
        prisma.video.aggregate({
          _sum: { viewCount: true },
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.video.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            coverUrl: true,
            viewCount: true,
            status: true,
            createdAt: true,
            series: { select: { title: true } },
          },
        }),
        prisma.video.findMany({
          orderBy: { viewCount: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            coverUrl: true,
            viewCount: true,
            likeCount: true,
            status: true,
          },
        }),
      ]);

    return res.json({
      code: 0,
      data: {
        totalVideos,
        totalUsers,
        totalSeries,
        todayViews: todayViewsResult._sum.viewCount || 0,
        recentVideos,
        topVideos,
      },
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    return res.status(500).json({ code: 500, message: '获取仪表盘数据失败' });
  }
}

// 用户管理列表
export async function getUsers(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { nickname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      code: 0,
      data: {
        list: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return res.status(500).json({ code: 500, message: '获取用户列表失败' });
  }
}

// 管理用户状态
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ code: 400, message: '状态值无效，仅支持 active/banned' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        nickname: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.json({ code: 0, data: updated, message: '状态更新成功' });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    return res.status(500).json({ code: 500, message: '更新用户状态失败' });
  }
}

// 评论管理列表
export async function getComments(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const videoId = req.query.videoId as string | undefined;
    const userId = req.query.userId as string | undefined;

    const where: Record<string, unknown> = {};
    if (videoId) where.videoId = videoId;
    if (userId) where.userId = userId;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: { id: true, nickname: true, avatarUrl: true },
          },
          video: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return res.json({
      code: 0,
      data: {
        list: comments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return res.status(500).json({ code: 500, message: '获取评论列表失败' });
  }
}

// 管理员删除评论
export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    // 删除评论及其所有回复（递归删除子评论）
    await prisma.comment.deleteMany({
      where: { parentId: id },
    });
    await prisma.comment.delete({
      where: { id },
    });

    return res.json({ code: 0, message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return res.status(500).json({ code: 500, message: '删除评论失败' });
  }
}
