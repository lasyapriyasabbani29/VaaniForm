import pytest
from app.utils.json_parser import clean_llm_json

def test_clean_llm_json_raw_object():
    raw = '{"full_name": "Lasya Priya", "date_of_birth": "2005-08-15"}'
    res = clean_llm_json(raw)
    assert res["full_name"] == "Lasya Priya"
    assert res["date_of_birth"] == "2005-08-15"

def test_clean_llm_json_with_markdown_fences():
    raw = """Here is the extracted information:
```json
{
  "full_name": "Ravi Kumar",
  "mobile_number": "9876543210",
  "occupation": null
}
```
Hope this helps!"""
    res = clean_llm_json(raw)
    assert res["full_name"] == "Ravi Kumar"
    assert res["mobile_number"] == "9876543210"
    assert res["occupation"] is None

def test_clean_llm_json_malformed():
    raw = '{"full_name": "Ananya Sharma", "mobile_number": "9876543210",}'
    res = clean_llm_json(raw)
    assert res["full_name"] == "Ananya Sharma"
    assert res["mobile_number"] == "9876543210"

def test_unmentioned_fields_are_null():
    # Only name mentioned
    transcript = "My name is Ravi."
    from app.services.ollama_service import ollama_service
    from app.services.form_service import form_service
    form = form_service.get_form("citizen_service_form")
    fallback = ollama_service.heuristic_extract_fallback(transcript, form.model_dump())
    assert fallback["full_name"] == "Ravi"
    assert fallback["date_of_birth"] is None
    assert fallback["mobile_number"] is None
