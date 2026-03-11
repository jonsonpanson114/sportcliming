
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.production' });

async function debugDailyPractice() {
  const url = process.env.DATABASE_URL?.replace('libsql://', 'https://');
  const token = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !token) {
    console.log('No credentials');
    return;
  }

  const client = createClient({ url, authToken: token });

  try {
    const res = await client.execute({
      sql: "SELECT title, summary, summaryData, difficultyLevel FROM Video WHERE summary IS NOT NULL LIMIT 5",
      args: []
    });
    
    console.log("Raw DB Data Samples:");
    res.rows.forEach((row, i) => {
      console.log(`\n--- Video ${i+1} ---`);
      console.log(`Title: ${row.title}`);
      console.log(`Summary: ${row.summary?.substring(0, 30)}...`);
      console.log(`SummaryData: ${row.summaryData}`);
      console.log(`Difficulty: ${row.difficultyLevel}`);
      
      try {
        if (row.summaryData) {
            const parsed = JSON.parse(row.summaryData);
            console.log(`Parsed KeyPoints: ${parsed.keyPoints?.[0]}`);
        } else {
            console.log("SummaryData is null/empty");
        }
      } catch (e) {
        console.log(`JSON parse error: ${e.message}`);
      }
    });

  } catch (e) {
    console.error(e);
  }
}

debugDailyPractice();
