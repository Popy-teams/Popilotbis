import type { GanttItem } from '../../types/scrumMeetings';
import { ProjectGanttChart } from './ProjectGanttChart';

interface MeetingGanttPanelProps {
  items: GanttItem[];
  projectName: string;
  title?: string;
}

export function MeetingGanttPanel({
  items,
  projectName,
  title = 'Planning projet — vue annuelle',
}: MeetingGanttPanelProps) {
  return (
    <ProjectGanttChart items={items} projectName={projectName} title={title} />
  );
}
