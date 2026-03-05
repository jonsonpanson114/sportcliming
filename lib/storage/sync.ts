import { prisma } from '../db/prisma';
import { getUserId, getFavorites, getHistory } from './local';

/**
 * クラウド同期を実行する
 */
export async function syncToCloud(): Promise<{ synced: boolean; error?: string }> {
  try {
    const userId = getUserId();

    // お気に入りを同期
    const localFavorites = getFavorites();
    for (const videoId of localFavorites) {
      await prisma.favorite.upsert({
        where: { videoId },
        update: {},
        create: { videoId },
      });
    }

    // 視聴履歴を同期
    const localHistory = getHistory();
    for (const videoId of localHistory) {
      await prisma.history.upsert({
        where: { videoId },
        update: {},
        create: { videoId },
      });
    }

    return { synced: true };
  } catch (error) {
    console.error('Sync Error:', error);
    return { synced: false, error: 'クラウド同期に失敗しました' };
  }
}

/**
 * クラウドからデータを取得する
 */
export async function syncFromCloud(): Promise<{ synced: boolean; error?: string }> {
  try {
    // お気に入りを取得
    const favorites = await prisma.favorite.findMany();
    const favoriteIds = favorites.map((f) => f.videoId);

    // 視聴履歴を取得
    const history = await prisma.history.findMany();
    const historyIds = history.map((h) => h.videoId);

    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('climbing_favorites', JSON.stringify(favoriteIds));
      localStorage.setItem('climbing_history', JSON.stringify(historyIds));
    }

    return { synced: true };
  } catch (error) {
    console.error('Sync Error:', error);
    return { synced: false, error: 'クラウドからの同期に失敗しました' };
  }
}

/**
 * 自動同期（バックグラウンドで実行）
 */
export async function autoSync(): Promise<void> {
  try {
    // 5分ごとに同期を試行
    const lastSync = localStorage.getItem('climbing_last_sync');
    const now = Date.now();

    if (!lastSync || now - parseInt(lastSync) > 5 * 60 * 1000) {
      await syncToCloud();
      localStorage.setItem('climbing_last_sync', now.toString());
    }
  } catch (error) {
    console.error('Auto Sync Error:', error);
  }
}
