<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme';

onLaunch(() => {
  console.log('App Launch');
  const userStore = useUserStore();
  const themeStore = useThemeStore();

  userStore.init();
  themeStore.applyTheme();
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>

<style>
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}
</style>
