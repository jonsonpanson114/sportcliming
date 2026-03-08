
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-3-flash';

async function testGen() {
  try {
    console.log(`Testing with model: ${MODEL}...`);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent("Hello, are you Gemini 3?");
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testGen();
