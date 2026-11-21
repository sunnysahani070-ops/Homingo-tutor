'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, RotateCcw, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RevisionItem {
  id: string;
  chapter: string;
  concept: string;
  next_review_at: string;
  interval_days: number;
  repetition_count: number;
  mastery_level: number;
}

export default function ReviseQueuePage() {
  const [dueItems, setDueItems] = useState<RevisionItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<RevisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadQueue() {
      try {
        const guestId = localStorage.getItem('homingo_guest_id') || '';
        const res = await fetch(`/api/revise/queue?guestId=${guestId}`);
        const data = await res.json();
        if (data.success) {
          setDueItems(data.dueItems || []);
          setUpcomingItems(data.upcomingItems || []);
        }
      } catch (err) {
        console.error('Failed to load revision queue:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadQueue();
  }, []);

  const handleMarkReviewed = async (item: RevisionItem) => {
    setCompletingId(item.id);
    try {
      const res = await fetch('/api/revise/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, score: 0.9 }),
      });
      const data = await res.json();
      if (data.success) {
        // Move from due to upcoming
        setDueItems((prev) => prev.filter((i) => i.id !== item.id));
        setUpcomingItems((prev) => [...prev, data.updatedItem]);
      }
    } catch {} finally {
      setCompletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Loading Spaced Revision Queue...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8 animate-in fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Calendar className="w-3.5 h-3.5" />
          Spaced Repetition (1 • 3 • 7 Days)
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Smart Revision Queue
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Review concepts at scientific intervals to cement neural pathways before the Class 10 Board exam.
        </p>
      </div>

      {/* Due Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Due for Review Today ({dueItems.length})
          </h2>
        </div>

        {dueItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">All caught up!</h3>
            <p className="text-xs text-slate-400">No concepts are overdue for revision right now.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.concept}</span>
                  <span className="text-[11px] text-slate-500">{item.chapter} • Interval: {item.interval_days}d</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleMarkReviewed(item)}
                  disabled={completingId === item.id}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completingId === item.id ? 'Saving...' : 'Mark Mastered'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Scheduled */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Scheduled Retention Milestones ({upcomingItems.length})
        </h2>

        {upcomingItems.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
            Complete a diagnostic and retest cycle to automatically schedule memory retention intervals.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.concept}</span>
                  <span className="text-[11px] text-slate-400">{item.chapter}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                    Due in {item.interval_days} days
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.next_review_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
