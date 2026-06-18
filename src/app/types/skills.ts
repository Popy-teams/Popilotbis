// Types pour les compétences et l'onboarding

export interface Skill {
  id: string;
  name: string;
  domain: SkillDomain;
  description?: string;
}

export type SkillDomain =
  | 'technique'
  | 'qualite'
  | 'gestion'
  | 'ia'
  | 'hardware'
  | 'software'
  | 'communication'
  | 'leadership';

export type SkillLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert';

export interface MemberSkill {
  skillId: string;
  skillName: string;
  domain: SkillDomain;
  level: SkillLevel;
  acquiredDate?: string;
  acquiredVia?: string; // ID de la tâche ou formation
  lastUsed?: string;
}

export interface TaskRequiredSkill {
  skillId: string;
  skillName: string;
  minLevel: SkillLevel;
}

export interface OnboardingPlan {
  id: string;
  memberId: string;
  memberName: string;
  startDate: string;
  status: 'in-progress' | 'completed';
  progress: number;
  tasks: OnboardingTask[];
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'setup' | 'training' | 'practice';
  estimatedDuration: number; // en heures
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface TeamMemberExtended {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  phone?: string;
  workload: number;
  availability: 'Disponible' | 'Occupé' | 'Surchargé';
  
  // Nouveau : compétences
  skills: MemberSkill[];
  
  // Nouveau : onboarding
  joinDate: string;
  experienceLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
  onboardingPlan?: OnboardingPlan;
  
  // Nouveau : progression
  completedTasks: number;
  totalTasks: number;
  objectives: PersonalObjective[];
  trophies: Trophy[];
  
  // Projets
  projects: string[];
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

export function getSkillLevelLabel(level: SkillLevel): string {
  const labels: Record<SkillLevel, string> = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
    expert: 'Expert',
  };
  return labels[level];
}

export function getSkillLevelColor(level: SkillLevel): string {
  const colors: Record<SkillLevel, string> = {
    debutant: 'bg-gray-100 text-gray-700',
    intermediaire: 'bg-blue-100 text-blue-700',
    avance: 'bg-purple-100 text-purple-700',
    expert: 'bg-yellow-100 text-yellow-700',
  };
  return colors[level];
}

export function getSkillDomainIcon(domain: SkillDomain): string {
  const icons: Record<SkillDomain, string> = {
    technique: '⚙️',
    qualite: '✅',
    gestion: '📊',
    ia: '🤖',
    hardware: '🔧',
    software: '💻',
    communication: '💬',
    leadership: '👑',
  };
  return icons[domain];
}

// Calcul du niveau suivant
export function getNextSkillLevel(current: SkillLevel): SkillLevel | null {
  const order: SkillLevel[] = ['debutant', 'intermediaire', 'avance', 'expert'];
  const currentIndex = order.indexOf(current);
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
}

// Calcul de la progression vers le niveau suivant
export function calculateSkillProgress(
  memberSkill: MemberSkill,
  completedTasksWithSkill: number
): number {
  const thresholds: Record<SkillLevel, number> = {
    debutant: 3,
    intermediaire: 8,
    avance: 15,
    expert: 25,
  };
  
  const nextLevel = getNextSkillLevel(memberSkill.level);
  if (!nextLevel) return 100;
  
  const threshold = thresholds[nextLevel];
  return Math.min((completedTasksWithSkill / threshold) * 100, 100);
}
