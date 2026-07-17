/**
 * @jest-environment node
 */
import { cerebrasClient, geminiClient } from '../src/lib/llm-client';

describe('LLM Client Initialization', () => {
  it('initializes cerebrasClient if CEREBRAS_API_KEY is present', () => {
    if (process.env.CEREBRAS_API_KEY) {
      expect(cerebrasClient).toBeDefined();
    } else {
      expect(cerebrasClient).toBeNull();
    }
  });

  it('initializes geminiClient if GEMINI_API_KEY is present', () => {
    if (process.env.GEMINI_API_KEY) {
      expect(geminiClient).toBeDefined();
    } else {
      expect(geminiClient).toBeNull();
    }
  });
});
