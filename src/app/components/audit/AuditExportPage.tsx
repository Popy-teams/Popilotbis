import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import type { AuditStats } from '../../types/audit';

interface AuditExportPageProps {
  stats: AuditStats;
  projectName?: string;
  onBack: () => void;
}

export function AuditExportPage({ stats, projectName, onBack }: AuditExportPageProps) {
  return (
    <ViewShell>
      <PageBackHeader
        title="Export rapport d'audit"
        subtitle={projectName ? `ISO 9001 — ${projectName}` : 'ISO 9001'}
        onBack={onBack}
      />

      <div className="max-w-2xl space-y-5">
        <section className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-white p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900 mb-2">Résumé à exporter</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-stone-500">Score global</dt>
              <dd className="font-bold text-indigo-700 text-lg">{stats.globalScore}%</dd>
            </div>
            <div>
              <dt className="text-stone-500">Critères</dt>
              <dd className="font-semibold text-stone-900">{stats.totalCriteria}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Conformes</dt>
              <dd className="font-semibold text-emerald-700">{stats.compliant}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Actions</dt>
              <dd className="font-semibold text-stone-900">{stats.totalActions}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-stone-900">Options d&apos;export</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 cursor-pointer hover:bg-stone-50">
              <input type="checkbox" defaultChecked className="rounded border-stone-300 text-indigo-600" />
              <span className="text-sm text-stone-800">8 blocs d&apos;audit ISO 9001</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 cursor-pointer hover:bg-stone-50">
              <input type="checkbox" defaultChecked className="rounded border-stone-300 text-indigo-600" />
              <span className="text-sm text-stone-800">Plan d&apos;actions consolidé</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 cursor-pointer hover:bg-stone-50">
              <input type="checkbox" defaultChecked className="rounded border-stone-300 text-indigo-600" />
              <span className="text-sm text-stone-800">Preuves et écarts par critère</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <ExportFormat icon={FileText} label="PDF" />
            <ExportFormat icon={FileSpreadsheet} label="Excel" />
            <ExportFormat icon={FileText} label="Word" />
          </div>

          <ActionButton icon={Download} className="w-full justify-center !bg-indigo-600 hover:!bg-indigo-700 !text-white !py-3">
            Générer le rapport
          </ActionButton>
          <p className="text-xs text-center text-stone-400">Export simulé — génération PDF à brancher</p>
        </section>
      </div>
    </ViewShell>
  );
}

function ExportFormat({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 px-4 py-4 text-sm font-medium text-indigo-800 hover:bg-indigo-50"
    >
      <Icon className="w-6 h-6" />
      {label}
    </button>
  );
}
