
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.production' });

async function testProductionLogic() {
  const url = process.env.DATABASE_URL?.replace('libsql://', 'https://');
  const token = process.env.DATABASE_AUTH_TOKEN;

  console.log(`Testing with URL: ${url}`);
  const client = createClient({ url, authToken: token });

  try {
    // api/stats logic
    const videoCount = await client.execute("SELECT count(*) as count FROM Video");
    const processedCount = await client.execute("SELECT count(*) as count FROM Video WHERE summary IS NOT NULL");
    const tipCount = await client.execute("SELECT count(*) as count FROM Tip");
    
    console.log("\n--- Stats Result ---");
    console.log(`Total Videos: ${videoCount.rows[0].count}`);
    console.log(`Processed: ${processedCount.rows[0].count}`);
    console.log(`Tips: ${tipCount.rows[0].count}`);

    // api/daily-practice logic
    const videos = await client.execute("SELECT title, summaryData FROM Video WHERE summary IS NOT NULL LIMIT 3");
    console.log("\n--- Daily Practice Sample ---");
    videos.rows.forEach(r => console.log(`- ${r.title}`));

  } catch (e) {
    console.error("Connection Failed:", e);
  }
}

testProductionLogic();
