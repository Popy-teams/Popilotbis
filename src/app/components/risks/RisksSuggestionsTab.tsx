import { Bot, Check, Eye, Lightbulb, Pencil, X } from 'lucide-react';
import type { AutoRiskSuggestion } from '../../types/risks';
import { ActionButton, ViewSectionTitle } from '../shared';
import { CATEGORY_CONFIG, categoryChipClass, categoryLabel, maxImpact } from './riskPresentation';

interface RisksSuggestionsTabProps {
  suggestions: AutoRiskSuggestion[];
  dismissedIds: string[];
  onView: (suggestion: AutoRiskSuggestion) => void;
  onCreateFrom: (suggestion: AutoRiskSuggestion) => void;
  onEditBeforeCreate: (suggestion: AutoRiskSuggestion) => void;
  onDismiss: (id: string) => void;
}

export function RisksSuggestionsTab({
  suggestions,
  dismissedIds,
  onView,
  onCreateFrom,
  onEditBeforeCreate,
  onDismiss,
}: RisksSuggestionsTabProps) {
  const visible = suggestions.filter((s) => !dismissedIds.includes(s.id) && !s.dismissed);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-white p-5 sm:p-6">
        <ViewSectionTitle icon={Lightbulb} title="Détection automatique" count={visible.length} />
        <p className="text-sm text-stone-600 mt-3 max-w-3xl">
          POPILOT analyse tâches en retard, budget, documents manquants et compétences absentes. Validez, modifiez ou
          ignorez chaque suggestion avant enregistrement dans le registre.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-12 text-center">
          <Lightbulb className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="font-medium text-stone-700">Aucune suggestion en attente</p>
          <p className="text-sm text-stone-500 mt-1">Le projet ne présente pas de signal de risque détecté automatiquement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {visible.map((suggestion) => {
            const CategoryIcon = CATEGORY_CONFIG.find((c) => c.id === suggestion.category)?.icon;
            return (
              <article
                key={suggestion.id}
                className="rounded-2xl border border-violet-200/70 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-1 bg-gradient-to-r from-violet-400 to-indigo-500" />
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${categoryChipClass(suggestion.category)}`}
                        >
                          {CategoryIcon ? <CategoryIcon className="w-3 h-3" /> : null}
                          {categoryLabel(suggestion.category)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                          <Bot className="w-3 h-3" /> Suggestion
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-900 text-lg">{suggestion.title}</h3>
                      <p className="text-sm text-stone-600 mt-1 line-clamp-3">{suggestion.description}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-3 text-xs text-stone-600 space-y-1">
                    <p>
                      <strong>Source :</strong> {suggestion.sourceDetails}
                    </p>
                    <p>
                      <strong>Détecté le :</strong> {new Date(suggestion.detectedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-stone-100 p-3">
                      <p className="text-[11px] uppercase text-stone-500 font-medium">Probabilité</p>
                      <p className="text-lg font-bold text-stone-900">{suggestion.suggestedProbability}/5</p>
                    </div>
                    <div className="rounded-xl border border-stone-100 p-3">
                      <p className="text-[11px] uppercase text-stone-500 font-medium">Impact max</p>
                      <p className="text-lg font-bold text-stone-900">{maxImpact(suggestion.suggestedImpacts)}/5</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <ActionButton variant="secondary" icon={Eye} onClick={() => onView(suggestion)} className="justify-center">
                      Consulter
                    </ActionButton>
                    <ActionButton variant="secondary" icon={Pencil} onClick={() => onEditBeforeCreate(suggestion)} className="justify-center">
                      Modifier
                    </ActionButton>
                    <ActionButton icon={Check} onClick={() => onCreateFrom(suggestion)} className="justify-center col-span-2">
                      Créer le risque
                    </ActionButton>
                    <button
                      type="button"
                      onClick={() => onDismiss(suggestion.id)}
                      className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      <X className="w-4 h-4" /> Ignorer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
