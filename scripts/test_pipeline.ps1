# PowerShell test pipeline script for VaaniForm on Windows

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Running VaaniForm Automated Verifications  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 1. Run Backend Pytest suite
Write-Host "`n[1/2] Running Backend Pytest suite..." -ForegroundColor Yellow
$BackendDir = Join-Path $ProjectRoot "backend"
Set-Location $BackendDir

$VenvPython = Join-Path $BackendDir "venv\Scripts\python.exe"
& "$VenvPython" -m pytest tests/ -v

# 2. Run Frontend Build test
Write-Host "`n[2/2] Running Frontend Production Build test..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ProjectRoot "frontend"
Set-Location $FrontendDir

npm run build

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "       All VaaniForm Verifications Passed!        " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Set-Location $ProjectRoot
