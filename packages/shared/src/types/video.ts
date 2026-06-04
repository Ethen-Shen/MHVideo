export interface Video {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  rating: number;
  ratingCount: number;
  status: VideoStatus;
  categoryId: string;
  category?: Category;
  seriesId?: string;
  series?: Series;
  episode?: number;
  userId: string;
  user?: import('./user').User;
  createdAt: string;
  updatedAt: string;
}

export enum VideoStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNLISTED = 'unlisted',
  BLOCKED = 'blocked',
}

export interface Series {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  status: SeriesStatus;
  categoryId: string;
  category?: Category;
  videos?: Video[];
  createdAt: string;
  updatedAt: string;
}

export enum SeriesStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  DRAFT = 'draft',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  parentId?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  userId: string;
  targetType: LikeTargetType;
  targetId: string;
  createdAt: string;
}

export enum LikeTargetType {
  VIDEO = 'video',
  COMMENT = 'comment',
}

export interface FavoriteFolder {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  userId: string;
  favorites?: Favorite[];
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  folderId: string;
  videoId: string;
  video?: Video;
  createdAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  videoId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchHistory {
  id: string;
  userId: string;
  videoId: string;
  video?: Video;
  progress: number;
  lastWatchedAt: string;
  createdAt: string;
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  coverUrl: string;
  videoUrl: string;
  duration: number;
  categoryId: string;
  seriesId?: string;
  episode?: number;
  status: VideoStatus;
}

export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  coverUrl?: string;
  categoryId?: string;
  seriesId?: string;
  episode?: number;
  status?: VideoStatus;
}

export interface VideoQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  seriesId?: string;
  status?: VideoStatus;
  sortBy?: 'createdAt' | 'views' | 'likes' | 'rating';
  sortOrder?: 'asc' | 'desc';
}
