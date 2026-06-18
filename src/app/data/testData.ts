// Données de test partagées entre l'onglet Tâches et l'onglet Processus
// Permet de maintenir la cohérence des données entre les deux vues

export interface TestTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  assignedToName: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  progress: number;
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  linkedToProcesses?: string[]; // IDs des processus liés
  linkedToProcessSteps?: string[]; // IDs des étapes de processus liées
}

export interface TestTeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
}

// Membres de l'équipe POPY
export const TEST_TEAM_MEMBERS: TestTeamMember[] = [
  {
    id: 'user-1',
    name: 'Alice Martin',
    initials: 'AM',
    role: 'Lead Developer',
    email: 'alice@popilot.com',
  },
  {
    id: 'user-2',
    name: 'Bob Dupont',
    initials: 'BD',
    role: 'Tech Lead',
    email: 'bob@popilot.com',
  },
  {
    id: 'user-3',
    name: 'Claire Rousseau',
    initials: 'CR',
    role: 'QA Engineer',
    email: 'claire@popilot.com',
  },
  {
    id: 'user-4',
    name: 'David Leroy',
    initials: 'DL',
    role: 'UX Designer',
    email: 'david@popilot.com',
  },
  {
    id: 'user-5',
    name: 'Emma Bernard',
    initials: 'EB',
    role: 'Product Owner',
    email: 'emma@popilot.com',
  },
  {
    id: 'user-6',
    name: 'Fabio Garcia',
    initials: 'FG',
    role: 'Project Manager',
    email: 'fabio@popilot.com',
  },
  {
    id: 'user-7',
    name: 'Sonia Laurent',
    initials: 'SL',
    role: 'Quality Manager',
    email: 'sonia@popilot.com',
  },
];

