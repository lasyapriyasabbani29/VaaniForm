# PowerShell automated setup script for VaaniForm

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Setting up VaaniForm Project Dependencies  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 1. Setup Backend Virtual Environment
Write-Host "`n[1/2] Setting up Python backend environment..." -ForegroundColor Yellow
$BackendDir = Join-Path $ProjectRoot "backend"
Set-Location $BackendDir

$VenvDir = Join-Path $BackendDir "venv"
if (-not (Test-Path $VenvDir)) {
    Write-Host "Creating Python virtual environment in $VenvDir..." -ForegroundColor Gray
    python -m venv venv
}

# Determine python and pip path in venv (supporting MSYS2 bin or Windows Scripts)
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    $VenvPython = Join-Path $VenvDir "bin\python.exe"
}

$VenvPip = Join-Path $VenvDir "Scripts\pip.exe"
if (-not (Test-Path $VenvPip)) {
    $VenvPip = Join-Path $VenvDir "bin\pip.exe"
}

Write-Host "Using Python executable: $VenvPython" -ForegroundColor Gray
Write-Host "Installing backend dependencies from requirements.txt..." -ForegroundColor Gray
& $VenvPip install -r requirements.txt

# 2. Setup Frontend npm packages
Write-Host "`n[2/2] Setting up React frontend dependencies..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ProjectRoot "frontend"
Set-Location $FrontendDir

Write-Host "Running npm install in $FrontendDir..." -ForegroundColor Gray
npm install

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "       VaaniForm Setup Completed Successfully!    " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Set-Location $ProjectRoot
