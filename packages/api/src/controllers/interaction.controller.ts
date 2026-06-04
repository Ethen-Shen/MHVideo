import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 点赞/取消点赞
export async function toggleLike(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { videoId } = req.params;

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.video.update({
        where: { id: videoId },
        data: { likeCount: { decrement: 1 } },
      });
      liked = false;
    } else {
      await prisma.like.create({ data: { userId, videoId } });
      await prisma.video.update({
        where: { id: videoId },
        data: { likeCount: { increment: 1 } },
      });
      liked = true;
    }

    return res.json({ data: { liked } });
  } catch (error) {
    console.error('点赞操作失败:', error);
    return res.status(500).json({ error: '点赞操作失败' });
  }
}

// 收藏/取消收藏
export async function toggleFavorite(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { videoId } = req.params;
    const { folderId } = req.body;

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }

    // 如果指定了收藏夹，验证收藏夹属于当前用户
    if (folderId) {
      const folder = await prisma.favoriteFolder.findUnique({
        where: { id: folderId },
      });
      if (!folder || folder.userId !== userId) {
        return res.status(400).json({ error: '收藏夹不存在或不属于当前用户' });
      }
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    let favorited: boolean;
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      favorited = false;
    } else {
      await prisma.favorite.create({
        data: { userId, videoId, folderId: folderId || null },
      });
      favorited = true;
    }

    return res.json({ data: { favorited } });
  } catch (error) {
    console.error('收藏操作失败:', error);
    return res.status(500).json({ error: '收藏操作失败' });
  }
}

// 获取收藏夹列表
export async function getFavoriteFolders(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const folders = await prisma.favoriteFolder.findMany({
      where: { userId },
      include: {
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt,
      videoCount: folder._count.favorites,
    }));

    return res.json({ data });
  } catch (error) {
    console.error('获取收藏夹失败:', error);
    return res.status(500).json({ error: '获取收藏夹失败' });
  }
}

// 创建收藏夹
export async function createFavoriteFolder(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: '收藏夹名称不能为空' });
    }

    const folder = await prisma.favoriteFolder.create({
      data: { name: name.trim(), userId },
    });

    return res.status(201).json({ data: folder });
  } catch (error) {
    console.error('创建收藏夹失败:', error);
    return res.status(500).json({ error: '创建收藏夹失败' });
  }
}

// 评分
export async function rateVideo(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { videoId } = req.params;
    const { score } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: '评分必须在1-5之间' });
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }

    const rating = await prisma.rating.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: { score },
      create: { userId, videoId, score },
    });

    // 计算平均评分
    const agg = await prisma.rating.aggregate({
      where: { videoId },
      _avg: { score: true },
      _count: { score: true },
    });

    return res.json({
      data: {
        userScore: rating.score,
        averageScore: agg._avg.score ?? 0,
        ratingCount: agg._count.score,
      },
    });
  } catch (error) {
    console.error('评分失败:', error);
    return res.status(500).json({ error: '评分失败' });
  }
}

// 获取视频评分
export async function getVideoRating(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    const userId = req.user?.userId;

    const agg = await prisma.rating.aggregate({
      where: { videoId },
      _avg: { score: true },
      _count: { score: true },
    });

    let userScore: number | null = null;
    if (userId) {
      const userRating = await prisma.rating.findUnique({
        where: { userId_videoId: { userId, videoId } },
      });
      userScore = userRating?.score ?? null;
    }

    return res.json({
      data: {
        averageScore: agg._avg.score ?? 0,
        ratingCount: agg._count.score,
        userScore,
      },
    });
  } catch (error) {
    console.error('获取评分失败:', error);
    return res.status(500).json({ error: '获取评分失败' });
  }
}

// 记录观看进度
export async function recordWatchProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { videoId } = req.params;
    const { progress, completed } = req.body;

    if (typeof progress !== 'number' || progress < 0) {
      return res.status(400).json({ error: '进度值无效' });
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }

    await prisma.watchHistory.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: { progress, completed: completed ?? false },
      create: { userId, videoId, progress, completed: completed ?? false },
    });

    return res.json({ message: '进度已保存' });
  } catch (error) {
    console.error('记录观看进度失败:', error);
    return res.status(500).json({ error: '记录观看进度失败' });
  }
}

// 获取观看历史
export async function getWatchHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId },
        include: {
          video: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              duration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.watchHistory.count({ where: { userId } }),
    ]);

    return res.json({
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取观看历史失败:', error);
    return res.status(500).json({ error: '获取观看历史失败' });
  }
}

// 清除观看历史
export async function clearWatchHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    await prisma.watchHistory.deleteMany({ where: { userId } });

    return res.json({ message: '观看历史已清除' });
  } catch (error) {
    console.error('清除观看历史失败:', error);
    return res.status(500).json({ error: '清除观看历史失败' });
  }
}

// 获取用户收藏列表
export async function getUserFavorites(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const folderId = req.query.folderId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (folderId) {
      where.folderId = folderId;
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        include: {
          video: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              duration: true,
            },
          },
          folder: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favorite.count({ where }),
    ]);

    return res.json({
      data: favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return res.status(500).json({ error: '获取收藏列表失败' });
  }
}

// 获取用户点赞列表
export async function getUserLikes(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { userId },
        include: {
          video: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              duration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.like.count({ where: { userId } }),
    ]);

    return res.json({
      data: likes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取点赞列表失败:', error);
    return res.status(500).json({ error: '获取点赞列表失败' });
  }
}
