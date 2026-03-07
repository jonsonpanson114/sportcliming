import { prisma } from './lib/db/prisma';

async function main() {
  const videos = await prisma.video.findMany({
    select: {
      youtubeId: true,
      title: true,
      summary: true,
      transcript: true,
      difficultyLevel: true,
    },
  });

  console.log(`Total videos: ${videos.length}`);
  console.log(`Videos with summary: ${videos.filter(v => v.summary).length}`);
  console.log(`Videos with transcript: ${videos.filter(v => v.transcript).length}`);

  videos.forEach((v, i) => {
    console.log(`\n${i + 1}. ${v.youtubeId} - ${v.title.substring(0, 50)}...`);
    console.log(`   Summary: ${v.summary ? 'YES' : 'NO'}`);
    console.log(`   Transcript: ${v.transcript ? 'YES (' + v.transcript.length + ' chars)' : 'NO'}`);
    console.log(`   Difficulty: ${v.difficultyLevel || 'null'}`);
  });

  const tips = await prisma.tip.findMany();
  console.log(`\nTotal tips: ${tips.length}`);

  await prisma.$disconnect();
}

main().catch(console.error);
