export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  techniques: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null;
}

export interface QuizResult {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface PracticeMenuResult {
  exercises: {
    name: string;
    description: string;
    duration: string;
  }[];
}

/**
 * 動画要約プロンプト
 */
export function createSummaryPrompt(videoTitle: string, transcript: string): string {
  return `あなたはクライミングのコーチです。以下の動画内容を分析して、日本語で要約してください。

動画タイトル: ${videoTitle}

動画字幕:
${transcript}

以下の情報をJSON形式で出力してください：
{
  "summary": "動画の要約（2-3文程度）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", "重要なポイント3"],
  "techniques": ["紹介されているテクニック1", "テクニック2"],
  "difficultyLevel": "beginner|intermediate|advanced|null"
}`;
}

/**
 * Q&Aプロンプト
 */
export function createQAPrompt(question: string, context: string): string {
  return `あなたはクライミングのコーチです。以下の情報に基づいて、ユーザーの質問に日本語で答えてください。

ユーザーの質問: ${question}

参考情報（動画の内容）:
${context}

重要：
- 提供された情報のみを使用して回答してください
- 情報に含まれていない質問には、「申し訳ありませんが、提供された情報にはその内容が含まれていません」と答えてください
- 回答は簡潔で実用的にしてください
- 関連する動画IDがある場合は、それを引用してください`;
}

/**
 * 練習メニュープロンプト
 */
export function createPracticeMenuPrompt(userLevel?: string, recentVideos?: string): string {
  return `あなたはクライミングのコーチです。今日の練習メニューを作成してください。

${userLevel ? `ユーザーのレベル: ${userLevel}` : ''}
${recentVideos ? `最近見た動画の内容: ${recentVideos}` : ''}

以下の練習メニューをJSON形式で出力してください：
{
  "exercises": [
    {
      "name": "練習の名前",
      "description": "練習の詳細な説明",
      "duration": "15分"  // 各練習の目標時間
    }
  ]
}

3-5つの練習メニューを作成してください。各練習は具体的で実用的な内容にしてください。`;
}

/**
 * クイズ生成プロンプト
 */
export function createQuizPrompt(videoTitle: string, transcript: string): string {
  return `あなたはクライミングのコーチです。以下の動画内容に基づいて、理解度確認のためのクイズを作成してください。

動画タイトル: ${videoTitle}

動画内容:
${transcript}

以下の形式でクイズをJSON形式で出力してください：
{
  "question": "クイズの問題文",
  "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "answer": 0,  // 正解の選択肢のインデックス（0-3）
  "explanation": "解説"
}

クイズは動画の内容を理解しているかを確認するものであり、実用的で具体的な内容にしてください。`;
}

/**
 * コツ抽出プロンプト
 */
export function createTipExtractionPrompt(videoTitle: string, transcript: string): string {
  return `あなたはクライミングのコーチです。以下の動画内容から重要なコツを抽出してください。

動画タイトル: ${videoTitle}

動画内容:
${transcript}

以下の形式でコツをJSON形式で出力してください：
{
  "title": "コツのタイトル",
  "content": "コツの詳細な説明",
  "category": "technique|training|mental|equipment",
  "difficulty": "beginner|intermediate|advanced|null"
}`;
}

/**
 * 難易度判定プロンプト
 */
export function createDifficultyAssessmentPrompt(videoTitle: string, transcript: string): string {
  return `あなたはクライミングのコーチです。以下の動画の難易度を判定してください。

動画タイトル: ${videoTitle}

動画内容:
${transcript}

以下の情報をJSON形式で出力してください：
{
  "difficultyLevel": "beginner|intermediate|advanced|null",
  "reasoning": "難易度判定の理由"
}`;
}
