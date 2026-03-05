/**
 * ローカルストレージユーティリティ
 */

const STORAGE_KEYS = {
  USER_ID: 'climbing_user_id',
  FAVORITES: 'climbing_favorites',
  HISTORY: 'climbing_history',
  PRACTICE_RECORDS: 'climbing_practice_records',
  VIDEO_NOTES: 'climbing_video_notes',
  TIPS: 'climbing_tips',
  STREAK: 'climbing_streak',
  LAST_SYNC: 'climbing_last_sync',
} as const;

/**
 * localStorageから値を取得する
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * localStorageに値を保存する
 */
export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage set error:', error);
  }
}

/**
 * localStorageから値を削除する
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('LocalStorage remove error:', error);
  }
}

/**
 * ユーザーIDを取得・設定する
 */
export function getUserId(): string {
  let userId = getItem<string>(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = crypto.randomUUID();
    setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
}

/**
 * お気に入りを管理する
 */
export function getFavorites(): string[] {
  return getItem<string[]>(STORAGE_KEYS.FAVORITES) || [];
}

export function addFavorite(videoId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(videoId)) {
    favorites.push(videoId);
    setItem(STORAGE_KEYS.FAVORITES, favorites);
  }
}

export function removeFavorite(videoId: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((id) => id !== videoId);
  setItem(STORAGE_KEYS.FAVORITES, filtered);
}

export function isFavorite(videoId: string): boolean {
  return getFavorites().includes(videoId);
}

/**
 * 視聴履歴を管理する
 */
export function getHistory(): string[] {
  return getItem<string[]>(STORAGE_KEYS.HISTORY) || [];
}

export function addToHistory(videoId: string): void {
  const history = getHistory();
  // 重複を削除
  const filtered = history.filter((id) => id !== videoId);
  // 先頭に追加
  filtered.unshift(videoId);
  // 最新100件のみ保持
  setItem(STORAGE_KEYS.HISTORY, filtered.slice(0, 100));
}

/**
 * ストリーク（連続練習日数）を管理する
 */
export function getStreak(): { current: number; best: number; lastDate: string | null } {
  return getItem<{ current: number; best: number; lastDate: string | null }>(STORAGE_KEYS.STREAK) || {
    current: 0,
    best: 0,
    lastDate: null,
  };
}

export function updateStreak(isToday: boolean): void {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];

  if (isToday && streak.lastDate !== today) {
    // 今日初めて練習した
    streak.current += 1;
    if (streak.current > streak.best) {
      streak.best = streak.current;
    }
    streak.lastDate = today;
    setItem(STORAGE_KEYS.STREAK, streak);
  } else if (!isToday && streak.lastDate !== today) {
    // 今日まだ練習していない
    streak.current = 0;
    setItem(STORAGE_KEYS.STREAK, streak);
  }
}

/**
 * 最後の同期時刻を管理する
 */
export function getLastSync(): string | null {
  return getItem<string>(STORAGE_KEYS.LAST_SYNC);
}

export function setLastSync(timestamp: string): void {
  setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
}
