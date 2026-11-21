import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/client';
import { ProfileSchema } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit/limiter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { guestId, email, grade, language, subject, targetChapter, goal } = parsed.data;

    // Rate limit check
    const rate = await checkRateLimit(guestId);
    if (!rate.allowed) {
      return NextResponse.json({ error: rate.reason }, { status: 429 });
    }

    const supabase = getServiceSupabase();

    // Upsert profile by guest_id
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          guest_id: guestId,
          email: email || null,
          grade,
          language,
          subject,
          target_chapter: targetChapter,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'guest_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Profile upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
