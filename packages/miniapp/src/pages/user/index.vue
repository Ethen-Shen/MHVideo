<template>
  <view class="container" :style="{ backgroundColor: colors.bgSecondary }">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-prompt" :style="{ backgroundColor: colors.bgCard }" @tap="goToLogin">
      <image class="avatar-default" src="/static/default-avatar.png" mode="aspectFill" />
      <text class="prompt-text" :style="{ color: colors.textSecondary }">{{ t('loginRequired') }}</text>
      <text class="login-link" :style="{ color: colors.accent }">{{ t('login') }}</text>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="user-profile" :style="{ backgroundColor: colors.bgCard }">
      <view class="avatar-wrap" @tap="changeAvatar">
        <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="avatar-edit-icon">
          <text class="edit-icon-text">✎</text>
        </view>
      </view>
      <text class="nickname" :style="{ color: colors.textPrimary }">{{ userInfo.nickname || t('user') }}</text>
      <text v-if="userInfo.bio" class="bio" :style="{ color: colors.textMuted }">{{ userInfo.bio }}</text>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list" :style="{ backgroundColor: colors.bgCard, marginTop: isLoggedIn ? '20rpx' : '0' }">
      <view class="menu-item" :style="{ borderBottomColor: colors.border }" @tap="goToHistory">
        <view class="menu-left">
          <text class="menu-icon">📺</text>
          <text class="menu-text" :style="{ color: colors.textPrimary }">{{ t('watchHistory') }}</text>
        </view>
        <text class="menu-arrow" :style="{ color: colors.textMuted }">›</text>
      </view>
      <view class="menu-item" :style="{ borderBottomColor: colors.border }" @tap="goToFavorites">
        <view class="menu-left">
          <text class="menu-icon">⭐</text>
          <text class="menu-text" :style="{ color: colors.textPrimary }">{{ t('favorite') }}</text>
        </view>
        <text class="menu-arrow" :style="{ color: colors.textMuted }">›</text>
      </view>
      <view class="menu-item" :style="{ borderBottomColor: colors.border }" @tap="goToLikes">
        <view class="menu-left">
          <text class="menu-icon">❤️</text>
          <text class="menu-text" :style="{ color: colors.textPrimary }">{{ t('like') }}</text>
        </view>
        <text class="menu-arrow" :style="{ color: colors.textMuted }">›</text>
      </view>
      <view class="menu-item" :style="{ borderBottomColor: colors.border }" @tap="showThemePicker">
        <view class="menu-left">
          <text class="menu-icon">🎨</text>
          <text class="menu-text" :style="{ color: colors.textPrimary }">{{ t('theme') }}</text>
        </view>
        <text class="menu-value" :style="{ color: colors.accent }">{{ themeLabel }}</text>
      </view>
      <view class="menu-item" :style="{ borderBottomColor: colors.border }" @tap="showLanguagePicker">
        <view class="menu-left">
          <text class="menu-icon">🌐</text>
          <text class="menu-text" :style="{ color: colors.textPrimary }">{{ t('language') }}</text>
        </view>
        <text class="menu-value" :style="{ color: colors.accent }">{{ localeLabel }}</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="isLoggedIn" class="logout-section">
      <button class="logout-btn" :style="{ backgroundColor: colors.bgCard, color: colors.danger }" @tap="handleLogout">
        {{ t('logout') }}
      </button>
    </view>

    <!-- 主题选择弹窗 -->
    <view v-if="themePickerVisible" class="picker-mask" @tap="themePickerVisible = false">
      <view class="picker-panel" :style="{ backgroundColor: colors.bgCard }" @tap.stop>
        <text class="picker-title" :style="{ color: colors.textPrimary }">{{ t('theme') }}</text>
        <view
          v-for="item in themeOptions"
          :key="item.value"
          class="picker-item"
          :style="{ borderBottomColor: colors.border }"
          @tap="selectTheme(item.value)"
        >
          <text class="picker-item-text" :style="{ color: theme === item.value ? colors.accent : colors.textPrimary }">
            {{ item.label }}
          </text>
          <text v-if="theme === item.value" class="picker-check" :style="{ color: colors.accent }">✓</text>
        </view>
      </view>
    </view>

    <!-- 语言选择弹窗 -->
    <view v-if="langPickerVisible" class="picker-mask" @tap="langPickerVisible = false">
      <view class="picker-panel" :style="{ backgroundColor: colors.bgCard }" @tap.stop>
        <text class="picker-title" :style="{ color: colors.textPrimary }">{{ t('language') }}</text>
        <view
          v-for="item in langOptions"
          :key="item.value"
          class="picker-item"
          :style="{ borderBottomColor: colors.border }"
          @tap="selectLanguage(item.value)"
        >
          <text class="picker-item-text" :style="{ color: locale === item.value ? colors.accent : colors.textPrimary }">
            {{ item.label }}
          </text>
          <text v-if="locale === item.value" class="picker-check" :style="{ color: colors.accent }">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore, useThemeStore, useI18nStore } from '@/stores';
