from typing import Dict, Any, Tuple
from app.services.ollama_service import ollama_service
from app.services.form_service import form_service

class ExtractionService:
    async def extract_fields_from_transcript(
        self,
        transcript: str,
        form_id: str = "citizen_service_form",
        is_demo: bool = False
    ) -> Tuple[bool, Dict[str, Any], Dict[str, str], str, str, str]:
        """
        Extracts structured fields from transcript using local Ollama LLM or fallback if unavailable.
        Returns: (success, fields_dict, confidence_scores, engine_used, raw_response, error_msg)
        """
        form = form_service.get_form(form_id)
        if not form:
            return False, {}, {}, "none", "", f"Form ID '{form_id}' not found."

        form_schema_dict = form.model_dump()
        
        # Check Ollama availability
        server_up, model_up, status_msg = await ollama_service.check_availability()
        
        extracted_fields = {}
        engine_used = "none"
        raw_response = ""
        error_msg = None

        if server_up and model_up:
            # Use real local Ollama LLM
            success, raw_fields, engine, raw_response = await ollama_service.extract_structured_json(
                transcript, form_schema_dict
            )
            if success:
                extracted_fields = raw_fields
                engine_used = engine
            else:
                error_msg = f"Ollama extraction failed: {raw_response}. Switched to local fallback."
                extracted_fields = ollama_service.heuristic_extract_fallback(transcript, form_schema_dict)
                engine_used = "fallback_heuristic"
        else:
            # Ollama is unavailable
            error_msg = f"Local LLM (Ollama) is unavailable: {status_msg}. Using local heuristic fallback."
            extracted_fields = ollama_service.heuristic_extract_fallback(transcript, form_schema_dict)
            engine_used = "fallback_heuristic"

        # Ensure all schema fields are present and compute confidence indicators
        final_fields = {}
        confidence_scores = {}

        for field in form.fields:
            fid = field.id
            val = extracted_fields.get(fid)
            
            # Treat empty strings or 'null' strings as None
            if val is not None and (str(val).strip() == "" or str(val).lower() in ["null", "none", "unknown"]):
                val = None
            
            final_fields[fid] = val

            # Assign confidence indicators: 'detected', 'verify', 'missing'
            if val is None:
                confidence_scores[fid] = "missing"
            elif fid in ["date_of_birth", "annual_income"]:
                confidence_scores[fid] = "verify"
            else:
                confidence_scores[fid] = "detected"

        return True, final_fields, confidence_scores, engine_used, raw_response, error_msg

extraction_service = ExtractionService()
