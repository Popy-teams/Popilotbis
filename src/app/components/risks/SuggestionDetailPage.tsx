import { Bot, Check, Eye, Pencil } from 'lucide-react';
import type { AutoRiskSuggestion } from '../../types/risks';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import { CATEGORY_CONFIG, categoryChipClass, categoryLabel, maxImpact } from './riskPresentation';

interface SuggestionDetailPageProps {
  suggestion: AutoRiskSuggestion;
  onBack: () => void;
  onCreate: () => void;
  onEdit: () => void;
  onDismiss: () => void;
}

export function SuggestionDetailPage({
  suggestion,
  onBack,
  onCreate,
  onEdit,
  onDismiss,
}: SuggestionDetailPageProps) {
  const CategoryIcon = CATEGORY_CONFIG.find((c) => c.id === suggestion.category)?.icon;

  return (
    <ViewShell>
      <PageBackHeader
        title={suggestion.title}
        subtitle="Suggestion automatique — à valider avant enregistrement"
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" icon={Pencil} onClick={onEdit}>
              Modifier avant création
            </ActionButton>
            <ActionButton icon={Check} onClick={onCreate}>
              Créer le risque
            </ActionButton>
          </div>
        }
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/60 to-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${categoryChipClass(suggestion.category)}`}>
              {CategoryIcon ? <CategoryIcon className="w-3 h-3" /> : null}
              {categoryLabel(suggestion.category)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
              <Bot className="w-3 h-3" /> Détection auto
            </span>
          </div>
          <p className="text-stone-700 leading-relaxed">{suggestion.description}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase text-stone-500 font-medium">Probabilité suggérée</p>
            <p className="text-3xl font-bold text-stone-900 mt-1">{suggestion.suggestedProbability}/5</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase text-stone-500 font-medium">Impact maximal suggéré</p>
            <p className="text-3xl font-bold text-stone-900 mt-1">{maxImpact(suggestion.suggestedImpacts)}/5</p>
          </div>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold text-stone-900 mb-2">Source de la détection</h3>
          <p className="text-sm text-stone-600">{suggestion.sourceDetails}</p>
          <p className="text-xs text-stone-500 mt-2">
            Détecté le {new Date(suggestion.detectedAt).toLocaleDateString('fr-FR')}
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton variant="secondary" onClick={onDismiss} className="sm:flex-1 justify-center">
            Ignorer cette suggestion
          </ActionButton>
          <ActionButton icon={Eye} variant="secondary" onClick={onEdit} className="sm:flex-1 justify-center">
            Personnaliser puis enregistrer
          </ActionButton>
          <ActionButton icon={Check} onClick={onCreate} className="sm:flex-1 justify-center">
            Créer tel quel
          </ActionButton>
        </div>
      </div>
    </ViewShell>
  );
}
