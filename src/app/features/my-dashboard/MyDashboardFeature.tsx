import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Hand,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useProjectContext } from '../../context/ProjectContext';
import { getRoutePath } from '../../routes/viewRoutes';
import { loadPersonalProfile, getDisplayName } from '../../data/personalProfileStore';
import { MY_DASHBOARD_DEMO } from '../../data/myDashboardDemoData';
import type { BlockageFormValues, DashboardTab, DashboardUserData } from '../../types/dashboard';
import { ViewHero, ViewShell } from '../../components/shared';
import { PersonalStatCard } from '../personal/PersonalStatCard';
import { DashboardTabNav } from './DashboardTabNav';
import { DashboardOverviewTab } from './DashboardOverviewTab';
import { DashboardTasksTab } from './DashboardTasksTab';
import { DashboardGoalsTab } from './DashboardGoalsTab';
import { DashboardAgendaTab } from './DashboardAgendaTab';
import { DashboardAssistantTab } from './DashboardAssistantTab';
import { DeclareBlockagePage } from './DeclareBlockagePage';
import { computeDashboardStats, scopeDashboardData } from './dashboardPresentation';

export function MyDashboardFeature() {
  const { user } = useAuth();
  const { matchesProject, activeProjectSlug } = useProjectContext();
  const profile = useMemo(() => loadPersonalProfile(user), [user]);
  const displayName = getDisplayName(profile) || user.name;
  const firstName = displayName.split(' ')[0];

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [pageMode, setPageMode] = useState<'list' | 'declare-blockage'>('list');
  const [dashboardData, setDashboardData] = useState<DashboardUserData>(MY_DASHBOARD_DEMO);

  const scoped = useMemo(
    () => scopeDashboardData(dashboardData, matchesProject, activeProjectSlug),
    [dashboardData, matchesProject, activeProjectSlug]
  );

  const stats = useMemo(() => computeDashboardStats(scoped.tasks, scoped), [scoped]);

  const tabCounts = useMemo(
    () => ({
      tasks: scoped.tasks.length,
      goals: scoped.objectives.length,
      agenda: scoped.meetings.length + scoped.actions.filter((a) => a.status === 'pending').length,
    }),
    [scoped]
  );

  const handleMarkActionDone = useCallback((id: number) => {
    setDashboardData((prev) => ({
      ...prev,
      actions: prev.actions.map((a) => (a.id === id ? { ...a, status: 'done' as const } : a)),
    }));
  }, []);

  const handleBlockageSubmit = useCallback((values: BlockageFormValues) => {
    console.log('Blocage déclaré:', values);
    alert('Blocage déclaré avec succès ! Votre équipe en est informée.');
    setPageMode('list');
    setActiveTab('assistant');
  }, []);

  if (pageMode === 'declare-blockage') {
    return (
      <DeclareBlockagePage
        tasks={scoped.tasks}
        onBack={() => setPageMode('list')}
        onSubmit={handleBlockageSubmit}
      />
    );
  }

  return (
    <ViewShell>
      <ViewHero
        title={`Bonjour ${firstName}`}
        subtitle="Votre tableau de bord personnel — priorités, tâches et suivi au même endroit."
        badge="Mon espace · Tableau de bord"
        badgeIcon={Hand}
        theme="blue"
        actions={
          <Link
            to={`/${getRoutePath('personal-space')}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/90 border border-sky-200 text-sky-800 text-sm font-semibold hover:bg-white transition-colors shadow-sm"
          >
            Mes informations
          </Link>
        }
      />

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <PersonalStatCard
            label="En cours"
            value={String(stats.inProgress)}
            hint="Tâches actives"
            tone="sky"
            icon={Clock}
          />
          <PersonalStatCard
            label="Terminées"
            value={String(stats.completed)}
            hint="Sur le projet actif"
            tone="good"
            icon={CheckCircle2}
          />
          <PersonalStatCard
            label="Urgentes"
            value={String(stats.urgent)}
            hint="Échéance ≤ 3 jours"
            tone={stats.urgent > 0 ? 'amber' : 'good'}
            icon={AlertCircle}
          />
          <PersonalStatCard
            label="Charge"
            value={`${stats.workload}%`}
            hint="Capacité estimée"
            tone="violet"
            icon={TrendingUp}
          />
        </div>
      ) : null}

      <DashboardTabNav activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />

      {activeTab === 'overview' ? (
        <DashboardOverviewTab
          firstName={firstName}
          stats={stats}
          data={scoped}
          onGoTab={setActiveTab}
        />
      ) : null}
      {activeTab === 'tasks' ? <DashboardTasksTab tasks={scoped.tasks} /> : null}
      {activeTab === 'goals' ? (
        <DashboardGoalsTab objectives={scoped.objectives} trophies={scoped.trophies} />
      ) : null}
      {activeTab === 'agenda' ? (
        <DashboardAgendaTab
          meetings={scoped.meetings}
          actions={scoped.actions}
          onMarkDone={handleMarkActionDone}
        />
      ) : null}
      {activeTab === 'assistant' ? (
        <DashboardAssistantTab onDeclareBlockage={() => setPageMode('declare-blockage')} />
      ) : null}
    </ViewShell>
  );
}
