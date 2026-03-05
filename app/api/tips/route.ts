import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/tips - コツ一覧を取得する
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const tips = await prisma.tip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // videoIdsをパース
    const tipsWithVideos = tips.map((tip) => ({
      ...tip,
      videoIds: tip.videoIds ? JSON.parse(tip.videoIds) : [],
    }));

    return NextResponse.json({ tips: tipsWithVideos });
  } catch (error) {
    console.error('Tips API Error:', error);
    return NextResponse.json(
      { error: 'コツ一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tips - コツを抽出して保存する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoIds } = body;

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { error: 'videoIdsが必要です' },
        { status: 400 }
      );
    }

    // 動画を取得
    const videos = await prisma.video.findMany({
      where: {
        id: { in: videoIds },
      },
      select: { id: true, title: true, summary: true },
    });

    // 既存のコツを取得
    const existingTips = await prisma.tip.findMany();

    const newTips = [];

    for (const video of videos) {
      if (!video.summary) continue;

      // 既存のコツと重複チェック
      const exists = existingTips.some(
        (tip) => tip.title === video.title
      );
      if (exists) continue;

      // カテゴリーを推定（簡易版）
      let category = 'technique';
      if (video.summary?.includes('トレーニング') || video.summary?.includes('練習')) {
        category = 'training';
      } else if (video.summary?.includes('メンタル') || video.summary?.includes('心')) {
        category = 'mental';
      } else if (video.summary?.includes('装備') || video.summary?.includes('シューズ')) {
        category = 'equipment';
      }

      newTips.push({
        title: video.title,
        content: video.summary,
        category,
        videoIds: JSON.stringify([video.id]),
      });
    }

    // コツを保存
    if (newTips.length > 0) {
      await prisma.tip.createMany({
        data: newTips,
      });
    }

    return NextResponse.json({
      created: newTips.length,
      tips: newTips.map((tip) => ({
        ...tip,
        videoIds: JSON.parse(tip.videoIds),
      })),
    });
  } catch (error) {
    console.error('Tips API Error:', error);
    return NextResponse.json(
      { error: 'コツの抽出に失敗しました' },
      { status: 500 }
    );
  }
}
