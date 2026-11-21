import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/rate-limit/limiter';

describe('Rate Limiter & Daily Cap Protection', () => {
  it('allows requests within normal rate limit quota', async () => {
    const testId = `test_user_normal_${Date.now()}`;
    const res = await checkRateLimit(testId, 10);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBeGreaterThan(0);
  });

  it('rejects and throttles when requests exceed limit per minute', async () => {
    const testId = `test_user_burst_${Date.now()}`;
    const limit = 3;

    // Send 3 allowed requests
    for (let i = 0; i < limit; i++) {
      const res = await checkRateLimit(testId, limit);
      expect(res.allowed).toBe(true);
    }

    // 4th request must be rejected
    const blockedRes = await checkRateLimit(testId, limit);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.reason).toContain('Rate limit exceeded');
  });
});
