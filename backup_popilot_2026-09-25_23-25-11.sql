--
-- PostgreSQL database dump
--

\restrict fTP07znJdudwPEgN9hDnYhDimTCcVSSFoP0PbeWDhM8iEeWoAEbEt3Hnf3SP3fU

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bom_components; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.bom_components (
    id text NOT NULL,
    project_id text,
    category text NOT NULL,
    name text NOT NULL,
    functional_name text,
    example text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price_estimated numeric(12,2) DEFAULT 0 NOT NULL,
    total_estimated numeric(12,2) DEFAULT 0 NOT NULL,
    unit_price_actual numeric(12,2),
    total_actual numeric(12,2),
    status text NOT NULL,
    supplier_id text,
    price_source text,
    criticality text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bom_components OWNER TO popilot;

--
-- Name: client_surveys; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.client_surveys (
    id text NOT NULL,
    project_id text NOT NULL,
    title text NOT NULL,
    description text,
    phase text NOT NULL,
    questions jsonb DEFAULT '[]'::jsonb NOT NULL,
    share_token text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client_surveys OWNER TO popilot;

--
-- Name: dashboard_alerts; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.dashboard_alerts (
    id text NOT NULL,
    project_id text NOT NULL,
    message text NOT NULL,
    severity text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT dashboard_alerts_severity_check CHECK ((severity = ANY (ARRAY['critical'::text, 'warning'::text])))
);


ALTER TABLE public.dashboard_alerts OWNER TO popilot;

--
-- Name: gantt_items; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.gantt_items (
    id text NOT NULL,
    project_id text NOT NULL,
    label text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    status text NOT NULL,
    assignee text,
    parent_id text,
    task_id text,
    meeting_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gantt_items_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'in-progress'::text, 'completed'::text, 'delayed'::text])))
);


ALTER TABLE public.gantt_items OWNER TO popilot;

--
-- Name: iso_documents; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.iso_documents (
    id text NOT NULL,
    project_id text,
    title text NOT NULL,
    type text NOT NULL,
    category text NOT NULL,
    status text NOT NULL,
    responsible text,
    version text NOT NULL,
    valid_until date,
    description text,
    content text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT iso_documents_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'validated'::text, 'obsolete'::text])))
);


ALTER TABLE public.iso_documents OWNER TO popilot;

--
-- Name: kpi_metrics; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.kpi_metrics (
    id text NOT NULL,
    project_id text NOT NULL,
    category_id text NOT NULL,
    name text NOT NULL,
    objective text,
    measurement_method text,
    responsible text,
    target_threshold text,
    threshold_kind text NOT NULL,
    target_numeric real,
    unit text,
    current_value real DEFAULT 0 NOT NULL,
    previous_value real DEFAULT 0 NOT NULL,
    status text NOT NULL,
    trend text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT kpi_metrics_status_check CHECK ((status = ANY (ARRAY['good'::text, 'warning'::text, 'critical'::text]))),
    CONSTRAINT kpi_metrics_trend_check CHECK ((trend = ANY (ARRAY['up'::text, 'down'::text, 'stable'::text])))
);


ALTER TABLE public.kpi_metrics OWNER TO popilot;

--
-- Name: marketing_actions; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.marketing_actions (
    id text NOT NULL,
    project_id text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    budget integer NOT NULL,
    target text NOT NULL,
    status text NOT NULL,
    roi_expected text,
    date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.marketing_actions OWNER TO popilot;

--
-- Name: meetings; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.meetings (
    id text NOT NULL,
    title text NOT NULL,
    date timestamp with time zone NOT NULL,
    duration integer DEFAULT 60 NOT NULL,
    project_id text,
    meeting_type text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    report text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    participant_ids jsonb DEFAULT '[]'::jsonb,
    writer_name text,
    CONSTRAINT meetings_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'in-progress'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.meetings OWNER TO popilot;

--
-- Name: objectives; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.objectives (
    id character varying(100) NOT NULL,
    project_id character varying(100) NOT NULL,
    name text NOT NULL,
    progress integer DEFAULT 0,
    target integer DEFAULT 100,
    deadline date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.objectives OWNER TO popilot;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO popilot;

--
-- Name: pipeline_stages; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.pipeline_stages (
    id text NOT NULL,
    project_id text NOT NULL,
    name text NOT NULL,
    "order" integer NOT NULL,
    status text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    objectives text[],
    deliverables text[],
    exit_criteria text[],
    start_date date,
    end_date date,
    estimated_duration integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pipeline_stages_status_check CHECK ((status = ANY (ARRAY['not-started'::text, 'in-progress'::text, 'completed'::text, 'blocked'::text])))
);


ALTER TABLE public.pipeline_stages OWNER TO popilot;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    status text NOT NULL,
    priority text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    deadline date NOT NULL,
    budget_total numeric(12,2) DEFAULT 0 NOT NULL,
    budget_used numeric(12,2) DEFAULT 0 NOT NULL,
    owner text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT projects_priority_check CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))),
    CONSTRAINT projects_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['on-track'::text, 'at-risk'::text, 'delayed'::text, 'completed'::text])))
);


ALTER TABLE public.projects OWNER TO popilot;

--
-- Name: risks; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.risks (
    id text NOT NULL,
    project_id text,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    probability integer NOT NULL,
    impact_cost integer NOT NULL,
    impact_delay integer NOT NULL,
    impact_quality integer NOT NULL,
    impact_security integer NOT NULL,
    impact_image integer NOT NULL,
    criticality text NOT NULL,
    criticality_score integer NOT NULL,
    strategy text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT risks_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in-treatment'::text, 'closed'::text, 'accepted'::text]))),
    CONSTRAINT risks_type_check CHECK ((type = ANY (ARRAY['risk'::text, 'opportunity'::text])))
);


