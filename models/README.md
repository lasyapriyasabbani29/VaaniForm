# VaaniForm Local AI Models Setup

VaaniForm operates 100% locally on your device. Personal data never leaves your computer.

## 1. Local LLM Setup (Ollama)

1. **Install Ollama** for Windows from [https://ollama.com/download](https://ollama.com/download).
2. Start Ollama:
   ```cmd
   ollama serve
   ```
3. Download the default model (`gemma3:4b`):
   ```cmd
   ollama pull gemma3:4b
   ```
   *Alternative lightweight models for low-memory devices:*
   ```cmd
   ollama pull llama3.2:1b
   ollama pull qwen2.5:1.5b
   ```
4. Set `OLLAMA_MODEL` in your `.env` file if using a model other than `gemma3:4b`.

---

## 2. Speech-to-Text Setup (Whisper.cpp)

Whisper.cpp provides fast, local speech recognition without cloud APIs.

### Windows Setup Instructions:
1. Clone the Whisper.cpp repository:
   ```cmd
   git clone https://github.com/ggerganov/whisper.cpp.git c:\whisper.cpp
   cd c:\whisper.cpp
   ```
2. Build `whisper.cpp` using CMake + Visual Studio or MinGW:
   ```cmd
   cmake -B build
   cmake --build build --config Release
   ```
3. Download the GGML model (e.g. `ggml-base.bin`):
   ```cmd
   ./models/download-ggml-model.cmd base
   ```
4. Configure `.env` in `VaaniForm`:
   ```ini
   WHISPER_EXECUTABLE_PATH=c:\whisper.cpp\build\bin\Release\main.exe
   WHISPER_MODEL_PATH=c:\whisper.cpp\models\ggml-base.bin
   ```

*Note: If Whisper.cpp is not installed, VaaniForm will detect its absence via `GET /health` and display setup guidance in the UI while allowing fallback testing.*
