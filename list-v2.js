const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.production' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function run() {
  try {
    const result = await genAI.listModels();
    console.log('Available Models:');
    result.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

run();
