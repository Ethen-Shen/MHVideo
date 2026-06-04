<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">分类管理</h1>
      <button @click="openCreate" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ 新建分类</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="categories.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-400">
      暂无分类数据
    </div>

    <!-- 分类表格 -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500">
            <th class="px-4 py-3 font-medium">名称</th>
            <th class="px-4 py-3 font-medium">图标</th>
            <th class="px-4 py-3 font-medium">排序</th>
            <th class="px-4 py-3 font-medium">视频数量</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cat, idx) in categories" :key="cat.id" :class="idx % 2 === 1 ? 'bg-gray-50' : ''" class="hover:bg-blue-50">
            <td class="px-4 py-3 font-medium text-gray-800">{{ cat.name }}</td>
            <td class="px-4 py-3">
              <img v-if="cat.iconUrl" :src="cat.iconUrl" alt="" class="w-8 h-8 object-contain rounded" />
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ cat.sort ?? 0 }}</td>
            <td class="px-4 py-3 text-gray-500">{{ cat.videoCount ?? 0 }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2 items-center">
                <button @click="moveUp(idx)" :disabled="idx === 0" class="text-gray-500 hover:text-gray-700 disabled:opacity-30 text-xs" title="上移">↑</button>
                <button @click="moveDown(idx)" :disabled="idx === categories.length - 1" class="text-gray-500 hover:text-gray-700 disabled:opacity-30 text-xs" title="下移">↓</button>
                <button @click="openEdit(cat)" class="text-blue-600 hover:text-blue-800 text-xs">编辑</button>
                <button @click="confirmDelete(cat)" class="text-red-600 hover:text-red-800 text-xs">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">{{ isEditing ? '编辑分类' : '新建分类' }}</h2>
          <form @submit.prevent="handleSave">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">名称 <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">图标URL</label>
                <input v-model="form.iconUrl" type="url" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="https://" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">排序（数字越小越靠前）</label>
                <input v-model.number="form.sort" type="number" min="0" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
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

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showDeleteConfirm = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold mb-2">确认删除</h3>
        <p class="text-gray-600 mb-6">确定要删除分类「{{ deleteTarget?.name }}」吗？该分类下的视频将失去分类关联。</p>
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
import { ref, onMounted } from 'vue';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const categories = ref<any[]>([]);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const form = ref({
  name: '',
  iconUrl: '',
  sort: 0,
});

const showDeleteConfirm = ref(false);
const deleteTarget = ref<any>(null);

function resetForm() {
  form.value = { name: '', iconUrl: '', sort: 0 };
}

function openCreate() {
  resetForm();
  isEditing.value = false;
  editingId.value = '';
  showModal.value = true;
}

function openEdit(cat: any) {
  isEditing.value = true;
  editingId.value = cat.id;
  form.value = {
    name: cat.name || '',
    iconUrl: cat.iconUrl || '',
    sort: cat.sort ?? 0,
  };
  showModal.value = true;
}

async function handleSave() {
  if (!form.value.name) return;
  saving.value = true;
  try {
    const data = {
      name: form.value.name,
      iconUrl: form.value.iconUrl,
      sort: form.value.sort,
    };
    if (isEditing.value) {
      await updateCategory(editingId.value, data);
    } else {
      await createCategory(data);
    }
    showModal.value = false;
    fetchCategories();
  } catch {
    alert('保存失败，请重试');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(cat: any) {
  deleteTarget.value = cat;
  showDeleteConfirm.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await deleteCategory(deleteTarget.value.id);
    showDeleteConfirm.value = false;
    fetchCategories();
  } catch {
    alert('删除失败，请重试');
  } finally {
    deleting.value = false;
  }
}

async function moveUp(idx: number) {
  if (idx <= 0) return;
  const cat = categories.value[idx];
  const prevCat = categories.value[idx - 1];
  try {
    await Promise.all([
      updateCategory(cat.id, { sort: prevCat.sort ?? idx - 1 }),
      updateCategory(prevCat.id, { sort: cat.sort ?? idx }),
    ]);
    fetchCategories();
  } catch {
    alert('排序失败，请重试');
  }
}

async function moveDown(idx: number) {
  if (idx >= categories.value.length - 1) return;
  const cat = categories.value[idx];
  const nextCat = categories.value[idx + 1];
  try {
    await Promise.all([
      updateCategory(cat.id, { sort: nextCat.sort ?? idx + 1 }),
      updateCategory(nextCat.id, { sort: cat.sort ?? idx }),
    ]);
    fetchCategories();
  } catch {
    alert('排序失败，请重试');
  }
}

async function fetchCategories() {
  loading.value = true;
  try {
    const res = (await getCategories()) as any;
    const data = res.data ?? res;
    categories.value = Array.isArray(data) ? data : (data.list ?? data.categories ?? []);
  } catch {
    categories.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchCategories);
</script>
