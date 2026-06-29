import { TEST_TASKS } from '../data/testData';
import { INITIAL_PIPELINE } from '../data/initialPipeline';
import { INITIAL_DOCUMENTS } from '../data/documentationDemoData';
import {
  DEMO_ALERTS_BY_PROJECT,
  DEMO_BOM_BY_PROJECT,
  DEMO_CALENDAR_BY_PROJECT,
  DEMO_MARKETING_BY_PROJECT,
  DEMO_MEETINGS_BY_PROJECT,
  DEMO_PIPELINE_BY_PROJECT,
  DEMO_RISKS_BY_PROJECT,
  DEMO_SATISFACTION_BY_PROJECT,
  DEMO_TASKS_BY_PROJECT,
  DEMO_VEILLE_BY_PROJECT,
} from '../data/multiProjectDemoFixtures';
import {
  DEMO_GANTT_IDS,
  DEMO_MEETING_IDS,
  DEMO_MEETING_TASK_IDS,
  INITIAL_GANTT_ITEMS,
  MEETING_DEMO_TASKS,
  POPY_MEETING_DEMO,
} from '../data/meetingDemoData';
import { GANTT_STORAGE_KEY, MEETINGS_STORAGE_KEY } from '../data/initialMeetings';
import {
  buildPlanningCalendarDemo,
  DEMO_PLANNING_CALENDAR_IDS,
} from '../data/planningDemoFixtures';
import { CALENDAR_STORAGE_KEY } from './meetingSync';
import { TASKS_STORAGE_KEY } from './pipelineSync';
import { mergeDemoData } from './demoDataMerge';

const SEED_VERSION_KEY = 'popilot:demo-seed-version';
const CURRENT_SEED_VERSION = '9';

function mergeStorage<T extends { id: string | number }>(key: string, incoming: T[]) {
  if (incoming.length === 0) return;
  try {
    const raw = localStorage.getItem(key);
    const existing: T[] = raw ? JSON.parse(raw) : [];
    const merged = mergeDemoData(existing, incoming);
    if (merged.length !== existing.length) {
      localStorage.setItem(key, JSON.stringify(merged));
    }
  } catch {
    localStorage.setItem(key, JSON.stringify(incoming));
  }
}

/** Remplace les entrées démo par id (pour rafraîchir les fixtures sans effacer les données user) */
function upsertByIds<T extends { id: string | number }>(
  key: string,
  incoming: T[],
  replaceIds: readonly string[]
) {
  if (incoming.length === 0) return;
  try {
    const raw = localStorage.getItem(key);
    const existing: T[] = raw ? JSON.parse(raw) : [];
    const replace = new Set(replaceIds);
    const kept = existing.filter((item) => !replace.has(String(item.id)));
    const incomingMap = new Map(incoming.map((item) => [String(item.id), item]));
    const upserted = [...incoming];
    for (const item of kept) {
      if (!incomingMap.has(String(item.id))) upserted.push(item);
    }
    localStorage.setItem(key, JSON.stringify(upserted));
  } catch {
    localStorage.setItem(key, JSON.stringify(incoming));
  }
}

function seedMeetingDemoBundle() {
  upsertByIds(MEETINGS_STORAGE_KEY, POPY_MEETING_DEMO, DEMO_MEETING_IDS);
  upsertByIds(TASKS_STORAGE_KEY, MEETING_DEMO_TASKS, DEMO_MEETING_TASK_IDS);
  upsertByIds(GANTT_STORAGE_KEY, INITIAL_GANTT_ITEMS, DEMO_GANTT_IDS);
}

function seedPlanningCalendarDemo() {
  upsertByIds(
    CALENDAR_STORAGE_KEY,
    buildPlanningCalendarDemo(),
    DEMO_PLANNING_CALENDAR_IDS
  );
}

/** Injecte les fixtures multi-projets (idempotent, sans écraser les données existantes). */
export function seedMultiProjectDemoData() {
  try {
    const version = localStorage.getItem(SEED_VERSION_KEY);
    if (version === CURRENT_SEED_VERSION) return;

    mergeStorage(TASKS_STORAGE_KEY, [...TEST_TASKS, ...DEMO_TASKS_BY_PROJECT]);
    mergeStorage('popilot:risks-local', DEMO_RISKS_BY_PROJECT);
    mergeStorage(MEETINGS_STORAGE_KEY, DEMO_MEETINGS_BY_PROJECT);
    mergeStorage('popilot:pipeline-local', [...INITIAL_PIPELINE, ...DEMO_PIPELINE_BY_PROJECT]);
    mergeStorage('popilot:docs-local', INITIAL_DOCUMENTS);
    mergeStorage('popilot:veille-local', DEMO_VEILLE_BY_PROJECT);
    mergeStorage('popilot:marketing-local', DEMO_MARKETING_BY_PROJECT);
    mergeStorage('popilot:satisfaction-local', DEMO_SATISFACTION_BY_PROJECT);
    mergeStorage('popilot:dashboard-alerts-local', DEMO_ALERTS_BY_PROJECT);
    mergeStorage('popilot:budget-bom-local', DEMO_BOM_BY_PROJECT);
    mergeStorage(
      CALENDAR_STORAGE_KEY,
      DEMO_CALENDAR_BY_PROJECT.map((e) => ({ ...e, date: e.date }))
    );

    seedMeetingDemoBundle();
    seedPlanningCalendarDemo();

    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
  } catch {
    // localStorage indisponible
  }
}

export { mergeDemoData };
