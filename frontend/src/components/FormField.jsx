import React from 'react';
import { FieldConfidence } from './FieldConfidence';

export function FormField({
  field,
  value,
  confidenceScore,
  validationResult,
  onChange
}) {
  const isRequired = field.required;
  const hasError = validationResult?.valid === false;
  const isPopulated = value && value.trim() !== '';

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      hasError 
        ? 'bg-rose-500/5 border-rose-500/40' 
        : isPopulated
        ? 'bg-slate-800/90 border-slate-700/80 shadow-sm'
        : 'bg-slate-800/40 border-slate-700/40'
    }`}>
      {/* Label + Required + Confidence */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label htmlFor={field.id} className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span>{field.label}</span>
          {isRequired && <span className="text-rose-400 font-bold">*</span>}
        </label>

        <FieldConfidence score={confidenceScore} />
      </div>

      {/* Description / Help text */}
      {field.description && (
        <p className="text-[11px] text-slate-400 mb-2">{field.description}</p>
      )}

      {/* Input Field Rendering */}
      {field.type === 'textarea' ? (
        <textarea
          id={field.id}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder || ''}
          rows={3}
          className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            hasError
              ? 'border-rose-500 focus:ring-rose-500/40'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
        />
      ) : (
        <input
          id={field.id}
          type={field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder || ''}
          className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            hasError
              ? 'border-rose-500 focus:ring-rose-500/40'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
        />
      )}

      {/* Error Message */}
      {hasError && validationResult?.message && (
        <span className="text-[11px] font-semibold text-rose-400 mt-1 block">
          ⚠ {validationResult.message}
        </span>
      )}
    </div>
  );
}
