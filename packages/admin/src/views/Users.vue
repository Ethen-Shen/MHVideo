<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">用户管理</h1>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
      <input v-model="searchKeyword" @keyup.enter="fetchUsers" type="text" placeholder="搜索昵称/邮箱..." class="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <select v-model="filterStatus" @change="fetchUsers" class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="">全部状态</option>
        <option value="active">活跃</option>
        <option value="banned">封禁</option>
      </select>
      <button @click="fetchUsers" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">搜索</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="users.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-400">
      暂无用户数据
    </div>

    <!-- 用户表格 -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500">
            <th class="px-4 py-3 font-medium">头像</th>
            <th class="px-4 py-3 font-medium">昵称</th>
            <th class="px-4 py-3 font-medium">邮箱</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">注册时间</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users" :key="user.id" :class="idx % 2 === 1 ? 'bg-gray-50' : ''" class="hover:bg-blue-50">
            <td class="px-4 py-3">
              <img v-if="user.avatar" :src="user.avatar" alt="" class="w-9 h-9 rounded-full object-cover" />
              <div v-else class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">{{ (user.nickname || '?')[0] }}</div>
            </td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ user.nickname || '-' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ user.email || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="user.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'" class="px-2 py-0.5 rounded text-xs">
                {{ user.status === 'banned' ? '封禁' : '活跃' }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(user.createdAt) }}</td>
            <td class="px-4 py-3">
              <button v-if="user.status === 'banned'" @click="handleUnban(user)" class="text-green-600 hover:text-green-800 text-xs">解封</button>
              <button v-else @click="handleBan(user)" class="text-red-600 hover:text-red-800 text-xs">封禁</button>
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

    <!-- 封禁确认弹窗 -->
    <div v-if="showBanConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showBanConfirm = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold mb-2">确认封禁</h3>
        <p class="text-gray-600 mb-6">确定要封禁用户「{{ banTarget?.nickname || banTarget?.email }}」吗？封禁后该用户将无法登录。</p>
        <div class="flex justify-end gap-3">
          <button @click="showBanConfirm = false" class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">取消</button>
          <button @click="handleConfirmBan" :disabled="operating" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
            {{ operating ? '处理中...' : '确认封禁' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 解封确认弹窗 -->
    <div v-if="showUnbanConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showUnbanConfirm = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold mb-2">确认解封</h3>
        <p class="text-gray-600 mb-6">确定要解封用户「{{ unbanTarget?.nickname || unbanTarget?.email }}」吗？</p>
        <div class="flex justify-end gap-3">
          <button @click="showUnbanConfirm = false" class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">取消</button>
          <button @click="handleConfirmUnban" :disabled="operating" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
            {{ operating ? '处理中...' : '确认解封' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAdminUsers, updateUserStatus } from '../api';

const loading = ref(false);
const operating = ref(false);
const users = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;

const searchKeyword = ref('');
const filterStatus = ref('');

const showBanConfirm = ref(false);
const banTarget = ref<any>(null);
const showUnbanConfirm = ref(false);
const unbanTarget = ref<any>(null);

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

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  fetchUsers();
}

function handleBan(user: any) {
  banTarget.value = user;
  showBanConfirm.value = true;
}

function handleUnban(user: any) {
  unbanTarget.value = user;
  showUnbanConfirm.value = true;
}

async function handleConfirmBan() {
  if (!banTarget.value) return;
  operating.value = true;
  try {
    await updateUserStatus(banTarget.value.id, { status: 'banned' });
    showBanConfirm.value = false;
    fetchUsers();
  } catch {
    alert('封禁失败，请重试');
  } finally {
    operating.value = false;
  }
}

async function handleConfirmUnban() {
  if (!unbanTarget.value) return;
  operating.value = true;
  try {
    await updateUserStatus(unbanTarget.value.id, { status: 'active' });
    showUnbanConfirm.value = false;
    fetchUsers();
  } catch {
    alert('解封失败，请重试');
  } finally {
    operating.value = false;
  }
}

async function fetchUsers() {
  loading.value = true;
  try {
    const params: any = { page: page.value, pageSize };
    if (searchKeyword.value) params.keyword = searchKeyword.value;
    if (filterStatus.value) params.status = filterStatus.value;
    const res = (await getAdminUsers(params)) as any;
    const data = res.data ?? res;
    users.value = data.list ?? data.items ?? data.users ?? [];
    total.value = data.total ?? users.value.length;
  } catch {
    users.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUsers);
</script>
