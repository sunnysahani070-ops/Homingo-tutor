import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as profilePost } from '../../app/api/profile/route';
import { POST as diagnosticStartPost } from '../../app/api/diagnostic/start/route';
import { POST as diagnosticAnswerPost } from '../../app/api/diagnostic/answer/route';
import { POST as diagnosticFinishPost } from '../../app/api/diagnostic/finish/route';
import { POST as tutorMessagePost } from '../../app/api/tutor/message/route';
import { POST as tutorPracticePost } from '../../app/api/tutor/practice/route';
import { POST as tutorCheckPost } from '../../app/api/tutor/check/route';
import { POST as retestStartPost } from '../../app/api/retest/start/route';
import { POST as retestAnswerPost } from '../../app/api/retest/answer/route';
import { POST as retestFinishPost } from '../../app/api/retest/finish/route';
import { GET as reportGet } from '../../app/api/report/[id]/route';
import { GET as reportPdfGet } from '../../app/api/report/[id]/pdf/route';

function makeReq(url: string, body?: any): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Full End-to-End Core Loop: Diagnose -> Teach -> Retest -> Prove', () => {
  const guestId = `e2e_student_${Date.now()}`;
  let sessionId = '';
  let firstQId = '';
  let practiceQId = '';
  let retestQId = '';
  let reportId = '';
  let shareToken = '';

  it('1. Signs in as Guest and configures Profile', async () => {
    const res = await profilePost(
      makeReq('http://localhost:3000/api/profile', {
        guestId,
        grade: 'Class 10 CBSE',
        language: 'hinglish',
        targetChapter: 'Quadratic Equations',
        goal: 'Ace the Board Exam',
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.profile.guest_id).toBe(guestId);
  });

  it('2. Starts Diagnostic Exam with mathematically verified questions', async () => {
    const res = await diagnosticStartPost(
      makeReq('http://localhost:3000/api/diagnostic/start', {
        guestId,
        chapter: 'Quadratic Equations',
        language: 'hinglish',
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sessionId).toBeDefined();
    expect(json.firstQuestion.id).toBeDefined();
    expect(json.firstQuestion.options.length).toBe(4);

    sessionId = json.sessionId;
    firstQId = json.firstQuestion.id;
  }, 30000);

  it('3. Answers Diagnostic question and finishes baseline assessment', async () => {
    // Answer question
    const ansRes = await diagnosticAnswerPost(
      makeReq('http://localhost:3000/api/diagnostic/answer', {
        sessionId,
        questionId: firstQId,
        selectedAnswer: 'B',
        timeSpentSeconds: 40,
      })
    );
    expect(ansRes.status).toBe(200);

    // Finish baseline diagnostic
    const finishRes = await diagnosticFinishPost(
      makeReq('http://localhost:3000/api/diagnostic/finish', { sessionId })
    );
    expect(finishRes.status).toBe(200);
    const json = await finishRes.json();
    expect(json.success).toBe(true);
    expect(json.baselineScore).toBeDefined();
  });

  it('4. Engages in Socratic Tutoring session with Hint Ladder', async () => {
    const tutorRes = await tutorMessagePost(
      makeReq('http://localhost:3000/api/tutor/message', {
        sessionId,
        message: 'Mujhe roots nikalne me sign confusion hoti hai.',
        hintRequested: true,
        language: 'hinglish',
      })
    );
    expect(tutorRes.status).toBe(200);
    expect(tutorRes.headers.get('content-type')).toContain('text/event-stream');

    // Consume the stream so Node does not hang
    const reader = tutorRes.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }
  }, 30000);

  it('5. Generates and checks a targeted Practice problem', async () => {
    const practiceRes = await tutorPracticePost(
      makeReq('http://localhost:3000/api/tutor/practice', {
        sessionId,
        concept: 'Nature of Roots',
        language: 'hinglish',
      })
    );
    expect(practiceRes.status).toBe(200);
    const pJson = await practiceRes.json();
    expect(pJson.success).toBe(true);
    practiceQId = pJson.question.id;

    // Check practice answer
    const checkRes = await tutorCheckPost(
      makeReq('http://localhost:3000/api/tutor/check', {
        sessionId,
        questionId: practiceQId,
        selectedAnswer: 'A',
      })
    );
    expect(checkRes.status).toBe(200);
    const checkJson = await checkRes.json();
    expect(checkJson.feedback).toBeDefined();
  }, 30000);

  it('6. Starts Retest with fresh variant questions (Zero diagnostic repetition)', async () => {
    const retestRes = await retestStartPost(
      makeReq('http://localhost:3000/api/retest/start', {
        sessionId,
        language: 'hinglish',
      })
    );
    expect(retestRes.status).toBe(200);
    const rJson = await retestRes.json();
    expect(rJson.firstQuestion.id).toBeDefined();
    retestQId = rJson.firstQuestion.id;
  }, 30000);

  it('7. Completes Retest and produces Proof of Learning Report with positive learning gain', async () => {
    // Answer retest question
    await retestAnswerPost(
      makeReq('http://localhost:3000/api/retest/answer', {
        sessionId,
        questionId: retestQId,
        selectedAnswer: 'A',
        timeSpentSeconds: 25,
      })
    );

    // Finalize retest
    const finishRes = await retestFinishPost(
      makeReq('http://localhost:3000/api/retest/finish', { sessionId })
    );
    expect(finishRes.status).toBe(200);
    const json = await finishRes.json();
    expect(json.success).toBe(true);
    expect(json.reportId).toBeDefined();
    expect(json.shareToken).toBeDefined();
    expect(json.learningGain).toBeDefined();

    reportId = json.reportId;
    shareToken = json.shareToken;
  }, 30000);

  it('8. Verifies Public Report Access and PDF generation', async () => {
    // Public Report
    const repRes = await reportGet(
      makeReq(`http://localhost:3000/api/report/${reportId}?token=${shareToken}`),
      { params: Promise.resolve({ id: reportId }) }
    );
    expect(repRes.status).toBe(200);
    const repJson = await repRes.json();
    expect(repJson.report.shareToken).toBe(shareToken);
    expect(repJson.report.chapter).toBe('Quadratic Equations');

    // PDF Download
    const pdfRes = await reportPdfGet(
      makeReq(`http://localhost:3000/api/report/${reportId}/pdf?token=${shareToken}`),
      { params: Promise.resolve({ id: reportId }) }
    );
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.headers.get('content-type')).toBe('application/pdf');
    const pdfBytes = await pdfRes.arrayBuffer();
    expect(pdfBytes.byteLength).toBeGreaterThan(1000);
  });
});
