import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    console.log('Available models:');
    for (const m of data.models) {
      if (m.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`- ${m.name} (${m.displayName})`);
      }
    }
  } else {
    console.log('No models returned or error:', data);
  }
}

listModels();
