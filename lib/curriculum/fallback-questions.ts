import { GeneratedQuestion } from '../types';

export const FALLBACK_DIAGNOSTIC_BANK: Record<string, GeneratedQuestion[]> = {
  'Quadratic Equations': [
    {
      concept: 'Nature of Roots',
      question_text: 'Find the nature of the roots for the quadratic equation: $2x^2 - 4x + 3 = 0$.',
      options: [
        { id: 'A', text: 'Two equal real roots', misconception_id: 'QE_NATURE_OF_ROOTS_ZERO' },
        { id: 'B', text: 'No real roots', misconception_id: null },
        { id: 'C', text: 'Two distinct real roots', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'D', text: 'One real and one imaginary root', misconception_id: 'QE_REAL_ROOT_EXISTENCE' },
      ],
      correct_answer: 'B',
      solution_steps: 'Discriminant $D = b^2 - 4ac = (-4)^2 - 4(2)(3) = 16 - 24 = -8$. Since $D < 0$, the equation has no real roots.',
      verification_expression: '(-4)^2 - 4 * 2 * 3 == -8',
    },
    {
      concept: 'Discriminant Calculation',
      question_text: 'What is the discriminant $D$ of the quadratic equation: $3x^2 - 5x + 2 = 0$?',
      options: [
        { id: 'A', text: '$1$', misconception_id: null },
        { id: 'B', text: '$-1$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'C', text: '$49$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'D', text: '$0$', misconception_id: 'QE_NATURE_OF_ROOTS_ZERO' },
      ],
      correct_answer: 'A',
      solution_steps: '$D = b^2 - 4ac = (-5)^2 - 4(3)(2) = 25 - 24 = 1$.',
      verification_expression: '(-5)^2 - 4 * 3 * 2 == 1',
    },
    {
      concept: 'Solving by Factorisation',
      question_text: 'Find the roots of the equation: $x^2 - 5x + 6 = 0$.',
      options: [
        { id: 'A', text: '$x = -2, -3$', misconception_id: 'POLY_ROOT_FACTOR_SIGN_CONFUSION' },
        { id: 'B', text: '$x = 2, 3$', misconception_id: null },
        { id: 'C', text: '$x = 1, 6$', misconception_id: 'QE_MIDDLE_TERM_SPLIT_SIGN' },
        { id: 'D', text: '$x = -1, -6$', misconception_id: 'QE_MIDDLE_TERM_SPLIT_SIGN' },
      ],
      correct_answer: 'B',
      solution_steps: '$x^2 - 5x + 6 = (x - 2)(x - 3) = 0 \\implies x = 2$ or $x = 3$.',
      verification_expression: '2^2 - 5 * 2 + 6 == 0',
    },
    {
      concept: 'Condition for Equal Roots',
      question_text: 'For what value of $k$ does $kx^2 - 4x + 1 = 0$ have equal real roots?',
      options: [
        { id: 'A', text: '$k = 4$', misconception_id: null },
        { id: 'B', text: '$k = 2$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'C', text: '$k = 16$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'D', text: '$k = -4$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: 'For equal roots, $D = b^2 - 4ac = 0 \\implies (-4)^2 - 4(k)(1) = 0 \\implies 16 - 4k = 0 \\implies k = 4$.',
      verification_expression: '16 - 4 * 4 == 0',
    },
    {
      concept: 'Quadratic Formula',
      question_text: 'According to the quadratic formula, the roots of $ax^2 + bx + c = 0$ are given by:',
      options: [
        { id: 'A', text: '$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', misconception_id: null },
        { id: 'B', text: '$\\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$', misconception_id: 'QE_QUADRATIC_FORMULA_DENOMINATOR' },
        { id: 'C', text: '$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{a}$', misconception_id: 'QE_QUADRATIC_FORMULA_DENOMINATOR' },
        { id: 'D', text: '$-b \\pm \\frac{\\sqrt{b^2 - 4ac}}{2a}$', misconception_id: 'QE_QUADRATIC_FORMULA_DENOMINATOR' },
      ],
      correct_answer: 'A',
      solution_steps: 'Standard quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.',
    },
  ],
  'Real Numbers': [
    {
      concept: 'HCF and LCM Relationship',
      question_text: 'If $\\text{HCF}(a, b) = 12$ and $a \\times b = 1800$, find $\\text{LCM}(a, b)$.',
      options: [
        { id: 'A', text: '$150$', misconception_id: null },
        { id: 'B', text: '$120$', misconception_id: 'RN_HCF_LCM_PRODUCT_CONFUSION' },
        { id: 'C', text: '$180$', misconception_id: 'RN_HCF_LCM_PRODUCT_CONFUSION' },
        { id: 'D', text: '$15$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
      ],
      correct_answer: 'A',
      solution_steps: '$\\text{HCF}(a,b) \\times \\text{LCM}(a,b) = a \\times b \\implies \\text{LCM}(a,b) = \\frac{1800}{12} = 150$.',
      verification_expression: '1800 / 12 == 150',
    },
    {
      concept: 'Fundamental Theorem of Arithmetic',
      question_text: 'Express $140$ as a product of its prime factors.',
      options: [
        { id: 'A', text: '$2^2 \\times 5 \\times 7$', misconception_id: null },
        { id: 'B', text: '$2 \\times 5^2 \\times 7$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
        { id: 'C', text: '$4 \\times 5 \\times 7$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
        { id: 'D', text: '$2^3 \\times 5 \\times 7$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
      ],
      correct_answer: 'A',
      solution_steps: '$140 = 2 \\times 70 = 2 \\times 2 \\times 35 = 2^2 \\times 5 \\times 7$.',
      verification_expression: '2^2 * 5 * 7 == 140',
    },
    {
      concept: 'Division Algorithm & Remainders',
      question_text: 'In Euclid division lemma $a = bq + r$, the remainder $r$ must satisfy:',
      options: [
        { id: 'A', text: '$0 \\le r < b$', misconception_id: null },
        { id: 'B', text: '$0 < r \\le b$', misconception_id: 'RN_EUCLID_REMAINDER_RANGE' },
        { id: 'C', text: '$0 \\le r \\le b$', misconception_id: 'RN_EUCLID_REMAINDER_RANGE' },
        { id: 'D', text: '$r < b$', misconception_id: 'RN_EUCLID_REMAINDER_RANGE' },
      ],
      correct_answer: 'A',
      solution_steps: 'By Euclid\'s Lemma, $0 \\le r < b$.',
    },
    {
      concept: 'Terminating Decimals',
      question_text: 'The decimal expansion of $\\frac{13}{3125}$ will terminate after how many decimal places?',
      options: [
        { id: 'A', text: '$5$', misconception_id: null },
        { id: 'B', text: '$4$', misconception_id: 'RN_DECIMAL_EXPANSION_DENOMINATOR' },
        { id: 'C', text: '$3$', misconception_id: 'RN_DECIMAL_EXPANSION_DENOMINATOR' },
        { id: 'D', text: '$6$', misconception_id: 'RN_DECIMAL_EXPANSION_DENOMINATOR' },
      ],
      correct_answer: 'A',
      solution_steps: '$3125 = 5^5$. In $2^n 5^m$, maximum power is $5$. So it terminates after $5$ places.',
      verification_expression: '5^5 == 3125',
    },
    {
      concept: 'Properties of Irrationals',
      question_text: 'Which of the following numbers is an irrational number?',
      options: [
        { id: 'A', text: '$2 + \\sqrt{3}$', misconception_id: null },
        { id: 'B', text: '$(2 + \\sqrt{3})(2 - \\sqrt{3})$', misconception_id: 'RN_IRRATIONAL_SUM_PRODUCT_CONFUSION' },
        { id: 'C', text: '$\\frac{\\sqrt{12}}{\\sqrt{3}}$', misconception_id: 'RN_IRRATIONAL_SUM_PRODUCT_CONFUSION' },
        { id: 'D', text: '$\\sqrt{9}$', misconception_id: 'RN_IRRATIONAL_SUM_PRODUCT_CONFUSION' },
      ],
      correct_answer: 'A',
      solution_steps: '$2 + \\sqrt{3}$ is the sum of a rational and an irrational, which is always irrational. Option B is $4-3=1$, C is $\\sqrt{4}=2$, D is $3$.',
    },
  ],
  'Polynomials': [
    {
      concept: 'Zeroes of a Polynomial',
      question_text: 'If $\\alpha$ and $\\beta$ are zeroes of $p(x) = x^2 - 7x + 12$, what is $\\alpha + \\beta$?',
      options: [
        { id: 'A', text: '$7$', misconception_id: null },
        { id: 'B', text: '$-7$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
        { id: 'C', text: '$12$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
        { id: 'D', text: '$-12$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: 'For $ax^2 + bx + c$, $\\alpha + \\beta = -b/a = -(-7)/1 = 7$.',
      verification_expression: '-(-7) / 1 == 7',
    },
    {
      concept: 'Product of Zeroes',
      question_text: 'For the polynomial $2x^2 + 5x - 6$, find the product of zeroes $\\alpha \\cdot \\beta$.',
      options: [
        { id: 'A', text: '$-3$', misconception_id: null },
        { id: 'B', text: '$3$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
        { id: 'C', text: '$-5/2$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
        { id: 'D', text: '$5/2$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: 'Product $\\alpha \\cdot \\beta = c/a = -6/2 = -3$.',
      verification_expression: '-6 / 2 == -3',
    },
    {
      concept: 'Constructing Quadratic Polynomial',
      question_text: 'Find a quadratic polynomial whose zeroes are $3$ and $-2$.',
      options: [
        { id: 'A', text: '$x^2 - x - 6$', misconception_id: null },
        { id: 'B', text: '$x^2 + x - 6$', misconception_id: 'POLY_ROOT_FACTOR_SIGN_CONFUSION' },
        { id: 'C', text: '$x^2 - 5x + 6$', misconception_id: 'POLY_ROOT_FACTOR_SIGN_CONFUSION' },
        { id: 'D', text: '$x^2 + 5x - 6$', misconception_id: 'POLY_ROOT_FACTOR_SIGN_CONFUSION' },
      ],
      correct_answer: 'A',
      solution_steps: 'Sum = $3 + (-2) = 1$. Product = $3 \\times (-2) = -6$. Formula: $x^2 - (\\text{sum})x + \\text{product} = x^2 - x - 6$.',
      verification_expression: '3^2 - 3 - 6 == 0',
    },
    {
      concept: 'Geometrical Meaning of Zeroes',
      question_text: 'The number of zeroes of a polynomial $y = p(x)$ whose graph intersects the x-axis at $3$ points is:',
      options: [
        { id: 'A', text: '$3$', misconception_id: null },
        { id: 'B', text: '$2$', misconception_id: 'POLY_DEGREE_MAX_ZEROES_CONFUSION' },
        { id: 'C', text: '$1$', misconception_id: 'POLY_DEGREE_MAX_ZEROES_CONFUSION' },
        { id: 'D', text: '$4$', misconception_id: 'POLY_DEGREE_MAX_ZEROES_CONFUSION' },
      ],
      correct_answer: 'A',
      solution_steps: 'The number of real zeroes equals the number of distinct points where the curve crosses or touches the x-axis.',
    },
  ],
  'Pair of Linear Equations in Two Variables': [
    {
      concept: 'Consistency of Linear Equations',
      question_text: 'For what condition do $a_1 x + b_1 y + c_1 = 0$ and $a_2 x + b_2 y + c_2 = 0$ represent parallel lines?',
      options: [
        { id: 'A', text: '$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$', misconception_id: null },
        { id: 'B', text: '$\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$', misconception_id: 'LE_UNIQUE_VS_INFINITE_RATIO' },
        { id: 'C', text: '$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$', misconception_id: 'LE_UNIQUE_VS_INFINITE_RATIO' },
        { id: 'D', text: '$\\frac{a_1}{a_2} = \\frac{c_1}{c_2} \\neq \\frac{b_1}{b_2}$', misconception_id: 'LE_UNIQUE_VS_INFINITE_RATIO' },
      ],
      correct_answer: 'A',
      solution_steps: 'Parallel lines have no common solution, which requires $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$.',
    },
    {
      concept: 'Solving Linear System',
      question_text: 'Solve for $x$ and $y$: $x + y = 14$ and $x - y = 4$.',
      options: [
        { id: 'A', text: '$x = 9, y = 5$', misconception_id: null },
        { id: 'B', text: '$x = 10, y = 4$', misconception_id: 'LE_ELIMINATION_SIGN_DISTRIBUTION' },
        { id: 'C', text: '$x = 5, y = 9$', misconception_id: 'LE_ELIMINATION_SIGN_DISTRIBUTION' },
        { id: 'D', text: '$x = 8, y = 6$', misconception_id: 'LE_ELIMINATION_SIGN_DISTRIBUTION' },
      ],
      correct_answer: 'A',
      solution_steps: 'Adding equations: $2x = 18 \\implies x = 9$. Then $9 + y = 14 \\implies y = 5$.',
      verification_expression: '9 + 5 == 14',
    },
  ],
};

export const FALLBACK_RETEST_BANK: Record<string, GeneratedQuestion[]> = {
  'Quadratic Equations': [
    {
      concept: 'Nature of Roots',
      question_text: 'Determine the nature of the roots of the equation: $x^2 - 6x + 9 = 0$.',
      options: [
        { id: 'A', text: 'Two equal real roots', misconception_id: null },
        { id: 'B', text: 'Two distinct real roots', misconception_id: 'QE_NATURE_OF_ROOTS_ZERO' },
        { id: 'C', text: 'No real roots', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'D', text: 'Roots cannot be determined', misconception_id: 'QE_REAL_ROOT_EXISTENCE' },
      ],
      correct_answer: 'A',
      solution_steps: '$D = (-6)^2 - 4(1)(9) = 36 - 36 = 0$. Since $D = 0$, the roots are real and equal ($x = 3$).',
      verification_expression: '(-6)^2 - 4 * 1 * 9 == 0',
    },
    {
      concept: 'Discriminant Calculation',
      question_text: 'Calculate the discriminant of the quadratic equation: $2x^2 + 5x - 3 = 0$.',
      options: [
        { id: 'A', text: '$49$', misconception_id: null },
        { id: 'B', text: '$1$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'C', text: '$-1$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'D', text: '$25$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: '$D = 5^2 - 4(2)(-3) = 25 - (-24) = 25 + 24 = 49$.',
      verification_expression: '5^2 - 4 * 2 * (-3) == 49',
    },
    {
      concept: 'Condition for Equal Roots',
      question_text: 'If $2x^2 - kx + 2 = 0$ has two equal roots, what are the possible values of $k$?',
      options: [
        { id: 'A', text: '$k = \\pm 4$', misconception_id: null },
        { id: 'B', text: '$k = 4$ only', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'C', text: '$k = \\pm 8$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
        { id: 'D', text: '$k = \\pm 2$', misconception_id: 'QE_DISCRIMINANT_FORMULA_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: '$D = (-k)^2 - 4(2)(2) = k^2 - 16 = 0 \\implies k = \\pm 4$.',
      verification_expression: '4^2 - 4 * 2 * 2 == 0',
    },
    {
      concept: 'Solving by Factorisation',
      question_text: 'Find the roots of: $2x^2 - 7x + 3 = 0$.',
      options: [
        { id: 'A', text: '$x = 3, \\frac{1}{2}$', misconception_id: null },
        { id: 'B', text: '$x = -3, -\\frac{1}{2}$', misconception_id: 'POLY_ROOT_FACTOR_SIGN_CONFUSION' },
        { id: 'C', text: '$x = 1, \\frac{3}{2}$', misconception_id: 'QE_MIDDLE_TERM_SPLIT_SIGN' },
        { id: 'D', text: '$x = 6, 1$', misconception_id: 'QE_MIDDLE_TERM_SPLIT_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: '$2x^2 - 6x - x + 3 = 2x(x - 3) - 1(x - 3) = (2x - 1)(x - 3) = 0 \\implies x = 3, 1/2$.',
      verification_expression: '2 * 3^2 - 7 * 3 + 3 == 0',
    },
  ],
  'Real Numbers': [
    {
      concept: 'HCF and LCM Relationship',
      question_text: 'If $\\text{LCM}(a, b) = 360$ and $a \\times b = 2160$, find $\\text{HCF}(a, b)$.',
      options: [
        { id: 'A', text: '$6$', misconception_id: null },
        { id: 'B', text: '$12$', misconception_id: 'RN_HCF_LCM_PRODUCT_CONFUSION' },
        { id: 'C', text: '$18$', misconception_id: 'RN_HCF_LCM_PRODUCT_CONFUSION' },
        { id: 'D', text: '$36$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
      ],
      correct_answer: 'A',
      solution_steps: '$\\text{HCF} = \\frac{a \\times b}{\\text{LCM}} = \\frac{2160}{360} = 6$.',
      verification_expression: '2160 / 360 == 6',
    },
    {
      concept: 'Fundamental Theorem of Arithmetic',
      question_text: 'Find the HCF of $96$ and $404$ by prime factorisation method.',
      options: [
        { id: 'A', text: '$4$', misconception_id: null },
        { id: 'B', text: '$2$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
        { id: 'C', text: '$8$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
        { id: 'D', text: '$12$', misconception_id: 'RN_PRIME_FACTORIZATION_POWER_ERROR' },
      ],
      correct_answer: 'A',
      solution_steps: '$96 = 2^5 \\times 3$; $404 = 2^2 \\times 101$. Common prime with lowest power is $2^2 = 4$.',
      verification_expression: '96 / 4 == 24',
    },
  ],
  'Polynomials': [
    {
      concept: 'Zeroes of a Polynomial',
      question_text: 'If the zeroes of $x^2 - 8x + k$ have sum equal to $8$ and product equal to $15$, what is $k$?',
      options: [
        { id: 'A', text: '$15$', misconception_id: null },
        { id: 'B', text: '$-15$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
        { id: 'C', text: '$8$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
        { id: 'D', text: '$-8$', misconception_id: 'POLY_SUM_PRODUCT_COEFFICIENT_SIGN' },
      ],
      correct_answer: 'A',
      solution_steps: 'Product of zeroes is $c/a = k/1 = 15 \\implies k = 15$.',
      verification_expression: '15 / 1 == 15',
    },
  ],
  'Pair of Linear Equations in Two Variables': [
    {
      concept: 'Consistency of Linear Equations',
      question_text: 'The pair of equations $x + 2y + 5 = 0$ and $-3x - 6y + 1 = 0$ has:',
      options: [
        { id: 'A', text: 'No solution', misconception_id: null },
        { id: 'B', text: 'A unique solution', misconception_id: 'LE_UNIQUE_VS_INFINITE_RATIO' },
        { id: 'C', text: 'Exactly two solutions', misconception_id: 'LE_UNIQUE_VS_INFINITE_RATIO' },
        { id: 'D', text: 'Infinitely many solutions', misconception_id: 'LE_UNIQUE_VS_INFINITE_RATIO' },
      ],
      correct_answer: 'A',
      solution_steps: '$a_1/a_2 = 1/(-3) = -1/3$; $b_1/b_2 = 2/(-6) = -1/3$; $c_1/c_2 = 5/1 = 5$. Since $a_1/a_2 = b_1/b_2 \\neq c_1/c_2$, lines are parallel (no solution).',
    },
  ],
};

export function getFallbackDiagnosticQuestions(chapter: string): GeneratedQuestion[] {
  return FALLBACK_DIAGNOSTIC_BANK[chapter] || FALLBACK_DIAGNOSTIC_BANK['Quadratic Equations'];
}

export function getFallbackRetestQuestions(chapter: string): GeneratedQuestion[] {
  return FALLBACK_RETEST_BANK[chapter] || FALLBACK_RETEST_BANK['Quadratic Equations'];
}
