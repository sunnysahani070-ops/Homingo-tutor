import { describe, it, expect } from 'vitest';
import {
  verifyEquation,
  verifyQuadraticRoot,
  verifyDiscriminant,
  verifyHcfLcmProduct,
} from '../lib/ai/math-verifier';

describe('Math Verifier Engine (Symbolic & Numeric)', () => {
  it('correctly validates a true equation', () => {
    const res = verifyEquation('2 * 3 + 4 = 10');
    expect(res.verified).toBe(true);
    expect(res.calculatedValue).toBe(10);
  });

  it('deliberately REJECTS a wrong LLM equation (e.g. 2*3 + 4 = 12)', () => {
    const res = verifyEquation('2 * 3 + 4 = 12');
    expect(res.verified).toBe(false);
    expect(res.reason).toContain('does NOT equal RHS');
  });

  it('validates a correct quadratic root', () => {
    // x^2 - 5x + 6 = 0 has roots x = 2 and x = 3
    const res = verifyQuadraticRoot(1, -5, 6, 2);
    expect(res.verified).toBe(true);
  });

  it('deliberately REJECTS an invalid quadratic root from an LLM hallucination', () => {
    // LLM claims x = 4 is a root of x^2 - 5x + 6 = 0
    const res = verifyQuadraticRoot(1, -5, 6, 4);
    expect(res.verified).toBe(false);
    expect(res.reason).toContain('INVALID ROOT');
  });

  it('validates correct discriminant calculation', () => {
    // 2x^2 - 4x + 2 = 0 -> b^2 - 4ac = 16 - 16 = 0
    const res = verifyDiscriminant(2, -4, 2, 0);
    expect(res.verified).toBe(true);
  });

  it('deliberately REJECTS a wrong discriminant with sign error', () => {
    // For b = -4, student or flawed LLM claims (-4)^2 = -16 -> D = -32
    const res = verifyDiscriminant(2, -4, 2, -32);
    expect(res.verified).toBe(false);
  });

  it('validates HCF * LCM = a * b', () => {
    // a=12, b=18, HCF=6, LCM=36 -> 12*18 = 216 == 6*36 = 216
    const res = verifyHcfLcmProduct(12, 18, 6, 36);
    expect(res.verified).toBe(true);
  });

  it('deliberately REJECTS wrong HCF/LCM claims', () => {
    const res = verifyHcfLcmProduct(12, 18, 4, 36);
    expect(res.verified).toBe(false);
  });
});
