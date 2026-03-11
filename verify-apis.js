
const https = require('https');

function checkApi(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`JSON valid: yes`);
          console.log(`Data: ${JSON.stringify(json).substring(0, 100)}...`);
        } catch (e) {
          console.log(`JSON valid: no`);
          console.log(`Body: ${data.substring(0, 100)}...`);
        }
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  const baseUrl = 'https://sportcliming-cjllndtpb-jonsonpanson114s-projects.vercel.app';
  await checkApi(`${baseUrl}/api/stats`);
  await checkApi(`${baseUrl}/api/daily-practice`);
}

run();
