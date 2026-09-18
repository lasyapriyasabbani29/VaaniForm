import React from 'react';
import { Lock, Cpu, Server } from 'lucide-react';

export function PrivacyBadge({ health }) {
  const isWhisperReady = health?.whisper_available ?? false;
  const isOllamaReady = health?.ollama_available ?? false;
  const configuredModel = health?.model || 'gemma3:4b';
  const sttEngine = health?.active_transcription_engine || 'whisper-cli.exe';

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-xl p-4 my-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Privacy Headline */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">🔒 LOCAL DEVICE AI PIPELINE</span>
            </div>
            <p className="text-xs text-slate-400">
              No cloud AI. Personal data processed locally on this Windows device.
            </p>
          </div>
        </div>

        {/* Live Local System Service Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Whisper Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
            isWhisperReady 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            <span>Whisper.cpp:</span>
            <span className="font-bold">{isWhisperReady ? '● Ready (whisper-cli.exe)' : '○ Unconfigured'}</span>
          </div>

          {/* Ollama Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
            isOllamaReady 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            <Server className="w-3.5 h-3.5" />
            <span>Ollama:</span>
            <span className="font-bold">{isOllamaReady ? '● Ready' : '○ Not Running'}</span>
          </div>

          {/* Active Model */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
            <span>Model: {configuredModel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
