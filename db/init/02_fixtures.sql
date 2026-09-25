INSERT INTO projects (id, name, description, status, priority, progress, deadline, budget_total, budget_used, owner)
VALUES (
  'popy',
  'Projet POPY - Robot Educatif',
  'Pilotage du robot educatif POPY avec suivi ISO 9001',
  'on-track',
  'high',
  68,
  '2026-12-31',
  150000.00,
  92500.00,
  'SHIREL'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, role)
VALUES
  ('user-1', 'alice@popilot.com', crypt('password', gen_salt('bf')), 'Alice Martin', 'manager'),
  ('user-2', 'bob@popilot.com', crypt('password', gen_salt('bf')), 'Bob Dupont', 'member'),
  ('user-3', 'claire@popilot.com', crypt('password', gen_salt('bf')), 'Claire Rousseau', 'member'),
  ('user-4', 'david@popilot.com', crypt('password', gen_salt('bf')), 'David Leroy', 'member'),
  ('user-5', 'emma@popilot.com', crypt('password', gen_salt('bf')), 'Emma Bernard', 'manager'),
  ('user-6', 'fabio@popilot.com', crypt('password', gen_salt('bf')), 'Fabio Garcia', 'manager'),
  ('user-7', 'sonia@popilot.com', crypt('password', gen_salt('bf')), 'Sonia Laurent', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Aucun membre d'équipe préchargé. L'admin ajoute manuellement les membres via l'interface.

INSERT INTO tasks (id, title, description, project_id, assigned_to, status, priority, due_date, progress)
VALUES
  ('task-1', 'Developper le prototype V0 du robot POPY', 'Prototype fonctionnel avec reconnaissance emotionnelle de base', 'popy', 'user-1', 'in-progress', 'high', '2026-02-15', 65),
  ('task-2', 'Rediger la documentation technique complete', 'Documentation architecture, API et maintenance', 'popy', 'user-2', 'todo', 'medium', '2026-03-01', 0),
  ('task-3', 'Tests unitaires et validation IA emotionnelle', 'Validation performances moteur emotionnel', 'popy', 'user-3', 'done', 'high', '2026-01-20', 100),
  ('task-4', 'Conception interface utilisateur tactile', 'Design de l interface tactile enfant-robot', 'popy', 'user-4', 'in-progress', 'high', '2026-02-10', 40),
  ('task-5', 'Validation PO et demonstration V0', 'Demonstration du prototype et decision GO/NO-GO', 'popy', 'user-5', 'todo', 'high', '2026-02-20', 0),
  ('task-6', 'Planification Sprint 4 - Module IA avancee', 'Organisation sprint 4 dedie IA avancee', 'popy', 'user-6', 'in-progress', 'medium', '2026-01-25', 50),
  ('task-7', 'Approvisionnement composants electroniques V1', 'Commande composants version V1', 'popy', 'user-6', 'in-progress', 'high', '2026-01-30', 80),
  ('task-8', 'Tests securite enfants - Normes CE', 'Validation conformite normes securite enfants', 'popy', 'user-7', 'in-progress', 'high', '2026-02-05', 30),
  ('task-9', 'Mise a jour registre des risques projet', 'Actualisation risques et mitigations', 'popy', 'user-7', 'in-progress', 'medium', '2026-01-31', 70),
  ('task-10', 'Retrospective Sprint 3', 'Session retrospective et plan d amelioration continue', 'popy', 'user-5', 'done', 'medium', '2026-01-18', 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pipeline_stages (id, project_id, name, "order", status, progress, objectives, deliverables)
VALUES
  ('stage-popy-1', 'popy', 'Cadrage & Spécifications', 1, 'completed', 100, ARRAY['Définir le cahier des charges', 'Valider le budget'], ARRAY['Cahier des charges', 'Plan de projet']),
  ('stage-popy-2', 'popy', 'Conception & Prototypage', 2, 'in-progress', 65, ARRAY['Réaliser le design 3D', 'Développer le soft v1'], ARRAY['Maquette 3D', 'Prototype V1']),
  ('stage-popy-3', 'popy', 'Tests & Validation', 3, 'not-started', 0, ARRAY['Tests utilisateurs', 'Certification CE'], ARRAY['Rapport de test', 'Certificat CE']),
  ('stage-popy-4', 'popy', 'Industrialisation', 4, 'not-started', 0, ARRAY['Lancement en production', 'Marketing'], ARRAY['Produits finis'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO gantt_items (id, project_id, label, start_date, end_date, progress, status, assignee)
VALUES
  ('gantt-popy-1', 'popy', 'Phase de Cadrage', '2026-01-01', '2026-01-15', 100, 'completed', 'user-6'),
  ('gantt-popy-2', 'popy', 'Prototypage Robot', '2026-01-16', '2026-03-30', 65, 'in-progress', 'user-1'),
  ('gantt-popy-3', 'popy', 'Certification CE', '2026-04-01', '2026-05-15', 0, 'planned', 'user-7')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kpi_metrics (id, project_id, category_id, name, objective, measurement_method, responsible, target_threshold, threshold_kind, target_numeric, unit, current_value, previous_value, status, trend)
VALUES
  ('kpi-1', 'popy', 'robot', 'Stabilité Système', 'Éviter les reboots inattendus', 'Logs', 'Lead Tech', '> 99.9%', 'min', 99.9, '%', 98.5, 99.0, 'warning', 'down'),
  ('kpi-2', 'popy', 'robot', 'Latence Vision', 'Traitement temps réel fluide', 'Caméra', 'Lead Tech', '< 50ms', 'max', 50, 'ms', 45, 60, 'good', 'up')
ON CONFLICT (id) DO NOTHING;

INSERT INTO dashboard_alerts (id, project_id, message, severity)
VALUES
  ('alert-1', 'popy', 'Budget R&D dépassé de 15% ce trimestre', 'critical'),
  ('alert-2', 'popy', 'Retard de 3 jours sur la certification CE', 'warning')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketing_actions (id, project_id, title, type, budget, target, status, roi_expected, date)
VALUES
  ('mkt-1', 'popy', 'Campagne Réseaux Sociaux', 'Digital', 5000, 'B2C', 'planned', '150% ROI', '2026-06-01'),
  ('mkt-2', 'popy', 'Salon de la Robotique', 'Événement', 15000, 'B2B', 'in-progress', '20 prospects qualifiés', '2026-09-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roadmap_phases (id, project_id, name, timeline, status, budget, progress, key_deliverables)
VALUES
  ('rmp-1', 'popy', 'Lancement MVP', 'Q3 2026', 'planned', 50000, 20, ARRAY['Application mobile', 'Robot version 1'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO veille_entries (id, project_id, title, category, impact, source, date, author, summary, link, tags, status)
VALUES
  ('veille-1', 'popy', 'Nouvelle norme IA', 'Réglementaire', 'high', 'Journal Officiel', '2026-02-15', 'Alice', 'Impact sur le traitement des données des caméras', 'https://example.com/loi', ARRAY['IA', 'RGPD'], 'new'),
  ('veille-2', 'popy', 'Batteries Solid-State', 'Technologique', 'medium', 'Tech Review', '2026-01-20', 'Bob', 'Nouvelles batteries plus légères', 'https://example.com/batt', ARRAY['Hardware', 'Autonomie'], 'analyzed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO client_surveys (id, project_id, title, description, phase, questions, share_token, status)
VALUES
  ('survey-1', 'popy', 'Étude de marché initiale', 'Attentes des utilisateurs', 'study', '[{"id": "q1", "type": "csat", "label": "Êtes-vous intéressé par ce robot ?", "required": true}]'::jsonb, 'token-123', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO survey_responses (id, survey_id, survey_title, project_id, phase, respondent_name, respondent_type, answers, csat, sentiment, status)
VALUES
  ('resp-1', 'survey-1', 'Étude de marché initiale', 'popy', 'study', 'Marc Dubois', 'parent', '{"q1": 4}'::jsonb, 4, 'positive', 'new')
ON CONFLICT (id) DO NOTHING;
