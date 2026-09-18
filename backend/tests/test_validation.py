from app.utils.validators import validate_mobile_number, normalize_date, validate_annual_income
from app.services.validation_service import validation_service

def test_mobile_number_validation():
    # Valid formats
    valid, msg, norm = validate_mobile_number("9876543210")
    assert valid is True
    assert norm == "9876543210"

    valid, msg, norm = validate_mobile_number("+91 98765 43210")
    assert valid is True
    assert norm == "9876543210"

    # Invalid formats
    valid, msg, norm = validate_mobile_number("12345")
    assert valid is False

    valid, msg, norm = validate_mobile_number("5876543210")  # starts with 5
    assert valid is False

def test_date_normalization():
    valid, msg, norm = normalize_date("12 March 2004")
    assert valid is True
    assert norm == "2004-03-12"

    valid, msg, norm = normalize_date("12/03/2004")
    assert valid is True
    assert norm == "2004-03-12"

    valid, msg, norm = normalize_date("2004-03-12")
    assert valid is True
    assert norm == "2004-03-12"

    valid, msg, norm = normalize_date("invalid_date")
    assert valid is False

def test_form_validation_service():
    # Complete valid data
    valid_data = {
        "full_name": "Ananya Sharma",
        "date_of_birth": "12 March 2004",
        "mobile_number": "9876543210",
        "address": "Jubilee Hills, Hyderabad",
        "district": "Hyderabad",
        "state": "Telangana"
    }
    res = validation_service.validate_form_data(valid_data, "citizen_service_form")
    assert res.valid is True
    assert len(res.missing_required) == 0

    # Missing required field
    incomplete_data = {
        "full_name": "Ravi",
        # missing mobile, dob, address, district, state
    }
    res = validation_service.validate_form_data(incomplete_data, "citizen_service_form")
    assert res.valid is False
    assert "mobile_number" in res.missing_required
    assert "date_of_birth" in res.missing_required
