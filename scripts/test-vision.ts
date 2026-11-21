import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { POST as visionAnalyzePost } from '../app/api/vision/analyze/route';
import { NextRequest } from 'next/server';

// 1x1 transparent PNG / simple handwritten demo canvas test image
const SAMPLE_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function testVision() {
  console.log('Testing /api/vision/analyze with sample math solution image...');

  const buffer = Buffer.from(SAMPLE_IMAGE_BASE64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'handwritten_quadratic.png', { type: 'image/png' });

  const formData = new FormData();
  formData.append('image', file);
  formData.append('guestId', 'test_vision_guest');

  const req = new NextRequest(new URL('http://localhost:3000/api/vision/analyze'), {
    method: 'POST',
    body: formData,
  });

  const res = await visionAnalyzePost(req);
  console.log('Vision API status:', res.status);
  const data = await res.json();
  console.log('Vision Response:\n', JSON.stringify(data, null, 2));

  if (res.ok && data.success && data.analysis) {
    console.log('✅ Photo analysis successfully returned step breakdown and feedback!');
    process.exit(0);
  } else {
    console.error('❌ Vision test failed');
    process.exit(1);
  }
}

testVision().catch(console.error);
