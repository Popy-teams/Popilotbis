import type { ReactNode } from 'react';
import { MyDashboard } from '../components/MyDashboard';
import { Dashboard } from '../components/Dashboard';
import { ProjectsFeature } from '../features/projects/ProjectsFeature';
import { TasksViewWithTestData } from '../components/TasksViewWithTestData';
import { TeamViewWithTestData } from '../components/TeamViewWithTestData';
import { TeamSpaceView } from '../features/team-space/TeamSpaceView';
import { BudgetView } from '../components/BudgetView';
import { MeetingsView } from '../components/MeetingsView';
import { ProcessView } from '../components/ProcessView';
import { PipelineView } from '../components/PipelineView';
import { DocumentationView } from '../components/DocumentationView';
import { RisksView } from '../components/RisksView';
import { Calendar } from '../components/Calendar';
import { VeilleView } from '../components/VeilleView';
import { MarketingStrategyView } from '../components/MarketingStrategyView';
import { SatisfactionView } from '../components/SatisfactionView';
import { AuditView } from '../components/AuditView';
import { KPIView } from '../components/KPIView';
import { PdcaView } from '../components/pdca/PdcaView';
import type { ViewType } from './viewRoutes';

export const VIEW_ELEMENTS: Record<ViewType, ReactNode> = {
  'my-dashboard': <MyDashboard />,
  dashboard: <Dashboard />,
  projects: <ProjectsFeature />,
  process: <ProcessView />,
  pipeline: <PipelineView />,
  tasks: <TasksViewWithTestData />,
  team: <TeamViewWithTestData />,
  'team-space': <TeamSpaceView />,
  meetings: <MeetingsView />,
  calendar: <Calendar />,
  budget: <BudgetView />,
  risks: <RisksView />,
  veille: <VeilleView />,
  marketing: <MarketingStrategyView />,
  satisfaction: <SatisfactionView />,
  audit: <AuditView />,
  kpi: <KPIView />,
  pdca: <PdcaView />,
  documentation: <DocumentationView />,
};
