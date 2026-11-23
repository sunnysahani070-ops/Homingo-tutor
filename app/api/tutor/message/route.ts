import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { getTutorChatStream, GEMINI_FLASH_MODEL, GEMINI_FALLBACK_MODEL } from '@/lib/ai/gemini';
import { SOCRATIC_TUTOR_SYSTEM_PROMPT } from '@/lib/prompts/tutor-socratic';
import { TutorMessageSchema } from '@/lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TutorMessageSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid parameters', details: parsed.error.format() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { sessionId, message, hintRequested, language = 'en' } = parsed.data;
    const supabase = getServiceSupabase();

    // 1. Fetch session & diagnostic baseline context
    const { data: session } = await supabase
      .from('sessions')
      .select('id, chapter, guest_id')
      .eq('id', sessionId)
      .single();

    const { data: snapshot } = await supabase
      .from('mastery_snapshots')
      .select('concept_scores, misconceptions_detected, overall_score')
      .eq('session_id', sessionId)
      .eq('stage', 'diagnostic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch details of detected misconceptions
    let misconceptionDetails = '';
    if (snapshot?.misconceptions_detected && snapshot.misconceptions_detected.length > 0) {
      const { data: tax } = await supabase
        .from('misconception_taxonomy')
        .select('title, description, remediation_hint, concept')
        .in('id', snapshot.misconceptions_detected);

      misconceptionDetails = (tax || [])
        .map((t) => `- Concept: ${t.concept}\n  Error: ${t.title}\n  Remediation Strategy: ${t.remediation_hint}`)
        .join('\n');
    }

    // 2. Fetch past conversation turns
    const { data: pastMessages } = await supabase
      .from('tutor_messages')
      .select('role, content, hint_level')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(12);

    // Determine current hint level
    let currentHintLevel = 0;
    const lastAssistantMsg = (pastMessages || []).slice().reverse().find((m) => m.role === 'assistant');
    if (lastAssistantMsg) {
      currentHintLevel = lastAssistantMsg.hint_level || 0;
    }
    if (hintRequested) {
      currentHintLevel = Math.min(4, currentHintLevel + 1);
    }

    // 3. Prepare Gemini Chat Prompt
    const systemPrompt = `
${SOCRATIC_TUTOR_SYSTEM_PROMPT}

CURRENT SESSION CONTEXT:
- CBSE Chapter: "${session?.chapter || 'Class 10 Mathematics'}"
- Learner Language Preference: "${language}" (en=English, hi=Hindi Devanagari, hinglish=Conversational Roman Hindi)
- Diagnostic Baseline Score: ${snapshot?.overall_score || 40}%
- Active Concept Scores: ${JSON.stringify(snapshot?.concept_scores || {})}
- Detected Learner Misconceptions to address:
${misconceptionDetails || 'Focus on foundational clarity.'}

CURRENT PEDAGOGICAL STATE:
- Hint Requested by Learner: ${hintRequested ? 'YES' : 'NO'}
- Target Hint Ladder Level: ${currentHintLevel} (0=Socratic Question, 1=Conceptual Nudge, 2=Guiding Step, 3=Worked Step, 4=Complete Explanation)

Respond directly to the learner in their preferred language (${language}). Keep math rendered in KaTeX ($...$).
`;

    const chatHistory = (pastMessages || []).map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }));

    const apiKey = process.env.GEMINI_API_KEY || '';
    const groqKey = process.env.GROQ_API_KEY;
    const userPromptText = hintRequested
      ? `[Learner requested Hint Level ${currentHintLevel}]: ${message}`
      : message;

    // Save user message to database
    await supabase.from('tutor_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
      hint_level: currentHintLevel,
      language,
    });

    let fullAssistantResponse = '';
    const encoder = new TextEncoder();

    // 1. Ultra-fast Groq streaming if GROQ_API_KEY is configured
    if (groqKey) {
      try {
        const groqMessages = [
          { role: 'system', content: systemPrompt },
          ...(pastMessages || []).map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          { role: 'user', content: userPromptText },
        ];

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            temperature: 0.3,
            stream: true,
          }),
        });

        if (groqRes.ok && groqRes.body) {
          const readableStream = new ReadableStream({
            async start(controller) {
              const reader = groqRes.body!.getReader();
              const decoder = new TextDecoder();
              let buffer = '';

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data: ')) continue;
                    const jsonStr = trimmed.slice(6);
                    if (jsonStr === '[DONE]') continue;
                    try {
                      const parsed = JSON.parse(jsonStr);
                      const delta = parsed.choices?.[0]?.delta?.content;
                      if (delta) {
                        fullAssistantResponse += delta;
                        controller.enqueue(
                          encoder.encode(`data: ${JSON.stringify({ text: delta, hintLevel: currentHintLevel })}\n\n`)
                        );
                      }
                    } catch {}
                  }
                }

                await supabase.from('tutor_messages').insert({
                  session_id: sessionId,
                  role: 'assistant',
                  content: fullAssistantResponse,
                  hint_level: currentHintLevel,
                  language,
                });

                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (err: any) {
                console.error('Groq SSE stream error:', err);
                controller.close();
              }
            },
          });

          return new Response(readableStream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
            },
          });
        }
      } catch (err) {
        console.warn('Groq streaming attempt failed, falling back to Gemini:', err);
      }
    }

    // 2. High-quality Gemini Streaming with candidate fallback
    let streamResult: any = null;
    const candidates = [GEMINI_FLASH_MODEL, GEMINI_FALLBACK_MODEL];

    if (apiKey) {
      for (const modelName of candidates) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
            generationConfig: { temperature: 0.3 },
          });

          const chat = model.startChat({ history: chatHistory });
          streamResult = await chat.sendMessageStream(userPromptText);
          if (streamResult) break;
        } catch (geminiErr: any) {
          console.warn(`Gemini stream attempt failed on ${modelName}:`, geminiErr?.message || geminiErr);
        }
      }
    }

    // 3. Resilient Socratic Fallback Stream if external LLM APIs are rate-limited / unavailable
    if (!streamResult) {
      const fallbackText = hintRequested
        ? (language === 'hi'
            ? `[संकेत ${currentHintLevel}] सूत्र और मुख्य पदों को ध्यान से देखिए। पहले जो दिया गया है उसे अलग करके पहचानें।`
            : language === 'hinglish'
            ? `[Hint ${currentHintLevel}] Formula aur given terms ko pehle dhyan se dekho. Dekho kaunsa step sabse pehle apply hoga.`
            : `[Hint ${currentHintLevel}] Look closely at the given values and see which step applies first.`)
        : (language === 'hi'
            ? 'नमस्ते! चलिए इस सवाल को एक-एक कदम करके समझते हैं। आपके हिसाब से पहला कदम क्या होना चाहिए?'
            : language === 'hinglish'
            ? 'Chalo isko step-by-step todte hain! Aap mujhe batao, is problem me pehla step aapke hisaab se kya hona chahiye?'
            : "Let's break this down step by step! What do you think the first step should be?");

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: fallbackText, hintLevel: currentHintLevel })}\n\n`)
            );

            await supabase.from('tutor_messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fallbackText,
              hint_level: currentHintLevel,
              language,
            });

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (err) {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            fullAssistantResponse += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text, hintLevel: currentHintLevel })}\n\n`)
            );
          }

          // Save assistant message to database upon stream completion
          await supabase.from('tutor_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: fullAssistantResponse,
            hint_level: currentHintLevel,
            language,
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: any) {
          console.error('SSE Stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Tutor message API error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
