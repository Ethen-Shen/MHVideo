import { Request, Response } from 'express';
import multer from 'multer';
import { uploadToR2, getPresignedUploadUrl, getVideoKey, getCoverKey, getAvatarKey } from '../lib/r2';

// multer 配置 - 内存存储
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB 限制
  },
  fileFilter: (_req, file, cb) => {
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedTypes = [...allowedVideoTypes, ...allowedImageTypes];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`));
    }
  },
});

export const uploadMiddleware = upload.single('file');

// 上传文件到 R2
export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const { type, seriesId, episodeNumber } = req.body;
    const file = req.file;
    let key: string;

    switch (type) {
      case 'video':
        if (!seriesId || !episodeNumber) {
          return res.status(400).json({ error: '视频上传需要提供 seriesId 和 episodeNumber' });
        }
        const videoExt = file.originalname.split('.').pop() || 'mp4';
        key = getVideoKey(seriesId, parseInt(episodeNumber), videoExt);
        break;
      case 'cover':
        if (!seriesId || !episodeNumber) {
          return res.status(400).json({ error: '封面上传需要提供 seriesId 和 episodeNumber' });
        }
        const coverExt = file.originalname.split('.').pop() || 'jpg';
        key = getCoverKey(seriesId, parseInt(episodeNumber), coverExt);
        break;
      case 'avatar':
        const userId = req.user?.userId;
        if (!userId) {
          return res.status(401).json({ error: '请先登录' });
        }
        const avatarExt = file.originalname.split('.').pop() || 'jpg';
        key = getAvatarKey(userId, avatarExt);
        break;
      default:
        key = `misc/${Date.now()}-${file.originalname}`;
    }

    const result = await uploadToR2(file.buffer, key, file.mimetype);

    return res.json({
      message: '上传成功',
      data: result,
    });
  } catch (error) {
    console.error('上传失败:', error);
    return res.status(500).json({ error: '上传失败' });
  }
}

// 获取预签名上传 URL
export async function getPresignedUrl(req: Request, res: Response) {
  try {
    const { key, contentType, expiresIn } = req.query;

    if (!key || !contentType) {
      return res.status(400).json({ error: '请提供 key 和 contentType 参数' });
    }

    const url = await getPresignedUploadUrl(
      key as string,
      contentType as string,
      expiresIn ? parseInt(expiresIn as string) : 3600
    );

    return res.json({
      message: '获取预签名URL成功',
      data: { url },
    });
  } catch (error) {
    console.error('获取预签名URL失败:', error);
    return res.status(500).json({ error: '获取预签名URL失败' });
  }
}

// 用户头像上传
export const avatarUploadMiddleware = upload.single('avatar');

export async function uploadAvatar(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的头像' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: '请先登录' });
    }

    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const key = getAvatarKey(userId, ext);
    const result = await uploadToR2(req.file.buffer, key, req.file.mimetype);

    return res.json({
      message: '头像上传成功',
      data: result,
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    return res.status(500).json({ error: '头像上传失败' });
  }
}
