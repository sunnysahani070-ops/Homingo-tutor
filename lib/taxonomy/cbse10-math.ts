export interface MisconceptionItem {
  id: string;
  chapter: string;
  concept: string;
  title: string;
  description: string;
  remediation_hint: string;
}

export const CBSE10_MISCONCEPTIONS: MisconceptionItem[] = [
  // =========================================================================
  // CHAPTER 1: REAL NUMBERS
  // =========================================================================
  {
    id: 'RN_HCF_LCM_PRODUCT_CONFUSION',
    chapter: 'Real Numbers',
    concept: 'HCF and LCM Relationship',
    title: 'Applying HCF × LCM = a × b to three numbers',
    description: 'Student mistakenly assumes that for three numbers a, b, c, HCF(a,b,c) × LCM(a,b,c) = a × b × c.',
    remediation_hint: 'Remember that HCF(a,b) × LCM(a,b) = a × b holds strictly for TWO numbers only, never for three numbers.'
  },
  {
    id: 'RN_DECIMAL_EXPANSION_DENOMINATOR',
    chapter: 'Real Numbers',
    concept: 'Terminating vs Non-Terminating Decimals',
    title: 'Checking denominator before simplifying to lowest terms',
    description: 'Student checks if denominator prime factors are 2^n 5^m without first canceling common factors with the numerator (e.g., 6/15 has 3 in 15, but simplifies to 2/5 which terminates).',
    remediation_hint: 'Always reduce the rational fraction p/q to its simplest coprime form (HCF(p,q) = 1) before inspecting the prime factorization of q.'
  },
  {
    id: 'RN_IRRATIONAL_SUM_PRODUCT_CONFUSION',
    chapter: 'Real Numbers',
    concept: 'Properties of Irrationals',
    title: 'Assuming sum or product of two irrationals is always irrational',
    description: 'Student forgets that (√3) + (-√3) = 0 (rational) and (√2) × (√2) = 2 (rational).',
    remediation_hint: 'The sum or product of a non-zero rational and an irrational is always irrational, but combining two irrationals can yield a rational number.'
  },
  {
    id: 'RN_PRIME_FACTORIZATION_POWER_ERROR',
    chapter: 'Real Numbers',
    concept: 'Fundamental Theorem of Arithmetic',
    title: 'Confusing highest vs lowest powers for HCF and LCM',
    description: 'Student takes highest powers of common primes for HCF and lowest powers for LCM instead of the reverse.',
    remediation_hint: 'HCF uses the SMALLEST exponent of each common prime factor; LCM uses the GREATEST exponent of each prime factor involved.'
  },
  {
    id: 'RN_EUCLID_REMAINDER_RANGE',
    chapter: 'Real Numbers',
    concept: 'Division Algorithm & Remainders',
    title: 'Allowing remainder r to be negative or ≥ divisor b',
    description: 'In a = bq + r, student allows remainder r to be negative or equal to or greater than b.',
    remediation_hint: 'By definition, the remainder r in Euclid\'s Division Lemma must strictly satisfy 0 ≤ r < b.'
  },

  // =========================================================================
  // CHAPTER 2: POLYNOMIALS
  // =========================================================================
  {
    id: 'POLY_ROOT_FACTOR_SIGN_CONFUSION',
    chapter: 'Polynomials',
    concept: 'Zeroes vs Linear Factors',
    title: 'Sign inversion between zero α and factor (x - α)',
    description: 'Student claims that if 3 is a zero of polynomial p(x), then (x + 3) is a factor instead of (x - 3).',
    remediation_hint: 'If α is a zero of p(x), setting x = α makes p(α) = 0, so the corresponding factor is always (x - α).'
  },
  {
    id: 'POLY_COEFFICIENT_SIGN_RELATION',
    chapter: 'Polynomials',
    concept: 'Relationship between Zeroes and Coefficients',
    title: 'Dropping the negative sign in sum of zeroes (-b/a)',
    description: 'Student computes sum of zeroes as b/a instead of -b/a for ax² + bx + c.',
    remediation_hint: 'The sum of zeroes α + β is -(coefficient of x)/(coefficient of x²) = -b/a. Remember the negative sign!'
  },
  {
    id: 'POLY_FORMATION_LEAD_COEFFICIENT',
    chapter: 'Polynomials',
    concept: 'Forming Quadratic Polynomials',
    title: 'Omitting arbitrary constant k in k[x² - (α+β)x + αβ]',
    description: 'Student writes x² - (α+β)x + αβ and forgets fractional denominators must be cleared by scaling with constant k.',
    remediation_hint: 'A quadratic polynomial with zeroes α and β is generally k[x² - (α+β)x + αβ] where k is any non-zero real constant.'
  },
  {
    id: 'POLY_DEGREE_NUMBER_OF_ZEROES',
    chapter: 'Polynomials',
    concept: 'Geometric Meaning of Zeroes',
    title: 'Confusing y-intercept with x-intercepts for number of zeroes',
    description: 'Student counts intersections with the y-axis as zeroes of p(x) instead of intersections with the x-axis.',
    remediation_hint: 'Zeroes of y = p(x) are the x-coordinates of points where the graph intersects or touches the X-AXIS (y = 0).'
  },
  {
    id: 'POLY_DIVISION_STOP_CONDITION',
    chapter: 'Polynomials',
    concept: 'Division Algorithm for Polynomials',
    title: 'Continuing division when remainder degree is less than divisor degree',
    description: 'Student does not stop long division when degree of r(x) < degree of g(x).',
    remediation_hint: 'Polynomial division terminates when either the remainder r(x) = 0 or deg(r(x)) < deg(divisor g(x)).'
  },

  // =========================================================================
  // CHAPTER 3: PAIR OF LINEAR EQUATIONS IN TWO VARIABLES
  // =========================================================================
  {
    id: 'LIN_CONSISTENCY_RATIOS_CONFUSION',
    chapter: 'Pair of Linear Equations in Two Variables',
    concept: 'Conditions for Solvability',
    title: 'Confusing parallel lines condition with infinite solutions condition',
    description: 'Student confuses a1/a2 = b1/b2 ≠ c1/c2 (no solution / parallel) with a1/a2 = b1/b2 = c1/c2 (infinite solutions / coincident).',
    remediation_hint: 'When a1/a2 = b1/b2 = c1/c2, lines are identical (coincident, infinitely many solutions). When a1/a2 = b1/b2 ≠ c1/c2, lines never meet (parallel, no solution).'
  },
  {
    id: 'LIN_CONSTANT_TERM_SIGN_RATIO',
    chapter: 'Pair of Linear Equations in Two Variables',
    concept: 'Ratio Comparison (c1/c2)',
    title: 'Comparing c1 and c2 on opposite sides of equals sign',
    description: 'Student takes c1 from LHS (ax + by + c1 = 0) and c2 from RHS (dx + ey = c2) without bringing both to the same side.',
    remediation_hint: 'Always write both equations in the same standard form: either both as a₁x + b₁y + c₁ = 0 or both as a₁x + b₁y = c₁ before comparing ratios.'
  },
  {
    id: 'LIN_SUBSTITUTION_DISTRIBUTIVE_ERROR',
    chapter: 'Pair of Linear Equations in Two Variables',
    concept: 'Substitution Method',
    title: 'Failing to distribute negative sign or multiplier during substitution',
    description: 'When substituting y = (c - ax)/b into second equation, student forgets to distribute the coefficient or negative sign across both terms.',
    remediation_hint: 'Place parentheses around the substituted expression: e.g., 2x - 3(4 - x) requires distributing -3 to both 4 and -x.'
  },
  {
    id: 'LIN_ELIMINATION_MULTIPLY_ALL_TERMS',
    chapter: 'Pair of Linear Equations in Two Variables',
    concept: 'Elimination Method',
    title: 'Multiplying only LHS terms and forgetting to multiply the RHS constant',
    description: 'When multiplying equation 2x + 3y = 7 by 4, student writes 8x + 12y = 7 instead of 28.',
    remediation_hint: 'Whatever multiplier you apply to eliminate a variable, multiply EVERY term on both LHS and RHS!'
  },
  {
    id: 'LIN_UPSTREAM_DOWNSTREAM_SPEEDS',
    chapter: 'Pair of Linear Equations in Two Variables',
    concept: 'Word Problems (Speed & Distance)',
    title: 'Subtracting boat speed from stream speed instead of stream from boat',
    description: 'Student defines upstream speed as (y - x) where y is stream speed, resulting in negative relative speed.',
    remediation_hint: 'The speed of the boat in still water (u) must exceed stream speed (v). Downstream speed = u + v; Upstream speed = u - v.'
  },

  // =========================================================================
  // CHAPTER 4: QUADRATIC EQUATIONS
  // =========================================================================
  {
    id: 'QUAD_DISCRIMINANT_SIGN_SQUARE',
    chapter: 'Quadratic Equations',
    concept: 'Discriminant Calculation',
    title: 'Squaring a negative b as negative in b² - 4ac',
    description: 'When b = -5, student writes b² = -25 instead of (-5)² = +25, altering the discriminant sign.',
    remediation_hint: 'Remember: (-b)² is ALWAYS positive! For b = -5, b² = (-5)² = 25.'
  },
  {
    id: 'QUAD_FORMULA_DENOMINATOR_SCOPE',
    chapter: 'Quadratic Equations',
    concept: 'Quadratic Formula',
    title: 'Dividing only the square root part by 2a instead of all of (-b ± √D)',
    description: 'Student writes x = -b ± (√D / 2a) instead of x = (-b ± √D) / (2a).',
    remediation_hint: 'The denominator 2a divides the ENTIRE numerator: x = [-b ± √(b² - 4ac)] / (2a).'
  },
  {
    id: 'QUAD_EQUAL_ROOTS_DISCRIMINANT',
    chapter: 'Quadratic Equations',
    concept: 'Nature of Roots',
    title: 'Confusing real and equal roots condition (D = 0) with D > 0',
    description: 'Student uses D ≥ 0 for "equal roots" or sets D > 0 instead of strictly D = 0.',
    remediation_hint: 'Two real and DISTINCT roots: D > 0. Two real and EQUAL roots: D = 0. No real roots: D < 0.'
  },
  {
    id: 'QUAD_CANCELLING_VARIABLE_ROOT_LOSS',
    chapter: 'Quadratic Equations',
    concept: 'Solving by Factoring',
    title: 'Dividing both sides by x and losing root x = 0',
    description: 'Given x² = 4x, student divides by x to get x = 4, losing the valid solution x = 0.',
    remediation_hint: 'Never divide across both sides by the unknown variable x! Bring all terms to one side: x² - 4x = 0 → x(x - 4) = 0.'
  },
  {
    id: 'QUAD_SQUARE_ROOT_OMIT_NEGATIVE',
    chapter: 'Quadratic Equations',
    concept: 'Pure Quadratics (x² = k)',
    title: 'Forgetting the negative square root (±) when taking square root of both sides',
    description: 'Given (x - 2)² = 9, student writes x - 2 = 3 (x = 5) and ignores x - 2 = -3 (x = -1).',
    remediation_hint: 'Taking the square root of both sides introduces TWO roots: x - 2 = ±√9 = ±3, yielding two solutions.'
  }
];
