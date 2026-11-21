import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Client } from 'pg';

config({ path: resolve(process.cwd(), '.env.local') });

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! Reading lib/db/schema.sql...');
    const schemaSql = readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf-8');
    
    console.log('Executing schema migration...');
    await client.query(schemaSql);
    console.log('Migration completed successfully! All tables and RLS policies created.');
  } catch (err: any) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
