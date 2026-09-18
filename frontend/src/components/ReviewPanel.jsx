import React from 'react';
import { Brain, CheckCircle, Edit3, ShieldAlert, Sparkles } from 'lucide-react';
import { DynamicForm } from './DynamicForm';

export function ReviewPanel({
  formSchema,
  formValues,
  confidenceScores,
  fieldValidations,
  engineInfo,
  onFieldChange,
  onSubmit,
  onReset
}) {
  if (!formSchema) return null;

  // Check required missing fields
  const missingRequired = formSchema.fields
    .filter(f => f.required)
    .filter(f => !formValues[f.id] || formValues[f.id].trim() === '');

  const hasValidationErrors = Object.values(fieldValidations).some(v => v?.valid === false);
  const canSubmit = missingRequired.length === 0 && !hasValidationErrors;

  const isFallbackEngine = engineInfo?.extraction === 'fallback_heuristic';

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-xl mt-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60 mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>WHAT VAANIFORM UNDERSTOOD</span>
          </div>
          <h2 className="text-xl font-bold text-white">Review & Edit Your Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Please review the extracted information carefully below. Tap any field to edit before confirming.
          </p>
        </div>

        {/* Extraction Engine Tag */}
        {engineInfo?.extraction && (
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto ${
            isFallbackEngine
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extraction: {engineInfo.extraction}</span>
          </div>
        )}
      </div>

      {/* Mandatory Review Alert Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5 mb-6 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <span className="font-bold block">Mandatory Confirmation Step:</span>
          VaaniForm will never submit your form automatically. Inspect each field below, correct any misheard values, fill in missing fields, and press <strong className="text-white">Confirm & Submit</strong>.
        </div>
      </div>

      {/* Form Fields Grid */}
      <DynamicForm
        formSchema={formSchema}
        formValues={formValues}
        confidenceScores={confidenceScores}
        fieldValidations={fieldValidations}
        onFieldChange={onFieldChange}
      />

      {/* Required Missing Fields Warning */}
      {missingRequired.length > 0 && (
        <div className="mt-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <span className="font-bold">⚠ Cannot submit yet:</span>
          <span>Please complete the required field(s): {missingRequired.map(f => f.label).join(', ')}.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-600/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Clear / Start Over</span>
        </button>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            canSubmit
              ? 'bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30 transform hover:scale-[1.02]'
              : 'bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>CONFIRM & SUBMIT</span>
        </button>
      </div>
    </div>
  );
}
