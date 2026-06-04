import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 系列列表（公开）
export async function getSeriesList(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;
    const skip = (page - 1) * limit;

    const where: any = { status: status || 'published' };
    if (category) where.categoryId = category;

    const [series, total] = await Promise.all([
      prisma.series.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { videos: true } },
        },
      }),
      prisma.series.count({ where }),
    ]);

    const data = series.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      coverUrl: s.coverUrl,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      category: s.category,
      videoCount: s._count.videos,
    }));

    res.json({
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取系列列表失败:', error);
    res.status(500).json({ code: 500, message: '获取系列列表失败' });
  }
}

// 系列详情（公开）
export async function getSeriesById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        videos: {
          orderBy: { episodeNumber: 'asc' },
          select: {
            id: true,
            title: true,
            coverUrl: true,
            duration: true,
            episodeNumber: true,
            viewCount: true,
            likeCount: true,
            status: true,
            createdAt: true,
          },
        },
        tags: { select: { id: true, tag: true } },
      },
    });

    if (!series) {
      res.status(404).json({ code: 404, message: '系列不存在' });
      return;
    }

    res.json({ data: series });
  } catch (error) {
    console.error('获取系列详情失败:', error);
    res.status(500).json({ code: 500, message: '获取系列详情失败' });
  }
}

// 创建系列（管理员）
export async function createSeries(req: Request, res: Response) {
  try {
    const { title, description, coverUrl, categoryId, tags } = req.body;

    if (!title) {
      res.status(400).json({ code: 400, message: '标题不能为空' });
      return;
    }

    const series = await prisma.series.create({
      data: {
        title,
        description,
        coverUrl,
        categoryId,
        tags: tags?.length
          ? { create: tags.map((tag: string) => ({ tag })) }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    res.status(201).json({ data: series });
  } catch (error) {
    console.error('创建系列失败:', error);
    res.status(500).json({ code: 500, message: '创建系列失败' });
  }
}

// 更新系列（管理员）
export async function updateSeries(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, coverUrl, categoryId, tags } = req.body;

    const existing = await prisma.series.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ code: 404, message: '系列不存在' });
      return;
    }

    // 如果提供了 tags，先删除旧标签再创建新标签
    if (tags !== undefined) {
      await prisma.seriesTag.deleteMany({ where: { seriesId: id } });
    }

    const series = await prisma.series.update({
      where: { id },
      data: {
        title,
        description,
        coverUrl,
        categoryId,
        tags: tags?.length
          ? { create: tags.map((tag: string) => ({ tag })) }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    res.json({ data: series });
  } catch (error) {
    console.error('更新系列失败:', error);
    res.status(500).json({ code: 500, message: '更新系列失败' });
  }
}
