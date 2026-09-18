import React from 'react';
import { Mic, Brain, FormInput, CheckCircle } from 'lucide-react';
import { UI_STATES } from '../hooks/useVoiceForm';

export function ListeningIndicator({ uiState, statusMessage }) {
  const steps = [
    { key: 'SPEAK', label: 'SPEAK', icon: Mic, activeStates: [UI_STATES.LISTENING] },
    { key: 'UNDERSTAND', label: 'UNDERSTAND', icon: Brain, activeStates: [UI_STATES.TRANSCRIBING, UI_STATES.EXTRACTING] },
    { key: 'FILL', label: 'FILL', icon: FormInput, activeStates: [UI_STATES.FORM_FILLED] },
    { key: 'REVIEW', label: 'REVIEW', icon: CheckCircle, activeStates: [UI_STATES.REVIEW, UI_STATES.SUBMITTED] }
  ];

  const getCurrentStepIndex = () => {
    if (uiState === UI_STATES.LISTENING) return 0;
    if ([UI_STATES.TRANSCRIBING, UI_STATES.EXTRACTING, UI_STATES.PROCESSING].includes(uiState)) return 1;
    if (uiState === UI_STATES.FORM_FILLED) return 2;
    if ([UI_STATES.REVIEW, UI_STATES.SUBMITTED].includes(uiState)) return 3;
    return -1;
  };

  const currentIndex = getCurrentStepIndex();

  if (uiState === UI_STATES.IDLE) return null;

  return (
    <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4 my-6 shadow-md">
      {/* Step Indicators */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-3 relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-700 -translate-y-1/2 z-0" />
        
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-xs ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 scale-110'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                  isCurrent ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Status Text Banner */}
      {statusMessage && (
        <div className="text-center text-xs font-medium text-indigo-300 bg-indigo-500/10 py-1.5 px-3 rounded-lg border border-indigo-500/20 max-w-md mx-auto">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
