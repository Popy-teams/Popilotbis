# Déploiement de Popilot

Ce document explique comment l'application est déployée en ligne, comment y
accéder, et comment l'administrer au quotidien.

## 🌍 Accès rapide

| Ressource | Adresse |
|-----------|---------|
| **Application** | `http://37.27.38.81:5173` |
| **API (health)** | `http://37.27.38.81:3001/api/health` |
| Compte démo | `admin@popilot.com` / `Popilot2026!` |

> Serveur hébergé chez Hetzner Cloud, région Helsinki — IP publique
> `37.27.38.81`.

---

## 🏗️ Architecture

L'application tourne sur **un seul serveur Linux (VPS)** via **Docker Compose**.
Quatre conteneurs sont lancés :

| Service | Rôle | Port |
|---------|------|------|
| `app` | Frontend React + Vite | 5173 (exposé publiquement) |
| `api` | Backend Node/Express | 3001 |
| `db` | Base PostgreSQL | 5432 (interne) |
| `mailhog` | Faux serveur mail (dev/démo) | 8025 |

Le navigateur ne contacte que le **port 5173**. Le frontend redirige en interne
les appels `/api` vers le conteneur `api` (proxy Vite), qui parle à `db`.

```
Navigateur ──> :5173 (app) ──/api──> api:3001 ──> db:5432
```

---

## ⚙️ Ce qui a été fait pour le déploiement

1. **Serveur** : VPS Ubuntu 24.04 créé chez Hetzner Cloud (type CX22).
2. **Accès SSH** : connexion par clé publique (voir section « Donner l'accès »).
3. **Docker** installé via `curl -fsSL https://get.docker.com | sh`.
4. **Code** récupéré avec `git clone` de ce dépôt.
5. **Secrets de production** : un fichier `docker-compose.override.yml` (généré
   *sur le serveur*, non versionné) remplace les valeurs de test par des secrets
   forts générés avec `openssl rand`. Voir ci-dessous.
6. **Lancement** : `docker compose up --build -d`.
7. **Pare-feu** : ports 22 (SSH) et 5173 (app) ouverts via `ufw`.

### Le fichier `docker-compose.override.yml`

⚠️ Ce fichier **n'est pas dans Git** (il contient des secrets). Il existe
uniquement sur le serveur. Docker Compose le fusionne automatiquement avec
`docker-compose.yml`. Il a été créé ainsi :

```bash
JWT=$(openssl rand -hex 32)
DBPASS=$(openssl rand -hex 16)
cat > docker-compose.override.yml <<EOF
services:
  api:
    environment:
      - JWT_SECRET=${JWT}
      - DATABASE_URL=postgresql://popilot:${DBPASS}@db:5432/popilot
  app:
    environment:
      - DATABASE_URL=postgresql://popilot:${DBPASS}@db:5432/popilot
  db:
    environment:
      POSTGRES_PASSWORD: ${DBPASS}
EOF
```

> Si on recrée le serveur de zéro, il faut **régénérer ce fichier** avant le
> `docker compose up`.

---

## 🔑 Les accès (3 niveaux distincts)

Il existe **trois accès indépendants** — ne pas les confondre :

| Accès | À quoi ça sert | Comment l'obtenir |
|-------|----------------|-------------------|
| **L'application** | Utiliser Popilot dans le navigateur | Déjà public : http://37.27.38.81:5173 (aucune config) |
| **Console Hetzner** | Gérer le serveur (redémarrer, conso, supprimer) | Invitation par email (voir a) |
| **SSH au serveur** | Lancer Docker, voir les logs, opérer le déploiement | Ajouter sa clé publique (voir b) |

### a) Console Hetzner — inviter un membre

Chaque membre utilise **son propre compte** (aucun mot de passe partagé) :

1. Console Hetzner (https://console.hetzner.cloud) → projet → **Security** → onglet **Members** → **Add member**
2. Saisir l'email du membre et choisir son rôle
3. Le membre reçoit une invitation et se connecte avec son propre compte

> ⚠️ Ajouter une clé SSH *dans la console Hetzner* ne donne **pas** accès au
> serveur déjà en route — ces clés ne servent qu'à la **création** d'un nouveau
> serveur. Pour l'accès SSH, voir ci-dessous.

### b) Accès SSH — ajouter une clé

Principe : **une clé par machine**. On dépose la clé *publique* de chaque machine
dans `~/.ssh/authorized_keys` du serveur.

1. Sur la machine concernée, générer une clé et afficher sa partie publique :
   ```bash
   ssh-keygen -t ed25519 -C "prenom - machine"
   cat ~/.ssh/id_ed25519.pub
   ```
2. Transmettre la ligne affichée (clé **publique**) à quelqu'un déjà connecté.
3. Depuis une machine **déjà autorisée**, l'ajouter au serveur :
   ```bash
   ssh root@37.27.38.81
   echo "ssh-ed25519 AAAA...clé-publique" >> ~/.ssh/authorized_keys
   ```
4. La nouvelle machine peut se connecter : `ssh root@37.27.38.81`
   (à la 1re connexion, répondre **`yes`** — le mot complet — à la question
   d'identité du serveur, sinon « Host key verification failed »)

> Pourquoi passer par une machine déjà autorisée ? La connexion par mot de passe
> est désactivée (clé uniquement), donc toute nouvelle clé s'ajoute depuis une
> machine qui a déjà l'accès.

**Plusieurs machines pour une même personne** (ex. PC fixe + portable) : répéter
l'opération pour chaque machine — chacune a sa propre clé.

**Révoquer un accès** : `nano ~/.ssh/authorized_keys` sur le serveur, supprimer la
ligne correspondante.

---

## 🛠️ Commandes du quotidien

Toutes à exécuter **sur le serveur**, dans le dossier `Popilotbis/`.

```bash
# Voir l'état des services
docker compose ps

# Suivre les logs en direct (Ctrl+C pour quitter)
docker compose logs -f
docker compose logs -f api      # logs d'un seul service

# Redémarrer / arrêter
docker compose restart
docker compose down             # arrête tout
docker compose up -d            # relance

# Mettre à jour le code après un push GitHub
git pull
docker compose up --build -d    # rebuild + relance
```

### Réinitialiser la base de données (⚠️ efface les données)

```bash
docker compose down -v
docker compose up --build -d
```

### Inspecter la base

```bash
docker compose exec db psql -U popilot -d popilot -c "SELECT id, name FROM projects;"
```

---

## 🔒 Notes de sécurité (état actuel)

Ce déploiement est adapté à une **démo / projet d'école**, pas à un usage public
critique. Points à connaître :

- Le frontend tourne avec le **serveur de dev Vite** (pas une build optimisée).
- Les **emails** passent par MailHog (faux serveur) : aucun mail réel n'est
  envoyé.
- L'accès est en **HTTP** (pas de HTTPS / cadenas tant qu'il n'y a pas de
  nom de domaine).
- Les secrets (JWT, mot de passe DB) sont bien **générés aléatoirement** sur le
  serveur (pas les valeurs de test du dépôt).

### Améliorations possibles
- Ajouter un **nom de domaine** + reverse proxy **Caddy** → URL propre + HTTPS.
- Build de **production** du frontend (`vite build` + serveur statique).
- Vrai service SMTP pour l'envoi d'emails.
