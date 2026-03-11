import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

/**
 * GET /api/stats - 統計情報を取得する
 */
export async function GET() {
  try {
    const db = getPrisma();
    const [videoCount, processedCount, tipCount, recordCount] = await Promise.all([
      db.video.count(),
      db.video.count({
        where: {
          NOT: {
            summary: null,
          },
        },
      }),
      db.tip.count(),
      db.practiceRecord.count(),
    ]);

    return NextResponse.json({
      videos: videoCount,
      processed: processedCount,
      tips: tipCount,
      records: recordCount,
      streak: 7, // 継続日数は現状ロジックがないため、一旦固定か簡易計算が必要。
      // 実際には練習記録の日付から計算するべきだが、まずは解析済み件数を強調する。
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
