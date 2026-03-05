import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// モデル選択
export const MODEL = 'gemini-2.0-flash';

/**
 * Geminiモデルを取得する
 */
export function getModel() {
  return genAI.getGenerativeModel({ model: MODEL });
}

/**
 * テキスト生成を行う
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('テキスト生成に失敗しました');
  }
}

/**
 * ストリーミングでテキスト生成を行う
 */
export async function generateTextStream(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const model = getModel();
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('テキスト生成に失敗しました');
  }
}

/**
 * JSON出力を強制したプロンプトを作成する
 */
export function createJsonPrompt<T>(prompt: string, schema: Record<string, unknown>): string {
  return `${prompt}

重要：出力は必ず以下のJSON形式で返してください。他のテキストは含めないでください。

${JSON.stringify(schema, null, 2)}`;
}

/**
 * JSONとして解析する
 */
export function parseJsonResponse<T>(text: string): T | null {
  try {
    // JSONブロックを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return null;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return null;
  }
}
