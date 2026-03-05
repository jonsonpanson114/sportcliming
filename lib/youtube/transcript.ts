import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * YouTube字幕データのインターフェース
 */
export interface CaptionSegment {
  text: string;
  start: number;
  duration: number;
}

/**
 * YouTubeの字幕を取得する
 * youtube-transcript パッケージを使用するためOAuthは不要
 */
export async function getVideoCaptions(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja' }).catch(err => {
      // 日本語の字幕がない場合は、言語指定なしで取得を試みる
      return YoutubeTranscript.fetchTranscript(videoId);
    });

    if (!transcript || transcript.length === 0) {
      throw new Error('字幕が見つかりません');
    }

    // テキストのみを抽出して結合
    return transcript.map(t => t.text).join('\n');
  } catch (error) {
    console.error('Captions Error:', error);
    console.log('Captions fallback: Using video description');
    return await getVideoDescription(videoId);
  }
}

/**
 * 動画の説明文から情報を抽出する（字幕の代替）
 */
async function getVideoDescription(videoId: string): Promise<string> {
  try {
    const response = await youtube.videos.list({
      id: [videoId],
      part: ['snippet'],
      maxResults: 1,
    });

    const item = response.data.items?.[0];
    if (!item) {
      throw new Error('動画が見つかりません');
    }

    const description = item.snippet?.description || '';
    const title = item.snippet?.title || '';

    // タイトルと説明文を組み合わせて返す
    return `${title}\n\n${description}`;
  } catch (error) {
    console.error('Video Description Error:', error);
    throw new Error('動画の情報を取得できませんでした');
  }
}

/**
 * 字幕セグメントに分割して返す
 */
export async function getVideoCaptionsSegments(videoId: string): Promise<CaptionSegment[]> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja' }).catch(err => {
      return YoutubeTranscript.fetchTranscript(videoId);
    });

    if (!transcript || transcript.length === 0) {
      return [];
    }

    return transcript.map(t => ({
      text: t.text,
      start: t.offset / 1000,   // offsetはミリ秒なので秒に変換
      duration: t.duration / 1000
    }));
  } catch (error) {
    console.error('Captions Segments Error:', error);
    return [];
  }
}
