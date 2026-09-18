# PowerShell script to inspect local system environment for VaaniForm on Windows

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       VaaniForm Environment Checker (Windows)    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Check Python 3.11
$py311 = "C:\Users\sabba\AppData\Local\Programs\Python\Python311\python.exe"
if (Test-Path $py311) {
    $pyVer = & $py311 --version 2>&1
    Write-Host "[✓] Python 3.11: Installed at $py311 ($pyVer)" -ForegroundColor Green
} else {
    Write-Host "[!] Python 3.11: Not found at $py311" -ForegroundColor Yellow
}

# 2. Check Node & npm
try {
    $nodeVersion = & node -v 2>&1
    $npmVersion = & npm -v 2>&1
    Write-Host "[✓] Node.js: $nodeVersion (npm: $npmVersion)" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js / npm: Not found in PATH" -ForegroundColor Red
}

# 3. Check Ollama
try {
    $ollamaVersion = & ollama --version 2>&1
    Write-Host "[✓] Ollama CLI: $ollamaVersion" -ForegroundColor Green
    
    $ollamaHttp = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -ErrorAction SilentlyContinue
    if ($ollamaHttp) {
        Write-Host "    [✓] Ollama HTTP Service: Running on http://localhost:11434" -ForegroundColor Green
        $models = $ollamaHttp.models | Select-Object -ExpandProperty name
        Write-Host "    [i] Installed Models: $($models -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "    [!] Ollama HTTP Service: Not running on port 11434. Start with 'ollama serve'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[!] Ollama CLI: Not found in PATH" -ForegroundColor Yellow
}

# 4. Check Whisper.cpp Executable & Model
$whisperExe = "C:\whisper.cpp\build\bin\Release\whisper-cli.exe"
$whisperModel = "C:\whisper.cpp\ggml-base.bin"

if (Test-Path $whisperExe) {
    Write-Host "[✓] Whisper.cpp Executable: Ready at $whisperExe" -ForegroundColor Green
} else {
    Write-Host "[✗] Whisper.cpp Executable: Missing at $whisperExe" -ForegroundColor Red
}

if (Test-Path $whisperModel) {
    Write-Host "[✓] Whisper.cpp Model: Ready at $whisperModel" -ForegroundColor Green
} else {
    Write-Host "[✗] Whisper.cpp Model: Missing at $whisperModel" -ForegroundColor Red
}

Write-Host "==================================================" -ForegroundColor Cyan
