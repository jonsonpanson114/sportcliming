import 'dotenv/config';
import { prisma } from './lib/db/prisma';

async function main() {
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      youtubeId: true,
      title: true,
      summary: true,
      difficultyLevel: true,
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('ID\tYouTube\t\tLevel\tHas Summary\tTitle');
  console.log('-------------------------------------------------------');
  for (const v of videos) {
    const title = v.title?.substring(0, 25) || '';
    const level = v.difficultyLevel || '-';
    const hasSum = v.summary ? 'YES' : 'NO';
    console.log(`${v.id.substring(0, 10)}\t${v.youtubeId}\t${level}\t${hasSum}\t${title}`);
  }

  const completed = videos.filter(v => v.summary).length;
  console.log(`\n総計: ${videos.length}件 | 完了: ${completed}件`);
}

main().catch(console.error);
