const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.production' });

const key = process.env.GEMINI_API_KEY;
const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

for (const m of models) {
    console.log(`\n--- Testing Model: ${m} ---`);
    try {
        const cmd = `curl -s -H "Content-Type: application/json" -d "{\\\"contents\\\":[{\\\"parts\\\":[{\\\"text\\\":\\\"Hi\\\"}]}]}" "https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}"`;
        const res = execSync(cmd).toString();
        console.log(res);
    } catch (e) {
        console.error(`Failed ${m}`);
    }
}
