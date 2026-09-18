import os
import base64
import httpx
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_live_whisper_api():
    sample_wav = r"C:\whisper.cpp\samples\jfk.wav"
    assert os.path.exists(sample_wav)
    with open(sample_wav, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    response = client.post("/api/transcribe", data={"audio_base64": audio_b64, "language": "en"})
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["engine"] == "whisper-cli.exe"
    assert "fellow americans" in res["transcript"].lower() or "country" in res["transcript"].lower()
