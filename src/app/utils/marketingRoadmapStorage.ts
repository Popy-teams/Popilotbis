import { ROADMAP_PHASES } from '../data/marketingDemoData';
import {
  MARKETING_ROADMAP_STORAGE_KEY,
  type MarketingPhase,
  type RoadmapByProject,
  type RoadmapPhase,
} from '../types/marketing';

const PHASE_THEMES: Record<MarketingPhase, Pick<RoadmapPhase, 'chipClass' | 'activeBorder'>> = {
  year1: {
    chipClass: 'bg-amber-50 text-amber-800 border-amber-200',
    activeBorder: 'border-amber-400 bg-amber-50/50',
  },
  year2: {
    chipClass: 'bg-orange-50 text-orange-800 border-orange-200',
    activeBorder: 'border-orange-400 bg-orange-50/50',
  },
  year3: {
    chipClass: 'bg-blue-50 text-blue-800 border-blue-200',
    activeBorder: 'border-blue-400 bg-blue-50/50',
  },
  'year4-5': {
    chipClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    activeBorder: 'border-emerald-400 bg-emerald-50/50',
  },
};

export function applyPhaseTheme(phase: RoadmapPhase): RoadmapPhase {
  const theme = PHASE_THEMES[phase.id];
  return { ...phase, ...theme };
}

export function loadRoadmapForProject(projectId: string): RoadmapPhase[] {
  try {
    const raw = localStorage.getItem(MARKETING_ROADMAP_STORAGE_KEY);
    if (!raw) return ROADMAP_PHASES.map(applyPhaseTheme);
    const store = JSON.parse(raw) as RoadmapByProject;
    const saved = store[projectId];
    if (!saved?.length) return ROADMAP_PHASES.map(applyPhaseTheme);
    return saved.map(applyPhaseTheme);
  } catch {
    return ROADMAP_PHASES.map(applyPhaseTheme);
  }
}

export function saveRoadmapForProject(projectId: string, phases: RoadmapPhase[]) {
  try {
    const raw = localStorage.getItem(MARKETING_ROADMAP_STORAGE_KEY);
    const store: RoadmapByProject = raw ? (JSON.parse(raw) as RoadmapByProject) : {};
    store[projectId] = phases.map(applyPhaseTheme);
    localStorage.setItem(MARKETING_ROADMAP_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}
