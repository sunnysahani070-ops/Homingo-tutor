import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const TtsSchema = z.object({
  text: z.string().min(1).max(1000),
  language: z.enum(['en', 'hi', 'hinglish']).default('en'),
});

const TTS_CACHE = new Map<string, string>(); // In-memory audio base64 cache for repeated tutor phrases

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TtsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid TTS payload' }, { status: 400 });
    }

    const { text, language } = parsed.data;
    const cacheKey = `${language}:${text}`;

    if (TTS_CACHE.has(cacheKey)) {
      return NextResponse.json({
        cached: true,
        audioBase64: TTS_CACHE.get(cacheKey),
        mimeType: 'audio/mp3',
      });
    }

    const googleKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (googleKey) {
      // Call Google Cloud Text-to-Speech REST API
      const voiceName = language === 'hi' ? 'hi-IN-Neural2-A' : 'en-IN-Neural2-B';
      const langCode = language === 'hi' ? 'hi-IN' : 'en-IN';

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: langCode, name: voiceName },
            audioConfig: { audioEncoding: 'MP3' },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          TTS_CACHE.set(cacheKey, data.audioContent);
          return NextResponse.json({
            cached: false,
            audioBase64: data.audioContent,
            mimeType: 'audio/mp3',
          });
        }
      }
    }

    // Graceful browser fallback: signal the client to use native speechSynthesis
    return NextResponse.json({
      fallback: 'browser',
      text,
      language,
      locale: language === 'hi' ? 'hi-IN' : 'en-IN',
      speakClient: true,
    });
  } catch (err: any) {
    console.error('TTS API error:', err);
    return NextResponse.json({ fallback: 'browser', error: err.message }, { status: 200 });
  }
}
