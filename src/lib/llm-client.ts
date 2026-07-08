/**
 * Shared LLM Client Utility
 * Centralizes initialization of all LLM provider clients (Cerebras, Gemini, Groq).
 * Both /api/chat and /api/alerts import from here.
 */
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { GoogleGenAI } from '@google/genai';

// Initialize the Cerebras client conditionally
export const cerebrasClient = process.env.CEREBRAS_API_KEY ? new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
}) : null;

// Initialize Google Gemini conditionally
export const geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
}) : null;

// Groq is accessed via fetch since the SDK is not installed; just export the key check
export const groqApiKey = process.env.GROQ_API_KEY || null;
