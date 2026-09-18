from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_process_demo_pipeline():
    response = client.post(
        "/api/process",
        data={"is_demo": "true", "form_id": "citizen_service_form"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Ananya Sharma" in data["transcript"]
    assert "fields" in data
    assert data["fields"]["full_name"] == "Ananya Sharma"
    assert data["fields"]["mobile_number"] == "9876543210"

def test_submit_demo_form():
    fields = {
        "full_name": "Ananya Sharma",
        "date_of_birth": "2004-03-12",
        "mobile_number": "9876543210",
        "address": "Hyderabad, Telangana",
        "district": "Hyderabad",
        "state": "Telangana"
    }
    payload = {
        "form_id": "citizen_service_form",
        "fields": fields,
        "confirmed_by_user": True
    }
    response = client.post("/api/submit-demo", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "VF-SUB-" in res["submission_id"]
    assert res["stored_locally"] is True
