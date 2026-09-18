import os
import subprocess
import tempfile
import base64
import re
from typing import Dict, Any, Tuple, Optional

class WhisperService:
    def __init__(self):
        self.executable_path = os.environ.get(
            "WHISPER_EXECUTABLE_PATH",
            r"C:\whisper.cpp\build\bin\Release\whisper-cli.exe"
        )
        self.model_path = os.environ.get(
            "WHISPER_MODEL_PATH",
            r"C:\whisper.cpp\ggml-base.bin"
        )
        self.language = os.environ.get("WHISPER_LANGUAGE", "en")

    def check_availability(self) -> Tuple[bool, str]:
        """
        Checks if whisper-cli.exe executable and model file exist on Windows.
        """
        exe_exists = os.path.isfile(self.executable_path)
        model_exists = os.path.isfile(self.model_path)

        if exe_exists and model_exists:
            return True, f"Whisper.cpp ready: {self.executable_path}"
        
        missing = []
        if not exe_exists:
            missing.append(f"Executable not found at '{self.executable_path}'")
        if not model_exists:
            missing.append(f"Model not found at '{self.model_path}'")

        msg = "Whisper.cpp unavailable: " + "; ".join(missing)
        return False, msg

    def transcribe_audio_file(self, audio_path: str, language: str = "en") -> Tuple[bool, str, str]:
        """
        Transcribes audio file using real whisper-cli.exe executable on Windows.
        Returns: (success, transcript_text, engine_used)
        """
        is_ready, status_msg = self.check_availability()
        if not is_ready:
            return False, status_msg, "none"

        try:
            # Command: whisper-cli.exe -m <model> -f <audio_path> -l <lang> -nt -np
            cmd = [
                self.executable_path,
                "-m", self.model_path,
                "-f", audio_path,
                "-l", language,
                "-nt",
                "-np"
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=90
            )

            if result.returncode == 0:
                raw_output = result.stdout.strip()
                if not raw_output and result.stderr:
                    raw_output = result.stderr.strip()

                # Filter out whisper system log lines (e.g. read_audio_data: ...)
                cleaned_lines = []
                for line in raw_output.splitlines():
                    line_str = line.strip()
                    if line_str and not line_str.startswith("read_audio_data:") and not line_str.startswith("whisper_"):
                        cleaned_lines.append(line_str)

                transcript = " ".join(cleaned_lines).strip()
                if not transcript:
                    transcript = raw_output  # fallback to raw if filtering removed everything

                return True, transcript, "whisper-cli.exe"
            else:
                err_msg = f"whisper-cli.exe process failed (exit code {result.returncode}): {result.stderr.strip()}"
                return False, err_msg, "whisper-cli.exe"

        except Exception as e:
            return False, f"Whisper transcription error: {str(e)}", "whisper-cli.exe"

    def transcribe_base64_audio(self, audio_base64: str, language: str = "en") -> Tuple[bool, str, str]:
        """
        Saves base64 audio payload to temporary WAV file and runs local whisper-cli.exe.
        """
        try:
            audio_bytes = base64.b64decode(audio_base64)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            success, transcript, engine = self.transcribe_audio_file(tmp_path, language)
            
            # Clean up temporary WAV file
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

            return success, transcript, engine
        except Exception as e:
            return False, f"Invalid audio payload: {str(e)}", "none"

whisper_service = WhisperService()
