import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/history - 視聴履歴を取得する
 */
export async function GET() {
  try {
    const history = await prisma.history.findMany({
      orderBy: { watchedAt: 'desc' },
      take: 100,
    });

    const videoIds = history.map((h) => h.videoId);
    const videos = await prisma.video.findMany({
      where: { youtubeId: { in: videoIds } },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { error: '履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history - 視聴履歴に追加する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoIdが必要です' },
        { status: 400 }
      );
    }

    const history = await prisma.history.upsert({
      where: { videoId },
      update: { watchedAt: new Date() },
      create: { videoId },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { error: '履歴の追加に失敗しました' },
      { status: 500 }
    );
  }
}
