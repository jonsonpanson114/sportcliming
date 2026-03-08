
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const modelList = await genAI.listModels();
    console.log('Available Models:');
    for (const m of modelList.models) {
      console.log(`- ${m.name} (${m.displayName})`);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
