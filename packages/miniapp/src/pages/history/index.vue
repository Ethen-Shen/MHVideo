<template>
  <view class="container" :style="{ backgroundColor: colors.bgSecondary }">
    <!-- 顶部操作栏 -->
    <view class="top-bar" :style="{ backgroundColor: colors.bgCard, borderBottomColor: colors.border }">
      <text class="top-bar-title" :style="{ color: colors.textPrimary }">{{ t('watchHistory') }}</text>
      <text v-if="list.length > 0" class="clear-btn" :style="{ color: colors.danger }" @tap="handleClearAll">{{ t('delete') }} {{ t('all') }}</text>
    </view>

    <!-- 历史列表 -->
    <scroll-view
      scroll-y
      class="scroll-list"
      @scrolltolower="loadMore"
    >
      <view
        v-for="item in list"
        :key="item.id"
        class="history-card"
        :style="{ backgroundColor: colors.bgCard }"
        @tap="goToVideo(item)"
      >
        <image class="card-cover" :src="item.cover" mode="aspectFill" />
        <view class="card-info">
          <text class="card-title" :style="{ color: colors.textPrimary }">{{ item.title }}</text>
          <view class="progress-wrap">
            <view class="progress-bar" :style="{ backgroundColor: colors.border }">
              <view class="progress-fill" :style="{ width: (item.progress || 0) + '%', backgroundColor: colors.accent }" />
            </view>
            <text class="progress-text" :style="{ color: colors.textMuted }">{{ Math.round(item.progress || 0) }}%</text>
          </view>
          <text class="card-time" :style="{ color: colors.textMuted }">{{ item.watchedAt }}</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="status-text" :style="{ color: colors.textMuted }">{{ t('loading') }}</view>
      <view v-else-if="noMore && list.length > 0" class="status-text" :style="{ color: colors.textMuted }">— {{ t('noData') }} —</view>

      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty-state">
        <text class="empty-icon">📺</text>
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

interface HistoryItem {
  id: string;
  videoId: string;
  title: string;
  cover: string;
  progress: number;
  watchedAt: string;
}

const list = ref<HistoryItem[]>([]);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const noMore = ref(false);

onMounted(() => {
  fetchHistory();
});

async function fetchHistory() {
  if (loading.value || noMore.value) return;
  loading.value = true;
  try {
    const result = await interactionApi.getHistory({ page: page.value, pageSize }) as any;
    const items = result.list || result.data?.list || [];
    const mapped = items.map((item: any) => ({
      id: item.id || item._id,
      videoId: item.videoId || item.video_id || item.id,
      title: item.title || item.video?.title || '',
      cover: item.cover || item.video?.cover || '',
      progress: item.progress || 0,
      watchedAt: item.watchedAt || item.watched_at || item.createdAt || '',
    }));
    if (page.value === 1) {
      list.value = mapped;
    } else {
      list.value.push(...mapped);
    }
    noMore.value = mapped.length < pageSize;
  } catch {
    if (page.value === 1) {
      list.value = [];
    }
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!noMore.value && !loading.value) {
    page.value++;
    fetchHistory();
  }
}

function goToVideo(item: HistoryItem) {
  uni.navigateTo({ url: `/pages/video/index?id=${item.videoId}` });
}

function handleClearAll() {
  uni.showModal({
    title: t('confirm'),
    content: t('delete') + ' ' + t('all') + '?',
    success: async (res) => {
      if (res.confirm) {
        try {
          await interactionApi.clearHistory();
          list.value = [];
          noMore.value = true;
          uni.showToast({ title: t('success'), icon: 'success' });
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

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.top-bar-title {
  font-size: 30rpx;
  font-weight: bold;
}

.clear-btn {
  font-size: 26rpx;
}

.scroll-list {
  flex: 1;
  height: 0;
}

.history-card {
  display: flex;
  padding: 24rpx 30rpx;
  margin: 10rpx 20rpx;
  border-radius: 12rpx;
}

.card-cover {
  width: 240rpx;
  height: 160rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-wrap {
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  margin-left: 12rpx;
  width: 80rpx;
  text-align: right;
}

.card-time {
  font-size: 22rpx;
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
