import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { generateStructuredJSON } from '@/lib/ai/gemini';
import { DIAGNOSTIC_SYSTEM_PROMPT } from '@/lib/prompts/diagnostic';
import { GeneratedQuestionSchema, GeneratedQuestion, BatchQuestionsSchema } from '@/lib/types';
import { verifyEquation } from '@/lib/ai/math-verifier';
import { hashQuestion } from '@/lib/ai/question-hasher';
import { checkRateLimit } from '@/lib/rate-limit/limiter';
import { z } from 'zod';

const DiagnosticStartInputSchema = z.object({
  guestId: z.string().min(3),
  chapter: z.string().min(2),
  language: z.enum(['en', 'hi', 'hinglish']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DiagnosticStartInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { guestId, chapter, language } = parsed.data;

    // Rate limiting
    const rate = await checkRateLimit(guestId);
    if (!rate.allowed) {
      return NextResponse.json({ error: rate.reason }, { status: 429 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch taxonomy for this chapter
    const { data: taxonomy, error: taxError } = await supabase
      .from('misconception_taxonomy')
      .select('id, concept, title, description')
      .eq('chapter', chapter);

    if (taxError || !taxonomy || taxonomy.length === 0) {
      return NextResponse.json(
        { error: `Taxonomy not found for chapter: ${chapter}` },
        { status: 404 }
      );
    }

    // 2. Create a session in Supabase
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        guest_id: guestId,
        chapter,
        status: 'diagnostic',
      })
      .select()
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Failed to create assessment session' }, { status: 500 });
    }

    // 3. Generate diagnostic questions via Gemini
    const taxonomySummary = taxonomy
      .map((t) => `- Concept: "${t.concept}", Misconception ID: "${t.id}", Description: ${t.description}`)
      .join('\n');

    const prompt = `
Generate 6 to 8 rigorous diagnostic multiple-choice questions for CBSE Class 10 chapter "${chapter}".
Language: "${language}".

Target these specific misconceptions in your distractors:
${taxonomySummary}

Format math in KaTeX ($...$ or $$...$$).
Each question must have exactly 4 options (A, B, C, D).
Ensure the correct answer is mathematically sound and provide a verification_expression.
`;

    const generated = await generateStructuredJSON({
      systemPrompt: DIAGNOSTIC_SYSTEM_PROMPT,
      userPrompt: prompt,
      schema: BatchQuestionsSchema,
      endpointName: '/api/diagnostic/start',
      temperature: 0.2,
    });

    // 4. Verify questions and store server-side
    const questionsToInsert = [];
    const questionsList: GeneratedQuestion[] = Array.isArray(generated)
      ? generated
      : (generated as any).questions || [];

    for (const q of questionsList) {
      let isVerified = true;
      if (q.verification_expression) {
        const vResult = verifyEquation(q.verification_expression);
        isVerified = vResult.verified;
      }

      const qHash = hashQuestion(q.question_text, q.options);

      questionsToInsert.push({
        session_id: session.id,
        stage: 'diagnostic',
        hash: qHash,
        concept: q.concept,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        solution_steps: q.solution_steps,
        math_verified: isVerified,
      });
    }

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select('id, concept, question_text, options, created_at')
      .order('created_at', { ascending: true });

    if (insertError || !insertedQuestions || insertedQuestions.length === 0) {
      return NextResponse.json({ error: 'Failed to save diagnostic questions' }, { status: 500 });
    }

    // 5. Return first clean question without exposing correct_answer or solution_steps
    const firstQ = insertedQuestions[0];
    const cleanFirstQuestion = {
      id: firstQ.id,
      concept: firstQ.concept,
      question_text: firstQ.question_text,
      options: (firstQ.options as any[]).map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
      stage: 'diagnostic',
      currentIndex: 1,
      totalQuestions: insertedQuestions.length,
    };

    return NextResponse.json({
      sessionId: session.id,
      chapter,
      totalQuestions: insertedQuestions.length,
      firstQuestion: cleanFirstQuestion,
    });
  } catch (err: any) {
    console.error('Diagnostic start error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