// Tâches du projet POPY avec sous-tâches
export const TEST_TASKS: TestTask[] = [
  {
    id: 'task-1',
    title: 'Développer le prototype V0 du robot POPY',
    description: 'Créer un prototype fonctionnel du robot avec reconnaissance émotionnelle de base',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'user-1',
    assignedToName: 'Alice Martin',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-02-15',
    progress: 65,
    subtasks: [
      { id: 'st1-1', title: 'Sélection des composants hardware', completed: true },
      { id: 'st1-2', title: 'Architecture système embarqué', completed: true },
      { id: 'st1-3', title: 'Intégration caméra et capteurs', completed: true },
      { id: 'st1-4', title: 'Développement module reconnaissance faciale', completed: true },
      { id: 'st1-5', title: 'Développement comportements réactifs', completed: false },
      { id: 'st1-6', title: 'Tests intégration hardware/software', completed: false },
      { id: 'st1-7', title: 'Assemblage final prototype', completed: false },
      { id: 'st1-8', title: 'Documentation technique', completed: false },
    ],
    linkedToProcesses: ['proc-3'],
    linkedToProcessSteps: ['s3-4', 's3-5'],
  },
  {
    id: 'task-2',
    title: 'Rédiger la documentation technique complète',
    description: 'Documentation technique du système POPY (architecture, API, maintenance)',
    status: 'todo',
    priority: 'medium',
    assignedTo: 'user-2',
    assignedToName: 'Bob Dupont',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-03-01',
    progress: 0,
    subtasks: [
      { id: 'st2-1', title: 'Documentation architecture système', completed: false },
      { id: 'st2-2', title: 'Guide d\'installation', completed: false },
      { id: 'st2-3', title: 'Manuel d\'utilisation', completed: false },
      { id: 'st2-4', title: 'Documentation API', completed: false },
      { id: 'st2-5', title: 'Guide de maintenance', completed: false },
    ],
    linkedToProcesses: ['proc-3'],
  },
  {
    id: 'task-3',
    title: 'Tests unitaires et validation IA émotionnelle',
    description: 'Valider les performances du moteur de reconnaissance émotionnelle',
    status: 'done',
    priority: 'high',
    assignedTo: 'user-3',
    assignedToName: 'Claire Rousseau',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-20',
    progress: 100,
    subtasks: [
      { id: 'st3-1', title: 'Tests reconnaissance joie', completed: true },
      { id: 'st3-2', title: 'Tests reconnaissance tristesse', completed: true },
      { id: 'st3-3', title: 'Tests reconnaissance colère', completed: true },
      { id: 'st3-4', title: 'Tests performance temps réel', completed: true },
      { id: 'st3-5', title: 'Rapport de validation', completed: true },
    ],
    linkedToProcesses: ['proc-6'],
    linkedToProcessSteps: ['s6-3'],
  },
  {
    id: 'task-4',
    title: 'Conception interface utilisateur tactile',
    description: 'Design de l\'interface tactile pour interaction enfant-robot',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'user-4',
    assignedToName: 'David Leroy',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-02-10',
    progress: 40,
    subtasks: [
      { id: 'st4-1', title: 'Recherche UX enfants 6-10 ans', completed: true },
      { id: 'st4-2', title: 'Wireframes interface', completed: true },
      { id: 'st4-3', title: 'Maquettes haute fidélité', completed: false },
      { id: 'st4-4', title: 'Prototypage interactif', completed: false },
      { id: 'st4-5', title: 'Tests utilisateurs avec enfants', completed: false },
    ],
    linkedToProcesses: ['proc-3'],
  },
  {
    id: 'task-5',
    title: 'Validation PO et démonstration V0',
    description: 'Présenter le prototype au Product Owner et obtenir validation',
    status: 'todo',
    priority: 'high',
    assignedTo: 'user-5',
    assignedToName: 'Emma Bernard',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-02-20',
    progress: 0,
    subtasks: [
      { id: 'st5-1', title: 'Préparation démonstration', completed: false },
      { id: 'st5-2', title: 'Session de démonstration', completed: false },
      { id: 'st5-3', title: 'Collecte feedback PO', completed: false },
      { id: 'st5-4', title: 'Validation décision GO/NO-GO', completed: false },
    ],
    linkedToProcesses: ['proc-1', 'proc-6'],
    linkedToProcessSteps: ['s1-5', 's6-5'],
  },
  {
    id: 'task-6',
    title: 'Planification Sprint 4 - Module IA avancée',
    description: 'Organiser le sprint 4 dédié aux fonctionnalités IA avancées',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'user-6',
    assignedToName: 'Fabio Garcia',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-25',
    progress: 50,
    subtasks: [
      { id: 'st6-1', title: 'Définition objectifs sprint', completed: true },
      { id: 'st6-2', title: 'Estimation des user stories', completed: true },
      { id: 'st6-3', title: 'Allocation ressources équipe', completed: false },
      { id: 'st6-4', title: 'Validation planning', completed: false },
    ],
    linkedToProcesses: ['proc-2'],
    linkedToProcessSteps: ['s2-3', 's2-4'],
  },
  {
    id: 'task-7',
    title: 'Approvisionnement composants électroniques V1',
    description: 'Commander les composants nécessaires pour la version V1',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'user-6',
    assignedToName: 'Fabio Garcia',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-30',
    progress: 80,
    subtasks: [
      { id: 'st7-1', title: 'Identification besoins V1', completed: true },
      { id: 'st7-2', title: 'Sélection fournisseurs', completed: true },
      { id: 'st7-3', title: 'Négociation contrats', completed: true },
      { id: 'st7-4', title: 'Passation commandes', completed: true },
      { id: 'st7-5', title: 'Suivi livraisons', completed: false },
    ],
    linkedToProcesses: ['proc-5'],
    linkedToProcessSteps: ['s5-5'],
  },
  {
    id: 'task-8',
    title: 'Tests sécurité enfants - Normes CE',
    description: 'Valider la conformité aux normes de sécurité pour produits enfants',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'user-7',
    assignedToName: 'Sonia Laurent',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-02-05',
    progress: 30,
    subtasks: [
      { id: 'st8-1', title: 'Analyse des normes CE applicables', completed: true },
      { id: 'st8-2', title: 'Tests matériaux non toxiques', completed: true },
      { id: 'st8-3', title: 'Tests résistance mécanique', completed: false },
      { id: 'st8-4', title: 'Tests électriques et thermiques', completed: false },
      { id: 'st8-5', title: 'Certification finale', completed: false },
    ],
    linkedToProcesses: ['proc-6'],
    linkedToProcessSteps: ['s6-2'],
  },
  {
    id: 'task-9',
    title: 'Mise à jour registre des risques projet',
    description: 'Actualiser le registre des risques avec les nouveaux risques identifiés',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'user-7',
    assignedToName: 'Sonia Laurent',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-31',
    progress: 70,
    subtasks: [
      { id: 'st9-1', title: 'Revue risques existants', completed: true },
      { id: 'st9-2', title: 'Identification nouveaux risques', completed: true },
      { id: 'st9-3', title: 'Évaluation impact/probabilité', completed: true },
      { id: 'st9-4', title: 'Plans de mitigation', completed: false },
      { id: 'st9-5', title: 'Validation avec l\'équipe', completed: false },
    ],
    linkedToProcesses: ['proc-7'],
    linkedToProcessSteps: ['s7-5'],
  },
  {
    id: 'task-10',
    title: 'Rétrospective Sprint 3',
    description: 'Organiser la rétrospective du sprint 3 et définir les actions d\'amélioration',
    status: 'done',
    priority: 'medium',
    assignedTo: 'user-5',
    assignedToName: 'Emma Bernard',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-18',
    progress: 100,
    subtasks: [
      { id: 'st10-1', title: 'Préparation questionnaire rétrospective', completed: true },
      { id: 'st10-2', title: 'Session rétrospective équipe', completed: true },
      { id: 'st10-3', title: 'Analyse PDCA', completed: true },
      { id: 'st10-4', title: 'Définition plan d\'actions', completed: true },
      { id: 'st10-5', title: 'Communication actions', completed: true },
    ],
    linkedToProcesses: ['proc-8'],
    linkedToProcessSteps: ['s8-1', 's8-2'],
  },
  {
    id: 'task-11',
    title: 'Développement module cartographie processus POPILOT',
    description: 'Créer le module de visualisation des processus ISO 9001 dans POPILOT',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'user-1',
    assignedToName: 'Alice Martin',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-22',
    progress: 85,
    subtasks: [
      { id: 'st11-1', title: 'Design maquettes Figma', completed: true },
      { id: 'st11-2', title: 'Développement cartographie interactive', completed: true },
      { id: 'st11-3', title: 'Développement fiches processus détaillées', completed: true },
      { id: 'st11-4', title: 'Système de liaison tâches-processus', completed: true },
      { id: 'st11-5', title: 'Tests utilisateurs finaux', completed: false },
    ],
    linkedToProcesses: ['proc-4'],
    linkedToProcessSteps: ['s4-3'],
  },
  {
    id: 'task-12',
    title: 'Mise à jour tableau de bord KPI mensuel',
    description: 'Actualiser le dashboard des indicateurs de performance du projet',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'user-6',
    assignedToName: 'Fabio Garcia',
    projectId: 'popy',
    projectName: 'Projet POPY - Robot Éducatif',
    dueDate: '2026-01-31',
    progress: 60,
    subtasks: [
      { id: 'st12-1', title: 'Collecte données KPI', completed: true },
      { id: 'st12-2', title: 'Mise à jour dashboard', completed: true },
      { id: 'st12-3', title: 'Analyse tendances', completed: true },
      { id: 'st12-4', title: 'Rédaction rapport mensuel', completed: false },
      { id: 'st12-5', title: 'Présentation aux stakeholders', completed: false },
    ],
    linkedToProcesses: ['proc-9'],
    linkedToProcessSteps: ['s9-4', 's9-5'],
  },
];

// Fonction helper pour obtenir les tâches d'un projet spécifique
export function getTasksByProject(projectId: string): TestTask[] {
  return TEST_TASKS.filter(task => task.projectId === projectId);
}

// Fonction helper pour obtenir les tâches liées à un processus
export function getTasksByProcess(processId: string): TestTask[] {
  return TEST_TASKS.filter(task => task.linkedToProcesses?.includes(processId));
}

// Fonction helper pour obtenir un membre d'équipe par ID
export function getTeamMemberById(userId: string): TestTeamMember | undefined {
  return TEST_TEAM_MEMBERS.find(member => member.id === userId);
}

// Fonction helper pour calculer la progression d'une tâche basée sur les sous-tâches
export function calculateTaskProgress(task: TestTask): number {
  if (task.subtasks.length === 0) return task.progress;
  const completed = task.subtasks.filter(st => st.completed).length;
  return Math.round((completed / task.subtasks.length) * 100);
}
