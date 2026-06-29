import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useProjectContext } from '../../context/ProjectContext';
import { Project } from '../../types';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { ProjectFormPage } from './components/ProjectFormPage';
import { ProjectsListPage } from './components/ProjectsListPage';
import { computeProjectStatus, withEffectiveStatus, getProjectBudget } from './components/projectPresentation';
import { createProject, deleteProject, initProjectsFixtures, updateProject } from './services/projectsService';

type Mode = 'list' | 'create' | 'view' | 'edit';
type SortKey = 'deadline' | 'progress' | 'status';
type SortDirection = 'asc' | 'desc';

function defaultDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function createEmptyForm(currentMemberId?: string) {
  return {
    name: '',
    description: '',
    priority: 'medium' as Project['priority'],
    startDate: defaultDate(0),
    deadline: defaultDate(90),
    budgetTotal: '0',
    selectedMembers: currentMemberId ? [currentMemberId] : [],
    isRestricted: false,
  };
}

export function ProjectsFeature() {
  const { user } = useAuth();
  const {
    visibleProjects,
    upsertProject,
    removeProject,
    members,
    currentMemberId,
    setActiveProjectId,
  } = useProjectContext();

  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState(createEmptyForm);
  const [submitError, setSubmitError] = useState('');
  const [loading] = useState(false);

  useEffect(() => {
    initProjectsFixtures().catch(() => undefined);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('projects:viewMode');
      if (saved === 'cards' || saved === 'table') setViewMode(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('projects:viewMode', viewMode);
    } catch {}
  }, [viewMode]);

  const projectsWithStatus = useMemo(
    () => visibleProjects.map(withEffectiveStatus),
    [visibleProjects]
  );

  const statusWeight: Record<Project['status'], number> = {
    'on-track': 1,
    'at-risk': 2,
    delayed: 3,
    completed: 4,
    archived: 5,
  };

  const sortedProjects = useMemo(() => {
    const arr = [...projectsWithStatus];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'deadline') {
        cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortKey === 'progress') {
        cmp = a.progress - b.progress;
      } else {
        cmp = statusWeight[a.status] - statusWeight[b.status];
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [projectsWithStatus, sortKey, sortDirection]);

  const selectedMemberInitials = useMemo(
    () => members.filter((m) => form.selectedMembers.includes(m.id)).map((m) => m.initials),
    [form.selectedMembers, members]
  );

  const toProject = (base?: Project): Project => {
    const slug =
      base?.slug ??
      (form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 32) || `projet-${Date.now()}`);

    const progress = base?.progress ?? 0;
    const status = computeProjectStatus({
      deadline: form.deadline,
      progress,
      status: base?.status === 'archived' ? 'archived' : undefined,
    });

    const ownerId = base?.ownerId ?? currentMemberId ?? user?.id;
    const restrictedParticipants = [
      ...new Set([...form.selectedMembers, ownerId].filter(Boolean)),
    ] as string[];

    return {
      id: base?.id || `project:local-${Date.now()}`,
      name: form.name.trim(),
      slug,
      description: form.description.trim(),
      status,
      priority: form.priority,
      progress,
      startDate: form.startDate,
      deadline: form.deadline,
      budget: { total: parseInt(form.budgetTotal || '0', 10), used: getProjectBudget(base).used },
      team: selectedMemberInitials,
      participantIds: form.isRestricted ? restrictedParticipants : members.map((m) => m.id),
      isRestricted: form.isRestricted,
      ownerId,
      objectives: base?.objectives || [],
    };
  };

  const startCreate = () => {
    setSubmitError('');
    setForm(createEmptyForm(currentMemberId || undefined));
    setMode('create');
  };

  const startEdit = (p: Project) => {
    setSelected(p);
    setForm({
      name: p.name,
      description: p.description || '',
      priority: p.priority,
      startDate: p.startDate || '',
      deadline: p.deadline,
      budgetTotal: String(getProjectBudget(p).total),
      selectedMembers: p.participantIds?.length
        ? p.participantIds
        : members.filter((m) => p.team?.includes(m.initials)).map((m) => m.id),
      isRestricted: p.isRestricted ?? false,
    });
    setMode('edit');
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.deadline) {
      setSubmitError('Veuillez renseigner le nom, la description et la date d\'échéance.');
      return;
    }
    setSubmitError('');
    const next = toProject();
    upsertProject(next);
    setActiveProjectId(next.id);
    setStatusFilter('all');
    setMode('list');
    setForm(createEmptyForm(currentMemberId || undefined));
    try {
      await createProject(next);
    } catch {}
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const next = toProject(selected);
    upsertProject(next);
    setSelected(next);
    setMode('list');
    try {
      await updateProject(next);
    } catch {}
  };

  const archive = async (p: Project) => {
    const next = { ...p, status: 'archived' as Project['status'] };
    upsertProject(next);
    if (selected?.id === p.id) setSelected(next);
    try {
      await updateProject(next);
    } catch {}
  };

  const remove = async (p: Project) => {
    removeProject(p.id);
    if (selected?.id === p.id) {
      setSelected(null);
      setMode('list');
    }
    try {
      await deleteProject(p.id);
    } catch {}
  };

  if (mode === 'create') {
    return (
      <ProjectFormPage
        title="Nouveau projet"
        subtitle="Créez un projet"
        values={form}
        members={members}
        submitLabel="Créer le projet"
        submitError={submitError}
        onBack={() => setMode('list')}
        onChange={setForm}
        onSubmit={submitCreate}
      />
    );
  }
  if (mode === 'edit' && selected) {
    return (
      <ProjectFormPage
        title="Modifier le projet"
        subtitle={`Édition de « ${selected.name} »`}
        values={form}
        members={members}
        submitLabel="Enregistrer les modifications"
        progress={selected.progress}
        onBack={() => setMode('list')}
        onChange={setForm}
        onSubmit={submitEdit}
      />
    );
  }
  if (mode === 'view' && selected) {
    return (
      <ProjectDetailPage
        project={selected}
        members={members}
        onBack={() => {
          setMode('list');
          setSelected(null);
        }}
        onEdit={() => startEdit(selected)}
        onArchive={() => archive(selected)}
        onDelete={() => remove(selected)}
      />
    );
  }

  return (
    <ProjectsListPage
      loading={loading}
      projects={sortedProjects}
      viewMode={viewMode}
      statusFilter={statusFilter}
      onViewModeChange={setViewMode}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortChange={(key) => {
        if (sortKey === key) {
          setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
          setSortKey(key);
          setSortDirection('asc');
        }
      }}
      onStatusFilterChange={setStatusFilter}
      onCreate={startCreate}
      onOpen={(p) => {
        setSelected(p);
        setMode('view');
      }}
      onEdit={startEdit}
      onArchive={archive}
      onDelete={remove}
    />
  );
}
