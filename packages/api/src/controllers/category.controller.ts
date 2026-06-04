import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 分类列表（公开）
export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { videos: true, series: true } },
      },
    });

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      iconUrl: c.iconUrl,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt,
      videoCount: c._count.videos,
      seriesCount: c._count.series,
    }));

    res.json({ data });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ code: 500, message: '获取分类列表失败' });
  }
}

// 创建分类（管理员）
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, iconUrl, sortOrder } = req.body;

    if (!name) {
      res.status(400).json({ code: 400, message: '分类名称不能为空' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        iconUrl,
        sortOrder: sortOrder ?? 0,
      },
    });

    res.status(201).json({ data: category });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({ code: 500, message: '创建分类失败' });
  }
}

// 更新分类（管理员）
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, iconUrl, sortOrder } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ code: 404, message: '分类不存在' });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        iconUrl,
        sortOrder,
      },
    });

    res.json({ data: category });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ code: 500, message: '更新分类失败' });
  }
}

// 删除分类（管理员）
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ code: 404, message: '分类不存在' });
      return;
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ code: 500, message: '删除分类失败' });
  }
}
