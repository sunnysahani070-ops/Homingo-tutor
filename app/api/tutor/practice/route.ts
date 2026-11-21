import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { generateStructuredJSON } from '@/lib/ai/gemini';
import { GeneratedQuestionSchema, GeneratedQuestion } from '@/lib/types';
import { verifyEquation } from '@/lib/ai/math-verifier';
import { hashQuestion } from '@/lib/ai/question-hasher';
import { z } from 'zod';

const PracticeInputSchema = z.object({
  sessionId: z.string().uuid(),
  concept: z.string().min(2),
  language: z.enum(['en', 'hi', 'hinglish']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PracticeInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid practice parameters' }, { status: 400 });
    }

    const { sessionId, concept, language } = parsed.data;
    const supabase = getServiceSupabase();

    const { data: session } = await supabase
      .from('sessions')
      .select('chapter')
      .eq('id', sessionId)
      .single();

    const prompt = `
Generate ONE targeted CBSE Class 10 practice question on the concept: "${concept}" from chapter "${session?.chapter || 'Class 10 Math'}".
Language: "${language}".

Requirements:
- 4 multiple choice options (A, B, C, D).
- One correct answer, three realistic misconception distractors.
- Clear step-by-step solution.
- A math verification_expression.
- Render all math in KaTeX ($...$).
`;

    const generated = await generateStructuredJSON<GeneratedQuestion>({
      systemPrompt: 'You are an expert CBSE Class 10 mathematics educator generating a practice problem.',
      userPrompt: prompt,
      schema: GeneratedQuestionSchema,
      endpointName: '/api/tutor/practice',
      temperature: 0.3,
    });

    let isVerified = true;
    if (generated.verification_expression) {
      const v = verifyEquation(generated.verification_expression);
      isVerified = v.verified;
    }

    const qHash = hashQuestion(generated.question_text, generated.options);

    const { data: savedQ, error: saveErr } = await supabase
      .from('questions')
      .insert({
        session_id: sessionId,
        stage: 'practice',
        hash: qHash,
        concept: generated.concept,
        question_text: generated.question_text,
        options: generated.options,
        correct_answer: generated.correct_answer,
        solution_steps: generated.solution_steps,
        math_verified: isVerified,
      })
      .select('id, concept, question_text, options')
      .single();

    if (saveErr || !savedQ) {
      return NextResponse.json({ error: 'Failed to save practice problem' }, { status: 500 });
    }

    const cleanQuestion = {
      id: savedQ.id,
      concept: savedQ.concept,
      question_text: savedQ.question_text,
      options: (savedQ.options as any[]).map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
      stage: 'practice',
    };

    return NextResponse.json({ success: true, question: cleanQuestion });
  } catch (err: any) {
    console.error('Tutor practice error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
