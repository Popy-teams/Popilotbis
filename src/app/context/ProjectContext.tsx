import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Project } from '../types';
import type { AuthUser } from '../auth/authApi';
import { useAuth } from '../auth/AuthContext';
import { PORTFOLIO_PROJECT_FIXTURES } from '../data/portfolioProjectsFixtures';
import { PORTFOLIO_MEMBERS, resolveMemberIdForUser } from '../data/projectMembers';
import { entityMatchesProject, getProjectSlug } from '../utils/projectMatch';
import { seedMultiProjectDemoData } from '../utils/seedProjectDemoData';
import { publicAnonKey, projectId } from '../utils/supabase/info';

const PROJECTS_STORAGE_KEY = 'popilot:projects-local';
const ACTIVE_PROJECT_STORAGE_KEY = 'popilot:active-project-id';
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-036a5a33`;

export type PortfolioMember = (typeof PORTFOLIO_MEMBERS)[number];

interface ProjectContextValue {
  projects: Project[];
  visibleProjects: Project[];
  activeProject: Project | null;
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
  members: PortfolioMember[];
  currentMemberId: string;
  matchesProject: (entityProjectRef?: string) => boolean;
  canUserSeeProject: (project: Project) => boolean;
  activeProjectSlug: string | null;
  ready: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function normalizeProject(p: Project): Project {
  const participantIds = p.isRestricted
    ? (p.participantIds ?? [])
    : p.participantIds?.length
      ? p.participantIds
      : PORTFOLIO_MEMBERS.map((m) => m.id);

  return {
    ...p,
    slug: p.slug ?? (p.id.includes('popy') ? 'popy' : getProjectSlug(p)),
    participantIds,
    isRestricted: p.isRestricted ?? false,
    progress: p.progress ?? 0,
    team: p.team ?? [],
    budget: {
      total: p.budget?.total ?? 0,
      used: p.budget?.used ?? 0,
      committed: p.budget?.committed ?? 0,
    },
  };
}

function canUserSeeProject(project: Project, user: AuthUser, memberId: string): boolean {
  if (user.role === 'admin') return true;
  if (!project.isRestricted) return true;
  const participants = project.participantIds ?? [];
  if (participants.length === 0) return true;
  return (
    participants.includes(memberId) ||
    participants.includes(user.id) ||
    project.ownerId === memberId ||
    project.ownerId === user.id
  );
}

async function fetchApiProjects(): Promise<Project[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function loadLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {}
  return [];
}

function saveLocalProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {}
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const currentMemberId = user ? resolveMemberIdForUser(user) : '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      seedMultiProjectDemoData();
      const local = loadLocalProjects();
      const api = await fetchApiProjects();
      const base =
        local.length > 0
          ? local
          : api.length > 0
          ? api
          : (PORTFOLIO_PROJECT_FIXTURES as Project[]);

      const normalized = base.map(normalizeProject);
      if (!cancelled) {
        setProjectsState(normalized);
        saveLocalProjects(normalized);
      }

      try {
        const savedActive = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
        if (savedActive && !cancelled) setActiveProjectIdState(savedActive);
      } catch {}

      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((p) => canUserSeeProject(p, user, currentMemberId));
  }, [projects, user, currentMemberId]);

  useEffect(() => {
    if (!ready || !user) return;
    if (activeProjectId && visibleProjects.some((p) => p.id === activeProjectId)) return;
    const first = visibleProjects[0];
    if (first) {
      setActiveProjectIdState(first.id);
      localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, first.id);
    }
  }, [ready, user, visibleProjects, activeProjectId]);

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id);
    try {
      localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, id);
    } catch {}
  }, []);

  const setProjects = useCallback((next: Project[]) => {
    const normalized = next.map(normalizeProject);
    setProjectsState(normalized);
    saveLocalProjects(normalized);
  }, []);

  const upsertProject = useCallback((project: Project) => {
    const normalized = normalizeProject(project);
    setProjectsState((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      const next = exists
        ? prev.map((p) => (p.id === normalized.id ? normalized : p))
        : [normalized, ...prev];
      saveLocalProjects(next);
      return next;
    });
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjectsState((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveLocalProjects(next);
      return next;
    });
    if (activeProjectId === id) {
      setActiveProjectIdState(null);
      localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
    }
  }, [activeProjectId]);

  const activeProject = useMemo(
    () => visibleProjects.find((p) => p.id === activeProjectId) ?? null,
    [visibleProjects, activeProjectId]
  );

  const matchesProject = useCallback(
    (entityProjectRef?: string) => entityMatchesProject(entityProjectRef, activeProject),
    [activeProject]
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      visibleProjects,
      activeProject,
      activeProjectId,
      setActiveProjectId,
      setProjects,
      upsertProject,
      removeProject,
      members: PORTFOLIO_MEMBERS,
      currentMemberId,
      matchesProject,
      canUserSeeProject: (p) => (user ? canUserSeeProject(p, user, currentMemberId) : false),
      activeProjectSlug: activeProject ? getProjectSlug(activeProject) : null,
      ready,
    }),
    [
      projects,
      visibleProjects,
      activeProject,
      activeProjectId,
      setActiveProjectId,
      setProjects,
      upsertProject,
      removeProject,
      currentMemberId,
      matchesProject,
      user,
      ready,
    ]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
}
