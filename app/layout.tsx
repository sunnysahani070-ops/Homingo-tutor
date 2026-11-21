import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homingo Tutor — Socratic AI Math Tutor for CBSE Class 10',
  description: 'An AI tutor that diagnoses exact misconceptions, teaches Socratically in English, Hindi, and Hinglish, and proves real learning gain.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                H
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Homingo</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 ml-1.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50">Tutor</span>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium">
                <a href="/onboard" className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">Start</a>
                <a href="/revise" className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">Revise</a>
                <a href="/?demo=1" className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-semibold transition-all">Quick Demo</a>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 pb-20 sm:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
