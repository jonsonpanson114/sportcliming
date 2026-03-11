const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.production' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    const models = await genAI.listModels();
    console.log('Available Models:');
    for (const m of models) {
        console.log(`- Name: ${m.name}, Display: ${m.displayName}, Methods: ${m.supportedGenerationMethods}`);
    }
  } catch (err) {
    console.error('Error listing models:', err);
  }
}

listModels();
