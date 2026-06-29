import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { DocumentCategoryDef, ISODocument } from '../../types/documents';
import { formatFileSize } from '../../data/documentationHelpers';
import {
  formatDocDate,
  getCategoryAccentBar,
  getCategoryBadgeClass,
  getCategoryIcon,
  getDocumentCategoryLabel,
  getDocumentLinkSummary,
  getDocumentTypeColor,
  getDocumentTypeLabel,
  getFileIcon,
  hasPreview,
  statusBadgeClass,
  statusLabel,
} from './documentationPresentation';

interface DocumentLibraryCardProps {
  doc: ISODocument;
  categories: DocumentCategoryDef[];
  variant: 'grid' | 'list';
  onView: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DocumentLibraryCard({
  doc,
  categories,
  variant,
  onView,
  onPreview,
  onEdit,
  onDelete,
}: DocumentLibraryCardProps) {
  const FileIcon = getFileIcon(doc);
  const links = getDocumentLinkSummary(doc);
  const cat = categories.find((c) => c.id === doc.category);
  const accent = cat ? getCategoryAccentBar(cat.color) : 'from-stone-400 to-slate-500';

  const actions = (
    <div className="flex gap-0.5 shrink-0">
      {hasPreview(doc) ? (
        <ActionBtn onClick={onPreview} title="Aperçu" className="text-blue-800 hover:bg-blue-50">
          <Eye className="w-4 h-4" />
        </ActionBtn>
      ) : null}
      <ActionBtn onClick={onView} title="Détails" className="text-stone-700 hover:bg-stone-100">
        <FileText className="w-4 h-4" />
      </ActionBtn>
      <ActionBtn onClick={onEdit} title="Modifier" className="text-stone-700 hover:bg-stone-100">
        <Pencil className="w-4 h-4" />
      </ActionBtn>
      <ActionBtn onClick={onDelete} title="Supprimer" className="text-red-700 hover:bg-red-50">
        <Trash2 className="w-4 h-4" />
      </ActionBtn>
    </div>
  );

  if (variant === 'list') {
    return (
      <article className="rounded-xl border border-stone-200 bg-white hover:shadow-md transition-all min-w-0 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${accent}`} />
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start gap-3">
          <DocThumb icon={FileIcon} status={doc.status} />
          <div className="min-w-0 flex-1">
            <DocHeader doc={doc} />
            {doc.description ? <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mt-1">{doc.description}</p> : null}
            <DocMeta doc={doc} links={links} />
          </div>
          {actions}
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-stone-200 bg-white hover:shadow-lg transition-all min-w-0 overflow-hidden flex flex-col h-full">
      <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <DocThumb icon={FileIcon} status={doc.status} large />
          {doc.isCritical ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-100 text-red-900 rounded-md text-[10px] font-bold border border-red-200">
              <AlertTriangle className="w-3 h-3" /> Critique
            </span>
          ) : null}
        </div>
        <h4 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-1">{doc.title}</h4>
        <span className={`self-start px-2 py-0.5 rounded-md text-[10px] font-medium mb-2 ${getDocumentTypeColor(doc.type)}`}>
          {getDocumentTypeLabel(doc.type, doc.customTypeLabel)}
        </span>
        {doc.description ? (
          <p className="text-xs text-stone-600 line-clamp-3 mb-3 flex-1">{doc.description}</p>
        ) : (
          <div className="flex-1" />
        )}
        <div className="text-[11px] text-stone-600 space-y-1 border-t border-stone-100 pt-3 mt-auto">
          <p>
            <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-semibold ${statusBadgeClass(doc.status)}`}>
              {statusLabel(doc.status)}
            </span>
            {' · '}v{doc.version}
          </p>
          <p className="truncate">{doc.responsibleName ?? '—'}</p>
          <p className="text-stone-500">{formatDocDate(doc.updatedAt)}</p>
          {cat ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border mt-1 ${getCategoryBadgeClass(cat)}`}>
              {(() => {
                const Icon = getCategoryIcon(cat.id);
                return <Icon className="w-3 h-3" />;
              })()}
              {getDocumentCategoryLabel(cat.id, categories)}
            </span>
          ) : null}
        </div>
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-stone-100">
          {links.total > 0 ? (
            <span className="text-[10px] text-blue-800 flex items-center gap-1">
              <Link2 className="w-3 h-3" /> {links.total} lien{links.total > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[10px] text-stone-400">Aucun lien</span>
          )}
          {actions}
        </div>
      </div>
    </article>
  );
}

function DocHeader({ doc }: { doc: ISODocument }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h4 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">{doc.title}</h4>
      <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium ${getDocumentTypeColor(doc.type)}`}>
        {getDocumentTypeLabel(doc.type, doc.customTypeLabel)}
      </span>
      {doc.isCritical ? (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-100 text-red-900 rounded-full text-[10px] font-semibold border border-red-200">
          <AlertTriangle className="w-3 h-3" /> Critique
        </span>
      ) : null}
    </div>
  );
}

function DocMeta({ doc, links }: { doc: ISODocument; links: ReturnType<typeof getDocumentLinkSummary> }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-600 mt-2">
      <span className={`px-1.5 py-0.5 rounded border font-semibold ${statusBadgeClass(doc.status)}`}>
        {statusLabel(doc.status)}
      </span>
      <span>v<strong className="text-stone-800">{doc.version}</strong></span>
      {doc.responsibleName ? <span>{doc.responsibleName}</span> : null}
      {doc.file ? <span className="truncate max-w-[180px]">{doc.file.fileName} ({formatFileSize(doc.file.size)})</span> : null}
      {links.total > 0 ? (
        <span className="text-blue-800 flex items-center gap-0.5">
          <Link2 className="w-3 h-3" /> {links.total}
        </span>
      ) : null}
    </div>
  );
}

function DocThumb({
  icon: Icon,
  status,
  large,
}: {
  icon: typeof FileText;
  status: ISODocument['status'];
  large?: boolean;
}) {
  const statusIcon =
    status === 'validated' ? (
      <CheckCircle className="w-3.5 h-3.5 text-emerald-700 absolute -bottom-1 -right-1 bg-white rounded-full" />
    ) : status === 'draft' ? (
      <Clock className="w-3.5 h-3.5 text-amber-700 absolute -bottom-1 -right-1 bg-white rounded-full" />
    ) : null;

  return (
    <div className={`relative shrink-0 ${large ? 'mb-0' : ''}`}>
      <div
        className={`${large ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center`}
      >
        <Icon className={`${large ? 'w-6 h-6' : 'w-5 h-5'} text-blue-800`} />
      </div>
      {statusIcon}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className: string;
}) {
  return (
    <button type="button" onClick={onClick} title={title} className={`p-2 rounded-lg transition-colors ${className}`}>
      {children}
    </button>
  );
}

export { MoreHorizontal };
