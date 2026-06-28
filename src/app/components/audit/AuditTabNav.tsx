import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Download, LayoutDashboard, Shield } from 'lucide-react';
import type { AuditTab } from '../../types/audit';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../shared';

const TAB_CONFIG: {
  id: AuditTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutDashboard },
  { id: 'blocks', label: 'Blocs ISO', mobileLabel: 'Blocs', icon: Shield },
  { id: 'actions', label: "Plan d'actions", mobileLabel: 'Actions', icon: ClipboardList },
  { id: 'export', label: 'Export', mobileLabel: 'Export', icon: Download },
];

interface AuditTabNavProps {
  activeTab: AuditTab;
  onChange: (tab: AuditTab) => void;
  actionCount: number;
}

export function AuditTabNav({ activeTab, onChange, actionCount }: AuditTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <FormSelect
          id="audit-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as AuditTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.id === 'actions' && actionCount > 0 ? ` (${actionCount})` : ''}
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
              {tab.id === 'actions' && actionCount > 0 ? ` (${actionCount})` : ''}
            </ViewTabBtn>
          ))}
        </ViewTabPills>
      </div>
    </>
  );
}
