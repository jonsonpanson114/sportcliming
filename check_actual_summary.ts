import { prisma } from './lib/db/prisma';

async function main() {
  // 最初の3つの動画の詳細を確認
  const videos = await prisma.video.findMany({
    take: 3,
    orderBy: { createdAt: 'asc' },
    select: {
      youtubeId: true,
      title: true,
      transcript: true,
      summary: true,
      description: true,
    },
  });

  console.log('=== 動画データの実際の内容 ===\n');

  for (const v of videos) {
    console.log(`\n--- ${v.title.substring(0, 40)}... ---`);
    console.log(`YouTube ID: ${v.youtubeId}`);
    console.log(`\nTranscript (${v.transcript?.length || 0} chars):`);
    console.log(`"${v.transcript}"`);
    console.log(`\nDescription (${v.description?.length || 0} chars):`);
    console.log(`"${v.description?.substring(0, 200)}..."`);
    console.log(`\nSummary (${v.summary?.length || 0} chars):`);
    console.log(`"${v.summary?.substring(0, 200)}..."`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
