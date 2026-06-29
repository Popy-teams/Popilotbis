import { useEffect } from 'react';
import { Download, ExternalLink, FileText, Maximize2, X } from 'lucide-react';
import type { ISODocument } from '../../types/documents';
import {
  downloadDocumentFile,
  formatFileSize,
  getPreviewKind,
} from '../../data/documentationHelpers';
import { getDocumentTypeLabel } from './documentationPresentation';

interface DocumentPreviewPanelProps {
  doc: ISODocument;
  open: boolean;
  onClose: () => void;
  embedded?: boolean;
  onFullscreen?: () => void;
}

export function DocumentPreviewPanel({
  doc,
  open,
  onClose,
  embedded = false,
  onFullscreen,
}: DocumentPreviewPanelProps) {
  const kind = getPreviewKind(doc);
  const textContent = doc.file?.textContent ?? doc.content ?? '';

  useEffect(() => {
    if (!open || embedded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, embedded, onClose]);

  if (!open) return null;

  const header = (
    <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-5 bg-gradient-to-r from-stone-50 to-blue-50/50 shrink-0">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-blue-800 font-semibold mb-0.5">Visualisation</p>
        <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2">{doc.title}</h3>
        <p className="text-xs text-stone-600 mt-0.5">
          {getDocumentTypeLabel(doc.type, doc.customTypeLabel)}
          {doc.file ? ` · ${doc.file.fileName} (${formatFileSize(doc.file.size)})` : ''}
        </p>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {embedded && onFullscreen ? (
          <ToolbarBtn onClick={onFullscreen} title="Plein écran">
            <Maximize2 className="w-4 h-4" />
          </ToolbarBtn>
        ) : null}
        {doc.file?.dataUrl ? (
          <ToolbarBtn onClick={() => downloadDocumentFile(doc)} title="Télécharger">
            <Download className="w-4 h-4" />
          </ToolbarBtn>
        ) : null}
        {!embedded ? (
          <ToolbarBtn onClick={onClose} title="Fermer">
            <X className="w-5 h-5" />
          </ToolbarBtn>
        ) : null}
      </div>
    </div>
  );

  const body = (
    <div className="flex-1 min-h-0 overflow-auto bg-stone-100/50 p-3 sm:p-4">
      {kind === 'pdf' && doc.file?.dataUrl ? (
        <iframe
          title={doc.title}
          src={doc.file.dataUrl}
          className="w-full h-[min(70vh,720px)] min-h-[240px] rounded-xl border border-stone-200 bg-white shadow-inner"
        />
      ) : null}

      {kind === 'image' && doc.file?.dataUrl ? (
        <div className="flex justify-center p-2">
          <img
            src={doc.file.dataUrl}
            alt={doc.title}
            className="max-w-full max-h-[min(70vh,720px)] object-contain rounded-xl border border-stone-200 bg-white shadow-sm"
          />
        </div>
      ) : null}

      {kind === 'text' && textContent ? (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <pre className="whitespace-pre-wrap text-sm text-stone-900 leading-relaxed font-sans p-4 sm:p-6 max-w-3xl mx-auto">
            {textContent}
          </pre>
        </div>
      ) : null}

      {kind === 'unsupported' ? (
        <EmptyPreview
          title="Aperçu non disponible"
          description={`Le format de « ${doc.file?.fileName} » ne peut pas être affiché dans le navigateur.`}
          doc={doc}
        />
      ) : null}

      {kind === 'empty' ? (
        <EmptyPreview
          title="Rien à afficher"
          description="Ajoutez un fichier ou du contenu texte pour activer l'aperçu."
          doc={doc}
          showDescription
        />
      ) : null}
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm flex flex-col min-h-[320px] max-h-[80vh] overflow-hidden h-full">
        {header}
        {body}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]" aria-label="Fermer" onClick={onClose} />
      <div className="relative w-full sm:max-w-5xl max-h-[96vh] sm:max-h-[92vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {header}
        {body}
      </div>
    </div>
  );
}

function ToolbarBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button type="button" onClick={onClick} title={title} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-stone-200 text-stone-700 transition-colors">
      {children}
    </button>
  );
}

function EmptyPreview({
  title,
  description,
  doc,
  showDescription,
}: {
  title: string;
  description: string;
  doc: ISODocument;
  showDescription?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-stone-300 bg-white mx-auto max-w-md">
      <FileText className="w-12 h-12 text-stone-300 mb-3" />
      <p className="font-semibold text-stone-900">{title}</p>
      <p className="text-sm text-stone-600 mt-1">{description}</p>
      {showDescription && doc.description ? (
        <p className="text-sm text-stone-700 mt-4 text-left w-full bg-stone-50 rounded-lg p-3 border border-stone-200">
          {doc.description}
        </p>
      ) : null}
      {doc.file?.dataUrl ? (
        <button
          type="button"
          onClick={() => downloadDocumentFile(doc)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          <ExternalLink className="w-4 h-4" /> Télécharger le fichier
        </button>
      ) : null}
    </div>
  );
}
