import { useState } from 'react';
import {
  Calendar,
  Eye,
  History,
  Link2,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import type { DocumentCategoryDef, ISODocument } from '../../types/documents';
import { getDocumentCategoryLabel } from '../../types/documents';
import { formatFileSize } from '../../data/documentationHelpers';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell } from '../shared';
import { DocumentPreviewPanel } from './DocumentPreviewPanel';
import {
  formatDocDate,
  getCategoryBadgeClass,
  getCategoryIcon,
  getDocumentLinkSummary,
  getDocumentTypeColor,
  getDocumentTypeLabel,
  getFileIcon,
  statusBadgeClass,
  statusLabel,
} from './documentationPresentation';

type DetailTab = 'preview' | 'info' | 'history' | 'links';

interface DocumentDetailPageProps {
  doc: ISODocument;
  categories: DocumentCategoryDef[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showPreviewModal: boolean;
  onOpenPreviewModal: () => void;
  onClosePreviewModal: () => void;
}

export function DocumentDetailPage({
  doc,
  categories,
  onBack,
  onEdit,
  onDelete,
  showPreviewModal,
  onOpenPreviewModal,
  onClosePreviewModal,
}: DocumentDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>('preview');
  const cat = categories.find((c) => c.id === doc.category);
  const CatIcon = getCategoryIcon(doc.category);
  const FileIcon = getFileIcon(doc);
  const links = getDocumentLinkSummary(doc);

  return (
    <ViewShell>
      <PageBackHeader
        title={doc.title}
        subtitle={`${getDocumentCategoryLabel(doc.category, categories)} · v${doc.version}`}
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button type="button" onClick={onOpenPreviewModal} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm font-medium">
              <Eye className="w-4 h-4" /> Plein écran
            </button>
            <button type="button" onClick={onEdit} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 bg-white rounded-lg hover:bg-stone-50 text-sm text-stone-900">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
            <button type="button" onClick={onDelete} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 bg-red-50 text-red-900 rounded-lg hover:bg-red-100 text-sm">
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        }
      />

      <div className="rounded-xl border border-stone-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 flex flex-wrap gap-3 items-center">
        <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-sm">
          <FileIcon className="w-8 h-8 text-blue-800" />
        </div>
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${statusBadgeClass(doc.status)}`}>
            {statusLabel(doc.status)}
          </span>
          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getDocumentTypeColor(doc.type)}`}>
            {getDocumentTypeLabel(doc.type, doc.customTypeLabel)}
          </span>
          {doc.isCritical ? (
            <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-900 border border-red-200">
              Critique
            </span>
          ) : null}
          {cat ? (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryBadgeClass(cat)}`}>
              <CatIcon className="w-3.5 h-3.5" />
              {cat.label}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200 overflow-x-auto">
        <TabBtn active={tab === 'preview'} onClick={() => setTab('preview')} label="Aperçu" />
        <TabBtn active={tab === 'info'} onClick={() => setTab('info')} label="Informations" />
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')} label="Historique" />
        <TabBtn active={tab === 'links'} onClick={() => setTab('links')} label="Liens" />
      </div>

      {tab === 'preview' ? (
        <div className="min-h-[360px] lg:min-h-[520px]">
          <DocumentPreviewPanel doc={doc} open embedded onClose={() => {}} />
        </div>
      ) : null}

      {tab === 'info' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="Description" icon={FileIcon}>
            {doc.description ? <p className="text-sm text-stone-700 leading-relaxed">{doc.description}</p> : <p className="text-sm text-stone-500 italic">Aucune description</p>}
          </InfoCard>
          <InfoCard title="Métadonnées" icon={Calendar}>
            <dl className="space-y-3 text-sm">
              <Row icon={User} label="Responsable" value={doc.responsibleName ?? '—'} />
              <Row label="Créé le" value={formatDocDate(doc.createdAt)} />
              <Row label="Mis à jour" value={formatDocDate(doc.updatedAt)} />
              {doc.validUntil ? <Row label="Valide jusqu'au" value={formatDocDate(doc.validUntil)} /> : null}
              {doc.validatedBy ? <Row label="Validé par" value={`${doc.validatedBy}${doc.validatedAt ? ` · ${formatDocDate(doc.validatedAt)}` : ''}`} /> : null}
            </dl>
          </InfoCard>
          {doc.file ? (
            <InfoCard title="Fichier joint" icon={FileIcon} className="md:col-span-2">
              <p className="font-medium text-stone-900 break-all">{doc.file.fileName}</p>
              <p className="text-xs text-stone-600 mt-1">{doc.file.mimeType} · {formatFileSize(doc.file.size)}</p>
            </InfoCard>
          ) : null}
        </div>
      ) : null}

      {tab === 'history' ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
          {doc.history.length === 0 ? (
            <p className="text-sm text-stone-500 flex items-center gap-2">
              <History className="w-4 h-4" /> Aucune entrée d&apos;historique pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {doc.history.map((h, i) => (
                <li key={i} className="flex gap-3 text-sm border-l-2 border-blue-300 pl-4">
                  <div>
                    <p className="font-semibold text-stone-900">v{h.version} · {h.author}</p>
                    <p className="text-xs text-stone-500">{formatDocDate(h.date)}</p>
                    <p className="text-stone-700 mt-1">{h.changes}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === 'links' ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 space-y-4">
          <p className="text-sm text-stone-700 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-700" />
            {links.total > 0 ? `${links.total} lien(s) projet actif(s)` : 'Aucun lien configuré'}
          </p>
          <div className="flex flex-wrap gap-2">
            {links.stage ? <LinkChip label="Étape pipeline" color="purple" /> : null}
            {links.tasks > 0 ? <LinkChip label={`${links.tasks} tâche(s)`} color="blue" /> : null}
            {links.decisions > 0 ? <LinkChip label={`${links.decisions} décision(s)`} color="green" /> : null}
            {links.risks > 0 ? <LinkChip label={`${links.risks} risque(s)`} color="red" /> : null}
            {links.total === 0 ? <span className="text-sm text-stone-500">Modifiez le document pour lier une étape pipeline.</span> : null}
          </div>
          {doc.tags?.length ? (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-xs">{t}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <DocumentPreviewPanel doc={doc} open={showPreviewModal} onClose={onClosePreviewModal} />
    </ViewShell>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
        active ? 'bg-white text-blue-900 shadow-sm border border-stone-200' : 'text-stone-600'
      }`}
    >
      {label}
    </button>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  icon: typeof FileIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm ${className}`}>
      <h3 className="font-semibold text-stone-900 text-sm mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-700" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      {Icon ? <Icon className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" /> : <span className="w-4" />}
      <div>
        <dt className="text-stone-500 text-xs">{label}</dt>
        <dd className="font-medium text-stone-900">{value}</dd>
      </div>
    </div>
  );
}

function LinkChip({ label, color }: { label: string; color: 'purple' | 'blue' | 'green' | 'red' }) {
  const map = {
    purple: 'bg-purple-100 text-purple-900 border-purple-200',
    blue: 'bg-blue-100 text-blue-900 border-blue-200',
    green: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    red: 'bg-red-100 text-red-900 border-red-200',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${map[color]}`}>{label}</span>;
}
