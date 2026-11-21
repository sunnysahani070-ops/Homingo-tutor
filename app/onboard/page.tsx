'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CBSE_CHAPTERS, CBSEChapter, LanguageCode } from '@/lib/types';
import { BookOpen, Languages, Sparkles, ChevronRight, Check, Target, Loader2 } from 'lucide-react';

export default function OnboardPage() {
  const router = useRouter();
  const [chapter, setChapter] = useState<CBSEChapter>('Quadratic Equations');
  const [language, setLanguage] = useState<LanguageCode>('hinglish');
  const [goal, setGoal] = useState('Master Class 10 Board Exam Concepts');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let guestId = '';
    if (typeof window !== 'undefined') {
      guestId = localStorage.getItem('homingo_guest_id') || `guest_${Date.now()}`;
      localStorage.setItem('homingo_guest_id', guestId);
      localStorage.setItem('homingo_chapter', chapter);
      localStorage.setItem('homingo_language', language);
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          grade: 'Class 10 CBSE',
          language,
          targetChapter: chapter,
          goal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      router.push('/diagnostic');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Step 1 of 4 • Personalized Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Customize Your Learning Session
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose what you want to master today and how you want the tutor to explain.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Tutor Language
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { id: 'en' as const, title: 'English', desc: 'CBSE standard English' },
              { id: 'hinglish' as const, title: 'Hinglish', desc: 'Roman-script Hindi + English' },
              { id: 'hi' as const, title: 'हिन्दी', desc: 'शुद्ध हिन्दी (Devanagari)' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  language === lang.id
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{lang.title}</span>
                  {language === lang.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 leading-tight">
                  {lang.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chapter Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            CBSE Class 10 Math Chapter
          </label>
          <div className="space-y-2">
            {CBSE_CHAPTERS.map((chap) => (
              <button
                key={chap}
                type="button"
                onClick={() => setChapter(chap)}
                className={`w-full p-4 rounded-2xl text-left border flex items-center justify-between transition-all ${
                  chapter === chap
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm text-slate-900 dark:text-white">{chap}</span>
                {chapter === chap && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Target Goal */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Your Learning Goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Score 90+ in Boards, resolve factoring mistakes"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl font-extrabold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Adaptive Diagnostic...</span>
            </>
          ) : (
            <>
              <span>Begin Diagnostic Assessment</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
