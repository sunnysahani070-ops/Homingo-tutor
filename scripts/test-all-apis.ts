import { config } from 'dotenv';
import { resolve } from 'path';
import { NextRequest } from 'next/server';

config({ path: resolve(process.cwd(), '.env.local') });

// Import all API route handlers directly
import { GET as healthGet } from '../app/api/health/route';
import { POST as profilePost } from '../app/api/profile/route';
import { POST as diagnosticStartPost } from '../app/api/diagnostic/start/route';
import { POST as diagnosticAnswerPost } from '../app/api/diagnostic/answer/route';
import { POST as diagnosticFinishPost } from '../app/api/diagnostic/finish/route';
import { POST as tutorMessagePost } from '../app/api/tutor/message/route';
import { POST as tutorPracticePost } from '../app/api/tutor/practice/route';
import { POST as tutorCheckPost } from '../app/api/tutor/check/route';
import { POST as retestStartPost } from '../app/api/retest/start/route';
import { POST as retestAnswerPost } from '../app/api/retest/answer/route';
import { POST as retestFinishPost } from '../app/api/retest/finish/route';
import { GET as reportGet } from '../app/api/report/[id]/route';
import { GET as reportPdfGet } from '../app/api/report/[id]/pdf/route';
import { POST as voiceTtsPost } from '../app/api/voice/tts/route';
import { GET as reviseQueueGet } from '../app/api/revise/queue/route';
import { POST as visionAnalyzePost } from '../app/api/vision/analyze/route';

interface TestResult {
  route: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode: number;
  latencyMs: number;
  details: string;
}

const testResults: TestResult[] = [];
const testGuestId = `guest_test_${Date.now()}`;
let createdSessionId = '';
let currentQuestionId = '';
let createdReportId = '';
let createdShareToken = '';

