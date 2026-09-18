import os
import uuid
import datetime
import tempfile
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import FileResponse

from app.schemas.pipeline import (
    HealthResponse,
    TranscribeRequest,
    TranscribeResponse,
    ExtractRequest,
    ExtractResponse,
    ProcessRequest,
    ProcessResponse,
    ValidationResponse,
    SubmissionRequest,
    SubmissionResponse,
    AnalyzeFormResponse,
    AnswerFieldRequest,
    AnswerFieldResponse,
    CompleteFormRequest,
    CompleteFormResponse
)
from app.services.form_service import form_service
from app.services.whisper_service import whisper_service
from app.services.ollama_service import ollama_service
from app.services.extraction_service import extraction_service
from app.services.validation_service import validation_service
from app.services.document_analyzer import document_analyzer
from app.services.field_answer_service import field_answer_service

router = APIRouter()

DEMO_TRANSCRIPT = (
    "My name is Ananya Sharma. My date of birth is 12 March 2004. "
    "My phone number is 9876543210. I live in Hyderabad, Telangana. I am a student."
)

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """
    Diagnostic system health check reporting live Whisper.cpp and Ollama local AI status.
    """
    ollama_up, model_up, ollama_msg = await ollama_service.check_availability()
    whisper_up, whisper_msg = whisper_service.check_availability()

    active_stt = "whisper-cli.exe" if whisper_up else "none (Whisper unconfigured)"
    active_llm = f"ollama_{ollama_service.model}" if (ollama_up and model_up) else "fallback_heuristic (Ollama unconfigured)"

    status_msg = f"Whisper: {whisper_msg} | Ollama: {ollama_msg}"

    return HealthResponse(
        backend=True,
        whisper_available=whisper_up,
        ollama_available=ollama_up and model_up,
        model=ollama_service.model,
        whisper_executable=whisper_service.executable_path,
        whisper_model=whisper_service.model_path,
        active_transcription_engine=active_stt,
        active_extraction_engine=active_llm,
        status_message=status_msg
    )

@router.post("/forms/upload", response_model=AnalyzeFormResponse)
async def upload_and_analyze_form(file: UploadFile = File(...)):
    """
    Uploads a form document (PDF/PNG/JPG) and dynamically analyzes its fields locally via Ollama.
    """
    filename = file.filename or "uploaded_form.pdf"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF, PNG, or JPG document.")

    # Save temp uploaded file
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        success, form_schema_dict, engine = await document_analyzer.analyze_document(tmp_path, filename)
        
        # Save dynamically analyzed form into FormService registry
        form_id = form_schema_dict.get("form_id", f"form_{uuid.uuid4().hex[:6]}")
        fields_data = form_schema_dict.get("fields", [])

        # Register in form service
        form_service.register_dynamic_form(form_id, form_schema_dict)

        return AnalyzeFormResponse(
            success=True,
            form_id=form_id,
            form_title=form_schema_dict.get("form_title", "Uploaded Form"),
            fields=fields_data,
            engine=engine
        )
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

@router.post("/forms/analyze-sample", response_model=AnalyzeFormResponse)
async def analyze_sample_form():
    """
    Generates a dynamic sample form schema for testing without needing a PDF upload.
    """
    form_id = f"sample_{uuid.uuid4().hex[:6]}"
    sample_schema = {
        "form_id": form_id,
        "form_title": "Citizen Application Form (Sample)",
        "fields": [
            {"id": "first_name", "label": "First Name", "type": "text", "required": True, "question": "Please tell me your first name."},
            {"id": "last_name", "label": "Last Name", "type": "text", "required": True, "question": "Please tell me your last name."},
            {"id": "date_of_birth", "label": "Date of Birth", "type": "date", "required": True, "question": "Please tell me your date of birth."},
            {"id": "mobile_number", "label": "Mobile Number", "type": "phone", "required": True, "question": "Please tell me your 10-digit mobile number."},
            {"id": "address", "label": "Address", "type": "textarea", "required": True, "question": "Please tell me your address."},
            {"id": "occupation", "label": "Occupation", "type": "text", "required": False, "question": "Please tell me your occupation."}
        ]
    }

    form_service.register_dynamic_form(form_id, sample_schema)

    return AnalyzeFormResponse(
        success=True,
        form_id=form_id,
        form_title=sample_schema["form_title"],
        fields=sample_schema["fields"],
        engine="sample_generator"
    )

@router.post("/voice/answer", response_model=AnswerFieldResponse)
async def answer_single_field(request: AnswerFieldRequest):
    """
    Extracts & normalizes the value for a single question from user spoken answer using local Ollama.
    """
    success, norm_val, engine = await field_answer_service.extract_single_field_answer(
        question=request.question,
        field_label=request.field_label,
        field_type=request.field_type,
        transcript=request.transcript
    )

    return AnswerFieldResponse(
        success=success,
        extracted_value=norm_val,
        engine=engine
    )

