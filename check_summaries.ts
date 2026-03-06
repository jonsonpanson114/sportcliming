import { prisma } from './lib/db/prisma';

async function main() {
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      youtubeId: true,
      title: true,
      summary: true,
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('ID\tYouTube\t\tHas Summary\tTitle');
  console.log('-------------------------------------------------------');
  for (const v of videos) {
    const title = v.title?.substring(0, 30) || '';
    const hasSum = v.summary ? 'YES' : 'NO';
    console.log(`${v.id.substring(0, 10)}\t${v.youtubeId}\t${hasSum}\t${title}`);
  }
}

main().catch(console.error);
