import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="VaaniForm Backend API",
    description="Offline-First, Voice-First Form Assistant API powering local Whisper.cpp and Ollama AI pipeline.",
    version="1.0.0"
)

# Configure CORS for local Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api and top-level /health
app.include_router(router, prefix="/api")
app.include_router(router)  # Also expose /health at root level for requirements compliance

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
