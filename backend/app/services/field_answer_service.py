import re
import httpx
from typing import Dict, Any, Tuple, Optional
from app.services.ollama_service import ollama_service
from app.utils.json_parser import clean_llm_json
from app.utils.validators import normalize_date, validate_mobile_number, validate_annual_income

class FieldAnswerService:
    async def extract_single_field_answer(
        self,
        question: str,
        field_label: str,
        field_type: str,
        transcript: str
    ) -> Tuple[bool, Optional[str], str]:
        """
        Extracts and normalizes a single field's value from user speech transcript using Ollama LLM.
        Returns: (success, extracted_value_str, engine_used)
        """
        server_up, model_up, _ = await ollama_service.check_availability()

        if server_up and model_up:
            prompt = f"""You are an AI assistant processing spoken answers for form fields.

FIELD LABEL: "{field_label}"
FIELD TYPE: "{field_type}"
QUESTION ASKED: "{question}"
USER SPOKEN ANSWER: "{transcript}"

STRICT INSTRUCTIONS:
1. Extract the exact concise value meant for the field from the user's spoken answer.
2. If the field type is "date", normalize to YYYY-MM-DD (e.g., "12 March 2004" -> "2004-03-12").
3. If the field type is "phone", extract digits only (e.g., "9876543210").
4. If the user said "skip" or didn't answer, return null.
5. Return ONLY a single JSON object with key "value".

REQUIRED JSON FORMAT:
{{
  "value": "extracted value or null"
}}"""

            payload = {
                "model": ollama_service.model,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }

            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    res = await client.post(f"{ollama_service.base_url}/api/generate", json=payload)
                    if res.status_code == 200:
                        raw = res.json().get("response", "")
                        parsed = clean_llm_json(raw)
                        val = parsed.get("value")
                        if val is not None and str(val).strip() != "" and str(val).lower() != "null":
                            norm_val = self._normalize_field_value(field_type, field_label, str(val))
                            return True, norm_val, f"ollama_{ollama_service.model}"
            except Exception as e:
                print(f"Ollama single field extraction error: {e}")

        # Local heuristic fallback if Ollama is offline
        norm_val = self._normalize_field_value(field_type, field_label, transcript)
        return True, norm_val, "fallback_heuristic"

    def _normalize_field_value(self, field_type: str, label: str, text: str) -> str:
        """
        Deterministic normalization for date, phone, income, and text.
        """
        if not text or text.strip() == "":
            return ""

        val_str = text.strip()

        if field_type == "date" or "date" in label.lower() or "dob" in label.lower() or "born" in label.lower():
            ok, _, norm = normalize_date(val_str)
            if ok and norm:
                return norm
            return val_str

        if field_type == "phone" or "mobile" in label.lower() or "phone" in label.lower() or "number" in label.lower():
            ok, _, norm = validate_mobile_number(val_str)
            if ok and norm:
                return norm
            digits = re.sub(r'\D', '', val_str)
            if len(digits) >= 10:
                return digits[-10:]
            return digits or val_str

        if field_type == "number" or "income" in label.lower():
            ok, _, norm = validate_annual_income(val_str)
            if ok and norm is not None:
                return str(int(norm) if norm.is_integer() else norm)

        # Standard text cleaning
        clean = re.sub(r'^(?:my name is|i am|it is|this is|my answer is)\s+', '', val_str, flags=re.IGNORECASE)
        return clean.strip().title() if len(clean.split()) <= 3 else clean.strip()

field_answer_service = FieldAnswerService()
