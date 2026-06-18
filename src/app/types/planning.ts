// Types pour le pipeline et le planning

export interface ProjectPipeline {
  id: string;
  projectId: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  projectId?: string;
  name: string;
  order: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  objectives: string[];
  deliverables: string[];
  exitCriteria: string[];
  tasks: string[]; // IDs des tâches
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number; // en jours
}

export interface GanttTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: number; // en jours
  progress: number;
  assignedTo: string;
  assignedToName?: string;
  dependencies: string[]; // IDs des tâches dont celle-ci dépend
  requiredSkills: TaskRequiredSkill[];
  isCriticalPath: boolean;
  slack: number; // marge en jours
  stageId?: string;
  color?: string;
}

export interface TaskRequiredSkill {
  skillId: string;
  skillName: string;
  minLevel: 'debutant' | 'intermediaire' | 'avance' | 'expert';
}

export interface GanttProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tasks: GanttTask[];
  milestones: GanttMilestone[];
  criticalPath: string[]; // IDs des tâches sur le chemin critique
}

export interface GanttMilestone {
  id: string;
  name: string;
  date: string;
  achieved: boolean;
  description?: string;
  dependencies: string[];
}

export interface ResourceAvailability {
  memberId: string;
  memberName: string;
  availability: {
    date: string;
    hoursAvailable: number;
    hoursAllocated: number;
  }[];
}

// Calcul du chemin critique
export function calculateCriticalPath(tasks: GanttTask[]): string[] {
  // Algorithme simplifié de calcul du chemin critique
  // Dans une vraie implémentation, on utiliserait CPM (Critical Path Method)
  
  const criticalTasks: string[] = [];
  
  // Identifier les tâches sans marge (slack = 0)
  tasks.forEach((task) => {
    if (task.slack === 0 || task.dependencies.length > 0) {
      criticalTasks.push(task.id);
    }
  });
  
  return criticalTasks;
}

// Détection des goulots d'étranglement
export function detectBottlenecks(
  tasks: GanttTask[],
  resources: ResourceAvailability[]
): {
  type: 'resource' | 'dependency' | 'skill';
  description: string;
  affectedTasks: string[];
  severity: 'low' | 'medium' | 'high';
}[] {
  const bottlenecks: any[] = [];
  
  // Détecter les surcharges de ressources
  resources.forEach((resource) => {
    const overloaded = resource.availability.filter(
      (day) => day.hoursAllocated > day.hoursAvailable
    );
    if (overloaded.length > 0) {
      const affectedTasks = tasks
        .filter((t) => t.assignedTo === resource.memberId)
        .map((t) => t.id);
      
      bottlenecks.push({
        type: 'resource',
        description: `${resource.memberName} est surchargé sur ${overloaded.length} jours`,
        affectedTasks,
        severity: overloaded.length > 5 ? 'high' : 'medium',
      });
    }
  });
  
  // Détecter les chaînes de dépendances longues
  tasks.forEach((task) => {
    if (task.dependencies.length >= 3) {
      bottlenecks.push({
        type: 'dependency',
        description: `Tâche "${task.title}" dépend de ${task.dependencies.length} autres tâches`,
        affectedTasks: [task.id],
        severity: 'medium',
      });
    }
  });
  
  return bottlenecks;
}

// Recalcul automatique des dates
export function recalculateDates(
  tasks: GanttTask[],
  changedTaskId: string,
  newEndDate: string
): GanttTask[] {
  // Clone les tâches
  const updatedTasks = [...tasks];
  
  // Trouver la tâche modifiée
  const changedTask = updatedTasks.find((t) => t.id === changedTaskId);
  if (!changedTask) return tasks;
  
  // Mettre à jour la tâche
  changedTask.endDate = newEndDate;
  
  // Propager aux tâches dépendantes
  function propagateDates(taskId: string) {
    const dependentTasks = updatedTasks.filter((t) => t.dependencies.includes(taskId));
    
    dependentTasks.forEach((depTask) => {
      const maxEndDate = depTask.dependencies
        .map((depId) => updatedTasks.find((t) => t.id === depId)?.endDate)
        .filter(Boolean)
        .sort()
        .pop();
      
      if (maxEndDate) {
        const newStart = new Date(maxEndDate);
        newStart.setDate(newStart.getDate() + 1);
        depTask.startDate = newStart.toISOString().split('T')[0];
        
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + depTask.duration);
        depTask.endDate = newEnd.toISOString().split('T')[0];
        
        // Propager récursivement
        propagateDates(depTask.id);
      }
    });
  }
  
  propagateDates(changedTaskId);
  
  return updatedTasks;
}
