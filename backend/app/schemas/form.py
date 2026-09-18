from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ValidationRulesSchema(BaseModel):
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None
    length: Optional[int] = None
    format: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class FormFieldSchema(BaseModel):
    id: str
    label: str
    type: str  # text, date, phone, textarea, number, select
    required: bool = False
    description: Optional[str] = None
    placeholder: Optional[str] = None
    validation_rules: Optional[ValidationRulesSchema] = None

class FormSchema(BaseModel):
    form_id: str
    form_name: str
    description: str
    category: str
    fields: List[FormFieldSchema]
