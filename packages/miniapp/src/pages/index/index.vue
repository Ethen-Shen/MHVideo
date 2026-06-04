<template>
  <view class="container" :style="{ backgroundColor: colors.bgPrimary }">
    <!-- 顶部搜索入口 -->
    <view class="search-entry" :style="{ backgroundColor: colors.bgSecondary }" @tap="goSearch">
      <view class="search-icon-box">
        <text class="search-icon">&#x1F50D;</text>
      </view>
      <text class="search-placeholder" :style="{ color: colors.textMuted }">{{ t('searchPlaceholder') }}</text>
    </view>

    <!-- 分类导航 -->
    <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
      <view class="category-list">
        <view
          v-for="item in categoryList"
          :key="item.id"
          class="category-item"
          :style="{
            backgroundColor: activeCategory === item.id ? colors.accent : colors.bgSecondary,
            color: activeCategory === item.id ? '#ffffff' : colors.textSecondary,
          }"
          @tap="switchCategory(item.id)"
        >
          <text class="category-text">{{ item.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 推荐视频区域 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title" :style="{ color: colors.textPrimary }">{{ t('recommended') }}</text>
      </view>
      <view class="video-grid">
        <view
          v-for="item in recommendVideos"
          :key="item.id"
          class="video-card"
          :style="{ backgroundColor: colors.bgCard }"
          @tap="goToVideo(item.id)"
        >
          <view class="cover-wrap">
            <image class="video-cover" :src="item.coverUrl" mode="aspectFill" />
            <view v-if="item.seriesName" class="series-badge" :style="{ backgroundColor: colors.accent }">
              <text class="series-badge-text">{{ item.seriesName }}</text>
            </view>
          </view>
          <view class="video-info">
            <text class="video-title" :style="{ color: colors.textPrimary }">{{ item.title }}</text>
            <view class="video-meta-row">
              <text v-if="item.seriesName" class="video-series" :style="{ color: colors.accent }">{{ item.seriesName }}</text>
              <text v-if="item.episode" class="video-episode" :style="{ color: colors.textMuted }">{{ t('episode') }} {{ item.episode }}</text>
            </view>
            <text class="video-views" :style="{ color: colors.textMuted }">{{ formatViews(item.views) }} {{ t('views') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门系列区域 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title" :style="{ color: colors.textPrimary }">{{ t('popular') }}{{ t('series') }}</text>
      </view>
      <scroll-view scroll-x class="series-scroll" :show-scrollbar="false">
        <view class="series-list">
          <view
            v-for="item in hotSeries"
            :key="item.id"
            class="series-card"
            :style="{ backgroundColor: colors.bgCard }"
            @tap="goToSeries(item.id)"
          >
            <image class="series-cover" :src="item.coverUrl" mode="aspectFill" />
            <view class="series-info">
              <text class="series-title" :style="{ color: colors.textPrimary }">{{ item.title }}</text>
              <text class="series-meta" :style="{ color: colors.textMuted }">{{ item.videoCount || 0 }} {{ t('episode') }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 最新视频区域 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title" :style="{ color: colors.textPrimary }">{{ t('newest') }}</text>
      </view>
      <view class="video-grid">
        <view
          v-for="item in latestVideos"
          :key="item.id"
          class="video-card"
          :style="{ backgroundColor: colors.bgCard }"
          @tap="goToVideo(item.id)"
        >
          <view class="cover-wrap">
            <image class="video-cover" :src="item.coverUrl" mode="aspectFill" />
            <view v-if="item.seriesName" class="series-badge" :style="{ backgroundColor: colors.accent }">
              <text class="series-badge-text">{{ item.seriesName }}</text>
            </view>
          </view>
          <view class="video-info">
            <text class="video-title" :style="{ color: colors.textPrimary }">{{ item.title }}</text>
            <view class="video-meta-row">
              <text v-if="item.seriesName" class="video-series" :style="{ color: colors.accent }">{{ item.seriesName }}</text>
              <text v-if="item.episode" class="video-episode" :style="{ color: colors.textMuted }">{{ t('episode') }} {{ item.episode }}</text>
            </view>
            <text class="video-views" :style="{ color: colors.textMuted }">{{ formatViews(item.views) }} {{ t('views') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="load-status">
      <text v-if="loadingMore" class="load-text" :style="{ color: colors.textMuted }">{{ t('loading') }}</text>
      <text v-else-if="noMore" class="load-text" :style="{ color: colors.textMuted }">— {{ t('noData') }} —</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { videoApi, categoryApi, seriesApi } from '../../api';
import { useThemeStore } from '../../stores/theme';
import { useI18nStore } from '../../stores/i18n';

const themeStore = useThemeStore();
const i18nStore = useI18nStore();
const colors = themeStore.colors;
const t = i18nStore.t;

interface Category {
  id: string;
  name: string;
}

interface VideoItem {
  id: string;
  title: string;
  coverUrl: string;
  views: number;
  seriesName?: string;
  episode?: number;
}

interface SeriesItem {
  id: string;
  title: string;
  coverUrl: string;
  videoCount?: number;
}

const categoryList = ref<Category[]>([]);
const activeCategory = ref('all');
const recommendVideos = ref<VideoItem[]>([]);
const hotSeries = ref<SeriesItem[]>([]);
const latestVideos = ref<VideoItem[]>([]);
const latestPage = ref(1);
const latestPageSize = 10;
const loadingMore = ref(false);
const noMore = ref(false);

function formatViews(views: number): string {
  if (views >= 100000000) {
    return (views / 100000000).toFixed(1) + '亿';
  }
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万';
  }
  return String(views);
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' });
}

function goToVideo(id: string) {
  uni.navigateTo({ url: `/pages/video/index?id=${id}` });
}

function goToSeries(id: string) {
  uni.navigateTo({ url: `/pages/video/index?seriesId=${id}` });
}

async function loadCategories() {
  try {
    const res: any = await categoryApi.getList();
    const list = res?.data ?? res ?? [];
    categoryList.value = [{ id: 'all', name: t('all') }, ...list];
  } catch {
    categoryList.value = [{ id: 'all', name: t('all') }];
  }
}

async function loadRecommendVideos() {
  try {
    const params: Record<string, unknown> = { page: 1, pageSize: 6, sort: 'recommended' };
    if (activeCategory.value !== 'all') {
      params.categoryId = activeCategory.value;
    }
    const res: any = await videoApi.getVideos(params);
    recommendVideos.value = res?.data?.list ?? res?.list ?? [];
  } catch {
    recommendVideos.value = [];
  }
}

async function loadHotSeries() {
  try {
    const res: any = await seriesApi.getList({ page: 1, pageSize: 10, sort: 'popular' });
    hotSeries.value = res?.data?.list ?? res?.list ?? [];
  } catch {
    hotSeries.value = [];
  }
}

async function loadLatestVideos(append = false) {
  if (loadingMore.value) return;
  if (append && noMore.value) return;

  loadingMore.value = true;
  try {
    const params: Record<string, unknown> = { page: latestPage.value, pageSize: latestPageSize, sort: 'newest' };
    if (activeCategory.value !== 'all') {
      params.categoryId = activeCategory.value;
    }
    const res: any = await videoApi.getVideos(params);
    const list = res?.data?.list ?? res?.list ?? [];
    if (append) {
      latestVideos.value = [...latestVideos.value, ...list];
    } else {
      latestVideos.value = list;
    }
    noMore.value = list.length < latestPageSize;
  } catch {
    if (!append) latestVideos.value = [];
  } finally {
    loadingMore.value = false;
  }
}

async function switchCategory(id: string) {
  activeCategory.value = id;
  await Promise.all([loadRecommendVideos(), loadLatestVideos()]);
}

async function refreshAll() {
  latestPage.value = 1;
  noMore.value = false;
  await Promise.all([loadCategories(), loadRecommendVideos(), loadHotSeries(), loadLatestVideos()]);
}

onMounted(() => {
  refreshAll();
});

onPullDownRefresh(async () => {
  await refreshAll();
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  if (noMore.value || loadingMore.value) return;
  latestPage.value++;
  loadLatestVideos(true);
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding-bottom: 20rpx;
}

/* 搜索入口 */
.search-entry {
  display: flex;
  align-items: center;
  margin: 20rpx 24rpx 0;
  height: 72rpx;
  border-radius: 36rpx;
  padding: 0 24rpx;
}

.search-icon-box {
  margin-right: 12rpx;
}

.search-icon {
  font-size: 28rpx;
}

.search-placeholder {
  font-size: 28rpx;
}

/* 分类导航 */
.category-scroll {
  white-space: nowrap;
  margin: 20rpx 0;
}

.category-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  flex-shrink: 0;
}

.category-text {
  font-size: 26rpx;
  white-space: nowrap;
}

/* 区域 */
.section {
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
}

/* 视频网格 */
.video-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16rpx;
  gap: 16rpx;
}

.video-card {
  width: calc(50% - 8rpx);
  border-radius: 16rpx;
  overflow: hidden;
}

.cover-wrap {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16rpx 16rpx 0 0;
}

.series-badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.series-badge-text {
  font-size: 20rpx;
  color: #ffffff;
}

.video-info {
  padding: 12rpx 16rpx 16rpx;
}

.video-title {
  font-size: 26rpx;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 72rpx;
}

.video-meta-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.video-series {
  font-size: 22rpx;
}

.video-episode {
  font-size: 22rpx;
}

.video-views {
  font-size: 22rpx;
  margin-top: 4rpx;
}

/* 热门系列 */
.series-scroll {
  white-space: nowrap;
}

.series-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 20rpx;
}

.series-card {
  display: inline-flex;
  flex-direction: column;
  width: 260rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.series-cover {
  width: 260rpx;
  height: 160rpx;
}

.series-info {
  padding: 12rpx 16rpx 16rpx;
}

.series-title {
  font-size: 26rpx;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.series-meta {
  font-size: 22rpx;
  margin-top: 6rpx;
}

/* 加载状态 */
.load-status {
  display: flex;
  justify-content: center;
  padding: 30rpx 0;
}

.load-text {
  font-size: 24rpx;
}
</style>
