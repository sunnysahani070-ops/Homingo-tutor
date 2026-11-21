'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CleanQuestion } from '@/lib/types';
import { MathView } from '@/components/math/math-view';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Brain } from 'lucide-react';

export default function DiagnosticPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CleanQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  // Completion State
  const [isFinished, setIsFinished] = useState(false);
  const [finishData, setFinishData] = useState<any>(null);

  useEffect(() => {
    async function initDiagnostic() {
      try {
        let guestId = localStorage.getItem('homingo_guest_id') || `guest_${Date.now()}`;
        const chapter = localStorage.getItem('homingo_chapter') || 'Quadratic Equations';
        const language = localStorage.getItem('homingo_language') || 'hinglish';
        localStorage.setItem('homingo_guest_id', guestId);

        const res = await fetch('/api/diagnostic/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId, chapter, language }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to start diagnostic');
        }

        setSessionId(data.sessionId);
        localStorage.setItem('homingo_session_id', data.sessionId);
        setCurrentQuestion(data.firstQuestion);
        setStartTime(Date.now());
      } catch (err: any) {
        setError(err.message || 'Error loading diagnostic questions');
      } finally {
        setIsLoading(false);
      }
    }

    initDiagnostic();
  }, []);

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitting) return;
    setSelectedOption(optId);
  };

  const handleConfirmAnswer = async () => {
    if (!sessionId || !currentQuestion || !selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await fetch('/api/diagnostic/answer', {
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
      if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

      if (data.isFinished || !data.nextQuestion) {
        // Complete diagnostic
        const finishRes = await fetch('/api/diagnostic/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const finishJson = await finishRes.json();
        setFinishData(finishJson);
        setIsFinished(true);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setSelectedOption(null);
        setStartTime(Date.now());
      }
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Generating Adaptive Diagnostic Exam...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Gemini is synthesizing targeted CBSE Class 10 problems with mathematical verification.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Unable to load exam</h3>
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

  // Finished Screen: Baseline Mastery & Weakest Concept
  if (isFinished && finishData) {
    return (
      <div className="max-w-xl mx-auto py-8 space-y-6 animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Diagnostic Completed
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Your Baseline Mastery Map
          </h2>
          <p className="text-xs text-slate-500">
            Here is what our diagnostic discovered before we start tutoring.
          </p>
        </div>

        {/* Headline Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">Initial Diagnostic Score</span>
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
            {finishData.baselineScore}%
          </div>
          <span className="text-xs text-slate-500 block">
            Target Focus Concept: <strong className="text-slate-900 dark:text-white">{finishData.weakestConcept}</strong>
          </span>
        </div>

        {/* Detected Misconceptions */}
        <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
          <h3 className="font-bold text-amber-950 dark:text-amber-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Specific Misconceptions Detected ({finishData.misconceptionsDetected?.length || 0})
          </h3>
          <ul className="space-y-2">
            {finishData.misconceptionsDetected?.map((m: any) => (
              <li
                key={m.id}
                className="p-3 bg-white/80 dark:bg-slate-900/70 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="font-bold block text-amber-900 dark:text-amber-300">{m.title}</span>
                <span className="text-[11px] text-slate-500">{m.description}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA to Tutor */}
        <button
          onClick={() => router.push('/tutor')}
          className="w-full py-4 rounded-2xl font-extrabold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Brain className="w-5 h-5" />
          <span>Start Socratic Tutoring Session</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Diagnostic Question {currentQuestion?.currentIndex} of {currentQuestion?.totalQuestions}
        </span>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {currentQuestion?.concept}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{
            width: `${((currentQuestion?.currentIndex || 1) / (currentQuestion?.totalQuestions || 6)) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <MathView
          content={currentQuestion?.question_text || ''}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
        />

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion?.options.map((opt) => (
            <button
              key={opt.id}
              data-option-id={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id as any)}
              className={`w-full p-4 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                selectedOption === opt.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  selectedOption === opt.id
                    ? 'bg-indigo-600 text-white'
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

      {/* Confirm Button */}
      <button
        type="button"
        onClick={handleConfirmAnswer}
        disabled={!selectedOption || isSubmitting}
        className="w-full py-4 rounded-2xl font-extrabold text-base bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Grading & Adapting...</span>
          </>
        ) : (
          <>
            <span>Submit Answer</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
