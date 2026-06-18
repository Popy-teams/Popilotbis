import { TEST_TASKS } from '../data/testData';
import { INITIAL_PIPELINE } from '../data/initialPipeline';
import { INITIAL_DOCUMENTS } from '../components/DocumentationView';
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
import { mergeDemoData } from './demoDataMerge';

const SEED_VERSION_KEY = 'popilot:demo-seed-version';
const CURRENT_SEED_VERSION = '4';

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

/** Injecte les fixtures multi-projets (idempotent, sans écraser les données existantes). */
export function seedMultiProjectDemoData() {
  try {
    const version = localStorage.getItem(SEED_VERSION_KEY);
    if (version === CURRENT_SEED_VERSION) return;

    mergeStorage('popilot:tasks-local', [...TEST_TASKS, ...DEMO_TASKS_BY_PROJECT]);
    mergeStorage('popilot:risks-local', DEMO_RISKS_BY_PROJECT);
    mergeStorage('popilot:meetings-local', DEMO_MEETINGS_BY_PROJECT);
    mergeStorage('popilot:pipeline-local', [...INITIAL_PIPELINE, ...DEMO_PIPELINE_BY_PROJECT]);
    mergeStorage('popilot:docs-local', INITIAL_DOCUMENTS);
    mergeStorage('popilot:veille-local', DEMO_VEILLE_BY_PROJECT);
    mergeStorage('popilot:marketing-local', DEMO_MARKETING_BY_PROJECT);
    mergeStorage('popilot:satisfaction-local', DEMO_SATISFACTION_BY_PROJECT);
    mergeStorage('popilot:dashboard-alerts-local', DEMO_ALERTS_BY_PROJECT);
    mergeStorage('popilot:budget-bom-local', DEMO_BOM_BY_PROJECT);
    mergeStorage(
      'popilot:calendar-events',
      DEMO_CALENDAR_BY_PROJECT.map((e) => ({ ...e, date: e.date }))
    );

    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
  } catch {
    // localStorage indisponible
  }
}

export { mergeDemoData };
