CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('on-track', 'at-risk', 'delayed', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  deadline DATE NOT NULL,
  budget_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  budget_used NUMERIC(12,2) NOT NULL DEFAULT 0,
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  availability TEXT NOT NULL CHECK (availability IN ('Disponible', 'Occupé', 'Surchargé', 'En congé')),
  workload INTEGER NOT NULL DEFAULT 0 CHECK (workload BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON team_members(project_id);


CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL REFERENCES team_members(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'blocked', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  report TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);

CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('risk', 'opportunity')),
  status TEXT NOT NULL CHECK (status IN ('open', 'in-treatment', 'closed', 'accepted')),
  probability INTEGER NOT NULL,
  impact_cost INTEGER NOT NULL,
  impact_delay INTEGER NOT NULL,
  impact_quality INTEGER NOT NULL,
  impact_security INTEGER NOT NULL,
  impact_image INTEGER NOT NULL,
  criticality TEXT NOT NULL,
  criticality_score INTEGER NOT NULL,
  strategy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);

CREATE TABLE IF NOT EXISTS bom_components (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  functional_name TEXT,
  example TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_estimated NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_estimated NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_price_actual NUMERIC(12,2),
  total_actual NUMERIC(12,2),
  status TEXT NOT NULL,
  supplier_id TEXT,
  price_source TEXT,
  criticality TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bom_components_project_id ON bom_components(project_id);

CREATE TABLE IF NOT EXISTS iso_documents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'validated', 'obsolete')),
  responsible TEXT,
  version TEXT NOT NULL,
  valid_until DATE,
  description TEXT,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_iso_documents_project_id ON iso_documents(project_id);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked')),
  progress INTEGER NOT NULL DEFAULT 0,
  objectives TEXT[],
  deliverables TEXT[],
  exit_criteria TEXT[],
  start_date DATE,
  end_date DATE,
  estimated_duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_project_id ON pipeline_stages(project_id);

CREATE TABLE IF NOT EXISTS gantt_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in-progress', 'completed', 'delayed')),
  assignee TEXT,
  parent_id TEXT REFERENCES gantt_items(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gantt_items_project_id ON gantt_items(project_id);

CREATE TABLE IF NOT EXISTS kpi_metrics (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  objective TEXT,
  measurement_method TEXT,
  responsible TEXT,
  target_threshold TEXT,
  threshold_kind TEXT NOT NULL,
  target_numeric REAL,
  unit TEXT,
  current_value REAL NOT NULL DEFAULT 0,
  previous_value REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('good', 'warning', 'critical')),
  trend TEXT NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_project_id ON kpi_metrics(project_id);

CREATE TABLE IF NOT EXISTS dashboard_alerts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_project_id ON dashboard_alerts(project_id);

CREATE TABLE IF NOT EXISTS marketing_actions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  budget INTEGER NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL,
  roi_expected TEXT,
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketing_actions_project_id ON marketing_actions(project_id);

CREATE TABLE IF NOT EXISTS roadmap_phases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT NOT NULL,
  budget INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  key_deliverables TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_project_id ON roadmap_phases(project_id);

CREATE TABLE IF NOT EXISTS veille_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  impact TEXT NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  author TEXT,
  summary TEXT,
  link TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_veille_entries_project_id ON veille_entries(project_id);

CREATE TABLE IF NOT EXISTS client_surveys (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  share_token TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_surveys_project_id ON client_surveys(project_id);

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES client_surveys(id) ON DELETE CASCADE,
  survey_title TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  respondent_name TEXT,
  respondent_type TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  csat INTEGER,
  ces INTEGER,
  nps INTEGER,
  verbatim TEXT,
  key_topics TEXT[],
  sentiment TEXT,
  linked_tasks TEXT[],
  linked_risks TEXT[],
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_project_id ON survey_responses(project_id);

CREATE TABLE IF NOT EXISTS objectives (
  id VARCHAR(100) PRIMARY KEY,
  project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 100,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
