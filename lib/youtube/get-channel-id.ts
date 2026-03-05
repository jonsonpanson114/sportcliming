import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * YouTubeチャンネルのカスタムURLからチャンネルIDを取得する
 *
 * @param handle - チャンネルのカスタムURL（例: @sportclimbing-coach）
 * @returns チャンネルID
 */
export async function getChannelIdByHandle(handle: string): Promise<string | null> {
  try {
    const response = await youtube.channels.list({
      forHandle: handle,
      part: ['id'],
      maxResults: 1,
    });

    const channel = response.data.items?.[0];
    if (!channel) {
      throw new Error('チャンネルが見つかりません');
    }

    return channel.id || null;
  } catch (error) {
    console.error('Get Channel ID Error:', error);
    return null;
  }
}

/**
 * チャンネル名からチャンネルを検索してチャンネルIDを取得する
 *
 * @param query - チャンネル名
 * @returns チャンネルID
 */
export async function getChannelIdBySearch(query: string): Promise<string | null> {
  try {
    const response = await youtube.search.list({
      q: query,
      type: ['channel'],
      part: ['id', 'snippet'],
      maxResults: 1,
    });

    const result = response.data.items?.[0];
    if (!result) {
      throw new Error('チャンネルが見つかりません');
    }

    return result.id?.channelId || null;
  } catch (error) {
    console.error('Search Channel ID Error:', error);
    return null;
  }
}
