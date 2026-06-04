import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') ?? '');
  const userInfo = ref<{
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    bio: string;
  }>({
    id: '',
    username: '',
    nickname: '',
    avatar: '',
    bio: '',
  });

  const isLoggedIn = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    uni.setStorageSync('token', t);
  }

  function setUserInfo(info: typeof userInfo.value) {
    userInfo.value = info;
    uni.setStorageSync('user_info', JSON.stringify(info));
  }

  function logout() {
    token.value = '';
    userInfo.value = { id: '', username: '', nickname: '', avatar: '', bio: '' };
    uni.removeStorageSync('token');
    uni.removeStorageSync('user_info');
  }

  function init() {
    const info = uni.getStorageSync('user_info');
    if (info) {
      try {
        userInfo.value = JSON.parse(info);
      } catch {
        // ignore parse error
      }
    }
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout, init };
});
