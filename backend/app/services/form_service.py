import os
import json
from typing import Dict, Any, List, Optional
from app.schemas.form import FormSchema, FormFieldSchema

class FormService:
    def __init__(self, forms_dir: str = None):
        if forms_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            forms_dir = os.path.join(base_dir, "forms")
        
        self.forms_dir = forms_dir
        self._forms_cache: Dict[str, FormSchema] = {}
        self.load_forms()

    def load_forms(self):
        self._forms_cache.clear()
        if not os.path.exists(self.forms_dir):
            return

        for filename in os.listdir(self.forms_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(self.forms_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        form_schema = FormSchema(**data)
                        self._forms_cache[form_schema.form_id] = form_schema
                except Exception as e:
                    print(f"Error loading form schema {filename}: {e}")

    def register_dynamic_form(self, form_id: str, schema_dict: Dict[str, Any]):
        """
        Dynamically registers an uploaded/analyzed form schema in memory.
        """
        fields_objs = []
        for f in schema_dict.get("fields", []):
            fields_objs.append(FormFieldSchema(
                id=f["id"],
                label=f["label"],
                type=f.get("type", "text"),
                required=f.get("required", False),
                description=f.get("question") or f.get("description"),
                placeholder=f.get("placeholder")
            ))

        schema = FormSchema(
            form_id=form_id,
            form_name=schema_dict.get("form_title", "Dynamic Form"),
            description="Dynamically analyzed form document",
            category="User Uploaded Form",
            fields=fields_objs
        )

        self._forms_cache[form_id] = schema

    def get_form(self, form_id: str) -> Optional[FormSchema]:
        return self._forms_cache.get(form_id)

    def list_forms(self) -> List[Dict[str, str]]:
        return [
            {
                "form_id": f.form_id,
                "form_name": f.form_name,
                "description": f.description,
                "category": f.category
            }
            for f in self._forms_cache.values()
        ]

form_service = FormService()
