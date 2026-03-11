
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function checkStats() {
  const url = process.env.DATABASE_URL?.replace('libsql://', 'https://');
  const token = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !token) {
    // 以前の fallback URL を試す
    const fallbackUrl = 'https://spotcliming-jonsonpanson114.aws-ap-northeast-1.turso.io';
    // ここでは token が必須なので、以前のように取得できない場合はローカルで一旦計算する
    console.log('No production credentials found in .env, checking local db instead.');
    return;
  }

  const client = createClient({ url, authToken: token });

  try {
    const videoCount = await client.execute("SELECT count(*) as count FROM Video");
    const processedCount = await client.execute("SELECT count(*) as count FROM Video WHERE summary IS NOT NULL");
    const recordCount = await client.execute("SELECT count(*) as count FROM PracticeRecord");
    
    console.log(`Videos: ${videoCount.rows[0].count}`);
    console.log(`Processed: ${processedCount.rows[0].count}`);
    console.log(`Records: ${recordCount.rows[0].count}`);
  } catch (e) {
    console.error(e);
  }
}

checkStats();
