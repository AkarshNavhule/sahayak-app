import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key');

export const geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);

// // Attempt a lightweight status check to log if connection is successful
// async function testGeminiConnection() {
//   try {
//     // Try to list available models as a test
//     await geminiClient.listModels?.(); // This only works on some SDK versions
//     console.log('✅ Gemini client: API connection successful');
//   } catch (err) {
//     console.error('❌ Gemini client: connection/test failed:', err.message);
//   }
// }

// // Kick off the test (but don't block app startup)
// testGeminiConnection();
