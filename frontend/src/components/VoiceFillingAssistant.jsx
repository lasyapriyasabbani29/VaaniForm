import React, { useEffect, useState } from 'react';
import { Mic, Square, Volume2, Check, RotateCcw, ChevronLeft, ChevronRight, SkipForward, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export function VoiceFillingAssistant({
  currentFieldIndex,
  totalFields,
  currentField,
  formValues,
  isRecording,
  recordingTime,
  isProcessing,
  transcript,
  extractedValue,
  engineInfo,
  errorMessage,
  onStartRecording,
  onStopRecording,
  onConfirmAnswer,
  onRetryAnswer,
  onPrevField,
  onNextField,
  onSkipField,
  onSpeakQuestion
}) {
  const [answerConfirmed, setAnswerConfirmed] = useState(false);

  useEffect(() => {
    // Reset confirmation state when moving to a new field
    setAnswerConfirmed(false);
    
    // Automatically read question aloud via TTS when entering new field
    if (currentField && currentField.question) {
      onSpeakQuestion(currentField.question);
    }
  }, [currentFieldIndex]);

  if (!currentField) return null;

  const progressPercent = Math.round(((currentFieldIndex + 1) / totalFields) * 100);
  const isLastField = currentFieldIndex === totalFields - 1;
  const hasValue = Boolean(extractedValue || formValues[currentField.id]);
  const displayVal = extractedValue ?? formValues[currentField.id] ?? '';

  return (
    <div className="max-w-3xl mx-auto my-6 p-6 md:p-8 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl">
      
      {/* Progress Bar & Field Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
          <span>Field {currentFieldIndex + 1} of {totalFields}</span>
          <span className="text-indigo-400">{progressPercent}% Completed</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden p-0.5 border border-slate-600/60">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-700/80 rounded-2xl p-6 text-center mb-6 shadow-inner">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase mb-3">
          <span>{currentField.label}</span>
          {currentField.required && <span className="text-rose-400 font-bold">* Required</span>}
        </div>

        {/* Spoken Question */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-snug">
          "{currentField.question || `Please tell me your ${currentField.label}.`}"
        </h3>

        {/* Speak Question Aloud Button */}
        <button
          onClick={() => onSpeakQuestion(currentField.question || `Please tell me your ${currentField.label}.`)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span>Read Question Aloud</span>
        </button>
      </div>

      {/* Recording Microphone Controls */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          {isRecording && (
            <div className="absolute -inset-4 rounded-full bg-indigo-500/30 animate-pulse-ring pointer-events-none" />
          )}

          {!isRecording ? (
            <button
              onClick={onStartRecording}
              disabled={isProcessing}
              className={`w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-indigo-600/40 transform hover:scale-105 transition-all duration-200 cursor-pointer ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Mic className="w-10 h-10" />
              <span className="text-[10px] font-bold tracking-wider uppercase">SPEAK ANSWER</span>
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-rose-600/40 transform hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Square className="w-10 h-10 fill-current" />
              <span className="text-[10px] font-bold tracking-wider uppercase">STOP ({formatDuration(recordingTime)})</span>
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 animate-pulse">
            Processing with Whisper.cpp & Ollama...
          </div>
        )}
      </div>

      {/* Answer Verification Card */}
      {hasValue && !isProcessing && (
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 mb-6 shadow-md">
          {/* What Whisper Heard */}
          {transcript && (
            <div className="mb-3 text-xs">
              <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                WHAT WHISPER HEARD:
              </span>
              <span className="text-slate-200 italic font-mono bg-slate-800/80 px-2.5 py-1 rounded block border border-slate-700">
                "{transcript}"
              </span>
            </div>
          )}

          {/* Value Inserted */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              VALUE INSERTED FOR {currentField.label.toUpperCase()}:
            </span>
            <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <span className="text-lg font-bold text-white font-mono">{displayVal}</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" /> Checked
              </span>
            </div>
          </div>

          {/* Confirm or Change Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={onRetryAnswer}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>✎ Change / Re-speak</span>
            </button>

            <button
              onClick={() => {
                setAnswerConfirmed(true);
                onConfirmAnswer(currentField.id, displayVal);
              }}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>✓ Correct & Next</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Navigation Stepper */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs">
        <button
          onClick={onPrevField}
          disabled={currentFieldIndex === 0}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold border border-slate-600 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={onSkipField}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Skip Field</span>
        </button>

        <button
          onClick={onNextField}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <span>{isLastField ? 'Review Complete Form' : 'Next Field'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
