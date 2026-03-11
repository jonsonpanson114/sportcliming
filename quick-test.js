const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.production' });

async function testSingleModel(modelName) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(`Success with ${modelName}:`, result.response.text());
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message);
  }
}

async function run() {
  await testSingleModel('gemini-1.5-flash');
  await testSingleModel('gemini-3-flash-preview');
}

run();
