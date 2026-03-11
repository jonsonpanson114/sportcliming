const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.production' });

// lib/gemini/rag.ts のロジックを模擬
function extractKeywords(question) {
  const stopWords = ['教えて', 'とは', 'どうやって', 'やり方', 'コツ', 'について', 'ください', 'の']; // 'の' を追加
  let cleaned = question;
  stopWords.forEach(sw => { cleaned = cleaned.replace(new RegExp(sw, 'g'), ''); });
  const keywords = cleaned.split(/[\s、。、？?！!]+/).filter(word => word.length >= 1);
  return keywords.slice(0, 5);
}

async function deepVerify() {
  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  const adapter = new PrismaLibSql({ url: dbUrl, authToken });
  const prisma = new PrismaClient({ adapter });

  try {
    const question = "ダイノのコツを教えて";
    const keywords = extractKeywords(question);
    console.log('Question:', question);
    console.log('Extracted Keywords:', keywords);

    const OR = keywords.flatMap(kw => [
      { title: { contains: kw } },
      { summary: { contains: kw } },
      { summaryData: { contains: kw } }
    ]);

    const videos = await prisma.video.findMany({
      where: { OR },
      take: 5
    });

    console.log(`\nHit Count: ${videos.length}`);
    
    for (const v of videos) {
      console.log(`\n--- Video: ${v.title} [${v.youtubeId}] ---`);
      console.log(`Summary: ${v.summary}`);
      console.log(`SummaryData: ${v.summaryData}`);
    }

    if (videos.length > 0) {
      const context = videos.map(v => {
        let details = v.summary || 'なし';
        if (v.summaryData) {
            try {
                const parsed = JSON.parse(v.summaryData);
                if (parsed.keyPoints) details += `\nポイント: ${parsed.keyPoints.join(', ')}`;
                if (parsed.techniques) details += `\nテクニック: ${parsed.techniques.join(', ')}`;
            } catch (e) { details += `\n詳細情報: ${v.summaryData}`; }
        }
        return `動画: ${v.title}\n内容: ${details}\n`;
      }).join('\n');
      
      console.log('\n--- Context Sent to Gemini ---');
      console.log(context);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

deepVerify();
