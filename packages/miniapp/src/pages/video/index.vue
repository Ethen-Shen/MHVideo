<template>
  <view class="container" :style="{ backgroundColor: colors.bgPrimary }">
    <!-- 视频播放区域 -->
    <view class="video-player">
      <video
        :id="videoPlayerId"
        :src="video?.videoUrl"
        :poster="video?.coverUrl"
        class="player"
        :show-fullscreen-btn="true"
        :show-play-btn="true"
        :show-center-play-btn="true"
        :enable-progress-gesture="true"
        :initial-time="initialTime"
        object-fit="contain"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @timeupdate="onTimeUpdate"
        @fullscreenchange="onFullscreenChange"
      />
    </view>

    <view v-if="video" class="content-area">
      <!-- 视频信息区域 -->
      <view class="video-detail" :style="{ backgroundColor: colors.bgPrimary }">
        <text class="video-title" :style="{ color: colors.textPrimary }">{{ video.title }}</text>
        <view class="video-meta">
          <text :style="{ color: colors.textMuted }">{{ video.views }} {{ t('views') }}</text>
          <text class="meta-divider" :style="{ color: colors.border }">|</text>
          <text :style="{ color: colors.textMuted }">{{ video.likes }} {{ t('likes') }}</text>
          <text class="meta-divider" :style="{ color: colors.border }">|</text>
          <text :style="{ color: colors.textMuted }">{{ averageRating }} {{ t('rating') }}</text>
        </view>
        <view v-if="video.seriesName" class="series-link" @tap="goToSeries">
          <text :style="{ color: colors.accent }">{{ video.seriesName }}</text>
          <text class="arrow" :style="{ color: colors.accent }">›</text>
        </view>
        <view class="desc-area">
          <text
            class="video-desc"
            :style="{ color: colors.textSecondary, '-webkit-line-clamp': descExpanded ? 'unset' : '2' }"
          >{{ video.description }}</text>
          <text
            v-if="video.description && video.description.length > 60"
            class="desc-toggle"
            :style="{ color: colors.accent }"
            @tap="descExpanded = !descExpanded"
          >{{ descExpanded ? t('collapse') : t('expand') }}</text>
        </view>
      </view>

      <!-- 互动按钮区域 -->
      <view class="action-bar" :style="{ borderColor: colors.border }">
        <view class="action-item" @tap="handleLike">
          <text class="action-icon" :style="{ color: isLiked ? colors.accent : colors.textSecondary }">
            {{ isLiked ? '❤️' : '🤍' }}
          </text>
          <text class="action-text" :style="{ color: isLiked ? colors.accent : colors.textSecondary }">
            {{ isLiked ? t('liked') : t('like') }}
          </text>
        </view>
        <view class="action-item" @tap="handleFavorite">
          <text class="action-icon" :style="{ color: isFavorited ? colors.accent : colors.textSecondary }">
            {{ isFavorited ? '⭐' : '☆' }}
          </text>
          <text class="action-text" :style="{ color: isFavorited ? colors.accent : colors.textSecondary }">
            {{ isFavorited ? t('favorited') : t('favorite') }}
          </text>
        </view>
        <view class="action-item" @tap="showRatingPopup = true">
          <text class="action-icon" :style="{ color: userRating > 0 ? colors.accent : colors.textSecondary }">
            ★
          </text>
          <text class="action-text" :style="{ color: userRating > 0 ? colors.accent : colors.textSecondary }">
            {{ t('rate') }}
          </text>
        </view>
        <view class="action-item" @tap="handleShare">
          <text class="action-icon" :style="{ color: colors.textSecondary }">↗</text>
          <text class="action-text" :style="{ color: colors.textSecondary }">{{ t('share') }}</text>
        </view>
      </view>

      <!-- 剧集列表区域 -->
      <view v-if="episodes.length > 0" class="episodes-section" :style="{ borderColor: colors.border }">
        <text class="section-title" :style="{ color: colors.textPrimary }">{{ t('episodes') }}</text>
        <scroll-view scroll-x class="episodes-scroll">
          <view class="episodes-list">
            <view
              v-for="ep in episodes"
              :key="ep.id"
              class="episode-item"
              :style="{
                backgroundColor: ep.id === videoId ? colors.accent : colors.bgSecondary,
                borderColor: ep.id === videoId ? colors.accent : colors.border,
              }"
              @tap="switchEpisode(ep)"
            >
              <text
                :style="{ color: ep.id === videoId ? '#fff' : colors.textSecondary }"
              >{{ ep.episodeNumber }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 评论区 -->
      <view class="comment-section">
        <text class="section-title" :style="{ color: colors.textPrimary }">
          {{ t('comments') }} ({{ commentTotal }})
        </text>

        <view v-if="comments.length === 0" class="empty-comments">
          <text :style="{ color: colors.textMuted }">{{ t('noComments') }}</text>
        </view>

        <view v-for="comment in comments" :key="comment.id" class="comment-item" :style="{ borderColor: colors.border }">
          <image :src="comment.userAvatar || '/static/default-avatar.png'" class="comment-avatar" />
          <view class="comment-body">
            <view class="comment-header">
              <text class="comment-nickname" :style="{ color: colors.textPrimary }">{{ comment.nickname }}</text>
              <text class="comment-time" :style="{ color: colors.textMuted }">{{ formatTime(comment.createdAt) }}</text>
            </view>
            <text class="comment-content" :style="{ color: colors.textSecondary }">{{ comment.content }}</text>
            <view class="comment-actions">
              <text
                class="comment-reply-btn"
                :style="{ color: colors.textMuted }"
                @tap="openReply(comment)"
              >{{ t('reply') }}</text>
              <text
                v-if="comment.userId === userStore.userInfo.id"
                class="comment-delete-btn"
                :style="{ color: colors.danger }"
                @tap="deleteComment(comment.id)"
              >{{ t('delete') }}</text>
            </view>
            <!-- 回复列表 -->
            <view v-if="comment.replies && comment.replies.length > 0" class="replies-area">
              <view
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
                :style="{ borderColor: colors.border }"
              >
                <image :src="reply.userAvatar || '/static/default-avatar.png'" class="reply-avatar" />
                <view class="reply-body">
                  <text class="reply-nickname" :style="{ color: colors.textPrimary }">{{ reply.nickname }}</text>
                  <text class="reply-content" :style="{ color: colors.textSecondary }">{{ reply.content }}</text>
                  <text class="reply-time" :style="{ color: colors.textMuted }">{{ formatTime(reply.createdAt) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="comments.length > 0 && comments.length < commentTotal" class="load-more" @tap="loadMoreComments">
          <text :style="{ color: colors.accent }">{{ t('loadMore') }}</text>
        </view>
      </view>
    </view>

    <!-- 底部评论输入框 -->
    <view class="comment-input-bar" :style="{ backgroundColor: colors.bgCard, borderColor: colors.border }">
      <input
        v-model="commentText"
        class="comment-input"
        :placeholder="replyTarget ? t('replyTo') + replyTarget.nickname : t('writeComment')"
        :placeholder-style="'color:' + colors.textMuted"
        :style="{ color: colors.textPrimary, backgroundColor: colors.bgSecondary }"
        :focus="commentFocus"
        @confirm="sendComment"
        @blur="onCommentBlur"
      />
      <view class="send-btn" :style="{ backgroundColor: colors.accent }" @tap="sendComment">
        <text style="color: #fff; font-size: 26rpx;">{{ t('send') }}</text>
      </view>
    </view>

    <!-- 评分弹窗 -->
    <view v-if="showRatingPopup" class="popup-mask" @tap="showRatingPopup = false">
      <view class="rating-popup" :style="{ backgroundColor: colors.bgCard }" @tap.stop>
        <text class="popup-title" :style="{ color: colors.textPrimary }">{{ t('rateVideo') }}</text>
        <view class="stars-row">
          <view
            v-for="star in 5"
            :key="star"
            class="star-item"
            @tap="setRating(star)"
            @touchmove.prevent="onStarTouchMove($event, star)"
          >
            <text
              class="star-icon"
              :style="{ color: star <= ratingInput ? colors.accent : colors.textMuted }"
            >★</text>
          </view>
        </view>
        <text class="rating-label" :style="{ color: colors.textSecondary }">
          {{ ratingInput }} {{ t('stars') }}
        </text>
        <view class="popup-actions">
          <view class="popup-btn cancel" :style="{ color: colors.textSecondary }" @tap="showRatingPopup = false">
            <text>{{ t('cancel') }}</text>
          </view>
          <view class="popup-btn confirm" :style="{ backgroundColor: colors.accent }" @tap="submitRating">
            <text style="color: #fff;">{{ t('confirm') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 收藏夹选择弹窗 -->
    <view v-if="showFolderPopup" class="popup-mask" @tap="showFolderPopup = false">
      <view class="folder-popup" :style="{ backgroundColor: colors.bgCard }" @tap.stop>
        <text class="popup-title" :style="{ color: colors.textPrimary }">{{ t('selectFolder') }}</text>
        <view v-for="folder in favoriteFolders" :key="folder.id" class="folder-item" :style="{ borderColor: colors.border }" @tap="confirmFavorite(folder.id)">
          <text :style="{ color: colors.textPrimary }">{{ folder.name }}</text>
        </view>
        <view class="folder-item" :style="{ borderColor: colors.border }" @tap="createAndFavorite">
          <text :style="{ color: colors.accent }">+ {{ t('newFolder') }}</text>
        </view>
        <view class="popup-btn cancel" :style="{ color: colors.textSecondary }" @tap="showFolderPopup = false">
          <text>{{ t('cancel') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { videoApi, commentApi, interactionApi, seriesApi } from '../../api';
import { useThemeStore } from '../../stores/theme';
import { useUserStore } from '../../stores/user';
import { useI18nStore } from '../../stores/i18n';

const themeStore = useThemeStore();
const userStore = useUserStore();
const i18nStore = useI18nStore();

const colors = computed(() => themeStore.colors);
const t = (key: string) => i18nStore.t(key);

// 页面参数
const videoId = ref('');
const videoPlayerId = 'videoPlayer';

// 视频数据
const video = ref<{
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  videoUrl: string;
  views: number;
  likes: number;
  seriesId: string;
  seriesName: string;
  episodeNumber: number;
} | null>(null);

// 播放进度
const initialTime = ref(0);
const currentProgress = ref(0);
const videoDuration = ref(0);
let progressTimer: ReturnType<typeof setInterval> | null = null;

// 互动状态
const isLiked = ref(false);
const isFavorited = ref(false);
const userRating = ref(0);
const averageRating = ref('0.0');

// 描述展开
const descExpanded = ref(false);

// 剧集列表
const episodes = ref<{ id: string; episodeNumber: number; title: string }[]>([]);

// 评论
const comments = ref<any[]>([]);
const commentTotal = ref(0);
const commentPage = ref(1);
const commentText = ref('');
const commentFocus = ref(false);
const replyTarget = ref<{ id: string; nickname: string } | null>(null);

// 弹窗
const showRatingPopup = ref(false);
const ratingInput = ref(0);
const showFolderPopup = ref(false);
const favoriteFolders = ref<{ id: string; name: string }[]>([]);

// 视频上下文
let videoContext: UniApp.VideoContext | null = null;

onLoad((query) => {
  videoId.value = query?.id ?? '';
});

onMounted(async () => {
  if (!videoId.value) return;
  videoContext = uni.createVideoContext(videoPlayerId);
  await fetchVideoDetail();
  await fetchRating();
  await fetchComments();
  startProgressTimer();
});

onUnmounted(() => {
  stopProgressTimer();
  recordCurrentProgress(false);
});

// 获取视频详情
async function fetchVideoDetail() {
  try {
    const res: any = await videoApi.getVideo(videoId.value);
    video.value = res.data ?? res;
    if (video.value?.seriesId) {
      fetchEpisodes(video.value.seriesId);
    }
    // 检查观看历史，续播
    if (userStore.isLoggedIn) {
      await checkWatchHistory();
    }
  } catch (e) {
    uni.showToast({ title: t('loadFailed'), icon: 'none' });
  }
}

// 检查观看历史（续播）
async function checkWatchHistory() {
  try {
    const res: any = await interactionApi.getHistory({ videoId: videoId.value });
    const historyList = res.data?.list ?? res.data ?? res;
    if (Array.isArray(historyList) && historyList.length > 0) {
      const record = historyList[0];
      if (record.progress && record.progress > 0 && !record.completed) {
        initialTime.value = Math.floor(record.progress);
        currentProgress.value = record.progress;
        uni.showToast({ title: t('resuming'), icon: 'none' });
      }
    }
  } catch {
    // 静默失败
  }
}

// 获取剧集列表
async function fetchEpisodes(seriesId: string) {
  try {
    const res: any = await seriesApi.getDetail(seriesId);
    const detail = res.data ?? res;
    episodes.value = (detail.videos ?? detail.episodes ?? []).map((v: any) => ({
      id: v.id,
      episodeNumber: v.episodeNumber ?? v.episode ?? 0,
      title: v.title,
    }));
  } catch {
    // 静默失败
  }
}

// 获取评分
async function fetchRating() {
  try {
    const res: any = await interactionApi.getRating(videoId.value);
    const data = res.data ?? res;
    averageRating.value = (data.average ?? data.avg ?? 0).toFixed(1);
    userRating.value = data.userRating ?? data.user_rating ?? 0;
  } catch {
    // 静默失败
  }
}

// 获取评论
async function fetchComments(page = 1) {
  try {
    const res: any = await commentApi.getList(videoId.value, { page, pageSize: 10 });
    const data = res.data ?? res;
    const list = data.list ?? data.comments ?? [];
    if (page === 1) {
      comments.value = list;
    } else {
      comments.value = [...comments.value, ...list];
    }
    commentTotal.value = data.total ?? list.length;
    commentPage.value = page;
  } catch {
    // 静默失败
  }
}

// 加载更多评论
function loadMoreComments() {
  fetchComments(commentPage.value + 1);
}

// 视频播放事件
function onPlay() {
  startProgressTimer();
}

function onPause() {
  stopProgressTimer();
  recordCurrentProgress(false);
}

function onEnded() {
  stopProgressTimer();
  recordCurrentProgress(true);
}

function onTimeUpdate(e: any) {
  currentProgress.value = e.detail.currentTime;
  videoDuration.value = e.detail.duration;
}

function onFullscreenChange(e: any) {
  // 全屏切换回调
}

// 进度记录
function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(() => {
    recordCurrentProgress(false);
  }, 10000);
}

function stopProgressTimer() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

async function recordCurrentProgress(completed: boolean) {
  if (!userStore.isLoggedIn || !videoId.value) return;
  try {
    await interactionApi.recordProgress(videoId.value, currentProgress.value, completed);
  } catch {
    // 静默失败
  }
}

// 互动：点赞
async function handleLike() {
  if (!checkLogin()) return;
  try {
    const res: any = await interactionApi.toggleLike(videoId.value);
    const data = res.data ?? res;
    isLiked.value = data.liked ?? !isLiked.value;
    if (video.value) {
      video.value.likes = Math.max(0, video.value.likes + (isLiked.value ? 1 : -1));
    }
  } catch {
    uni.showToast({ title: t('operationFailed'), icon: 'none' });
  }
}

// 互动：收藏
async function handleFavorite() {
  if (!checkLogin()) return;
  if (!isFavorited.value) {
    // 先获取收藏夹列表
    try {
      const res: any = await interactionApi.getFavoriteFolders();
      const data = res.data ?? res;
      favoriteFolders.value = Array.isArray(data) ? data : (data.list ?? []);
      if (favoriteFolders.value.length > 0) {
        showFolderPopup.value = true;
      } else {
        // 没有收藏夹，直接收藏
        await confirmFavorite(undefined);
      }
    } catch {
      await confirmFavorite(undefined);
    }
  } else {
    // 取消收藏
    try {
      const res: any = await interactionApi.toggleFavorite(videoId.value);
      const data = res.data ?? res;
      isFavorited.value = data.favorited ?? !isFavorited.value;
    } catch {
      uni.showToast({ title: t('operationFailed'), icon: 'none' });
    }
  }
}

async function confirmFavorite(folderId?: string) {
  try {
    const res: any = await interactionApi.toggleFavorite(videoId.value, folderId);
    const data = res.data ?? res;
    isFavorited.value = data.favorited ?? true;
    showFolderPopup.value = false;
    uni.showToast({ title: t('favoriteSuccess'), icon: 'none' });
  } catch {
    uni.showToast({ title: t('operationFailed'), icon: 'none' });
  }
}

async function createAndFavorite() {
  uni.showModal({
    title: t('newFolder'),
    editable: true,
    placeholderText: t('folderName'),
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          const folderRes: any = await interactionApi.createFavoriteFolder(res.content);
          const folderData = folderRes.data ?? folderRes;
          await confirmFavorite(folderData.id);
        } catch {
          uni.showToast({ title: t('operationFailed'), icon: 'none' });
        }
      }
    },
  });
}

// 互动：评分
function setRating(star: number) {
  ratingInput.value = star;
}

function onStarTouchMove(e: any, star: number) {
  // 简化处理：触摸移动时不做半星处理
}

async function submitRating() {
  if (ratingInput.value === 0) {
    uni.showToast({ title: t('selectRating'), icon: 'none' });
    return;
  }
  try {
    await interactionApi.rate(videoId.value, ratingInput.value);
    userRating.value = ratingInput.value;
    showRatingPopup.value = false;
    await fetchRating();
    uni.showToast({ title: t('rateSuccess'), icon: 'none' });
  } catch {
    uni.showToast({ title: t('operationFailed'), icon: 'none' });
  }
}

// 互动：分享
function handleShare() {
  // #ifdef MP-WEIXIN
  // 微信小程序使用原生分享
  // #endif
  uni.showActionSheet({
    itemList: [t('copyLink'), t('shareToFriend')],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.setClipboardData({
          data: `/pages/video/index?id=${videoId.value}`,
          success: () => {
            uni.showToast({ title: t('copied'), icon: 'none' });
          },
        });
      }
    },
  });
}

// 切换剧集
function switchEpisode(ep: { id: string; episodeNumber: number }) {
  if (ep.id === videoId.value) return;
  // 记录当前进度
  recordCurrentProgress(false);
  stopProgressTimer();
  // 跳转新剧集
  videoId.value = ep.id;
  isLiked.value = false;
  isFavorited.value = false;
  userRating.value = 0;
  averageRating.value = '0.0';
  comments.value = [];
  commentTotal.value = 0;
  commentPage.value = 1;
  descExpanded.value = false;
  fetchVideoDetail();
  fetchRating();
  fetchComments();
}

// 跳转系列
function goToSeries() {
  if (video.value?.seriesId) {
    uni.navigateTo({ url: `/pages/series/index?id=${video.value.seriesId}` });
  }
}

// 评论相关
function openReply(comment: any) {
  replyTarget.value = { id: comment.id, nickname: comment.nickname || comment.username };
  commentFocus.value = true;
}

function onCommentBlur() {
  // 延迟清空回复目标，避免影响发送
  setTimeout(() => {
    if (!commentText.value) {
      replyTarget.value = null;
    }
  }, 200);
}

async function sendComment() {
  const content = commentText.value.trim();
  if (!content) {
    uni.showToast({ title: t('emptyComment'), icon: 'none' });
    return;
  }
  if (!checkLogin()) return;

  try {
    await commentApi.create({
      videoId: videoId.value,
      content,
      parentId: replyTarget.value?.id,
    });
    commentText.value = '';
    replyTarget.value = null;
    commentFocus.value = false;
    uni.showToast({ title: t('commentSuccess'), icon: 'none' });
    // 刷新评论列表
    fetchComments(1);
  } catch {
    uni.showToast({ title: t('operationFailed'), icon: 'none' });
  }
}

async function deleteComment(id: string) {
  uni.showModal({
    title: t('confirmDelete'),
    success: async (res) => {
      if (res.confirm) {
        try {
          await commentApi.delete(id);
          uni.showToast({ title: t('deleteSuccess'), icon: 'none' });
          fetchComments(1);
        } catch {
          uni.showToast({ title: t('operationFailed'), icon: 'none' });
        }
      }
    },
  });
}

// 登录检查
function checkLogin(): boolean {
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: t('loginRequired'),
      content: t('loginRequiredDesc'),
      confirmText: t('goLogin'),
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/login/index' });
        }
      },
    });
    return false;
  }
  return true;
}

