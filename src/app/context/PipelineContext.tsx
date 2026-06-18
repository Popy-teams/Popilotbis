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
  const { matchesProject } = useProjectContext();
  const [stages, setStages] = useState<PipelineStage[]>(() => {
    const loadedTasks = loadAllTasks();
    const loadedDocs = loadAllDocuments();
    return syncAllPipelineStages(loadPipelineStages(), loadedTasks, loadedDocs);
  });
  const [tasks, setTasks] = useState<TestTask[]>(loadAllTasks);
  const [documents, setDocuments] = useState<ISODocument[]>(loadAllDocuments);
  const [risks, setRisks] = useState<Risk[]>(loadAllRisks);

  const refresh = useCallback(() => {
    const loadedTasks = loadAllTasks();
    const loadedDocs = loadAllDocuments();
    const loadedRisks = loadAllRisks();
    const synced = applyPipelineSync(loadedTasks, loadedDocs);
    setTasks(loadedTasks);
    setDocuments(loadedDocs);
    setRisks(loadedRisks);
    setStages(synced);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('popilot:pipeline-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('popilot:pipeline-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [refresh]);

  const scopedStages = useMemo(
    () => getStagesForProject(stages, matchesProject),
    [stages, matchesProject]
  );

  const syncFromTasks = useCallback((nextTasks: TestTask[], nextDocs?: ISODocument[]) => {
    const docs = nextDocs ?? loadAllDocuments();
    const synced = applyPipelineSync(nextTasks, docs);
    setTasks(nextTasks);
    if (nextDocs) setDocuments(nextDocs);
    setStages(synced);
  }, []);

  const updateStage = useCallback(
    (stage: PipelineStage) => {
      setStages((prev) => {
        const next = prev.map((s) => (s.id === stage.id ? stage : s));
        const synced = syncAllPipelineStages(next, tasks, documents);
        savePipelineStages(synced);
        return synced;
      });
    },
    [tasks, documents]
  );

  const addStage = useCallback((stage: PipelineStage) => {
    setStages((prev) => {
      const next = [...prev, stage];
      savePipelineStages(next);
      return next;
    });
  }, []);

  const removeStage = useCallback((id: string) => {
    setStages((prev) => {
      const next = prev.filter((s) => s.id !== id);
      savePipelineStages(next);
      return next;
    });
  }, []);

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
