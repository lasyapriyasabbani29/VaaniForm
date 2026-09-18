from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    backend: bool = True
    whisper_available: bool = False
    ollama_available: bool = False
    model: str = "gemma3:4b"
    whisper_executable: str = r"C:\whisper.cpp\build\bin\Release\whisper-cli.exe"
    whisper_model: str = r"C:\whisper.cpp\ggml-base.bin"
    active_transcription_engine: str = "none"
    active_extraction_engine: str = "none"
    status_message: str = "Running"

class TranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language: Optional[str] = "en"

class TranscribeResponse(BaseModel):
    success: bool
    transcript: str
    engine: str  # "whisper-cli.exe" or "fallback_demo"
    duration_seconds: Optional[float] = 0.0
    error: Optional[str] = None

class ExtractRequest(BaseModel):
    transcript: str
    form_id: str = "citizen_service_form"
    is_demo: bool = False

class ExtractResponse(BaseModel):
    success: bool
    transcript: str
    fields: Dict[str, Any]
    engine: str
    confidence_scores: Dict[str, str]
    raw_llm_response: Optional[str] = None
    error: Optional[str] = None

class AnalyzeFormResponse(BaseModel):
    success: bool
    form_id: str
    form_title: str
    fields: List[Dict[str, Any]]
    engine: str
    error: Optional[str] = None

class AnswerFieldRequest(BaseModel):
    question: str
    field_label: str
    field_type: str = "text"
    transcript: str

class AnswerFieldResponse(BaseModel):
    success: bool
    extracted_value: Optional[str] = None
    engine: str
    error: Optional[str] = None

class CompleteFormRequest(BaseModel):
    form_id: str
    form_title: str = "Completed Form"
    fields: Dict[str, Any]

class CompleteFormResponse(BaseModel):
    success: bool
    submission_id: str
    timestamp: str
    form_title: str
    fields: Dict[str, Any]
    message: str
    pdf_download_url: Optional[str] = None

class FieldValidationResult(BaseModel):
    valid: bool
    message: Optional[str] = None
    normalized_value: Optional[Any] = None

class ValidationResponse(BaseModel):
    valid: bool
    missing_required: List[str]
    invalid_fields: Dict[str, str]
    field_validations: Dict[str, FieldValidationResult]

class ProcessRequest(BaseModel):
    transcript: Optional[str] = None
    form_id: str = "citizen_service_form"
    is_demo: bool = False

class ProcessResponse(BaseModel):
    success: bool
    transcript: str
    fields: Dict[str, Any]
    confidence_scores: Dict[str, str]
    validation: ValidationResponse
    transcription_engine: str
    extraction_engine: str
    error: Optional[str] = None

class SubmissionRequest(BaseModel):
    form_id: str
    fields: Dict[str, Any]
    confirmed_by_user: bool = True

class SubmissionResponse(BaseModel):
    success: bool
    submission_id: str
    timestamp: str
    message: str
    stored_locally: bool = True
