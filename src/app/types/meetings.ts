// Types supplémentaires pour le système de réunions avancé

export interface MeetingRotation {
  id: string;
  projectId: string;
  membersOrder: string[]; // IDs des membres dans l'ordre
  periodDays: number; // 15 jours par défaut
  startDate: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number; // en minutes
  participants: string[];
  absentMembers?: string[];
  facilitator: string;
  writerId: string; // Auto-calculé via rotation
  writerName?: string;
  agenda: AgendaItem[];
  roundTable: RoundTableEntry[];
  decisions: Decision[];
  actions: Action[];
  nextGoals: string[];
  annexes?: Annexe[];
  status: 'planned' | 'in-progress' | 'completed';
  projectId?: string;
  number?: number; // Numéro de la réunion (ex: #12)
}

export interface AgendaItem {
  id: string;
  title: string;
  objective: string;
  duration?: number;
  presenter?: string;
}

export interface RoundTableEntry {
  memberId: string;
  memberName: string;
  completed: string[]; // ✅ Fait
  inProgress: string[]; // 🚧 En cours
  toDo: string[]; // 📌 À faire
  blockages: string[]; // 🚫 Blocages
}

export interface Decision {
  id: string;
  description: string;
  decidedBy: string;
  date: string;
  impact: 'planning' | 'budget' | 'quality' | 'scope';
  impactDescription?: string;
}

export interface Action {
  id: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  linkedTaskId?: string;
  source: string; // Ex: "CR #12"
}

export interface Annexe {
  id: string;
  type: 'file' | 'link' | 'quote';
  name: string;
  url?: string;
  content?: string;
}

export interface ExtractionSuggestion {
  id: string;
  type: 'UPDATE_TASK' | 'CREATE_TASK' | 'CREATE_DECISION';
  confidence: number; // 0-100
  sourceText: string;
  proposedChanges: {
    taskId?: string;
    taskTitle?: string;
    newStatus?: string;
    owner?: string;
    dueDate?: string;
    description?: string;
  };
  needsReview: boolean;
  accepted?: boolean;
}

// Calcul du rédacteur actuel basé sur la rotation
export function calculateCurrentWriter(
  rotation: MeetingRotation,
  meetingDate: string
): string {
  const startDate = new Date(rotation.startDate);
  const currentDate = new Date(meetingDate);
  const daysDiff = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleIndex = Math.floor(daysDiff / rotation.periodDays) % rotation.membersOrder.length;
  return rotation.membersOrder[cycleIndex];
}

// Calcul du prochain rédacteur
export function calculateNextWriter(
  rotation: MeetingRotation,
  currentWriterId: string
): { nextWriterId: string; startDate: string } {
  const currentIndex = rotation.membersOrder.indexOf(currentWriterId);
  const nextIndex = (currentIndex + 1) % rotation.membersOrder.length;
  const nextWriterId = rotation.membersOrder[nextIndex];
  
  // Calcul de la date de début du prochain rédacteur
  const startDate = new Date(rotation.startDate);
  const currentCycle = Math.floor(
    (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * rotation.periodDays)
  );
  const nextStartDate = new Date(startDate);
  nextStartDate.setDate(startDate.getDate() + (currentCycle + 1) * rotation.periodDays);
  
  return {
    nextWriterId,
    startDate: nextStartDate.toISOString().split('T')[0],
  };
}

// Analyser le texte pour détecter les actions
export function extractActionsFromText(
  text: string,
  speaker: string,
  existingTasks: Task[]
): ExtractionSuggestion[] {
  const suggestions: ExtractionSuggestion[] = [];
  
  // Patterns de détection
  const completionPatterns = [
    /j'ai (demandé|envoyé|terminé|validé|fait|rédigé|préparé)/gi,
    /c'est (fait|terminé|validé)/gi,
    /(terminé|fini|complété|validé)/gi,
  ];
  
  const todoPatterns = [
    /je vais (faire|rédiger|préparer|organiser|contacter)/gi,
    /je dois (faire|rédiger|préparer)/gi,
    /je m'occupe de/gi,
    /à faire\s*:/gi,
  ];

  // Chercher les tâches complétées
  for (const pattern of completionPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Chercher une tâche correspondante
      const matchingTask = existingTasks.find(
        (task) =>
          task.assignedTo === speaker &&
          task.status !== 'done' &&
          text.toLowerCase().includes(task.title.toLowerCase().slice(0, 15))
      );

      if (matchingTask) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random()}`,
          type: 'UPDATE_TASK',
          confidence: 85,
          sourceText: text,
          proposedChanges: {
            taskId: matchingTask.id,
            taskTitle: matchingTask.title,
            newStatus: 'done',
          },
          needsReview: false,
        });
      }
    }
  }

  // Chercher les nouvelles tâches à créer
  for (const pattern of todoPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Extraire l'action
      const actionMatch = text.match(/(?:vais|dois|occupe de)\s+(.+?)(?:\.|$)/i);
      if (actionMatch) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random()}`,
          type: 'CREATE_TASK',
          confidence: 80,
          sourceText: text,
          proposedChanges: {
            taskTitle: actionMatch[1].trim(),
            owner: speaker,
            newStatus: 'todo',
          },
          needsReview: true,
        });
      }
    }
  }

  return suggestions;
}
