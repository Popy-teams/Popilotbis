import type { TestTask } from '../data/testData';
import { DEMO_TASKS_BY_PROJECT, DEMO_RISKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from './demoDataMerge';
import { TEST_PROCESSES, type ProcessData } from '../data/testProcesses';
import { INITIAL_RISKS } from '../data/initialRisksData';
import type { Risk } from '../types/risks';
import { MEETINGS_STORAGE_KEY } from './meetingSync';
import { TASKS_STORAGE_KEY, RISKS_STORAGE_KEY } from './pipelineSync';
import { AUDIT_STORAGE_KEY, rehydrateAuditBlocks, type AuditBlockData } from '../data/auditHelpers';
import type { PdcaItem, PdcaPhase, PdcaSnapshot, PdcaPhaseStats } from '../types/pdca';
import { getRoutePath } from '../routes/viewRoutes';
import type { ViewType } from '../routes/viewRoutes';

const KPI_STORAGE_KEY = 'popilot:kpi-local';

interface KpiRecord {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  projectId?: string;
}

interface MeetingRecord {
  id: string;
  title: string;
  status?: string;
  hasReport?: boolean;
  meetingType?: string;
  projectId?: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isDoneStatus(s: string) {
  return s === 'done' || s === 'closed' || s === 'completed' || s === 'accepted';
}

function taskPhase(task: TestTask): PdcaPhase {
  if (task.status === 'todo') return 'plan';
  if (task.status === 'in-progress' || task.status === 'blocked') return 'do';
  if (task.status === 'done') {
    const t = `${task.title} ${task.description}`.toLowerCase();
    if (t.includes('rétro') || t.includes('retro') || t.includes('amélior') || t.includes('pdca') || t.includes('action corrective')) {
      return 'act';
    }
    if (t.includes('audit') || t.includes('kpi') || t.includes('revue') || t.includes('test') || t.includes('vérif')) {
      return 'check';
    }
    return 'do';
  }
  return 'do';
}

function processTypePhase(type: ProcessData['type']): PdcaPhase {
  if (type === 'pilotage') return 'plan';
  if (type === 'realisation' || type === 'support') return 'do';
  if (type === 'qualite' || type === 'indicateurs') return 'check';
  if (type === 'amelioration') return 'act';
  return 'do';
}

function riskPhases(risk: Risk): PdcaPhase[] {
  const phases: PdcaPhase[] = [];
  if (risk.status === 'open') phases.push('plan');
  if (risk.status === 'in-treatment') phases.push('do');
  if (risk.criticality === 'critical' || risk.criticality === 'high') phases.push('check');
  if (risk.status === 'closed' || risk.status === 'accepted') phases.push('act');
  if (phases.length === 0) phases.push('check');
  return phases;
}

function meetingPhase(m: MeetingRecord): PdcaPhase {
  if (m.meetingType === 'review' || m.meetingType === 'retrospective') return m.hasReport ? 'check' : 'do';
  if (m.meetingType === 'planning') return 'plan';
  if (m.hasReport && isDoneStatus(m.status ?? '')) return 'check';
  return 'do';
}

function item(partial: Omit<PdcaItem, 'routePath'> & { moduleId?: ViewType }): PdcaItem {
  return {
    ...partial,
    routePath: partial.moduleId ? getRoutePath(partial.moduleId) : undefined,
  };
}

function computePhaseStats(items: PdcaItem[]): PdcaPhaseStats[] {
  const phases: PdcaPhase[] = ['plan', 'do', 'check', 'act'];
  return phases.map((phase) => {
    const list = items.filter((i) => i.phase === phase);
    const todo = list.filter((i) => i.status === 'todo' || i.status === 'open').length;
    const inProgress = list.filter((i) => i.status === 'in-progress' || i.status === 'blocked').length;
    const done = list.filter((i) => isDoneStatus(i.status)).length;
    const total = list.length;
    return {
      phase,
      total,
      todo,
      inProgress,
      done,
      completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });
}

function buildTrend(): PdcaSnapshot['trend'] {
  const months = ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'];
  const base = { plan: 8, do: 14, check: 6, act: 4 };
  return months.map((month, idx) => ({
    month,
    plan: Math.max(1, base.plan + idx - 2 + (idx % 2)),
    do: Math.max(1, base.do + Math.floor(idx / 2)),
    check: Math.max(1, base.check + (idx > 2 ? 2 : 0)),
    act: Math.max(1, base.act + idx),
  }));
}

function buildModuleCounts(items: PdcaItem[]): PdcaSnapshot['moduleCounts'] {
  const map = new Map<string, { plan: number; do: number; check: number; act: number }>();
  for (const i of items) {
    const key = i.sourceLabel;
    const row = map.get(key) ?? { plan: 0, do: 0, check: 0, act: 0 };
    row[i.phase] += 1;
    map.set(key, row);
  }
  return Array.from(map.entries())
    .map(([module, counts]) => ({ module, ...counts }))
    .sort((a, b) => b.plan + b.do + b.check + b.act - (a.plan + a.do + a.check + a.act))
    .slice(0, 10);
}

export function aggregatePdca(projectSlug: string, matchesProject: (id?: string) => boolean): PdcaSnapshot {
  const items: PdcaItem[] = [];

  const savedTasks = readJson<TestTask[]>(TASKS_STORAGE_KEY, []);
  const tasks = mergeDemoData(
    savedTasks.filter((t) => matchesProject(t.projectId)),
    DEMO_TASKS_BY_PROJECT,
    []
  ).filter((t) => matchesProject(t.projectId));

  for (const task of tasks) {
    items.push(
      item({
        id: `task-${task.id}`,
        phase: taskPhase(task),
        title: task.title,
        description: task.projectName,
        status: task.status,
        source: 'task',
        sourceLabel: 'Tâches',
        moduleId: 'tasks',
        date: task.dueDate,
      })
    );
  }

  const processes = TEST_PROCESSES.filter((p) => matchesProject(p.projectId ?? projectSlug));
  for (const proc of processes) {
    const phase = processTypePhase(proc.type);
    items.push(
      item({
        id: `proc-${proc.id}`,
        phase,
        title: proc.title,
        description: proc.objective,
        status: proc.status === 'done' ? 'done' : proc.status === 'in-progress' ? 'in-progress' : 'todo',
        source: 'process',
        sourceLabel: 'Processus',
        moduleId: 'process',
        date: proc.updatedAt.slice(0, 10),
      })
    );
    for (const step of proc.steps) {
      items.push(
        item({
          id: `step-${step.id}`,
          phase,
          title: step.title,
          description: proc.title,
          status: step.status,
          source: 'process-step',
          sourceLabel: 'Étapes processus',
          moduleId: 'process',
          date: step.validatedAt,
        })
      );
    }
  }

  const savedRisks = readJson<Risk[]>(RISKS_STORAGE_KEY, []);
  const risks = mergeDemoData(
    savedRisks.filter((r) => matchesProject(r.projectId)),
    DEMO_RISKS_BY_PROJECT,
    INITIAL_RISKS
  ).filter((r) => matchesProject(r.projectId ?? projectSlug));

  for (const risk of risks) {
    for (const phase of riskPhases(risk)) {
      items.push(
        item({
          id: `risk-${risk.id}-${phase}`,
          phase,
          title: risk.title,
          description: `${risk.type === 'opportunity' ? 'Opportunité' : 'Risque'} · ${risk.criticality}`,
          status: risk.status === 'in-treatment' ? 'in-progress' : risk.status,
          source: 'risk',
          sourceLabel: 'Risques',
          moduleId: 'risks',
          date: risk.updatedAt,
        })
      );
    }
    for (const action of risk.actions) {
      items.push(
        item({
          id: `risk-action-${action.id}`,
          phase: action.status === 'done' ? 'act' : action.status === 'in-progress' ? 'do' : 'plan',
          title: action.title,
          description: risk.title,
          status: action.status,
          source: 'risk-action',
          sourceLabel: 'Actions risques',
          moduleId: 'risks',
          date: action.dueDate,
        })
      );
    }
  }

  const meetings = readJson<MeetingRecord[]>(MEETINGS_STORAGE_KEY, []).filter((m) =>
    matchesProject(m.projectId ?? projectSlug)
  );
  for (const m of meetings) {
    items.push(
      item({
        id: `meeting-${m.id}`,
        phase: meetingPhase(m),
        title: m.title,
        status: m.hasReport ? 'done' : m.status === 'completed' ? 'done' : 'in-progress',
        source: 'meeting',
        sourceLabel: 'Réunions',
        moduleId: 'meetings',
      })
    );
  }

  const kpis = readJson<KpiRecord[]>(KPI_STORAGE_KEY, []).filter((k) => matchesProject(k.projectId ?? projectSlug));
  for (const kpi of kpis) {
    const onTarget = kpi.currentValue >= kpi.targetValue;
    items.push(
      item({
        id: `kpi-${kpi.id}`,
        phase: onTarget ? 'check' : 'act',
        title: kpi.name,
        description: `${kpi.currentValue} / cible ${kpi.targetValue}`,
        status: onTarget ? 'done' : 'in-progress',
        source: 'kpi',
        sourceLabel: 'KPI',
        moduleId: 'kpi',
      })
    );
  }

  const auditRaw = readJson<unknown[]>(AUDIT_STORAGE_KEY, []);
  const auditBlocks = rehydrateAuditBlocks(auditRaw as Parameters<typeof rehydrateAuditBlocks>[0]);
  for (const block of auditBlocks as AuditBlockData[]) {
    for (const c of block.criteria ?? []) {
      items.push(
        item({
          id: `audit-${block.id}-${c.id}`,
          phase: c.status === 'compliant' ? 'check' : c.status === 'partial' ? 'check' : 'act',
          title: c.title,
          description: block.title,
          status: c.status === 'compliant' ? 'done' : c.status === 'partial' ? 'in-progress' : 'todo',
          source: 'audit',
          sourceLabel: 'Audit ISO',
          moduleId: 'audit',
          date: c.lastReview,
        })
      );
    }
  }

  const byPhase: PdcaSnapshot['byPhase'] = {
    plan: items.filter((i) => i.phase === 'plan'),
    do: items.filter((i) => i.phase === 'do'),
    check: items.filter((i) => i.phase === 'check'),
    act: items.filter((i) => i.phase === 'act'),
  };

  const phaseStats = computePhaseStats(items);
  const avgCompletion =
    phaseStats.length === 0 ? 0 : Math.round(phaseStats.reduce((a, s) => a + s.completionRate, 0) / phaseStats.length);

  return {
    items,
    byPhase,
    phaseStats,
    moduleCounts: buildModuleCounts(items),
    trend: buildTrend(),
    healthScore: avgCompletion,
  };
}
