import type { LucideIcon } from 'lucide-react';
import { BookOpen, LayoutDashboard, Layers } from 'lucide-react';
import type { KpiTab } from '../../types/kpi';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../shared';

const TAB_CONFIG: {
  id: KpiTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutDashboard },
  { id: 'categories', label: 'Par famille', mobileLabel: 'Familles', icon: Layers },
  { id: 'referential', label: 'Référentiel POPY', mobileLabel: 'Référentiel', icon: BookOpen },
];

interface KpiTabNavProps {
  activeTab: KpiTab;
  onChange: (tab: KpiTab) => void;
  kpiCount: number;
}

export function KpiTabNav({ activeTab, onChange, kpiCount }: KpiTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <FormSelect
          id="kpi-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as KpiTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.id === 'categories' ? ` (${kpiCount})` : ''}
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
              {tab.id === 'categories' && kpiCount > 0 ? ` (${kpiCount})` : ''}
            </ViewTabBtn>
          ))}
        </ViewTabPills>
      </div>
    </>
  );
}
