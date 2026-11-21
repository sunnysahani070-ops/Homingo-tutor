import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { z } from 'zod';

const CheckSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedAnswer: z.enum(['A', 'B', 'C', 'D']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid check parameters' }, { status: 400 });
    }

    const { sessionId, questionId, selectedAnswer } = parsed.data;
    const supabase = getServiceSupabase();

    const { data: q, error: qErr } = await supabase
      .from('questions')
      .select('correct_answer, solution_steps, options, concept')
      .eq('id', questionId)
      .eq('session_id', sessionId)
      .single();

    if (qErr || !q) {
      return NextResponse.json({ error: 'Practice question not found' }, { status: 404 });
    }

    const isCorrect = selectedAnswer === q.correct_answer;
    const options = q.options as { id: string; text: string; misconception_id?: string }[];
    const chosen = options.find((opt) => opt.id === selectedAnswer);

    let feedback = '';
    if (isCorrect) {
      feedback = `🎉 Brilliant! Option (${selectedAnswer}) is completely correct! You have resolved this concept.`;
    } else {
      feedback = `Not quite. Option (${selectedAnswer}) was chosen, but the correct answer is (${q.correct_answer}).\n\nExplanation:\n${q.solution_steps}`;
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: q.correct_answer,
      feedback,
      solutionSteps: q.solution_steps,
    });
  } catch (err: any) {
    console.error('Practice check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
