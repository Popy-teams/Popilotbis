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

INSERT INTO team_members (id, name, initials, role, email, availability, workload)
VALUES
  ('user-1', 'Alice Martin', 'AM', 'Lead Developer', 'alice@popilot.com', 'Occupé', 70),
  ('user-2', 'Bob Dupont', 'BD', 'Tech Lead', 'bob@popilot.com', 'Disponible', 45),
  ('user-3', 'Claire Rousseau', 'CR', 'QA Engineer', 'claire@popilot.com', 'Disponible', 35),
  ('user-4', 'David Leroy', 'DL', 'UX Designer', 'david@popilot.com', 'Occupé', 60),
  ('user-5', 'Emma Bernard', 'EB', 'Product Owner', 'emma@popilot.com', 'Occupé', 55),
  ('user-6', 'Fabio Garcia', 'FG', 'Project Manager', 'fabio@popilot.com', 'Occupé', 65),
  ('user-7', 'Sonia Laurent', 'SL', 'Quality Manager', 'sonia@popilot.com', 'Occupé', 50)
ON CONFLICT (id) DO NOTHING;

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
