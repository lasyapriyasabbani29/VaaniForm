import React from 'react';
import { MessageSquareText, Cpu } from 'lucide-react';

export function TranscriptPanel({ transcript, engineInfo }) {
  if (!transcript) return null;

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <MessageSquareText className="w-4 h-4" />
          <span>WHAT I HEARD (SPEECH TRANSCRIPT)</span>
        </div>

        {engineInfo?.transcription && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>Engine: {engineInfo.transcription}</span>
          </div>
        )}
      </div>

      <div className="p-3.5 bg-slate-900/70 border border-slate-700/50 rounded-lg text-slate-200 text-sm italic font-sans leading-relaxed">
        "{transcript}"
      </div>
    </div>
  );
}
