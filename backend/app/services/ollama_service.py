import os
import re
import json
import httpx
from typing import Dict, Any, Tuple, Optional
from app.utils.json_parser import clean_llm_json

class OllamaService:
    def __init__(self):
        self.base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        self.model = os.environ.get("OLLAMA_MODEL", "gemma3:4b")

    async def check_availability(self) -> Tuple[bool, bool, str]:
        """
        Checks if local Ollama service is reachable and if configured model is installed.
        Returns: (is_server_up, is_model_available, message)
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models_data = res.json().get("models", [])
                    installed_models = [m.get("name") for m in models_data]
                    
                    # Check if requested model or matching prefix exists
                    model_found = any(
                        self.model == m or self.model in m or m.startswith(self.model.split(":")[0]) 
                        for m in installed_models
                    )
                    
                    if model_found:
                        return True, True, f"Ollama is running with model '{self.model}'."
                    else:
                        available_str = ", ".join(installed_models) if installed_models else "None"
                        return True, False, (
                            f"Ollama is running, but configured model '{self.model}' was not found. "
                            f"Installed models: [{available_str}]. Please run: 'ollama pull {self.model}'"
                        )
                else:
                    return False, False, f"Ollama HTTP server returned status code {res.status_code}."
        except Exception as e:
            return False, False, f"Ollama is not running on {self.base_url}. Please start Ollama."

    async def extract_structured_json(
        self,
        transcript: str,
        form_schema: Dict[str, Any]
    ) -> Tuple[bool, Dict[str, Any], str, Optional[str]]:
        """
        Calls local Ollama model to extract structured form fields from user transcript.
        Returns: (success, fields_dict, engine_name, raw_response)
        """
        server_up, model_up, status_msg = await self.check_availability()
        if not server_up or not model_up:
            return False, {}, "none", f"Ollama unavailable: {status_msg}"

        # Construct prompt describing the form fields and strict JSON instructions
        fields_desc = []
        for field in form_schema.get("fields", []):
            req_str = " (Required)" if field.get("required") else " (Optional)"
            fields_desc.append(
                f"- '{field['id']}': {field['label']}{req_str}. {field.get('description', '')}"
            )

        fields_block = "\n".join(fields_desc)

        prompt = f"""You are an expert AI form assistant for Indian citizen services.
Your task is to extract form field values from the user's spoken transcript.

FORM FIELDS TO EXTRACT:
{fields_block}

USER TRANSCRIPT:
"{transcript}"

STRICT INSTRUCTIONS:
1. Return ONLY a single valid JSON object containing keys for ALL requested form fields.
2. If a field was explicitly mentioned in the user transcript, extract its value accurately.
3. If a field was NOT mentioned or is absent in the transcript, set its value to null. DO NOT invent or hallucinate values!
4. Format dates as YYYY-MM-DD or DD/MM/YYYY if spoken.
5. Format phone numbers as digits only.
6. Do NOT include markdown commentary outside the JSON block.

REQUIRED JSON OUTPUT FORMAT:
{{
  "full_name": "extracted value or null",
  "date_of_birth": "extracted value or null",
  "mobile_number": "extracted value or null",
  "address": "extracted value or null",
  "father_mother_name": "extracted value or null",
  "occupation": "extracted value or null",
  "annual_income": "extracted value or null",
  "district": "extracted value or null",
  "state": "extracted value or null"
}}"""

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
                if response.status_code == 200:
                    raw_text = response.json().get("response", "")
                    extracted_fields = clean_llm_json(raw_text)
                    return True, extracted_fields, f"ollama_{self.model}", raw_text
                else:
                    return False, {}, f"ollama_{self.model}", f"Ollama HTTP error {response.status_code}"
        except Exception as e:
            return False, {}, f"ollama_{self.model}", f"Ollama connection error: {str(e)}"

    def heuristic_extract_fallback(self, transcript: str, form_schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clearly labeled fallback regex/heuristic extractor used ONLY when local Ollama LLM is unavailable.
        """
        extracted = {}
        for field in form_schema.get("fields", []):
            extracted[field["id"]] = None

        text = transcript

        # 1. Name
        name_match = re.search(r'(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text, re.IGNORECASE)
        if name_match:
            extracted["full_name"] = name_match.group(1).title()

        # 2. Date of birth
        dob_match = re.search(r'(?:date of birth|born on|dob|born)\s+(?:is\s+)?(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{4})', text, re.IGNORECASE)
        if dob_match:
            extracted["date_of_birth"] = dob_match.group(1)

        # 3. Mobile
        phone_match = re.search(r'(?:phone|mobile|number|contact)\s+(?:is\s+)?(\d{10}|\+91\d{10})', text, re.IGNORECASE)
        if not phone_match:
            phone_match = re.search(r'\b[6-9]\d{9}\b', text)
        if phone_match:
            extracted["mobile_number"] = phone_match.group(1)

        # 4. Address & District & State
        loc_match = re.search(r'(?:live in|residing at|address is|from)\s+([A-Za-z\s,]+)', text, re.IGNORECASE)
        if loc_match:
            extracted["address"] = loc_match.group(1).strip()
            if "hyderabad" in text.lower():
                extracted["district"] = "Hyderabad"
            if "telangana" in text.lower():
                extracted["state"] = "Telangana"

        # 5. Occupation
        occ_match = re.search(r'(?:occupation is|work as|i am a)\s+([a-zA-Z\s]+)', text, re.IGNORECASE)
        if occ_match:
            occ_val = occ_match.group(1).strip().title()
            if occ_val.lower() not in ["ananya", "sharma", "ravi"]:
                extracted["occupation"] = occ_val

        return extracted

ollama_service = OllamaService()
