import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { DiagnosticAnswerSchema } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DiagnosticAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid answer parameters' }, { status: 400 });
    }

    const { sessionId, questionId, selectedAnswer, timeSpentSeconds } = parsed.data;
    const supabase = getServiceSupabase();

    const { data: q, error: qErr } = await supabase
      .from('questions')
      .select('correct_answer, options')
      .eq('id', questionId)
      .eq('session_id', sessionId)
      .single();

    if (qErr || !q) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedAnswer === q.correct_answer;
    let detectedMisconceptionId: string | null = null;

    if (!isCorrect) {
      const options = q.options as { id: string; text: string; misconception_id?: string }[];
      const chosen = options.find((o) => o.id === selectedAnswer);
      if (chosen && chosen.misconception_id) {
        detectedMisconceptionId = chosen.misconception_id;
      }

      // Resilient fallback: If option didn't explicitly tag a misconception, map to taxonomy
      if (!detectedMisconceptionId) {
        const { data: tax } = await supabase
          .from('misconception_taxonomy')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (tax) detectedMisconceptionId = tax.id;
      }
    }

    // Insert attempt
    await supabase.from('attempts').insert({
      session_id: sessionId,
      question_id: questionId,
      stage: 'retest',
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      detected_misconception_id: detectedMisconceptionId,
      time_spent_seconds: timeSpentSeconds,
    });

    // Check remaining retest questions
    const { data: allRetestQuestions } = await supabase
      .from('questions')
      .select('id, concept, question_text, options, created_at')
      .eq('session_id', sessionId)
      .eq('stage', 'retest')
      .order('created_at', { ascending: true });

    const { data: answered } = await supabase
      .from('attempts')
      .select('question_id')
      .eq('session_id', sessionId)
      .eq('stage', 'retest');

    const answeredIds = new Set((answered || []).map((a) => a.question_id));
    const nextQ = (allRetestQuestions || []).find((q) => !answeredIds.has(q.id));

    if (!nextQ) {
      return NextResponse.json({
        isFinished: true,
        wasCorrect: isCorrect,
        nextQuestion: null,
        totalAnswered: allRetestQuestions?.length || 0,
      });
    }

    const cleanNext = {
      id: nextQ.id,
      concept: nextQ.concept,
      question_text: nextQ.question_text,
      options: (nextQ.options as any[]).map((opt) => ({ id: opt.id, text: opt.text })),
      stage: 'retest' as const,
      currentIndex: answeredIds.size + 1,
      totalQuestions: allRetestQuestions?.length || 0,
    };

    return NextResponse.json({
      isFinished: false,
      wasCorrect: isCorrect,
      nextQuestion: cleanNext,
      totalAnswered: answeredIds.size,
    });
  } catch (err: any) {
    console.error('Retest answer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
