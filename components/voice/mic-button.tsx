'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  language?: 'en' | 'hi' | 'hinglish';
  disabled?: boolean;
}

export function MicButton({ onTranscript, language = 'en', disabled = false }: MicButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setPermissionError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        onTranscript(transcript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone permission blocked. Please allow mic in browser settings.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Android Chrome.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !isSupported}
        aria-label={isListening ? 'Stop recording voice' : 'Speak your answer'}
        className={`relative p-3 rounded-full transition-all flex items-center justify-center shadow-md ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-900/50'
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}

        {/* Pulsing indicator when recording */}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </button>

      {permissionError && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-2 rounded-lg shadow-lg z-50 text-center">
          {permissionError}
        </div>
      )}
    </div>
  );
}

/**
 * Text-to-Speech Player component that reads tutor explanation aloud
 */
export function AudioSpeakerButton({
  text,
  language = 'en',
}: {
  text: string;
  language?: 'en' | 'hi' | 'hinglish';
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/\$\$[\s\S]*?\$\$/g, ' equation ')
      .replace(/\$[^\$]+?\$/g, ' formula ')
      .replace(/[\*_#]/g, '')
      .trim();
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      return;
    }

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    // Check if browser speechSynthesis is available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={isPlaying ? 'Stop voice reading' : 'Read aloud with voice'}
      aria-label="Read message aloud"
      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {isPlaying ? <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}
