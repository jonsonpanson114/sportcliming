import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date;
}

export interface YouTubeChannelVideosResponse {
  videos: Video[];
  nextPageToken: string | null;
}

/**
 * YouTubeチャンネルから動画を取得する
 * search.list では description が返されないため、追加で videos.list を呼び出して詳細を取得する
 */
export async function getChannelVideos(
  channelId: string,
  pageToken?: string,
  maxResults: number = 50
): Promise<YouTubeChannelVideosResponse> {
  try {
    const response = await youtube.search.list({
      channelId,
      type: ['video'],
      part: ['snippet', 'id'],
      maxResults,
      pageToken,
      order: 'date',
    });

    const videoIds = (response.data.items || [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => id !== undefined);

    if (videoIds.length === 0) {
      return {
        videos: [],
        nextPageToken: response.data.nextPageToken || null,
      };
    }

    // videos.list を使って詳細情報（description含む）を取得
    const detailsResponse = await youtube.videos.list({
      id: videoIds,
      part: ['snippet', 'contentDetails'],
      maxResults: maxResults,
    });

    const detailsMap = new Map<string, any>(
      (detailsResponse.data.items || []).map((item) => [item.id || '', item])
    );

    const videos: Video[] = (response.data.items || [])
      .map((item) => {
        const videoId = item.id?.videoId;
        if (!videoId) return null;

        const details = detailsMap.get(videoId);

        return {
          id: videoId,
          title: details?.snippet?.title || item.snippet?.title || '',
          description: details?.snippet?.description || item.snippet?.description || null,
          thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || null,
          publishedAt: new Date(item.snippet?.publishedAt || ''),
        };
      })
      .filter((v): v is Video => v !== null);

    return {
      videos,
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw new Error('YouTube動画の取得に失敗しました');
  }
}

/**
 * 特定の動画IDで動画の詳細を取得する
 */
export async function getVideoById(videoId: string): Promise<Video | null> {
  try {
    const response = await youtube.videos.list({
      id: [videoId],
      part: ['snippet', 'contentDetails'],
      maxResults: 1,
    });

    const item = response.data.items?.[0];
    if (!item) return null;

    return {
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || null,
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || null,
      publishedAt: new Date(item.snippet?.publishedAt || ''),
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return null;
  }
}

/**
 * 動画を検索する
 */
export async function searchVideos(
  query: string,
  channelId?: string,
  pageToken?: string,
  maxResults: number = 50
): Promise<YouTubeChannelVideosResponse> {
  try {
    const response = await youtube.search.list({
      q: query,
      channelId,
      type: ['video'],
      part: ['snippet', 'id'],
      maxResults,
      pageToken,
      order: 'relevance',
    });

    const videos: Video[] = (response.data.items || []).map((item) => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || null,
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || null,
      publishedAt: new Date(item.snippet?.publishedAt || ''),
    }));

    return {
      videos,
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw new Error('動画の検索に失敗しました');
  }
}
