import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { z } from 'zod';

const ReviseCompleteSchema = z.object({
  itemId: z.string().uuid(),
  score: z.number().min(0).max(1), // 0 to 1 performance
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReviseCompleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { itemId, score } = parsed.data;
    const supabase = getServiceSupabase();

    const { data: item } = await supabase
      .from('revision_items')
      .select('interval_days, repetition_count, mastery_level')
      .eq('id', itemId)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // SM-2 Spaced Repetition Logic: 1 -> 3 -> 7 -> 14 days
    let newInterval = 1;
    const reps = (item.repetition_count || 0) + 1;

    if (score >= 0.75) {
      if (reps === 1) newInterval = 3;
      else if (reps === 2) newInterval = 7;
      else newInterval = (item.interval_days || 3) * 2;
    } else {
      // Loop back to 1 day if not mastered
      newInterval = 1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    const { data: updated, error } = await supabase
      .from('revision_items')
      .update({
        interval_days: newInterval,
        repetition_count: reps,
        mastery_level: score,
        next_review_at: nextReview.toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedItem: updated });
  } catch (err: any) {
    console.error('Revise complete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
