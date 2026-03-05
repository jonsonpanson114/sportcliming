import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateText } from '@/lib/gemini/client';
import { createSummaryPrompt } from '@/lib/gemini/prompts';

/**
 * POST /api/summary - 動画要約を生成する
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

    // 動画を取得
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: '動画が見つかりません' },
        { status: 404 }
      );
    }

    // すでに要約があれば返す
    if (video.summary) {
      return NextResponse.json({
        summary: video.summary,
        summaryData: video.summaryData ? JSON.parse(video.summaryData) : null,
        cached: true,
      });
    }

    // 字幕がない場合はエラー
    if (!video.transcript) {
      return NextResponse.json(
        { error: '字幕が利用できません。字幕を取得してから要約を生成してください。' },
        { status: 400 }
      );
    }

    // プロンプトを作成
    const prompt = createSummaryPrompt(video.title, video.transcript);

    // 要約を生成
    const result = await generateText(prompt);

    // データベースに保存
    await prisma.video.update({
      where: { id: videoId },
      data: {
        summary: result,
        summaryData: result, // JSONとして保存
      },
    });

    return NextResponse.json({
      summary: result,
      cached: false,
    });
  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json(
      { error: '要約の生成に失敗しました' },
      { status: 500 }
    );
  }
}
