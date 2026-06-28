import type { LucideIcon } from 'lucide-react';
import { ClipboardList, LayoutDashboard, MessageSquare } from 'lucide-react';
import type { SatisfactionTab } from '../../types/satisfaction';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../shared';

const TAB_CONFIG: {
  id: SatisfactionTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  count?: (stats: { surveys: number; responses: number }) => string | null;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutDashboard },
  {
    id: 'surveys',
    label: 'Sondages',
    mobileLabel: 'Sondages',
    icon: ClipboardList,
    count: (s) => ` (${s.surveys})`,
  },
  {
    id: 'responses',
    label: 'Réponses',
    mobileLabel: 'Réponses',
    icon: MessageSquare,
    count: (s) => ` (${s.responses})`,
  },
];

interface SatisfactionTabNavProps {
  activeTab: SatisfactionTab;
  onChange: (tab: SatisfactionTab) => void;
  stats: { surveys: number; responses: number };
}

export function SatisfactionTabNav({ activeTab, onChange, stats }: SatisfactionTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <label htmlFor="satisfaction-tab-select" className="sr-only">
          Section satisfaction
        </label>
        <FormSelect
          id="satisfaction-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as SatisfactionTab)}
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
