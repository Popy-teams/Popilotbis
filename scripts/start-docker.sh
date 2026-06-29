#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Erreur : Docker n'est pas installé ou pas dans le PATH."
  echo "Installez Docker Desktop : https://docs.docker.com/get-docker/"
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Erreur : Docker Compose introuvable."
  exit 1
fi

echo "==> Démarrage Popilot (build + détaché)…"
"${COMPOSE[@]}" up --build -d

echo ""
echo "Popilot est en cours de démarrage."
echo "  Application : http://localhost:5173"
echo "  API         : http://localhost:3001"
echo "  MailHog     : http://localhost:8025"
echo "  PostgreSQL  : localhost:5432 (popilot / popilot)"
echo ""
echo "Compte démo : admin@popilot.com / Popilot2026!"
echo ""
echo "Logs : ${COMPOSE[*]} logs -f"
echo "Stop : ${COMPOSE[*]} down"
