import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PipelineStage } from '../types/planning';
import type { ISODocument } from '../types/documents';
import type { Risk } from '../types/risks';
import type { TestTask } from '../data/testData';
import { useProjectContext } from './ProjectContext';
import {
  applyPipelineSync,
  getStageRelatedEntities,
  getStagesForProject,
  loadAllDocuments,
  loadAllRisks,
  loadAllTasks,
  loadPipelineStages,
  savePipelineStages,
  syncAllPipelineStages,
} from '../utils/pipelineSync';
import { useApi } from '../hooks/useApi';

interface PipelineContextValue {
  stages: PipelineStage[];
  scopedStages: PipelineStage[];
  tasks: TestTask[];
  documents: ISODocument[];
  risks: Risk[];
  refresh: () => void;
  syncFromTasks: (tasks: TestTask[], documents?: ISODocument[]) => void;
  updateStage: (stage: PipelineStage) => void;
  addStage: (stage: PipelineStage) => void;
  removeStage: (id: string) => void;
  getRelatedForStage: (stageId: string) => ReturnType<typeof getStageRelatedEntities>;
}

const PipelineContext = createContext<PipelineContextValue | null>(null);

export function PipelineProvider({ children }: { children: ReactNode }) {
  const { activeProjectSlug, matchesProject, activeProject } = useProjectContext();
  const [stages, setStages] = useState<PipelineStage[]>([]);

  const { data: apiStages, refetch: refetchStages } = useApi<any[]>(activeProject ? `/pipeline/${activeProject.id}` : null);
  const { data: apiTasks, refetch: refetchTasks } = useApi<any[]>('/tasks');
  const { data: apiDocs, refetch: refetchDocs } = useApi<any[]>('/documents');
  const { data: apiRisks, refetch: refetchRisks } = useApi<any[]>('/risks');

  const tasks = useMemo(() => {
    if (!apiTasks) return [];
    return apiTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      projectId: t.project_id,
      projectName: t.project_id,
      assignedTo: t.assigned_to,
      assignedToName: t.assigned_to_name || t.assigned_to,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
      progress: t.progress,
      subtasks: [],
      stageId: null,
      linkedToProcesses: [],
      linkedToProcessSteps: []
    }));
  }, [apiTasks]);
  const documents = useMemo(() => apiDocs || [], [apiDocs]);
  const risks = useMemo(() => apiRisks || [], [apiRisks]);

  useEffect(() => {
    if (apiStages) {
      setStages(
        apiStages.map((s) => ({
          ...s,
          projectId: s.project_id,
          estimatedDuration: s.estimated_duration,
          startDate: s.start_date,
          endDate: s.end_date,
          exitCriteria: s.exit_criteria || [],
          objectives: s.objectives || [],
          deliverables: s.deliverables || []
        }))
      );
    } else {
      setStages([]);
    }
  }, [apiStages]);

  const refresh = useCallback(() => {
    refetchStages();
    refetchTasks();
    refetchDocs();
    refetchRisks();
  }, [refetchStages, refetchTasks, refetchDocs, refetchRisks]);

  const scopedStages = useMemo(
    () => getStagesForProject(stages, matchesProject),
    [stages, matchesProject]
  );

  const syncFromTasks = useCallback((nextTasks: TestTask[], nextDocs?: ISODocument[]) => {
    // Ignoré car désormais géré par l'API
  }, []);

  const updateStage = useCallback(
    async (stage: PipelineStage) => {
      try {
        const res = await fetch(`/api/pipeline/${stage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: stage.name,
            order: stage.order,
            status: stage.status,
            progress: stage.progress,
            objectives: stage.objectives,
            deliverables: stage.deliverables,
            exitCriteria: stage.exitCriteria,
            startDate: stage.startDate,
            endDate: stage.endDate,
            estimatedDuration: stage.estimatedDuration
          })
        });
        if (res.ok) refresh();
      } catch (err) {
        console.error(err);
      }
    },
    [refresh]
  );

  const addStage = useCallback(async (stage: PipelineStage) => {
    try {
      const res = await fetch(`/api/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stage.id,
          projectId: stage.projectId,
          name: stage.name,
          order: stage.order,
          status: stage.status,
          progress: stage.progress,
          objectives: stage.objectives,
          deliverables: stage.deliverables,
          exitCriteria: stage.exitCriteria,
          startDate: stage.startDate,
          endDate: stage.endDate,
          estimatedDuration: stage.estimatedDuration
        })
      });
      if (res.ok) refresh();
    } catch (err) {
      console.error(err);
    }
  }, [refresh]);

  const removeStage = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/pipeline/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
    } catch (err) {
      console.error(err);
    }
  }, [refresh]);

  const getRelatedForStage = useCallback(
    (stageId: string) => getStageRelatedEntities(stageId, tasks, documents, risks),
    [tasks, documents, risks]
  );

  const value = useMemo(
    () => ({
      stages,
      scopedStages,
      tasks,
      documents,
      risks,
      refresh,
      syncFromTasks,
      updateStage,
      addStage,
      removeStage,
      getRelatedForStage,
    }),
    [
      stages,
      scopedStages,
      tasks,
      documents,
      risks,
      refresh,
      syncFromTasks,
      updateStage,
      addStage,
      removeStage,
      getRelatedForStage,
    ]
  );

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipeline() {
  const ctx = useContext(PipelineContext);
  if (!ctx) {
    throw new Error('usePipeline doit être utilisé dans PipelineProvider');
  }
  return ctx;
}
