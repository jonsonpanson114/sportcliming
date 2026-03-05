import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateText } from '@/lib/gemini/client';
import { createQuizPrompt } from '@/lib/gemini/prompts';

/**
 * POST /api/quiz/[id] - クイズを生成する
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    // 動画を取得
    const video = await prisma.video.findUnique({
      where: { id: params.id },
    });

    if (!video) {
      return NextResponse.json(
        { error: '動画が見つかりません' },
        { status: 404 }
      );
    }

    // すでにクイズがある場合は返す
    const existingQuiz = await prisma.quiz.findFirst({
      where: { videoId: params.id },
    });

    if (existingQuiz) {
      return NextResponse.json({
        question: existingQuiz.question,
        options: JSON.parse(existingQuiz.options),
        answer: existingQuiz.answer,
        cached: true,
      });
    }

    // 字幕が必要
    if (!video.transcript) {
      return NextResponse.json(
        { error: '字幕がありません。字幕を取得してからクイズを生成してください。' },
        { status: 400 }
      );
    }

    // プロンプトを作成
    const prompt = createQuizPrompt(video.title, video.transcript);

    // クイズを生成
    const result = await generateText(prompt);

    // JSONをパース
    const quizData = JSON.parse(result);

    // データベースに保存
    const quiz = await prisma.quiz.create({
      data: {
        videoId: params.id,
        question: quizData.question,
        options: JSON.stringify(quizData.options),
        answer: quizData.answer.toString(),
      },
    });

    return NextResponse.json({
      question: quiz.question,
      options: quizData.options,
      answer: quiz.answer,
      explanation: quizData.explanation,
      cached: false,
    });
  } catch (error) {
    console.error('Quiz API Error:', error);
    return NextResponse.json(
      { error: 'クイズの生成に失敗しました' },
      { status: 500 }
    );
  }
}
