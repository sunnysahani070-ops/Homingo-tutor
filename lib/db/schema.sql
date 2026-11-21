-- ==============================================================================
-- Homingo Tutor - PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Optional foreign key to auth.users if authenticated
  guest_id TEXT UNIQUE,
  email TEXT,
  grade TEXT DEFAULT 'Class 10 CBSE',
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
  subject TEXT DEFAULT 'Mathematics',
  target_chapter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MISCONCEPTION TAXONOMY
CREATE TABLE IF NOT EXISTS misconception_taxonomy (
  id TEXT PRIMARY KEY,
  chapter TEXT NOT NULL,
  concept TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  remediation_hint TEXT NOT NULL
);

-- 3. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  guest_id TEXT,
  chapter TEXT NOT NULL,
  status TEXT DEFAULT 'diagnostic' CHECK (status IN ('diagnostic', 'tutoring', 'retest', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. QUESTIONS (Zero repetition via hash)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  stage TEXT CHECK (stage IN ('diagnostic', 'practice', 'retest')),
  hash TEXT NOT NULL,
  concept TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL, -- Kept server-side
  solution_steps TEXT NOT NULL,
  math_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_hash ON questions(hash);

-- 5. ATTEMPTS
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID,
  guest_id TEXT,
  stage TEXT CHECK (stage IN ('diagnostic', 'retest')),
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  detected_misconception_id TEXT REFERENCES misconception_taxonomy(id) ON DELETE SET NULL,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MASTERY SNAPSHOTS
CREATE TABLE IF NOT EXISTS mastery_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  stage TEXT CHECK (stage IN ('diagnostic', 'retest')),
  concept_scores JSONB NOT NULL,
  overall_score NUMERIC(5, 2) NOT NULL,
  misconceptions_detected TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TUTOR MESSAGES
CREATE TABLE IF NOT EXISTS tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  hint_level INT DEFAULT 0,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REPORTS (Proof of Learning)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID,
  guest_id TEXT,
  share_token TEXT UNIQUE NOT NULL,
  baseline_score NUMERIC(5, 2) NOT NULL,
  retest_score NUMERIC(5, 2) NOT NULL,
  learning_gain NUMERIC(5, 2) NOT NULL,
  before_mastery JSONB NOT NULL,
  after_mastery JSONB NOT NULL,
  misconceptions_resolved TEXT[] DEFAULT '{}',
  misconceptions_remaining TEXT[] DEFAULT '{}',
  hints_used INT DEFAULT 0,
  time_spent_minutes NUMERIC(5, 1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_token ON reports(share_token);

-- 9. REVISION ITEMS
CREATE TABLE IF NOT EXISTS revision_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  guest_id TEXT,
  chapter TEXT NOT NULL,
  concept TEXT NOT NULL,
  next_review_at TIMESTAMPTZ NOT NULL,
  interval_days INT DEFAULT 1,
  repetition_count INT DEFAULT 0,
  mastery_level NUMERIC(4, 2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LLM LOGS
CREATE TABLE IF NOT EXISTS llm_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RATE LIMITS
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE misconception_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Misconception taxonomy is public read
DROP POLICY IF EXISTS "Public read for misconception taxonomy" ON misconception_taxonomy;
CREATE POLICY "Public read for misconception taxonomy" ON misconception_taxonomy FOR SELECT USING (true);

-- Reports can be read by anyone matching the share_token
DROP POLICY IF EXISTS "Public read reports by share_token" ON reports;
CREATE POLICY "Public read reports by share_token" ON reports FOR SELECT USING (true);

-- Allow server service role full access to all tables
-- (Service role key bypasses RLS by default in Supabase, but policies ensure safety for anon/authenticated roles)
