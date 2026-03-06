import 'dotenv/config';
import { prisma } from './lib/db/prisma';
import { generateText, parseJsonResponse } from './lib/gemini/client';
import { createSummaryPrompt, type SummaryResult } from './lib/gemini/prompts';

// サマリーがない動画のID
const videoIds = [
  'cmmdhtdp50002k0g5dju0gpml',  // キッズクライマーのためのコアコンディショニング
  'cmmdhulgk0003k0g54i5v9s4y',  // コーディネーションのコツ
  'cmmdhv0r80004k0g5cxm98l22',  // キッズのコンプレッション課題
  'cmmdhvfym0005k0g5rj49xpff',  // キッズクライマーあるあるの癖を治す
];

async function main() {
  console.log('サマリー再生成を開始します...');

  for (const videoId of videoIds) {
    try {
      console.log(`\n処理中: ${videoId}`);

      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        console.log(`  スキップ: 動画が見つかりません`);
        continue;
      }

      if (video.summary) {
        console.log(`  スキップ: すでにサマリーがあります`);
        continue;
      }

      // トランスクリプトを設定（タイトル+説明文）
      const transcript = video.title + '\n\n' + (video.description || '');
      await prisma.video.update({
        where: { id: videoId },
        data: { transcript },
      });

      // サマリー生成
      const prompt = createSummaryPrompt(video.title, transcript);
      const summaryResultText = await generateText(prompt);
      const summaryResult = parseJsonResponse<SummaryResult>(summaryResultText);

      if (!summaryResult) {
        console.log(`  エラー: サマリー生成に失敗`);
        continue;
      }

      // データベースに保存
      await prisma.video.update({
        where: { id: videoId },
        data: {
          summary: summaryResult.summary,
          summaryData: JSON.stringify(summaryResult),
          difficultyLevel: summaryResult.difficultyLevel,
        },
      });

      console.log(`  完了: ${video.title.substring(0, 40)}...`);
    } catch (error) {
      console.error(`  エラー: ${videoId}`, error);
    }
  }

  console.log('\nすべて完了しました！');
}

main().catch(console.error);
