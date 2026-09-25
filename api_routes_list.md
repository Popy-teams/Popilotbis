# Architecture de l'API REST Popilot

Ce document recense la liste exhaustive des routes API nécessaires pour rendre l'application Popilot entièrement dynamique et connectée à la base de données PostgreSQL.

## 1. Authentification & Utilisateurs (✅ Existant)
*Routes gérées par `server/src/routes/auth.js`*
- `POST /api/auth/register` : Créer un compte User
- `POST /api/auth/login` : Se connecter (génère un JWT)
- `GET /api/auth/me` : Récupérer son profil
- `POST /api/auth/forgot-password` : Mot de passe oublié
- `POST /api/auth/reset-password` : Réinitialiser le mot de passe
- **À créer** : `PUT /api/users/profile` : Mettre à jour "Mes informations" (Espace personnel)

## 2. Tableau de Bord Personnel (My Dashboard)
- `GET /api/dashboard` : Renvoie les données condensées pour l'utilisateur connecté (tâches, réunions du jour, objectifs, charge de travail).

## 3. Gestion de Projets (Portfolio)
- `GET /api/projects` : Lister tous les projets (avec filtres possibles : statut, priorité).
- `POST /api/projects` : Créer un nouveau projet.
- `GET /api/projects/:id` : Détails d'un projet spécifique.
- `PUT /api/projects/:id` : Modifier un projet.
- `DELETE /api/projects/:id` : Supprimer un projet.

## 4. Tâches
- `GET /api/tasks` : Lister les tâches (avec filtres par projet, par assignation).
- `POST /api/tasks` : Créer une tâche.
- `PUT /api/tasks/:id` : Modifier une tâche (changer le statut, l'avancement).
- `DELETE /api/tasks/:id` : Supprimer une tâche.

## 5. Équipe & Ressources (Team)
- `GET /api/team-members` : Lister les membres de l'équipe (disponibilité et charge de travail).
- `POST /api/team-members` : Ajouter un membre au projet.
- `PUT /api/team-members/:id` : Modifier le rôle ou la disponibilité d'un membre.
- `DELETE /api/team-members/:id` : Retirer un membre.

## 6. Réunions & Planning (Meetings)
- `GET /api/meetings` : Lister les réunions prévues et passées.
- `POST /api/meetings` : Planifier une réunion.
- `PUT /api/meetings/:id` : Modifier une réunion ou ajouter un compte-rendu.
- `DELETE /api/meetings/:id` : Annuler une réunion.

## 7. Budget & Finances
- `GET /api/budgets/projects/:projectId` : Obtenir les lignes budgétaires d'un projet.
- `POST /api/budgets/projects/:projectId` : Ajouter une dépense / une ligne de budget.
- `PUT /api/budgets/:id` : Modifier une ligne de budget.
- `DELETE /api/budgets/:id` : Supprimer une ligne.

## 8. Management & Risques
### Risques
- `GET /api/risks` : Lister les risques (matrice des risques).
- `POST /api/risks` : Déclarer un nouveau risque.
- `PUT /api/risks/:id` : Mettre à jour l'impact ou la probabilité d'un risque.
- `DELETE /api/risks/:id` : Supprimer un risque.

### Processus & Pipeline
- `GET /api/processes`
- `POST /api/processes`
- `PUT /api/processes/:id`
- `DELETE /api/processes/:id`

## 9. Section Qualité & ISO 9001
Chaque domaine qualité nécessite son propre groupe de routes CRUD (Create, Read, Update, Delete) :

- **Veille** (`/api/veille`) : Articles de veille réglementaire et normative.
- **Marketing** (`/api/marketing`) : Actions de la stratégie marketing.
- **Satisfaction Client** (`/api/satisfaction`) : Retours clients, enquêtes et NPS.
- **Audit ISO** (`/api/audits`) : Planification et rapports d'audits internes/externes.
- **KPI** (`/api/kpis`) : Indicateurs de performance (valeurs cibles vs réelles).
- **PDCA** (`/api/pdca`) : Cycle d'amélioration continue (Plan, Do, Check, Act).
- **Documentation** (`/api/documents`) : Gestion de la documentation qualité.
