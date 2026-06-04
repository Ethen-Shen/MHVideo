<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-gray-900 text-white transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0">
        <img src="@/assets/logo.svg" alt="墨焕影视" class="w-8 h-8 flex-shrink-0" />
        <span v-if="!collapsed" class="ml-3 text-lg font-bold whitespace-nowrap">墨焕影视 管理后台</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-2 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group',
            isActive(item.path)
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white',
          ]"
          :title="collapsed ? item.label : ''"
        >
          <!-- Icon -->
          <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center">
            <!-- Dashboard -->
            <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            <!-- Video -->
            <svg v-else-if="item.icon === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <!-- Series (layers) -->
            <svg v-else-if="item.icon === 'series'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
            </svg>
            <!-- Category (tag) -->
            <svg v-else-if="item.icon === 'category'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <!-- Comment -->
            <svg v-else-if="item.icon === 'comment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <!-- User -->
            <svg v-else-if="item.icon === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <!-- Upload (cloud-upload) -->
            <svg v-else-if="item.icon === 'upload'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <span v-if="!collapsed" class="ml-3 whitespace-nowrap">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Collapse toggle -->
      <div class="p-2 border-t border-gray-700 flex-shrink-0">
        <button
          class="w-full flex items-center justify-center py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          @click="collapsed = !collapsed"
        >
          <svg
            :class="['w-5 h-5 transition-transform duration-300', collapsed ? 'rotate-180' : '']"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
          </svg>
          <span v-if="!collapsed" class="ml-2 text-sm">收起菜单</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Top bar -->
      <header class="bg-white h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
        <!-- Breadcrumb -->
        <nav class="flex items-center text-sm">
          <router-link to="/dashboard" class="text-gray-400 hover:text-gray-600 transition-colors">首页</router-link>
          <template v-if="currentPageTitle">
            <svg class="w-4 h-4 mx-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span class="text-gray-700 font-medium">{{ currentPageTitle }}</span>
          </template>
        </nav>

        <!-- Admin info -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {{ adminInitial }}
            </div>
            <span class="text-sm text-gray-600 hidden sm:inline">{{ adminEmail }}</span>
          </div>
          <button
            class="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1"
            @click="handleLogout"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span class="hidden sm:inline">退出</span>
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <div class="max-w-[1400px] mx-auto p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const collapsed = ref(false);

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: 'dashboard' },
  { path: '/videos', label: '视频管理', icon: 'video' },
  { path: '/series', label: '系列管理', icon: 'series' },
  { path: '/categories', label: '分类管理', icon: 'category' },
  { path: '/comments', label: '评论管理', icon: 'comment' },
  { path: '/users', label: '用户管理', icon: 'user' },
  { path: '/upload', label: '上传中心', icon: 'upload' },
];

const titleMap: Record<string, string> = {
  Dashboard: '仪表盘',
  Videos: '视频管理',
  Series: '系列管理',
  Categories: '分类管理',
  Comments: '评论管理',
  Users: '用户管理',
  Upload: '上传中心',
};

const currentPageTitle = computed(() => {
  const name = route.name as string;
  return titleMap[name] ?? '';
});

function isActive(path: string) {
  if (path === '/dashboard') {
    return route.path === '/' || route.path === '/dashboard';
  }
  return route.path.startsWith(path);
}

const adminEmail = computed(() => {
  return authStore.adminInfo?.email || 'admin@mhvideo.com';
});

const adminInitial = computed(() => {
  const email = adminEmail.value;
  return email ? email.charAt(0).toUpperCase() : 'A';
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
