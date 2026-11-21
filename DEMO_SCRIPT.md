# Homingo Tutor — 3-Minute Live Hackathon Demo Script

## 🎯 Target Persona
- **Learner:** Aarav, Class 10 CBSE Student in Delhi.
- **Problem:** Keeps making sign errors when calculating the discriminant ($b^2 - 4ac$) for negative values of $b$ (e.g. squaring $-5$ as $-25$), costing him critical marks in Board exams.
- **Goal:** Not to be given the answer, but to have an AI tutor find where he is stuck, explain in Hinglish, and prove he actually learned.

---

## ⏱️ Minute-by-Minute Live Presentation

### Minute 0:00 - 0:45 • The Problem & The Diagnostic
- **What to say:**
  > *"Judges, most learning apps keep students busy with endless multiple-choice questions or dump final answers with generic chat bots. That doesn't prove learning. Today, we built Homingo Tutor for the track: 'A tutor for every learner that finds where they are stuck and proves they actually learned.'"*
- **What to do:**
  1. Open homepage: `http://localhost:3000` (or production URL).
  2. Click **"Instant Demo Mode"** (or click **Start Learning**, choose **Hinglish**, **Quadratic Equations**).
  3. Show the **Diagnostic Exam**: Point out the KaTeX math rendering ($2x^2 - 5x + 3 = 0$).
  4. Deliberately select distractor **B** ($-49$, which reflects squaring $-5$ as $-25$).
  5. Complete the diagnostic to show the **Baseline Mastery Map** (e.g. Baseline: 33%).
  6. Point out: *"Notice it didn't just mark it wrong — it detected the exact misconception: Squaring a negative $b$ as negative in $b^2 - 4ac$."*

---

### Minute 0:45 - 1:45 • The Socratic Tutor, Voice & Photo Solve
- **What to say:**
  > *"Now the student enters Socratic Tutoring. Watch how it responds in natural conversational Hinglish, never dumps the answer, and uses a progressive hint ladder."*
- **What to do:**
  1. Show tutor chat. The tutor greets Aarav in Hinglish.
  2. Click the **Voice Mic button** and speak (or type): *"Mujhe negative number ka square karne me confusion hoti hai."*
  3. Click **"Hint 1"** button on the top right.
  4. Point out: *"Hint 1 gave a conceptual nudge: it reminds Aarav that $(-5)^2 = (-5) \times (-5) = +25$. It didn't do the whole problem."*
  5. Click **"Photo Solve"** button $\rightarrow$ click **"Choose sample photo"** $\rightarrow$ click **"Audit My Solution"**.
  6. Point out: *"Gemini Vision transcribes the handwritten work and highlights the exact mistake on Step 2 with an error badge and remedial check question."*
  7. Under the chat, click **"Generate Practice Problem"** and solve it correctly!

---

### Minute 1:45 - 2:40 • Retest & The "Proof of Learning" Hero Report
- **What to say:**
  > *"Here is the most important part of our track: We do not assume the student learned just because they nodded in chat. We RETEST with fresh variant questions that never repeat previous problems."*
- **What to do:**
  1. Click **"Take Retest"**.
  2. Show fresh problem with altered coefficients (verified via SHA-256 canonical hashing).
  3. Select the correct answer and click **"Submit Retest Answer"**.
  4. Confetti triggers! The **Proof of Learning Hero Report** opens.
  5. Highlight:
     - **Headline Learning Gain:** $+45\%$ Mastery!
     - **Before vs After Concept Bars:** Pre-tutoring $33\% \longrightarrow$ Post-tutoring $80\%$.
     - **Misconceptions Resolved:** Green badge showing *Quadratic Discriminant Sign Square* resolved!
     - **Honesty metric:** Time spent ($3.2$m) and Hints used ($2$).

---

### Minute 2:40 - 3:00 • Sharing, Spaced Repetition & Closing
- **What to do:**
  1. Click **"Share Proof Link"** $\rightarrow$ Open an **Incognito Window** and paste the URL.
  2. Point out: *"Any parent, teacher, or evaluator can inspect this verified proof link. No private student data is exposed."*
  3. Click **"Download PDF"** to open the server-generated official proof certificate.
  4. Click **"Revise"** in the top navigation to show the **1-3-7 day spaced review queue**.
- **Closing statement:**
  > *"Homingo Tutor proves real learning through closed-loop diagnosis, Socratic language-adapted instruction, and cryptographic proof of mastery. Thank you!"*

---

## 🛡️ 3 Fail-Safe Backup Plans During Live Demo

### Backup Plan 1: Live Wi-Fi / Hotspot Drops
- **Symptom:** Browser shows offline or connection error.
- **Action:**
  1. The app runs completely locally via `http://localhost:3000` with cached Next.js static builds.
  2. A pre-generated proof report is accessible at `/report/demo-report-class10` with offline data.
  3. Speech synthesis automatically runs on native offline browser `window.speechSynthesis` without needing any cloud TTS network calls.

### Backup Plan 2: Google Gemini Rate Limit / 503 Spike
- **Symptom:** LLM response takes $>8$ seconds or returns 503 service spike.
- **Action:**
  1. Our `lib/ai/gemini.ts` engine automatically catches errors and cycles across candidate models: `gemini-flash-lite-latest` $\longrightarrow$ `gemini-3.1-flash-lite` $\longrightarrow$ `gemini-3.5-flash` $\longrightarrow$ `gemini-3.6-flash`.
  2. The homepage has an **"Instant Demo Mode"** button that initializes a pre-generated verified assessment session so you can skip generation delays entirely and demo the full experience.

### Backup Plan 3: Judges Ask for a Different Subject / Chapter
- **Symptom:** Judge asks *"Does this work for Real Numbers or Polynomials instead of Quadratics?"*
- **Action:**
  1. Click **Start** in the navigation header $\rightarrow$ Select **"Polynomials"** or **"Real Numbers"**.
  2. The app already has 20+ seeded CBSE Class 10 misconception taxonomies live in Supabase and generates the exact diagnostic for that chapter instantly.
