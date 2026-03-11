
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function run() {
  const url = process.env.DATABASE_URL?.replace('libsql://', 'https://');
  const token = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient({ url, authToken: token });
  
  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables in DB:", res.rows.map(row => row.name));
  
  const videoCount = await client.execute("SELECT count(*) as count FROM Video");
  console.log("Videos remain:", videoCount.rows[0].count);
}

run();
