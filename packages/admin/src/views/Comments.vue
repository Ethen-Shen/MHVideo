<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">评论管理</h1>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
      <input v-model="searchUser" @keyup.enter="fetchComments" type="text" placeholder="搜索用户..." class="border rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <select v-model="filterVideo" @change="fetchComments" class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="">全部视频</option>
        <option v-for="v in videoOptions" :key="v.id" :value="v.id">{{ v.title }}</option>
      </select>
      <button @click="fetchComments" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">搜索</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="comments.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="text-gray-400">暂无评论数据</p>
    </div>

    <!-- 评论表格 -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500">
            <th class="px-4 py-3 font-medium">用户</th>
            <th class="px-4 py-3 font-medium">视频</th>
            <th class="px-4 py-3 font-medium">评论内容</th>
            <th class="px-4 py-3 font-medium">时间</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(comment, idx) in comments" :key="comment.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <img v-if="comment.user?.avatarUrl" :src="comment.user.avatarUrl" alt="" class="w-7 h-7 rounded-full object-cover" />
                <div v-else class="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">{{ (comment.user?.nickname || '?')[0] }}</div>
                <span class="text-gray-800">{{ comment.user?.nickname || '未知用户' }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 max-w-[200px] truncate">{{ comment.video?.title || '-' }}</td>
            <td class="px-4 py-3 max-w-[300px]">
              <template v-if="expandedIds.has(comment.id)">
                <span class="text-gray-700">{{ comment.content }}</span>
                <button @click="toggleExpand(comment.id)" class="text-blue-500 text-xs ml-1">收起</button>
              </template>
              <template v-else>
                <span class="text-gray-700">{{ truncateContent(comment.content) }}</span>
                <button v-if="(comment.content || '').length > 50" @click="toggleExpand(comment.id)" class="text-blue-500 text-xs ml-1">展开</button>
              </template>
            </td>
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatDate(comment.createdAt) }}</td>
            <td class="px-4 py-3">
              <button @click="confirmDelete(comment)" class="text-red-600 hover:text-red-800 text-xs">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-1">
          <button @click="goPage(page - 1)" :disabled="page <= 1" class="px-3 py-1 rounded text-sm border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">上一页</button>
          <template v-for="p in pageNumbers" :key="p">
            <button v-if="p === '...'" disabled class="px-3 py-1 text-sm text-gray-400">...</button>
            <button v-else @click="goPage(p as number)" :class="p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'" class="px-3 py-1 rounded text-sm border">{{ p }}</button>
          </template>
          <button @click="goPage(page + 1)" :disabled="page >= totalPages" class="px-3 py-1 rounded text-sm border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">下一页</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showDeleteConfirm = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold mb-2">确认删除</h3>
        <p class="text-gray-600 mb-2">确定要删除该评论吗？此操作不可恢复。</p>
        <p class="text-gray-500 text-sm mb-6 bg-gray-50 p-3 rounded">「{{ deleteTarget?.content?.slice(0, 100) }}{{ (deleteTarget?.content?.length ?? 0) > 100 ? '...' : '' }}」</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">取消</button>
          <button @click="handleDelete" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAdminComments, deleteAdminComment, getVideos } from '../api';

const loading = ref(false);
const deleting = ref(false);
const comments = ref<any[]>([]);
const videoOptions = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;

const searchUser = ref('');
const filterVideo = ref('');

const expandedIds = ref<Set<string>>(new Set());

const showDeleteConfirm = ref(false);
const deleteTarget = ref<any>(null);

const totalPages = computed(() => Math.ceil(total.value / pageSize));

const pageNumbers = computed(() => {
  const tp = totalPages.value;
  const p = page.value;
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (p > 3) pages.push('...');
  for (let i = Math.max(2, p - 1); i <= Math.min(tp - 1, p + 1); i++) pages.push(i);
  if (p < tp - 2) pages.push('...');
  if (tp > 1) pages.push(tp);
  return pages;
});

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function truncateContent(content: string) {
  if (!content) return '';
  return content.length > 50 ? content.slice(0, 50) + '...' : content;
}

function toggleExpand(id: string) {
  const newSet = new Set(expandedIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  expandedIds.value = newSet;
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  fetchComments();
}

function confirmDelete(comment: any) {
  deleteTarget.value = comment;
  showDeleteConfirm.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await deleteAdminComment(deleteTarget.value.id);
    showDeleteConfirm.value = false;
    fetchComments();
  } catch {
    alert('删除失败，请重试');
  } finally {
    deleting.value = false;
  }
}

async function fetchComments() {
  loading.value = true;
  try {
    const params: any = { page: page.value, limit: pageSize };
    if (searchUser.value) params.userName = searchUser.value;
    if (filterVideo.value) params.videoId = filterVideo.value;
    const res = (await getAdminComments(params)) as any;
    const data = res.data ?? res;
    comments.value = data.list ?? data.items ?? data.comments ?? [];
    total.value = data.total ?? comments.value.length;
  } catch {
    comments.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function fetchVideoOptions() {
  try {
    const res = (await getVideos({ limit: 200 })) as any;
    const list = Array.isArray(res.data) ? res.data : (res.data?.list ?? []);
    videoOptions.value = list;
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchVideoOptions();
  fetchComments();
});
</script>