import { authApi, userApi } from '@/api';
import { Theme, LOCALES, type Locale } from '@mhvideo/shared';

const userStore = useUserStore();
const themeStore = useThemeStore();
const i18nStore = useI18nStore();

const colors = computed(() => themeStore.colors);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo);
const themeLabel = computed(() => themeStore.themeLabel);
const localeLabel = computed(() => i18nStore.localeLabel);
const theme = computed(() => themeStore.theme);
const locale = computed(() => i18nStore.locale);
const t = (key: string) => i18nStore.t(key);

const themePickerVisible = ref(false);
const langPickerVisible = ref(false);

const themeOptions = [
  { label: '浅色', value: Theme.LIGHT },
  { label: '深色', value: Theme.DARK },
  { label: '跟随系统', value: Theme.AUTO },
];

const langOptions = Object.entries(LOCALES).map(([value, label]) => ({
  label,
  value: value as Locale,
}));

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/index' });
}

function goToHistory() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: t('loginRequired'), icon: 'none' });
    return;
  }
  uni.navigateTo({ url: '/pages/history/index' });
}

function goToFavorites() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: t('loginRequired'), icon: 'none' });
    return;
  }
  uni.navigateTo({ url: '/pages/favorites/index' });
}

function goToLikes() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: t('loginRequired'), icon: 'none' });
    return;
  }
  uni.navigateTo({ url: '/pages/favorites/index?tab=likes' });
}

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0];
      try {
        uni.showLoading({ title: t('loading') });
        const result = await userApi.uploadAvatar(filePath) as any;
        userStore.setUserInfo({ ...userInfo.value, avatar: result.avatar || result.data?.avatar || filePath });
        uni.hideLoading();
        uni.showToast({ title: t('success'), icon: 'success' });
      } catch {
        uni.hideLoading();
        uni.showToast({ title: t('error'), icon: 'none' });
      }
    },
  });
}

function showThemePicker() {
  themePickerVisible.value = true;
}

function selectTheme(t: Theme) {
  themeStore.setTheme(t);
  themePickerVisible.value = false;
}

function showLanguagePicker() {
  langPickerVisible.value = true;
}

function selectLanguage(l: Locale) {
  i18nStore.setLocale(l);
  langPickerVisible.value = false;
}

function handleLogout() {
  uni.showModal({
    title: t('confirm'),
    content: t('logout') + '?',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.showToast({ title: t('logoutSuccess'), icon: 'success' });
      }
    },
  });
}
</script>

<style scoped>
.container {
  min-height: 100vh;
}

/* 未登录状态 */
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.avatar-default {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  opacity: 0.5;
}

.prompt-text {
  margin-top: 20rpx;
  font-size: 28rpx;
}

.login-link {
  margin-top: 10rpx;
  font-size: 30rpx;
  font-weight: bold;
}

/* 已登录状态 */
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.avatar-wrap {
  position: relative;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
}

.avatar-edit-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background-color: #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon-text {
  font-size: 22rpx;
  color: #ffffff;
}

.nickname {
  margin-top: 20rpx;
  font-size: 34rpx;
  font-weight: bold;
}

.bio {
  margin-top: 10rpx;
  font-size: 26rpx;
}

/* 菜单列表 */
.menu-list {
  margin-top: 20rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 28rpx;
}

.menu-arrow {
  font-size: 32rpx;
}

.menu-value {
  font-size: 26rpx;
}

/* 退出登录 */
.logout-section {
  margin-top: 40rpx;
  padding: 0 40rpx;
}

.logout-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
}

/* 选择弹窗 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.picker-panel {
  width: 100%;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-title {
  display: block;
  text-align: center;
  padding: 30rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-item-text {
  font-size: 28rpx;
}

.picker-check {
  font-size: 32rpx;
  font-weight: bold;
}
</style>
