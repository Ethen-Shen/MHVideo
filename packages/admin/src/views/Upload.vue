<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">上传中心</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：上传配置 -->
      <div class="lg:col-span-1 space-y-6">
        <!-- 上传类型 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">上传类型</h3>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="uploadType" type="radio" value="video" class="text-blue-600" />
              <span class="text-sm">视频文件</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="uploadType" type="radio" value="cover" class="text-blue-600" />
              <span class="text-sm">封面图片</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="uploadType" type="radio" value="other" class="text-blue-600" />
              <span class="text-sm">其他文件</span>
            </label>
          </div>
        </div>

        <!-- 系列和集数（视频/封面上传时显示） -->
        <div v-if="uploadType === 'video' || uploadType === 'cover'" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">关联信息</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">系列</label>
              <select v-model="selectedSeriesId" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">不关联系列</option>
                <option v-for="s in seriesList" :key="s.id" :value="s.id">{{ s.title }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">集数</label>
              <input v-model.number="episodeNumber" type="number" min="1" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="第几集" />
            </div>
          </div>
        </div>

        <!-- 文件类型提示 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">支持格式</h3>
          <div class="text-sm text-gray-500 space-y-1">
            <p v-if="uploadType === 'video'">视频：mp4, webm</p>
            <p v-else-if="uploadType === 'cover'">图片：jpg, png, webp</p>
            <p v-else>所有支持的格式</p>
            <p class="text-orange-500 mt-2">单文件最大 500MB</p>
          </div>
        </div>
      </div>

      <!-- 右侧：上传区域和文件列表 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 拖拽上传区域 -->
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'"
          class="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors"
        >
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-600 mb-1">拖拽文件到此处，或点击选择文件</p>
          <p class="text-gray-400 text-sm">支持批量上传</p>
          <input ref="fileInput" type="file" :accept="acceptTypes" multiple class="hidden" @change="handleFileSelect" />
        </div>

        <!-- 上传文件列表 -->
        <div v-if="uploadFiles.length > 0" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">上传列表（{{ uploadFiles.length }} 个文件）</h3>
          <div class="space-y-3">
            <div v-for="(file, idx) in uploadFiles" :key="idx" class="border rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 min-w-0">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm text-gray-800 truncate">{{ file.name }}</span>
                  <span class="text-xs text-gray-400 flex-shrink-0">{{ formatSize(file.size) }}</span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <!-- 上传成功 -->
                  <template v-if="file.status === 'success'">
                    <span class="text-green-600 text-xs">上传成功</span>
                    <button @click="copyUrl(file.url!)" class="text-blue-600 hover:text-blue-800 text-xs">复制URL</button>
                    <button @click="removeFile(idx)" class="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  </template>
                  <!-- 上传失败 -->
                  <template v-else-if="file.status === 'error'">
                    <span class="text-red-600 text-xs">{{ file.errorMsg || '上传失败' }}</span>
                    <button @click="retryUpload(idx)" class="text-blue-600 hover:text-blue-800 text-xs">重试</button>
                    <button @click="removeFile(idx)" class="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  </template>
                  <!-- 上传中 -->
                  <template v-else>
                    <button @click="cancelUpload(idx)" class="text-gray-400 hover:text-gray-600 text-xs">取消</button>
                  </template>
                </div>
              </div>
              <!-- 进度条 -->
              <div v-if="file.status === 'uploading'" class="w-full bg-gray-200 rounded-full h-1.5">
                <div class="bg-blue-600 h-1.5 rounded-full transition-all" :style="{ width: file.progress + '%' }"></div>
              </div>
              <!-- 成功后显示URL -->
              <div v-if="file.status === 'success' && file.url" class="mt-2 bg-gray-50 rounded p-2">
                <p class="text-xs text-gray-500 break-all">{{ file.url }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { uploadFile, getSeriesList } from '../api';

interface UploadFileItem {
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  errorMsg?: string;
}

const uploadType = ref<'video' | 'cover' | 'other'>('video');
const selectedSeriesId = ref('');
const episodeNumber = ref(1);
const seriesList = ref<any[]>([]);

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const uploadFiles = ref<UploadFileItem[]>([]);

const acceptTypes = computed(() => {
  if (uploadType.value === 'video') return '.mp4,.webm,video/*';
  if (uploadType.value === 'cover') return '.jpg,.jpeg,.png,.webp,image/*';
  return '*';
});

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    addFiles(Array.from(input.files));
  }
  input.value = '';
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files) {
    addFiles(Array.from(e.dataTransfer.files));
  }
}

function addFiles(files: File[]) {
  const maxSize = 500 * 1024 * 1024; // 500MB
  for (const file of files) {
    if (file.size > maxSize) {
      alert(`文件「${file.name}」超过 500MB 限制`);
      continue;
    }
    uploadFiles.value.push({
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
    });
  }
  // 自动开始上传
  uploadPendingFiles();
}

async function uploadPendingFiles() {
  const pending = uploadFiles.value.filter(f => f.status === 'pending');
  for (const item of pending) {
    await uploadSingleFile(item);
  }
}

async function uploadSingleFile(item: UploadFileItem) {
  item.status = 'uploading';
  item.progress = 0;
  try {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('type', uploadType.value);
    if (selectedSeriesId.value) {
      formData.append('seriesId', selectedSeriesId.value);
    }
    if (episodeNumber.value) {
      formData.append('episode', String(episodeNumber.value));
    }

    // 模拟进度（XMLHttpRequest 方式更精确，这里用简单方式）
    item.progress = 30;
    const res = (await uploadFile(formData)) as any;
    item.progress = 100;
    const data = res.data ?? res;
    item.url = data.url || data.fileUrl || data.key || '';
    item.status = 'success';
  } catch (err: any) {
    item.status = 'error';
    item.errorMsg = err?.message || '上传失败';
  }
}

function removeFile(idx: number) {
  uploadFiles.value.splice(idx, 1);
}

function cancelUpload(idx: number) {
  uploadFiles.value.splice(idx, 1);
}

function retryUpload(idx: number) {
  const item = uploadFiles.value[idx];
  item.status = 'pending';
  item.progress = 0;
  item.errorMsg = undefined;
  uploadSingleFile(item);
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    alert('URL 已复制到剪贴板');
  }).catch(() => {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('URL 已复制到剪贴板');
  });
}

async function fetchSeries() {
  try {
    const res = (await getSeriesList({ pageSize: 200 })) as any;
    const data = res.data ?? res;
    seriesList.value = data.list ?? data.items ?? data.series ?? [];
  } catch { /* ignore */ }
}

onMounted(fetchSeries);
</script>
