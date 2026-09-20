'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
}

// Define minimal SpeechRecognition types for browser compatibility
interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function VoiceInputControl({ onTranscriptChange }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API availability on client mount
    const win = typeof window !== 'undefined' ? (window as IWindowWithSpeech) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // English (India) with Hindi loan words support

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          onTranscriptChange(finalChunk.trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
        } else {
          setErrorMessage(`Audio capture error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition initialization failed:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptChange]);

  const toggleListening = () => {
    setErrorMessage(null);
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  if (isSupported === false) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
        <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
        <span>Voice input is not supported in this browser. Please type your complaint.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              isListening
                ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-glow-purple animate-pulse'
                : 'bg-command-surface hover:bg-slate-800 text-slate-300 border border-command-border'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Record Voice Complaint</span>
              </>
            )}
          </button>

          {isListening && (
            <Badge variant="rose" pulse className="text-[10px]">
              Listening...
            </Badge>
          )}
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          Browser Web Speech API
        </span>
      </div>

      {/* Interim Live Transcript */}
      {interimTranscript && (
        <div className="p-2 rounded-md bg-command-card border border-cyan-500/30 text-xs text-cyan-200 font-mono italic">
          &ldquo;{interimTranscript}&rdquo;
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
