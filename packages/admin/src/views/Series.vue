<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">系列管理</h1>
      <button @click="openCreate" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ 新建系列</button>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
      <input v-model="searchTitle" @keyup.enter="fetchSeries" type="text" placeholder="搜索系列标题..." class="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <select v-model="filterCategory" @change="fetchSeries" class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <button @click="fetchSeries" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">搜索</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="series.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="text-gray-400">暂无系列数据</p>
    </div>

    <!-- 系列表格 -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500">
            <th class="px-4 py-3 font-medium">封面</th>
            <th class="px-4 py-3 font-medium">标题</th>
            <th class="px-4 py-3 font-medium">分类</th>
            <th class="px-4 py-3 font-medium">视频数量</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">创建时间</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in series" :key="item.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3">
              <img v-if="item.coverUrl" :src="item.coverUrl" alt="" class="w-16 h-10 object-cover rounded" />
              <div v-else class="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">无</div>
            </td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.title }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.category?.name || '-' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ formatNumber(item.videoCount) }}</td>
            <td class="px-4 py-3">
              <span :class="item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2 py-0.5 rounded text-xs">
                {{ item.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(item.createdAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button @click="openEdit(item)" class="text-blue-600 hover:text-blue-800 text-xs">编辑</button>
                <button @click="viewEpisodes(item)" class="text-green-600 hover:text-green-800 text-xs">查看剧集</button>
              </div>
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

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">{{ isEditing ? '编辑系列' : '新建系列' }}</h2>
          <form @submit.prevent="handleSave">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">标题 <span class="text-red-500">*</span></label>
                <input v-model="form.title" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea v-model="form.description" rows="3" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">封面URL</label>
                <input v-model="form.coverUrl" type="url" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="https://" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">分类 <span class="text-red-500">*</span></label>
                <select v-model="form.categoryId" required class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">请选择</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
                <input v-model="form.tagsStr" type="text" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="标签1,标签2,标签3" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showModal = false" class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">取消</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 剧集列表弹窗 -->
    <div v-if="showEpisodes" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showEpisodes = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">「{{ episodeSeriesTitle }}」剧集列表</h2>
            <button @click="showEpisodes = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div v-if="episodesLoading" class="flex items-center justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="episodes.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p class="text-gray-400">暂无剧集</p>
          </div>
          <table v-else class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr class="text-left text-gray-500">
                <th class="px-4 py-3 font-medium">集数</th>
                <th class="px-4 py-3 font-medium">标题</th>
                <th class="px-4 py-3 font-medium">播放量</th>
                <th class="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ep, idx) in episodes" :key="ep.id" class="border-b last:border-0 hover:bg-gray-50">
                <td class="px-4 py-3">{{ ep.episodeNumber ?? idx + 1 }}</td>
                <td class="px-4 py-3 font-medium text-gray-800">{{ ep.title }}</td>
                <td class="px-4 py-3 text-gray-500">{{ formatNumber(ep.viewCount) }}</td>
                <td class="px-4 py-3">
                  <span :class="ep.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2 py-0.5 rounded text-xs">
                    {{ ep.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSeriesList, getSeries, createSeries, updateSeries, getCategories, getVideos } from '../api';

const loading = ref(false);
const saving = ref(false);
const series = ref<any[]>([]);
const categories = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;

const searchTitle = ref('');
const filterCategory = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const form = ref({
  title: '',
  description: '',
  coverUrl: '',
  categoryId: '',
  tagsStr: '',
});

const showEpisodes = ref(false);
const episodeSeriesTitle = ref('');
const episodes = ref<any[]>([]);
const episodesLoading = ref(false);

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

function formatNumber(n: number | undefined | null) {
  if (n == null) return '0';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString();
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  fetchSeries();
}

function resetForm() {
  form.value = { title: '', description: '', coverUrl: '', categoryId: '', tagsStr: '' };
}

function openCreate() {
  resetForm();
  isEditing.value = false;
  editingId.value = '';
  showModal.value = true;
}

function openEdit(item: any) {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = {
    title: item.title || '',
    description: item.description || '',
    coverUrl: item.coverUrl || '',
    categoryId: item.categoryId || '',
    tagsStr: Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || ''),
  };
  showModal.value = true;
}

async function handleSave() {
  if (!form.value.title || !form.value.categoryId) return;
  saving.value = true;
  try {
    const data: any = {
      title: form.value.title,
      description: form.value.description,
      coverUrl: form.value.coverUrl,
      categoryId: form.value.categoryId,
      tags: form.value.tagsStr ? form.value.tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    if (isEditing.value) {
      await updateSeries(editingId.value, data);
    } else {
      await createSeries(data);
    }
    showModal.value = false;
    fetchSeries();
  } catch {
    alert('保存失败，请重试');
  } finally {
    saving.value = false;
  }
}

async function viewEpisodes(item: any) {
  episodeSeriesTitle.value = item.title;
  showEpisodes.value = true;
  episodesLoading.value = true;
  try {
    const res = (await getVideos({ seriesId: item.id, limit: 200 })) as any;
    const list = Array.isArray(res.data) ? res.data : (res.data?.list ?? []);
    episodes.value = list;
  } catch {
    episodes.value = [];
  } finally {
    episodesLoading.value = false;
  }
}

async function fetchSeries() {
  loading.value = true;
  try {
    const params: any = { page: page.value, limit: pageSize };
    if (searchTitle.value) params.title = searchTitle.value;
    if (filterCategory.value) params.category = filterCategory.value;
    const res = (await getSeriesList(params)) as any;
    const list = Array.isArray(res.data) ? res.data : (res.data?.list ?? []);
    series.value = list;
    total.value = res.pagination?.total ?? res.total ?? list.length;
  } catch {
    series.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const res = (await getCategories()) as any;
    const data = res.data ?? res;
    categories.value = Array.isArray(data) ? data : (data.list ?? data.categories ?? []);
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchCategories();
  fetchSeries();
});
</script>
