# Popilot

Plateforme de pilotage projet avec conformité ISO 9001.

[![CI](https://github.com/Meriem1403/Popilotbis/actions/workflows/ci.yml/badge.svg)](https://github.com/Meriem1403/Popilotbis/actions/workflows/ci.yml)
[![Qualité](https://github.com/Meriem1403/Popilotbis/actions/workflows/quality.yml/badge.svg)](https://github.com/Meriem1403/Popilotbis/actions/workflows/quality.yml)
[![E2E](https://github.com/Meriem1403/Popilotbis/actions/workflows/e2e.yml/badge.svg)](https://github.com/Meriem1403/Popilotbis/actions/workflows/e2e.yml)
[![Sécurité](https://github.com/Meriem1403/Popilotbis/actions/workflows/security.yml/badge.svg)](https://github.com/Meriem1403/Popilotbis/actions/workflows/security.yml)

## Lancer avec Docker

```bash
docker compose up --build -d
```

| Service | URL / accès |
|---------|-------------|
| Application | http://localhost:5173 |
| API auth | http://localhost:3001 |
| MailHog | http://localhost:8025 |
| PostgreSQL | `localhost:5432` — db `popilot` / user `popilot` / pass `popilot` |

**Compte démo :** `admin@popilot.com` / `Popilot2026!`

## Développement local

```bash
pnpm install
pnpm dev                    # frontend :5173
cd server && npm install && npm run dev   # API :3001
```

## CI/CD & DevOps

Les workflows GitHub Actions couvrent l’ensemble du cycle :

| Workflow | Fichier | Déclencheur |
|----------|---------|-------------|
| **CI** | `.github/workflows/ci.yml` | push/PR sur `main`, `develop` |
| **Qualité** | `.github/workflows/quality.yml` | push/PR sur `main` |
| **E2E Playwright** | `.github/workflows/e2e.yml` | push/PR sur `main` |
| **Sécurité** | `.github/workflows/security.yml` | push/PR, hebdo (lundi 6h), manuel |

### Contrôles automatisés

- **Lint** — ESLint (TypeScript / React)
- **Typecheck** — `tsc --noEmit`
- **Tests unitaires** — Vitest (frontend) + Node test (API)
- **Tests E2E** — Playwright (auth, navigation, projets)
- **Sécurité** — Gitleaks (secrets), Trivy (vulnérabilités), npm audit
- **Dependabot** — mises à jour hebdomadaires des dépendances et Actions

### Commandes locales

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:unit
pnpm run test:e2e      # nécessite PostgreSQL + build
pnpm run test:all
```

### Issues & PR

- Modèles d’issues : bug, feature, sécurité (`.github/ISSUE_TEMPLATE/`)
- Template de pull request : `.github/pull_request_template.md`

## Schema + Fixtures

Injectés au premier démarrage PostgreSQL depuis `db/init/` :

- `01_schema.sql`
- `02_fixtures.sql`
- `03_auth.sql`

```bash
docker compose exec db psql -U popilot -d popilot -c "SELECT id, name FROM projects;"
```

## Réinitialiser la base

```bash
docker compose down -v
docker compose up --build -d
```
