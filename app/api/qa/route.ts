import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { answerQuestionWithRAG } from '@/lib/gemini/rag';

/**
 * POST /api/qa - Q&Aに質問する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: '質問が必要です' },
        { status: 400 }
      );
    }

    // RAGで回答を生成
    const { answer, sources, confidence } = await answerQuestionWithRAG(question);

    // セッションを保存
    await prisma.qASession.create({
      data: {
        question,
        answer,
        sources: JSON.stringify(sources),
      },
    });

    return NextResponse.json({
      answer,
      sources,
      confidence,
    });
  } catch (error) {
    console.error('QA API Error:', error);
    return NextResponse.json(
      { error: '回答の生成に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
