import os
import pytest
from app.services.whisper_service import whisper_service

def test_whisper_availability():
    is_ready, msg = whisper_service.check_availability()
    assert is_ready is True
    assert "whisper-cli.exe" in whisper_service.executable_path

def test_real_whisper_cli_transcription():
    sample_wav = r"C:\whisper.cpp\samples\jfk.wav"
    if os.path.exists(sample_wav):
        success, transcript, engine = whisper_service.transcribe_audio_file(sample_wav, "en")
        assert success is True
        assert engine == "whisper-cli.exe"
        assert "country" in transcript.lower() or "fellow americans" in transcript.lower()
