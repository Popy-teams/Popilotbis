import type { DashboardUserData } from '../types/dashboard';

export const MY_DASHBOARD_DEMO: DashboardUserData = {
  workload: 85,
  tasks: [
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
  trophies: [
    { name: 'Leadership', earnedAt: '2026-01-10' },
    { name: 'Respect délais', earnedAt: '2026-01-08' },
    { name: 'Innovation', earnedAt: '2025-12-15' },
  ],
  meetings: [
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
  actions: [
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
