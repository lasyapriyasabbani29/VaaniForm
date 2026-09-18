from typing import Dict, Any, List
from app.services.form_service import form_service
from app.schemas.pipeline import ValidationResponse, FieldValidationResult
from app.utils.validators import (
    validate_mobile_number,
    normalize_date,
    validate_annual_income
)

class ValidationService:
    def validate_form_data(
        self,
        fields_data: Dict[str, Any],
        form_id: str = "citizen_service_form"
    ) -> ValidationResponse:
        """
        Validates form field values deterministically against form schema rules.
        """
        form = form_service.get_form(form_id)
        missing_required: List[str] = []
        invalid_fields: Dict[str, str] = {}
        field_validations: Dict[str, FieldValidationResult] = {}

        if not form:
            return ValidationResponse(
                valid=False,
                missing_required=["form_not_found"],
                invalid_fields={"form_id": f"Form '{form_id}' not found"},
                field_validations={}
            )

        for field in form.fields:
            fid = field.id
            val = fields_data.get(fid)

            # 1. Required field check
            if field.required and (val is None or str(val).strip() == ""):
                missing_required.append(fid)
                invalid_fields[fid] = f"'{field.label}' is required."
                field_validations[fid] = FieldValidationResult(
                    valid=False,
                    message=f"'{field.label}' is required",
                    normalized_value=None
                )
                continue

            # If optional and empty
            if val is None or str(val).strip() == "":
                field_validations[fid] = FieldValidationResult(
                    valid=True,
                    message=None,
                    normalized_value=None
                )
                continue

            # 2. Specific field validations
            is_valid = True
            err_msg = None
            norm_val = val

            if fid == "mobile_number":
                is_valid, err_msg, norm_val = validate_mobile_number(val)
            elif fid == "date_of_birth":
                is_valid, err_msg, norm_val = normalize_date(val)
            elif fid == "annual_income":
                is_valid, err_msg, norm_val = validate_annual_income(val)
            else:
                # Text length check
                if field.validation_rules:
                    val_str = str(val).strip()
                    if field.validation_rules.min_length and len(val_str) < field.validation_rules.min_length:
                        is_valid = False
                        err_msg = f"Minimum length is {field.validation_rules.min_length} characters"

            if not is_valid:
                invalid_fields[fid] = err_msg or "Invalid field format"
                field_validations[fid] = FieldValidationResult(
                    valid=False,
                    message=err_msg,
                    normalized_value=val
                )
            else:
                field_validations[fid] = FieldValidationResult(
                    valid=True,
                    message=None,
                    normalized_value=norm_val
                )

        overall_valid = (len(missing_required) == 0) and (len(invalid_fields) == 0)

        return ValidationResponse(
            valid=overall_valid,
            missing_required=missing_required,
            invalid_fields=invalid_fields,
            field_validations=field_validations
        )

validation_service = ValidationService()
