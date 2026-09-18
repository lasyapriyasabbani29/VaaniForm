# PowerShell script to start VaaniForm Vite Frontend on Windows

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Starting VaaniForm Vite Frontend           " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$ScriptDir = $PSScriptRoot
$FrontendDir = Join-Path $ScriptDir "frontend"
Set-Location $FrontendDir

if (-not (Test-Path "$FrontendDir\node_modules")) {
    Write-Host "Installing frontend node packages..." -ForegroundColor Yellow
    npm install
}

Write-Host "Launching Vite development server on http://localhost:5173..." -ForegroundColor Green
npm run dev
