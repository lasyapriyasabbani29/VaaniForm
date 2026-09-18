import React from 'react';
import { Volume2, Globe, ShieldCheck, Sparkles, Server } from 'lucide-react';

export function Header({ activeLanguage, onLanguageChange, appMode, onModeChange }) {
  const isOfflineMode = appMode === 'LOCAL_OFFLINE';

  return (
    <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-50 py-3.5 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">VaaniForm</h1>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                isOfflineMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isOfflineMode ? '🔒 Local Offline' : '⚡ Public Demo'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">"Speak. Watch it fill. Confirm."</p>
          </div>
        </div>

        {/* Right Section: Mode Switcher & Language Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Operational Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => onModeChange('LOCAL_OFFLINE')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                isOfflineMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Local Offline</span>
            </button>

            <button
              onClick={() => onModeChange('PUBLIC_DEMO')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                !isOfflineMode
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Demo</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Globe className="w-4 h-4 text-indigo-400" />
            <select
              value={activeLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-800 text-white">English (Active)</option>
              <option value="hi" className="bg-slate-800 text-white">Hindi (Stretch Goal)</option>
              <option value="te" className="bg-slate-800 text-white">Telugu (Stretch Goal)</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
}
