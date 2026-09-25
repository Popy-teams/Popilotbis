# Plan d'Hébergement - Projet Popilotbis

> [!NOTE]
> Ce document définit la stratégie d'hébergement gratuit pour le projet scolaire **Popilotbis**, permettant à l'équipe de collaborer et de tester l'application en ligne avec des coûts nuls (0€).

## 1. Architecture Globale

Oui, pour que l'hébergement soit totalement gratuit, l'architecture sera "découplée". Cela signifie que chaque composant du projet sera hébergé sur le service le plus adapté (et gratuit) plutôt que d'avoir un seul gros serveur payant qui fait tout.

Voici comment les éléments seront séparés :

1. **Frontend (L'interface utilisateur React/Vite)**
2. **Backend (L'API Node.js/Express)**
3. **Base de données (PostgreSQL)**
4. **Service d'envoi d'emails**

---

## 2. Choix Techniques & Justifications

### 🖥️ Frontend : Vercel

* **Ce que c'est :** Une plateforme spécialisée dans l'hébergement d'interfaces web.
* **Pourquoi ce choix :** C'est 100% gratuit, extrêmement rapide, et c'est la norme dans l'industrie pour les projets React/Vite.
* **Intégration GitHub :** Déploiement automatique dès que vous "pushez" sur la branche principale de votre dépôt GitHub.

### ⚙️ Backend (API) : Render.com

* **Ce que c'est :** Une plateforme d'hébergement Cloud moderne.
* **Pourquoi ce choix :** Render propose un "Plan Gratuit" (Free Tier) pour héberger des Web Services comme notre API Node.js/Express.
* **Le compromis (gratuit) :** Si l'API ne reçoit pas de requêtes pendant 15 minutes, elle se met en veille (Spin down). La requête suivante mettra environ 30 secondes pour "réveiller" le serveur. Pour un projet d'école, c'est un compromis tout à fait acceptable.

### 🗄️ Base de Données : Supabase

* **Ce que c'est :** Une plateforme très populaire fournissant une base de données PostgreSQL complète (souvent vue comme l'alternative Open Source à Firebase).
* **Pourquoi ce choix :** L'équipe a déjà une première expérience avec cet outil. De plus, son plan gratuit offre 500 Mo de stockage de base de données, ce qui est extrêmement généreux et idéal pour un projet d'école. Nous n'utiliserons que sa partie "Base de données" pour récupérer une simple "URL de connexion" qu'on donnera à notre Backend.

### ✉️ Emails : Resend

* **Ce que c'est :** Une API moderne pour l'envoi d'emails.
* **Pourquoi ce choix :** En local, vous utilisez `Mailhog` (qui intercepte les mails pour ne pas les envoyer réellement). En ligne, il faut un vrai serveur SMTP/API. Resend offre 3000 emails gratuits par mois (jusqu'à 100/jour), ce qui est idéal pour tester les inscriptions/réinitialisations de mot de passe.

---

## 3. Comment procéder ? (Les étapes à suivre)

Voici la feuille de route pour mettre ce projet en ligne :

### Étape 1 : Préparation de la Base de données (Supabase)

1. Créer un compte gratuit.
2. Créer un projet PostgreSQL.
3. Récupérer l'URL de connexion (ex: `postgresql://user:password@serveur/db`). Popilot2026*
4. Exécuter les scripts de création de tables (qui sont actuellement dans `db/init`) directement sur cette base de données distante.

** Connect to Postgres via the shared transaction-mode pooler (IPv4-only)

DATABASE_URL="postgresql://postgres.xaueuzypkzndbqajcxhh:Popilot2026*@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.xaueuzypkzndbqajcxhh:Popilot2026*@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

### Étape 2 : Préparation des Emails (Resend)

1. Créer un compte sur Resend.
2. Obtenir une clé API (`API_KEY`).
3. Adapter légèrement le code de `nodemailer` dans le serveur Node.js pour utiliser les identifiants SMTP de Resend.

### Étape 3 : Déploiement du Backend (Render)

1. Connecter Render à votre dépôt GitHub.
2. Créer un nouveau "Web Service".
3. Paramètres importants :
   * **Build Command :** `npm install`
   * **Start Command :** `npm start`
   * **Variables d'environnement :** Ajouter `DATABASE_URL` (de l'étape 1) et les variables SMTP/JWT nécessaires.

### Étape 4 : Déploiement du Frontend (Netlify)

1. Connecter Netlify à votre dépôt GitHub.
2. Importer le projet
3. Paramètres importants :
   * **Variables d'environnement :** Ajouter `VITE_API_URL` en mettant l'URL de votre backend Render (ex: `https://mon-api-render.onrender.com/api`).
4. Déployer !
