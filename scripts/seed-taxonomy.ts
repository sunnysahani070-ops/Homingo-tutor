import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { CBSE10_MISCONCEPTIONS } from '../lib/taxonomy/cbse10-math';

config({ path: resolve(process.cwd(), '.env.local') });

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !secretKey) {
    console.error('Supabase URL or Secret Key missing');
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false }
  });

  console.log(`🌱 Seeding ${CBSE10_MISCONCEPTIONS.length} misconception taxonomy entries into Supabase...`);

  const { data, error } = await supabase
    .from('misconception_taxonomy')
    .upsert(
      CBSE10_MISCONCEPTIONS.map((item) => ({
        id: item.id,
        chapter: item.chapter,
        concept: item.concept,
        title: item.title,
        description: item.description,
        remediation_hint: item.remediation_hint
      })),
      { onConflict: 'id' }
    )
    .select();

  if (error) {
    console.error('❌ Failed to seed misconception taxonomy:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data?.length || CBSE10_MISCONCEPTIONS.length} taxonomy entries across all 4 CBSE chapters!`);
}

seed().catch(console.error);
