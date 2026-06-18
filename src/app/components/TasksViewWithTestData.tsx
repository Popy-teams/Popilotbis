import { useEffect, useState } from 'react';
import {
  Plus,
  Filter,
  Calendar,
  User,
  Link2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Pencil,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';
import { TEST_TASKS, TEST_TEAM_MEMBERS, calculateTaskProgress, type TestTask } from '../data/testData';
import { DEMO_TASKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { useProjectContext } from '../context/ProjectContext';
import { PageBackHeader } from './shared/PageBackHeader';
import { PriorityBadge, TaskStatusBadge, TestModeBadge } from './shared/displayHelpers';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';

type PageMode = 'list' | 'create' | 'view' | 'edit';

const emptyForm = {
  title: '',
  description: '',
  status: 'todo' as TestTask['status'],
  priority: 'medium' as TestTask['priority'],
  assignedTo: TEST_TEAM_MEMBERS[0]?.id ?? '',
  dueDate: '',
};

export function TasksViewWithTestData() {
  const { activeProject, activeProjectSlug, matchesProject } = useProjectContext();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [tasks, setTasks] = useState<TestTask[]>(TEST_TASKS);
  const [selectedTask, setSelectedTask] = useState<TestTask | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:tasks-local');
      const saved = raw ? (JSON.parse(raw) as TestTask[]) : [];
      setTasks(mergeDemoData(saved, DEMO_TASKS_BY_PROJECT, TEST_TASKS));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:tasks-local', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const projectTasks = tasks.filter((t) => matchesProject(t.projectId));

  const toTask = (base?: TestTask): TestTask => ({
    id: base?.id ?? `task-${Date.now()}`,
    title: form.title,
    description: form.description,
    status: form.status,
    priority: form.priority,
    assignedTo: form.assignedTo,
    assignedToName: memberName(form.assignedTo),
    projectId: activeProjectSlug ?? 'popy',
    projectName: activeProject?.name ?? 'Projet',
    dueDate: form.dueDate,
    progress: base?.progress ?? 0,
    subtasks: base?.subtasks ?? [],
    linkedToProcesses: base?.linkedToProcesses,
    linkedToProcessSteps: base?.linkedToProcessSteps,
  });

  const memberName = (id: string) => TEST_TEAM_MEMBERS.find((m) => m.id === id)?.name ?? id;

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toTask(pageMode === 'edit' ? selectedTask ?? undefined : undefined);
    if (pageMode === 'create') {
      setTasks((prev) => [next, ...prev]);
    } else {
      setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)));
      setSelectedTask(next);
    }
    setPageMode('list');
    setForm(emptyForm);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTask(null);
    setPageMode('list');
  };

  const formPage = (
    <ViewShell narrow>
      <PageBackHeader
        title={pageMode === 'create' ? 'Nouvelle tache' : 'Modifier la tache'}
        subtitle={<><TestModeBadge /></>}
        onBack={() => setPageMode(selectedTask ? 'view' : 'list')}
      />
      <form onSubmit={submitForm} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TestTask['status'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="todo">A faire</option>
              <option value="in-progress">En cours</option>
              <option value="blocked">Bloquee</option>
              <option value="done">Terminee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Priorite</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TestTask['priority'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Assigne a</label>
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              {TEST_TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Echeance *</label>
            <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setPageMode(selectedTask ? 'view' : 'list')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{pageMode === 'create' ? 'Creer' : 'Enregistrer'}</button>
        </div>
      </form>
    </ViewShell>
  );

  if (pageMode === 'create' || pageMode === 'edit') return formPage;

  if (pageMode === 'view' && selectedTask) {
    const task = selectedTask;
    const progress = calculateTaskProgress(task);
    return (
      <ViewShell>
        <PageBackHeader
          title={task.title}
          subtitle={<><TestModeBadge /></>}
          onBack={() => { setPageMode('list'); setSelectedTask(null); }}
          actions={
            <div className="flex gap-2">
              <button type="button" onClick={() => { setForm({ title: task.title, description: task.description, status: task.status, priority: task.priority, assignedTo: task.assignedTo, dueDate: task.dueDate }); setPageMode('edit'); }} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Pencil className="w-4 h-4" /> Modifier
              </button>
              <button type="button" onClick={() => removeTask(task.id)} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <p className="text-gray-600">{task.description}</p>
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700"><User className="w-4 h-4" />{task.assignedToName}</div>
            <div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4" />{new Date(task.dueDate).toLocaleDateString('fr-FR')}</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Progression</span><span className="font-bold">{progress}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} /></div>
          </div>
          {task.subtasks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2"><CheckSquare className="w-4 h-4" />Sous-taches</h3>
              <ul className="space-y-2">
                {task.subtasks.map((st) => (
                  <li key={st.id} className="flex items-center gap-2 text-sm">
                    {st.completed ? <Check className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4 border rounded border-gray-300" />}
                    <span className={st.completed ? 'line-through text-gray-500' : ''}>{st.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ViewShell>
    );
  }

  const filteredTasks = projectTasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const isOverdue = (dueDate: string, status: string) => new Date(dueDate) < new Date() && status !== 'done';

  if (!activeProject) {
    return (
      <ViewShell>
        <ViewHeader title="Tâches" subtitle="Sélectionnez un projet dans l'en-tête pour afficher les tâches." />
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title={`Tâches — ${activeProject.name}`}
        subtitle={<><span>Gérez et suivez les tâches du projet actif</span> <TestModeBadge /></>}
        actions={
          <ActionButton icon={Plus} onClick={() => { setForm(emptyForm); setSelectedTask(null); setPageMode('create'); }}>
            Nouvelle tâche
          </ActionButton>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600"><Filter className="w-4 h-4" />Filtres</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">Tous les statuts</option>
          <option value="todo">A faire</option>
          <option value="in-progress">En cours</option>
          <option value="blocked">Bloquee</option>
          <option value="done">Terminee</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">Toutes les priorites</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
        <div className="ml-auto text-sm text-gray-600">{filteredTasks.length} tache(s)</div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isExpanded = expandedTask === task.id;
          const calculatedProgress = calculateTaskProgress(task);
          const teamMember = TEST_TEAM_MEMBERS.find((m) => m.id === task.assignedTo);
          const overdue = isOverdue(task.dueDate, task.status);

          return (
            <div key={task.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">{teamMember?.initials ?? 'XX'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => { setSelectedTask(task); setPageMode('view'); }} className="text-left flex-1 hover:text-indigo-600">
                        <h3 className="font-bold text-lg">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => { setSelectedTask(task); setPageMode('view'); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Voir"><Eye className="w-4 h-4" /></button>
                        <button type="button" onClick={() => { setSelectedTask(task); setForm({ title: task.title, description: task.description, status: task.status, priority: task.priority, assignedTo: task.assignedTo, dueDate: task.dueDate }); setPageMode('edit'); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Modifier"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removeTask(task.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setExpandedTask(isExpanded ? null : task.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <TaskStatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs"><User className="w-3 h-3" />{task.assignedToName}</span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${overdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        <Calendar className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                      {task.linkedToProcesses?.length ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"><Link2 className="w-3 h-3" />{task.linkedToProcesses.length} processus</span>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Progression</span><span className="font-bold">{calculatedProgress}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${calculatedProgress}%` }} /></div>
                    </div>
                  </div>
                </div>
              </div>
              {isExpanded && task.subtasks.length > 0 && (
                <div className="border-t bg-gray-50 p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckSquare className="w-4 h-4" />Sous-taches</h4>
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                        {subtask.completed ? <Check className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4 border rounded" />}
                        <span className={subtask.completed ? 'line-through text-gray-500' : ''}>{subtask.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredTasks.length === 0 && <div className="text-center py-12 text-gray-500">Aucune tache</div>}
      </div>
    </ViewShell>
  );
}
