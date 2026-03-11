const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.production' });

async function findWorkingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  for (const modelName of modelsToTry) {
    console.log(`Trying model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      console.log(`✅ Success with ${modelName}: ${result.response.text().substring(0, 20)}`);
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed ${modelName}: ${err.message}`);
    }
  }
}

findWorkingModel();
