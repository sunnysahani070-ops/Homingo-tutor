'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MathView } from '@/components/math/math-view';
import { MicButton, AudioSpeakerButton } from '@/components/voice/mic-button';
import { PhotoUploader } from '@/components/tutor/photo-uploader';
import { CleanQuestion } from '@/lib/types';
import {
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hintLevel?: number;
}

export default function TutorSessionPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('hinglish');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);

  // Practice problem state
  const [practiceQuestion, setPracticeQuestion] = useState<CleanQuestion | null>(null);
  const [selectedPracticeOpt, setSelectedPracticeOpt] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);
  const [isCheckingPractice, setIsCheckingPractice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sId = localStorage.getItem('homingo_session_id');
    const lang = (localStorage.getItem('homingo_language') as any) || 'hinglish';
    setSessionId(sId);
    setLanguage(lang);

    // Initial greeting from Socratic Tutor
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_1',
          role: 'assistant',
          content:
            lang === 'hi'
              ? 'नमस्ते! मैंने आपकी डायग्नोस्टिक परीक्षा का विश्लेषण किया है। आइए मिलकर उन गलतियों को समझें और उन्हें दूर करें। आप कोई भी सवाल पूछ सकते हैं या "Hint" मांग सकते हैं!'
              : lang === 'hinglish'
              ? 'Namaste! Maine aapke diagnostic assessment ka analysis kiya hai. Chalo milkar aapke weak concepts ko clear karte hain taaki Board exam me 100% marks aayein! Aap apna solution yahan likh sakte ho, bol sakte ho, ya photo upload kar sakte ho.'
              : "Hello! I've analyzed your diagnostic assessment. Let's work through the specific concepts where you got stuck. Remember: I will guide you Socratically so you discover the method yourself. Ask any question or request a hint to begin!",
          hintLevel: 0,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const sendMessage = async (textToSend?: string, isHintRequest: boolean = false) => {
    const content = textToSend || inputText;
    if (!content.trim() || !sessionId || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: isHintRequest ? `[Hint Requested]: ${content}` : content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/tutor/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content,
          hintRequested: isHintRequest,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to connect to tutor');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMsgId = `assistant_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', hintLevel: currentHintLevel },
      ]);

      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulated += parsed.text;
                  if (parsed.hintLevel !== undefined) {
                    setCurrentHintLevel(parsed.hintLevel);
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
                    )
                  );
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I hit a slight connection glitch. Please send your message again!',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRequestHint = () => {
    const nextLevel = Math.min(4, currentHintLevel + 1);
    const hintPrompts = [
      'Can you give me a conceptual hint?',
      'Please give me a small nudge or clue.',
      'Show me the next algebraic step.',
      'Can you work through one full step with me?',
      'Please explain this step-by-step completely.',
    ];
    sendMessage(hintPrompts[nextLevel] || 'Give me a hint.', true);
  };

  const handleGeneratePractice = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/tutor/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          concept: 'Target Focus Concept',
          language,
        }),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setPracticeQuestion(data.question);
        setSelectedPracticeOpt(null);
        setPracticeFeedback(null);
      }
    } catch {}
  };

  const handleCheckPractice = async () => {
    if (!sessionId || !practiceQuestion || !selectedPracticeOpt) return;
    setIsCheckingPractice(true);

    try {
      const res = await fetch('/api/tutor/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: practiceQuestion.id,
          selectedAnswer: selectedPracticeOpt,
        }),
      });

      const data = await res.json();
      setPracticeFeedback(data.feedback);
    } catch (err: any) {
      setPracticeFeedback('Error validating practice.');
    } finally {
      setIsCheckingPractice(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto space-y-4 pb-4">
      {/* Tutor Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            HT
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Socratic Math Tutor
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Class 10 CBSE</span>
              <span>•</span>
              <span className="capitalize">{language} mode</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Photo solve button */}
          <PhotoUploader
            guestId={sessionId || 'guest'}
            onAnalysisComplete={(res) => {
              if (res.remedial_question) {
                sendMessage(`I uploaded my solution. Here is where I need guidance: ${res.remedial_question}`);
              }
            }}
          />

          {/* Hint Ladder Button */}
          <button
            type="button"
            onClick={handleRequestHint}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Hint {currentHintLevel < 4 ? currentHintLevel + 1 : 4}</span>
          </button>

          {/* Retest CTA */}
          <button
            type="button"
            onClick={() => router.push('/retest')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition-all"
          >
            <span>Take Retest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 min-h-[360px] max-h-[500px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
              <span>{msg.role === 'user' ? 'You' : 'Homingo Tutor'}</span>
              {msg.role === 'assistant' && msg.content && (
                <AudioSpeakerButton text={msg.content} language={language} />
              )}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm'
              }`}
            >
              <MathView content={msg.content} />
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Homingo Tutor is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Targeted Practice Widget */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Verify Understanding with Practice
          </span>
          <button
            type="button"
            onClick={handleGeneratePractice}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {practiceQuestion ? 'Try Another Problem' : 'Generate Practice Problem'}
          </button>
        </div>

        {practiceQuestion && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <MathView content={practiceQuestion.question_text} className="font-semibold text-sm" />

            <div className="grid grid-cols-2 gap-2">
              {practiceQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedPracticeOpt(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    selectedPracticeOpt === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                    {opt.id}
                  </span>
                  <MathView content={opt.text} inline />
                </button>
              ))}
            </div>

            {selectedPracticeOpt && !practiceFeedback && (
              <button
                type="button"
                onClick={handleCheckPractice}
                disabled={isCheckingPractice}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                {isCheckingPractice ? 'Verifying...' : 'Check Practice Answer'}
              </button>
            )}

            {practiceFeedback && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <MathView content={practiceFeedback} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Bar with STT Mic */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'अपना उत्तर या सवाल यहाँ लिखें...'
                : language === 'hinglish'
                ? 'Apna answer ya doubt yahan likho...'
                : 'Type your answer, step, or question...'
            }
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white shadow-sm"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            <MicButton
              language={language}
              onTranscript={(transcript) => {
                setInputText(transcript);
                sendMessage(transcript);
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isStreaming}
          className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
