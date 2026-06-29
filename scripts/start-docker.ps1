#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker n'est pas installé. Installez Docker Desktop : https://docs.docker.com/get-docker/"
}

$composeArgs = @("compose")
try {
    docker compose version | Out-Null
} catch {
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $composeArgs = @()
        $composeExe = "docker-compose"
    } else {
        Write-Error "Docker Compose introuvable."
    }
}

Write-Host "==> Démarrage Popilot (build + détaché)…" -ForegroundColor Cyan
if ($composeArgs.Count -gt 0) {
    docker @composeArgs up --build -d
} else {
    & $composeExe up --build -d
}

Write-Host ""
Write-Host "Popilot est en cours de démarrage."
Write-Host "  Application : http://localhost:5173"
Write-Host "  API         : http://localhost:3001"
Write-Host "  MailHog     : http://localhost:8025"
Write-Host "  PostgreSQL  : localhost:5432 (popilot / popilot)"
Write-Host ""
Write-Host "Compte démo : admin@popilot.com / Popilot2026!"
