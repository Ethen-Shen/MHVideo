<template>
  <view class="container" :style="{ backgroundColor: colors.bgSecondary }">
    <!-- Logo 和应用名称 -->
    <view class="header">
      <image class="logo" src="/static/logo.svg" mode="aspectFit" />
      <text class="app-name" :style="{ color: colors.textPrimary }">墨焕影视</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar" :style="{ backgroundColor: colors.bgCard }">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'login' }"
        :style="{ color: activeTab === 'login' ? colors.accent : colors.textSecondary, borderBottomColor: activeTab === 'login' ? colors.accent : 'transparent' }"
        @tap="activeTab = 'login'"
      >
        {{ t('login') }}
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'register' }"
        :style="{ color: activeTab === 'register' ? colors.accent : colors.textSecondary, borderBottomColor: activeTab === 'register' ? colors.accent : 'transparent' }"
        @tap="activeTab = 'register'"
      >
        {{ t('register') }}
      </view>
    </view>

    <!-- 登录表单 -->
    <view v-if="activeTab === 'login'" class="form-section" :style="{ backgroundColor: colors.bgCard }">
      <view class="input-group" :style="{ borderBottomColor: colors.border }">
        <text class="input-icon" :style="{ color: colors.textMuted }">✉</text>
        <input
          v-model="loginForm.email"
          class="input"
          :style="{ color: colors.textPrimary }"
          type="text"
          :placeholder="t('email')"
          placeholder-class="placeholder"
        />
      </view>
      <view class="input-group" :style="{ borderBottomColor: colors.border }">
        <text class="input-icon" :style="{ color: colors.textMuted }">🔒</text>
        <input
          v-model="loginForm.password"
          class="input"
          :style="{ color: colors.textPrimary }"
          type="password"
          :placeholder="t('password')"
          placeholder-class="placeholder"
        />
      </view>
      <button class="submit-btn" :style="{ backgroundColor: colors.accent, color: '#ffffff' }" :loading="loginLoading" @tap="handleLogin">
        {{ t('login') }}
      </button>

      <!-- 小程序一键登录 -->
      <view class="divider" :style="{ borderTopColor: colors.border }">
        <text class="divider-text" :style="{ color: colors.textMuted, backgroundColor: colors.bgCard }">— {{ t('more') }} —</text>
      </view>
      <view class="miniapp-login">
        <button v-if="platform === 'mp-weixin'" class="miniapp-btn wechat" @tap="handleMiniappLogin">
          微信一键登录
        </button>
        <button v-else-if="platform === 'mp-toutiao'" class="miniapp-btn douyin" @tap="handleMiniappLogin">
          抖音一键登录
        </button>
        <button v-else-if="platform === 'mp-tiktok'" class="miniapp-btn tiktok" @tap="handleMiniappLogin">
          TikTok Login
        </button>
      </view>
    </view>

    <!-- 注册表单 -->
    <view v-if="activeTab === 'register'" class="form-section" :style="{ backgroundColor: colors.bgCard }">
      <view class="input-group" :style="{ borderBottomColor: colors.border }">
        <text class="input-icon" :style="{ color: colors.textMuted }">✉</text>
        <input
          v-model="registerForm.email"
          class="input"
          :style="{ color: colors.textPrimary }"
          type="text"
          :placeholder="t('email')"
          placeholder-class="placeholder"
        />
      </view>
      <view class="input-group" :style="{ borderBottomColor: colors.border }">
        <text class="input-icon" :style="{ color: colors.textMuted }">👤</text>
        <input
          v-model="registerForm.username"
          class="input"
          :style="{ color: colors.textPrimary }"
          type="text"
          :placeholder="t('nickname')"
          placeholder-class="placeholder"
        />
      </view>
      <view class="input-group" :style="{ borderBottomColor: colors.border }">
        <text class="input-icon" :style="{ color: colors.textMuted }">🔒</text>
        <input
          v-model="registerForm.password"
          class="input"
          :style="{ color: colors.textPrimary }"
          type="password"
          :placeholder="t('password')"
          placeholder-class="placeholder"
        />
      </view>
      <view class="input-group" :style="{ borderBottomColor: colors.border }">
        <text class="input-icon" :style="{ color: colors.textMuted }">🔒</text>
        <input
          v-model="registerForm.confirmPassword"
          class="input"
          :style="{ color: colors.textPrimary }"
          type="password"
          :placeholder="t('confirmPassword')"
          placeholder-class="placeholder"
        />
      </view>
      <button class="submit-btn" :style="{ backgroundColor: colors.accent, color: '#ffffff' }" :loading="registerLoading" @tap="handleRegister">
        {{ t('register') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore, useThemeStore, useI18nStore } from '@/stores';
import { authApi } from '@/api';

const userStore = useUserStore();
const themeStore = useThemeStore();
const i18nStore = useI18nStore();

const colors = computed(() => themeStore.colors);
const t = (key: string) => i18nStore.t(key);

const activeTab = ref<'login' | 'register'>('login');
const loginLoading = ref(false);
const registerLoading = ref(false);
const platform = ref('');

const loginForm = ref({
  email: '',
  password: '',
});

const registerForm = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
});

