import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateText } from '@/lib/gemini/client';
import { createPracticeMenuPrompt } from '@/lib/gemini/prompts';

/**
 * POST /api/practice - 今日の練習メニューを生成する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, recentVideos } = body;

    // 直近の動画内容を取得
    let recentContent = '';
    if (recentVideos && recentVideos.length > 0) {
      const videos = await prisma.video.findMany({
        where: {
          id: { in: recentVideos },
        },
        select: { title: true, summary: true },
      });

      recentContent = videos.map((v: any) => `${v.title}: ${v.summary || ''}`).join('\n');
    }

    // プロンプトを作成
    const prompt = createPracticeMenuPrompt(level, recentContent);

    // 練習メニューを生成
    const result = await generateText(prompt);

    // データベースに保存
    const practiceMenu = await prisma.practiceMenu.create({
      data: { content: result },
    });

    return NextResponse.json({
      id: practiceMenu.id,
      content: result,
    });
  } catch (error) {
    console.error('Practice API Error:', error);
    return NextResponse.json(
      { error: '練習メニューの生成に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/practice - 最新の練習メニューを取得する
 */
export async function GET() {
  try {
    const practiceMenu = await prisma.practiceMenu.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!practiceMenu) {
      return NextResponse.json({
        content: null,
        message: '練習メニューがありません。生成してください。',
      });
    }

    return NextResponse.json({
      id: practiceMenu.id,
      content: practiceMenu.content,
    });
  } catch (error) {
    console.error('Practice API Error:', error);
    return NextResponse.json(
      { error: '練習メニューの取得に失敗しました' },
      { status: 500 }
    );
  }
}
