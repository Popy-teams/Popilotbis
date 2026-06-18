import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Plus, Pencil, Trash2, FileText, Calendar } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { DEMO_ALERTS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';

type DashboardPageMode = 'overview' | 'create-project' | 'create-report' | 'create-meeting' | 'create-alert' | 'edit-alert' | 'manage-alerts';

interface DashboardAlert {
  id: string;
  projectId?: string;
  message: string;
  severity: 'critical' | 'warning';
}

const DEFAULT_ALERTS: DashboardAlert[] = [
  { id: 'a1', projectId: 'popy', message: 'Retard approvisionnement capteurs ToF — impact prototype POPY', severity: 'critical' },
  { id: 'a2', projectId: 'popy', message: 'Budget POPY : dépassement prévu à 105% sur la ligne électronique', severity: 'critical' },
  { id: 'a3', projectId: 'popy', message: '5 tâches POPY bloquées nécessitent une action immédiate', severity: 'critical' },
];

const emptyAlertForm = { message: '', severity: 'critical' as DashboardAlert['severity'] };

export function Dashboard() {
  const { activeProject, matchesProject, activeProjectSlug } = useProjectContext();
  const [pageMode, setPageMode] = useState<DashboardPageMode>('overview');
  const [alerts, setAlerts] = useState<DashboardAlert[]>(DEFAULT_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<DashboardAlert | null>(null);
  const [alertForm, setAlertForm] = useState(emptyAlertForm);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:dashboard-alerts-local');
      if (raw) {
        setAlerts(mergeDemoData(JSON.parse(raw) as DashboardAlert[], DEMO_ALERTS_BY_PROJECT));
      } else {
        setAlerts((prev) => mergeDemoData(prev, DEMO_ALERTS_BY_PROJECT));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:dashboard-alerts-local', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  const scopedAlerts = useMemo(
    () => filterByActiveProject(alerts, matchesProject),
    [alerts, matchesProject]
  );

  const displayProjects = useMemo(
    () => (activeProject ? [activeProject] : []),
    [activeProject]
  );

  const submitAlertForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next: DashboardAlert = {
      id: selectedAlert?.id ?? `a-${Date.now()}`,
      projectId: selectedAlert?.projectId ?? activeProjectSlug ?? 'popy',
      message: alertForm.message,
      severity: alertForm.severity,
    };
    if (pageMode === 'create-alert') setAlerts((prev) => [...prev, next]);
    else setAlerts((prev) => prev.map((a) => (a.id === next.id ? next : a)));
    setPageMode('overview');
    setAlertForm(emptyAlertForm);
    setSelectedAlert(null);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setPageMode('overview');
  };

  const simpleCreatePage = (title: string, description: string, icon: typeof Target) => {
    return (
      <ViewShell narrow>
        <PageBackHeader title={title} onBack={() => setPageMode('overview')} />
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <AppIcon icon={icon} size="xl" />
            <p className="text-gray-600">{description}</p>
          </div>
          <input placeholder="Titre" className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Description" rows={4} className="w-full px-4 py-2 border rounded-lg" />
          <button type="button" onClick={() => setPageMode('overview')} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
        </div>
      </ViewShell>
    );
  };

  if (pageMode === 'create-project') return simpleCreatePage('Créer un nouveau projet', 'Démarrer un projet avec objectifs, planning et équipe.', Target);
  if (pageMode === 'create-report') return simpleCreatePage('Rapport hebdomadaire', 'Générer le rapport de synthèse de la semaine.', FileText);
  if (pageMode === 'create-meeting') return simpleCreatePage('Planifier une réunion', 'Organiser un point projet ou une décision.', Calendar);

  if (pageMode === 'create-alert' || pageMode === 'edit-alert') {
    return (
      <ViewShell narrow>
        <PageBackHeader title={pageMode === 'create-alert' ? 'Nouvelle alerte' : 'Modifier l\'alerte'} onBack={() => setPageMode('overview')} />
        <form onSubmit={submitAlertForm} className="bg-white rounded-xl border p-6 space-y-4">
          <textarea required value={alertForm.message} onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })} placeholder="Message d'alerte" rows={3} className="w-full px-4 py-2 border rounded-lg" />
          <select value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value as DashboardAlert['severity'] })} className="w-full px-4 py-2 border rounded-lg">
            <option value="critical">Critique</option>
            <option value="warning">Avertissement</option>
          </select>
          <div className="flex gap-3">
            <button type="button" onClick={() => setPageMode('overview')} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </form>
      </ViewShell>
    );
  }

  if (pageMode === 'manage-alerts') {
    return (
      <ViewShell narrow>
        <PageBackHeader
          title="Gérer les alertes"
          onBack={() => setPageMode('overview')}
          actions={
            <ActionButton icon={Plus} onClick={() => { setAlertForm(emptyAlertForm); setSelectedAlert(null); setPageMode('create-alert'); }} className="bg-red-600 hover:bg-red-700">
              Nouvelle alerte
            </ActionButton>
          }
        />
        <div className="space-y-2">
          {scopedAlerts.map((alert) => (
            <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border rounded-lg">
              <div className="flex items-start gap-2">
                <AppIcon icon={AlertTriangle} size="md" className={alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'} />
                <span className="text-sm text-gray-800">{alert.message}</span>
              </div>
              <div className="flex gap-2">
                <IconButton icon={Pencil} label="Modifier" onClick={() => { setSelectedAlert(alert); setAlertForm({ message: alert.message, severity: alert.severity }); setPageMode('edit-alert'); }} />
                <IconButton icon={Trash2} label="Supprimer" variant="danger" onClick={() => removeAlert(alert.id)} />
              </div>
            </div>
          ))}
        </div>
      </ViewShell>
    );
  }

  const kpis = [
    {
      label: 'Projets actifs',
      value: activeProject ? '1' : '0',
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'blue',
    },
    {
      label: 'Tâches en cours',
      value: activeProject ? String(Math.max(2, scopedAlerts.length + 2)) : '0',
      change: '-5',
      trend: 'down',
      icon: Clock,
      color: 'orange',
    },
    {
      label: 'Taux de réussite',
      value: activeProject ? '94%' : '—',
      change: '+3%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Alertes critiques',
      value: String(scopedAlerts.filter((a) => a.severity === 'critical').length),
      change: '+1',
      trend: 'up',
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'Dans les temps';
      case 'at-risk':
        return 'À risque';
      case 'delayed':
        return 'En retard';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return priority;
    }
  };

  return (
    <ViewShell>
      <ViewHeader
        title="Tableau de bord"
        subtitle={
          activeProject
            ? `Vue d'ensemble — ${activeProject.name}`
            : "Vue d'ensemble de vos projets et indicateurs clés"
        }
      />

      <div className={viewGrids.stats4}>
        {kpis.map((kpi, index) => {
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor =
            kpi.trend === 'up'
              ? kpi.color === 'red'
                ? 'text-red-600'
                : 'text-green-600'
              : kpi.color === 'green'
              ? 'text-red-600'
              : 'text-green-600';

          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{kpi.label}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <AppIcon icon={TrendIcon} size="sm" className={trendColor} />
                    <span className={`text-sm font-medium ${trendColor}`}>{kpi.change}</span>
                    <span className="text-xs text-gray-500 ml-1">vs. mois dernier</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                  <AppIcon icon={kpi.icon} size="lg" className={`text-${kpi.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AppIcon icon={AlertTriangle} size="md" className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-semibold text-red-900">Alertes critiques</h3>
              <button type="button" onClick={() => setPageMode('manage-alerts')} className="text-sm text-red-700 hover:text-red-900 font-medium">Gérer</button>
            </div>
            {scopedAlerts.length === 0 ? (
              <p className="mt-2 text-sm text-red-700">Aucune alerte critique pour ce projet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-red-800">
                {scopedAlerts.map((alert) => (
                  <li key={alert.id}>• {alert.message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Projet en cours</h2>
        </div>

        {!activeProject && (
          <div className="p-12 text-center text-gray-500">
            <p>Aucun projet sélectionné</p>
            <p className="text-sm mt-2">Choisissez un projet dans le menu en haut de l&apos;écran.</p>
          </div>
        )}

        {activeProject && (
          <TableWrap>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                        {getPriorityLabel(project.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(project.deadline).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="text-gray-900 font-medium">{(project.budget.used / 1000).toFixed(0)}k€</span>
                        <span className="text-gray-500"> / {(project.budget.total / 1000).toFixed(0)}k€</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </div>

      <div className={viewGrids.stats3}>
        <button type="button" onClick={() => setPageMode('create-project')} className="bg-blue-600 text-white p-6 rounded-xl shadow-sm hover:bg-blue-700 transition-colors text-left">
          <h3 className="font-semibold">Créer un nouveau projet</h3>
          <p className="text-sm text-blue-100 mt-1">Démarrer un projet avec objectifs et planning</p>
        </button>
        <button type="button" onClick={() => setPageMode('create-report')} className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-sm hover:border-blue-500 transition-colors text-left">
          <h3 className="font-semibold text-gray-900">Rapport hebdomadaire</h3>
          <p className="text-sm text-gray-600 mt-1">Générer le rapport de la semaine</p>
        </button>
        <button type="button" onClick={() => setPageMode('create-meeting')} className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-sm hover:border-blue-500 transition-colors text-left">
          <h3 className="font-semibold text-gray-900">Planifier une réunion</h3>
          <p className="text-sm text-gray-600 mt-1">Organiser un point projet ou décision</p>
        </button>
      </div>
    </ViewShell>
  );
}
