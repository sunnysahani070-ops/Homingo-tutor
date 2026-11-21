import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { DiagnosticAnswerSchema } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DiagnosticAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid answer parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, questionId, selectedAnswer, timeSpentSeconds } = parsed.data;
    const supabase = getServiceSupabase();

    // 1. Retrieve the question to inspect server-side correct answer
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('id, session_id, stage, correct_answer, options, concept')
      .eq('id', questionId)
      .eq('session_id', sessionId)
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: 'Question not found for this session' }, { status: 404 });
    }

    const isCorrect = selectedAnswer === question.correct_answer;
    let detectedMisconceptionId: string | null = null;

    if (!isCorrect) {
      const options = question.options as { id: string; text: string; misconception_id?: string }[];
      const chosenOption = options.find((opt) => opt.id === selectedAnswer);
      if (chosenOption && chosenOption.misconception_id) {
        detectedMisconceptionId = chosenOption.misconception_id;
      }
    }

    // 2. Record attempt
    const { error: attemptError } = await supabase.from('attempts').insert({
      session_id: sessionId,
      question_id: questionId,
      stage: 'diagnostic',
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      detected_misconception_id: detectedMisconceptionId,
      time_spent_seconds: timeSpentSeconds,
    });

    if (attemptError) {
      console.error('Failed to log attempt:', attemptError);
      return NextResponse.json({ error: 'Failed to record attempt' }, { status: 500 });
    }

    // 3. Find all session questions & already answered questions to pick next question
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('id, concept, question_text, options, created_at')
      .eq('session_id', sessionId)
      .eq('stage', 'diagnostic')
      .order('created_at', { ascending: true });

    const { data: answeredAttempts } = await supabase
      .from('attempts')
      .select('question_id')
      .eq('session_id', sessionId)
      .eq('stage', 'diagnostic');

    const answeredIds = new Set((answeredAttempts || []).map((a) => a.question_id));
    const nextQ = (allQuestions || []).find((q) => !answeredIds.has(q.id));

    if (!nextQ) {
      return NextResponse.json({
        isFinished: true,
        wasCorrect: isCorrect,
        nextQuestion: null,
        totalAnswered: allQuestions?.length || 0,
      });
    }

    const cleanNextQuestion = {
      id: nextQ.id,
      concept: nextQ.concept,
      question_text: nextQ.question_text,
      options: (nextQ.options as any[]).map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
      stage: 'diagnostic' as const,
      currentIndex: answeredIds.size + 1,
      totalQuestions: allQuestions?.length || 0,
    };

    return NextResponse.json({
      isFinished: false,
      wasCorrect: isCorrect,
      nextQuestion: cleanNextQuestion,
      totalAnswered: answeredIds.size,
    });
  } catch (err: any) {
    console.error('Diagnostic answer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
