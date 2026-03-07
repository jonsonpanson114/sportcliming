import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

/**
 * GET /api/records - 練習記録一覧を取得する
 */
export async function GET() {
  try {
    const records = await getPrisma().practiceRecord.findMany({
      orderBy: { date: 'desc' },
      take: 50,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Records API Error:', error);
    return NextResponse.json(
      { error: '練習記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/records - 練習記録を作成する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gymName, duration, practiceMenuId, videoId, routes, reflection, nextGoal } = body;

    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      return NextResponse.json(
        { error: '課題情報が必要です' },
        { status: 400 }
      );
    }

    const record = await getPrisma().practiceRecord.create({
      data: {
        gymName,
        duration,
        practiceMenuId,
        videoId,
        routes: JSON.stringify(routes),
        reflection,
        nextGoal,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Records API Error:', error);
    return NextResponse.json(
      { error: '練習記録の作成に失敗しました' },
      { status: 500 }
    );
  }
}
