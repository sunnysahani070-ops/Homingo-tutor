import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId') || req.headers.get('x-guest-id');

    const supabase = getServiceSupabase();

    let query = supabase
      .from('revision_items')
      .select('*')
      .order('next_review_at', { ascending: true });

    if (guestId) {
      query = query.eq('guest_id', guestId);
    }

    const { data: items, error } = await query.limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date().toISOString();
    const dueItems = (items || []).filter((item) => item.next_review_at <= now);
    const upcomingItems = (items || []).filter((item) => item.next_review_at > now);

    return NextResponse.json({
      success: true,
      dueCount: dueItems.length,
      upcomingCount: upcomingItems.length,
      dueItems,
      upcomingItems,
    });
  } catch (err: any) {
    console.error('Revise queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
