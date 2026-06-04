const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  needAuth?: boolean;
}

function getToken(): string {
  return uni.getStorageSync('token') ?? '';
}

function request<T = unknown>(options: RequestOptions): Promise<T> {
  const token = getToken();

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method ?? 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(options.needAuth !== false && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.removeStorageSync('user_info');
          uni.showToast({ title: '请重新登录', icon: 'none' });
          reject(new Error('Unauthorized'));
        } else {
          uni.showToast({ title: res.data?.error || '请求失败', icon: 'none' });
          reject(new Error(`Request failed: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

// 认证 API
export const authApi = {
  register: (data: { email: string; password: string; username: string; confirmPassword: string }) =>
    request({ url: '/auth/register', method: 'POST', data, needAuth: false }),
  login: (data: { email: string; password: string }) =>
    request({ url: '/auth/login', method: 'POST', data, needAuth: false }),
  miniappLogin: (data: { code: string; platform: string }) =>
    request({ url: '/auth/miniapp-login', method: 'POST', data, needAuth: false }),
  refreshToken: (refreshToken: string) =>
    request({ url: '/auth/refresh', method: 'POST', data: { refreshToken }, needAuth: false }),
};

// 视频 API
export const videoApi = {
  getVideos: (params: Record<string, unknown>) => request({ url: '/videos', data: params }),
  getVideo: (id: string) => request({ url: `/videos/${id}` }),
  search: (params: Record<string, unknown>) => request({ url: '/videos/search', data: params }),
};

// 系列 API
export const seriesApi = {
  getList: (params: Record<string, unknown>) => request({ url: '/series', data: params }),
  getDetail: (id: string) => request({ url: `/series/${id}` }),
};

// 分类 API
export const categoryApi = {
  getList: () => request({ url: '/categories' }),
};

// 评论 API
export const commentApi = {
  getList: (videoId: string, params: Record<string, unknown>) =>
    request({ url: `/videos/${videoId}/comments`, data: params }),
  create: (data: { videoId: string; content: string; parentId?: string }) =>
    request({ url: '/comments', method: 'POST', data, needAuth: true }),
  delete: (id: string) => request({ url: `/comments/${id}`, method: 'DELETE', needAuth: true }),
};

// 互动 API
export const interactionApi = {
  toggleLike: (videoId: string) =>
    request({ url: `/videos/${videoId}/like`, method: 'POST', needAuth: true }),
  toggleFavorite: (videoId: string, folderId?: string) =>
    request({ url: `/videos/${videoId}/favorite`, method: 'POST', data: { folderId }, needAuth: true }),
  rate: (videoId: string, score: number) =>
    request({ url: `/videos/${videoId}/rating`, method: 'POST', data: { score }, needAuth: true }),
  getRating: (videoId: string) => request({ url: `/videos/${videoId}/rating` }),
  recordProgress: (videoId: string, progress: number, completed: boolean) =>
    request({ url: `/videos/${videoId}/progress`, method: 'POST', data: { progress, completed }, needAuth: true }),
  getFavoriteFolders: () => request({ url: '/user/favorite-folders', needAuth: true }),
  createFavoriteFolder: (name: string) =>
    request({ url: '/user/favorite-folders', method: 'POST', data: { name }, needAuth: true }),
  getFavorites: (params: Record<string, unknown>) =>
    request({ url: '/user/favorites', data: params, needAuth: true }),
  getLikes: (params: Record<string, unknown>) =>
    request({ url: '/user/likes', data: params, needAuth: true }),
  getHistory: (params: Record<string, unknown>) =>
    request({ url: '/user/history', data: params, needAuth: true }),
  clearHistory: () => request({ url: '/user/history', method: 'DELETE', needAuth: true }),
};

// 用户 API
export const userApi = {
  getProfile: () => request({ url: '/user/profile', needAuth: true }),
  updateProfile: (data: Record<string, unknown>) =>
    request({ url: '/user/profile', method: 'PUT', data, needAuth: true }),
  uploadAvatar: (filePath: string) => {
    const token = getToken();
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${BASE_URL}/user/avatar`,
        filePath,
        name: 'avatar',
        header: { Authorization: `Bearer ${token}` },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(res.data));
          } else {
            reject(JSON.parse(res.data));
          }
        },
        fail: reject,
      });
    });
  },
};

// 通用请求方法（保留向后兼容）
export const api = {
  get<T = unknown>(url: string, data?: Record<string, unknown>) {
    return request<T>({ url, method: 'GET', data });
  },
  post<T = unknown>(url: string, data?: Record<string, unknown>) {
    return request<T>({ url, method: 'POST', data });
  },
  put<T = unknown>(url: string, data?: Record<string, unknown>) {
    return request<T>({ url, method: 'PUT', data });
  },
  delete<T = unknown>(url: string, data?: Record<string, unknown>) {
    return request<T>({ url, method: 'DELETE', data });
  },
};

export default api;
