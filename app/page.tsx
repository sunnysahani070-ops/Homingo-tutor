'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Brain,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Mic,
  Camera,
  CheckCircle2,
  TrendingUp,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { CBSE_CHAPTERS } from '@/lib/types';

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';

  const handleLaunchDemo = async () => {
    // Demo Mode: pre-loads a real CBSE learner profile and sets up session
    const demoGuestId = `demo_learner_${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('homingo_guest_id', demoGuestId);
      localStorage.setItem('homingo_language', 'hinglish');
      localStorage.setItem('homingo_chapter', 'Quadratic Equations');
    }

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: demoGuestId,
          grade: 'Class 10 CBSE',
          language: 'hinglish',
          targetChapter: 'Quadratic Equations',
          goal: 'Master Board Exam High-Yield Concepts',
        }),
      });

      router.push('/diagnostic');
    } catch (err) {
      router.push('/diagnostic');
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('homingo_guest_id');
      localStorage.removeItem('homingo_session_id');
      localStorage.removeItem('homingo_chapter');
    }
    alert('Session reset! You can now start completely fresh.');
  };

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          A Tutor for Every Learner • Hackathon Track
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Finds where you are stuck. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent">
            Proves you actually learned.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Not an app that keeps you busy. An AI Socratic tutor for{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">CBSE Class 10 Mathematics</strong> that
          diagnoses exact misconceptions, teaches in English, Hindi, and Hinglish with KaTeX math, and generates a
          verified Proof of Learning report.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/onboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Learning Free</span>
            <ChevronRight className="w-5 h-5" />
          </Link>

          <button
            type="button"
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-base bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Instant Demo Mode</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
          <span>⚡ Real-time Gemini 3.8 Flash</span>
          <span>•</span>
          <span>🔒 Supabase RLS Protected</span>
          <span>•</span>
          <button
            onClick={handleResetSession}
            className="hover:text-slate-600 dark:hover:text-slate-200 underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset State
          </button>
        </div>
      </section>

      {/* The 4-Stage Core Loop */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            The Science of Mastery
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            DIAGNOSE → TEACH → RETEST → PROVE
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Diagnose */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
              1
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Diagnose Misconceptions</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              6–8 adaptive questions isolate specific mathematical errors (sign errors, factor vs root confusion, discriminant scope), not just "wrong".
            </p>
          </div>

          {/* 2. Teach */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
              2
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Socratic Tutoring</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Never dumps the answer. Follows a 4-level hint ladder (Nudge → Guiding Step → Worked Step → Explanation) in English, Hindi, or Hinglish.
            </p>
          </div>

          {/* 3. Retest */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
              3
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Fresh Variant Retest</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Guaranteed zero repetition via SHA-256 hash checks. Fresh problems with altered numbers test if you truly understand.
            </p>
          </div>

          {/* 4. Prove */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
              4
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Proof of Learning</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Before vs After mastery comparison, learning gain percentage, resolved misconceptions list, shareable link, and verified PDF report.
            </p>
          </div>
        </div>
      </section>

      {/* Chapters Covered */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          CBSE Class 10 Syllabus Chapters Ready to Master
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CBSE_CHAPTERS.map((chapter) => (
            <div
              key={chapter}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{chapter}</span>
                <span className="text-xs text-slate-500 block">5+ Seeded Misconceptions & Math Verification</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Ready
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading Homingo Tutor...</div>}>
      <LandingContent />
    </Suspense>
  );
}

