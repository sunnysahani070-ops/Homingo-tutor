import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServiceSupabase } from '../db/client';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
];

export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';
export const GEMINI_FALLBACK_MODEL = 'gemini-flash-lite-latest';
export const GEMINI_VISION_MODEL = 'gemini-2.5-flash';

/**
 * Log LLM usage and latency to Supabase for telemetry & debugging
 */
export async function logLlmTelemetry(params: {
  endpoint: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}) {
  try {
    const supabase = getServiceSupabase();
    await supabase.from('llm_logs').insert({
      endpoint: params.endpoint,
      model: params.model,
      input_tokens: params.inputTokens || null,
      output_tokens: params.outputTokens || null,
      latency_ms: params.latencyMs,
      status: params.status,
      error_message: params.errorMessage || null,
    });
  } catch (err) {
    console.warn('LLM telemetry log warning:', err);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    }),
  ]);
}

/**
 * Generates structured JSON output with Zod schema enforcement across candidate models.
 */
export async function generateStructuredJSON<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T, any, any>;
  endpointName: string;
  preferredModel?: string;
  temperature?: number;
}): Promise<T> {
  const modelsToTry = params.preferredModel
    ? [params.preferredModel, ...MODEL_CANDIDATES.filter((m) => m !== params.preferredModel)]
    : MODEL_CANDIDATES;

  const startTime = Date.now();
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: params.temperature ?? 0.2,
        },
      });

      const prompt = `${params.systemPrompt}\n\nUSER REQUEST:\n${params.userPrompt}\n\nSTRICT INSTRUCTION: Output ONLY valid JSON matching the schema. No markdown formatting, no comments.`;
      const result = await withTimeout(
        model.generateContent(prompt),
        10000,
        `Model ${modelName} timed out after 10s`
      );
      const text = result.response.text().trim();

      // Clean potential ```json wrapping
      const cleaned = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      // Validate with zod
      const validated = params.schema.parse(parsed);

      await logLlmTelemetry({
        endpoint: params.endpointName,
        model: modelName,
        latencyMs: Date.now() - startTime,
        status: 'SUCCESS',
      });

      return validated;
    } catch (err: any) {
      lastError = err;
      console.warn(`[${params.endpointName}] Model ${modelName} encountered error: ${err.message}. Trying next candidate...`);
    }
  }

  await logLlmTelemetry({
    endpoint: params.endpointName,
    model: modelsToTry[0],
    latencyMs: Date.now() - startTime,
    status: 'ERROR',
    errorMessage: lastError?.message || 'All model candidates failed',
  });

  throw new Error(`LLM Structured Output generation failed across candidates: ${lastError?.message}`);
}

/**
 * Returns a live streaming response iterator for SSE tutor messages.
 */
export async function getTutorChatStream(params: {
  systemPrompt: string;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  newMessage: string;
  temperature?: number;
}) {
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: params.systemPrompt,
        generationConfig: {
          temperature: params.temperature ?? 0.4,
        },
      });

      const chat = model.startChat({
        history: params.history,
      });

      return await chat.sendMessageStream(params.newMessage);
    } catch (err: any) {
      console.warn(`Streaming chat failed with ${modelName}, trying next candidate...`, err.message);
    }
  }

  throw new Error('All model candidates failed for streaming tutor chat');
}
