import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/search - 動画を検索する
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: '検索キーワードが必要です' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // タイトルと要約から検索
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { summary: { contains: query } },
          ],
        },
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.video.count({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { summary: { contains: query } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      videos,
      query,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: '検索に失敗しました' },
      { status: 500 }
    );
  }
}
