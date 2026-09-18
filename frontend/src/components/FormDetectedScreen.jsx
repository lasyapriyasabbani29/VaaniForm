import React from 'react';
import { FileSearch, Mic, CheckCircle2, ArrowRight } from 'lucide-react';

export function FormDetectedScreen({ formTitle, fields, onStartVoiceFilling, onCancel }) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 md:p-8 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl">
      
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700/60 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
          <FileSearch className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Document Analysis Complete</span>
          <h2 className="text-xl font-bold text-white">{formTitle || 'Uploaded Form'}</h2>
        </div>
      </div>

      {/* Field Count Badge */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6 text-center">
        <span className="text-xs text-indigo-300 font-medium block mb-1">Detected Form Fields</span>
        <h3 className="text-2xl font-bold text-white">Your form has {fields.length} fields to fill</h3>
      </div>

      {/* List of Detected Fields */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 mb-8">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Fields to be voice filled:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {fields.map((field, idx) => (
            <div key={field.id} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-200">{field.label}</span>
              </div>

              {field.required && (
                <span className="text-[10px] font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  Required
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold border border-slate-600 cursor-pointer"
        >
          Upload Different Form
        </button>

        <button
          onClick={onStartVoiceFilling}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Mic className="w-5 h-5" />
          <span>START VOICE FILLING</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
