import { prisma } from './lib/db/prisma';
import { generateText, parseJsonResponse } from './lib/gemini/client';
import { createSummaryPrompt, type SummaryResult, createTipExtractionPrompt } from './lib/gemini/prompts';

interface TipResult {
  title: string;
  content: string;
  category: string;
  difficulty: string | null;
}

async function regenerateVideo(videoId: string, youtubeId: string, title: string, description: string | null) {
  console.log(`\n=== Processing: ${title.substring(0, 50)}... ===`);

  // transcriptが不足する場合はdescriptionを使用
  const contentForSummary = `${title}\n\n${description || ''}`;

  // 要約を生成
  console.log('[1/2] Generating summary...');
  const summaryPrompt = createSummaryPrompt(title, contentForSummary);
  const summaryResultText = await generateText(summaryPrompt);
  const summaryResult = parseJsonResponse<SummaryResult>(summaryResultText);

  if (summaryResult) {
    // 動画を更新
    await prisma.video.update({
      where: { id: videoId },
      data: {
        summary: summaryResult.summary,
        summaryData: JSON.stringify(summaryResult),
        difficultyLevel: summaryResult.difficultyLevel,
      },
    });
    console.log(`  ✓ Summary generated: ${summaryResult.summary.substring(0, 50)}...`);
    console.log(`  ✓ Difficulty: ${summaryResult.difficultyLevel}`);
  } else {
    console.log(`  ✗ Failed to parse summary result`);
    return false;
  }

  // コツを抽出
  console.log('[2/2] Extracting tips...');
  const tipPrompt = createTipExtractionPrompt(title, contentForSummary);
  const tipResultText = await generateText(tipPrompt);
  const tipResult = parseJsonResponse<TipResult>(tipResultText);

  if (tipResult) {
    // コツを保存
    await prisma.tip.upsert({
      where: { id: `${youtubeId}-tip` },
      update: {
        title: tipResult.title,
        content: tipResult.content,
        category: tipResult.category,
        difficulty: tipResult.difficulty,
        videoIds: JSON.stringify([youtubeId]),
      },
      create: {
        id: `${youtubeId}-tip`,
        title: tipResult.title,
        content: tipResult.content,
        category: tipResult.category,
        difficulty: tipResult.difficulty,
        videoIds: JSON.stringify([youtubeId]),
      },
    });
    console.log(`  ✓ Tip: ${tipResult.title}`);
  } else {
    console.log(`  ✗ Failed to parse tip result`);
  }

  return true;
}

async function main() {
  console.log('Starting video regeneration...\n');

  const videos = await prisma.video.findMany({
    select: {
      id: true,
      youtubeId: true,
      title: true,
      description: true,
      summary: true,
    },
  });

  console.log(`Found ${videos.length} videos in database.\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    console.log(`[${i + 1}/${videos.length}]`, video.title);

    try {
      const result = await regenerateVideo(
        video.id,
        video.youtubeId,
        video.title,
        video.description
      );

      if (result) {
        success++;
      } else {
        failed++;
      }

      // API制限回避のために少し待つ
      if (i < videos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ✗ Error:`, error);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${videos.length}`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);

  await prisma.$disconnect();
}

main().catch(console.error);
