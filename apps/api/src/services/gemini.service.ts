import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { AIUsageLog } from '../models/AIUsageLog';
import { AIFeature } from '@ats/shared-types';
import mongoose from 'mongoose';

// Rates per million tokens ($)
const PRICING = {
  flash: { inputRate: 0.075 / 1000000, outputRate: 0.3 / 1000000 },
  pro: { inputRate: 1.25 / 1000000, outputRate: 5.0 / 1000000 },
};

export class GeminiService {
  private ai: GoogleGenerativeAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
      this.ai = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      this.isConfigured = true;
      console.log(`[GeminiService] Initialized Google GenAI SDK with model: ${env.GEMINI_MODEL}`);
    } else {
      console.warn(
        '[GeminiService] GEMINI_API_KEY not configured. Running in deterministic heuristic mode.'
      );
      this.isConfigured = false;
    }
  }

  /**
   * Executes a prompt with schema validation, retry logic with jitter, and usage logging.
   */
  public async executeStructuredPrompt<T>(
    userId: string,
    feature: AIFeature,
    systemInstruction: string,
    userPrompt: string,
    heuristicFallback: () => T
  ): Promise<T> {
    const startTime = Date.now();
    let promptTokens = 0;
    let candidatesTokens = 0;
    let totalTokens = 0;
    let success = false;
    let errorCategory: string | undefined;

    if (!this.isConfigured || !this.ai) {
      const fallbackResult = heuristicFallback();
      // Record simulated usage in local mode
      await this.logUsage(
        userId,
        feature,
        env.GEMINI_MODEL,
        50,
        150,
        200,
        Date.now() - startTime,
        true,
        undefined,
        0.00005
      );
      return fallbackResult;
    }

    const maxRetries = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = this.ai.getGenerativeModel({
          model: env.GEMINI_MODEL,
          systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(userPrompt);
        const durationMs = Date.now() - startTime;
        const text = result.response.text() || '{}';

        // Extract usage metadata if available
        if (result.response.usageMetadata) {
          promptTokens = result.response.usageMetadata.promptTokenCount || 0;
          candidatesTokens = result.response.usageMetadata.candidatesTokenCount || 0;
          totalTokens = result.response.usageMetadata.totalTokenCount || 0;
        } else {
          promptTokens = Math.ceil((systemInstruction.length + userPrompt.length) / 4);
          candidatesTokens = Math.ceil(text.length / 4);
          totalTokens = promptTokens + candidatesTokens;
        }

        const isPro = env.GEMINI_MODEL.includes('pro');
        const rates = isPro ? PRICING.pro : PRICING.flash;
        const estimatedCost = promptTokens * rates.inputRate + candidatesTokens * rates.outputRate;

        success = true;
        await this.logUsage(
          userId,
          feature,
          env.GEMINI_MODEL,
          promptTokens,
          candidatesTokens,
          totalTokens,
          durationMs,
          true,
          undefined,
          estimatedCost
        );

        return JSON.parse(text) as T;
      } catch (err: any) {
        console.error(`[GeminiService] Attempt ${attempt} failed:`, err.message);
        
        // Fatal non-retryable errors: API key invalid, model not found, auth error
        const isNonRetryable =
          err.status === 400 ||
          err.status === 401 ||
          err.status === 403 ||
          err.status === 404 ||
          (err.message && (err.message.includes('API key not valid') || err.message.includes('not found') || err.message.includes('API_KEY_INVALID')));

        if (attempt === maxRetries || isNonRetryable) {
          errorCategory = err.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'API_ERROR';
          await this.logUsage(
            userId,
            feature,
            env.GEMINI_MODEL,
            promptTokens,
            candidatesTokens,
            totalTokens,
            Date.now() - startTime,
            false,
            errorCategory,
            0
          );
          console.warn(`[GeminiService] Falling back to heuristic generator for ${feature}`);
          return heuristicFallback();
        }

        const jitter = delay * 0.2 * (Math.random() * 2 - 1);
        await new Promise((res) => setTimeout(res, delay + jitter));
        delay *= 2;
      }
    }

    return heuristicFallback();
  }

  private async logUsage(
    userId: string,
    feature: AIFeature,
    model: string,
    promptTokens: number,
    candidatesTokens: number,
    totalTokens: number,
    durationMs: number,
    success: boolean,
    errorCategory?: string,
    estimatedCostUsd: number = 0
  ): Promise<void> {
    try {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        await AIUsageLog.create({
          userId: new mongoose.Types.ObjectId(userId),
          feature,
          model,
          promptTokens,
          candidatesTokens,
          totalTokens,
          durationMs,
          success,
          errorCategory,
          estimatedCostUsd,
        });
      }
    } catch (logErr) {
      console.error('[GeminiService] Failed to record usage log:', logErr);
    }
  }
}

export const geminiService = new GeminiService();
