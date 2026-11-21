import { createHash } from 'crypto';

/**
 * Normalizes question content and generates a deterministic SHA-256 hash.
 * This is used to guarantee that re-test questions NEVER repeat diagnostic questions.
 */
export function hashQuestion(questionText: string, options: { text: string }[] = []): string {
  const normalizedText = questionText
    .toLowerCase()
    .replace(/[$]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizedOptions = options
    .map((o) =>
      o.text
        .toLowerCase()
        .replace(/[$]/g, '')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .sort()
    .join('|');

  const combined = `${normalizedText}::${normalizedOptions}`;
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Checks whether candidate questions collide with any existing question hashes.
 */
export function hasDuplicateQuestions(
  existingHashes: string[] | Set<string>,
  candidateQuestions: { question_text: string; options?: { text: string }[] }[]
): { hasDuplicate: boolean; duplicateQuestion?: string } {
  const hashSet = existingHashes instanceof Set ? existingHashes : new Set(existingHashes);

  for (const q of candidateQuestions) {
    const qHash = hashQuestion(q.question_text, q.options);
    if (hashSet.has(qHash)) {
      return { hasDuplicate: true, duplicateQuestion: q.question_text };
    }
  }

  return { hasDuplicate: false };
}
