import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { z } from 'zod';

const FinishSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FinishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    const supabase = getServiceSupabase();

    // 1. Fetch all diagnostic attempts joined with questions
    const { data: attempts, error: attError } = await supabase
      .from('attempts')
      .select(`
        id,
        is_correct,
        detected_misconception_id,
        questions!inner(concept, stage)
      `)
      .eq('session_id', sessionId)
      .eq('stage', 'diagnostic');

    if (attError || !attempts || attempts.length === 0) {
      return NextResponse.json({ error: 'No diagnostic attempts found for this session' }, { status: 404 });
    }

    // 2. Compute mastery score per concept
    const conceptTotals: Record<string, { correct: number; total: number }> = {};
    const detectedMisconceptionIds: string[] = [];

    for (const att of attempts) {
      const concept = (att.questions as any)?.concept || 'General Mathematics';
      if (!conceptTotals[concept]) {
        conceptTotals[concept] = { correct: 0, total: 0 };
      }
      conceptTotals[concept].total += 1;
      if (att.is_correct) {
        conceptTotals[concept].correct += 1;
      }

      if (att.detected_misconception_id) {
        detectedMisconceptionIds.push(att.detected_misconception_id);
      }
    }

    const conceptScores: Record<string, number> = {};
    let totalCorrect = 0;
    let totalQuestions = 0;
    let weakestConcept = Object.keys(conceptTotals)[0];
    let minScore = 1.1;

    for (const [concept, stats] of Object.entries(conceptTotals)) {
      const score = Math.round((stats.correct / stats.total) * 100) / 100;
      conceptScores[concept] = score;
      totalCorrect += stats.correct;
      totalQuestions += stats.total;

      if (score < minScore) {
        minScore = score;
        weakestConcept = concept;
      }
    }

    const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

    // 3. Fetch misconception details from taxonomy
    let misconceptions: any[] = [];
    if (detectedMisconceptionIds.length > 0) {
      const { data: taxData } = await supabase
        .from('misconception_taxonomy')
        .select('id, title, description, remediation_hint, concept')
        .in('id', detectedMisconceptionIds);
      misconceptions = taxData || [];
    }

    // 4. Save mastery snapshot
    await supabase.from('mastery_snapshots').insert({
      session_id: sessionId,
      stage: 'diagnostic',
      concept_scores: conceptScores,
      overall_score: overallScore,
      misconceptions_detected: detectedMisconceptionIds,
    });

    // 5. Update session status to tutoring
    await supabase.from('sessions').update({ status: 'tutoring' }).eq('id', sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      baselineScore: overallScore,
      conceptScores,
      misconceptionsDetected: misconceptions,
      weakestConcept,
    });
  } catch (err: any) {
    console.error('Diagnostic finish error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
