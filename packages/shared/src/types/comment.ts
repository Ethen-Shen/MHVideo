export interface Comment {
  id: string;
  content: string;
  userId: string;
  user?: import('./user').User;
  videoId: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
}

export enum CommentStatus {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

export interface CreateCommentRequest {
  content: string;
  videoId: string;
  parentId?: string;
}

export interface CommentQueryParams {
  page?: number;
  pageSize?: number;
  videoId?: string;
  userId?: string;
  parentId?: string;
  sortBy?: 'createdAt' | 'likes';
  sortOrder?: 'asc' | 'desc';
}
