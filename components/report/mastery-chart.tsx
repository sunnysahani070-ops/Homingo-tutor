'use client';

import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Clock, HelpCircle, Award, RotateCcw } from 'lucide-react';
import { ProofReport } from '@/lib/types';
import { MathView } from '../math/math-view';
import Link from 'next/link';

interface MasteryChartProps {
  report: ProofReport;
}

export function MasteryChart({ report }: MasteryChartProps) {
  const concepts = Array.from(
    new Set([
      ...Object.keys(report.beforeMastery || {}),
      ...Object.keys(report.afterMastery || {}),
    ])
  );

  const gainPositive = report.learningGain > 0;

  return (
    <div className="space-y-6">
      {/* Hero Headline Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl ${
          gainPositive
            ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 shadow-indigo-500/20'
            : 'bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900 shadow-slate-500/20'
        }`}
      >
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border mb-3 ${
                gainPositive
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
              }`}
            >
              {gainPositive ? (
                <>
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Verified Proof of Learning</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Honest Audit: Revision Required</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {report.chapter}
            </h2>
            <p className="text-sm text-indigo-100/90 mt-1">
              Class 10 CBSE Math • Real-time Diagnostic & Retest Evaluation
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs uppercase font-semibold text-indigo-200">Total Learning Gain</span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-2">
              <span>{gainPositive ? `+${report.learningGain}%` : `${report.learningGain}%`}</span>
              {gainPositive ? (
                <TrendingUp className="w-6 h-6 text-emerald-300" />
              ) : (
                <TrendingDown className="w-6 h-6 text-amber-300" />
              )}
            </div>
            <span className="text-xs text-indigo-200 font-medium">
              Baseline {report.baselineScore}% ➔ Retest {report.retestScore}%
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[11px] uppercase font-semibold text-indigo-200 block">Baseline</span>
            <span className="text-xl font-extrabold text-white">{report.baselineScore}%</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[11px] uppercase font-semibold text-indigo-200 block">After Tutoring</span>
            <span className={`text-xl font-extrabold ${gainPositive ? 'text-emerald-300' : 'text-amber-300'}`}>
              {report.retestScore}%
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[11px] uppercase font-semibold text-indigo-200 block">Hints Used</span>
            <span className="text-xl font-extrabold text-white flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-indigo-300" />
              {report.hintsUsed}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[11px] uppercase font-semibold text-indigo-200 block">Time Invested</span>
            <span className="text-xl font-extrabold text-white flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-300" />
              {report.timeSpentMinutes}m
            </span>
          </div>
        </div>
      </div>

      {/* Honest Remedial Card (when learner did not improve) */}
      {!gainPositive && (
        <div className="rounded-3xl p-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                Honest Diagnosis: Further Practice Recommended
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              We prove genuine learning, so we don't pretend a student understood when they're still stuck. Active misconceptions were detected during the retest. Let&apos;s loop back to the Socratic Tutor with an alternative step-by-step approach!
            </p>
          </div>
          <Link
            href="/tutor?retry=true"
            className="shrink-0 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Loop Back to Tutoring</span>
          </Link>
        </div>
      )}

      {/* Concept by Concept Before vs After Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Concept Mastery Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparing pre-tutoring diagnostic vs post-tutoring retest for each syllabus topic.
          </p>
        </div>

        <div className="space-y-5">
          {concepts.map((concept) => {
            const beforeVal = Math.round((report.beforeMastery?.[concept] || 0) * 100);
            const afterVal = Math.round((report.afterMastery?.[concept] || 0) * 100);
            const diff = afterVal - beforeVal;

            return (
              <div key={concept} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{concept}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">Before: {beforeVal}%</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">Now: {afterVal}%</span>
                    {diff > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        +{diff}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual progress bar */}
                <div className="space-y-1">
                  {/* Before Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-slate-300 dark:bg-slate-700 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(4, beforeVal)}%` }}
                    />
                  </div>
                  {/* After Bar */}
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${Math.max(4, afterVal)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Misconceptions Resolved & Remaining */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resolved */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
              Misconceptions Resolved ({report.misconceptionsResolved?.length || 0})
            </h4>
          </div>
          {report.misconceptionsResolved?.length > 0 ? (
            <ul className="space-y-2">
              {report.misconceptionsResolved.map((m) => (
                <li
                  key={m.id}
                  className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="font-bold block text-emerald-900 dark:text-emerald-300">{m.title}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
              No previous misconceptions flagged in this session.
            </p>
          )}
        </div>

        {/* Remaining / Revision Queue */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
              Areas to Revise ({report.misconceptionsRemaining?.length || 0})
            </h4>
          </div>
          {report.misconceptionsRemaining?.length > 0 ? (
            <ul className="space-y-2">
              {report.misconceptionsRemaining.map((m) => (
                <li
                  key={m.id}
                  className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="font-bold block text-amber-900 dark:text-amber-300">{m.title}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-white/80 dark:bg-slate-900/60 rounded-2xl text-xs text-slate-600 dark:text-slate-400">
              🎉 100% of tested misconceptions have been resolved! Ready for the next chapter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