// 格式化时间
function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return `${minutes}${t('minutesAgo')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('hoursAgo')}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}${t('daysAgo')}`;
  return `${date.getMonth() + 1}-${date.getDate()}`;
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.video-player {
  width: 100%;
  position: relative;
}

.player {
  width: 100%;
  height: 420rpx;
}

.content-area {
  position: relative;
}

/* 视频信息区域 */
.video-detail {
  padding: 24rpx;
}

.video-title {
  font-size: 34rpx;
  font-weight: bold;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  font-size: 24rpx;
}

.meta-divider {
  font-size: 20rpx;
}

.series-link {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 16rpx;
  font-size: 26rpx;
}

.arrow {
  font-size: 32rpx;
  font-weight: bold;
}

.desc-area {
  margin-top: 16rpx;
}

.video-desc {
  font-size: 28rpx;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc-toggle {
  font-size: 26rpx;
  margin-top: 8rpx;
}

/* 互动按钮区域 */
.action-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 16rpx;
  border-top: 1rpx solid;
  border-bottom: 1rpx solid;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.action-icon {
  font-size: 44rpx;
  line-height: 1;
}

.action-text {
  font-size: 22rpx;
}

/* 剧集列表 */
.episodes-section {
  padding: 24rpx;
  border-bottom: 1rpx solid;
}

.episodes-scroll {
  white-space: nowrap;
  margin-top: 16rpx;
}

.episodes-list {
  display: flex;
  gap: 16rpx;
}

.episode-item {
  min-width: 80rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 26rpx;
  border: 1rpx solid;
  padding: 0 20rpx;
}

/* 评论区 */
.comment-section {
  padding: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.empty-comments {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
}

.comment-item {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-nickname {
  font-size: 26rpx;
  font-weight: 500;
}

.comment-time {
  font-size: 22rpx;
}

.comment-content {
  font-size: 28rpx;
  margin-top: 8rpx;
  line-height: 1.5;
  word-break: break-all;
}

.comment-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
}

.comment-reply-btn,
.comment-delete-btn {
  font-size: 22rpx;
}

/* 回复 */
.replies-area {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 12rpx;
}

.reply-item {
  display: flex;
  gap: 12rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-avatar {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.reply-body {
  flex: 1;
  min-width: 0;
}

.reply-nickname {
  font-size: 24rpx;
  font-weight: 500;
}

.reply-content {
  font-size: 26rpx;
  margin-top: 4rpx;
  line-height: 1.4;
  word-break: break-all;
}

.reply-time {
  font-size: 20rpx;
  margin-top: 4rpx;
  display: block;
}

.load-more {
  text-align: center;
  padding: 24rpx;
  font-size: 26rpx;
}

/* 底部评论输入框 */
.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid;
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}

.send-btn {
  width: 100rpx;
  height: 64rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 弹窗 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.rating-popup {
  width: 560rpx;
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: 20rpx;
}

.star-item {
  padding: 8rpx;
}

.star-icon {
  font-size: 64rpx;
}

.rating-label {
  font-size: 28rpx;
  margin-top: 16rpx;
  display: block;
}

.popup-actions {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 32rpx;
}

.popup-btn {
  padding: 16rpx 48rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}

.popup-btn.cancel {
  border: 1rpx solid #ddd;
}

.popup-btn.confirm {
  border: none;
}

/* 收藏夹弹窗 */
.folder-popup {
  width: 560rpx;
  border-radius: 24rpx;
  padding: 40rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.folder-item {
  padding: 24rpx;
  border-bottom: 1rpx solid;
  font-size: 28rpx;
}

.folder-item:last-of-type {
  border-bottom: none;
}
</style>
