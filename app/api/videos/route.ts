import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

/**
 * GET /api/videos - 動画一覧を取得する
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) {
      // categoryフィルター
      where.category = category;
    }
    if (level) {
      // difficultyLevelフィルター
      where.difficultyLevel = level;
    }

    const db = getPrisma();
    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      db.video.count({ where }),
    ]);

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Videos API Error:', error);
    return NextResponse.json(
      { error: '動画の取得に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
