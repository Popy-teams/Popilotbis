import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { filterByActiveProject } from '../../utils/projectMatch';
import { DEMO_ALERTS_BY_PROJECT } from '../../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../../utils/demoDataMerge';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import type { TestTask } from '../../data/testData';
import type {
  ProjectDashboardAlert,
  ProjectDashboardPageMode,
  ProjectDashboardTab,
  QuickActionKind,
} from '../../types/projectDashboard';
import { ViewShell, ViewHeader, ActionButton } from '../../components/shared';
import { withEffectiveStatus } from '../projects/components/projectPresentation';
import { ProjectDashboardTabNav } from './ProjectDashboardTabNav';
import { ProjectDashboardOverviewTab } from './ProjectDashboardOverviewTab';
import { ProjectDashboardAlertsTab } from './ProjectDashboardAlertsTab';
import { ProjectDashboardProjectTab } from './ProjectDashboardProjectTab';
import { ProjectDashboardActionsTab } from './ProjectDashboardActionsTab';
import { AlertFormPage } from './AlertFormPage';
import { QuickActionFormPage } from './QuickActionFormPage';
import {
  ALERTS_STORAGE_KEY,
  DEFAULT_ALERTS,
  alertToFormValues,
  buildAlertFromForm,
  computeProjectDashboardStats,
  emptyAlertForm,
} from './projectDashboardPresentation';

export function ProjectDashboardFeature() {
  const { activeProject, visibleProjects, matchesProject, activeProjectSlug } = useProjectContext();
  const [activeTab, setActiveTab] = useState<ProjectDashboardTab>('overview');
  const [pageMode, setPageMode] = useState<ProjectDashboardPageMode>('list');
  const [quickAction, setQuickAction] = useState<QuickActionKind>('project');
  const [selectedAlert, setSelectedAlert] = useState<ProjectDashboardAlert | null>(null);
  const [alertForm, setAlertForm] = useState(emptyAlertForm());
  const [tasksInProgress, setTasksInProgress] = useState(0);

  const { data: apiAlerts, refetch: refetchAlerts } = useApi<any[]>(activeProject ? `/dashboard-alerts/${encodeURIComponent(activeProject.id)}` : null);
  const { data: apiTasks } = useApi<any[]>('/tasks');

  const alerts = useMemo(() => {
    if (!apiAlerts) return [];
    return apiAlerts.map(a => ({
      ...a,
      projectId: a.project_id
    }));
  }, [apiAlerts]);

  useEffect(() => {
    if (apiTasks) {
      const scoped = filterByActiveProject(apiTasks, matchesProject, activeProjectSlug ?? 'popy');
      setTasksInProgress(scoped.filter((t: any) => t.status === 'in-progress' || t.status === 'blocked').length);
    }
  }, [apiTasks, matchesProject, activeProjectSlug]);

  const scopedAlerts = useMemo(
    () => alerts,
    [alerts]
  );

  const projectWithStatus = useMemo(
    () => (activeProject ? withEffectiveStatus(activeProject) : null),
    [activeProject]
  );

  const stats = useMemo(
    () =>
      computeProjectDashboardStats(
        projectWithStatus,
        visibleProjects.map(withEffectiveStatus),
        scopedAlerts,
        tasksInProgress
      ),
    [projectWithStatus, visibleProjects, scopedAlerts, tasksInProgress]
  );

  const goList = () => {
    setPageMode('list');
    setSelectedAlert(null);
    setAlertForm(emptyAlertForm());
  };

  const openCreateAlert = () => {
    setAlertForm(emptyAlertForm());
    setSelectedAlert(null);
    setPageMode('create-alert');
  };

  const openEditAlert = (alert: ProjectDashboardAlert) => {
    setSelectedAlert(alert);
    setAlertForm(alertToFormValues(alert));
    setPageMode('edit-alert');
  };

  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildAlertFromForm(
      alertForm,
      pageMode === 'edit-alert' ? selectedAlert ?? undefined : undefined,
      activeProject?.id ?? 'popy'
    );
    
    if (pageMode === 'create-alert') {
      await apiPost('/dashboard-alerts', next);
    } else {
      await apiPut(`/dashboard-alerts/${next.id}`, next);
    }
    
    refetchAlerts();
    goList();
    setActiveTab('alerts');
  };

  const removeAlert = async (id: string) => {
    await apiDelete(`/dashboard-alerts/${id}`);
    refetchAlerts();
  };

  const openQuickAction = (kind: QuickActionKind) => {
    setQuickAction(kind);
    setPageMode('quick-action');
  };

  if (pageMode === 'create-alert' || pageMode === 'edit-alert') {
    return (
      <AlertFormPage
        mode={pageMode === 'create-alert' ? 'create' : 'edit'}
        values={alertForm}
        onChange={setAlertForm}
        onSubmit={submitAlert}
        onBack={goList}
      />
    );
  }

  if (pageMode === 'quick-action') {
    return <QuickActionFormPage kind={quickAction} onBack={goList} />;
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Tableau de bord"
        subtitle={
          activeProject
            ? `Vue d'ensemble — ${activeProject.name}`
            : "Vue d'ensemble de vos projets et indicateurs clés"
        }
        badge="Pilotage · Dashboard"
        theme="indigo"
        sidePanel={
          activeProject ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">
                  Projet actif
                </p>
                <p className="font-semibold text-stone-900 mt-0.5 break-words">{activeProject.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">
                  Santé projet
                </p>
                <p className="text-2xl font-bold text-indigo-700 mt-0.5">{stats.healthScore}%</p>
              </div>
              <div className="pt-2 border-t border-indigo-100">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-500">
                  Alertes critiques
                </p>
                <p className="font-medium text-stone-800 mt-0.5">{stats.criticalAlerts}</p>
              </div>
            </div>
          ) : undefined
        }
        actions={
          <ActionButton icon={Plus} onClick={openCreateAlert} className="w-full sm:w-auto justify-center">
            Nouvelle alerte
          </ActionButton>
        }
      />

      <ProjectDashboardTabNav
        activeTab={activeTab}
        onChange={setActiveTab}
        alertCount={scopedAlerts.length}
      />

      <div className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 md:p-6 shadow-sm min-w-0 overflow-hidden">
        {activeTab === 'overview' ? (
          <ProjectDashboardOverviewTab
            stats={stats}
            activeProject={projectWithStatus}
            alerts={scopedAlerts}
            onGoTab={setActiveTab}
          />
        ) : null}
        {activeTab === 'alerts' ? (
          <ProjectDashboardAlertsTab
            alerts={scopedAlerts}
            onCreate={openCreateAlert}
            onEdit={openEditAlert}
            onDelete={removeAlert}
          />
        ) : null}
        {activeTab === 'project' ? (
          <ProjectDashboardProjectTab activeProject={projectWithStatus} />
        ) : null}
        {activeTab === 'actions' ? (
          <ProjectDashboardActionsTab onQuickAction={openQuickAction} />
        ) : null}
      </div>
    </ViewShell>
  );
}
