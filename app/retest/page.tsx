'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CleanQuestion } from '@/lib/types';
import { MathView } from '@/components/math/math-view';
import confetti from 'canvas-confetti';
import { Loader2, ArrowRight, Award, AlertCircle } from 'lucide-react';

export default function RetestPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CleanQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    async function initRetest() {
      try {
        const sId = localStorage.getItem('homingo_session_id');
        const language = localStorage.getItem('homingo_language') || 'hinglish';

        if (!sId) {
          router.push('/onboard');
          return;
        }

        setSessionId(sId);

        const res = await fetch('/api/retest/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sId, language }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start retest');

        setCurrentQuestion(data.firstQuestion);
        setStartTime(Date.now());
      } catch (err: any) {
        setError(err.message || 'Error generating retest');
      } finally {
        setIsLoading(false);
      }
    }

    initRetest();
  }, [router]);

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitting) return;
    setSelectedOption(optId);
  };

  const handleConfirmAnswer = async () => {
    if (!sessionId || !currentQuestion || !selectedOption || isSubmitting) return;
    setIsSubmitting(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await fetch('/api/retest/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedAnswer: selectedOption,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit retest answer');

      if (data.isFinished || !data.nextQuestion) {
        // Retest finished: compute learning gain and generate proof report
        const finishRes = await fetch('/api/retest/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const finishData = await finishRes.json();
        if (!finishRes.ok) throw new Error(finishData.error || 'Failed to finalize report');

        // Confetti celebration
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        router.push(`/report/${finishData.reportId}?token=${finishData.shareToken}`);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setSelectedOption(null);
        setStartTime(Date.now());
      }
    } catch (err: any) {
      setError(err.message || 'Retest submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Generating Fresh Retest Questions...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Guaranteeing zero duplicate questions via SHA-256 hash validation to truly prove learning.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Retest Generation Glitch</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Award className="w-3.5 h-3.5" />
          Retest Question {currentQuestion?.currentIndex} of {currentQuestion?.totalQuestions}
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {currentQuestion?.concept}
        </span>
      </div>

      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{
            width: `${((currentQuestion?.currentIndex || 1) / (currentQuestion?.totalQuestions || 5)) * 100}%`,
          }}
        />
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <MathView
          content={currentQuestion?.question_text || ''}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
        />

        <div className="space-y-3">
          {currentQuestion?.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id as any)}
              className={`w-full p-4 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                selectedOption === opt.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  selectedOption === opt.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.id}
              </div>
              <MathView content={opt.text} className="text-sm font-medium text-slate-800 dark:text-slate-200" inline />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleConfirmAnswer}
        disabled={!selectedOption || isSubmitting}
        className="w-full py-4 rounded-2xl font-extrabold text-base bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Calculating Proof of Learning...</span>
          </>
        ) : (
          <>
            <span>Submit Retest Answer</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
