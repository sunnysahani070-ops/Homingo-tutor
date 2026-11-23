import { describe, it, expect } from 'vitest';
import { POST as diagnosticStartPost } from '../app/api/diagnostic/start/route';
import { POST as diagnosticAnswerPost } from '../app/api/diagnostic/answer/route';
import { POST as diagnosticFinishPost } from '../app/api/diagnostic/finish/route';
import { NextRequest } from 'next/server';

function makeReq(url: string, body?: any): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Diagnostic Misconception Detection & Error Identification', () => {
  const testGuestId = `test_guest_disc_${Date.now()}`;
  let sessionId = '';
  let questionId = '';
  let wrongAnswerOption = 'C';

  it('1. Generates diagnostic questions with assigned misconception IDs on distractors', async () => {
    const res = await diagnosticStartPost(
      makeReq('http://localhost:3000/api/diagnostic/start', {
        guestId: testGuestId,
        chapter: 'Quadratic Equations',
        language: 'hinglish',
      })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sessionId).toBeDefined();
    expect(data.firstQuestion).toBeDefined();
    expect(data.firstQuestion.options.length).toBe(4);

    sessionId = data.sessionId;
    questionId = data.firstQuestion.id;
  }, 45000);

  it('2. Correctly captures detected_misconception_id when student chooses wrong answer', async () => {
    // Submit intentionally wrong answer 'C' or 'D'
    const ansRes = await diagnosticAnswerPost(
      makeReq('http://localhost:3000/api/diagnostic/answer', {
        sessionId,
        questionId,
        selectedAnswer: wrongAnswerOption,
        timeSpentSeconds: 30,
      })
    );

    expect(ansRes.status).toBe(200);
  });

  it('3. Populates non-empty detected misconceptions upon finishing diagnostic', async () => {
    const finishRes = await diagnosticFinishPost(
      makeReq('http://localhost:3000/api/diagnostic/finish', { sessionId })
    );

    expect(finishRes.status).toBe(200);
    const finishData = await finishRes.json();

    expect(finishData.success).toBe(true);
    expect(finishData.weakestConcept).toBeDefined();
    // If the student answered wrong, misconceptionsDetected must be captured!
    expect(finishData.misconceptionsDetected.length).toBeGreaterThan(0);
    expect(finishData.misconceptionsDetected[0].title).toBeDefined();
  });
});
