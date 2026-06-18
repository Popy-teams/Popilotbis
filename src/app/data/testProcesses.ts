// Données de test des processus ISO 9001 pour POPILOT
// Ces processus correspondent aux tâches définies dans testData.ts

export interface ProcessData {
  id: string;
  projectId: string;
  type: 'pilotage' | 'realisation' | 'support' | 'qualite' | 'amelioration' | 'indicateurs';
  title: string;
  objective: string;
  trigger?: string;
  responsible: string;
  contributors: string[];
  linkedTasks?: string[]; // IDs des tâches liées
  assignedTo?: string[]; // IDs des personnes assignées
  steps: {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    validatedBy?: string;
    validatedAt?: string;
    taskId?: string; // Lien vers une tâche POPILOT existante
  }[];
  deliverables: string[];
  validationCriteria: string[];
  risks: string[];
  improvementLink?: string;
  status: 'todo' | 'in-progress' | 'done';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// Processus de test pour le projet POPY
export const TEST_PROCESSES: ProcessData[] = [
  // PROCESSUS 1 - PILOTAGE : Définition vision produit
  {
    id: 'proc-1',
    projectId: 'popy',
    type: 'pilotage',
    title: 'Définition de la vision produit POPY',
    objective: 'Définir clairement la vision et le positionnement du robot éducatif POPY sur le marché',
    trigger: 'Au lancement du projet et à chaque début de phase majeure',
    responsible: 'Emma Bernard',
    contributors: ['Fabio Garcia', 'Sonia Laurent'],
    assignedTo: ['user-5', 'user-6', 'user-7'],
    linkedTasks: ['task-5'],
    steps: [
      { 
        id: 's1-1', 
        title: 'Analyse du marché des robots éducatifs', 
        description: 'Étude de la concurrence et des besoins du marché', 
        status: 'done', 
        validatedBy: 'Emma Bernard', 
        validatedAt: '2025-11-15' 
      },
      { 
        id: 's1-2', 
        title: 'Définition des personas cibles', 
        description: 'Enfants 6-10 ans et parents', 
        status: 'done', 
        validatedBy: 'Emma Bernard', 
        validatedAt: '2025-11-20' 
      },
      { 
        id: 's1-3', 
        title: 'Rédaction de la vision produit', 
        description: 'Document de vision v1.0', 
        status: 'done', 
        validatedBy: 'Emma Bernard', 
        validatedAt: '2025-12-01' 
      },
      { 
        id: 's1-4', 
        title: 'Validation roadmap produit', 
        description: 'Validation des grandes étapes de développement', 
        status: 'in-progress' 
      },
      { 
        id: 's1-5', 
        title: 'Validation GO/NO-GO Prototype V0', 
        description: 'Décision de passage à la phase suivante', 
        status: 'todo',
        taskId: 'task-5' 
      },
    ],
    deliverables: ['Document de vision produit', 'Roadmap produit', 'Fiches personas', 'Décision GO/NO-GO'],
    validationCriteria: ['Validation PO', 'Validation stakeholders', 'Alignement équipe'],
    risks: ['Vision trop floue', 'Désalignement avec le marché', 'Changement de priorités'],
    status: 'in-progress',
    progress: 60,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-17T14:30:00Z',
  },

  // PROCESSUS 2 - PILOTAGE : Planification sprints
  {
    id: 'proc-2',
    projectId: 'popy',
    type: 'pilotage',
    title: 'Planification et suivi des sprints agiles',
    objective: 'Organiser le travail en sprints de 2 semaines avec objectifs clairs et mesurables',
    trigger: 'Tous les 15 jours (fin de sprint)',
    responsible: 'Fabio Garcia',
    contributors: ['Alice Martin', 'Bob Dupont', 'Emma Bernard'],
    assignedTo: ['user-6', 'user-1', 'user-2', 'user-5'],
    linkedTasks: ['task-6'],
    steps: [
      { 
        id: 's2-1', 
        title: 'Rétrospective sprint précédent', 
        description: 'Analyse des réussites et axes d\'amélioration', 
        status: 'done' 
      },
      { 
        id: 's2-2', 
        title: 'Affinage du backlog', 
        description: 'Priorisation et estimation des user stories', 
        status: 'done' 
      },
      { 
        id: 's2-3', 
        title: 'Définition objectifs sprint', 
        description: 'Sprint goal clair et mesurable', 
        status: 'in-progress',
        taskId: 'task-6'
      },
      { 
        id: 's2-4', 
        title: 'Allocation ressources équipe', 
        description: 'Assignation des tâches aux membres', 
        status: 'todo',
        taskId: 'task-6'
      },
      { 
        id: 's2-5', 
        title: 'Daily stand-ups', 
        description: 'Points quotidiens de synchronisation', 
        status: 'todo' 
      },
    ],
    deliverables: ['Sprint backlog', 'Objectifs de sprint', 'Compte-rendus daily', 'Burndown chart'],
    validationCriteria: ['Engagement équipe', 'Objectifs SMART', 'Capacité réaliste'],
    risks: ['Surcharge équipe', 'Objectifs flous', 'Blocages techniques'],
    status: 'in-progress',
    progress: 40,
    createdAt: '2025-11-05T09:00:00Z',
    updatedAt: '2026-01-17T10:00:00Z',
  },

  // PROCESSUS 3 - RÉALISATION : Développement prototype
  {
    id: 'proc-3',
    projectId: 'popy',
    type: 'realisation',
    title: 'Développement du prototype POPY V0',
    objective: 'Créer un prototype fonctionnel du robot avec reconnaissance émotionnelle de base',
    trigger: 'Après validation de la vision produit',
    responsible: 'Alice Martin',
    contributors: ['Bob Dupont', 'David Leroy'],
    assignedTo: ['user-1', 'user-2', 'user-4'],
    linkedTasks: ['task-1', 'task-2', 'task-4'],
    steps: [
      { 
        id: 's3-1', 
        title: 'Sélection des composants hardware', 
        description: 'Caméra, capteurs, moteurs, carte embarquée', 
        status: 'done',
        validatedBy: 'Alice Martin',
        validatedAt: '2025-12-10'
      },
      { 
        id: 's3-2', 
        title: 'Architecture système embarqué', 
        description: 'Design de l\'architecture logicielle', 
        status: 'done',
        validatedBy: 'Alice Martin',
        validatedAt: '2025-12-20'
      },
      { 
        id: 's3-3', 
        title: 'Intégration caméra et capteurs', 
        description: 'Intégration hardware/software', 
        status: 'done',
        validatedBy: 'Alice Martin',
        validatedAt: '2026-01-05'
      },
      { 
        id: 's3-4', 
        title: 'Développement module reconnaissance faciale', 
        description: 'Implémentation du moteur IA de reconnaissance', 
        status: 'in-progress',
        taskId: 'task-1'
      },
      { 
        id: 's3-5', 
        title: 'Développement comportements réactifs', 
        description: 'Réactions du robot aux émotions détectées', 
        status: 'in-progress',
        taskId: 'task-1'
      },
      { 
        id: 's3-6', 
        title: 'Conception interface utilisateur tactile', 
        description: 'Design de l\'interface enfant', 
        status: 'in-progress',
        taskId: 'task-4'
      },
      { 
        id: 's3-7', 
        title: 'Rédaction documentation technique', 
        description: 'Documentation complète du système', 
        status: 'todo',
        taskId: 'task-2'
      },
    ],
    deliverables: ['Prototype V0 fonctionnel', 'Code source', 'Documentation technique', 'Guide d\'installation'],
    validationCriteria: ['Reconnaissance émotionnelle > 80%', 'Temps de réponse < 2s', 'Stabilité système'],
    risks: ['Complexité technique sous-estimée', 'Délais de livraison composants', 'Performance IA insuffisante'],
    status: 'in-progress',
    progress: 57,
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-17T16:45:00Z',
  },

  // PROCESSUS 4 - RÉALISATION : Développement POPILOT
  {
    id: 'proc-4',
    projectId: 'popy',
    type: 'realisation',
    title: 'Développement outil de pilotage POPILOT',
    objective: 'Créer l\'application POPILOT pour gérer le projet POPY selon ISO 9001',
    trigger: 'Besoin d\'un outil de pilotage structuré',
    responsible: 'Alice Martin',
    contributors: ['Bob Dupont'],
    assignedTo: ['user-1', 'user-2'],
    linkedTasks: ['task-11'],
    steps: [
      { 
        id: 's4-1', 
        title: 'Design maquettes Figma POPILOT', 
        description: 'Conception des interfaces utilisateur', 
        status: 'done',
        validatedBy: 'Alice Martin',
        validatedAt: '2026-01-10'
      },
      { 
        id: 's4-2', 
        title: 'Développement modules de base', 
        description: 'Dashboard, projets, tâches, équipe', 
        status: 'done',
        validatedBy: 'Alice Martin',
        validatedAt: '2026-01-15'
      },
      { 
        id: 's4-3', 
        title: 'Module cartographie processus ISO 9001', 
        description: 'Visualisation interactive des processus', 
        status: 'in-progress',
        taskId: 'task-11'
      },
      { 
        id: 's4-4', 
        title: 'Système liaison tâches-processus', 
        description: 'Interconnexion automatique', 
        status: 'in-progress',
        taskId: 'task-11'
      },
      { 
        id: 's4-5', 
        title: 'Tests utilisateurs finaux', 
        description: 'Validation avec l\'équipe projet', 
        status: 'todo',
        taskId: 'task-11'
      },
    ],
    deliverables: ['Application POPILOT fonctionnelle', 'Documentation utilisateur', 'Guide d\'administration'],
    validationCriteria: ['Satisfaction équipe > 8/10', 'Conformité ISO 9001', 'Performance système'],
    risks: ['Complexité fonctionnelle', 'Adoption par l\'équipe', 'Bugs bloquants'],
    status: 'in-progress',
    progress: 85,
    createdAt: '2025-12-15T09:00:00Z',
    updatedAt: '2026-01-17T18:00:00Z',
  },

  // PROCESSUS 5 - SUPPORT : Approvisionnement
  {
    id: 'proc-5',
    projectId: 'popy',
    type: 'support',
    title: 'Approvisionnement composants et ressources',
    objective: 'Garantir la disponibilité des composants hardware dans les délais',
    trigger: 'Lors des besoins en composants identifiés',
    responsible: 'Fabio Garcia',
    contributors: ['Alice Martin'],
    assignedTo: ['user-6', 'user-1'],
    linkedTasks: ['task-7'],
    steps: [
      { 
        id: 's5-1', 
        title: 'Identification besoins V0', 
        description: 'Liste des composants nécessaires', 
        status: 'done' 
      },
      { 
        id: 's5-2', 
        title: 'Sélection fournisseurs', 
        description: 'Recherche et qualification fournisseurs', 
        status: 'done' 
      },
      { 
        id: 's5-3', 
        title: 'Négociation contrats', 
        description: 'Obtenir les meilleures conditions', 
        status: 'done' 
      },
      { 
        id: 's5-4', 
        title: 'Passation commandes', 
        description: 'Commandes officielles', 
        status: 'done' 
      },
      { 
        id: 's5-5', 
        title: 'Suivi livraisons', 
        description: 'Tracking et réception', 
        status: 'in-progress',
        taskId: 'task-7' 
      },
    ],
    deliverables: ['Composants livrés', 'Contrats fournisseurs', 'Bons de commande', 'Certificats de conformité'],
    validationCriteria: ['Livraison dans les délais', 'Qualité conforme', 'Prix négociés'],
    risks: ['Rupture de stock', 'Retards de livraison', 'Qualité non conforme'],
    status: 'in-progress',
    progress: 80,
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-17T11:30:00Z',
  },

  // PROCESSUS 6 - QUALITÉ : Tests et validation
  {
    id: 'proc-6',
    projectId: 'popy',
    type: 'qualite',
    title: 'Tests et validation qualité POPY',
    objective: 'Garantir la qualité et la conformité du robot POPY aux normes',
    trigger: 'À chaque livraison et avant mise en production',
    responsible: 'Sonia Laurent',
    contributors: ['Claire Rousseau', 'Emma Bernard'],
    assignedTo: ['user-7', 'user-3', 'user-5'],
    linkedTasks: ['task-3', 'task-8', 'task-5'],
    steps: [
      { 
        id: 's6-1', 
        title: 'Analyse normes CE applicables', 
        description: 'Identification des normes produits enfants', 
        status: 'done',
        validatedBy: 'Sonia Laurent',
        validatedAt: '2026-01-05'
      },
      { 
        id: 's6-2', 
        title: 'Tests sécurité enfants', 
        description: 'Conformité normes CE', 
        status: 'in-progress',
        taskId: 'task-8' 
      },
      { 
        id: 's6-3', 
        title: 'Tests unitaires moteur IA', 
        description: 'Validation reconnaissance émotionnelle', 
        status: 'done',
        validatedBy: 'Claire Rousseau',
        validatedAt: '2026-01-20',
        taskId: 'task-3' 
      },
      { 
        id: 's6-4', 
        title: 'Tests d\'intégration', 
        description: 'Tests complets du système', 
        status: 'in-progress' 
      },
      { 
        id: 's6-5', 
        title: 'Validation PO finale', 
        description: 'Démonstration et acceptation', 
        status: 'todo',
        taskId: 'task-5' 
      },
    ],
    deliverables: ['Rapports de tests', 'Certificats de conformité', 'Plan de tests', 'PV de validation'],
    validationCriteria: ['Tous les tests passent', 'Conformité CE', 'Validation PO'],
    risks: ['Non-conformité découverte tard', 'Tests incomplets', 'Performance insuffisante'],
    status: 'in-progress',
    progress: 60,
    createdAt: '2025-12-25T14:00:00Z',
    updatedAt: '2026-01-17T15:20:00Z',
  },

  // PROCESSUS 7 - QUALITÉ : Gestion des risques
  {
    id: 'proc-7',
    projectId: 'popy',
    type: 'qualite',
    title: 'Gestion des risques projet POPY',
    objective: 'Identifier, évaluer et traiter les risques du projet de manière proactive',
    trigger: 'Mensuellement et lors d\'événements significatifs',
    responsible: 'Sonia Laurent',
    contributors: ['Fabio Garcia', 'Alice Martin'],
    assignedTo: ['user-7', 'user-6', 'user-1'],
    linkedTasks: ['task-9'],
    steps: [
      { 
        id: 's7-1', 
        title: 'Revue risques existants', 
        description: 'Mise à jour statut des risques', 
        status: 'done' 
      },
      { 
        id: 's7-2', 
        title: 'Identification nouveaux risques', 
        description: 'Brainstorming équipe', 
        status: 'done' 
      },
      { 
        id: 's7-3', 
        title: 'Évaluation impact/probabilité', 
        description: 'Matrice de criticité', 
        status: 'done' 
      },
      { 
        id: 's7-4', 
        title: 'Définition plans de mitigation', 
        description: 'Actions de réduction des risques', 
        status: 'in-progress' 
      },
      { 
        id: 's7-5', 
        title: 'Mise à jour registre des risques', 
        description: 'Documentation formelle', 
        status: 'in-progress',
        taskId: 'task-9' 
      },
    ],
    deliverables: ['Registre des risques', 'Plans de mitigation', 'Matrice de criticité', 'Tableau de bord risques'],
    validationCriteria: ['Tous les risques évalués', 'Plans de mitigation définis', 'Revue mensuelle faite'],
    risks: ['Risques non identifiés', 'Plans de mitigation inefficaces', 'Manque de suivi'],
    status: 'in-progress',
    progress: 70,
    createdAt: '2025-11-10T13:00:00Z',
    updatedAt: '2026-01-17T12:00:00Z',
  },

  // PROCESSUS 8 - AMÉLIORATION : Amélioration continue
  {
    id: 'proc-8',
    projectId: 'popy',
    type: 'amelioration',
    title: 'Amélioration continue du processus projet',
    objective: 'Mettre en œuvre une démarche PDCA pour améliorer continuellement nos processus',
    trigger: 'Fin de chaque sprint et événements significatifs',
    responsible: 'Emma Bernard',
    contributors: ['Fabio Garcia', 'Sonia Laurent', 'Toute l\'équipe'],
    assignedTo: ['user-5', 'user-6', 'user-7'],
    linkedTasks: ['task-10'],
    steps: [
      { 
        id: 's8-1', 
        title: 'Rétrospective Sprint 3', 
        description: 'Session d\'analyse collective', 
        status: 'done',
        validatedBy: 'Emma Bernard',
        validatedAt: '2026-01-18',
        taskId: 'task-10' 
      },
      { 
        id: 's8-2', 
        title: 'Analyse PDCA', 
        description: 'Plan-Do-Check-Act', 
        status: 'done',
        validatedBy: 'Emma Bernard',
        validatedAt: '2026-01-18',
        taskId: 'task-10' 
      },
      { 
        id: 's8-3', 
        title: 'Définition plan d\'actions', 
        description: 'Actions concrètes d\'amélioration', 
        status: 'in-progress' 
      },
      { 
        id: 's8-4', 
        title: 'Mise en œuvre actions', 
        description: 'Déploiement des améliorations', 
        status: 'todo' 
      },
      { 
        id: 's8-5', 
        title: 'Mesure de l\'efficacité', 
        description: 'Évaluation des résultats', 
        status: 'todo' 
      },
    ],
    deliverables: ['Comptes-rendus rétrospectives', 'Plans d\'actions', 'Indicateurs d\'amélioration', 'Base de connaissances'],
    validationCriteria: ['Participation équipe > 80%', 'Actions concrètes identifiées', 'Suivi régulier'],
    risks: ['Manque d\'engagement', 'Actions non suivies', 'Amélioration non mesurée'],
    status: 'in-progress',
    progress: 40,
    createdAt: '2025-11-15T11:00:00Z',
    updatedAt: '2026-01-18T17:00:00Z',
  },

  // PROCESSUS 9 - INDICATEURS : Suivi de la performance
  {
    id: 'proc-9',
    projectId: 'popy',
    type: 'indicateurs',
    title: 'Tableau de bord KPI du projet POPY',
    objective: 'Mesurer et piloter la performance du projet via des indicateurs clés',
    trigger: 'Mise à jour mensuelle',
    responsible: 'Fabio Garcia',
    contributors: ['Emma Bernard', 'Sonia Laurent'],
    assignedTo: ['user-6', 'user-5', 'user-7'],
    linkedTasks: ['task-12'],
    steps: [
      { 
        id: 's9-1', 
        title: 'Définition des KPI projet', 
        description: 'Sélection des indicateurs pertinents', 
        status: 'done' 
      },
      { 
        id: 's9-2', 
        title: 'Mise en place collecte données', 
        description: 'Automatisation et sources de données', 
        status: 'done' 
      },
      { 
        id: 's9-3', 
        title: 'Collecte données KPI', 
        description: 'Extraction mensuelle', 
        status: 'done',
        taskId: 'task-12' 
      },
      { 
        id: 's9-4', 
        title: 'Mise à jour dashboard', 
        description: 'Actualisation des visualisations', 
        status: 'in-progress',
        taskId: 'task-12' 
      },
      { 
        id: 's9-5', 
        title: 'Présentation aux stakeholders', 
        description: 'Comité de pilotage mensuel', 
        status: 'todo',
        taskId: 'task-12' 
      },
    ],
    deliverables: ['Dashboard KPI', 'Rapport mensuel', 'Analyse de tendances', 'Plans d\'action'],
    validationCriteria: ['KPI à jour', 'Présentation faite', 'Actions définies si dérives'],
    risks: ['Données incomplètes', 'Indicateurs non pertinents', 'Manque de réactivité'],
    status: 'in-progress',
    progress: 60,
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2026-01-17T13:00:00Z',
  },
];

// Fonction pour obtenir les processus d'un projet
export function getProcessesByProject(projectId: string): ProcessData[] {
  return TEST_PROCESSES.filter(process => process.projectId === projectId);
}

// Fonction pour obtenir un processus par ID
export function getProcessById(processId: string): ProcessData | undefined {
  return TEST_PROCESSES.find(process => process.id === processId);
}

// Fonction pour obtenir les processus par type
export function getProcessesByType(type: ProcessData['type']): ProcessData[] {
  return TEST_PROCESSES.filter(process => process.type === type);
}