ALTER TABLE public.risks OWNER TO popilot;

--
-- Name: roadmap_phases; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.roadmap_phases (
    id text NOT NULL,
    project_id text NOT NULL,
    name text NOT NULL,
    timeline text NOT NULL,
    status text NOT NULL,
    budget integer NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    key_deliverables text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roadmap_phases OWNER TO popilot;

--
-- Name: survey_responses; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.survey_responses (
    id text NOT NULL,
    survey_id text NOT NULL,
    survey_title text NOT NULL,
    project_id text NOT NULL,
    phase text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    respondent_name text,
    respondent_type text,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    csat integer,
    ces integer,
    nps integer,
    verbatim text,
    key_topics text[],
    sentiment text,
    linked_tasks text[],
    linked_risks text[],
    status text DEFAULT 'new'::text NOT NULL
);


ALTER TABLE public.survey_responses OWNER TO popilot;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    project_id text NOT NULL,
    assigned_to text NOT NULL,
    status text NOT NULL,
    priority text NOT NULL,
    due_date date NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))),
    CONSTRAINT tasks_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'in-progress'::text, 'blocked'::text, 'done'::text])))
);


ALTER TABLE public.tasks OWNER TO popilot;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.team_members (
    id text NOT NULL,
    user_id text NOT NULL,
    project_id text NOT NULL,
    role text NOT NULL,
    availability text NOT NULL,
    workload integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    position_ids jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT team_members_availability_check CHECK ((availability = ANY (ARRAY['Disponible'::text, 'Occupé'::text, 'Surchargé'::text, 'En congé'::text]))),
    CONSTRAINT team_members_workload_check CHECK (((workload >= 0) AND (workload <= 100)))
);


ALTER TABLE public.team_members OWNER TO popilot;

--
-- Name: users; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    email_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'member'::text])))
);


ALTER TABLE public.users OWNER TO popilot;

--
-- Name: veille_entries; Type: TABLE; Schema: public; Owner: popilot
--

