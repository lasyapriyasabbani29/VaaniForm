# VaaniForm Backend API

FastAPI backend for VaaniForm providing offline voice transcription via Whisper.cpp and structured field extraction via Ollama local LLM.

## Setup & Running

1. Create Python virtual environment:
   ```cmd
   python -m venv venv
   ```
2. Activate and install requirements:
   ```cmd
   venv\Scripts\pip install -r requirements.txt
   ```
3. Start backend server:
   ```cmd
   venv\Scripts\uvicorn app.main:app --reload --port 8000
   ```

## Endpoints

- `GET /health` - System health & AI models status check
- `GET /api/forms` - List available form templates
- `GET /api/forms/{form_id}` - Retrieve JSON schema for a form
- `POST /api/transcribe` - Local speech-to-text audio transcription
- `POST /api/extract` - Structured JSON field extraction via Ollama
- `POST /api/process` - Complete pipeline execution
- `POST /api/validate` - Form fields validation
- `POST /api/submit-demo` - Local form submission confirmation
