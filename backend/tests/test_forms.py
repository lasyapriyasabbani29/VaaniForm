from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_forms():
    response = client.get("/api/forms")
    assert response.status_code == 200
    forms = response.json()
    assert isinstance(forms, list)
    assert len(forms) >= 1
    assert any(f["form_id"] == "citizen_service_form" for f in forms)

def test_get_citizen_service_form():
    response = client.get("/api/forms/citizen_service_form")
    assert response.status_code == 200
    form = response.json()
    assert form["form_id"] == "citizen_service_form"
    assert "fields" in form
    field_ids = [field["id"] for field in form["fields"]]
    expected_fields = [
        "full_name", "date_of_birth", "mobile_number", "address",
        "father_mother_name", "occupation", "annual_income", "district", "state"
    ]
    for expected in expected_fields:
        assert expected in field_ids
