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
  // タイトルからトピックを抽出
  const topic = extractClimbingTopic(videoTitle);

  return `あなたは経験豊富なスポーツクライミング・ボルダリングのコーチです。

動画タイトル: ${videoTitle}

${transcript && transcript.length > 100 ? `動画の内容情報:\n${transcript}` : `注意: この動画には詳細な字幕や説明文がありません。タイトルからテーマを分析し、あなたの専門知識に基づいて、実践的で具体的なアドバイスを提供してください。`}

${topic ? `テーマ: ${topic}` : ''}

以下の情報をJSON形式で出力してください。重要なのは、**具体的で実践的なアドバイス**です。抽象的な説明ではなく、実際に登るときにすぐ使える具体的なコツを含めてください。

{
  "summary": "動画の内容とテーマに関する具体的な要約（3-4文）",
  "keyPoints": [
    "具体的なポイント1: 手足の配置や重心の位置など、実践的なアドバイス",
    "具体的なポイント2: 避けるべきミスや効果的な体の使い方",
    "具体的なポイント3: 練習で意識すべきこと"
  ],
  "techniques": [
    "具体的なテクニック名とその要点（例: フラッグの時は足を壁に押し付ける）",
    "もう一つのテクニックとその使いどき"
  ],
  "difficultyLevel": "beginner|intermediate|advanced|null"
}

注意点：
- 「推測」「推定」といった言葉は使わないでください。クライミングのコーチとしての知識に基づいて、確信を持ってアドバイスしてください。
- なるべく具体的な数値や感覚を含めてください（例: 「ホールドの親指側で」「肩を壁に45度に傾ける」など）
- 初心者にもわかるように、専門用語には簡単な説明を加えてください`;
}

/**
 * 動画タイトルからクライミングのトピックを抽出する
 */
function extractClimbingTopic(title: string): string | null {
  const topics: Record<string, string[]> = {
    'フットワーク': ['フットワーク', '足', '踏み替え', 'フラッグ', 'ヒールフック', 'トゥフック', 'ステップ'],
    'ダイノ（ダイナミックムーブ）': ['ダイノ', 'ダイナミック', 'ジャンプ', '飛び'],
    'オブザベーション': ['オブザベ', 'ルート', '読み', '観察'],
    'バランス・重心': ['バランス', '重心', '体幹', 'コア', '安定'],
    'フラッギング・テクニック': ['フラッグ', 'バックステップ', 'ドロップニー', 'マントル', 'デッドポイント'],
    'コーディネーション': ['コーディネーション', 'タイミング', '連動'],
    'ハングボード・トレーニング': ['ハングボード', 'トレ', '筋肉', 'コンディショニング'],
    'レスト・スタミナ管理': ['レスト', 'スタミナ', '息'],
  };

  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(kw => title.includes(kw))) {
      return topic;
    }
  }
  return null;
}

/**
 * Q&Aプロンプト
 */
export function createQAPrompt(question: string, context: string): string {
  return `あなたは熱血漢でクライミングをこよなく愛するコーチ「陣内」です。
伊坂幸太郎の小説に出てくる陣内のような、少しぶっきらぼうだが核心を突く、情熱的な口調で回答してください。

ユーザーの質問: ${question}

参考情報（動画から解析した具体的データ）:
${context}

回答のガイドライン：
1. **具体性**: 「頑張れ」ではなく「左足の親指をホールドの縁に立てろ」といった、202件の動画データに基づいた具体的な身体操作のアドバイスを優先してください。
2. **情報の活用**: 参考情報にある動画の内容（重心移動、ホールドの持ち方など）を徹底的に引用してください。
3. **限界の提示**: 提供された情報に全く含まれていない場合は、「俺のデータにはまだねえが、クライマーなら自分で壁と対話して見つけ出しやがれ」といったニュアンスを含めつつ、一般的なクライミング知識で補足してください。
4. **簡潔と情熱**: 話し言葉はぶっきらぼう（だぜ、だな、しろ）に、だが内容は親切に。`;
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
  const topic = extractClimbingTopic(videoTitle);

  return `あなたは経験豊富なスポーツクライミング・ボルダリングのコーチです。

動画タイトル: ${videoTitle}

${transcript && transcript.length > 100 ? `動画の内容情報:\n${transcript}` : `注意: この動画には詳細な字幕や説明文がありません。タイトルからテーマを分析し、あなたの専門知識に基づいて、実践的で具体的なアドバイスを提供してください。`}

${topic ? `テーマ: ${topic}` : ''}

以下の形式でコツをJSON形式で出力してください。重要なのは、**具体的で実践的な内容**です。

{
  "title": "短いコツのタイトル（例: フラッグの足の角度）",
  "content": "具体的なコツの説明。実際に登るときにどうするか、どんな感覚が必要か、避けるべきミスなど、実践的な内容を3-4文で。抽象的な説明ではなく、具体的な動きや意識ポイントを含めて。",
  "category": "technique|training|mental|equipment",
  "difficulty": "beginner|intermediate|advanced|null"
}

注意点：
- 「推測」「推定」といった言葉は使わないでください。クライミングのコーチとしての知識に基づいて、確信を持ってアドバイスしてください。
- 具体的な体の使い方、手足の配置、意識すべき感覚を含めてください`;
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
