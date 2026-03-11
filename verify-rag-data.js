const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.production' });

async function verify() {
  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  console.log('Target DB:', dbUrl);

  const adapter = new PrismaLibSql({
    url: dbUrl,
    authToken: authToken
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const keywords = ['ダイノ', 'ジャンプ', '飛び'];
    console.log('Searching for:', keywords);

    const results = await prisma.video.findMany({
      where: {
        OR: keywords.flatMap(kw => [
          { title: { contains: kw } },
          { summary: { contains: kw } },
          { summaryData: { contains: kw } }
        ])
      },
      take: 5
    });

    console.log(`Found ${results.length} results.`);
    results.forEach(v => {
      console.log(`- [${v.youtubeId}] ${v.title}`);
      // console.log(`  SummaryData head: ${v.summaryData?.substring(0, 100)}`);
    });

    if (results.length === 0) {
      console.log('No matches found. Checking total records...');
      const count = await prisma.video.count();
      console.log('Total videos in DB:', count);
      
      const sample = await prisma.video.findFirst();
      console.log('Sample video titles/content check:', sample ? sample.title : 'None');
    }

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
