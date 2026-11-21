import { describe, it, expect } from 'vitest';
import { hashQuestion, hasDuplicateQuestions } from '../lib/ai/question-hasher';

describe('Question Deduplication & Canonical Hasher', () => {
  it('generates consistent hashes regardless of extra whitespace and punctuation', () => {
    const text1 = 'Find the zeroes of the quadratic polynomial:  x^2 - 5x + 6 = 0.';
    const text2 = 'find the zeroes of the quadratic polynomial x^2 - 5x + 6 = 0';

    const hash1 = hashQuestion(text1);
    const hash2 = hashQuestion(text2);

    expect(hash1).toBe(hash2);
  });

  it('detects when a re-test question repeats a diagnostic question', () => {
    const diagnosticQuestion = {
      question_text: 'If the roots of ax^2 + bx + c = 0 are equal, what is the value of b^2 - 4ac?',
      options: [{ text: '0' }, { text: '> 0' }, { text: '< 0' }, { text: '1' }],
    };

    const diagHash = hashQuestion(diagnosticQuestion.question_text, diagnosticQuestion.options);
    const existingHashes = [diagHash];

    // Same question in re-test
    const collisionCheck = hasDuplicateQuestions(existingHashes, [
      {
        question_text: 'if the roots of ax^2 + bx + c = 0 are equal, what is the value of b^2 - 4ac',
        options: [{ text: '1' }, { text: '0' }, { text: '> 0' }, { text: '< 0' }],
      },
    ]);

    expect(collisionCheck.hasDuplicate).toBe(true);
  });

  it('verifies that fresh variant questions with different coefficients do NOT collide', () => {
    const diagnosticQuestion = {
      question_text: 'Find the discriminant of 2x^2 - 4x + 3 = 0.',
      options: [{ text: '-8' }, { text: '8' }, { text: '40' }, { text: '0' }],
    };

    const diagHash = hashQuestion(diagnosticQuestion.question_text, diagnosticQuestion.options);
    const existingHashes = [diagHash];

    // Fresh re-test variant question
    const freshVariant = {
      question_text: 'Find the discriminant of 3x^2 - 6x + 2 = 0.',
      options: [{ text: '12' }, { text: '-12' }, { text: '24' }, { text: '0' }],
    };

    const collisionCheck = hasDuplicateQuestions(existingHashes, [freshVariant]);
    expect(collisionCheck.hasDuplicate).toBe(false);
  });
});
