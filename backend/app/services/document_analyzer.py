import os
import re
import uuid
import json
import httpx
from typing import Dict, Any, List, Tuple
from PIL import Image
import pypdf
from app.services.ollama_service import ollama_service
from app.utils.json_parser import clean_llm_json

class DocumentAnalyzerService:
    def __init__(self):
        pass

    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extracts raw text from a PDF file using pypdf.
        """
        extracted_text = []
        try:
            reader = pypdf.PdfReader(file_path)
            for page_num, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    extracted_text.append(f"--- Page {page_num + 1} ---\n{text}")
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
        return "\n".join(extracted_text)

    def extract_text_from_image(self, file_path: str) -> str:
        """
        Extracts basic metadata and information from an uploaded image file.
        """
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                return f"Image document ({width}x{height} pixels). Format: {img.format}"
        except Exception as e:
            return f"Image file uploaded: {os.path.basename(file_path)}"

    async def analyze_document(self, file_path: str, filename: str) -> Tuple[bool, Dict[str, Any], str]:
        """
        Analyzes uploaded document (PDF/Image) locally using Ollama LLM to extract form fields dynamically.
        Returns: (success, form_schema_dict, engine_used)
        """
        ext = os.path.splitext(filename)[1].lower()
        raw_content = ""

        if ext == ".pdf":
            raw_content = self.extract_text_from_pdf(file_path)
        else:
            raw_content = self.extract_text_from_image(file_path)

        form_id = f"form_{uuid.uuid4().hex[:8]}"
        form_title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()

        server_up, model_up, _ = await ollama_service.check_availability()

        if server_up and model_up and raw_content.strip():
            # Call Ollama to extract structured form fields from document text
            prompt = f"""You are an expert document analysis AI.
Analyze the following uploaded form document text and extract ALL form fields that need to be filled by a user.

DOCUMENT TITLE: {form_title}
DOCUMENT CONTENT:
"{raw_content[:3000]}"

INSTRUCTIONS:
1. Identify all form fields, labels, text boxes, dates, mobile numbers, and address fields.
2. For each field, provide:
   - "id": a unique snake_case string (e.g. "first_name")
   - "label": human readable field label (e.g. "First Name")
   - "type": "text" | "date" | "phone" | "number" | "textarea"
   - "required": true or false
   - "question": A natural voice question asking the user for this field (e.g. "Please tell me your first name.")
3. Return ONLY a valid JSON object matching the format below.

REQUIRED JSON FORMAT:
{{
  "form_id": "{form_id}",
  "form_title": "{form_title}",
  "fields": [
    {{
      "id": "first_name",
      "label": "First Name",
      "type": "text",
      "required": true,
      "question": "Please tell me your first name."
    }}
  ]
}}"""

            payload = {
                "model": ollama_service.model,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }

            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    res = await client.post(f"{ollama_service.base_url}/api/generate", json=payload)
                    if res.status_code == 200:
                        raw_json = res.json().get("response", "")
                        parsed = clean_llm_json(raw_json)
                        if isinstance(parsed, dict) and "fields" in parsed and len(parsed["fields"]) > 0:
                            parsed["form_id"] = form_id
                            if "form_title" not in parsed or not parsed["form_title"]:
                                parsed["form_title"] = form_title
                            return True, parsed, f"ollama_{ollama_service.model}"
            except Exception as e:
                print(f"Ollama document analysis error: {e}")

        # Heuristic fallback if PDF has no text or Ollama is offline
        fallback_schema = self._build_heuristic_schema(form_id, form_title, raw_content)
        return True, fallback_schema, "fallback_heuristic"

    def _build_heuristic_schema(self, form_id: str, form_title: str, content: str) -> Dict[str, Any]:
        """
        Builds a clean dynamic form schema based on text patterns or standard document structure.
        """
        detected_fields = []
        
        # Standard field detectors
        patterns = [
            ("first_name", "First Name", "text", True, "Please tell me your first name."),
            ("last_name", "Last Name", "text", True, "Please tell me your last name."),
            ("date_of_birth", "Date of Birth", "date", True, "Please tell me your date of birth."),
            ("mobile_number", "Mobile Number", "phone", True, "Please tell me your 10-digit mobile number."),
            ("address", "Address", "textarea", True, "Please tell me your complete address."),
            ("occupation", "Occupation", "text", False, "Please tell me your occupation or work."),
            ("annual_income", "Annual Income", "number", False, "Please tell me your annual income in rupees."),
        ]

        content_lower = content.lower()
        for fid, label, ftype, req, question in patterns:
            # Check if keyword is in content or default to general form template
            if not content or any(w in content_lower for w in [fid, label.lower(), label.split()[0].lower()]):
                detected_fields.append({
                    "id": fid,
                    "label": label,
                    "type": ftype,
                    "required": req,
                    "question": question
                })

        if not detected_fields:
            # Fallback 5 standard fields
            detected_fields = [
                {"id": "full_name", "label": "Full Name", "type": "text", "required": True, "question": "Please tell me your full name."},
                {"id": "date_of_birth", "label": "Date of Birth", "type": "date", "required": True, "question": "Please tell me your date of birth."},
                {"id": "mobile_number", "label": "Mobile Number", "type": "phone", "required": True, "question": "Please tell me your mobile number."},
                {"id": "address", "label": "Address", "type": "textarea", "required": True, "question": "Please tell me your address."},
                {"id": "occupation", "label": "Occupation", "type": "text", "required": False, "question": "Please tell me your occupation."}
            ]

        return {
            "form_id": form_id,
            "form_title": form_title,
            "fields": detected_fields
        }

document_analyzer = DocumentAnalyzerService()
