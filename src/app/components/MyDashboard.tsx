import { useState, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import {
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  AlertTriangle,
  MessageSquare,
  Hand,
  Crown,
  Lightbulb,
  PartyPopper,
  Bot,
  Send,
} from 'lucide-react';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, StatIcon, IconButton, ActionButton, IconLabel } from './shared';

type PageMode = 'dashboard' | 'declare-blockage';

const TROPHY_ICONS: Record<string, typeof Crown> = {
  Leadership: Crown,
  'Respect délais': Clock,
  Innovation: Lightbulb,
};

export function MyDashboard() {
  const { activeProject, matchesProject } = useProjectContext();
  const [pageMode, setPageMode] = useState<PageMode>('dashboard');
  const [blockageForm, setBlockageForm] = useState({
    taskId: '',
    description: '',
    impact: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    proposedSolution: '',
  });

  const myTasks = [
    { id: '1', title: 'Finaliser spécifications techniques POPY' },
    { id: '2', title: 'Validation prototype capteurs de mouvement' },
    { id: '3', title: 'Organiser réunion validation design UX' },
    { id: '4', title: 'Revue risques projet avec équipe qualité' },
  ];

  const myData = {
    name: 'Jean Dupont',
    role: 'Chef de projet',
    workload: 85,
    myTasks: [
      {
        id: 1,
        title: 'Finaliser spécifications techniques POPY',
        project: 'POPY',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2026-01-20',
        progress: 75,
      },
      {
        id: 2,
        title: 'Validation prototype capteurs de mouvement',
        project: 'POPY',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2026-01-22',
        progress: 60,
      },
      {
        id: 3,
        title: 'Organiser réunion validation design UX',
        project: 'POPY',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-01-18',
        progress: 0,
      },
      {
        id: 4,
        title: 'Revue risques projet avec équipe qualité',
        project: 'POPY',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-01-19',
        progress: 0,
      },
    ],
    objectives: [
      {
        id: 1,
        name: 'Livrer prototype POPY V1 dans les temps',
        progress: 67,
        target: 100,
        deadline: '2026-03-15',
      },
      {
        id: 2,
        name: 'Maintenir satisfaction équipe > 4/5',
        progress: 80,
        target: 100,
        deadline: '2026-06-30',
      },
      {
        id: 3,
        name: 'Respecter budget POPY ±5%',
        progress: 85,
        target: 100,
        deadline: '2026-03-15',
      },
    ],
    recentTrophies: [
      { name: 'Leadership', earnedAt: '2026-01-10' },
      { name: 'Respect délais', earnedAt: '2026-01-08' },
      { name: 'Innovation', earnedAt: '2025-12-15' },
    ],
    upcomingMeetings: [
      {
        id: 1,
        title: 'Point POPY - Sprint Review',
        date: '2026-01-17',
        time: '14:00',
        participants: 5,
      },
      {
        id: 2,
        title: 'Comité pilotage POPY',
        date: '2026-01-20',
        time: '10:00',
        participants: 8,
      },
    ],
    recentActions: [
      {
        id: 1,
        from: 'Réunion Sprint #12',
        description: 'Valider les choix de capteurs avec Thomas',
        dueDate: '2026-01-18',
        status: 'pending',
      },
      {
        id: 2,
        from: 'Réunion Qualité',
        description: 'Compléter documentation risques sécurité enfants',
        dueDate: '2026-01-19',
        status: 'pending',
      },
    ],
  };

  const projectRef = (name: string) => (name.toLowerCase().includes('popy') ? 'popy' : name.toLowerCase());

  const scopedTasks = useMemo(
    () => myData.myTasks.filter((t) => matchesProject(projectRef(t.project))),
    [matchesProject]
  );

  const showPopyDemo = matchesProject('popy');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'blocked':
        return 'Bloqué';
      default:
        return 'À faire';
    }
  };

  const handleBlockageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Blocage déclaré:', blockageForm);
    alert('Blocage déclaré avec succès ! Votre équipe en est informée.');
    setBlockageForm({ taskId: '', description: '', impact: 'medium', proposedSolution: '' });
    setPageMode('dashboard');
  };

  const tasksInProgress = scopedTasks.filter((t) => t.status === 'in-progress').length;
  const tasksCompleted = scopedTasks.filter((t) => t.status === 'done').length;
  const urgentTasks = scopedTasks.filter((t) => {
    const daysUntilDue = Math.ceil(
      (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 3 && t.status !== 'done';
  }).length;

  if (pageMode === 'declare-blockage') {
    return (
      <ViewShell narrow>
        <PageBackHeader
          title="Déclarer un blocage"
          subtitle={
            <IconLabel icon={AlertTriangle} className="text-red-700" iconSize="sm">
              Signalez un obstacle pour obtenir de l'aide rapidement
            </IconLabel>
          }
          onBack={() => setPageMode('dashboard')}
        />

        <form onSubmit={handleBlockageSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Pas d'inquiétude !</strong> Signaler un blocage est une bonne pratique. Cela permet à
              l'équipe de réagir rapidement et de vous débloquer. Nous sommes là pour vous aider.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quelle tâche est bloquée ? *</label>
            <select
              required
              value={blockageForm.taskId}
              onChange={(e) => setBlockageForm({ ...blockageForm, taskId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Sélectionnez une tâche</option>
              {scopedTasks.map((task) => (
                <option key={task.id} value={String(task.id)}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Décrivez le blocage *</label>
            <textarea
              required
              value={blockageForm.description}
              onChange={(e) => setBlockageForm({ ...blockageForm, description: e.target.value })}
              placeholder="Ex: J'attends la validation de Thomas sur le choix des capteurs depuis 3 jours, ce qui m'empêche d'avancer sur les spécifications techniques..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Soyez précis : qu'est-ce qui vous bloque ? Depuis quand ? Qu'avez-vous déjà tenté ?
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Impact estimé sur le projet *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'low', label: 'Faible' },
                { value: 'medium', label: 'Moyen' },
                { value: 'high', label: 'Élevé' },
                { value: 'critical', label: 'Critique' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setBlockageForm({
                      ...blockageForm,
                      impact: option.value as 'low' | 'medium' | 'high' | 'critical',
                    })
                  }
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    blockageForm.impact === option.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Faible:</strong> Retard de quelques heures • <strong>Moyen:</strong> Retard de 1-2 jours •{' '}
              <strong>Élevé:</strong> Retard d'une semaine • <strong>Critique:</strong> Bloque tout le sprint
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Avez-vous une solution à proposer ? (optionnel)
            </label>
            <textarea
              value={blockageForm.proposedSolution}
              onChange={(e) => setBlockageForm({ ...blockageForm, proposedSolution: e.target.value })}
              placeholder="Ex: Organiser une réunion express avec Thomas demain matin pour trancher sur les capteurs"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Que va-t-il se passer ?</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <AppIcon icon={CheckCircle} size="sm" className="text-green-600 mt-0.5" />
                Votre chef de projet sera notifié immédiatement
              </li>
              <li className="flex items-start gap-2">
                <AppIcon icon={CheckCircle} size="sm" className="text-green-600 mt-0.5" />
                Le blocage sera ajouté au tableau des risques projet
              </li>
              <li className="flex items-start gap-2">
                <AppIcon icon={CheckCircle} size="sm" className="text-green-600 mt-0.5" />
                Une action corrective sera créée automatiquement
              </li>
              <li className="flex items-start gap-2">
                <AppIcon icon={CheckCircle} size="sm" className="text-green-600 mt-0.5" />
                Vous recevrez une réponse sous 24h maximum
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setPageMode('dashboard')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <AppIcon icon={Send} size="md" className="text-white" />
              Déclarer le blocage
            </button>
          </div>
        </form>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <h1 className="page-title text-white flex flex-col sm:flex-row items-start sm:items-center gap-2">
          Bonjour {myData.name.split(' ')[0]}
          <AppIcon icon={Hand} size="xl" className="text-white" />
        </h1>
        <p className="mt-2 text-blue-100">
          Voici votre tableau de bord personnel. POPILOT est là pour vous guider.
        </p>
      </div>

      <div className={viewGrids.stats4}>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Tâches en cours</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">{tasksInProgress}</p>
            </div>
            <StatIcon icon={Clock} className="text-blue-600 bg-blue-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Tâches terminées</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{tasksCompleted}</p>
            </div>
            <StatIcon icon={CheckCircle} className="text-green-600 bg-green-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Tâches urgentes</p>
              <p className="text-3xl font-bold mt-2 text-red-600">{urgentTasks}</p>
            </div>
            <StatIcon icon={AlertCircle} className="text-red-600 bg-red-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Charge de travail</p>
              <p className="text-3xl font-bold mt-2 text-orange-600">{myData.workload}%</p>
            </div>
            <StatIcon icon={TrendingUp} className="text-orange-600 bg-orange-100" />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-4">
          <AppIcon icon={Target} size="lg" />
          Que dois-je faire maintenant ?
        </h2>
        <div className="space-y-3">
          {scopedTasks
            .filter((t) => t.status !== 'done')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3)
            .map((task) => {
              const daysUntilDue = Math.ceil(
                (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysUntilDue <= 3;

              return (
                <div
                  key={task.id}
                  className={`bg-white p-4 rounded-lg border-2 ${
                    isUrgent ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-gray-600">Projet: {task.project}</span>
                        <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Priorité haute' : 'Priorité moyenne'}
                        </span>
                        <span className={`inline-flex items-center gap-1 ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {isUrgent && <AppIcon icon={AlertTriangle} size="sm" />}
                          {isUrgent ? `Dans ${daysUntilDue}j` : `Échéance: ${daysUntilDue}j`}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progression</span>
                          <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className={viewGrids.cards2}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AppIcon icon={Target} size="md" className="text-blue-600" />
              Mes objectifs
            </h2>
          </div>
          <div className="space-y-4">
            {(showPopyDemo ? myData.objectives : []).map((objective) => (
              <div key={objective.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{objective.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Échéance: {new Date(objective.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{objective.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      objective.progress >= 80
                        ? 'bg-green-500'
                        : objective.progress >= 50
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${objective.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <AppIcon icon={Award} size="md" className="text-amber-600" />
            Mes trophées
          </h2>
          <div className="space-y-3">
            {(showPopyDemo ? myData.recentTrophies : []).map((trophy, idx) => {
              const TrophyIcon = TROPHY_ICONS[trophy.name] ?? Award;
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-lg border border-amber-200 flex items-center gap-3"
                >
                  <StatIcon icon={TrophyIcon} className="bg-amber-100 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{trophy.name}</h3>
                    <p className="text-xs text-gray-500">
                      Obtenu le {new Date(trophy.earnedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center text-sm text-amber-700">
            <IconLabel icon={PartyPopper} iconSize="sm">Continuez comme ça ! Votre travail est reconnu.</IconLabel>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <AppIcon icon={Calendar} size="md" className="text-blue-600" />
          Mes prochaines réunions
        </h2>
        <div className="space-y-3">
          {(showPopyDemo ? myData.upcomingMeetings : []).map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-center">
                  <div className="text-xs font-semibold">
                    {new Date(meeting.date).toLocaleDateString('fr-FR', { day: '2-digit' })}
                  </div>
                  <div className="text-xs">
                    {new Date(meeting.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">
                    {meeting.time} • {meeting.participants} participants
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <AppIcon icon={FileText} size="md" className="text-blue-600" />
          Actions qui me sont assignées
        </h2>
        <div className="space-y-3">
          {(showPopyDemo ? myData.recentActions : []).map((action) => (
            <div
              key={action.id}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
            >
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">De: {action.from}</div>
                <h3 className="font-medium text-gray-900">{action.description}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Échéance: {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Marquer comme fait
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <AppIcon icon={AlertTriangle} size="lg" className="text-red-600 mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 text-lg">Vous rencontrez un blocage ?</h3>
              <p className="text-sm text-red-700 mt-1">
                N'attendez pas ! Signalez-le immédiatement pour qu'on puisse vous aider.
              </p>
            </div>
          </div>
          <ActionButton
            variant="danger"
            icon={AlertTriangle}
            onClick={() => setPageMode('declare-blockage')}
            className="whitespace-nowrap shrink-0"
          >
            Je suis bloqué
          </ActionButton>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <StatIcon icon={MessageSquare} className="bg-purple-600 text-white shrink-0" />
          <div className="flex-1 min-w-0 w-full">
            <h3 className="font-semibold text-purple-900 text-lg mb-2 flex items-center gap-2">
              <AppIcon icon={Bot} size="md" />
              Assistant POPILOT - Votre copilote personnel
            </h3>
            <p className="text-sm text-purple-700 mb-3">
              Posez-moi vos questions sur vos tâches, vos priorités ou l'état du projet POPY.
            </p>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <input
                type="text"
                placeholder="Ex: Sur quoi je dois me concentrer aujourd'hui ?"
                className="w-full outline-none text-gray-700"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-white border border-purple-300 rounded-full text-xs text-purple-700 hover:bg-purple-50">
                Sur quoi me concentrer ?
              </button>
              <button className="px-3 py-1 bg-white border border-purple-300 rounded-full text-xs text-purple-700 hover:bg-purple-50">
                Quel est l'impact si je suis en retard ?
              </button>
              <button className="px-3 py-1 bg-white border border-purple-300 rounded-full text-xs text-purple-700 hover:bg-purple-50">
                Dernières décisions du projet ?
              </button>
            </div>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}