CREATE TABLE public.veille_entries (
    id text NOT NULL,
    project_id text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    impact text NOT NULL,
    source text NOT NULL,
    date date NOT NULL,
    author text,
    summary text,
    link text,
    tags text[],
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.veille_entries OWNER TO popilot;

--
-- Data for Name: bom_components; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.bom_components (id, project_id, category, name, functional_name, example, quantity, unit_price_estimated, total_estimated, unit_price_actual, total_actual, status, supplier_id, price_source, criticality, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_surveys; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.client_surveys (id, project_id, title, description, phase, questions, share_token, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dashboard_alerts; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.dashboard_alerts (id, project_id, message, severity, created_at) FROM stdin;
\.


--
-- Data for Name: gantt_items; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.gantt_items (id, project_id, label, start_date, end_date, progress, status, assignee, parent_id, task_id, meeting_id, created_at, updated_at) FROM stdin;
gantt-meeting-1790362742026-act-1790368178961-46yu	project:local-1790349432860	test de tache cr	2026-09-26	2026-09-28	0	planned	Sonia Tavares	\N	task-meeting-1790362742026-act-1790368178961-46yu	meeting-1790362742026	2026-09-25 20:30:13.201668+00	2026-09-25 20:30:13.201668+00
gantt-1790370316877-43	popy	Tests utilisateurs	2027-03-01	2027-04-01	0	planned	TM-1790369389809	\N	task-1790370316872-43	\N	2026-09-25 21:05:16.877973+00	2026-09-25 21:05:16.877973+00
gantt-1790370316893-44	popy	Norme jouet	2027-04-01	2027-05-01	0	planned	TM-1790369374261	\N	task-1790370316888-44	\N	2026-09-25 21:05:16.893772+00	2026-09-25 21:05:16.893772+00
gantt-1790370316311-1	popy	Rédaction charte projet	2026-02-01	2026-06-01	100	completed	TM-1790369283232	\N	task-1790370316276-1	\N	2026-09-25 21:05:16.312731+00	2026-09-25 21:05:16.312731+00
gantt-1790370316673-21	popy	Rédaction cahier des charges	2026-02-01	2026-06-01	100	completed	TM-1790369333002	\N	task-1790370316668-21	\N	2026-09-25 21:05:16.674504+00	2026-09-25 21:05:16.674504+00
gantt-1790370316362-2	popy	Définition vision produit	2026-02-01	2026-06-01	100	completed	TM-1790369389809	\N	task-1790370316355-2	\N	2026-09-25 21:05:16.363588+00	2026-09-25 21:05:16.363588+00
gantt-1790370316382-3	popy	Définition roadmap produit	2026-02-01	2026-06-01	100	completed	TM-1790369374261	\N	task-1790370316375-3	\N	2026-09-25 21:05:16.383479+00	2026-09-25 21:05:16.383479+00
gantt-1790370316403-4	popy	Définition MVP V1	2026-02-01	2026-06-01	100	completed	TM-1790369283232	\N	task-1790370316388-4	\N	2026-09-25 21:05:16.40414+00	2026-09-25 21:05:16.40414+00
gantt-1790370316451-7	popy	Gantt détaillé	2026-02-01	2026-06-01	100	completed	TM-1790369389809	\N	task-1790370316446-7	\N	2026-09-25 21:05:16.45203+00	2026-09-25 21:05:16.45203+00
gantt-1790370316462-8	popy	Allocation ressources	2026-02-01	2026-06-01	100	completed	TM-1790369307752	\N	task-1790370316456-8	\N	2026-09-25 21:05:16.463918+00	2026-09-25 21:05:16.463918+00
gantt-1790370316485-9	popy	Plan de charge	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316472-9	\N	2026-09-25 21:05:16.486638+00	2026-09-25 21:05:16.486638+00
gantt-1790370316504-10	popy	Identification risques techniques	2026-02-01	2026-06-01	100	completed	TM-1790369403019	\N	task-1790370316490-10	\N	2026-09-25 21:05:16.505334+00	2026-09-25 21:05:16.505334+00
gantt-1790370316540-11	popy	Identification risques pédagogiques	2026-02-01	2026-06-01	100	completed	TM-1790369307752	\N	task-1790370316518-11	\N	2026-09-25 21:05:16.541576+00	2026-09-25 21:05:16.541576+00
gantt-1790370316564-12	popy	Identification risques réglementaires	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316559-12	\N	2026-09-25 21:05:16.565203+00	2026-09-25 21:05:16.565203+00
gantt-1790370316575-13	popy	Scoring criticité	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316570-13	\N	2026-09-25 21:05:16.57615+00	2026-09-25 21:05:16.57615+00
gantt-1790370316592-14	popy	Plans de mitigation	2026-02-01	2026-06-01	100	completed	TM-1790369307752	\N	task-1790370316580-14	\N	2026-09-25 21:05:16.593231+00	2026-09-25 21:05:16.593231+00
gantt-1790370316601-15	popy	Cartographie processus	2026-02-01	2026-06-01	100	completed	TM-1790369374261	\N	task-1790370316597-15	\N	2026-09-25 21:05:16.602764+00	2026-09-25 21:05:16.602764+00
gantt-1790370316635-17	popy	Procédure gestion documentaire	2026-02-01	2026-06-01	100	completed	TM-1790369333002	\N	task-1790370316622-17	\N	2026-09-25 21:05:16.636464+00	2026-09-25 21:05:16.636464+00
gantt-1790370316643-18	popy	Procédure gestion non-conformité	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316639-18	\N	2026-09-25 21:05:16.644557+00	2026-09-25 21:05:16.644557+00
gantt-1790370316651-19	popy	Procédure gestion modification	2026-02-01	2026-06-01	100	completed	TM-1790369389809	\N	task-1790370316648-19	\N	2026-09-25 21:05:16.652429+00	2026-09-25 21:05:16.652429+00
gantt-1790370316663-20	popy	Recueil besoins équipe	2026-02-01	2026-06-01	100	completed	TM-1790369333002	\N	task-1790370316657-20	\N	2026-09-25 21:05:16.663993+00	2026-09-25 21:05:16.663993+00
gantt-1790370316682-22	popy	Modélisation base données	2026-02-01	2026-06-01	100	completed	TM-1790369374261	\N	task-1790370316679-22	\N	2026-09-25 21:05:16.683762+00	2026-09-25 21:05:16.683762+00
gantt-1790370316776-32	popy	Wireframes & Maquettes Figma	2026-02-01	2026-06-01	100	completed	TM-1790369374261	\N	task-1790370316772-32	\N	2026-09-25 21:05:16.7773+00	2026-09-25 21:05:16.7773+00
gantt-1790370316721-26	popy	Choix hébergeur européen	2026-09-01	2026-09-30	50	in-progress	TM-1790369333002	\N	task-1790370316716-26	\N	2026-09-25 21:05:16.721711+00	2026-09-25 21:05:16.721711+00
gantt-1790370316730-27	popy	Création serveur production	2026-09-01	2026-09-30	50	in-progress	TM-1790369283232	\N	task-1790370316725-27	\N	2026-09-25 21:05:16.730715+00	2026-09-25 21:05:16.730715+00
gantt-1790370316740-28	popy	Mise en place CI/CD	2026-09-01	2026-09-30	50	in-progress	TM-1790369374261	\N	task-1790370316736-28	\N	2026-09-25 21:05:16.741035+00	2026-09-25 21:05:16.741035+00
gantt-1790370316693-23	popy	CRUD projets / risques	2026-10-01	2026-11-30	0	planned	TM-1790369307752	\N	task-1790370316688-23	\N	2026-09-25 21:05:16.694487+00	2026-09-25 21:05:16.694487+00
gantt-1790370316703-24	popy	Module KPI	2026-10-01	2026-11-30	0	planned	TM-1790349923243-906	\N	task-1790370316698-24	\N	2026-09-25 21:05:16.704184+00	2026-09-25 21:05:16.704184+00
gantt-1790370316712-25	popy	Dashboard global	2026-10-01	2026-11-30	0	planned	TM-1790369333002	\N	task-1790370316708-25	\N	2026-09-25 21:05:16.712871+00	2026-09-25 21:05:16.712871+00
gantt-1790370316748-29	popy	API gestion profils	2026-10-01	2026-11-30	0	planned	TM-1790369307752	\N	task-1790370316744-29	\N	2026-09-25 21:05:16.74937+00	2026-09-25 21:05:16.74937+00
gantt-1790370316757-30	popy	API gestion progression	2026-10-01	2026-11-30	0	planned	TM-1790349923243-906	\N	task-1790370316753-30	\N	2026-09-25 21:05:16.758548+00	2026-09-25 21:05:16.758548+00
gantt-1790370316766-31	popy	Chiffrement données	2026-10-01	2026-11-30	0	planned	TM-1790369283232	\N	task-1790370316762-31	\N	2026-09-25 21:05:16.766863+00	2026-09-25 21:05:16.766863+00
gantt-1790370316786-33	popy	Création compte parent	2026-10-01	2026-11-30	0	planned	TM-1790369374261	\N	task-1790370316781-33	\N	2026-09-25 21:05:16.787034+00	2026-09-25 21:05:16.787034+00
gantt-1790370316794-34	popy	Interface enseignants (création classe)	2026-10-01	2026-11-30	0	planned	TM-1790369307752	\N	task-1790370316790-34	\N	2026-09-25 21:05:16.795207+00	2026-09-25 21:05:16.795207+00
gantt-1790370316803-35	popy	Modélisation 3D	2027-01-01	2027-02-28	0	planned	TM-1790369389809	\N	task-1790370316799-35	\N	2026-09-25 21:05:16.804093+00	2026-09-25 21:05:16.804093+00
gantt-1790370316813-36	popy	Simulation chute	2027-01-01	2027-02-28	0	planned	TM-1790369403019	\N	task-1790370316808-36	\N	2026-09-25 21:05:16.813901+00	2026-09-25 21:05:16.813901+00
gantt-1790370316822-37	popy	Schéma alimentation	2027-01-01	2027-02-28	0	planned	TM-1790369389809	\N	task-1790370316818-37	\N	2026-09-25 21:05:16.823304+00	2026-09-25 21:05:16.823304+00
gantt-1790370316833-38	popy	PCB V1	2027-01-01	2027-02-28	0	planned	TM-1790369403019	\N	task-1790370316828-38	\N	2026-09-25 21:05:16.834287+00	2026-09-25 21:05:16.834287+00
gantt-1790370316841-39	popy	Installation OS embarqué	2027-01-01	2027-02-28	0	planned	TM-1790369403019	\N	task-1790370316837-39	\N	2026-09-25 21:05:16.841876+00	2026-09-25 21:05:16.841876+00
gantt-1790370316858-41	popy	Assemblage V1	2027-01-01	2027-02-28	0	planned	TM-1790369403019	\N	task-1790370316854-41	\N	2026-09-25 21:05:16.859203+00	2026-09-25 21:05:16.859203+00
gantt-1790370316867-42	popy	Prototype V2	2027-01-01	2027-02-28	0	planned	TM-1790369389809	\N	task-1790370316862-42	\N	2026-09-25 21:05:16.86787+00	2026-09-25 21:05:16.86787+00
gantt-1790370316849-40	popy	Module pédagogique embarqué	2027-01-01	2027-03-30	0	planned	TM-1790369374261	\N	task-1790370316845-40	\N	2026-09-25 21:05:16.85044+00	2026-09-25 21:05:16.85044+00
gantt-1790370316416-5	popy	Définition version cible V2	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316410-5	\N	2026-09-25 21:05:16.417814+00	2026-09-25 21:05:16.417814+00
gantt-1790370316438-6	popy	Définition critères succès	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316422-6	\N	2026-09-25 21:05:16.43929+00	2026-09-25 21:05:16.43929+00
gantt-1790370316618-16	popy	Définition indicateurs	2026-02-01	2026-06-01	100	completed	TM-1790349923243-906	\N	task-1790370316614-16	\N	2026-09-25 21:05:16.618843+00	2026-09-25 21:05:16.618843+00
gantt-1790370892428-BOM	popy	Rendu BOM (Bill of Materials)	2026-12-01	2026-12-15	0	planned	TM-1790369389809	\N	task-1790370892422-BOM	\N	2026-09-25 21:14:52.429474+00	2026-09-25 21:14:52.429474+00
\.


--
-- Data for Name: iso_documents; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.iso_documents (id, project_id, title, type, category, status, responsible, version, valid_until, description, content, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: kpi_metrics; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.kpi_metrics (id, project_id, category_id, name, objective, measurement_method, responsible, target_threshold, threshold_kind, target_numeric, unit, current_value, previous_value, status, trend, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketing_actions; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.marketing_actions (id, project_id, title, type, budget, target, status, roi_expected, date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.meetings (id, title, date, duration, project_id, meeting_type, status, report, created_at, updated_at, participant_ids, writer_name) FROM stdin;
meeting-1790362742026	Sprint Review — Sprint 1	2026-09-26 10:00:00+00	15	project:local-1790349432860	daily	completed	super	2026-09-25 18:59:02.048095+00	2026-09-25 20:30:13.11615+00	["Alice", "Alice Martin", "Claire Rousseau", "Sonia Tavares"]	Sonia Tavares
\.


--
-- Data for Name: objectives; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.objectives (id, project_id, name, progress, target, deadline, created_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: pipeline_stages; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.pipeline_stages (id, project_id, name, "order", status, progress, objectives, deliverables, exit_criteria, start_date, end_date, estimated_duration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.projects (id, name, description, status, priority, progress, deadline, budget_total, budget_used, owner, created_at, updated_at) FROM stdin;
project:local-1790347561912	rouge	test	on-track	medium	0	2026-12-24	0.00	0.00	Jean Dupont	2026-09-25 14:46:01.773483+00	2026-09-25 17:20:17.277888+00
project:local-1790359197101	testytes	test	on-track	medium	0	2026-12-24	0.00	0.00	Jean Dupont	2026-09-25 17:59:57.209832+00	2026-09-25 17:59:57.209832+00
project:local-1790349432860	jaune	test	on-track	medium	0	2026-12-24	0.00	0.00	Jean Dupont	2026-09-25 15:17:11.8151+00	2026-09-25 19:03:36.980102+00
popy	Projet POPY - Robot Educatif	Pilotage du robot educatif POPY avec suivi ISO 9001	on-track	high	68	2027-09-15	0.00	0.00	SHIREL	2026-09-25 11:43:48.894801+00	2026-09-25 21:23:09.520325+00
\.


--
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.risks (id, project_id, title, description, category, type, status, probability, impact_cost, impact_delay, impact_quality, impact_security, impact_image, criticality, criticality_score, strategy, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roadmap_phases; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.roadmap_phases (id, project_id, name, timeline, status, budget, progress, key_deliverables, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: survey_responses; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.survey_responses (id, survey_id, survey_title, project_id, phase, submitted_at, respondent_name, respondent_type, answers, csat, ces, nps, verbatim, key_topics, sentiment, linked_tasks, linked_risks, status) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.tasks (id, title, description, project_id, assigned_to, status, priority, due_date, progress, created_at, updated_at) FROM stdin;
task-1790358473000	tester taches	tester	popy	TM-1790356817411-384	done	medium	2026-09-24	100	2026-09-25 17:47:53.129605+00	2026-09-25 17:48:03.298236+00
task-1790362181419	tester taches	tache tache	project:local-1790349432860	TM-1790349923243-906	in-progress	medium	2026-09-26	15	2026-09-25 18:49:41.381936+00	2026-09-25 18:49:43.608349+00
task-meeting-1790362742026-act-1790368178961-46yu	test de tache cr	Action issue du CR n° 1 — Sprint Review — Sprint 1	project:local-1790349432860	TM-1790363017008-752	todo	medium	2026-09-28	0	2026-09-25 20:30:13.15454+00	2026-09-25 20:30:32.060561+00
task-1790370316872-43	Tests utilisateurs		popy	TM-1790369389809	todo	medium	2027-04-01	0	2026-09-25 21:05:16.873107+00	2026-09-25 21:05:16.873107+00
task-1790370316888-44	Norme jouet		popy	TM-1790369374261	todo	medium	2027-05-01	0	2026-09-25 21:05:16.889378+00	2026-09-25 21:05:16.889378+00
task-1790370316446-7	Gantt détaillé		popy	TM-1790369389809	done	medium	2026-03-01	100	2026-09-25 21:05:16.447984+00	2026-09-25 21:07:03.76565+00
task-1790370316570-13	Scoring criticité		popy	TM-1790349923243-906	done	medium	2026-05-01	100	2026-09-25 21:05:16.5716+00	2026-09-25 21:05:16.5716+00
task-1790370316456-8	Allocation ressources		popy	TM-1790369307752	done	medium	2026-04-01	100	2026-09-25 21:05:16.457945+00	2026-09-25 21:07:19.200017+00
task-1790370316580-14	Plans de mitigation		popy	TM-1790369307752	done	medium	2026-06-01	100	2026-09-25 21:05:16.580977+00	2026-09-25 21:08:02.83651+00
task-1790370316472-9	Plan de charge		popy	TM-1790349923243-906	done	medium	2026-05-01	100	2026-09-25 21:05:16.47279+00	2026-09-25 21:05:16.47279+00
task-1790370316597-15	Cartographie processus		popy	TM-1790369374261	done	medium	2026-04-01	100	2026-09-25 21:05:16.598107+00	2026-09-25 21:05:16.598107+00
task-1790370316622-17	Procédure gestion documentaire		popy	TM-1790369333002	done	medium	2026-05-01	100	2026-09-25 21:05:16.6235+00	2026-09-25 21:05:16.6235+00
task-1790370316648-19	Procédure gestion modification		popy	TM-1790369389809	done	medium	2026-06-01	100	2026-09-25 21:05:16.648644+00	2026-09-25 21:05:16.648644+00
task-1790370316490-10	Identification risques techniques		popy	TM-1790369403019	done	medium	2026-03-01	100	2026-09-25 21:05:16.491632+00	2026-09-25 21:07:11.315054+00
task-1790370316518-11	Identification risques pédagogiques		popy	TM-1790369307752	done	medium	2026-04-01	100	2026-09-25 21:05:16.51925+00	2026-09-25 21:07:15.617574+00
task-1790370316657-20	Recueil besoins équipe		popy	TM-1790369333002	done	medium	2026-06-15	100	2026-09-25 21:05:16.65869+00	2026-09-25 21:05:16.65869+00
task-1790370316679-22	Modélisation base données		popy	TM-1790369374261	done	medium	2026-06-30	100	2026-09-25 21:05:16.679885+00	2026-09-25 21:05:16.679885+00
task-1790370316559-12	Identification risques réglementaires		popy	TM-1790349923243-906	done	medium	2026-04-01	100	2026-09-25 21:05:16.560738+00	2026-09-25 21:07:17.232303+00
task-1790370316276-1	Rédaction charte projet		popy	TM-1790369283232	done	medium	2026-02-15	100	2026-09-25 21:05:16.281025+00	2026-09-25 21:06:58.346906+00
task-1790370316668-21	Rédaction cahier des charges		popy	TM-1790369333002	done	medium	2026-06-30	100	2026-09-25 21:05:16.669291+00	2026-09-25 21:07:54.240446+00
task-1790370316410-5	Définition version cible V2		popy	TM-1790349923243-906	done	medium	2026-04-15	100	2026-09-25 21:05:16.411368+00	2026-09-25 21:05:16.411368+00
task-1790370316614-16	Définition indicateurs		popy	TM-1790349923243-906	done	medium	2026-05-01	100	2026-09-25 21:05:16.614771+00	2026-09-25 21:05:16.614771+00
task-1790370316355-2	Définition vision produit		popy	TM-1790369389809	done	medium	2026-03-01	100	2026-09-25 21:05:16.357397+00	2026-09-25 21:07:06.75433+00
task-1790370316375-3	Définition roadmap produit		popy	TM-1790369374261	done	medium	2026-03-15	100	2026-09-25 21:05:16.377016+00	2026-09-25 21:07:13.21443+00
task-1790370316388-4	Définition MVP V1		popy	TM-1790369283232	done	medium	2026-04-01	100	2026-09-25 21:05:16.389181+00	2026-09-25 21:07:22.202628+00
task-1790370316422-6	Définition critères succès		popy	TM-1790349923243-906	done	medium	2026-05-01	100	2026-09-25 21:05:16.424801+00	2026-09-25 21:08:11.773778+00
task-1790370316639-18	Procédure gestion non-conformité		popy	TM-1790349923243-906	done	medium	2026-06-01	100	2026-09-25 21:05:16.640607+00	2026-09-25 21:08:07.325276+00
task-1790370316725-27	Création serveur production		popy	TM-1790369283232	in-progress	medium	2026-09-30	50	2026-09-25 21:05:16.726353+00	2026-09-25 21:05:16.726353+00
task-1790370316736-28	Mise en place CI/CD		popy	TM-1790369374261	in-progress	medium	2026-09-30	50	2026-09-25 21:05:16.736809+00	2026-09-25 21:05:16.736809+00
task-1790370316688-23	CRUD projets / risques		popy	TM-1790369307752	todo	medium	2026-11-30	0	2026-09-25 21:05:16.689718+00	2026-09-25 21:05:16.689718+00
task-1790370316698-24	Module KPI		popy	TM-1790349923243-906	todo	medium	2026-11-30	0	2026-09-25 21:05:16.698873+00	2026-09-25 21:05:16.698873+00
task-1790370316708-25	Dashboard global		popy	TM-1790369333002	todo	medium	2026-11-30	0	2026-09-25 21:05:16.708673+00	2026-09-25 21:05:16.708673+00
task-1790370316744-29	API gestion profils		popy	TM-1790369307752	todo	medium	2026-11-30	0	2026-09-25 21:05:16.745251+00	2026-09-25 21:05:16.745251+00
task-1790370316753-30	API gestion progression		popy	TM-1790349923243-906	todo	medium	2026-11-30	0	2026-09-25 21:05:16.75375+00	2026-09-25 21:05:16.75375+00
task-1790370316762-31	Chiffrement données		popy	TM-1790369283232	todo	medium	2026-11-30	0	2026-09-25 21:05:16.763068+00	2026-09-25 21:05:16.763068+00
task-1790370316781-33	Création compte parent		popy	TM-1790369374261	todo	medium	2026-11-30	0	2026-09-25 21:05:16.782654+00	2026-09-25 21:05:16.782654+00
task-1790370316790-34	Interface enseignants (création classe)		popy	TM-1790369307752	todo	medium	2026-11-30	0	2026-09-25 21:05:16.791315+00	2026-09-25 21:05:16.791315+00
task-1790370316799-35	Modélisation 3D		popy	TM-1790369389809	todo	medium	2027-02-28	0	2026-09-25 21:05:16.799805+00	2026-09-25 21:05:16.799805+00
task-1790370316808-36	Simulation chute		popy	TM-1790369403019	todo	medium	2027-02-28	0	2026-09-25 21:05:16.80874+00	2026-09-25 21:05:16.80874+00
task-1790370316818-37	Schéma alimentation		popy	TM-1790369389809	todo	medium	2027-02-28	0	2026-09-25 21:05:16.81919+00	2026-09-25 21:05:16.81919+00
task-1790370316828-38	PCB V1		popy	TM-1790369403019	todo	medium	2027-02-28	0	2026-09-25 21:05:16.829601+00	2026-09-25 21:05:16.829601+00
task-1790370316837-39	Installation OS embarqué		popy	TM-1790369403019	todo	medium	2027-02-28	0	2026-09-25 21:05:16.838395+00	2026-09-25 21:05:16.838395+00
task-1790370316854-41	Assemblage V1		popy	TM-1790369403019	todo	medium	2027-02-28	0	2026-09-25 21:05:16.855611+00	2026-09-25 21:05:16.855611+00
task-1790370316862-42	Prototype V2		popy	TM-1790369389809	todo	medium	2027-02-28	0	2026-09-25 21:05:16.863491+00	2026-09-25 21:05:16.863491+00
task-1790370316845-40	Module pédagogique embarqué		popy	TM-1790369374261	todo	medium	2027-03-30	0	2026-09-25 21:05:16.846111+00	2026-09-25 21:05:16.846111+00
task-1790370892422-BOM	Rendu BOM (Bill of Materials)	\N	popy	TM-1790369389809	in-progress	high	2026-12-15	0	2026-09-25 21:14:52.423051+00	2026-09-25 21:16:14.366296+00
task-1790370316716-26	Choix hébergeur européen		popy	TM-1790369307752	in-progress	medium	2026-09-30	46	2026-09-25 21:05:16.717368+00	2026-09-25 21:16:50.840728+00
task-1790370316772-32	Wireframes & Maquettes Figma		popy	TM-1790369374261	todo	medium	2026-12-01	10	2026-09-25 21:05:16.772845+00	2026-09-25 21:20:03.776704+00
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.team_members (id, user_id, project_id, role, availability, workload, created_at, position_ids) FROM stdin;
TM-1790356817411-384	user-1790348235513-846	project:local-1790347561912	Membre	Disponible	0	2026-09-25 17:20:17.455319+00	[]
TM-1790358400606-125	admin	popy	Membre	Disponible	0	2026-09-25 17:46:40.606809+00	[]
TM-1790359090625-197	admin	project:local-1790349432860	Membre	Disponible	0	2026-09-25 17:58:10.62649+00	[]
TM-1790359197217-711	admin	project:local-1790359197101	Membre	Disponible	0	2026-09-25 17:59:57.217979+00	[]
TM-1790363017008-752	user-1790348235513-846	project:local-1790349432860	Chef de projet / Product Owner (PO) / Ingénieur IA / Vision (Computer Vision) / Ingénieur IA / NLP (Langage & voix)	Disponible	0	2026-09-25 19:03:37.00928+00	["pos-po-project:local-1790349432860", "pos-cv-project:local-1790349432860", "pos-nlp-project:local-1790349432860"]
TM-1790369283232	user-1790369054441-921	popy	Chef de projet / Product Owner (PO) / Responsable protection des données (RGPD / Enfant) / Ingénieur Cybersécurité / Ingénieur Cloud / DevOps	Disponible	0	2026-09-25 20:48:03.25454+00	["pos-po", "pos-rgpd", "pos-cyber", "pos-devops"]
TM-1790369307752	user-1790369079907-244	popy	Chef de projet / Product Owner (PO) / Data Engineer / Big Data / Ingénieur IA / Séries temporelles & comportement / Ingénieur IA / NLP (Langage & voix) / Ingénieur IA / Vision (Computer Vision)	Disponible	0	2026-09-25 20:48:27.772428+00	["pos-po", "pos-data", "pos-ml", "pos-nlp", "pos-cv"]
TM-1790369333002	user-1790369094436-675	popy	Chef de projet / Product Owner (PO) / Responsable Qualité & Processus (QA / QMS) / Ingénieur Cloud / DevOps / Data Engineer / Big Data / Ingénieur Cybersécurité	Disponible	0	2026-09-25 20:48:53.023506+00	["pos-po", "pos-qa", "pos-devops", "pos-data", "pos-cyber"]
TM-1790369374261	user-1790369116473-170	popy	Chef de projet / Product Owner (PO) / Data Engineer / Big Data / Ingénieur Cloud / DevOps / Responsable protection des données (RGPD / Enfant) / Ingénieur Cybersécurité / Responsable Qualité & Processus (QA / QMS)	Disponible	0	2026-09-25 20:49:34.280888+00	["pos-po", "pos-data", "pos-devops", "pos-rgpd", "pos-cyber", "pos-qa"]
TM-1790369389809	user-1790369030410-531	popy	Chef de projet / Product Owner (PO) / Ingénieur IoT / Électronique / Ingénieur mécatronique / robotique / Ingénieur IoT système embarqué	Disponible	0	2026-09-25 20:49:49.832105+00	["pos-po", "pos-iot", "pos-meca", "pos-embedded"]
TM-1790369403019	user-1790369008403-903	popy	Chef de projet / Product Owner (PO) / Ingénieur IoT / Électronique / Ingénieur mécatronique / robotique / Ingénieur IoT système embarqué	Disponible	0	2026-09-25 20:50:03.043772+00	["pos-po", "pos-iot", "pos-meca", "pos-embedded"]
TM-1790349923243-906	user-1790348235513-846	popy	Chef de projet / Product Owner (PO) / Ingénieur IA / Vision (Computer Vision) / Ingénieur IA / NLP (Langage & voix) / Ingénieur IA / Séries temporelles & comportement	Disponible	0	2026-09-25 15:25:23.244524+00	["pos-po", "pos-cv", "pos-nlp", "pos-ml"]
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.users (id, email, password_hash, name, role, email_verified_at, created_at, updated_at) FROM stdin;
a0000000-0000-4000-8000-000000000001	admin@popilot.com	$2b$10$dpn6KmCcr3gwxWgjr3vfOOY5xEQVYYNyZurkOIqHMVYKtoQt4uuGC	Jean Dupont	admin	2026-09-25 11:43:57.748702+00	2026-09-25 11:43:57.748702+00	2026-09-25 11:43:57.748702+00
user-1790348235513-846	sonia.98.tavares@gmail.com	$2b$10$8L2dqah1hGeKhNS/CuYeWuadnx9MxM9Ynpi6lkiZ007zCUUU7VQNa	Sonia Tavares	member	2026-09-25 14:57:15.763929+00	2026-09-25 14:57:15.763929+00	2026-09-25 14:57:15.763929+00
admin	admin@popilot.fr	mock-hash	Administrateur	admin	\N	2026-09-25 17:25:04.058811+00	2026-09-25 17:25:04.058811+00
user-1790369008403-903	theo.tachdjian@epitech.eu	$2b$10$ITUK5Z2llvMtBLb4Szv8wuKwGuCFVtWoh/P4xkImJPPrFRTWkbzR6	Theo Tachdjian	member	2026-09-25 20:43:28.636724+00	2026-09-25 20:43:28.636724+00	2026-09-25 20:43:28.636724+00
user-1790369030410-531	erwan.blancard@epitech.eu	$2b$10$kbp4B2yo.ZZnOtrRuJSkWe5PYDcMf8t7C3Bv2LDC2hJHNSCYIEJfK	erwan.blancard	member	2026-09-25 20:43:50.580578+00	2026-09-25 20:43:50.580578+00	2026-09-25 20:43:50.580578+00
user-1790369054441-921	yacine.aoui@epitech.eu	$2b$10$ouDhlbrJwTmbowZ5PIrlFe9fUXIY61YcKyFK8B/UNp.FQZnmH7n32	yacine.aoui	member	2026-09-25 20:44:14.612222+00	2026-09-25 20:44:14.612222+00	2026-09-25 20:44:14.612222+00
user-1790369079907-244	pierre-alexis.lebair@epitech.eu	$2b$10$pBaq9ySYFfzFhSWu7GPL2O0Wy5zf9eTaAgcO4ERp/iHrooL/JjGiG	pierre-alexis.lebair	member	2026-09-25 20:44:40.056164+00	2026-09-25 20:44:40.056164+00	2026-09-25 20:44:40.056164+00
user-1790369094436-675	meriem.zahzouh@epitech.eu	$2b$10$K8phH8dBZvPNbrWQ0KqPm.u0rLg3XuAhbfi34cUweeQomdsqx28Tq	meriem.zahzouh	member	2026-09-25 20:44:54.605112+00	2026-09-25 20:44:54.605112+00	2026-09-25 20:44:54.605112+00
user-1790369116473-170	fabio.tillet@epitech.eu	$2b$10$8ktPQ8ACpeuPsHE9WXZ7UePARynsT9INOFS8CfI14g8BqSZyPH6Ta	fabio.tillet	member	2026-09-25 20:45:16.643465+00	2026-09-25 20:45:16.643465+00	2026-09-25 20:45:16.643465+00
\.


--
-- Data for Name: veille_entries; Type: TABLE DATA; Schema: public; Owner: popilot
--

COPY public.veille_entries (id, project_id, title, category, impact, source, date, author, summary, link, tags, status, created_at, updated_at) FROM stdin;
\.


--
-- Name: bom_components bom_components_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.bom_components
    ADD CONSTRAINT bom_components_pkey PRIMARY KEY (id);


--
-- Name: client_surveys client_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.client_surveys
    ADD CONSTRAINT client_surveys_pkey PRIMARY KEY (id);


--
-- Name: dashboard_alerts dashboard_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.dashboard_alerts
    ADD CONSTRAINT dashboard_alerts_pkey PRIMARY KEY (id);


--
-- Name: gantt_items gantt_items_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.gantt_items
    ADD CONSTRAINT gantt_items_pkey PRIMARY KEY (id);


--
-- Name: iso_documents iso_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.iso_documents
    ADD CONSTRAINT iso_documents_pkey PRIMARY KEY (id);


--
-- Name: kpi_metrics kpi_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.kpi_metrics
    ADD CONSTRAINT kpi_metrics_pkey PRIMARY KEY (id);


--
-- Name: marketing_actions marketing_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.marketing_actions
    ADD CONSTRAINT marketing_actions_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: objectives objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: pipeline_stages pipeline_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.pipeline_stages
    ADD CONSTRAINT pipeline_stages_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: risks risks_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_pkey PRIMARY KEY (id);


--
-- Name: roadmap_phases roadmap_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.roadmap_phases
    ADD CONSTRAINT roadmap_phases_pkey PRIMARY KEY (id);


--
-- Name: survey_responses survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_user_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_project_id_key UNIQUE (user_id, project_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: veille_entries veille_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.veille_entries
    ADD CONSTRAINT veille_entries_pkey PRIMARY KEY (id);


--
-- Name: idx_bom_components_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_bom_components_project_id ON public.bom_components USING btree (project_id);


--
-- Name: idx_client_surveys_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_client_surveys_project_id ON public.client_surveys USING btree (project_id);


--
-- Name: idx_dashboard_alerts_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_dashboard_alerts_project_id ON public.dashboard_alerts USING btree (project_id);


--
-- Name: idx_gantt_items_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_gantt_items_project_id ON public.gantt_items USING btree (project_id);


--
-- Name: idx_iso_documents_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_iso_documents_project_id ON public.iso_documents USING btree (project_id);


--
-- Name: idx_kpi_metrics_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_kpi_metrics_project_id ON public.kpi_metrics USING btree (project_id);


--
-- Name: idx_marketing_actions_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_marketing_actions_project_id ON public.marketing_actions USING btree (project_id);


--
-- Name: idx_meetings_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_meetings_project_id ON public.meetings USING btree (project_id);


--
-- Name: idx_password_reset_user; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_password_reset_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_pipeline_stages_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_pipeline_stages_project_id ON public.pipeline_stages USING btree (project_id);


--
-- Name: idx_risks_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_risks_project_id ON public.risks USING btree (project_id);


--
-- Name: idx_roadmap_phases_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_roadmap_phases_project_id ON public.roadmap_phases USING btree (project_id);


--
-- Name: idx_survey_responses_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_survey_responses_project_id ON public.survey_responses USING btree (project_id);


--
-- Name: idx_tasks_assigned_to; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);


--
-- Name: idx_tasks_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);


--
-- Name: idx_team_members_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_team_members_project_id ON public.team_members USING btree (project_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_veille_entries_project_id; Type: INDEX; Schema: public; Owner: popilot
--

CREATE INDEX idx_veille_entries_project_id ON public.veille_entries USING btree (project_id);


--
-- Name: bom_components bom_components_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.bom_components
    ADD CONSTRAINT bom_components_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: client_surveys client_surveys_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.client_surveys
    ADD CONSTRAINT client_surveys_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: dashboard_alerts dashboard_alerts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.dashboard_alerts
    ADD CONSTRAINT dashboard_alerts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: gantt_items gantt_items_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.gantt_items
    ADD CONSTRAINT gantt_items_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE SET NULL;


--
-- Name: gantt_items gantt_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.gantt_items
    ADD CONSTRAINT gantt_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.gantt_items(id) ON DELETE CASCADE;


--
-- Name: gantt_items gantt_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.gantt_items
    ADD CONSTRAINT gantt_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: gantt_items gantt_items_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.gantt_items
    ADD CONSTRAINT gantt_items_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: iso_documents iso_documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.iso_documents
    ADD CONSTRAINT iso_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: kpi_metrics kpi_metrics_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.kpi_metrics
    ADD CONSTRAINT kpi_metrics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: marketing_actions marketing_actions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.marketing_actions
    ADD CONSTRAINT marketing_actions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: meetings meetings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: objectives objectives_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pipeline_stages pipeline_stages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.pipeline_stages
    ADD CONSTRAINT pipeline_stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: risks risks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: roadmap_phases roadmap_phases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.roadmap_phases
    ADD CONSTRAINT roadmap_phases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: survey_responses survey_responses_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: survey_responses survey_responses_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.client_surveys(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.team_members(id) ON DELETE RESTRICT;


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: veille_entries veille_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: popilot
--

ALTER TABLE ONLY public.veille_entries
    ADD CONSTRAINT veille_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fTP07znJdudwPEgN9hDnYhDimTCcVSSFoP0PbeWDhM8iEeWoAEbEt3Hnf3SP3fU

