import 'dotenv/config';
import { prisma } from './lib/db/prisma';

async function main() {
  console.log('=== データベースの実際の状態 ===\n');

  // 動画数を確認
  const videoCount = await prisma.video.count();
  console.log(`全動画数: ${videoCount}`);

  // 要約がある動画を確認
  const videosWithSummary = await prisma.video.count({
    where: {
      summary: { not: null },
    },
  });
  console.log(`要約がある動画: ${videosWithSummary}`);

  // 要約がない動画を確認
  const videosWithoutSummary = await prisma.video.count({
    where: {
      summary: null,
    },
  });
  console.log(`要約がない動画: ${videosWithoutSummary}`);

  // サンプル動画の詳細を確認
  const sampleVideos = await prisma.video.findMany({
    take: 3,
    orderBy: { createdAt: 'asc' },
    select: {
      youtubeId: true,
      title: true,
      summary: true,
      summaryData: true,
      transcript: true,
      description: true,
    },
  });

  console.log('\n=== サンプル動画詳細 ===\n');
  sampleVideos.forEach((v, i) => {
    console.log(`\n[${i+1}] ${v.youtubeId}`);
    console.log(`  タイトル: ${v.title.substring(0, 50)}`);
    console.log(`  Summary: ${v.summary ? 'あり (' + v.summary.length + '文字)' : 'なし'}`);
    console.log(`  SummaryData: ${v.summaryData ? 'あり' : 'なし'}`);
    console.log(`  Transcript: ${v.transcript ? 'あり (' + v.transcript?.length + '文字)' : 'なし'}`);
    console.log(`  Description: ${v.description ? 'あり (' + v.description?.length + '文字)' : 'なし'}`);
  });

  // コツ（Tips）を確認
  const tipCount = await prisma.tip.count();
  console.log(`\n保存されているコツ: ${tipCount}`);

  await prisma.$disconnect();
}

main().catch(console.error);
