#!/bin/bash

# Format de date: YYYY-MM-DD_HH-MM-SS
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="backup_popilot_$TIMESTAMP.sql"

echo "Sauvegarde de la base de données en cours..."
docker exec popilotbis-db-1 pg_dump -U popilot popilot > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Sauvegarde réussie : $BACKUP_FILE"
else
  echo "❌ Erreur lors de la sauvegarde."
fi
