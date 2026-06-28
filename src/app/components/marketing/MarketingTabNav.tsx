import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Globe,
  Layers,
  LayoutDashboard,
  Map,
  Megaphone,
} from 'lucide-react';
import type { MarketingTab } from '../../types/marketing';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../shared';

const TAB_CONFIG: {
  id: MarketingTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  count?: (stats: { total: number }) => string | null;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutDashboard },
  {
    id: 'actions',
    label: 'Actions',
    mobileLabel: 'Actions',
    icon: Megaphone,
    count: (s) => ` (${s.total})`,
  },
  { id: 'roadmap', label: 'Roadmap 5 ans', mobileLabel: 'Roadmap', icon: Map },
  { id: 'pillars', label: 'Piliers stratégiques', mobileLabel: 'Piliers', icon: Layers },
  { id: 'digital', label: 'Digital', mobileLabel: 'Digital', icon: Globe },
  { id: 'indicators', label: 'Indicateurs KPI', mobileLabel: 'KPIs', icon: BarChart3 },
];

interface MarketingTabNavProps {
  activeTab: MarketingTab;
  onChange: (tab: MarketingTab) => void;
  stats: { total: number };
}

export function MarketingTabNav({ activeTab, onChange, stats }: MarketingTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      {/* Mobile : menu déroulant pleine largeur */}
      <div className="md:hidden w-full min-w-0">
        <label htmlFor="marketing-tab-select" className="sr-only">
          Section marketing
        </label>
        <FormSelect
          id="marketing-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as MarketingTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => {
            const suffix = tab.count?.(stats) ?? '';
            return (
              <option key={tab.id} value={tab.id}>
                {tab.label}
                {suffix}
              </option>
            );
          })}
        </FormSelect>
      </div>

      {/* Tablette + desktop : onglets */}
      <div className="hidden md:block w-full min-w-0">
        <ViewTabPills>
          {TAB_CONFIG.map((tab) => {
            const suffix = tab.count?.(stats) ?? '';
            return (
              <ViewTabBtn
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => onChange(tab.id)}
                icon={tab.icon}
                mobileLabel={tab.mobileLabel}
              >
                {tab.label}
                {suffix}
              </ViewTabBtn>
            );
          })}
        </ViewTabPills>
      </div>
    </>
  );
}
