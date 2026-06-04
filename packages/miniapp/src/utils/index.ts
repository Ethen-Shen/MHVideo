import { formatDuration, formatViewCount, formatDate } from '@mhvideo/shared';

export { formatDuration, formatViewCount, formatDate };

/**
 * 显示 Toast 提示
 */
export function showToast(title: string, icon: UniApp.ShowToastIcon = 'none') {
  uni.showToast({ title, icon });
}

/**
 * 显示 Loading
 */
export function showLoading(title = '加载中...') {
  uni.showLoading({ title });
}

/**
 * 隐藏 Loading
 */
export function hideLoading() {
  uni.hideLoading();
}

/**
 * 获取视频播放地址
 */
export function getVideoUrl(key: string): string {
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL ?? '';
  return `${baseUrl}/${key}`;
}
