import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { useAuthStore } from './stores';
import './styles/index.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

// 初始化 auth store，从 localStorage 恢复管理员信息
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
