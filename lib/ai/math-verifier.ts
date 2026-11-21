import * as math from 'mathjs';

export interface MathVerificationResult {
  verified: boolean;
  reason: string;
  calculatedValue?: any;
}

/**
 * Mathematically verifies an algebraic or arithmetic statement/equation.
 * Rejects questions where the claimed correct answer does not hold mathematically.
 */
export function verifyEquation(equationOrExpression: string, expectedValue?: any): MathVerificationResult {
  try {
    const cleaned = equationOrExpression
      .replace(/\\times/g, '*')
      .replace(/\\div/g, '/')
      .replace(/\\cdot/g, '*')
      .replace(/\\pm/g, '+')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/[^\x00-\x7F]/g, '') // remove non-ascii characters
      .trim();

    // If it's an equation LHS = RHS
    if (cleaned.includes('=')) {
      const parts = cleaned.split('=');
      if (parts.length === 2) {
        const lhsVal = math.evaluate(parts[0].trim());
        const rhsVal = math.evaluate(parts[1].trim());

        const diff = Math.abs(Number(lhsVal) - Number(rhsVal));
        if (diff < 0.0001) {
          return {
            verified: true,
            reason: `LHS (${lhsVal}) equals RHS (${rhsVal}) within tolerance`,
            calculatedValue: lhsVal,
          };
        } else {
          return {
            verified: false,
            reason: `LHS (${lhsVal}) does NOT equal RHS (${rhsVal}), diff: ${diff}`,
            calculatedValue: { lhs: lhsVal, rhs: rhsVal },
          };
        }
      }
    }

    // Direct expression evaluation
    const calculated = math.evaluate(cleaned);

    if (expectedValue !== undefined) {
      const expectedNum = math.evaluate(String(expectedValue));
      const diff = Math.abs(Number(calculated) - Number(expectedNum));
      if (diff < 0.0001) {
        return {
          verified: true,
          reason: `Calculated value (${calculated}) matches expected (${expectedValue})`,
          calculatedValue: calculated,
        };
      } else {
        return {
          verified: false,
          reason: `Calculated value (${calculated}) does not match expected (${expectedValue})`,
          calculatedValue: calculated,
        };
      }
    }

    return {
      verified: true,
      reason: `Expression evaluated successfully to: ${calculated}`,
      calculatedValue: calculated,
    };
  } catch (err: any) {
    return {
      verified: false,
      reason: `Math evaluation error: ${err.message || String(err)}`,
    };
  }
}

/**
 * Verifies quadratic root: given a, b, c and candidate root x, checks if a*x^2 + b*x + c == 0
 */
export function verifyQuadraticRoot(a: number, b: number, c: number, root: number): MathVerificationResult {
  const result = a * Math.pow(root, 2) + b * root + c;
  const isZero = Math.abs(result) < 0.0001;
  return {
    verified: isZero,
    reason: isZero
      ? `f(${root}) = ${result} ≈ 0 (Verified valid root)`
      : `f(${root}) = ${result} ≠ 0 (INVALID ROOT)`,
    calculatedValue: result,
  };
}

/**
 * Verifies discriminant: D = b^2 - 4ac
 */
export function verifyDiscriminant(a: number, b: number, c: number, expectedD: number): MathVerificationResult {
  const calculatedD = Math.pow(b, 2) - 4 * a * c;
  const match = calculatedD === expectedD;
  return {
    verified: match,
    reason: match
      ? `b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${calculatedD}`
      : `Mismatch: expected ${expectedD}, calculated ${calculatedD}`,
    calculatedValue: calculatedD,
  };
}

/**
 * Verifies HCF and LCM product: HCF(a, b) * LCM(a, b) = a * b
 */
export function verifyHcfLcmProduct(a: number, b: number, hcf: number, lcm: number): MathVerificationResult {
  const productAB = a * b;
  const productHcfLcm = hcf * lcm;
  const match = productAB === productHcfLcm;
  return {
    verified: match,
    reason: match
      ? `HCF * LCM = ${productHcfLcm} == a * b = ${productAB}`
      : `Violation: HCF * LCM (${productHcfLcm}) != a * b (${productAB})`,
  };
}
