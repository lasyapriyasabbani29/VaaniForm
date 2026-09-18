import React from 'react';
import { Volume2, Globe, ShieldCheck } from 'lucide-react';

export function Header({ activeLanguage, onLanguageChange }) {
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
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Offline AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">"Speak. Watch it fill. Confirm."</p>
          </div>
        </div>

        {/* Right Section: Language Selector */}
        <div className="flex items-center gap-3">
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
