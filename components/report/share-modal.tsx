'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Download, ExternalLink, X } from 'lucide-react';

interface ShareModalProps {
  reportId: string;
  shareToken: string;
  chapter: string;
  learningGain: number;
}

export function ShareModal({ reportId, shareToken, chapter, learningGain }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/report/${reportId}?token=${shareToken}`
    : `https://homingo-tutor.vercel.app/report/${reportId}?token=${shareToken}`;

  const pdfUrl = `/api/report/${reportId}/pdf?token=${shareToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const whatsappText = encodeURIComponent(
    `Check out my verified CBSE Class 10 Math learning gain in ${chapter}: +${learningGain}% mastery! 🚀 View proof: ${shareUrl}`
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Proof Link</span>
        </button>

        <a
          href={pdfUrl}
          download
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </a>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Share Learning Proof
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Anyone with this verified link can inspect your before-and-after concept scores. No private personal data is exposed.
            </p>

            {/* URL Box */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <input
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 w-full outline-none font-mono px-1 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shrink-0 flex items-center gap-1 shadow-sm transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Share buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors"
              >
                <span>Twitter / X</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
