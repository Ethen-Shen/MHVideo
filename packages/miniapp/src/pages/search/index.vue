<template>
  <view class="container" :style="{ backgroundColor: colors.bgPrimary }">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap" :style="{ backgroundColor: colors.bgSecondary }">
        <text class="search-icon">&#x1F50D;</text>
        <input
          v-model="keyword"
          class="search-input"
          :style="{ color: colors.textPrimary }"
          :placeholder="t('searchPlaceholder')"
          placeholder-class="search-placeholder-class"
          confirm-type="search"
          focus
          @confirm="handleSearch"
        />
        <text v-if="keyword" class="clear-btn" @tap="clearKeyword">&#x2715;</text>
      </view>
      <text class="cancel-btn" :style="{ color: colors.accent }" @tap="goBack">{{ t('cancel') }}</text>
    </view>

    <!-- 搜索结果区域 -->
    <template v-if="hasSearched">
      <!-- 筛选排序栏 -->
      <view class="filter-bar" :style="{ borderBottomColor: colors.border }">
        <scroll-view scroll-x class="filter-categories" :show-scrollbar="false">
          <view class="filter-cat-list">
            <view
              v-for="item in categoryList"
              :key="item.id"
              class="filter-cat-item"
              :style="{
                color: filterCategory === item.id ? colors.accent : colors.textSecondary,
                borderBottomColor: filterCategory === item.id ? colors.accent : 'transparent',
              }"
              @tap="switchFilterCategory(item.id)"
            >
              <text class="filter-cat-text">{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="sort-options">
          <view
            v-for="opt in sortOptions"
            :key="opt.value"
            class="sort-item"
            :style="{ color: sortBy === opt.value ? colors.accent : colors.textMuted }"
            @tap="switchSort(opt.value)"
          >
            <text class="sort-text">{{ opt.label }}</text>
          </view>
        </view>
      </view>

      <!-- 搜索结果列表 -->
      <view v-if="results.length" class="result-list">
        <view
          v-for="item in results"
          :key="item.id"
          class="result-item"
          :style="{ backgroundColor: colors.bgCard }"
          @tap="goToVideo(item.id)"
        >
          <image class="result-cover" :src="item.coverUrl" mode="aspectFill" />
          <view class="result-info">
            <text class="result-title" :style="{ color: colors.textPrimary }">{{ item.title }}</text>
            <view class="result-meta-row">
              <text v-if="item.seriesName" class="result-series" :style="{ color: colors.accent }">{{ item.seriesName }}</text>
              <text v-if="item.episode" class="result-episode" :style="{ color: colors.textMuted }">{{ t('episode') }} {{ item.episode }}</text>
            </view>
            <text class="result-views" :style="{ color: colors.textMuted }">{{ formatViews(item.views) }} {{ t('views') }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="load-status">
        <text v-if="loadingMore" class="load-text" :style="{ color: colors.textMuted }">{{ t('loading') }}</text>
        <text v-else-if="noMore && results.length" class="load-text" :style="{ color: colors.textMuted }">— {{ t('noData') }} —</text>
      </view>

      <!-- 空结果 -->
      <view v-if="!results.length && !loading" class="empty">
        <text class="empty-text" :style="{ color: colors.textMuted }">{{ t('noData') }}</text>
      </view>
    </template>

    <!-- 搜索前区域 -->
    <template v-else>
      <!-- 搜索历史 -->
      <view v-if="searchHistory.length" class="history-section">
        <view class="section-header">
          <text class="section-title" :style="{ color: colors.textPrimary }">{{ t('history') }}</text>
          <text class="clear-history" :style="{ color: colors.textMuted }" @tap="clearAllHistory">{{ t('delete') }}{{ t('history') }}</text>
        </view>
        <view class="tag-list">
          <view
            v-for="(item, index) in searchHistory"
            :key="index"
            class="tag-item"
            :style="{ backgroundColor: colors.bgSecondary, color: colors.textSecondary }"
            @tap="searchByHistory(item)"
            @longpress="deleteHistoryItem(index)"
          >
            <text class="tag-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="hot-section">
        <view class="section-header">
          <text class="section-title" :style="{ color: colors.textPrimary }">{{ t('popular') }}{{ t('search') }}</text>
        </view>
        <view class="tag-list">
          <view
            v-for="(item, index) in hotKeywords"
            :key="index"
            class="tag-item"
            :style="{ backgroundColor: colors.bgSecondary, color: colors.textSecondary }"
            @tap="searchByHot(item)"
          >
            <text class="tag-text">{{ item }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onReachBottom } from '@dcloudio/uni-app';
import { videoApi, categoryApi } from '../../api';
import { useThemeStore } from '../../stores/theme';
import { useI18nStore } from '../../stores/i18n';

const themeStore = useThemeStore();
const i18nStore = useI18nStore();
const colors = themeStore.colors;
const t = i18nStore.t;

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 20;

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

const keyword = ref('');
const hasSearched = ref(false);
const results = ref<VideoItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const noMore = ref(false);
const currentPage = ref(1);
const pageSize = 10;

const searchHistory = ref<string[]>([]);
const hotKeywords = ref(['热门短剧', '甜宠', '逆袭', '霸总', '穿越', '重生', '复仇', '虐恋', '古装', '都市']);

const categoryList = ref<Category[]>([]);
const filterCategory = ref('all');
const sortBy = ref('newest');

const sortOptions = computed(() => [
  { label: t('newest'), value: 'newest' },
  { label: t('popular'), value: 'popular' },
  { label: t('rating'), value: 'rating' },
]);

function formatViews(views: number): string {
  if (views >= 100000000) {
    return (views / 100000000).toFixed(1) + '亿';
  }
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万';
  }
  return String(views);
}

function goBack() {
  uni.navigateBack();
}

function goToVideo(id: string) {
  uni.navigateTo({ url: `/pages/video/index?id=${id}` });
}

function clearKeyword() {
  keyword.value = '';
  hasSearched.value = false;
  results.value = [];
}

// 搜索历史管理
function loadHistory() {
  try {
    const data = uni.getStorageSync(HISTORY_KEY);
    searchHistory.value = data ? JSON.parse(data) : [];
  } catch {
    searchHistory.value = [];
  }
}

function saveHistory(word: string) {
  const trimmed = word.trim();
  if (!trimmed) return;
  let list = searchHistory.value.filter((item) => item !== trimmed);
  list.unshift(trimmed);
  if (list.length > MAX_HISTORY) {
    list = list.slice(0, MAX_HISTORY);
  }
  searchHistory.value = list;
  uni.setStorageSync(HISTORY_KEY, JSON.stringify(list));
}

function deleteHistoryItem(index: number) {
  searchHistory.value.splice(index, 1);
  uni.setStorageSync(HISTORY_KEY, JSON.stringify(searchHistory.value));
}

function clearAllHistory() {
  searchHistory.value = [];
  uni.removeStorageSync(HISTORY_KEY);
}

// 搜索
async function doSearch(word: string, append = false) {
  const trimmed = word.trim();
  if (!trimmed) return;

  keyword.value = trimmed;
  hasSearched.value = true;

  if (!append) {
    saveHistory(trimmed);
    currentPage.value = 1;
    noMore.value = false;
    results.value = [];
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const params: Record<string, unknown> = {
      keyword: trimmed,
      page: currentPage.value,
      pageSize,
      sort: sortBy.value,
    };
    if (filterCategory.value !== 'all') {
      params.categoryId = filterCategory.value;
    }
    const res: any = await videoApi.search(params);
    const list = res?.data?.list ?? res?.list ?? [];
    if (append) {
      results.value = [...results.value, ...list];
    } else {
      results.value = list;
    }
    noMore.value = list.length < pageSize;
  } catch {
    if (!append) results.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function handleSearch() {
  doSearch(keyword.value);
}

function searchByHistory(word: string) {
  doSearch(word);
}

function searchByHot(word: string) {
  doSearch(word);
}

// 分类筛选
async function loadCategories() {
  try {
    const res: any = await categoryApi.getList();
    const list = res?.data ?? res ?? [];
    categoryList.value = [{ id: 'all', name: t('all') }, ...list];
  } catch {
    categoryList.value = [{ id: 'all', name: t('all') }];
  }
}

function switchFilterCategory(id: string) {
  filterCategory.value = id;
  if (hasSearched.value && keyword.value.trim()) {
    doSearch(keyword.value);
  }
}

function switchSort(value: string) {
  sortBy.value = value;
  if (hasSearched.value && keyword.value.trim()) {
    doSearch(keyword.value);
  }
}

// 上拉加载更多
function loadMore() {
  if (noMore.value || loadingMore.value || loading.value) return;
  currentPage.value++;
  doSearch(keyword.value, true);
}

onMounted(() => {
  loadHistory();
  loadCategories();
});

// 触底加载
onReachBottom(() => {
  loadMore();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding-bottom: 20rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  gap: 16rpx;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  border-radius: 36rpx;
  padding: 0 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
}

.search-placeholder-class {
  color: #999;
}

.clear-btn {
  font-size: 24rpx;
  padding: 8rpx;
  color: #999;
}

.cancel-btn {
  font-size: 28rpx;
  white-space: nowrap;
}

/* 筛选排序栏 */
.filter-bar {
  border-bottom-width: 1rpx;
  border-bottom-style: solid;
}

.filter-categories {
  white-space: nowrap;
}

.filter-cat-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 8rpx;
}

.filter-cat-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 20rpx;
  border-bottom-width: 4rpx;
  border-bottom-style: solid;
  flex-shrink: 0;
}

.filter-cat-text {
  font-size: 26rpx;
  white-space: nowrap;
}

.sort-options {
  display: flex;
  padding: 12rpx 24rpx;
  gap: 32rpx;
}

.sort-item {
  display: flex;
  align-items: center;
}

.sort-text {
  font-size: 24rpx;
}

/* 搜索结果列表 */
.result-list {
  padding: 16rpx 24rpx;
}

.result-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.result-cover {
  width: 240rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.result-title {
  font-size: 28rpx;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.result-meta-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.result-series {
  font-size: 24rpx;
}

.result-episode {
  font-size: 24rpx;
}

.result-views {
  font-size: 24rpx;
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

/* 空结果 */
.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
}

/* 搜索历史 & 热门搜索 */
.history-section,
.hot-section {
  padding: 0 24rpx;
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
}

.clear-history {
  font-size: 24rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.tag-text {
  font-size: 26rpx;
}
</style>
