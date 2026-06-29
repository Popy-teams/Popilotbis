import { Award, BookOpen, CheckCircle, FileText, Link2, Shield } from 'lucide-react';
import type { DocumentCategoryDef, ISODocument } from '../../types/documents';
import { ViewHighlightBanner, ViewStatsGrid } from '../shared';
import { DocStatCard } from './DocStatCard';
import {
  type DocumentationStats,
  formatDocDate,
  getCategoryAccentBar,
  getCategoryBadgeClass,
  getCategoryIcon,
  getDocumentCategoryLabel,
  getDocumentLinkSummary,
  getDocumentTypeLabel,
  hasPreview,
  statusBadgeClass,
  statusLabel,
} from './documentationPresentation';

interface DocumentationOverviewTabProps {
  stats: DocumentationStats;
  documents: ISODocument[];
  categories: DocumentCategoryDef[];
  onGoLibrary: () => void;
  onGoCompliance: () => void;
  onSelectCategory: (id: string) => void;
  onViewDoc: (doc: ISODocument) => void;
  onPreviewDoc: (doc: ISODocument) => void;
}

export function DocumentationOverviewTab({
  stats,
  documents,
  categories,
  onGoLibrary,
  onGoCompliance,
  onSelectCategory,
  onViewDoc,
  onPreviewDoc,
}: DocumentationOverviewTabProps) {
  const recent = [...documents]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const circumference = 553;
  const dash = (stats.healthScore / 100) * circumference;

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <ViewHighlightBanner
        title="Mémoire documentaire projet"
        subtitle={`${stats.total} documents · ${stats.withFile} avec fichier ou contenu · conformité ISO ${stats.complianceRate}%`}
        value={`${stats.healthScore}%`}
        progress={stats.healthScore}
        theme="blue"
      />

      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 sm:p-8 text-white shadow-lg overflow-hidden relative">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center gap-3">
              <Award className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Maturité documentaire</h2>
                <p className="text-blue-100 text-sm">ISO 9001 · traçabilité · preuves projet</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <MiniStat label="Validés" value={String(stats.validated)} />
              <MiniStat label="Brouillons" value={String(stats.draft)} />
              <MiniStat label="Critiques" value={String(stats.critical)} />
              <MiniStat label="Avec fichier" value={String(stats.withFile)} />
            </div>
          </div>
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.2)" strokeWidth="14" fill="none" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="14"
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold">{stats.healthScore}%</span>
              <span className="text-xs text-blue-100">Santé docs</span>
            </div>
          </div>
        </div>
      </div>

      <ViewStatsGrid cols={2} className="sm:hidden">
        <DocStatCard label="Documents" value={String(stats.total)} tone="blue" icon={FileText} />
        <DocStatCard label="Validés" value={String(stats.validated)} tone="good" icon={CheckCircle} />
        <DocStatCard label="Conformité ISO" value={`${stats.complianceRate}%`} tone="violet" icon={Shield} />
        <DocStatCard label="Liens actifs" value={String(documents.filter((d) => getDocumentLinkSummary(d).total > 0).length)} tone="blue" icon={Link2} />
      </ViewStatsGrid>

      <ViewStatsGrid cols={4} className="hidden sm:grid">
        <DocStatCard label="Total documents" value={String(stats.total)} hint="Bibliothèque projet" tone="blue" icon={FileText} />
        <DocStatCard label="Validés" value={String(stats.validated)} hint={`${stats.draft} brouillon(s)`} tone="good" icon={CheckCircle} />
        <DocStatCard label="Conformité ISO" value={`${stats.complianceCompliant}/${stats.complianceTotal}`} hint={`${stats.complianceRate}% conforme`} tone="violet" icon={Shield} />
        <DocStatCard label="Documents critiques" value={String(stats.critical)} hint="Jalons bloquants" tone="critical" icon={Award} />
      </ViewStatsGrid>

      <section className="rounded-xl sm:rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="font-semibold text-stone-900">Par catégorie</h3>
          <button type="button" onClick={onGoLibrary} className="text-sm font-medium text-blue-800 hover:text-blue-950 text-left">
            Ouvrir la bibliothèque →
          </button>
        </div>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {categories.map((cat) => {
            const count = stats.byCategory[cat.id] ?? 0;
            const Icon = getCategoryIcon(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="text-left rounded-xl border border-stone-200 bg-stone-50/50 p-3 hover:border-blue-300 hover:shadow-sm transition-all min-w-0 overflow-hidden relative"
              >
                <div className={cnBar(getCategoryAccentBar(cat.color))} />
                <div className="flex items-center gap-2.5 mt-1">
                  <div className={`p-2 rounded-lg border ${getCategoryBadgeClass(cat)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900 text-sm truncate">{cat.label}</p>
                    <p className="text-xs text-stone-600">{count} document{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl sm:rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            Dernières mises à jour
          </h3>
          <button type="button" onClick={onGoCompliance} className="text-xs sm:text-sm text-blue-800 font-medium">
            ISO →
          </button>
        </div>
        <div className="divide-y divide-stone-100">
          {recent.map((doc) => (
            <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-900 text-sm truncate">{doc.title}</p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {getDocumentTypeLabel(doc.type, doc.customTypeLabel)} · {formatDocDate(doc.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${statusBadgeClass(doc.status)}`}>
                  {statusLabel(doc.status)}
                </span>
                {hasPreview(doc) ? (
                  <button type="button" onClick={() => onPreviewDoc(doc)} className="text-xs text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50">
                    Aperçu
                  </button>
                ) : null}
                <button type="button" onClick={() => onViewDoc(doc)} className="text-xs text-stone-700 font-medium px-2 py-1 rounded-lg hover:bg-stone-100">
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] sm:text-xs text-blue-100">{label}</div>
    </div>
  );
}

function cnBar(gradient: string) {
  return `absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`;
}
