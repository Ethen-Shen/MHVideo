import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器 - 401 跳转登录
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  },
);

// 认证 API
export const adminLogin = (account: string, password: string) =>
  api.post('/auth/admin-login', { account, password });

// 仪表盘
export const getDashboard = () => api.get('/admin/dashboard');

// 视频 API
export const getVideos = (params: any) => api.get('/videos', { params });
export const getVideo = (id: string) => api.get(`/videos/${id}`);
export const createVideo = (data: any) => api.post('/admin/videos', data);
export const updateVideo = (id: string, data: any) => api.put(`/admin/videos/${id}`, data);
export const deleteVideo = (id: string) => api.delete(`/admin/videos/${id}`);
export const publishVideo = (id: string) => api.post(`/admin/videos/${id}/publish`);

// 系列 API
export const getSeriesList = (params: any) => api.get('/series', { params });
export const getSeries = (id: string) => api.get(`/series/${id}`);
export const createSeries = (data: any) => api.post('/admin/series', data);
export const updateSeries = (id: string, data: any) => api.put(`/admin/series/${id}`, data);

// 分类 API
export const getCategories = () => api.get('/categories');
export const createCategory = (data: any) => api.post('/admin/categories', data);
export const updateCategory = (id: string, data: any) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/admin/categories/${id}`);

// 评论 API
export const getAdminComments = (params: any) => api.get('/admin/comments', { params });
export const deleteAdminComment = (id: string) => api.delete(`/admin/comments/${id}`);

// 用户 API
export const getAdminUsers = (params: any) => api.get('/admin/users', { params });
export const updateUserStatus = (id: string, data: any) => api.put(`/admin/users/${id}`, data);

// 上传 API
export const uploadFile = (formData: FormData) =>
  api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getPresignedUrl = (params: any) => api.get('/admin/upload/presign', { params });

export default api;
