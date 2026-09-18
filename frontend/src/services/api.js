const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch('/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      backend: false,
      whisper_available: false,
      ollama_available: false,
      model: 'gemma3:4b',
      status_message: `Backend unreachable: ${err.message}`
    };
  }
}

export async function uploadAndAnalyzeForm(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/forms/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Upload failed: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function analyzeSampleForm() {
  const res = await fetch(`${API_BASE}/forms/analyze-sample`, {
    method: 'POST'
  });

  if (!res.ok) throw new Error(`Failed to generate sample form: HTTP ${res.status}`);
  return await res.json();
}

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.wav');

  const res = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Transcription error: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function extractSingleFieldAnswer({ question, fieldLabel, fieldType, transcript }) {
  const res = await fetch(`${API_BASE}/voice/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      field_label: fieldLabel,
      field_type: fieldType || 'text',
      transcript
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Extraction error: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function completeForm(formId, formTitle, fieldsData) {
  const res = await fetch(`${API_BASE}/forms/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form_id: formId,
      form_title: formTitle,
      fields: fieldsData
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Completion error: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function fetchFormSchema(formId = 'citizen_service_form') {
  const res = await fetch(`${API_BASE}/forms/${formId}`);
  if (!res.ok) throw new Error(`Failed to load form schema: HTTP ${res.status}`);
  return await res.json();
}

export async function processPipeline({ transcript, audioBlob, formId = 'citizen_service_form', isDemo = false }) {
  const formData = new FormData();
  formData.append('form_id', formId);
  formData.append('is_demo', isDemo ? 'true' : 'false');

  if (transcript) formData.append('transcript', transcript);
  if (audioBlob) formData.append('file', audioBlob, 'speech.wav');

  const res = await fetch(`${API_BASE}/process`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Pipeline error: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function submitForm(formId, fieldsData) {
  const res = await fetch(`${API_BASE}/submit-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form_id: formId,
      fields: fieldsData,
      confirmed_by_user: true
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Submission error: HTTP ${res.status}`);
  }

  return await res.json();
}
