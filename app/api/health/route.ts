import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_FLASH_MODEL } from '@/lib/ai/gemini';

export async function GET() {
  const health: {
    status: 'ok' | 'degraded' | 'error';
    database: boolean;
    gemini: boolean;
    timestamp: string;
    services: Record<string, any>;
  } = {
    status: 'ok',
    database: false,
    gemini: false,
    timestamp: new Date().toISOString(),
    services: {},
  };

  // 1. Check Supabase DB
  try {
    const supabase = getServiceSupabase();
    const { count, error } = await supabase.from('misconception_taxonomy').select('*', { count: 'exact', head: true });
    health.database = !error && count !== null;
    health.services.database = { ok: health.database, count };
  } catch (err: any) {
    health.services.database = { ok: false, error: err.message };
  }

  // 2. Check Gemini LLM
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_FLASH_MODEL });
      await model.generateContent('ping');
      health.gemini = true;
      health.services.gemini = { ok: true, model: GEMINI_FLASH_MODEL };
    }
  } catch (err: any) {
    health.services.gemini = { ok: false, error: err.message };
  }

  if (!health.database || !health.gemini) {
    health.status = 'degraded';
  }

  return NextResponse.json(health, { status: health.status === 'error' ? 500 : 200 });
}
