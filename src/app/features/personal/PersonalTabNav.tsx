import type { LucideIcon } from 'lucide-react';
import { Bell, LayoutGrid, Shield, User } from 'lucide-react';
import type { PersonalTab } from '../../types/personal';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../../components/shared';

const TAB_CONFIG: {
  id: PersonalTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutGrid },
  { id: 'profile', label: 'Informations', mobileLabel: 'Infos', icon: User },
  { id: 'preferences', label: 'Préférences', mobileLabel: 'Préf.', icon: Bell },
  { id: 'security', label: 'Sécurité', mobileLabel: 'Sécu.', icon: Shield },
];

interface PersonalTabNavProps {
  activeTab: PersonalTab;
  onChange: (tab: PersonalTab) => void;
  completion: number;
}

export function PersonalTabNav({ activeTab, onChange, completion }: PersonalTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <FormSelect
          id="personal-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as PersonalTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.id === 'profile' && completion < 100 ? ` (${completion}%)` : ''}
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
              {tab.id === 'profile' && completion < 100 ? ` (${completion}%)` : ''}
            </ViewTabBtn>
          ))}
        </ViewTabPills>
      </div>
    </>
  );
}
