import { NextResponse } from 'next/server';

/**
 * GET /api/daily-practice - 今日の練習メニューを返す（サンプル版）
 */
export async function GET() {
  try {
    const currentHour = new Date().getHours();

    // 時間帯（午前6時〜12時、午後6時〜12時）
    const timeOfDay = currentHour < 12 ? 'morning' : (currentHour < 18 ? 'afternoon' : 'evening');

    // サンプルメニュー
    const sampleMenus = {
      morning: [
        {
          greeting: 'おはようこそ！午前から始めましょう。',
          dailyMenu: [
            {
              name: 'ウォームアップ',
              description: '関節回転・肩回し・軽いストレッチ',
              duration: '10分',
              category: 'warmup',
              difficulty: 'beginner',
            },
            {
              name: 'フラッグ練習',
              description: '壁を使ったバランス保持の練習。足を壁に当てて、手が休めるポジションを作る',
              duration: '15分',
              category: 'technique',
              difficulty: 'beginner',
            },
            {
              name: 'ダイノ練習',
              description: '跳び出しのタイミングとキャッチの練習。低いホールドから始めて、徐々に高さを上げる',
              duration: '20分',
              category: 'technique',
              difficulty: 'intermediate',
            },
          ],
          tips: [
            'ウォームアップをしっかり行って、怪我を防ぎましょう',
            'テクニック練習では、質より回数を重視してください',
            '新しいテクニックを学ぶときは、まずは低い強度で試しましょう',
          ],
        },
      ],
      afternoon: [
        {
          greeting: '午後も頑張りました！',
          dailyMenu: [
            {
              name: 'ハングボード',
              description: '指先のトレーニング。各フックの保持力を向上させる',
              duration: '15分',
              category: 'strength',
              difficulty: 'beginner',
            },
            {
              name: 'スタミナトレーニング',
              description: '壁足4点キープとマントルの練習',
              duration: '20分',
              category: 'endurance',
              difficulty: 'intermediate',
            },
          ],
          tips: [
            'ハングボードでは、握力とテクニックは別です。握力を重視しながら良い効果が得られます',
            '各フックの後にストレッチを取り入れてください',
          ],
        },
      ],
      evening: [
        {
          greeting: '夜も頑張しましょう！',
          dailyMenu: [
            {
              name: 'スレッチ',
              description: '筋肉を回復させる。激しいセッションの後にプロテインを取り入れましょう',
              duration: '15分',
              category: 'endurance',
              difficulty: 'intermediate',
            },
            {
              name: 'スタミナトレーニング',
              description: 'バランスとリカバリーを向上させる。ヨガで体幹を意識して、怪我を防ぎましょう',
              duration: '20分',
              category: 'endurance',
              difficulty: 'beginner',
            },
          ],
          tips: [
            'スレッチをした後は、十分に水分をとってください',
            '各ムーブの後にストレッチを入れて、怪我を防ぎましょう',
          ],
        },
      ],
    };

    return NextResponse.json(sampleMenus[timeOfDay] || sampleMenus.morning);
  } catch (error) {
    console.error('Daily Practice API Error:', error);
    return NextResponse.json(
      { error: '練習メニューの取得に失敗しました' },
      { status: 500 }
    );
  }
}
