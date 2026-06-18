
# Project Management Application

This is a code bundle for Project Management Application.
The original project is available at:
https://www.figma.com/design/17jLU5VjhwMXljpVidXbYk/Project-Management-Application

## Lancer avec Docker

```bash
docker compose up --build -d
```

Application web:
- `http://localhost:5173`

Base de donnees PostgreSQL:
- Host: `localhost`
- Port: `5432`
- Database: `popilot`
- User: `popilot`
- Password: `popilot`

## Schema + Fixtures

Le schema et les donnees de demonstration sont injectes automatiquement au premier demarrage de PostgreSQL depuis:
- `db/init/01_schema.sql`
- `db/init/02_fixtures.sql`

Pour verifier les donnees:

```bash
docker compose exec db psql -U popilot -d popilot -c "SELECT id, name FROM projects;"
docker compose exec db psql -U popilot -d popilot -c "SELECT id, title, status FROM tasks ORDER BY id LIMIT 5;"
```

## Reinitialiser la base

```bash
docker compose down -v
docker compose up --build -d
```
  