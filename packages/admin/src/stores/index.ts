import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminLogin } from '../api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '');
  const adminInfo = ref<any>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const res = await adminLogin(email, password) as any;
    token.value = res.data.token;
    adminInfo.value = res.data.admin;
    localStorage.setItem('admin_token', res.data.token);
    localStorage.setItem('admin_info', JSON.stringify(res.data.admin));
  }

  function logout() {
    token.value = '';
    adminInfo.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  }

  function init() {
    const info = localStorage.getItem('admin_info');
    if (info) {
      try {
        adminInfo.value = JSON.parse(info);
      } catch {
        // ignore invalid JSON
      }
    }
  }

  return { token, adminInfo, isAuthenticated, login, logout, init };
});
