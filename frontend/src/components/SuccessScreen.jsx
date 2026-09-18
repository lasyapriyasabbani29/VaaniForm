import React from 'react';
import { CheckCircle2, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

export function SuccessScreen({ result, formValues, onReset }) {
  if (!result) return null;

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 text-center max-w-2xl mx-auto my-8 shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">✓ FORM SUBMITTED SUCCESSFULLY</h2>
      <p className="text-xs text-slate-400 mb-6">
        {result.message || 'Your application has been processed local-first.'}
      </p>

      {/* Submission Reference Card */}
      <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 mb-6 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Submission ID:</span>
          <span className="font-mono font-bold text-indigo-400">{result.submission_id}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Timestamp:</span>
          <span className="text-slate-300 font-mono text-[11px]">{new Date(result.timestamp).toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between pt-3 text-xs">
          <span className="text-slate-400 font-medium">Privacy Status:</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Processed Locally
          </span>
        </div>
      </div>

      {/* Submitted Summary Preview */}
      <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-4 mb-8 text-left">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Submitted Details Summary</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {Object.entries(formValues).map(([key, val]) => (
            val ? (
              <div key={key} className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{key.replace(/_/g, ' ')}</span>
                <span className="text-slate-100 font-medium">{val}</span>
              </div>
            ) : null
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Fill Another Form</span>
      </button>
    </div>
  );
}
