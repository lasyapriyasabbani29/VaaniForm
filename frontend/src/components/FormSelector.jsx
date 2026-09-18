import React from 'react';
import { FileText } from 'lucide-react';

export function FormSelector({ formSchema }) {
  if (!formSchema) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Selected Form</span>
          <h3 className="text-sm font-bold text-slate-100">{formSchema.form_name}</h3>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 border border-slate-600/60 font-medium">
          {formSchema.fields?.length || 0} Fields
        </span>
      </div>
    </div>
  );
}
