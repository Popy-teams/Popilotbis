import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Mail,
  Phone,
  Award,
  Users,
  SquarePen,
  Trash2,
  Eye,
  Briefcase,
  Brain,
  Shield,
  Cloud,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FolderPlus,
} from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { TEST_TEAM_MEMBERS, type TeamMemberData } from '../data/testTeamData';
import { TEST_TASKS } from '../data/testData';
import { DEMO_TASKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { TASKS_STORAGE_KEY } from '../utils/pipelineSync';
import {
  INITIAL_TEAM_POSITIONS,
  POSITIONS_STORAGE_KEY,
  applyPositionToMember,
  getPositionById,
  getPositionCategories,
  type TeamPosition,
} from '../data/teamPositions';
import {
  computeMemberWorkloads,
  countAssignedTasks,
  workloadBarClass,
  workloadColorClass,
  workloadLabel,
} from '../utils/teamWorkload';
import type { TestTask } from '../data/testData';
import { PageBackHeader } from './shared/PageBackHeader';
import {
  ViewShell,
  ActionButton,
  ViewHero,
  ViewStatCard,
  ViewStatsGrid,
  ViewTabPills,
  ViewTabBtn,
} from './shared';
import {
  MemberFormPage,
  emptyMemberForm,
  type MemberFormValues,
} from './team/MemberFormPage';
import {
  PositionFormPage,
  emptyPositionForm,
  formValuesToPosition,
  positionToFormValues,
  type PositionFormValues,
} from './team/PositionFormPage';
import { AddPositionCategoryModal } from './team/AddPositionCategoryModal';
import {
  addPositionCategory,
  loadPositionCategories,
  mergePositionCategoryLists,
} from '../utils/positionCategoryStore';

import { TEAM_STORAGE_KEY } from '../utils/teamMemberStore';

type MainTab = 'members' | 'positions';
type MemberMode = 'list' | 'create' | 'view' | 'edit';
type PositionMode = 'list' | 'create' | 'edit';

function normalizeStoredMember(raw: Partial<TeamMemberData>): TeamMemberData {
  const fallback =
    TEST_TEAM_MEMBERS.find((m) => m.id === raw.id) ??
    TEST_TEAM_MEMBERS.find((m) => m.email === raw.email);
  const positionId =
    raw.positionId && raw.positionId.length > 0
      ? raw.positionId
      : fallback?.positionId ?? INITIAL_TEAM_POSITIONS[0]?.id ?? 'pos-po';

  return {
    id: raw.id ?? fallback?.id ?? `user-${Date.now()}`,
    projectId: raw.projectId ?? fallback?.projectId ?? 'popy',
    positionId,
    tasksUserId: raw.tasksUserId ?? fallback?.tasksUserId,
    name: raw.name ?? fallback?.name ?? 'Membre',
    initials: raw.initials ?? fallback?.initials ?? '??',
    role: raw.role ?? fallback?.role ?? 'Membre',
    category: raw.category ?? fallback?.category ?? 'Direction & Coordination',
    email: raw.email ?? fallback?.email ?? '',
    phone: raw.phone ?? fallback?.phone,
    photoUrl: raw.photoUrl ?? fallback?.photoUrl,
    workload: raw.workload ?? 0,
    responsibilities: raw.responsibilities ?? fallback?.responsibilities ?? [],
    skills: raw.skills ?? fallback?.skills ?? [],
    availability: raw.availability ?? fallback?.availability ?? 'Disponible',
    trophies: raw.trophies ?? fallback?.trophies ?? [],
  };
}

function memberToForm(member: TeamMemberData): MemberFormValues {
  return {
    name: member.name,
    email: member.email,
    phone: member.phone ?? '',
    positionId: member.positionId,
    photoUrl: member.photoUrl ?? '',
  };
}

export function TeamViewWithTestData() {
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();
  const [mainTab, setMainTab] = useState<MainTab>('members');
  const [memberMode, setMemberMode] = useState<MemberMode>('list');
  const [positionMode, setPositionMode] = useState<PositionMode>('list');
  const [members, setMembers] = useState<TeamMemberData[]>(TEST_TEAM_MEMBERS);
  const [positions, setPositions] = useState<TeamPosition[]>(INITIAL_TEAM_POSITIONS);
  const [tasks, setTasks] = useState<TestTask[]>(TEST_TASKS);
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<TeamPosition | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPositionCategory, setSelectedPositionCategory] = useState<string | null>(null);
  const [positionCategories, setPositionCategories] = useState<string[]>(() => loadPositionCategories());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormValues>(emptyMemberForm());
  const [positionForm, setPositionForm] = useState<PositionFormValues>(emptyPositionForm());
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEAM_STORAGE_KEY);
      if (raw) {
        const parsed = (JSON.parse(raw) as Partial<TeamMemberData>[])
          .filter((m) => m.id !== 'user-shirel')
          .map((m) => normalizeStoredMember(m));
        setMembers(parsed.length ? parsed : TEST_TEAM_MEMBERS);
      }
    } catch {
      // ignore
    }
    try {
      const rawPos = localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (rawPos) setPositions(JSON.parse(rawPos));
      else localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(INITIAL_TEAM_POSITIONS));
    } catch {
      // ignore
    }
    try {
      const rawTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      const saved = rawTasks ? (JSON.parse(rawTasks) as TestTask[]) : [];
      setTasks(mergeDemoData(saved, DEMO_TASKS_BY_PROJECT, TEST_TASKS));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
      window.dispatchEvent(new CustomEvent('popilot:team-updated'));
    } catch {
      // ignore
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // ignore
    }
  }, [positions]);

  const scopedMembers = useMemo(
    () => filterByActiveProject(members, matchesProject, activeProjectSlug ?? 'popy'),
    [members, matchesProject, activeProjectSlug]
  );

  const scopedPositions = useMemo(
    () => filterByActiveProject(positions, matchesProject, activeProjectSlug ?? 'popy'),
    [positions, matchesProject, activeProjectSlug]
  );

  const projectTasks = useMemo(
    () => tasks.filter((t) => matchesProject(t.projectId)),
    [tasks, matchesProject]
  );

  const workloads = useMemo(
    () => computeMemberWorkloads(projectTasks, scopedMembers),
    [projectTasks, scopedMembers]
  );

  const membersEnriched = useMemo(
    () =>
      scopedMembers.map((member) => ({
        ...member,
        workload: workloads[member.id] ?? 0,
        availability:
          member.availability === 'En congé'
            ? ('En congé' as const)
            : workloadLabel(workloads[member.id] ?? 0),
        taskCount: countAssignedTasks(projectTasks, member),
      })),
    [scopedMembers, workloads, projectTasks]
  );

  const categories = getPositionCategories(scopedPositions);
  const allPositionCategories = useMemo(
    () => mergePositionCategoryLists(positionCategories, categories),
    [positionCategories, categories]
  );
  const filteredMembers = selectedCategory
    ? membersEnriched.filter((m) => m.category === selectedCategory)
    : membersEnriched;
  const filteredPositions = selectedPositionCategory
    ? scopedPositions.filter((p) => p.category === selectedPositionCategory)
    : scopedPositions;

  const handleAddPositionCategory = (label: string) => {
    setPositionCategories((prev) => addPositionCategory(label, prev));
    setSelectedPositionCategory(label);
  };

  const buildMember = (values: MemberFormValues, base?: TeamMemberData): TeamMemberData | null => {
    const position = getPositionById(scopedPositions, values.positionId);
    if (!position) return null;
    const fromPosition = applyPositionToMember(position);
    return {
      id: base?.id ?? `user-${Date.now()}`,
      projectId: base?.projectId ?? activeProjectSlug ?? 'popy',
      positionId: position.id,
      name: values.name.trim(),
      initials: values.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      role: fromPosition.role,
      category: fromPosition.category,
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      photoUrl: values.photoUrl || base?.photoUrl,
      workload: 0,
      responsibilities: base?.responsibilities ?? [],
      skills: fromPosition.skills,
      availability: base?.availability ?? 'Disponible',
      trophies: base?.trophies ?? [],
    };
  };

  const submitMember = (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildMember(memberForm, memberMode === 'edit' ? selectedMember ?? undefined : undefined);
    if (!next) return;
    if (memberMode === 'create') {
      setMembers((prev) => [...prev, next]);
      setMemberMode('list');
    } else {
      setMembers((prev) => prev.map((m) => (m.id === next.id ? next : m)));
      setSelectedMember(next);
      setMemberMode('view');
    }
    setMemberForm(emptyMemberForm());
    setPhotoPreview(null);
  };

  const submitPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const base = positionMode === 'edit' && selectedPosition
      ? { id: selectedPosition.id, projectId: selectedPosition.projectId }
      : { id: `pos-${Date.now()}`, projectId: activeProjectSlug ?? 'popy' };
    const next = formValuesToPosition(positionForm, base);
    if (positionMode === 'create') {
      setPositions((prev) => [...prev, next]);
    } else {
      setPositions((prev) => prev.map((p) => (p.id === next.id ? next : p)));
      setMembers((prev) =>
        prev.map((m) =>
          m.positionId === next.id
            ? { ...m, ...applyPositionToMember(next), positionId: next.id }
            : m
        )
      );
    }
    setPositionMode('list');
    setPositionForm(emptyPositionForm(allPositionCategories[0]));
    setSelectedPosition(null);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMember(null);
    setMemberMode('list');
  };

  const removePosition = (id: string) => {
    if (members.some((m) => m.positionId === id)) {
      alert('Ce poste est assigné à un ou plusieurs membres. Réassignez-les avant de supprimer.');
      return;
    }
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setMemberForm((prev) => ({ ...prev, photoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  if (memberMode === 'create' || memberMode === 'edit') {
    return (
      <MemberFormPage
        mode={memberMode}
        values={memberForm}
        positions={scopedPositions}
        photoPreview={photoPreview}
        submitLabel={memberMode === 'create' ? 'Créer le membre' : 'Enregistrer'}
        onBack={() => setMemberMode(selectedMember ? 'view' : 'list')}
        onSubmit={submitMember}
        onChange={setMemberForm}
        onPhotoUpload={handlePhotoUpload}
      />
    );
  }

  if (positionMode === 'create' || positionMode === 'edit') {
    return (
      <PositionFormPage
        mode={positionMode}
        values={positionForm}
        categories={allPositionCategories}
        submitLabel={positionMode === 'create' ? 'Créer le poste' : 'Enregistrer'}
        onBack={() => {
          setPositionMode('list');
          setSelectedPosition(null);
        }}
        onSubmit={submitPosition}
        onChange={setPositionForm}
        onAddCategory={handleAddPositionCategory}
      />
    );
  }

  if (memberMode === 'view' && selectedMember) {
    const m = membersEnriched.find((x) => x.id === selectedMember.id) ?? {
      ...selectedMember,
      workload: workloads[selectedMember.id] ?? 0,
      taskCount: countAssignedTasks(projectTasks, selectedMember),
    };
    const position = getPositionById(scopedPositions, m.positionId);
    return (
      <ViewShell>
        <PageBackHeader
          title={m.name}
          subtitle={m.role}
          onBack={() => {
            setMemberMode('list');
            setSelectedMember(null);
          }}
          actions={
            <div className="flex flex-wrap gap-2">
              <ActionButton
                variant="secondary"
                icon={Pencil}
                onClick={() => {
                  setMemberForm(memberToForm(m));
                  setPhotoPreview(m.photoUrl ?? null);
                  setMemberMode('edit');
                }}
              >
                Modifier
              </ActionButton>
              <ActionButton
                variant="danger"
                icon={Trash2}
                onClick={() => removeMember(m.id)}
              >
                Supprimer
              </ActionButton>
            </div>
          }
        />
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                  {m.initials}
                </div>
              )}
              <div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs border ${
                    m.availability === 'Surchargé'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : m.availability === 'En congé'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {m.availability}
                </span>
                <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {m.email}
                </p>
                {m.phone && (
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {m.phone}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-1">Charge de travail</p>
            <p className="text-xs text-slate-500 mb-3">
              {m.taskCount} tâche(s) assignée(s) — {m.workload}% par rapport à la moyenne de l&apos;équipe (100 % = charge moyenne)
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${workloadBarClass(m.workload)}`}
                  style={{ width: `${Math.min(m.workload, 100)}%` }}
                />
              </div>
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${workloadColorClass(m.workload)}`}>
                {m.workload}%
              </span>
            </div>
          </section>

          {position && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600" />
                Poste : {position.title}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{position.category}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.skills.map((s) => (
                  <span key={s} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {m.trophies && m.trophies.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-2 flex-wrap">
              <Award className="w-4 h-4 text-amber-500" />
              {m.trophies.map((t) => (
                <span key={t} className="text-xs bg-amber-50 px-2 py-1 rounded-lg text-amber-800">
                  {t}
                </span>
              ))}
            </section>
          )}
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHero
        title="Équipe"
        subtitle="Membres, postes, compétences et charge de travail relative à la moyenne du projet."
        badge={`${activeProject?.name ?? 'Projet'} · Ressources`}
        badgeIcon={Users}
        theme="cyan"
        actions={
          <ActionButton
            icon={Plus}
            onClick={() => {
              if (mainTab === 'members') {
                setMemberForm(emptyMemberForm(scopedPositions[0]?.id ?? ''));
                setPhotoPreview(null);
                setMemberMode('create');
              } else {
                setPositionForm(emptyPositionForm(allPositionCategories[0]));
                setPositionMode('create');
              }
            }}
          >
            {mainTab === 'members' ? 'Nouveau membre' : 'Nouveau poste'}
          </ActionButton>
        }
        stats={
          <ViewStatsGrid cols={4}>
            <ViewStatCard label="Membres" value={String(membersEnriched.length)} gradient="from-cyan-500 to-blue-500" icon={Users} onDark />
            <ViewStatCard label="Postes" value={String(scopedPositions.length)} gradient="from-violet-500 to-purple-500" icon={Briefcase} onDark />
            <ViewStatCard
              label="Surchargés"
              value={String(membersEnriched.filter((m) => m.workload >= 130).length)}
              gradient="from-red-500 to-rose-500"
              icon={AlertTriangle}
              onDark
            />
            <ViewStatCard
              label="Charge moyenne"
              value={`${membersEnriched.length ? Math.round(membersEnriched.reduce((a, m) => a + m.workload, 0) / membersEnriched.length) : 0}%`}
              gradient="from-emerald-500 to-teal-500"
              icon={TrendingUp}
              onDark
            />
          </ViewStatsGrid>
        }
      />

      <ViewTabPills>
        <ViewTabBtn active={mainTab === 'members'} onClick={() => setMainTab('members')} icon={Users}>
          Membres
        </ViewTabBtn>
        <ViewTabBtn active={mainTab === 'positions'} onClick={() => setMainTab('positions')} icon={Briefcase}>
          Postes
        </ViewTabBtn>
      </ViewTabPills>

      {mainTab === 'positions' ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedPositionCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPositionCategory === null
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tous
            </button>
            {allPositionCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedPositionCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium max-w-full truncate transition-colors ${
                  selectedPositionCategory === cat
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                title={cat}
              >
                {shortCategoryLabel(cat)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-violet-300 text-violet-700 bg-violet-50/60 hover:bg-violet-50 transition-colors"
            >
              <FolderPlus className="w-4 h-4 shrink-0" />
              Catégorie
            </button>
          </div>

          {filteredPositions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              {scopedPositions.length === 0
                ? 'Aucun poste pour ce projet. Créez une fiche poste pour structurer l’équipe.'
                : 'Aucun poste dans cette catégorie.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 min-w-0 w-full">
              {filteredPositions.map((position) => {
                const assignedMembers = members.filter((m) => m.positionId === position.id);
                return (
                  <PositionCard
                    key={position.id}
                    position={position}
                    assignedMembers={assignedMembers}
                    onEdit={() => {
                      setSelectedPosition(position);
                      setPositionForm(positionToFormValues(position));
                      setPositionMode('edit');
                    }}
                    onDelete={() => removePosition(position.id)}
                  />
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedCategory === null ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedCategory === cat ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onView={() => {
                  setSelectedMember(member);
                  setMemberMode('view');
                }}
                onEdit={() => {
                  setSelectedMember(member);
                  setMemberForm(memberToForm(member));
                  setMemberMode('edit');
                }}
              />
            ))}
          </div>
        </>
      )}
      {showCategoryModal ? (
        <AddPositionCategoryModal
          existing={allPositionCategories}
          onClose={() => setShowCategoryModal(false)}
          onAdd={handleAddPositionCategory}
        />
      ) : null}
    </ViewShell>
  );
}

type CategoryAccent = {
  gradient: string;
  iconBg: string;
  iconColor: string;
  badge: string;
  chip: string;
  Icon: typeof Briefcase;
};

function getCategoryAccent(category: string): CategoryAccent {
  const map: Record<string, CategoryAccent> = {
    'Direction & Coordination': {
      gradient: 'from-indigo-600 via-violet-500 to-purple-500',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      chip: 'bg-indigo-50/80 text-indigo-700 border-indigo-100',
      Icon: Users,
    },
    'Hardware & IoT': {
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      badge: 'bg-orange-50 text-orange-700 border-orange-100',
      chip: 'bg-orange-50/80 text-orange-700 border-orange-100',
      Icon: Cpu,
    },
    'Intelligence Artificielle': {
      gradient: 'from-fuchsia-600 via-purple-500 to-violet-500',
      iconBg: 'bg-fuchsia-50',
      iconColor: 'text-fuchsia-600',
      badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
      chip: 'bg-fuchsia-50/80 text-fuchsia-700 border-fuchsia-100',
      Icon: Brain,
    },
    'Cybersécurité & protection enfant': {
      gradient: 'from-rose-600 via-red-500 to-orange-500',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-100',
      chip: 'bg-rose-50/80 text-rose-700 border-rose-100',
      Icon: Shield,
    },
    'Cloud, Backend & Big Data': {
      gradient: 'from-sky-600 via-blue-500 to-indigo-500',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      badge: 'bg-sky-50 text-sky-700 border-sky-100',
      chip: 'bg-sky-50/80 text-sky-700 border-sky-100',
      Icon: Cloud,
    },
  };

  return (
    map[category] ?? {
      gradient: 'from-slate-600 via-slate-500 to-slate-400',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      chip: 'bg-slate-50 text-slate-600 border-slate-200',
      Icon: Briefcase,
    }
  );
}

type EnrichedMember = TeamMemberData & { taskCount: number };

function MemberCard({
  member,
  onView,
  onEdit,
}: {
  member: EnrichedMember;
  onView: () => void;
  onEdit: () => void;
}) {
  const accent = getCategoryAccent(member.category);
  const CategoryIcon = accent.Icon;
  const availabilityBadge =
    member.availability === 'Surchargé'
      ? 'saas-badge saas-badge-danger'
      : member.availability === 'En congé'
        ? 'saas-badge saas-badge-neutral'
        : 'saas-badge saas-badge-success';

  return (
    <article
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={onView}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent.gradient}`} />

      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt=""
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-white shadow-md shrink-0"
              />
            ) : (
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} text-white flex items-center justify-center text-lg font-bold shadow-md shrink-0`}
              >
                {member.initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight group-hover:text-indigo-700 transition-colors">
                {member.name}
              </h3>
              <p className="text-sm text-slate-600 mt-0.5 line-clamp-2 leading-snug">{member.role}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={`saas-badge border text-[11px] ${accent.badge}`}>
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {shortCategoryLabel(member.category)}
                </span>
                <span className={`saas-badge text-[11px] ${availabilityBadge}`}>{member.availability}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-9 h-9 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Modifier"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-4 space-y-3">
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{member.email}</span>
          </span>
          {member.phone ? (
            <span className="inline-flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              {member.phone}
            </span>
          ) : null}
        </div>

        {member.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {member.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium border ${accent.chip}`}
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 ? (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-slate-400 bg-slate-50 border border-slate-100">
                +{member.skills.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Charge vs moyenne équipe</span>
          <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${workloadColorClass(member.workload)}`}>
            {member.workload}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${workloadBarClass(member.workload)}`}
            style={{ width: `${Math.min(Math.max(member.workload, 4), 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">{member.taskCount} tâche(s) ouverte(s)</p>
      </div>

      <div className="px-5 sm:px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 inline-flex items-center gap-1">
          {member.trophies?.length ? (
            <>
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {member.trophies.length} distinction(s)
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Profil actif
            </>
          )}
        </span>
        <span className="text-xs font-medium text-indigo-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          <Eye className="w-3.5 h-3.5" />
          Voir le profil
        </span>
      </div>
    </article>
  );
}

function shortCategoryLabel(category: string): string {
  const part = category.split('&')[0]?.trim() ?? category;
  return part.length > 22 ? `${part.slice(0, 20)}…` : part;
}

function PositionCard({
  position,
  assignedMembers,
  onEdit,
  onDelete,
}: {
  position: TeamPosition;
  assignedMembers: TeamMemberData[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = getCategoryAccent(position.category);
  const CategoryIcon = accent.Icon;
  const visibleSkills = position.competencies.slice(0, 4);
  const extraSkills = position.competencies.length - visibleSkills.length;
  const memberCount = assignedMembers.length;

  return (
    <article className="flex flex-col h-full min-w-0 w-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className={`h-1 w-full bg-gradient-to-r ${accent.gradient} shrink-0`} />

      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${accent.iconBg} ${accent.iconColor} inline-flex items-center justify-center shrink-0`}
          >
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug break-words">
              {position.title}
            </h3>
            <span
              className={`inline-flex mt-2 max-w-full saas-badge border text-[11px] leading-tight break-words ${accent.badge}`}
            >
              {position.category}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {assignedMembers.slice(0, 4).map((m) => (
              <div
                key={m.id}
                title={m.name}
                className={`w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {m.initials.slice(0, 2)}
              </div>
            ))}
            {memberCount > 4 ? (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                +{memberCount - 4}
              </div>
            ) : null}
          </div>
          <span className="text-xs text-slate-500 break-words">
            {memberCount === 0
              ? 'Aucun membre assigné'
              : `${memberCount} membre${memberCount > 1 ? 's' : ''}`}
          </span>
        </div>

        {visibleSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className={`inline-flex max-w-full items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border break-words ${accent.chip}`}
              >
                <Sparkles className="w-3 h-3 opacity-60 shrink-0" />
                <span className="truncate">{skill}</span>
              </span>
            ))}
            {extraSkills > 0 ? (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-slate-500 bg-slate-50 border border-slate-200">
                +{extraSkills}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Aucune compétence renseignée</p>
        )}
      </div>

      <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          {position.competencies.length} compétence{position.competencies.length > 1 ? 's' : ''}
        </span>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <SquarePen className="w-3.5 h-3.5 shrink-0" />
            Modifier
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 bg-white text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}
