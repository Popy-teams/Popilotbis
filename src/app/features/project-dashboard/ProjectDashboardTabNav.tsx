import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Briefcase, LayoutDashboard, Zap } from 'lucide-react';
import type { ProjectDashboardTab } from '../../types/projectDashboard';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../../components/shared';

const TAB_CONFIG: {
  id: ProjectDashboardTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alertes', mobileLabel: 'Alertes', icon: AlertTriangle },
  { id: 'project', label: 'Projet actif', mobileLabel: 'Projet', icon: Briefcase },
  { id: 'actions', label: 'Actions rapides', mobileLabel: 'Actions', icon: Zap },
];

interface ProjectDashboardTabNavProps {
  activeTab: ProjectDashboardTab;
  onChange: (tab: ProjectDashboardTab) => void;
  alertCount: number;
}

export function ProjectDashboardTabNav({
  activeTab,
  onChange,
  alertCount,
}: ProjectDashboardTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <FormSelect
          id="project-dashboard-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as ProjectDashboardTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.id === 'alerts' && alertCount > 0 ? ` (${alertCount})` : ''}
            </option>
          ))}
        </FormSelect>
      </div>
      <div className="hidden md:block w-full min-w-0">
        <ViewTabPills>
          {TAB_CONFIG.map((tab) => (
            <ViewTabBtn
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onChange(tab.id)}
              icon={tab.icon}
              mobileLabel={tab.mobileLabel}
            >
              {tab.label}
              {tab.id === 'alerts' && alertCount > 0 ? ` (${alertCount})` : ''}
            </ViewTabBtn>
          ))}
        </ViewTabPills>
      </div>
    </>
  );
}
