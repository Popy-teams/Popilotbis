import { INITIAL_PIPELINE } from '../data/initialPipeline';
import { TEST_TASKS, calculateTaskProgress, type TestTask } from '../data/testData';
import { DEMO_PIPELINE_BY_PROJECT, DEMO_RISKS_BY_PROJECT, DEMO_TASKS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from './demoDataMerge';
import type { PipelineStage } from '../types/planning';
import type { ISODocument } from '../types/documents';
import { isCriticalDocumentMissing } from '../types/documents';
import type { Risk } from '../types/risks';

export const PIPELINE_STORAGE_KEY = 'popilot:pipeline-local';
export const TASKS_STORAGE_KEY = 'popilot:tasks-local';
export const DOCS_STORAGE_KEY = 'popilot:docs-local';
export const RISKS_STORAGE_KEY = 'popilot:risks-local';

export interface StageGateResult {
  progress: number;
  status: PipelineStage['status'];
  canAdvance: boolean;
  blockers: string[];
  linkedTaskIds: string[];
}

export function loadPipelineStages(): PipelineStage[] {
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as PipelineStage[]) : [];
    return mergeDemoData(saved, DEMO_PIPELINE_BY_PROJECT, INITIAL_PIPELINE);
  } catch {
    return [...INITIAL_PIPELINE];
  }
}

export function savePipelineStages(stages: PipelineStage[]): void {
  try {
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(stages));
    window.dispatchEvent(new CustomEvent('popilot:pipeline-updated'));
  } catch {
    // ignore
  }
}

export function loadAllTasks(): TestTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as TestTask[]) : [];
    return mergeDemoData(saved, DEMO_TASKS_BY_PROJECT, TEST_TASKS);
  } catch {
    return [...TEST_TASKS];
  }
}

export function loadAllDocuments(): ISODocument[] {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ISODocument[];
  } catch {
    // ignore
  }
  return [];
}

export function loadAllRisks(): Risk[] {
  try {
    const raw = localStorage.getItem(RISKS_STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Risk[]) : [];
    return mergeDemoData(saved, DEMO_RISKS_BY_PROJECT);
  } catch {
    return [...DEMO_RISKS_BY_PROJECT];
  }
}

function collectLinkedTaskIds(stage: PipelineStage, tasks: TestTask[]): string[] {
  const fromField = tasks.filter((t) => t.stageId === stage.id).map((t) => t.id);
  return [...new Set([...stage.tasks, ...fromField])];
}

export function evaluateStage(
  stage: PipelineStage,
  tasks: TestTask[],
  documents: ISODocument[]
): StageGateResult {
  const linkedTaskIds = collectLinkedTaskIds(stage, tasks);
  const linkedTasks = tasks.filter((t) => linkedTaskIds.includes(t.id));
  const blockers: string[] = [];

  let progress = stage.progress;
  if (linkedTasks.length > 0) {
    progress = Math.round(
      linkedTasks.reduce((sum, t) => sum + calculateTaskProgress(t), 0) / linkedTasks.length
    );
  }

  const hasBlockedTask = linkedTasks.some((t) => t.status === 'blocked');
  if (hasBlockedTask) {
    blockers.push('Une ou plusieurs tâches liées sont bloquées');
  }

  const pendingTasks = linkedTasks.filter((t) => t.status !== 'done');
  if (linkedTasks.length > 0 && pendingTasks.length > 0) {
    blockers.push(`${pendingTasks.length} tâche(s) non terminée(s)`);
  }

  const { missing, missingDocs } = isCriticalDocumentMissing(documents, stage.id);
  if (missing) {
    blockers.push(`Documents critiques manquants : ${missingDocs.join(', ')}`);
  }

  let status: PipelineStage['status'] = 'not-started';
  if (hasBlockedTask) {
    status = 'blocked';
  } else if (linkedTasks.length > 0 && pendingTasks.length === 0 && !missing) {
    status = 'completed';
    progress = 100;
  } else if (progress > 0) {
    status = 'in-progress';
  }

  const canAdvance = blockers.length === 0 && linkedTasks.length > 0;

  return { progress, status, canAdvance, blockers, linkedTaskIds };
}

export function syncStage(
  stage: PipelineStage,
  tasks: TestTask[],
  documents: ISODocument[]
): PipelineStage {
  const gate = evaluateStage(stage, tasks, documents);
  return {
    ...stage,
    tasks: gate.linkedTaskIds,
    progress: gate.progress,
    status: gate.status,
  };
}

export function syncAllPipelineStages(
  stages: PipelineStage[],
  tasks: TestTask[],
  documents: ISODocument[]
): PipelineStage[] {
  return stages.map((stage) => syncStage(stage, tasks, documents));
}

export function applyPipelineSync(
  tasks?: TestTask[],
  documents?: ISODocument[]
): PipelineStage[] {
  const allTasks = tasks ?? loadAllTasks();
  const allDocs = documents ?? loadAllDocuments();
  const stages = loadPipelineStages();
  const synced = syncAllPipelineStages(stages, allTasks, allDocs);
  savePipelineStages(synced);
  return synced;
}

/** Met à jour stageId sur une tâche et synchronise les listes tasks des étapes */
export function linkTaskToPipelineStage(
  taskId: string,
  stageId: string | undefined,
  tasks: TestTask[]
): TestTask[] {
  const previous = tasks.find((t) => t.id === taskId);
  const prevStageId = previous?.stageId;

  const updatedTasks = tasks.map((t) =>
    t.id === taskId ? { ...t, stageId: stageId || undefined } : t
  );

  let stages = loadPipelineStages();
  stages = stages.map((stage) => {
    let taskIds = stage.tasks.filter((id) => id !== taskId);
    if (stageId && stage.id === stageId) {
      taskIds = [...new Set([...taskIds, taskId])];
    }
    return { ...stage, tasks: taskIds };
  });

  if (prevStageId && prevStageId !== stageId) {
    stages = stages.map((stage) =>
      stage.id === prevStageId
        ? { ...stage, tasks: stage.tasks.filter((id) => id !== taskId) }
        : stage
    );
  }

  const synced = syncAllPipelineStages(stages, updatedTasks, loadAllDocuments());
  savePipelineStages(synced);
  return updatedTasks;
}

export function getStageRelatedEntities(
  stageId: string,
  tasks: TestTask[],
  documents: ISODocument[],
  risks: Risk[]
) {
  const stageTasks = tasks.filter((t) => t.stageId === stageId);
  const stageDocs = documents.filter((d) => d.linkedTo?.stageId === stageId);
  const stageRisks = risks.filter((r) => r.linkedTo?.stageId === stageId);
  return { tasks: stageTasks, documents: stageDocs, risks: stageRisks };
}

export function removeTaskFromPipeline(taskId: string, tasks: TestTask[]): TestTask[] {
  const nextTasks = tasks.filter((t) => t.id !== taskId);
  const stages = loadPipelineStages().map((stage) => ({
    ...stage,
    tasks: stage.tasks.filter((id) => id !== taskId),
  }));
  const synced = syncAllPipelineStages(stages, nextTasks, loadAllDocuments());
  savePipelineStages(synced);
  return nextTasks;
}

export function getStagesForProject(
  stages: PipelineStage[],
  matchesProject: (ref?: string) => boolean
): PipelineStage[] {
  return stages
    .filter((s) => matchesProject(s.projectId ?? 'popy'))
    .sort((a, b) => a.order - b.order);
}
