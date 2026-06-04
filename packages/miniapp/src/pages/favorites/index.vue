<template>
  <view class="container" :style="{ backgroundColor: colors.bgSecondary }">
    <!-- 收藏夹标签页 -->
    <scroll-view scroll-x class="folder-tabs" :style="{ backgroundColor: colors.bgCard, borderBottomColor: colors.border }">
      <view class="tabs-inner">
        <view
          class="tab-item"
          :class="{ active: currentFolder === '' }"
          :style="{ color: currentFolder === '' ? colors.accent : colors.textSecondary, borderBottomColor: currentFolder === '' ? colors.accent : 'transparent' }"
          @tap="switchFolder('')"
        >
          {{ t('all') }}
        </view>
        <view
          v-for="folder in folders"
          :key="folder.id"
          class="tab-item"
          :class="{ active: currentFolder === folder.id }"
          :style="{ color: currentFolder === folder.id ? colors.accent : colors.textSecondary, borderBottomColor: currentFolder === folder.id ? colors.accent : 'transparent' }"
          @tap="switchFolder(folder.id)"
        >
          {{ folder.name }}
        </view>
        <view class="tab-item add-folder" :style="{ color: colors.accent }" @tap="handleCreateFolder">+</view>
      </view>
    </scroll-view>

    <!-- 收藏视频列表 -->
    <scroll-view
      scroll-y
      class="scroll-list"
      @scrolltolower="loadMore"
    >
      <view class="video-grid">
        <view
          v-for="item in list"
          :key="item.id"
          class="video-card"
          :style="{ backgroundColor: colors.bgCard }"
          @tap="goToVideo(item)"
        >
          <image class="card-cover" :src="item.cover" mode="aspectFill" />
          <view class="card-footer">
            <text class="card-title" :style="{ color: colors.textPrimary }">{{ item.title }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="status-text" :style="{ color: colors.textMuted }">{{ t('loading') }}</view>
      <view v-else-if="noMore && list.length > 0" class="status-text" :style="{ color: colors.textMuted }">— {{ t('noData') }} —</view>

      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty-state">
        <text class="empty-icon">⭐</text>
        <text class="empty-text" :style="{ color: colors.textMuted }">{{ t('noData') }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useThemeStore, useI18nStore } from '@/stores';
import { interactionApi } from '@/api';

const themeStore = useThemeStore();
const i18nStore = useI18nStore();

const colors = computed(() => themeStore.colors);
const t = (key: string) => i18nStore.t(key);

interface Folder {
  id: string;
  name: string;
}

interface FavoriteItem {
  id: string;
  videoId: string;
  title: string;
  cover: string;
}

const folders = ref<Folder[]>([]);
const currentFolder = ref('');
const list = ref<FavoriteItem[]>([]);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const noMore = ref(false);

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const query = (currentPage as any)?.options || {};
  if (query.tab === 'likes') {
    currentFolder.value = '__likes__';
  }
  fetchFolders();
  fetchFavorites();
});

async function fetchFolders() {
  try {
    const result = await interactionApi.getFavoriteFolders() as any;
    folders.value = (result.list || result.data?.list || result || []).map((item: any) => ({
      id: item.id || item._id,
      name: item.name || '',
    }));
  } catch {
    folders.value = [];
  }
}

async function fetchFavorites() {
  if (loading.value || noMore.value) return;
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: page.value, pageSize };
    if (currentFolder.value === '__likes__') {
      const result = await interactionApi.getLikes(params) as any;
      const items = result.list || result.data?.list || [];
      const mapped = items.map((item: any) => ({
        id: item.id || item._id,
        videoId: item.videoId || item.video_id || item.id,
        title: item.title || item.video?.title || '',
        cover: item.cover || item.video?.cover || '',
      }));
      if (page.value === 1) {
        list.value = mapped;
      } else {
        list.value.push(...mapped);
      }
      noMore.value = mapped.length < pageSize;
    } else {
      if (currentFolder.value) {
        params.folderId = currentFolder.value;
      }
      const result = await interactionApi.getFavorites(params) as any;
      const items = result.list || result.data?.list || [];
      const mapped = items.map((item: any) => ({
        id: item.id || item._id,
        videoId: item.videoId || item.video_id || item.id,
        title: item.title || item.video?.title || '',
        cover: item.cover || item.video?.cover || '',
      }));
      if (page.value === 1) {
        list.value = mapped;
      } else {
        list.value.push(...mapped);
      }
      noMore.value = mapped.length < pageSize;
    }
  } catch {
    if (page.value === 1) {
      list.value = [];
    }
  } finally {
    loading.value = false;
  }
}

function switchFolder(folderId: string) {
  if (currentFolder.value === folderId) return;
  currentFolder.value = folderId;
  page.value = 1;
  noMore.value = false;
  list.value = [];
  fetchFavorites();
}

function loadMore() {
  if (!noMore.value && !loading.value) {
    page.value++;
    fetchFavorites();
  }
}

function goToVideo(item: FavoriteItem) {
  uni.navigateTo({ url: `/pages/video/index?id=${item.videoId}` });
}

function handleCreateFolder() {
  uni.showModal({
    title: t('favorite'),
    editable: true,
    placeholderText: t('title'),
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          await interactionApi.createFavoriteFolder(res.content);
          uni.showToast({ title: t('success'), icon: 'success' });
          fetchFolders();
        } catch {
          uni.showToast({ title: t('error'), icon: 'none' });
        }
      }
    },
  });
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 收藏夹标签 */
.folder-tabs {
  border-bottom: 1rpx solid #f0f0f0;
  white-space: nowrap;
}

.tabs-inner {
  display: flex;
  padding: 0 20rpx;
}

.tab-item {
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  border-bottom: 4rpx solid transparent;
  flex-shrink: 0;
}

.tab-item.active {
  font-weight: bold;
}

.add-folder {
  font-size: 36rpx;
  font-weight: bold;
}

/* 视频列表 */
.scroll-list {
  flex: 1;
  height: 0;
}

.video-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
}

.video-card {
  width: calc(50% - 20rpx);
  margin: 10rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.card-cover {
  width: 100%;
  height: 280rpx;
}

.card-footer {
  padding: 16rpx;
}

.card-title {
  font-size: 26rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.status-text {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
}
</style>
