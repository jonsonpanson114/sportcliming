import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/favorites - お気に入り一覧を取得する
 */
export async function GET() {
  try {
    const favorites = await prisma.favorite.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const videoIds = favorites.map((f: any) => f.videoId);
    const videos = await prisma.video.findMany({
      where: { youtubeId: { in: videoIds } },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Favorites API Error:', error);
    return NextResponse.json(
      { error: 'お気に入りの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites - お気に入りに追加する
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

    const favorite = await prisma.favorite.create({
      data: { videoId },
    });

    return NextResponse.json({ favorite });
  } catch (error) {
    console.error('Favorite API Error:', error);
    return NextResponse.json(
      { error: 'お気に入りの追加に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites - お気に入りを削除する
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoIdが必要です' },
        { status: 400 }
      );
    }

    await prisma.favorite.deleteMany({
      where: { videoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite Delete Error:', error);
    return NextResponse.json(
      { error: 'お気に入りの削除に失敗しました' },
      { status: 500 }
    );
  }
}
