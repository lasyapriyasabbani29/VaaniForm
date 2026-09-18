import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export function FieldConfidence({ score }) {
  if (score === 'detected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3" />
        <span>✓ Detected</span>
      </span>
    );
  }

  if (score === 'verify') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3 h-3" />
        <span>⚠ Please verify</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/50">
      <HelpCircle className="w-3 h-3" />
      <span>○ Not provided</span>
    </span>
  );
}
