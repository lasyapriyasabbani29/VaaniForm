import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "backend" in data
    assert data["backend"] is True
    assert "whisper_available" in data
    assert "ollama_available" in data
    assert "model" in data
    assert "whisper_executable" in data
    assert "whisper_model" in data
    assert "active_transcription_engine" in data
    assert "active_extraction_engine" in data
