import { useState } from 'react';
import { CheckCircle, X, Target, Sparkles, AlertTriangle, Check, Ban, Pin, PartyPopper } from 'lucide-react';

interface ActionSuggestionsPanelProps {
  roundTable: any[];
}

export function ActionSuggestionsPanel({ roundTable }: ActionSuggestionsPanelProps) {
  // Génération des suggestions basées sur le tour de table
  const generateSuggestions = () => {
    const suggestions: any[] = [];

    roundTable.forEach((member) => {
      // Tâches complétées → UPDATE_TASK
      member.completed.forEach((item: string) => {
        // Simuler la détection d'une tâche existante
        if (item.toLowerCase().includes('devis')) {
          suggestions.push({
            id: `sugg-${Date.now()}-${Math.random()}`,
            type: 'UPDATE_TASK',
            confidence: 90,
            sourceText: item,
            member: member.memberName,
            proposedChanges: {
              taskId: 'task-123',
              taskTitle: 'Demander devis composants (Raspberry Pi, servos, ToF)',
              newStatus: 'done',
              completedAt: new Date().toISOString(),
            },
            needsReview: false,
            accepted: null,
          });
        }
      });

      // Tâches à faire → CREATE_TASK
      member.toDo.forEach((item: string) => {
        suggestions.push({
          id: `sugg-${Date.now()}-${Math.random()}`,
          type: 'CREATE_TASK',
          confidence: 85,
          sourceText: item,
          member: member.memberName,
          proposedChanges: {
            taskTitle: item,
            owner: member.memberName,
            ownerId: member.memberId,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0], // +14 jours
            status: 'todo',
            priority: 'medium',
          },
          needsReview: true,
          accepted: null,
        });
      });

      // Blocages → CREATE_RISK
      member.blockages.forEach((item: string) => {
        suggestions.push({
          id: `sugg-${Date.now()}-${Math.random()}`,
          type: 'CREATE_RISK',
          confidence: 95,
          sourceText: item,
          member: member.memberName,
          proposedChanges: {
            title: item,
            category: 'Blocage opérationnel',
            impact: 'high',
            reportedBy: member.memberName,
          },
          needsReview: true,
          accepted: null,
        });
      });
    });

    return suggestions;
  };

  const [suggestions, setSuggestions] = useState(generateSuggestions());

  const handleAccept = (suggestionId: string) => {
    setSuggestions(
      suggestions.map((s) => (s.id === suggestionId ? { ...s, accepted: true } : s))
    );
  };

  const handleReject = (suggestionId: string) => {
    setSuggestions(
      suggestions.map((s) => (s.id === suggestionId ? { ...s, accepted: false } : s))
    );
  };

  const acceptedCount = suggestions.filter((s) => s.accepted === true).length;
  const rejectedCount = suggestions.filter((s) => s.accepted === false).length;
  const pendingCount = suggestions.filter((s) => s.accepted === null).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
          <div className="text-sm text-blue-700">Suggestions détectées</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
          <div className="text-sm text-green-700">Acceptées</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
          <div className="text-sm text-gray-700">En attente</div>
        </div>
      </div>

      {/* Liste des suggestions */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const isAccepted = suggestion.accepted === true;
          const isRejected = suggestion.accepted === false;
          const isPending = suggestion.accepted === null;

          return (
            <div
              key={suggestion.id}
              className={`border-2 rounded-xl p-4 transition-all ${
                isAccepted
                  ? 'border-green-300 bg-green-50'
                  : isRejected
                  ? 'border-gray-300 bg-gray-50 opacity-50'
                  : 'border-blue-300 bg-blue-50'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    suggestion.type === 'UPDATE_TASK'
                      ? 'bg-green-100'
                      : suggestion.type === 'CREATE_TASK'
                      ? 'bg-blue-100'
                      : 'bg-red-100'
                  }`}>
                    {suggestion.type === 'UPDATE_TASK' ? (
                      <CheckCircle className={`w-5 h-5 ${
                        isAccepted ? 'text-green-700' : 'text-green-600'
                      }`} />
                    ) : suggestion.type === 'CREATE_TASK' ? (
                      <Target className={`w-5 h-5 ${
                        isAccepted ? 'text-blue-700' : 'text-blue-600'
                      }`} />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${
                        isAccepted ? 'text-red-700' : 'text-red-600'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 inline-flex items-center gap-1.5">
                        {suggestion.type === 'UPDATE_TASK' ? (
                          <><Check className="w-4 h-4 text-green-600" /> Marquer tache comme terminee</>
                        ) : suggestion.type === 'CREATE_TASK' ? (
                          <><Pin className="w-4 h-4 text-blue-600" /> Creer nouvelle tache</>
                        ) : (
                          <><Ban className="w-4 h-4 text-red-600" /> Creer risque/blocage</>
                        )}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.confidence >= 90
                          ? 'bg-green-100 text-green-800'
                          : suggestion.confidence >= 75
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {suggestion.confidence}% confiance
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Par : <strong>{suggestion.member}</strong>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                      <div className="text-xs text-gray-500 mb-1">Texte source :</div>
                      <div className="text-sm text-gray-700 italic">"{suggestion.sourceText}"</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleAccept(suggestion.id)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Accepter"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(suggestion.id)}
                      className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      title="Rejeter"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {isAccepted && (
                  <div className="ml-3 px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Acceptee
                  </div>
                )}
                {isRejected && (
                  <div className="ml-3 px-3 py-1 bg-gray-400 text-white rounded-lg text-sm">
                    Rejetée
                  </div>
                )}
              </div>

              {/* Détails de l'action */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Action proposée :
                </div>
                {suggestion.type === 'UPDATE_TASK' && (
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Tâche :</span>{' '}
                      <span className="font-medium text-gray-900">
                        {suggestion.proposedChanges.taskTitle}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nouveau statut :</span>{' '}
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terminee
                      </span>
                    </div>
                  </div>
                )}
                {suggestion.type === 'CREATE_TASK' && (
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Titre :</span>{' '}
                      <span className="font-medium text-gray-900">
                        {suggestion.proposedChanges.taskTitle}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Assignée à :</span>{' '}
                      <span className="font-medium text-gray-900">
                        {suggestion.proposedChanges.owner}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Échéance :</span>{' '}
                      <span className="font-medium text-gray-900">
                        {new Date(suggestion.proposedChanges.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Priorité :</span>{' '}
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {suggestion.proposedChanges.priority === 'high'
                          ? 'Haute'
                          : suggestion.proposedChanges.priority === 'medium'
                          ? 'Moyenne'
                          : 'Basse'}
                      </span>
                    </div>
                  </div>
                )}
                {suggestion.type === 'CREATE_RISK' && (
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Titre :</span>{' '}
                      <span className="font-medium text-gray-900">
                        {suggestion.proposedChanges.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Catégorie :</span>{' '}
                      <span className="font-medium text-gray-900">
                        {suggestion.proposedChanges.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact :</span>{' '}
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {suggestion.proposedChanges.impact === 'high' ? 'Élevé' : 'Moyen'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé final */}
      {pendingCount === 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-600 text-white rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 text-lg mb-2 inline-flex items-center gap-2">
                <PartyPopper className="w-5 h-5" /> Analyse terminee !
              </h3>
              <p className="text-sm text-green-800 mb-3">
                {acceptedCount} action(s) seront exécutées automatiquement lors de la publication
                du compte rendu.
              </p>
              <ul className="text-sm text-green-800 space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> {suggestions.filter((s) => s.accepted && s.type === 'UPDATE_TASK').length}{' '}
                  tache(s) seront marquees comme terminees
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> {suggestions.filter((s) => s.accepted && s.type === 'CREATE_TASK').length}{' '}
                  nouvelle(s) tache(s) seront creees
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> {suggestions.filter((s) => s.accepted && s.type === 'CREATE_RISK').length}{' '}
                  risque(s)/blocage(s) seront ajoutes au registre
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
