import React from 'react';
import { useVoiceForm, SCREEN_MODES } from './hooks/useVoiceForm';
import { Header } from './components/Header';
import { PrivacyBadge } from './components/PrivacyBadge';
import { UploadFormScreen } from './components/UploadFormScreen';
import { FormDetectedScreen } from './components/FormDetectedScreen';
import { VoiceFillingAssistant } from './components/VoiceFillingAssistant';
import { ReviewPanel } from './components/ReviewPanel';
import { SuccessScreen } from './components/SuccessScreen';

export default function App() {
  const {
    screenMode,
    statusMessage,
    errorMessage,
    isLoading,
    systemHealth,
    formSchema,
    fieldsList,
    currentFieldIndex,
    currentField,
    formValues,
    confidenceScores,
    fieldValidations,
    isRecording,
    recordingTime,
    isProcessing,
    currentTranscript,
    currentExtractedValue,
    engineInfo,
    submissionResult,
    activeLanguage,
    isDemoMode,
    setActiveLanguage,
    handleFileUpload,
    handleUseSampleForm,
    handleRunDemoMode,
    startVoiceFilling,
    startRecording,
    stopRecordingAndProcessAnswer,
    confirmAnswerAndNext,
    retryAnswer,
    goToNextField,
    goToPrevField,
    skipCurrentField,
    updateFieldValueManually,
    submitFinalForm,
    resetToUploadScreen,
    speakQuestion
  } = useVoiceForm();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 md:py-8">
        
        {/* Privacy & Health System Status Badge */}
        <PrivacyBadge health={systemHealth} />

        {/* Demo Mode Notification Banner */}
        {isDemoMode && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6 text-center text-xs font-bold text-amber-300">
            ⚡ DEMO MODE — Voice transcription simulated using sample data. Ollama extraction & validation active.
          </div>
        )}

        {/* SCREEN 1: Upload Form */}
        {screenMode === SCREEN_MODES.UPLOAD && (
          <UploadFormScreen
            onUpload={handleFileUpload}
            onUseSample={handleUseSampleForm}
            onRunDemo={handleRunDemoMode}
            isLoading={isLoading}
          />
        )}

        {/* SCREEN 2: Form Detected */}
        {screenMode === SCREEN_MODES.DETECTED && (
          <FormDetectedScreen
            formTitle={formSchema?.form_name}
            fields={fieldsList}
            onStartVoiceFilling={startVoiceFilling}
            onCancel={resetToUploadScreen}
          />
        )}

        {/* SCREEN 3: Interactive Voice Filling Assistant */}
        {screenMode === SCREEN_MODES.VOICE_FILLING && (
          <VoiceFillingAssistant
            currentFieldIndex={currentFieldIndex}
            totalFields={fieldsList.length}
            currentField={currentField}
            formValues={formValues}
            isRecording={isRecording}
            recordingTime={recordingTime}
            isProcessing={isProcessing}
            transcript={currentTranscript}
            extractedValue={currentExtractedValue}
            engineInfo={engineInfo}
            errorMessage={errorMessage}
            onStartRecording={startRecording}
            onStopRecording={stopRecordingAndProcessAnswer}
            onConfirmAnswer={confirmAnswerAndNext}
            onRetryAnswer={retryAnswer}
            onPrevField={goToPrevField}
            onNextField={goToNextField}
            onSkipField={skipCurrentField}
            onSpeakQuestion={speakQuestion}
          />
        )}

        {/* SCREEN 4: Final Review & Confirmation */}
        {screenMode === SCREEN_MODES.REVIEW && (
          <ReviewPanel
            formSchema={formSchema}
            formValues={formValues}
            confidenceScores={confidenceScores}
            fieldValidations={fieldValidations}
            engineInfo={engineInfo}
            onFieldChange={updateFieldValueManually}
            onSubmit={submitFinalForm}
            onReset={resetToUploadScreen}
          />
        )}

        {/* SCREEN 5: Completed Form Confirmation */}
        {screenMode === SCREEN_MODES.SUCCESS && (
          <SuccessScreen
            result={submissionResult}
            formValues={formValues}
            onReset={resetToUploadScreen}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-800 text-xs text-slate-500">
        VaaniForm • Dynamic Document Upload & Interactive Voice Assistant • Privacy Preserved Locally
      </footer>
    </div>
  );
}
