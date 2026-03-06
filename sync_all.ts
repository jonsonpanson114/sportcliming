import 'dotenv/config';
import { google } from 'googleapis';
import { prisma } from './lib/db/prisma';
import { generateText, parseJsonResponse } from './lib/gemini/client';
import { createSummaryPrompt, type SummaryResult } from './lib/gemini/prompts';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

async function getAllChannelVideos(channelId: string, limit: number = 200) {
  const allVideos: any[] = [];
  let pageToken: string | undefined = '';

  while (allVideos.length < limit) {
    const response = await youtube.search.list({
      channelId,
      type: ['video'],
      part: ['snippet', 'id'],
      maxResults: Math.min(50, limit - allVideos.length),
      pageToken,
      order: 'date',
    });

    const items = response.data.items || [];
    allVideos.push(...items);
    pageToken = response.data.nextPageToken || undefined;

    if (!pageToken) break;

    console.log(`収集中: ${allVideos.length}件...`);
  }

  // 説明文を取得（50件ずつバッチ処理）
  const videoIds = allVideos.map(item => item.id?.videoId).filter((id): id is string => id !== undefined);
  const detailsMap = new Map<string, any>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const detailsResponse = await youtube.videos.list({
      id: batch,
      part: ['snippet', 'contentDetails'],
      maxResults: 50,
    });

    for (const item of detailsResponse.data.items || []) {
      detailsMap.set(item.id || '', item);
    }

    console.log(`詳細取得: ${Math.min(i + 50, videoIds.length)}/${videoIds.length}件`);
  }

  const videos = allVideos.map((item) => {
    const videoId = item.id?.videoId;
    const details = detailsMap.get(videoId);

    return {
      youtubeId: videoId,
      title: details?.snippet?.title || item.snippet?.title || '',
      description: details?.snippet?.description || item.snippet?.description || null,
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || null,
      publishedAt: new Date(item.snippet?.publishedAt || ''),
    };
  }).filter((v): v is typeof v => v.youtubeId !== undefined);

  console.log(`合計: ${videos.length}件の動画を取得しました`);
  return videos;
}

async function processVideo(video: any): Promise<void> {
  try {
    // 既に存在するか確認
    const existing = await prisma.video.findUnique({
      where: { youtubeId: video.youtubeId },
    });

    if (existing && existing.summary) {
      console.log(`  スキップ: ${video.title.substring(0, 30)}... (要約済み)`);
      return;
    }

    // 動画を保存
    await prisma.video.upsert({
      where: { youtubeId: video.youtubeId },
      update: {
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
      },
      create: {
        youtubeId: video.youtubeId,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
      },
    });

    // トランスクリプトを設定
    const transcript = video.title + '\n\n' + (video.description || '');
    await prisma.video.update({
      where: { youtubeId: video.youtubeId },
      data: { transcript },
    });

    // サマリー生成
    const prompt = createSummaryPrompt(video.title, transcript);
    const summaryResultText = await generateText(prompt);
    const summaryResult = parseJsonResponse<SummaryResult>(summaryResultText);

    if (!summaryResult) {
      console.log(`  エラー: ${video.title.substring(0, 30)}...`);
      return;
    }

    // データベースに保存
    await prisma.video.update({
      where: { youtubeId: video.youtubeId },
      data: {
        summary: summaryResult.summary,
        summaryData: JSON.stringify(summaryResult),
        difficultyLevel: summaryResult.difficultyLevel,
      },
    });

    console.log(`  完了: ${video.title.substring(0, 30)}...`);
  } catch (error) {
    console.error(`  エラー: ${video.youtubeId}`, error);
  }
}

async function main() {
  console.log('チャンネル動画の同期を開始します...');
  console.log(`Channel: ${process.env.YOUTUBE_CHANNEL_ID}\n`);

  const videos = await getAllChannelVideos(process.env.YOUTUBE_CHANNEL_ID!, 200);

  console.log(`\n${videos.length}件の動画を処理します...\n`);

  let processed = 0;
  for (const video of videos) {
    await processVideo(video);
    processed++;

    if (processed % 10 === 0) {
      console.log(`進捗: ${processed}/${videos.length}件完了`);
    }
  }

  console.log(`\nすべて完了しました！合計: ${processed}件`);
}

main().catch(console.error);
