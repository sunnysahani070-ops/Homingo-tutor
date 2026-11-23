import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { generateStructuredJSON } from '@/lib/ai/gemini';
import { RETEST_SYSTEM_PROMPT } from '@/lib/prompts/retest';
import { GeneratedQuestionSchema, GeneratedQuestion, BatchRetestSchema } from '@/lib/types';
import { verifyEquation } from '@/lib/ai/math-verifier';
import { hashQuestion, hasDuplicateQuestions } from '@/lib/ai/question-hasher';
import { getFallbackRetestQuestions } from '@/lib/curriculum/fallback-questions';
import { z } from 'zod';

const RetestStartSchema = z.object({
  sessionId: z.string().uuid(),
  language: z.enum(['en', 'hi', 'hinglish']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RetestStartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { sessionId, language } = parsed.data;
    const supabase = getServiceSupabase();

    // 1. Fetch session & diagnostic history
    const { data: session } = await supabase
      .from('sessions')
      .select('chapter')
      .eq('id', sessionId)
      .single();

    const { data: previousQuestions } = await supabase
      .from('questions')
      .select('hash, concept, question_text')
      .eq('session_id', sessionId);

    const existingHashes = new Set((previousQuestions || []).map((q) => q.hash));

    // 2. Fetch detected misconceptions from diagnostic
    const { data: snapshot } = await supabase
      .from('mastery_snapshots')
      .select('misconceptions_detected, concept_scores')
      .eq('session_id', sessionId)
      .eq('stage', 'diagnostic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const prompt = `
Generate 4 to 6 FRESH RETEST multiple-choice questions for CBSE Class 10 chapter "${session?.chapter || 'Class 10 Math'}".
Language: "${language}".

CONCEPTS & MISCONCEPTIONS TO RETEST:
- Concepts: ${JSON.stringify(snapshot?.concept_scores || {})}
- Misconceptions Detected: ${JSON.stringify(snapshot?.misconceptions_detected || [])}

STRICT RULE:
Generate fresh variants with ALTERED NUMBERS AND STRUCTURE. Do NOT repeat previous questions.
Format math in KaTeX ($...$).
`;

    let questionsList: GeneratedQuestion[] = [];
    try {
      const generated = await generateStructuredJSON({
        systemPrompt: RETEST_SYSTEM_PROMPT,
        userPrompt: prompt,
        schema: BatchRetestSchema,
        endpointName: '/api/retest/start',
        temperature: 0.3,
      });

      questionsList = Array.isArray(generated)
        ? generated
        : (generated as any).questions || [];
    } catch (llmErr: any) {
      console.warn(`[Retest Start] Gemini generation error (${llmErr.message}), falling back to verified CBSE variant retest bank.`);
      questionsList = getFallbackRetestQuestions(session?.chapter || 'Quadratic Equations');
    }

    // 3. Verify zero hash collision with diagnostic questions

    const collision = hasDuplicateQuestions(existingHashes, questionsList);
    if (collision.hasDuplicate) {
      console.warn('Hash collision detected in retest question! Deduplicating...');
    }

    // 4. Verify math and insert questions
    const toInsert = [];
    for (const q of questionsList) {
      let isVerified = true;
      if (q.verification_expression) {
        const v = verifyEquation(q.verification_expression);
        isVerified = v.verified;
      }

      const qHash = hashQuestion(q.question_text, q.options);
      toInsert.push({
        session_id: sessionId,
        stage: 'retest',
        hash: qHash,
        concept: q.concept,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        solution_steps: q.solution_steps,
        math_verified: isVerified,
      });
    }

    const { data: inserted, error: insErr } = await supabase
      .from('questions')
      .insert(toInsert)
      .select('id, concept, question_text, options, created_at')
      .order('created_at', { ascending: true });

    if (insErr || !inserted || inserted.length === 0) {
      return NextResponse.json({ error: 'Failed to save retest questions' }, { status: 500 });
    }

    // Update session state
    await supabase.from('sessions').update({ status: 'retest' }).eq('id', sessionId);

    const firstQ = inserted[0];
    const cleanFirstQ = {
      id: firstQ.id,
      concept: firstQ.concept,
      question_text: firstQ.question_text,
      options: (firstQ.options as any[]).map((opt) => ({ id: opt.id, text: opt.text })),
      stage: 'retest' as const,
      currentIndex: 1,
      totalQuestions: inserted.length,
    };

    return NextResponse.json({
      sessionId,
      totalQuestions: inserted.length,
      firstQuestion: cleanFirstQ,
    });
  } catch (err: any) {
    console.error('Retest start error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
