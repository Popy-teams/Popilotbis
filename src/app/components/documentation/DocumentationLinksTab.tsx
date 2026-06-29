import { Brain, DollarSign, FileText, Link2, Target, TrendingUp } from 'lucide-react';
import type { ISODocument } from '../../types/documents';
import { getDocumentLinkSummary, getDocumentTypeLabel } from './documentationPresentation';

interface DocumentationLinksTabProps {
  documents: ISODocument[];
  onViewDoc: (doc: ISODocument) => void;
}

export function DocumentationLinksTab({ documents, onViewDoc }: DocumentationLinksTabProps) {
  const linked = documents.filter((d) => getDocumentLinkSummary(d).total > 0);
  const unlinked = documents.filter((d) => getDocumentLinkSummary(d).total === 0);

  return (
    <div className="space-y-5 min-w-0">
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-base">Traçabilité documentaire</h3>
            <p className="text-sm text-stone-700 mt-1 leading-relaxed">
              Chaque document peut être relié au pipeline, aux tâches, décisions et risques. La vision
              complète relie études → décisions → exécution.
            </p>
            <p className="text-xs font-medium text-emerald-900 mt-2">
              {linked.length} document{linked.length !== 1 ? 's' : ''} lié{linked.length !== 1 ? 's' : ''} ·{' '}
              {unlinked.length} sans lien
            </p>
          </div>
        </div>
      </div>

      {linked.length > 0 ? (
        <section className="space-y-3">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-700" />
            Documents avec liens actifs
          </h3>
          {linked.map((doc) => (
            <LinkCard key={doc.id} doc={doc} onView={() => onViewDoc(doc)} />
          ))}
        </section>
      ) : null}

      {unlinked.length > 0 ? (
        <section className="space-y-3">
          <h3 className="font-semibold text-stone-700 text-sm">Sans lien projet ({unlinked.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unlinked.slice(0, 8).map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onViewDoc(doc)}
                className="text-left rounded-lg border border-dashed border-stone-300 bg-stone-50/80 px-3 py-2 hover:border-blue-300 text-sm text-stone-800 truncate"
              >
                {doc.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-blue-200 bg-white p-4 sm:p-5 space-y-4">
        <h3 className="font-semibold text-stone-900">Exemples de chaînes de traçabilité</h3>
        <ExampleChain
          icon={FileText}
          title="Étude de Faisabilité Technique POPY"
          color="blue"
          items={['Étape pipeline : Cadrage', 'Décision : Choix architecture hardware', 'Impact : passage Conception']}
        />
        <ExampleChain
          icon={DollarSign}
          title="Budget Détaillé POPY 2026"
          color="emerald"
          items={['Étape pipeline : Cadrage', 'Document critique : bloque jalon si non validé']}
        />
        <ExampleChain
          icon={Brain}
          title="Architecture Technique POPY"
          color="violet"
          items={['Étape : Conception', '2 décisions liées', '8 tâches hardware']}
        />
      </section>
    </div>
  );
}

function LinkCard({ doc, onView }: { doc: ISODocument; onView: () => void }) {
  const links = getDocumentLinkSummary(doc);
  return (
    <button
      type="button"
      onClick={onView}
      className="w-full text-left rounded-xl border border-blue-200 bg-white p-4 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="font-semibold text-stone-900 text-sm sm:text-base mb-1">{doc.title}</div>
      <p className="text-xs text-stone-600 mb-3">{getDocumentTypeLabel(doc.type, doc.customTypeLabel)}</p>
      <div className="flex flex-wrap gap-2">
        {links.stage ? (
          <Chip color="purple" label="Étape pipeline" />
        ) : null}
        {links.tasks > 0 ? <Chip color="blue" label={`${links.tasks} tâche(s)`} /> : null}
        {links.decisions > 0 ? <Chip color="green" label={`${links.decisions} décision(s)`} /> : null}
        {links.risks > 0 ? <Chip color="red" label={`${links.risks} risque(s)`} /> : null}
      </div>
    </button>
  );
}

function Chip({ color, label }: { color: 'purple' | 'blue' | 'green' | 'red'; label: string }) {
  const map = {
    purple: 'bg-purple-100 text-purple-900 border-purple-200',
    blue: 'bg-blue-100 text-blue-900 border-blue-200',
    green: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    red: 'bg-red-100 text-red-900 border-red-200',
  };
  return <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border ${map[color]}`}>{label}</span>;
}

function ExampleChain({
  icon: Icon,
  title,
  color,
  items,
}: {
  icon: typeof Target;
  title: string;
  color: 'blue' | 'emerald' | 'violet';
  items: string[];
}) {
  const border = { blue: 'border-blue-200', emerald: 'border-emerald-200', violet: 'border-violet-200' }[color];
  const text = { blue: 'text-blue-900', emerald: 'text-emerald-900', violet: 'text-violet-900' }[color];
  return (
    <div className={`rounded-xl border-2 ${border} p-4 bg-white`}>
      <div className={`font-semibold ${text} mb-2 flex items-center gap-2 text-sm`}>
        <Icon className="w-4 h-4" /> {title}
      </div>
      <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Link2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
