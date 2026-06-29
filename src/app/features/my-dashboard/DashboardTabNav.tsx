import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Calendar,
  CheckSquare,
  LayoutGrid,
  Sparkles,
  Target,
} from 'lucide-react';
import type { DashboardTab } from '../../types/dashboard';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../../components/shared';

const TAB_CONFIG: {
  id: DashboardTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  countKey?: 'tasks' | 'goals' | 'agenda';
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutGrid },
  { id: 'tasks', label: 'Mes tâches', mobileLabel: 'Tâches', icon: CheckSquare, countKey: 'tasks' },
  { id: 'goals', label: 'Objectifs', mobileLabel: 'Objectifs', icon: Target, countKey: 'goals' },
  { id: 'agenda', label: 'Agenda', mobileLabel: 'Agenda', icon: Calendar, countKey: 'agenda' },
  { id: 'assistant', label: 'Assistant', mobileLabel: 'Assistant', icon: Bot },
];

interface DashboardTabNavProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  counts: { tasks: number; goals: number; agenda: number };
}

export function DashboardTabNav({ activeTab, onChange, counts }: DashboardTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  const countSuffix = (tab: (typeof TAB_CONFIG)[number]) => {
    if (!tab.countKey) return '';
    const n = counts[tab.countKey];
    return n > 0 ? ` (${n})` : '';
  };

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <FormSelect
          id="dashboard-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as DashboardTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {countSuffix(tab)}
            </option>
          ))}
        </FormSelect>
      </div>
      <div className="hidden md:block w-full min-w-0 overflow-x-auto">
        <ViewTabPills className="lg:flex lg:flex-wrap">
          {TAB_CONFIG.map((tab) => (
            <ViewTabBtn
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onChange(tab.id)}
              icon={tab.icon}
              mobileLabel={tab.mobileLabel}
            >
              {tab.label}
              {countSuffix(tab)}
            </ViewTabBtn>
          ))}
        </ViewTabPills>
      </div>
    </>
  );
}

export { Sparkles };
