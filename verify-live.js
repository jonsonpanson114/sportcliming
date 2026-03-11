
const https = require('https');

async function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`--- ${url} ---`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Data: ${data.substring(0, 500)}`);
        resolve();
      });
    }).on('error', (e) => {
      console.log(`Error checking ${url}: ${e.message}`);
      resolve();
    });
  });
}

async function run() {
  const baseUrl = 'https://sportcliming-axe7gjfyf-jonsonpanson114s-projects.vercel.app';
  await check(baseUrl + '/api/stats');
  await check(baseUrl + '/api/daily-practice');
}

run();
