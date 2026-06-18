<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">仪表盘</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-gray-500 text-sm font-medium">总视频数</h3>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(stats.totalVideos) }}</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-gray-500 text-sm font-medium">总用户数</h3>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(stats.totalUsers) }}</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 class="text-gray-500 text-sm font-medium">总系列数</h3>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(stats.totalSeries) }}</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-gray-500 text-sm font-medium">今日播放量</h3>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(stats.todayViews) }}</p>
          </div>
        </div>
      </div>

      <!-- 下方两栏 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <!-- 最近添加的视频 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">最近添加的视频</h3>
          <div v-if="recentVideos.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="text-sm">暂无数据</span>
          </div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-gray-500">
                <th class="pb-3 font-medium">标题</th>
                <th class="pb-3 font-medium">系列</th>
                <th class="pb-3 font-medium">状态</th>
                <th class="pb-3 font-medium">创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="video in recentVideos" :key="video.id" class="border-b last:border-0 hover:bg-gray-50">
                <td class="py-3">{{ video.title }}</td>
                <td class="py-3 text-gray-500">{{ video.series?.title || '-' }}</td>
                <td class="py-3">
                  <span :class="video.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2 py-0.5 rounded text-xs">
                    {{ video.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </td>
                <td class="py-3 text-gray-500">{{ formatDate(video.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 热门视频 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">热门视频 Top 5</h3>
          <div v-if="topVideos.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="text-sm">暂无数据</span>
          </div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-gray-500">
                <th class="pb-3 font-medium">排名</th>
                <th class="pb-3 font-medium">标题</th>
                <th class="pb-3 font-medium">播放量</th>
                <th class="pb-3 font-medium">点赞数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(video, idx) in topVideos" :key="video.id" class="border-b last:border-0 hover:bg-gray-50">
                <td class="py-3">
                  <span :class="idx < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="py-3">{{ video.title }}</td>
                <td class="py-3 text-gray-500">{{ formatNumber(video.viewCount) }}</td>
                <td class="py-3 text-gray-500">{{ formatNumber(video.likeCount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDashboard } from '../api';

const loading = ref(true);
const stats = ref({
  totalVideos: 0,
  totalUsers: 0,
  totalSeries: 0,
  todayViews: 0,
});
const recentVideos = ref<any[]>([]);
const topVideos = ref<any[]>([]);

function formatNumber(n: number) {
  if (n == null) return '0';
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

async function fetchData() {
  loading.value = true;
  try {
    const res = (await getDashboard()) as any;
    const data = res.data ?? res;
    stats.value = {
      totalVideos: data.totalVideos ?? 0,
      totalUsers: data.totalUsers ?? 0,
      totalSeries: data.totalSeries ?? 0,
      todayViews: data.todayViews ?? 0,
    };
    recentVideos.value = data.recentVideos ?? [];
    topVideos.value = data.topVideos ?? [];
  } catch {
    // keep default values
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>
