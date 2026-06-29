import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  FolderTree,
  LayoutGrid,
  Link2,
  List,
  Shield,
} from 'lucide-react';
import type { DocumentationTab } from './documentationPresentation';
import { FormSelect, ViewTabPills, ViewTabBtn } from '../shared';

const TAB_CONFIG: {
  id: DocumentationTab;
  label: string;
  mobileLabel: string;
  icon: typeof BookOpen;
}[] = [
  { id: 'overview', label: "Vue d'ensemble", mobileLabel: 'Vue', icon: LayoutGrid },
  { id: 'library', label: 'Bibliothèque', mobileLabel: 'Docs', icon: BookOpen },
  { id: 'compliance', label: 'Conformité ISO', mobileLabel: 'ISO', icon: Shield },
  { id: 'categories', label: 'Catégories', mobileLabel: 'Catég.', icon: FolderTree },
  { id: 'links', label: 'Traçabilité', mobileLabel: 'Liens', icon: Link2 },
];

interface DocumentationTabNavProps {
  activeTab: DocumentationTab;
  onChange: (tab: DocumentationTab) => void;
  docCount: number;
}

export function DocumentationTabNav({ activeTab, onChange, docCount }: DocumentationTabNavProps) {
  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <>
      <div className="md:hidden w-full min-w-0">
        <FormSelect
          id="doc-tab-select"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as DocumentationTab)}
          leadingIconElement={<ActiveIcon className="w-4 h-4" />}
        >
          {TAB_CONFIG.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.id === 'library' ? ` (${docCount})` : ''}
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
              {tab.id === 'library' && docCount > 0 ? ` (${docCount})` : ''}
            </ViewTabBtn>
          ))}
        </ViewTabPills>
      </div>
    </>
  );
}

export { CheckCircle, Clock, AlertCircle, FileText };
