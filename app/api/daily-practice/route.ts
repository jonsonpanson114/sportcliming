import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

/**
 * GET /api/daily-practice - 今日の練習メニューをDBから取得する
 */
export async function GET() {
  try {
    const db = getPrisma();
    
    // 要約がある動画からランダムに3件抽出
    // Prisma でランダム取得は少し工夫が必要なので、一度IDを取得してからランダムに選ぶか、
    // 件数が少なければ全体から取得する。今回は200件程度なので findMany で取得してシャッフルする。
    const videos = await db.video.findMany({
      where: {
        NOT: {
          summary: null,
        },
      },
      select: {
        title: true,
        summary: true,
        summaryData: true,
        difficultyLevel: true,
      },
      take: 50, // 直近50件から選ぶ
    });

    if (videos.length === 0) {
      return NextResponse.json({ greeting: 'まだ解析済みの動画がありません。', dailyMenu: [] });
    }

    // シャッフルして3つ選ぶ
    const shuffled = videos.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const dailyMenu = selected.map((v: any) => {
      let summaryData = null;
      try {
        summaryData = v.summaryData ? JSON.parse(v.summaryData) : null;
      } catch (e) {
        console.error('Failed to parse summaryData:', e);
      }
      return {
        name: v.title.length > 20 ? v.title.substring(0, 20) + '...' : v.title,
        description: summaryData?.keyPoints?.[0] || v.summary?.substring(0, 50) || '具体的な解説は詳細をチェック',
        duration: '15-20分',
        category: 'technique',
        difficulty: v.difficultyLevel || 'beginner',
      };
    });

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'おはようこそ！最高のセッションを始めようぜ。' : (currentHour < 18 ? 'お疲れ！午後もパルスを上げていこう。' : '夜のクライミングは集中力だ。');

    return NextResponse.json({
      greeting,
      dailyMenu,
      tips: [
        '動画で動きのイメージを焼き付けてから登るのがコツだ。',
        '無理は禁物だ。怪我をしたら元も子もないからな。',
        'AIコーチの要約を読み込んで、ムーブを再構成してみろ。'
      ]
    });
  } catch (error) {
    console.error('Daily Practice API Error:', error);
    return NextResponse.json(
      { error: '練習メニューの取得に失敗しました' },
      { status: 500 }
    );
  }
}
