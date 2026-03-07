import { NextResponse } from 'next/server';
import { getChannelVideos, type Video } from '@/lib/youtube/client';
import { getVideoCaptions } from '@/lib/youtube/transcript';
import { prisma } from '@/lib/db/prisma';
import { generateText, parseJsonResponse } from '@/lib/gemini/client';
import {
  createSummaryPrompt,
  createTipExtractionPrompt,
  type SummaryResult,
} from '@/lib/gemini/prompts';

/**
 * POST /api/sync - チャンネル動画を同期する（完全版）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { channelId: bodyChannelId, limit = 10 } = body;

    const channelId = bodyChannelId || process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        { error: 'YOUTUBE_CHANNEL_IDが設定されていません。リクエストボディでchannelIdを指定してください。' },
        { status: 400 }
      );
    }

    // チャンネルから動画を取得
    const allVideos: Video[] = [];
    let pageToken: string | undefined;

    while (allVideos.length < limit) {
      const response = await getChannelVideos(channelId, pageToken, Math.min(50, limit - allVideos.length));
      allVideos.push(...response.videos);
      pageToken = response.nextPageToken || undefined;
      if (!pageToken) break;
    }

    // Vercelのタイムアウト対策として、未処理の動画を最大3件だけ同期処理する
    const existingVideos = await prisma.video.findMany({
      where: {
        youtubeId: { in: allVideos.map((v: any) => v.id) },
        NOT: { summary: null }
      },
      select: { youtubeId: true }
    });
    const processedIds = new Set(existingVideos.map((v: any) => v.youtubeId));
    const unprocessedVideos = allVideos.filter((v: any) => !processedIds.has(v.id));

    const videosToProcess = unprocessedVideos.slice(0, Math.min(limit, 3));

    // 同期処理として実行（awaitで待つ）
    if (videosToProcess.length > 0) {
      await processVideos(videosToProcess);
    }

    return NextResponse.json({
      total: allVideos.length,
      processed: videosToProcess.length,
      message: `チャンネルから ${allVideos.length} 件の動画を取得し、${videosToProcess.length} 件の動画を処理しました。残りの同期には再度APIを呼び出してください。`,
    });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json(
      { error: '同期に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync - 処理状況を取得
 */
export async function GET() {
  try {
    // 処理済みの動画数を取得
    const processedCount = await prisma.video.count({
      where: {
        NOT: {
          summary: null,
        },
      },
    });

    const totalCount = await prisma.video.count();

    return NextResponse.json({
      processed: processedCount,
      total: totalCount,
      progress: totalCount > 0 ? (processedCount / totalCount) * 100 : 0,
      message: 'sync endpoint is ready',
    });
  } catch (error) {
    console.error('Sync Status Error:', error);
    return NextResponse.json(
      { error: '処理状況の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 動画を同期的に処理する
 */
async function processVideos(videos: Video[]) {
  console.log(`[Sync Processing] ${videos.length} 件の動画を処理を開始`);

  for (const video of videos) {
    try {
      // 既に存在する場合はスキップ
      const existing = await prisma.video.findUnique({
        where: { youtubeId: video.id },
      });

      if (existing && existing.summary) {
        console.log(`[Background Processing] スキップ: ${video.title} (要約済み)`);
        continue;
      }

      // 動画を保存または更新
      await prisma.video.upsert({
        where: { youtubeId: video.id },
        update: {
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
        },
        create: {
          youtubeId: video.id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
        },
      });

      // 字幕を取得（利用できない場合は空文字）
      console.log(`[Background Processing] 字幕取得中: ${video.title}`);
      const transcript = await getVideoCaptions(video.id);

      // 字幕がない場合はdescriptionを結合して使用
      let contentForSummary = transcript;
      if (!transcript || transcript.length < 100) {
        console.log(`[Background Processing] 字幕が不足しているためdescriptionを使用: ${video.title}`);
        contentForSummary = `${video.title}\n\n${video.description || ''}`;
      }

      // 要約を生成
      console.log(`[Background Processing] 要約生成中: ${video.title}`);
      const summaryPrompt = createSummaryPrompt(video.title, contentForSummary);
      const summaryResultText = await generateText(summaryPrompt);
      const summaryResult = parseJsonResponse<SummaryResult>(summaryResultText);

      if (summaryResult) {
        // 動画を更新
        await prisma.video.update({
          where: { youtubeId: video.id },
          data: {
            transcript,
            summary: summaryResult.summary,
            summaryData: JSON.stringify(summaryResult),
            difficultyLevel: summaryResult.difficultyLevel,
          },
        });

        // コツを抽出
        console.log(`[Background Processing] コツ抽出中: ${video.title}`);
        const tipPrompt = createTipExtractionPrompt(video.title, contentForSummary);
        const tipResultText = await generateText(tipPrompt);
        const tipResult = parseJsonResponse<TipResult>(tipResultText);

        if (tipResult) {
          // コツを保存
          await prisma.tip.upsert({
            where: {
              id: `${video.id}-tip`,
            },
            update: {
              title: tipResult.title,
              content: tipResult.content,
              category: tipResult.category,
              difficulty: tipResult.difficulty,
              videoIds: JSON.stringify([video.id]),
            },
            create: {
              id: `${video.id}-tip`,
              title: tipResult.title,
              content: tipResult.content,
              category: tipResult.category,
              difficulty: tipResult.difficulty,
              videoIds: JSON.stringify([video.id]),
            },
          });
        }

        console.log(`[Background Processing] 完了: ${video.title}`);
      } else {
        console.log(`[Background Processing] 要約失敗: ${video.title}`);
      }
    } catch (error) {
      console.error(`[Background Processing] エラー: ${video.title}`, error);
    }
  }

  console.log(`[Background Processing] 全件完了`);
}

/**
 * コツ抽出結果のインターフェース
 */
interface TipResult {
  title: string;
  content: string;
  category: string;
  difficulty: string | null;
}