onMounted(() => {
  try {
    const sysInfo = uni.getSystemInfoSync();
    platform.value = (sysInfo as any).uniPlatform || '';
  } catch {
    platform.value = '';
  }
});

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleLogin() {
  if (!loginForm.value.email) {
    uni.showToast({ title: t('email'), icon: 'none' });
    return;
  }
  if (!validateEmail(loginForm.value.email)) {
    uni.showToast({ title: t('email'), icon: 'none' });
    return;
  }
  if (!loginForm.value.password) {
    uni.showToast({ title: t('password'), icon: 'none' });
    return;
  }

  loginLoading.value = true;
  try {
    const result = await authApi.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    }) as any;

    const token = result.token || result.data?.token || '';
    const user = result.user || result.data?.user || {};

    if (token) {
      userStore.setToken(token);
      userStore.setUserInfo({
        id: user.id || '',
        username: user.username || '',
        nickname: user.nickname || user.username || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
      });
      uni.showToast({ title: t('loginSuccess'), icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    }
  } catch {
    uni.showToast({ title: t('invalidCredentials'), icon: 'none' });
  } finally {
    loginLoading.value = false;
  }
}

async function handleMiniappLogin() {
  uni.login({
    provider: platform.value === 'mp-weixin' ? 'weixin' : platform.value === 'mp-toutiao' ? 'toutiao' : 'tiktok',
    success: async (loginRes) => {
      if (loginRes.code) {
        try {
          uni.showLoading({ title: t('loading') });
          const result = await authApi.miniappLogin({
            code: loginRes.code,
            platform: platform.value,
          }) as any;

          const token = result.token || result.data?.token || '';
          const user = result.user || result.data?.user || {};

          if (token) {
            userStore.setToken(token);
            userStore.setUserInfo({
              id: user.id || '',
              username: user.username || '',
              nickname: user.nickname || user.username || '',
              avatar: user.avatar || '',
              bio: user.bio || '',
            });
            uni.hideLoading();
            uni.showToast({ title: t('loginSuccess'), icon: 'success' });
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          }
        } catch {
          uni.hideLoading();
          uni.showToast({ title: t('error'), icon: 'none' });
        }
      }
    },
    fail: () => {
      uni.showToast({ title: t('error'), icon: 'none' });
    },
  });
}

async function handleRegister() {
  if (!registerForm.value.email) {
    uni.showToast({ title: t('email'), icon: 'none' });
    return;
  }
  if (!validateEmail(registerForm.value.email)) {
    uni.showToast({ title: t('email'), icon: 'none' });
    return;
  }
  if (!registerForm.value.username) {
    uni.showToast({ title: t('nickname'), icon: 'none' });
    return;
  }
  if (!registerForm.value.password) {
    uni.showToast({ title: t('password'), icon: 'none' });
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    uni.showToast({ title: t('passwordMismatch'), icon: 'none' });
    return;
  }

  registerLoading.value = true;
  try {
    const result = await authApi.register({
      email: registerForm.value.email,
      username: registerForm.value.username,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
    }) as any;

    const token = result.token || result.data?.token || '';
    const user = result.user || result.data?.user || {};

    if (token) {
      userStore.setToken(token);
      userStore.setUserInfo({
        id: user.id || '',
        username: user.username || registerForm.value.username,
        nickname: user.nickname || user.username || registerForm.value.username,
        avatar: user.avatar || '',
        bio: user.bio || '',
      });
      uni.showToast({ title: t('registerSuccess'), icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    } else {
      uni.showToast({ title: t('registerSuccess'), icon: 'success' });
      activeTab.value = 'login';
      loginForm.value.email = registerForm.value.email;
    }
  } catch {
    uni.showToast({ title: t('error'), icon: 'none' });
  } finally {
    registerLoading.value = false;
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 0 40rpx;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
  padding-bottom: 60rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
}

.app-name {
  margin-top: 20rpx;
  font-size: 40rpx;
  font-weight: bold;
}

/* Tab 切换 */
.tab-bar {
  display: flex;
  border-radius: 12rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  font-weight: bold;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s;
}

/* 表单区域 */
.form-section {
  margin-top: 40rpx;
  border-radius: 12rpx;
  padding: 40rpx;
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #e5e5e5;
  padding: 20rpx 0;
  margin-bottom: 10rpx;
}

.input-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  width: 40rpx;
  text-align: center;
}

.input {
  flex: 1;
  font-size: 28rpx;
  height: 60rpx;
}

.placeholder {
  color: #cccccc;
}

.submit-btn {
  margin-top: 40rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

/* 分割线 */
.divider {
  margin-top: 40rpx;
  position: relative;
  border-top: 1rpx solid #e5e5e5;
}

.divider-text {
  position: absolute;
  top: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 20rpx;
  font-size: 24rpx;
}

/* 小程序一键登录 */
.miniapp-login {
  margin-top: 50rpx;
}

.miniapp-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  color: #ffffff;
}

.wechat {
  background-color: #07c160;
}

.douyin {
  background-color: #161823;
}

.tiktok {
  background-color: #fe2c55;
}
</style>
