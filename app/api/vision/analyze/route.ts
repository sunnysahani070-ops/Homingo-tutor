import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VISION_EVAL_SYSTEM_PROMPT } from '@/lib/prompts/vision-eval';
import { GEMINI_VISION_MODEL } from '@/lib/ai/gemini';
import { checkRateLimit } from '@/lib/rate-limit/limiter';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const guestId = (formData.get('guestId') as string) || 'guest-vision';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported types: JPEG, PNG, WEBP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image exceeds maximum size of 5MB' }, { status: 400 });
    }

    // Rate limit
    const rate = await checkRateLimit(guestId);
    if (!rate.allowed) {
      return NextResponse.json({ error: rate.reason }, { status: 429 });
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_VISION_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `
${VISION_EVAL_SYSTEM_PROMPT}

Analyze this handwritten math problem and solution.
Output JSON format:
{
  "transcription": "...",
  "detected_steps": [
    { "step_number": 1, "expression": "...", "is_correct": true, "critique": "..." },
    { "step_number": 2, "expression": "...", "is_correct": false, "critique": "..." }
  ],
  "first_error_step": 2,
  "overall_feedback": "...",
  "remedial_question": "..."
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (err: any) {
    console.error('Vision analyze error:', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze handwritten image' }, { status: 500 });
  }
}