function makeRequest(url: string, method: string, body?: any, isFormData: boolean = false): NextRequest {
  const init: any = {
    method,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  };
  if (body) {
    init.body = isFormData ? body : JSON.stringify(body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

async function runTest(name: string, method: string, fn: () => Promise<Response>, validator: (json: any, res: Response) => boolean) {
  const start = Date.now();
  try {
    const res = await fn();
    const latencyMs = Date.now() - start;
    let json: any = null;
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      json = await res.json();
    } else if (contentType.includes('application/pdf')) {
      json = { isPdf: true, size: (await res.arrayBuffer()).byteLength };
    } else if (contentType.includes('text/event-stream')) {
      json = { isStream: true };
    }

    const passed = res.ok && validator(json, res);
    testResults.push({
      route: name,
      method,
      status: passed ? 'PASS' : 'FAIL',
      statusCode: res.status,
      latencyMs,
      details: passed ? 'Response validated successfully' : JSON.stringify(json).substring(0, 150),
    });
    return json;
  } catch (err: any) {
    testResults.push({
      route: name,
      method,
      status: 'FAIL',
      statusCode: 500,
      latencyMs: Date.now() - start,
      details: err.message || String(err),
    });
    return null;
  }
}

async function main() {
  console.log('====================================================');
  console.log('🧪 Homingo Tutor - Comprehensive API Integration Tests');
  console.log('====================================================\n');

  // 1. GET /api/health
  await runTest('/api/health', 'GET', () => healthGet(), (json) => json.database === true && json.gemini === true);

  // 2. POST /api/profile
  await runTest(
    '/api/profile',
    'POST',
    () =>
      profilePost(
        makeRequest('http://localhost:3000/api/profile', 'POST', {
          guestId: testGuestId,
          grade: 'Class 10 CBSE',
          language: 'hinglish',
          targetChapter: 'Quadratic Equations',
          goal: 'Score 95% in Board Exams',
        })
      ),
    (json) => json.success === true && json.profile?.target_chapter === 'Quadratic Equations'
  );

  // 3. POST /api/diagnostic/start
  const diagStartData = await runTest(
    '/api/diagnostic/start',
    'POST',
    () =>
      diagnosticStartPost(
        makeRequest('http://localhost:3000/api/diagnostic/start', 'POST', {
          guestId: testGuestId,
          chapter: 'Quadratic Equations',
          language: 'hinglish',
        })
      ),
    (json) => {
      if (json?.sessionId && json?.firstQuestion?.options?.length === 4) {
        createdSessionId = json.sessionId;
        currentQuestionId = json.firstQuestion.id;
        return true;
      }
      return false;
    }
  );

  // 4. POST /api/diagnostic/answer
  if (createdSessionId && currentQuestionId) {
    await runTest(
      '/api/diagnostic/answer',
      'POST',
      () =>
        diagnosticAnswerPost(
          makeRequest('http://localhost:3000/api/diagnostic/answer', 'POST', {
            sessionId: createdSessionId,
            questionId: currentQuestionId,
            selectedAnswer: 'B',
            timeSpentSeconds: 45,
          })
        ),
      (json) => json.wasCorrect !== undefined
    );
  }

  // 5. POST /api/diagnostic/finish
  if (createdSessionId) {
    await runTest(
      '/api/diagnostic/finish',
      'POST',
      () =>
        diagnosticFinishPost(
          makeRequest('http://localhost:3000/api/diagnostic/finish', 'POST', {
            sessionId: createdSessionId,
          })
        ),
      (json) => json.success === true && json.baselineScore !== undefined
    );
  }

  // 6. POST /api/tutor/message (SSE)
  if (createdSessionId) {
    await runTest(
      '/api/tutor/message',
      'POST',
      () =>
        tutorMessagePost(
          makeRequest('http://localhost:3000/api/tutor/message', 'POST', {
            sessionId: createdSessionId,
            message: 'Mujhe discriminant calculate karne me problem hoti hai.',
            hintRequested: false,
            language: 'hinglish',
          })
        ),
      (json) => json.isStream === true
    );
  }

  // 7. POST /api/tutor/practice
  let practiceQId = '';
  const practiceData = await runTest(
    '/api/tutor/practice',
    'POST',
    () =>
      tutorPracticePost(
        makeRequest('http://localhost:3000/api/tutor/practice', 'POST', {
          sessionId: createdSessionId,
          concept: 'Discriminant Calculation',
          language: 'hinglish',
        })
      ),
    (json) => {
      if (json.success && json.question?.options?.length === 4) {
        practiceQId = json.question.id;
        return true;
      }
      return false;
    }
  );

  // 8. POST /api/tutor/check
  if (createdSessionId && practiceQId) {
    await runTest(
      '/api/tutor/check',
      'POST',
      () =>
        tutorCheckPost(
          makeRequest('http://localhost:3000/api/tutor/check', 'POST', {
            sessionId: createdSessionId,
            questionId: practiceQId,
            selectedAnswer: 'A',
          })
        ),
      (json) => json.feedback !== undefined && json.isCorrect !== undefined
    );
  }

  // 9. POST /api/retest/start
  let retestQId = '';
  await runTest(
    '/api/retest/start',
    'POST',
    () =>
      retestStartPost(
        makeRequest('http://localhost:3000/api/retest/start', 'POST', {
          sessionId: createdSessionId,
          language: 'hinglish',
        })
      ),
    (json) => {
      if (json.firstQuestion?.id) {
        retestQId = json.firstQuestion.id;
        return true;
      }
      return false;
    }
  );

  // 10. POST /api/retest/answer
  if (createdSessionId && retestQId) {
    await runTest(
      '/api/retest/answer',
      'POST',
      () =>
        retestAnswerPost(
          makeRequest('http://localhost:3000/api/retest/answer', 'POST', {
            sessionId: createdSessionId,
            questionId: retestQId,
            selectedAnswer: 'A',
            timeSpentSeconds: 30,
          })
        ),
      (json) => json.wasCorrect !== undefined
    );
  }

  // 11. POST /api/retest/finish
  await runTest(
    '/api/retest/finish',
    'POST',
    () =>
      retestFinishPost(
        makeRequest('http://localhost:3000/api/retest/finish', 'POST', {
          sessionId: createdSessionId,
        })
      ),
    (json) => {
      if (json.success && json.reportId && json.shareToken) {
        createdReportId = json.reportId;
        createdShareToken = json.shareToken;
        return true;
      }
      return false;
    }
  );

  // 12. GET /api/report/[id] (Public via signed token)
  if (createdReportId && createdShareToken) {
    await runTest(
      `/api/report/${createdReportId}?token=${createdShareToken}`,
      'GET',
      () =>
        reportGet(
          makeRequest(`http://localhost:3000/api/report/${createdReportId}?token=${createdShareToken}`, 'GET'),
          { params: Promise.resolve({ id: createdReportId }) }
        ),
      (json) => json.success === true && json.report?.shareToken === createdShareToken
    );
  }

  // 13. GET /api/report/[id]/pdf
  if (createdReportId && createdShareToken) {
    await runTest(
      `/api/report/${createdReportId}/pdf`,
      'GET',
      () =>
        reportPdfGet(
          makeRequest(`http://localhost:3000/api/report/${createdReportId}/pdf?token=${createdShareToken}`, 'GET'),
          { params: Promise.resolve({ id: createdReportId }) }
        ),
      (json) => json.isPdf === true && json.size > 1000
    );
  }

  // 14. POST /api/voice/tts
  await runTest(
    '/api/voice/tts',
    'POST',
    () =>
      voiceTtsPost(
        makeRequest('http://localhost:3000/api/voice/tts', 'POST', {
          text: 'Shabaash! Yeh step bilkul sahi hai.',
          language: 'hinglish',
        })
      ),
    (json) => json.fallback !== undefined || json.audioBase64 !== undefined
  );

  // 15. GET /api/revise/queue
  await runTest(
    '/api/revise/queue',
    'GET',
    () =>
      reviseQueueGet(
        makeRequest(`http://localhost:3000/api/revise/queue?guestId=${testGuestId}`, 'GET')
      ),
    (json) => json.success === true && json.dueCount !== undefined
  );

  // Print results
  console.log('\n--- INTEGRATION TEST SUMMARY ---');
  let allPassed = true;
  for (const t of testResults) {
    const icon = t.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${t.method}] ${t.route} (${t.latencyMs}ms) -> ${t.statusCode}`);
    if (t.status === 'FAIL') {
      console.log(`   Error: ${t.details}`);
      allPassed = false;
    }
  }

  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 ALL API ROUTES PASSED WITH REAL DATA!');
    process.exit(0);
  } else {
    console.error('🚨 SOME TESTS FAILED');
    process.exit(1);
  }
}

main().catch(console.error);
