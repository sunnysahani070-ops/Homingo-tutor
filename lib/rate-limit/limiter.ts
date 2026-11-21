import { getServiceSupabase } from '../db/client';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  reason?: string;
}

const MEMORY_CACHE = new Map<string, { count: number; windowStart: number }>();
const MAX_REQUESTS_PER_MINUTE = 60;
const DAILY_CAP_PER_USER = 250;

/**
 * Robust rate limiter supporting both Postgres in-database tracking and in-memory cache fallback.
 */
export async function checkRateLimit(
  identifier: string,
  limitPerMinute: number = MAX_REQUESTS_PER_MINUTE
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = 60 * 1000;

  // 1. Fast in-memory check
  const memRecord = MEMORY_CACHE.get(identifier);
  if (memRecord) {
    if (now - memRecord.windowStart < windowMs) {
      if (memRecord.count >= limitPerMinute) {
        return {
          allowed: false,
          remaining: 0,
          resetSeconds: Math.ceil((memRecord.windowStart + windowMs - now) / 1000),
          reason: 'Rate limit exceeded: 60 requests per minute limit reached.',
        };
      }
      memRecord.count++;
    } else {
      MEMORY_CACHE.set(identifier, { count: 1, windowStart: now });
    }
  } else {
    MEMORY_CACHE.set(identifier, { count: 1, windowStart: now });
  }

  // 2. Persist to Supabase rate_limits table
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('identifier', identifier)
      .maybeSingle();

    if (!data) {
      await supabase.from('rate_limits').insert({
        identifier,
        request_count: 1,
        window_start: new Date(now).toISOString(),
      });
    } else {
      const dbWindowStart = new Date(data.window_start).getTime();
      if (now - dbWindowStart < windowMs) {
        if (data.request_count >= DAILY_CAP_PER_USER) {
          return {
            allowed: false,
            remaining: 0,
            resetSeconds: 3600,
            reason: `Daily request cap of ${DAILY_CAP_PER_USER} reached for this account to prevent key exhaustion.`,
          };
        }
        await supabase
          .from('rate_limits')
          .update({ request_count: data.request_count + 1 })
          .eq('identifier', identifier);
      } else {
        await supabase
          .from('rate_limits')
          .update({ request_count: 1, window_start: new Date(now).toISOString() })
          .eq('identifier', identifier);
      }
    }
  } catch (err) {
    // If database table is temporarily unreachable, memory rate limiting remains active
    console.warn('Database rate limit update warning:', err);
  }

  const currentCount = MEMORY_CACHE.get(identifier)?.count || 1;
  return {
    allowed: true,
    remaining: Math.max(0, limitPerMinute - currentCount),
    resetSeconds: 60,
  };
}
