import { generateText } from './client';
import { createQAPrompt } from './prompts';
import { getPrisma } from '../db/prisma';

/**
 * 関連する動画を検索する
 */
export async function retrieveRelevantContext(
  question: string,
  limit: number = 5
): Promise<{ videos: any[]; context: string }> {
  try {
    // 強化されたキーワード検索
    const keywords = extractKeywords(question);
    const OR = keywords.flatMap(kw => [
      { title: { contains: kw } },
      { summary: { contains: kw } },
      { summaryData: { contains: kw } }
    ]);

    // 動画タイトルや要約から関連する動画を探す
    const allVideos = await getPrisma().video.findMany({
      where: { OR },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    // コンテキストを作成（詳細データを含める）
    const context = allVideos
      .map((video: any) => {
        let details = video.summary || 'なし';
        if (video.summaryData) {
          try {
            const parsed = typeof video.summaryData === 'string' ? JSON.parse(video.summaryData) : video.summaryData;
            
            // keyPoints を展開
            if (parsed.keyPoints && Array.isArray(parsed.keyPoints)) {
              details += `\nポイント: ${parsed.keyPoints.map((p: any) => typeof p === 'object' ? (p.title || p.description || JSON.stringify(p)) : p).join(', ')}`;
            }
            
            // techniques を展開 (object の場合も考慮)
            if (parsed.techniques && Array.isArray(parsed.techniques)) {
              details += `\nテクニック: ${parsed.techniques.map((t: any) => typeof t === 'object' ? `${t.name || t.title}: ${t.description || ''}` : t).join(', ')}`;
            }
          } catch (e) {
            // fallback to raw if parse fails
            details += `\n詳細情報: ${video.summaryData}`;
          }
        }
        return `動画: ${video.title}\n内容: ${details}\n`;
      })
      .join('\n');

    return {
      videos: allVideos,
      context,
      keywords,
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
  // 不要な言葉や助詞を徹底的に除外
  const stopWords = [
    '教えて', 'とは', 'どうやって', 'やり方', 'コツ', 'について', 'ください', 'ありますか', 
    'の', 'は', 'が', 'を', 'に', 'へ', 'と', 'で', 'も', 'だ', 'か', 'な'
  ];
  
  let cleaned = question;
  // 長い単語から先に置換
  stopWords.sort((a, b) => b.length - a.length).forEach(sw => { 
    cleaned = cleaned.replace(new RegExp(sw, 'g'), ' '); 
  });

  const keywords = cleaned
    .split(/[\s、。、？?！!]+/)
    .filter((word: string) => word.length >= 1);

  // もしキーワードが空になったら元のクエリから抽出を試みる
  if (keywords.length === 0) {
    return [question.substring(0, 10)];
  }

  return keywords.slice(0, 8); // キーワード数を増やしてヒット率を上げる
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
    // コンテキストを取得
    const { videos, context, keywords } = await retrieveRelevantContext(question);

    if (context.length === 0) {
      return {
        answer: `申し訳ありませんが、提供された情報（キーワード: ${keywords.join(', ')}) にはその内容が含まれていません。別の質問をお試しください。`,
        sources: [],
        confidence: 0,
      };
    }

    // プロンプトを作成
    const prompt = createQAPrompt(question, context);

    try {
      // 回答を生成
      const answer = await generateText(prompt);

      // ソースを取得
      const sources = videos.map((v: any) => v.youtubeId);

      // 信頼度を計算
      const confidence = videos.length >= 2 ? 0.8 : videos.length === 1 ? 0.6 : 0.4;

      return {
        answer,
        sources,
        confidence,
      };
    } catch (genError) {
      const msg = genError instanceof Error ? genError.message : String(genError);
      throw new Error(`AI生成フェーズで失敗: ${msg} (Context: ${context.length} chars, Videos: ${videos.length})`);
    }
  } catch (error) {
    console.error('RAG Answer Error:', error);
    throw new Error(`RAG回答生成の全体プロセスで失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}
