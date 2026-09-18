import React from 'react';
import { Mic, Square, Play, Sparkles, AlertTriangle } from 'lucide-react';
import { UI_STATES } from '../hooks/useVoiceForm';
import { formatDuration } from '../utils/formatters';

export function VoiceRecorder({
  uiState,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onRunDemo,
  errorMessage
}) {
  const isListening = uiState === UI_STATES.LISTENING;
  const isProcessing = [
    UI_STATES.PROCESSING,
    UI_STATES.TRANSCRIBING,
    UI_STATES.EXTRACTING
  ].includes(uiState);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 md:p-8 text-center shadow-xl">
      <div className="max-w-md mx-auto flex flex-col items-center">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-1">
          {isListening ? 'Listening to your voice...' : 'Fill forms. Just speak.'}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isListening 
            ? 'Speak your details naturally (e.g., name, date of birth, phone, address).'
            : 'Tap the microphone button below and speak in your own words.'}
        </p>

        {/* Large Microphone Button */}
        <div className="relative mb-6">
          {isListening && (
            <div className="absolute -inset-4 rounded-full bg-indigo-500/30 animate-pulse-ring pointer-events-none" />
          )}

          {!isListening ? (
            <button
              onClick={onStartRecording}
              disabled={isProcessing}
              className={`w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-indigo-600/40 transform hover:scale-105 transition-all duration-200 cursor-pointer ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}

            >
              <Mic className="w-10 h-10" />
              <span className="text-[11px] font-bold tracking-wider uppercase">TAP TO SPEAK</span>
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-rose-600/40 transform hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Square className="w-10 h-10 fill-current" />
              <span className="text-[11px] font-bold tracking-wider uppercase">STOP ({formatDuration(recordingTime)})</span>
            </button>
          )}
        </div>

        {/* Demo Mode Button */}
        <div className="mt-2 flex flex-col items-center">
          <button
            onClick={onRunDemo}
            disabled={isListening || isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/60 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Try Demo (Predefined Sample Speech)</span>
          </button>
          <span className="text-[11px] text-slate-500 mt-1">
            Uses full local pipeline (Whisper / Ollama)
          </span>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 text-left w-full">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Notice / Action Required:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
