import { useState, useEffect, useRef } from 'react';
import {
  checkHealth,
  uploadAndAnalyzeForm,
  analyzeSampleForm,
  transcribeAudio,
  extractSingleFieldAnswer,
  completeForm
} from '../services/api';
import { AudioRecorder } from '../services/speech';

export const SCREEN_MODES = {
  UPLOAD: 'UPLOAD',
  DETECTED: 'DETECTED',
  VOICE_FILLING: 'VOICE_FILLING',
  REVIEW: 'REVIEW',
  SUCCESS: 'SUCCESS'
};

export function useVoiceForm() {
  const [screenMode, setScreenMode] = useState(SCREEN_MODES.UPLOAD);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [systemHealth, setSystemHealth] = useState({
    backend: false,
    whisper_available: false,
    ollama_available: false,
    model: 'gemma3:4b',
    status_message: 'Checking local AI services...'
  });

  // Dynamic Form & Fields State
  const [formSchema, setFormSchema] = useState(null);
  const [fieldsList, setFieldsList] = useState([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [confidenceScores, setConfidenceScores] = useState({});
  const [fieldValidations, setFieldValidations] = useState({});

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentExtractedValue, setCurrentExtractedValue] = useState(null);
  const [engineInfo, setEngineInfo] = useState({ transcription: '', extraction: '' });

  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  // Initial Health Load
  useEffect(() => {
    reloadHealth();
  }, []);

  const reloadHealth = async () => {
    const health = await checkHealth();
    setSystemHealth(health);
  };

  // 1. Text-to-Speech (TTS) Question Reading
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Browser TTS error:", err);
    }
  };

  // 2. Upload & Analyze Document
  const handleFileUpload = async (file) => {
    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage('Analyzing uploaded document locally via Ollama...');

    try {
      const res = await uploadAndAnalyzeForm(file);
      initializeAnalyzedForm(res);
      setScreenMode(SCREEN_MODES.DETECTED);
    } catch (err) {
      setErrorMessage(`Document analysis error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSampleForm = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage('Generating sample Citizen Service form...');

    try {
      const res = await analyzeSampleForm();
      initializeAnalyzedForm(res);
      setScreenMode(SCREEN_MODES.DETECTED);
    } catch (err) {
      setErrorMessage(`Sample form generation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDemoMode = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setIsDemoMode(true);
    setStatusMessage('Setting up Simulated Demo Mode...');

    try {
      const res = await analyzeSampleForm();
      initializeAnalyzedForm(res);
      
      // Populate sample demo values
      const demoVals = {
        first_name: 'Ananya',
        last_name: 'Sharma',
        date_of_birth: '2004-03-12',
        mobile_number: '9876543210',
        address: 'Jubilee Hills, Hyderabad',
        occupation: 'Student'
      };
      const demoConf = {};
      Object.keys(demoVals).forEach(k => demoConf[k] = 'detected');

      setFormValues(demoVals);
      setConfidenceScores(demoConf);
      setEngineInfo({ transcription: 'simulated_demo_transcript', extraction: 'ollama_gemma3:4b' });
      setScreenMode(SCREEN_MODES.REVIEW);
    } catch (err) {
      setErrorMessage(`Demo setup error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAnalyzedForm = (res) => {
    const fields = res.fields || [];
    setFormSchema({
      form_id: res.form_id,
      form_name: res.form_title,
      fields: fields
    });
    setFieldsList(fields);
    setCurrentFieldIndex(0);

    const initVals = {};
    const initConf = {};
    fields.forEach(f => {
      initVals[f.id] = '';
      initConf[f.id] = 'missing';
    });

    setFormValues(initVals);
    setConfidenceScores(initConf);
    setCurrentTranscript('');
    setCurrentExtractedValue(null);
  };

  // 3. Interactive Voice Filling Mode Controls
  const startVoiceFilling = () => {
    setCurrentFieldIndex(0);
    setScreenMode(SCREEN_MODES.VOICE_FILLING);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();

      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const stopRecordingAndProcessAnswer = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);
    setStatusMessage('Transcribing speech via local Whisper.cpp...');

    const currentField = fieldsList[currentFieldIndex];

    try {
      const audioBlob = await recorderRef.current.stop();
      
      // Step 1: Transcribe via Whisper.cpp
      const sttRes = await transcribeAudio(audioBlob);
      const tsText = sttRes.transcript || '';
      setCurrentTranscript(tsText);

      // Step 2: Extract & normalize single field answer via Ollama
      setStatusMessage('Extracting & normalizing answer via local Ollama LLM...');
      const answerRes = await extractSingleFieldAnswer({
        question: currentField.question || `Please tell me your ${currentField.label}.`,
        fieldLabel: currentField.label,
        fieldType: currentField.type || 'text',
        transcript: tsText
      });

      const extractedVal = answerRes.extracted_value || tsText;
      setCurrentExtractedValue(extractedVal);

      setEngineInfo({
        transcription: sttRes.engine,
        extraction: answerRes.engine
      });

    } catch (err) {
      setErrorMessage(`Answer processing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAnswerAndNext = (fieldId, value) => {
    const valStr = value || currentExtractedValue || '';
    setFormValues(prev => ({ ...prev, [fieldId]: valStr }));
    setConfidenceScores(prev => ({ ...prev, [fieldId]: valStr ? 'detected' : 'missing' }));

    setCurrentTranscript('');
    setCurrentExtractedValue(null);

    if (currentFieldIndex < fieldsList.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    } else {
      setScreenMode(SCREEN_MODES.REVIEW);
    }
  };

  const retryAnswer = () => {
    setCurrentTranscript('');
    setCurrentExtractedValue(null);
  };

  const goToNextField = () => {
    setCurrentTranscript('');
    setCurrentExtractedValue(null);

    if (currentFieldIndex < fieldsList.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    } else {
      setScreenMode(SCREEN_MODES.REVIEW);
    }
  };

  const goToPrevField = () => {
    setCurrentTranscript('');
    setCurrentExtractedValue(null);
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(prev => prev - 1);
    }
  };

  const skipCurrentField = () => {
    confirmAnswerAndNext(fieldsList[currentFieldIndex].id, '');
  };

  const updateFieldValueManually = (fieldId, value) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    setConfidenceScores(prev => ({ ...prev, [fieldId]: value ? 'detected' : 'missing' }));
  };

  const submitFinalForm = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage('Completing form submission locally...');

    try {
      const res = await completeForm(
        formSchema.form_id,
        formSchema.form_name,
        formValues
      );
      setSubmissionResult(res);
      setScreenMode(SCREEN_MODES.SUCCESS);
    } catch (err) {
      setErrorMessage(`Completion error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToUploadScreen = () => {
    setScreenMode(SCREEN_MODES.UPLOAD);
    setFormSchema(null);
    setFieldsList([]);
    setCurrentFieldIndex(0);
    setFormValues({});
    setConfidenceScores({});
    setCurrentTranscript('');
    setCurrentExtractedValue(null);
    setSubmissionResult(null);
    setErrorMessage(null);
    setIsDemoMode(false);
  };

  return {
    screenMode,
    statusMessage,
    errorMessage,
    isLoading,
    systemHealth,
    formSchema,
    fieldsList,
    currentFieldIndex,
    currentField: fieldsList[currentFieldIndex],
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
    speakQuestion,
    reloadHealth
  };
}
