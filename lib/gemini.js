// lib/gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create the client instance
const geminiClient = genAI;

export { geminiClient };