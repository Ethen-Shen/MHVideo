import { Router } from 'express';
import { uploadMiddleware, uploadFile, getPresignedUrl, avatarUploadMiddleware, uploadAvatar } from '../controllers/upload.controller';
import * as authController from '../controllers/auth.controller';
import * as userController from '../controllers/user.controller';
import * as adminController from '../controllers/admin.controller';
import * as videoController from '../controllers/video.controller';
import * as seriesController from '../controllers/series.controller';
import * as categoryController from '../controllers/category.controller';
import * as commentController from '../controllers/comment.controller';
import * as interactionController from '../controllers/interaction.controller';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';

export const routes = Router();

// Health check for API routes
routes.get('/ping', (_req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// 认证路由（公开）
routes.post('/auth/register', authController.register);
routes.post('/auth/login', authController.login);
routes.post('/auth/miniapp-login', authController.miniappLogin);
routes.post('/auth/refresh', authController.refreshToken);
routes.post('/auth/admin-login', authController.adminLogin);
routes.post('/auth/logout', authController.logout);

// 上传路由
routes.post('/admin/upload', auth, admin, uploadMiddleware, uploadFile);
routes.get('/admin/upload/presign', auth, admin, getPresignedUrl);
routes.post('/user/avatar', auth, avatarUploadMiddleware, uploadAvatar);

// 用户路由
routes.get('/user/profile', auth, userController.getProfile);
routes.put('/user/profile', auth, userController.updateProfile);

// 视频路由（公开）
routes.get('/videos', videoController.getVideos);
routes.get('/videos/search', videoController.searchVideos);
routes.get('/videos/:id', videoController.getVideoById);

// 系列路由（公开）
routes.get('/series', seriesController.getSeriesList);
routes.get('/series/:id', seriesController.getSeriesById);

// 分类路由（公开）
routes.get('/categories', categoryController.getCategories);

// 管理员路由
routes.get('/admin/dashboard', auth, admin, adminController.getDashboard);
routes.get('/admin/users', auth, admin, adminController.getUsers);
routes.put('/admin/users/:id', auth, admin, adminController.updateUserStatus);
routes.get('/admin/comments', auth, admin, adminController.getComments);
routes.delete('/admin/comments/:id', auth, admin, adminController.deleteComment);
routes.post('/admin/videos', auth, admin, videoController.createVideo);
routes.put('/admin/videos/:id', auth, admin, videoController.updateVideo);
routes.delete('/admin/videos/:id', auth, admin, videoController.deleteVideo);
routes.post('/admin/videos/:id/publish', auth, admin, videoController.publishVideo);
routes.post('/admin/series', auth, admin, seriesController.createSeries);
routes.put('/admin/series/:id', auth, admin, seriesController.updateSeries);
routes.post('/admin/categories', auth, admin, categoryController.createCategory);
routes.put('/admin/categories/:id', auth, admin, categoryController.updateCategory);
routes.delete('/admin/categories/:id', auth, admin, categoryController.deleteCategory);

// 评论路由
routes.get('/videos/:videoId/comments', commentController.getComments);
routes.post('/comments', auth, commentController.createComment);
routes.delete('/comments/:id', auth, commentController.deleteComment);

// 互动路由
routes.post('/videos/:videoId/like', auth, interactionController.toggleLike);
routes.post('/videos/:videoId/favorite', auth, interactionController.toggleFavorite);
routes.post('/videos/:videoId/rating', auth, interactionController.rateVideo);
routes.get('/videos/:videoId/rating', interactionController.getVideoRating);
routes.post('/videos/:videoId/progress', auth, interactionController.recordWatchProgress);

// 用户互动数据路由
routes.get('/user/favorite-folders', auth, interactionController.getFavoriteFolders);
routes.post('/user/favorite-folders', auth, interactionController.createFavoriteFolder);
routes.get('/user/favorites', auth, interactionController.getUserFavorites);
routes.get('/user/likes', auth, interactionController.getUserLikes);
routes.get('/user/history', auth, interactionController.getWatchHistory);
routes.delete('/user/history', auth, interactionController.clearWatchHistory);
