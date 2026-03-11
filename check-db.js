const { PrismaClient } = require('@prisma/client');

// Local SQLite database (file:./dev.db)
const prisma = new PrismaClient();

async function check() {
  try {
    const total = await prisma.video.count();
    const withSummary = await prisma.video.count({
      where: {
        summary: { not: null }
      }
    });
    const tips = await prisma.tip.count();

    console.log('--- DB Status ---');
    console.log(`Total Videos: ${total}`);
    console.log(`Videos with Summary: ${withSummary}`);
    console.log(`Total Tips: ${tips}`);

    if (total > 0) {
      const sample = await prisma.video.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: { title: true, summary: true, updatedAt: true }
      });
      console.log('\n--- Recent Videos ---');
      sample.forEach((v, i) => {
        console.log(`${i+1}. ${v.title} (Summary: ${v.summary ? 'Yes' : 'No'}, Updated: ${v.updatedAt})`);
      });
    }
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
