import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    const supabase = getServiceSupabase();

    let query = supabase
      .from('reports')
      .select(`
        id,
        session_id,
        share_token,
        baseline_score,
        retest_score,
        learning_gain,
        before_mastery,
        after_mastery,
        misconceptions_resolved,
        misconceptions_remaining,
        hints_used,
        time_spent_minutes,
        created_at,
        sessions!inner(chapter, guest_id)
      `);

    // Match by ID or by share_token
    if (token) {
      query = query.eq('share_token', token);
    } else {
      query = query.eq('id', id);
    }

    const { data: report, error } = await query.maybeSingle();

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch resolved and remaining misconception details
    const resolvedIds = (report.misconceptions_resolved as string[]) || [];
    const remainingIds = (report.misconceptions_remaining as string[]) || [];

    const allIds = [...resolvedIds, ...remainingIds];
    let taxonomyMap: Record<string, any> = {};

    if (allIds.length > 0) {
      const { data: taxData } = await supabase
        .from('misconception_taxonomy')
        .select('id, title, description, remediation_hint, concept')
        .in('id', allIds);

      if (taxData) {
        for (const t of taxData) {
          taxonomyMap[t.id] = t;
        }
      }
    }

    // Sanitize output (no private database IDs, tokens, or emails)
    const sanitizedReport = {
      id: report.id,
      shareToken: report.share_token,
      chapter: (report.sessions as any)?.chapter || 'CBSE Class 10 Mathematics',
      baselineScore: Number(report.baseline_score),
      retestScore: Number(report.retest_score),
      learningGain: Number(report.learning_gain),
      beforeMastery: report.before_mastery,
      afterMastery: report.after_mastery,
      hintsUsed: report.hints_used,
      timeSpentMinutes: Number(report.time_spent_minutes),
      misconceptionsResolved: resolvedIds.map((rid) => taxonomyMap[rid] || { id: rid, title: rid }),
      misconceptionsRemaining: remainingIds.map((rid) => taxonomyMap[rid] || { id: rid, title: rid }),
      createdAt: report.created_at,
    };

    return NextResponse.json({ success: true, report: sanitizedReport });
  } catch (err: any) {
    console.error('Fetch report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
