import { getVideoById } from '../youtube/client';
import { Video } from '@prisma/client';
import { generateText } from './client';
import { createQAPrompt } from './prompts';
import { prisma } from '../db/prisma';

/**
 * 関連する動画を検索する
 */
export async function retrieveRelevantContext(
  question: string,
  limit: number = 5
): Promise<{ videos: Video[]; context: string }> {
  try {
    // 簡単なキーワード検索
    const keywords = extractKeywords(question);

    // 動画タイトルや要約から関連する動画を探す
    const allVideos = await prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: keywords[0] || '' } },
          { summary: { contains: keywords[0] || '' } },
        ],
      },
      take: limit,
    });

    // コンテキストを作成
    const context = allVideos
      .map((video: any) => `動画: ${video.title}\n要約: ${video.summary || 'なし'}\n`)
      .join('\n');

    return {
      videos: allVideos,
      context,
    };
  } catch (error) {
    console.error('RAG Error:', error);
    return { videos: [], context: '' };
  }
}

/**
 * 質問からキーワードを抽出する
 */
function extractKeywords(question: string): string[] {
  // 簡単なキーワード抽出（実装は改善可能）
  const keywords = question
    .split(/[\s、。、？?！!]+/)
    .filter((word: string) => word.length > 1);

  return keywords.slice(0, 3);
}

/**
 * RAGによるQ&A回答生成
 */
export async function answerQuestionWithRAG(question: string): Promise<{
  answer: string;
  sources: string[];
  confidence: number;
}> {
  try {
    // 関連するコンテキストを取得
    const { videos, context } = await retrieveRelevantContext(question);

    if (context.length === 0) {
      return {
        answer: '申し訳ありませんが、提供された情報にはその内容が含まれていません。別の質問をお試しください。',
        sources: [],
        confidence: 0,
      };
    }

    // プロンプトを作成
    const prompt = createQAPrompt(question, context);

    // 回答を生成
    const answer = await generateText(prompt);

    // ソースを取得
    const sources = videos.map((v: any) => v.youtubeId);

    // 信頼度を計算（簡易版）
    const confidence = videos.length >= 2 ? 0.8 : videos.length === 1 ? 0.6 : 0.4;

    return {
      answer,
      sources,
      confidence,
    };
  } catch (error) {
    console.error('RAG Answer Error:', error);
    throw new Error('回答生成に失敗しました');
  }
}
