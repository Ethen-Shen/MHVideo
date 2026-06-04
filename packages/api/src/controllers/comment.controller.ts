import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 获取视频评论列表
export async function getComments(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { videoId, parentId: null },
        include: {
          user: { select: { id: true, nickname: true, avatarUrl: true } },
          replies: {
            include: {
              user: { select: { id: true, nickname: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { videoId, parentId: null } }),
    ]);

    return res.json({
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return res.status(500).json({ error: '获取评论失败' });
  }
}

// 发表评论
export async function createComment(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { videoId, content, parentId } = req.body;

    if (!videoId || !content?.trim()) {
      return res.status(400).json({ error: '视频ID和评论内容不能为空' });
    }

    // 验证视频存在
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }

    // 如果有 parentId，验证父评论存在且属于同一视频
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        return res.status(404).json({ error: '父评论不存在' });
      }
      if (parentComment.videoId !== videoId) {
        return res.status(400).json({ error: '父评论不属于该视频' });
      }
      // 只支持一级回复：父评论必须是顶级评论
      if (parentComment.parentId !== null) {
        return res.status(400).json({ error: '不支持多级回复' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        videoId,
        userId,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, nickname: true, avatarUrl: true } },
        replies: {
          include: {
            user: { select: { id: true, nickname: true, avatarUrl: true } },
          },
        },
      },
    });

    return res.status(201).json({ data: comment });
  } catch (error) {
    console.error('发表评论失败:', error);
    return res.status(500).json({ error: '发表评论失败' });
  }
}

// 删除评论
export async function deleteComment(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 只能删除自己的评论，管理员可删除任意评论
    if (comment.userId !== userId && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
      return res.status(403).json({ error: '无权删除该评论' });
    }

    // 级联删除：先删除该评论的所有回复，再删除评论本身
    await prisma.comment.deleteMany({ where: { parentId: id } });
    await prisma.comment.delete({ where: { id } });

    return res.json({ message: '评论已删除' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return res.status(500).json({ error: '删除评论失败' });
  }
}
