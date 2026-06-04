import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 视频列表（公开）
export async function getVideos(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string | undefined;
    const sort = (req.query.sort as string) || 'newest';
    const seriesId = req.query.seriesId as string | undefined;

    const skip = (page - 1) * limit;

    const where: any = { status: 'published' };
    if (category) where.categoryId = category;
    if (seriesId) where.seriesId = seriesId;

    const orderBy: any =
      sort === 'popular' ? { viewCount: 'desc' } :
      sort === 'rating' ? { likeCount: 'desc' } :
      { createdAt: 'desc' };

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          series: { select: { id: true, title: true, coverUrl: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.video.count({ where }),
    ]);

    res.json({
      data: videos,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取视频列表失败:', error);
    res.status(500).json({ code: 500, message: '获取视频列表失败' });
  }
}

// 视频详情（公开）
export async function getVideoById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        series: { select: { id: true, title: true, coverUrl: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, tag: true } },
      },
    });

    if (!video) {
      res.status(404).json({ code: 404, message: '视频不存在' });
      return;
    }

    // 增加播放量
    await prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ data: { ...video, viewCount: video.viewCount + 1 } });
  } catch (error) {
    console.error('获取视频详情失败:', error);
    res.status(500).json({ code: 500, message: '获取视频详情失败' });
  }
}

// 视频搜索（公开）
export async function searchVideos(req: Request, res: Response) {
  try {
    const keyword = req.query.keyword as string | undefined;
    const category = req.query.category as string | undefined;
    const tag = req.query.tag as string | undefined;
    const sort = (req.query.sort as string) || 'newest';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = { status: 'published' };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (category) where.categoryId = category;

    if (tag) {
      where.tags = { some: { tag } };
    }

    const orderBy: any =
      sort === 'popular' ? { viewCount: 'desc' } :
      sort === 'rating' ? { likeCount: 'desc' } :
      { createdAt: 'desc' };

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          series: { select: { id: true, title: true, coverUrl: true } },
          category: { select: { id: true, name: true } },
          tags: { select: { id: true, tag: true } },
        },
      }),
      prisma.video.count({ where }),
    ]);

    res.json({
      data: videos,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('搜索视频失败:', error);
    res.status(500).json({ code: 500, message: '搜索视频失败' });
  }
}

// 创建视频（管理员）
export async function createVideo(req: Request, res: Response) {
  try {
    const { title, description, coverUrl, videoUrl, duration, episodeNumber, seriesId, categoryId, tags } = req.body;

    if (!title) {
      res.status(400).json({ code: 400, message: '标题不能为空' });
      return;
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        coverUrl,
        videoUrl,
        duration: duration || 0,
        episodeNumber: episodeNumber || 1,
        seriesId,
        categoryId,
        tags: tags?.length
          ? { create: tags.map((tag: string) => ({ tag })) }
          : undefined,
      },
      include: {
        series: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    res.status(201).json({ data: video });
  } catch (error) {
    console.error('创建视频失败:', error);
    res.status(500).json({ code: 500, message: '创建视频失败' });
  }
}

// 更新视频（管理员）
export async function updateVideo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, coverUrl, videoUrl, duration, episodeNumber, seriesId, categoryId, tags } = req.body;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ code: 404, message: '视频不存在' });
      return;
    }

    // 如果提供了 tags，先删除旧标签再创建新标签
    if (tags !== undefined) {
      await prisma.videoTag.deleteMany({ where: { videoId: id } });
    }

    const video = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        coverUrl,
        videoUrl,
        duration,
        episodeNumber,
        seriesId,
        categoryId,
        tags: tags?.length
          ? { create: tags.map((tag: string) => ({ tag })) }
          : undefined,
      },
      include: {
        series: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    res.json({ data: video });
  } catch (error) {
    console.error('更新视频失败:', error);
    res.status(500).json({ code: 500, message: '更新视频失败' });
  }
}

// 删除视频（管理员）
export async function deleteVideo(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ code: 404, message: '视频不存在' });
      return;
    }

    // VideoTag 有 onDelete: Cascade，会自动级联删除
    await prisma.video.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除视频失败:', error);
    res.status(500).json({ code: 500, message: '删除视频失败' });
  }
}

// 发布视频（管理员）
export async function publishVideo(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ code: 404, message: '视频不存在' });
      return;
    }

    const video = await prisma.video.update({
      where: { id },
      data: { status: 'published' },
      include: {
        series: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    res.json({ data: video });
  } catch (error) {
    console.error('发布视频失败:', error);
    res.status(500).json({ code: 500, message: '发布视频失败' });
  }
}
