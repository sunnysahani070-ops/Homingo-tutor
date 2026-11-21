import { z } from 'zod';

export type LanguageCode = 'en' | 'hi' | 'hinglish';

export const CBSE_CHAPTERS = [
  'Real Numbers',
  'Polynomials',
  'Pair of Linear Equations in Two Variables',
  'Quadratic Equations',
] as const;

export type CBSEChapter = (typeof CBSE_CHAPTERS)[number];

// Profile Schema
export const ProfileSchema = z.object({
  guestId: z.string().min(3),
  email: z.string().email().optional(),
  grade: z.string().default('Class 10 CBSE'),
  language: z.enum(['en', 'hi', 'hinglish']).default('en'),
  subject: z.string().default('Mathematics'),
  targetChapter: z.enum(CBSE_CHAPTERS),
  goal: z.string().optional(),
});
export type ProfileInput = z.infer<typeof ProfileSchema>;

// Question Option Schema
export const QuestionOptionSchema = z.preprocess((val: any) => {
  if (typeof val === 'string') {
    const match = val.match(/^([A-D])[\)\.\:\s]+(.*)$/i);
    if (match) {
      return { id: match[1].toUpperCase() as 'A' | 'B' | 'C' | 'D', text: match[2].trim() };
    }
    return { id: 'A', text: val };
  }
  if (typeof val !== 'object' || !val) return val;
  const idRaw = (val.id || val.key || val.label || 'A').toString().trim().toUpperCase().charAt(0);
  const id = ['A', 'B', 'C', 'D'].includes(idRaw) ? idRaw : 'A';
  return {
    id,
    text: String(val.text || val.option || val.value || ''),
    misconception_id: val.misconception_id || val.misconceptionId || null,
  };
}, z.object({
  id: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1),
  misconception_id: z.string().nullable().optional(),
}));

// Generated Question Schema with robust preprocessing
export const GeneratedQuestionSchema = z.preprocess((val: any) => {
  if (typeof val !== 'object' || !val) return val;

  const concept = String(val.concept || val.topic || 'Class 10 Math');
  const question_text = String(val.question_text || val.questionText || val.question || val.problem || '');
  let rawOptions = val.options || [];

  if (!Array.isArray(rawOptions) && typeof rawOptions === 'object') {
    rawOptions = Object.entries(rawOptions).map(([k, v]) => ({ id: k, text: String(v) }));
  }

  const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const options = Array.isArray(rawOptions)
    ? rawOptions.map((opt: any, idx: number) => {
        if (typeof opt === 'string') {
          const match = opt.match(/^([A-D])[\)\.\:\s]+(.*)$/i);
          if (match) {
            return { id: match[1].toUpperCase(), text: match[2].trim() || opt };
          }
          return { id: letters[idx] || 'A', text: opt };
        }
        return opt;
      })
    : [];

  const rawAnswer = String(val.correct_answer || val.correctAnswer || val.answer || 'A')
    .trim()
    .toUpperCase()
    .replace(/[^A-D]/g, '');
  const correct_answer = (['A', 'B', 'C', 'D'].includes(rawAnswer.charAt(0)) ? rawAnswer.charAt(0) : 'A') as 'A' | 'B' | 'C' | 'D';

  const rawSteps = val.solution_steps || val.solutionSteps || val.steps || val.solution || val.explanation || 'Step-by-step verified solution.';
  const solution_steps = Array.isArray(rawSteps) ? rawSteps.join('\n') : String(rawSteps);

  const verification_expression = val.verification_expression || val.verificationExpression || val.verification || undefined;

  return {
    concept,
    question_text,
    options,
    correct_answer,
    solution_steps,
    verification_expression,
  };
}, z.object({
  concept: z.string().min(1),
  question_text: z.string().min(1),
  options: z.array(QuestionOptionSchema).min(2),
  correct_answer: z.enum(['A', 'B', 'C', 'D']),
  solution_steps: z.string().min(1),
  verification_expression: z.string().optional(),
}));

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export const BatchQuestionsSchema = z
  .union([
    z.object({
      questions: z.array(GeneratedQuestionSchema).min(2).max(10),
    }),
    z.array(GeneratedQuestionSchema).min(2).max(10),
  ])
  .transform((val) => (Array.isArray(val) ? { questions: val } : val));

export const BatchRetestSchema = z
  .union([
    z.object({
      questions: z.array(GeneratedQuestionSchema).min(2).max(10),
    }),
    z.array(GeneratedQuestionSchema).min(2).max(10),
  ])
  .transform((val) => (Array.isArray(val) ? { questions: val } : val));

export interface CleanQuestion {
  id: string;
  concept: string;
  question_text: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  stage: 'diagnostic' | 'practice' | 'retest';
  currentIndex: number;
  totalQuestions: number;
}

// Diagnostic Answer Submission Schema
export const DiagnosticAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedAnswer: z.enum(['A', 'B', 'C', 'D']),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
});

// Tutor Message Request Schema
export const TutorMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1),
  hintRequested: z.boolean().default(false),
  language: z.enum(['en', 'hi', 'hinglish']).optional(),
});

// Practice Check Schema
export const PracticeCheckSchema = z.object({
  sessionId: z.string().uuid(),
  concept: z.string().min(1),
  userAnswer: z.string().min(1),
  problemText: z.string().min(1),
  targetAnswer: z.string().min(1),
});

// Vision Analyze Schema
export interface VisionAuditResult {
  transcription: string;
  detected_steps: {
    step_number: number;
    expression: string;
    is_correct: boolean;
    critique: string;
  }[];
  first_error_step: number | null;
  overall_feedback: string;
  remedial_question: string;
}

// Proof of Learning Report Data
export interface ProofReport {
  id: string;
  sessionId: string;
  shareToken: string;
  chapter: string;
  learnerGrade: string;
  learnerLanguage: string;
  baselineScore: number;
  retestScore: number;
  learningGain: number;
  beforeMastery: Record<string, number>;
  afterMastery: Record<string, number>;
  misconceptionsResolved: {
    id: string;
    title: string;
    description: string;
  }[];
  misconceptionsRemaining: {
    id: string;
    title: string;
    description: string;
  }[];
  hintsUsed: number;
  timeSpentMinutes: number;
  createdAt: string;
}
