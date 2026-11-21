# Homingo Tutor — A Socratic AI Tutor for Every Learner

> **Hackathon Track:** *"A tutor for every learner. An AI tutor can find exactly where a learner is stuck, explain it in their language and at their level, and keep going until they understand. We want learning apps that prove people actually learned, not apps that only keep them busy."*

---

## 🚀 Overview

**Homingo Tutor** is a production-grade, Socratic mathematics tutoring web application built for **CBSE Class 10 students**. Rather than keeping students passively clicking through flashcards or dumping answers, Homingo Tutor implements an honest, closed-loop pedagogical learning cycle:

$$\text{DIAGNOSE} \longrightarrow \text{TEACH} \longrightarrow \text{RETEST} \longrightarrow \text{PROVE}$$

1. **DIAGNOSE:** Evaluates foundational understanding through adaptive multiple-choice questions. Dissects every incorrect choice into an exact **misconception code** (e.g., *discriminant sign inversion*, *confusing zeroes with linear factors*, *Euclidean remainder bounds*).
2. **TEACH:** Targets the student's weakest concept with a 4-level Socratic hint ladder (Conceptual Nudge $\rightarrow$ Guiding Step $\rightarrow$ Worked Step $\rightarrow$ Full Explanation) in **English**, **Hindi (Devanagari)**, or **Hinglish (Roman Hindi)** with KaTeX math. Includes **Handwritten Photo Error Localization** using Gemini Vision.
3. **RETEST:** Generates fresh variant questions with altered coefficients and structure. Uses deterministic **SHA-256 canonical hashing** to guarantee that retest questions *never* repeat diagnostic questions.
4. **PROVE:** Generates an honest **Proof of Learning Report** with pre- vs post-mastery radar/bar metrics, resolved misconceptions, hints used, learning gain percentage ($+X\%$), a shareable public link protected by signed tokens, and a server-generated downloadable PDF.

---

## 🏗️ Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │          Client (Browser / Mobile)           │
                       │  - Next.js 15 (React 19, App Router)         │
                       │  - Tailwind CSS + shadcn/ui + Framer Motion  │
                       │  - KaTeX (Inline & Block Math Rendering)     │
                       │  - Web Speech API (STT: hi-IN, en-IN)        │
                       │  - Native SpeechSynthesis Fallback Audio     │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTPS / SSE
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │           Next.js Server API Routes          │
                       │  - Zod Request/Response Validation           │
                       │  - Dual-tier Rate Limiter (Upstash / In-DB)  │
                       │  - Server-Side Symbolic Verifier (mathjs)    │
                       │  - Dynamic Pedagogical Hint Ladder Engine    │
                       │  - Streaming Tutor Chat (SSE)                │
                       │  - Server-Side PDF Engine (pdf-lib)          │
                       └──────────────┬────────────────┬──────────────┘
                                      │                │
            ┌─────────────────────────┴────┐      ┌────┴─────────────────────────┐
            ▼                              │      ▼                              │
┌───────────────────────────────┐          │ ┌──────────────────────────────┐    │
│      Google Gemini API        │          │ │     Supabase (PostgreSQL)    │    │
│  - gemini-3.5-flash / 3.8     │          │ │  - Row Level Security (RLS)  │    │
│    (Structured JSON, Socratic │          │ │  - Anonymous Guest Profiles  │    │
│     Tutor, Practice Engine)   │          │ │  - Misconceptions Taxonomy   │    │
│  - Vision Multimodal Audit    │          │ │  - Mastery Tracking & Logs   │    │
│    (Handwritten step error)   │          │ └──────────────────────────────┘    │
└───────────────────────────────┘          │ ┌──────────────────────────────┐    │
                                           └─►  TTS Voice Service (Optional)│◄───┘
                                             │  - Google Cloud TTS /        │
                                             │    Browser SpeechSynthesis   │
                                             └──────────────────────────────┘
```

---

## 🔑 Environment Variables

| Variable | Description | Required? | Fallback Behavior |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Google AI Studio API key | **Yes** | Multi-model fallback (`gemini-flash-lite-latest` $\rightarrow$ `gemini-3.1-flash-lite` $\rightarrow$ `gemini-3.5-flash` $\rightarrow$ `gemini-3.6-flash`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint | **Yes** | Project database & auth gateway |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | **Yes** | Client-side read access respecting RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret admin key | **Yes** | Server-side verified writes & migrations |
| `DATABASE_URL` | PostgreSQL connection string | Optional | Used for direct CLI `pg` pooler migrations |
| `GOOGLE_CLOUD_TTS_API_KEY` | Google Cloud Neural2 TTS | Optional | Seamlessly falls back to browser `speechSynthesis` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Optional | Seamlessly falls back to in-database PostgreSQL rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Optional | Included with URL above |
| `NEXT_PUBLIC_APP_URL` | Base application URL | Optional | Defaults to `http://localhost:3000` |

---

## 🧪 Rigorous Verification & Tests

Every external service, math proof, and API route is tested against real production APIs:

```bash
# 1. External Service Connectivity (Gemini, Supabase, RLS, Voice, Rate Limit)
npm run verify-env

# 2. Seed CBSE Class 10 Misconception Taxonomy (20+ items across 4 chapters)
npm run db:seed

# 3. Unit Tests (Symbolic math validation, question deduplication, rate limits)
npm test

# 4. Full End-to-End Happy Path (Diagnose -> Tutor -> Retest -> Proof Report)
npx vitest run tests/e2e/happy-path.test.ts
```

---

## 📱 Mobile-First UI & Features

- **Instant Demo Mode:** One-click instant onboarding on the homepage pre-loads a real learner state for fast live judging.
- **Multilingual Socratic Chat:** Speaks and reads in Indian English, शुद्ध हिन्दी (Devanagari), and conversational Hinglish.
- **Voice Mode:** Browser Speech-to-Text (`en-IN`, `hi-IN`) with visual waveform animation and audio playback.
- **Photo Solve:** Camera snapshot or upload audits handwritten math step-by-step and highlights the exact mistake line.
- **Spaced Review Queue:** Automatically schedules 1, 3, and 7-day retention reviews for weak concepts.
- **Verified PDF Report:** Downloadable proof certificate with before-and-after scores and signed verification token.
