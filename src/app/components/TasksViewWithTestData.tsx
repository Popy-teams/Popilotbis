import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { TEST_TASKS, TEST_TEAM_MEMBERS, type TestTask } from '../data/testData';
import { DEMO_TASKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import {
  linkTaskToPipelineStage,
  TASKS_STORAGE_KEY,
  applyPipelineSync,
  removeTaskFromPipeline,
} from '../utils/pipelineSync';
import { getRoutePath } from '../routes/viewRoutes';
import { getLinkedProcessesForTask } from '../data/testProcesses';
import { ViewShell, ViewHeader } from './shared';
import {
  TaskFormPage,
  emptyTaskForm,
  formValuesToTask,
  taskToFormValues,
  type TaskFormValues,
} from './tasks/TaskFormPage';
import { TaskDetailPage } from './tasks/TaskDetailPage';
import { TasksListPage } from './tasks/TasksListPage';

type PageMode = 'list' | 'create' | 'view' | 'edit';

export function TasksViewWithTestData() {
  const navigate = useNavigate();
  const { activeProject, activeProjectSlug, matchesProject } = useProjectContext();
  const { scopedStages, syncFromTasks } = usePipeline();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [tasks, setTasks] = useState<TestTask[]>(TEST_TASKS);
  const [selectedTask, setSelectedTask] = useState<TestTask | null>(null);
  const [form, setForm] = useState<TaskFormValues>(() =>
    emptyTaskForm(TEST_TEAM_MEMBERS[0]?.id ?? '')
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as TestTask[]) : [];
      setTasks(mergeDemoData(saved, DEMO_TASKS_BY_PROJECT, TEST_TASKS));
    } catch {
      // ignore
    }
  }, []);

  const projectTasks = tasks.filter((t) => matchesProject(t.projectId));

  const persistTasks = (nextTasks: TestTask[]) => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(nextTasks));
    } catch {
      // ignore
    }
    applyPipelineSync(nextTasks);
    syncFromTasks(nextTasks);
    setTasks(nextTasks);
  };

  const openCreate = () => {
    setForm(emptyTaskForm(TEST_TEAM_MEMBERS[0]?.id ?? ''));
    setSelectedTask(null);
    setPageMode('create');
  };

  const openEdit = (task: TestTask) => {
    setSelectedTask(task);
    setForm(taskToFormValues(task));
    setPageMode('edit');
  };

  const openView = (task: TestTask) => {
    setSelectedTask(task);
    setPageMode('view');
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const base = pageMode === 'edit' && selectedTask ? selectedTask : { id: `task-${Date.now()}` };
    const next = formValuesToTask(
      form,
      base,
      TEST_TEAM_MEMBERS,
      activeProjectSlug ?? 'popy',
      activeProject?.name ?? 'Projet'
    );
    const baseTasks =
      pageMode === 'create' ? [next, ...tasks] : tasks.map((t) => (t.id === next.id ? next : t));
    const syncedTasks = linkTaskToPipelineStage(next.id, next.stageId, baseTasks);
    persistTasks(syncedTasks);

    if (pageMode === 'create') {
      setPageMode('list');
      setSelectedTask(null);
    } else {
      setSelectedTask(next);
      setPageMode('view');
    }
    setForm(emptyTaskForm(TEST_TEAM_MEMBERS[0]?.id ?? ''));
  };

  const removeTask = (id: string) => {
    persistTasks(removeTaskFromPipeline(id, tasks));
    setSelectedTask(null);
    setPageMode('list');
  };

  if (pageMode === 'create') {
    return (
      <TaskFormPage
        mode="create"
        title="Nouvelle tâche"
        subtitle={activeProject ? `Tâches — ${activeProject.name}` : 'Tâches'}
        values={form}
        members={TEST_TEAM_MEMBERS}
        stages={scopedStages}
        submitLabel="Créer la tâche"
        onBack={() => setPageMode('list')}
        onSubmit={submitForm}
        onChange={setForm}
      />
    );
  }

  if (pageMode === 'edit' && selectedTask) {
    const task = tasks.find((t) => t.id === selectedTask.id) ?? selectedTask;
    return (
      <TaskFormPage
        mode="edit"
        title="Modifier la tâche"
        subtitle={task.title}
        values={form}
        members={TEST_TEAM_MEMBERS}
        stages={scopedStages}
        linkedProcessCount={task.linkedToProcesses?.length ?? 0}
        submitLabel="Enregistrer"
        onBack={() => setPageMode('view')}
        onSubmit={submitForm}
        onChange={setForm}
      />
    );
  }

  if (pageMode === 'view' && selectedTask) {
    const task = tasks.find((t) => t.id === selectedTask.id) ?? selectedTask;
    return (
      <TaskDetailPage
        task={task}
        stages={scopedStages}
        linkedProcesses={getLinkedProcessesForTask(
          task.linkedToProcesses,
          task.linkedToProcessSteps
        )}
        onBack={() => {
          setPageMode('list');
          setSelectedTask(null);
        }}
        onEdit={() => openEdit(task)}
        onDelete={() => removeTask(task.id)}
        onOpenPipeline={() => navigate(`/${getRoutePath('pipeline')}`)}
        onOpenProcess={(processId) =>
          navigate(`/${getRoutePath('process')}?id=${encodeURIComponent(processId)}`)
        }
      />
    );
  }

  if (!activeProject) {
    return (
      <ViewShell>
        <ViewHeader title="Tâches" subtitle="Sélectionnez un projet dans l'en-tête pour afficher les tâches." />
      </ViewShell>
    );
  }

  return (
    <TasksListPage
      projectName={activeProject.name}
      tasks={projectTasks}
      members={TEST_TEAM_MEMBERS}
      stages={scopedStages}
      onCreate={openCreate}
      onOpen={openView}
      onEdit={openEdit}
      onDelete={(task) => removeTask(task.id)}
    />
  );
}
