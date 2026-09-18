import React, { useRef, useState } from 'react';
import { Upload, FileText, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export function UploadFormScreen({ onUpload, onUseSample, onRunDemo, isLoading }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 md:p-8 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl text-center">
      
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
        <Upload className="w-7 h-7" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Upload your form</h2>
      <p className="text-xs text-slate-400 mb-6">
        Upload any government application, medical intake, or paperwork (PDF, PNG, JPG). VaaniForm will analyze the document and guide you through filling it using your voice.
      </p>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
          dragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-600/80 bg-slate-900/60 hover:border-indigo-400 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>

        <div>
          <span className="font-bold text-sm text-slate-100 block">Drop form document here</span>
          <span className="text-xs text-slate-400">or <span className="text-indigo-400 underline font-semibold">browse files</span> from your computer</span>
        </div>

        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          Supports PDF • PNG • JPG
        </span>
      </div>

      {/* Alternative Sample Form Action */}
      <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onUseSample}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-bold border border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Use Sample Citizen Application Form</span>
        </button>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Try Simulated Demo Mode</span>
        </button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 py-2 px-3 rounded-lg border border-emerald-500/20 max-w-md mx-auto">
        <Lock className="w-3.5 h-3.5" />
        <span>🔒 Document analyzed 100% locally. Zero cloud upload.</span>
      </div>
    </div>
  );
}
