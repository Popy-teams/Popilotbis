export type DashboardTab = 'overview' | 'tasks' | 'goals' | 'agenda' | 'assistant';

export type DashboardPageMode = 'list' | 'declare-blockage';

export type DashboardTaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type DashboardTaskPriority = 'low' | 'medium' | 'high';
export type BlockageImpact = 'low' | 'medium' | 'high' | 'critical';

export interface DashboardTask {
  id: number;
  title: string;
  project: string;
  status: DashboardTaskStatus;
  priority: DashboardTaskPriority;
  dueDate: string;
  progress: number;
}

export interface DashboardObjective {
  id: number;
  name: string;
  progress: number;
  target: number;
  deadline: string;
}

export interface DashboardTrophy {
  name: string;
  earnedAt: string;
}

export interface DashboardMeeting {
  id: number;
  title: string;
  date: string;
  time: string;
  participants: number;
}

export interface DashboardAction {
  id: number;
  from: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'done';
}

export interface DashboardUserData {
  workload: number;
  tasks: DashboardTask[];
  objectives: DashboardObjective[];
  trophies: DashboardTrophy[];
  meetings: DashboardMeeting[];
  actions: DashboardAction[];
}

export interface DashboardStats {
  inProgress: number;
  completed: number;
  urgent: number;
  workload: number;
  pendingActions: number;
  upcomingMeetings: number;
}

export interface BlockageFormValues {
  taskId: string;
  description: string;
  impact: BlockageImpact;
  proposedSolution: string;
}
