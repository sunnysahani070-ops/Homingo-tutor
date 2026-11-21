import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const FinishRetestSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FinishRetestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    const supabase = getServiceSupabase();

    // 1. Fetch session
    const { data: session } = await supabase
      .from('sessions')
      .select('id, guest_id, user_id, chapter')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Fetch baseline snapshot
    const { data: baseline } = await supabase
      .from('mastery_snapshots')
      .select('concept_scores, overall_score, misconceptions_detected')
      .eq('session_id', sessionId)
      .eq('stage', 'diagnostic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const baselineScore = baseline?.overall_score ? Number(baseline.overall_score) : 40;
    const baselineMisconceptions = baseline?.misconceptions_detected || [];

    // 3. Fetch retest attempts
    const { data: retestAttempts } = await supabase
      .from('attempts')
      .select(`
        id,
        is_correct,
        detected_misconception_id,
        time_spent_seconds,
        questions!inner(concept, stage)
      `)
      .eq('session_id', sessionId)
      .eq('stage', 'retest');

    if (!retestAttempts || retestAttempts.length === 0) {
      return NextResponse.json({ error: 'No retest attempts found' }, { status: 404 });
    }

    // 4. Calculate retest concept scores
    const conceptTotals: Record<string, { correct: number; total: number }> = {};
    const retestDetectedMisconceptions: string[] = [];
    let totalTimeSeconds = 0;

    for (const att of retestAttempts) {
      const concept = (att.questions as any)?.concept || 'General';
      if (!conceptTotals[concept]) {
        conceptTotals[concept] = { correct: 0, total: 0 };
      }
      conceptTotals[concept].total += 1;
      if (att.is_correct) {
        conceptTotals[concept].correct += 1;
      }
      if (att.detected_misconception_id) {
        retestDetectedMisconceptions.push(att.detected_misconception_id);
      }
      totalTimeSeconds += att.time_spent_seconds || 0;
    }

    const afterMastery: Record<string, number> = {};
    let totalCorrect = 0;
    let totalQuestions = 0;

    for (const [concept, stats] of Object.entries(conceptTotals)) {
      const score = Math.round((stats.correct / stats.total) * 100) / 100;
      afterMastery[concept] = score;
      totalCorrect += stats.correct;
      totalQuestions += stats.total;
    }

    const retestScore = Math.round((totalCorrect / totalQuestions) * 100);
    const learningGain = Math.round(retestScore - baselineScore);

    // 5. Compare misconceptions
    const retestSet = new Set(retestDetectedMisconceptions);
    const resolvedIds = (baselineMisconceptions as string[]).filter((id: string) => !retestSet.has(id));
    const remainingIds = (baselineMisconceptions as string[]).filter((id: string) => retestSet.has(id));

    // 6. Count hints used from tutor messages
    const { data: tutorMsgs } = await supabase
      .from('tutor_messages')
      .select('hint_level')
      .eq('session_id', sessionId);

    const hintsUsed = (tutorMsgs || []).filter((m) => (m.hint_level || 0) > 0).length;

    // 7. Save retest mastery snapshot
    await supabase.from('mastery_snapshots').insert({
      session_id: sessionId,
      stage: 'retest',
      concept_scores: afterMastery,
      overall_score: retestScore,
      misconceptions_detected: retestDetectedMisconceptions,
    });

    // 8. Generate share token & save Report
    const shareToken = randomUUID();
    const timeSpentMinutes = Math.max(1, Math.round((totalTimeSeconds / 60) * 10) / 10);

    const { data: report, error: repError } = await supabase
      .from('reports')
      .insert({
        session_id: sessionId,
        guest_id: session.guest_id,
        user_id: session.user_id,
        share_token: shareToken,
        baseline_score: baselineScore,
        retest_score: retestScore,
        learning_gain: learningGain,
        before_mastery: baseline?.concept_scores || {},
        after_mastery: afterMastery,
        misconceptions_resolved: resolvedIds,
        misconceptions_remaining: remainingIds,
        hints_used: hintsUsed,
        time_spent_minutes: timeSpentMinutes,
      })
      .select()
      .single();

    if (repError || !report) {
      console.error('Failed to create report:', repError);
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }

    // 9. Update Spaced Review Items for remaining or weak concepts
    for (const [concept, score] of Object.entries(afterMastery)) {
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + (score >= 0.8 ? 3 : 1));

      await supabase.from('revision_items').insert({
        guest_id: session.guest_id,
        user_id: session.user_id,
        chapter: session.chapter,
        concept,
        next_review_at: nextReviewDate.toISOString(),
        interval_days: score >= 0.8 ? 3 : 1,
        mastery_level: score,
      });
    }

    // 10. Mark session completed
    await supabase
      .from('sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      reportId: report.id,
      shareToken: report.share_token,
      baselineScore,
      retestScore,
      learningGain,
      hintsUsed,
      timeSpentMinutes,
      resolvedCount: resolvedIds.length,
      remainingCount: remainingIds.length,
    });
  } catch (err: any) {
    console.error('Retest finish error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
