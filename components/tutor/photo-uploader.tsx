'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { VisionAuditResult } from '@/lib/types';
import { MathView } from '@/components/math/math-view';

interface PhotoUploaderProps {
  guestId?: string;
  onAnalysisComplete?: (result: VisionAuditResult) => void;
}

export function PhotoUploader({ guestId = 'guest-user', onAnalysisComplete }: PhotoUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VisionAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('Image exceeds 5MB limit');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
      setResult(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('guestId', guestId);

      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze photo');
      }

      setResult(data.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong analyzing image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 transition-all shadow-sm active:scale-95"
      >
        <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Photo Solve</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Upload Handwritten Solution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our Vision Tutor pinpoints the exact line where a mistake happened.
            </p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              handleReset();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-indigo-50/30 dark:bg-indigo-950/20 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Tap to take photo or choose image
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative max-h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={previewUrl}
                  alt="Student handwritten solution"
                  className="w-full h-full object-contain mx-auto"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!result && (
                <button
                  type="button"
                  onClick={handleUploadAndAnalyze}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing your steps with Vision AI...
                    </>
                  ) : (
                    'Audit My Solution'
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Transcribed Problem:</span>
                <MathView content={result.transcription} className="text-slate-600 dark:text-slate-400 font-mono" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Step-by-Step Audit</h4>
                {result.detected_steps.map((s) => (
                  <div
                    key={s.step_number}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                      s.is_correct
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 ring-2 ring-rose-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {s.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        )}
                        Step {s.step_number}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30">
                        {s.is_correct ? 'Correct' : 'Mistake Found Here'}
                      </span>
                    </div>
                    <MathView content={s.expression} className="font-semibold text-sm" />
                    <p className="text-[11px] opacity-90">{s.critique}</p>
                  </div>
                ))}
              </div>

              {result.remedial_question && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                  <span className="font-bold block mb-1">Tutor Guiding Check:</span>
                  <MathView content={result.remedial_question} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
