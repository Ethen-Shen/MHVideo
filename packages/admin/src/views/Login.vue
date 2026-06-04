<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="w-full max-w-md px-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4">
            <img src="@/assets/logo.svg" alt="墨焕影视" class="w-12 h-12" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">墨焕影视 管理后台</h1>
          <p class="text-sm text-gray-500 mt-1">请登录以继续</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin">
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="admin@mhvideo.com"
              />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="mb-4 flex items-center space-x-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="loading" class="flex items-center justify-center space-x-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>登录中...</span>
            </span>
            <span v-else>登 录</span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-xs mt-6">&copy; 2026 墨焕（上海）互联网科技有限公司. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(form.email, form.password);
    router.push('/dashboard');
  } catch (err: unknown) {
    error.value = '登录失败，请检查邮箱和密码';
  } finally {
    loading.value = false;
  }
}
</script>
