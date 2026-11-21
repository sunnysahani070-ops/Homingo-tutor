'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ProofReport } from '@/lib/types';
import { MasteryChart } from '@/components/report/mastery-chart';
import { ShareModal } from '@/components/report/share-modal';
import { Loader2, ArrowLeft, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

function ReportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const reportId = params.id as string;
  const token = searchParams.get('token');

  const [report, setReport] = useState<ProofReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const url = `/api/report/${reportId}${token ? `?token=${token}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to load report');
        setReport(data.report);
      } catch (err: any) {
        setError(err.message || 'Report not found');
      } finally {
        setIsLoading(false);
      }
    }

    if (reportId) {
      loadReport();
    }
  }, [reportId, token]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Loading Verified Proof of Learning...
        </h2>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center space-y-4">
        <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Report Unavailable</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300">
          {error || 'This proof report could not be found or has expired.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-in fade-in duration-300">
      {/* Top Bar with Navigation & Share Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <ShareModal
          reportId={report.id}
          shareToken={report.shareToken}
          chapter={report.chapter}
          learningGain={report.learningGain}
        />
      </div>

      {/* Hero Visual Mastery Report */}
      <MasteryChart report={report} />

      {/* Next Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/revise"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all shadow-sm space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">View Spaced Revision Queue</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Concepts scheduled for 1, 3, and 7-day review based on your retention curve.
          </p>
        </Link>

        <Link
          href="/onboard"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all shadow-sm space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Master Another Chapter</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Start a fresh diagnostic on Real Numbers, Polynomials, or Linear Equations.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default function ProofReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading Report...</div>}>
      <ReportContent />
    </Suspense>
  );
}

