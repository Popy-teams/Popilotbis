// Types pour POPILOT - Projet POPY ISO 9001

// Export des types meetings
export * from './meetings';
export * from './documents';
export * from './skills';
export * from './planning';

export interface Project {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  startDate?: string;
  deadline: string;
  team: string[];
  /** IDs des membres autorisés à voir le projet (si isRestricted) */
  participantIds?: string[];
  /** Si true, seuls les participantIds + admin peuvent voir le projet */
  isRestricted?: boolean;
  ownerId?: string;
  objectives?: { name: string; progress: number }[];
  budget: {
    total: number;
    used: number;
    committed?: number;
  };
  owner?: string;
  processes?: Process[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Process {
  id: string;
  name: string;
  description: string;
  responsible: string;
  objectives: string[];
  indicators: Indicator[];
  risks: Risk[];
  status: 'active' | 'inactive' | 'completed';
}

export interface Indicator {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName?: string;
  assignedTo: string;
  assignedToName?: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  blockedReason?: string;
  dependencies?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  phone?: string;
  workload: number;
  projects: string[];
  objectives: PersonalObjective[];
  trophies: Trophy[];
  availability: 'Disponible' | 'Occupé' | 'Surchargé';
}

export interface PersonalObjective {
  id: string;
  name: string;
  description?: string;
  progress: number;
  target: number;
  unit?: string;
  deadline?: string;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  icon: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
  responsible: string;
  status: 'open' | 'mitigated' | 'closed';
  projectId?: string;
}

export interface Blockage {
  id: string;
  taskId: string;
  taskTitle: string;
  reportedBy: string;
  reportedByName: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  proposedSolution?: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface Budget {
  id: string;
  projectId: string;
  projectName: string;
  category: string;
  item: string;
  estimated: number;
  actual: number;
  status: 'pending' | 'approved' | 'spent';
  supplier?: string;
  date: string;
}

export interface POPYProcess {
  id: string;
  name: string;
  description: string;
  responsible: string;
  objectives: string[];
  kpis: {
    name: string;
    target: number;
    current: number;
    unit: string;
  }[];
  risks: string[];
  dependencies: string[];
  phase: 'pilotage' | 'conception' | 'development' | 'tests' | 'industrialisation' | 'support';
}