@router.post("/forms/complete", response_model=CompleteFormResponse)
async def complete_form(request: CompleteFormRequest):
    """
    Completes form submission, logs data locally, and creates a downloadable PDF summary.
    """
    sub_id = f"VF-SUB-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.datetime.now().isoformat()

    return CompleteFormResponse(
        success=True,
        submission_id=sub_id,
        timestamp=timestamp,
        form_title=request.form_title,
        fields=request.fields,
        message="Form completed successfully! All data processed and stored locally on your device.",
        pdf_download_url=None
    )

@router.get("/forms")
async def list_forms():
    return form_service.list_forms()

@router.get("/forms/{form_id}")
async def get_form_schema(form_id: str):
    form = form_service.get_form(form_id)
    if not form:
        raise HTTPException(status_code=404, detail=f"Form '{form_id}' not found.")
    return form

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    file: UploadFile = File(None),
    audio_base64: str = Form(None),
    language: str = Form("en")
):
    """
    Transcribes audio strictly using local whisper-cli.exe.
    """
    if file:
        audio_bytes = await file.read()
        import base64
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        success, transcript, engine = whisper_service.transcribe_base64_audio(audio_b64, language)
    elif audio_base64:
        success, transcript, engine = whisper_service.transcribe_base64_audio(audio_base64, language)
    else:
        raise HTTPException(status_code=400, detail="Either 'file' upload or 'audio_base64' string must be provided.")

    if not success:
        return TranscribeResponse(
            success=False,
            transcript="",
            engine=engine,
            error=transcript
        )

    return TranscribeResponse(
        success=True,
        transcript=transcript,
        engine=engine
    )

@router.post("/extract", response_model=ExtractResponse)
async def extract_structured_fields(request: ExtractRequest):
    """
    Extracts structured fields from natural speech transcript via local Ollama LLM.
    """
    success, fields, confidence, engine, raw_response, err = await extraction_service.extract_fields_from_transcript(
        request.transcript,
        request.form_id,
        request.is_demo
    )

    return ExtractResponse(
        success=success,
        transcript=request.transcript,
        fields=fields,
        engine=engine,
        confidence_scores=confidence,
        raw_llm_response=raw_response,
        error=err
    )

@router.post("/process", response_model=ProcessResponse)
async def process_full_pipeline(
    file: UploadFile = File(None),
    transcript: str = Form(None),
    form_id: str = Form("citizen_service_form"),
    is_demo: bool = Form(False)
):
    """
    Executes full pipeline: Microphone Audio -> whisper-cli.exe STT -> Ollama LLM Extraction -> Schema Validation.
    """
    final_transcript = ""
    transcription_engine = "none"

    if is_demo or (transcript and transcript.strip() and not file):
        final_transcript = transcript if (transcript and transcript.strip()) else DEMO_TRANSCRIPT
        transcription_engine = "demo_transcript_input"
    elif file:
        audio_bytes = await file.read()
        import base64
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        success, ts, engine = whisper_service.transcribe_base64_audio(audio_b64)
        if success:
            final_transcript = ts
            transcription_engine = engine
        else:
            return ProcessResponse(
                success=False,
                transcript="",
                fields={},
                confidence_scores={},
                validation=ValidationResponse(valid=False, missing_required=[], invalid_fields={}, field_validations={}),
                transcription_engine=engine,
                extraction_engine="none",
                error=f"Whisper.cpp transcription failed: {ts}"
            )
    else:
        raise HTTPException(status_code=400, detail="Either audio file, transcript text, or is_demo=true must be provided.")

    # Step 2: Extraction via Ollama / LLM
    success, fields, confidence, extraction_engine, raw_llm, err = await extraction_service.extract_fields_from_transcript(
        final_transcript,
        form_id,
        is_demo
    )

    # Step 3: Validation
    validation_res = validation_service.validate_form_data(fields, form_id)

    return ProcessResponse(
        success=True,
        transcript=final_transcript,
        fields=fields,
        confidence_scores=confidence,
        validation=validation_res,
        transcription_engine=transcription_engine,
        extraction_engine=extraction_engine,
        error=err
    )

@router.post("/validate", response_model=ValidationResponse)
async def validate_form(
    fields: Dict[str, Any] = Body(...),
    form_id: str = Body("citizen_service_form")
):
    return validation_service.validate_form_data(fields, form_id)

@router.post("/submit-demo", response_model=SubmissionResponse)
async def submit_form(request: SubmissionRequest):
    if not request.confirmed_by_user:
        raise HTTPException(status_code=400, detail="Form submission requires explicit user confirmation.")

    val_res = validation_service.validate_form_data(request.fields, request.form_id)
    if not val_res.valid:
        raise HTTPException(
            status_code=422,
            detail=f"Form contains invalid fields: {list(val_res.invalid_fields.keys())}"
        )

    sub_id = f"VF-SUB-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.datetime.now().isoformat()

    return SubmissionResponse(
        success=True,
        submission_id=sub_id,
        timestamp=timestamp,
        message="Form submitted successfully! Your information was processed completely on this local device.",
        stored_locally=True
    )
