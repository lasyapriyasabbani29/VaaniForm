# PowerShell script to start VaaniForm FastAPI Backend on Windows

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Starting VaaniForm FastAPI Backend          " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$CurrentDir = Get-Location
if ((Split-Path -Leaf $CurrentDir) -eq "backend") {
    $BackendDir = $CurrentDir
} else {
    $BackendDir = Join-Path $PSScriptRoot "backend"
}

Set-Location $BackendDir

$VenvPython = ".\venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    Write-Host "[!] Virtual environment not found at $VenvPython" -ForegroundColor Red
    Write-Host "Creating virtual environment with Python 3.11..." -ForegroundColor Yellow
    & "C:\Users\sabba\AppData\Local\Programs\Python\Python311\python.exe" -m venv "$BackendDir\venv"
    & "$VenvPython" -m pip install -r "$BackendDir\requirements.txt"
}

# Check for process listening on port 8000
$portCheck = netstat -ano | findstr :8000
if ($portCheck) {
    Write-Host "[!] Port 8000 appears to be occupied:" -ForegroundColor Yellow
    Write-Host $portCheck -ForegroundColor Gray
}

Write-Host "Launching Uvicorn server on http://127.0.0.1:8000..." -ForegroundColor Green
& "$VenvPython" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
