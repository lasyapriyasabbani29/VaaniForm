# PowerShell test pipeline script for VaaniForm on Windows

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Running VaaniForm Automated Verifications  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$ScriptDir = $PSScriptRoot
$BackendDir = Join-Path $ScriptDir "backend"
Set-Location $BackendDir

$VenvPython = Join-Path $BackendDir "venv\Scripts\python.exe"
Write-Host "`n[1/2] Running Backend Pytest suite using $VenvPython..." -ForegroundColor Yellow
& "$VenvPython" -m pytest tests/ -v

Write-Host "`n[2/2] Running Frontend Production Build test..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ScriptDir "frontend"
Set-Location $FrontendDir

npm run build

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "       All VaaniForm Verifications Passed!        " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Set-Location $ScriptDir
