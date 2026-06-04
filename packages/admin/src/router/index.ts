import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'videos',
        name: 'Videos',
        component: () => import('../views/Videos.vue'),
        meta: { title: '视频管理' },
      },
      {
        path: 'series',
        name: 'Series',
        component: () => import('../views/Series.vue'),
        meta: { title: '系列管理' },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/Categories.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'comments',
        name: 'Comments',
        component: () => import('../views/Comments.vue'),
        meta: { title: '评论管理' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'upload',
        name: 'Upload',
        component: () => import('../views/Upload.vue'),
        meta: { title: '上传中心' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token');
  if (to.meta.requiresAuth !== false && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export { router };
export default router;
