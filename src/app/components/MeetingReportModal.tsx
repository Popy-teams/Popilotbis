import { useState } from 'react';
import { X, Save, Sparkles, Plus, Trash2, CheckCircle, Calendar, Users, Target } from 'lucide-react';
import { ActionSuggestionsPanel } from './ActionSuggestionsPanel';

interface MeetingReportModalProps {
  meeting: any;
  onClose: () => void;
}

export function MeetingReportModal({ meeting, onClose }: MeetingReportModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'roundtable' | 'decisions' | 'actions' | 'goals'>('info');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    // Infos réunion
    facilitator: 'Jean Dupont',
    actualDuration: meeting.duration,
    attendees: ['Mériem Alami', 'Alice Chevalier', 'Thomas Serrano', 'Paul Leblanc', 'Marie Laurent'],
    absentees: [],
    
    // Ordre du jour
    agenda: [
      { id: '1', title: 'Tour de table avancement sprint', objective: 'Faire le point sur les tâches', duration: 30 },
      { id: '2', title: 'Revue des risques et blocages', objective: 'Identifier et traiter les obstacles', duration: 20 },
      { id: '3', title: 'Décisions techniques à prendre', objective: 'Valider les choix hardware', duration: 40 },
    ],
    
    // Tour de table
    roundTable: [
      {
        memberId: '1',
        memberName: 'Mériem Alami',
        completed: [],
        inProgress: [],
        toDo: [],
        blockages: [],
      },
      {
        memberId: '2',
        memberName: 'Alice Chevalier',
        completed: [],
        inProgress: [],
        toDo: [],
        blockages: [],
      },
    ],
    
    // Décisions
    decisions: [],
    
    // Actions
    actions: [],
    
    // Objectifs prochaine réunion
    nextGoals: [],
    
    // Notes libres
    notes: '',
  });

  const [currentMember, setCurrentMember] = useState(formData.roundTable[0]);

  const handleAddCompleted = () => {
    const text = prompt('Qu\'avez-vous terminé ?');
    if (text) {
      const updated = formData.roundTable.map((m) =>
        m.memberId === currentMember.memberId
          ? { ...m, completed: [...m.completed, text] }
          : m
      );
      setFormData({ ...formData, roundTable: updated });
      setCurrentMember(updated.find((m) => m.memberId === currentMember.memberId)!);
    }
  };

  const handleAddToDo = () => {
    const text = prompt('Qu\'allez-vous faire ?');
    if (text) {
      const updated = formData.roundTable.map((m) =>
        m.memberId === currentMember.memberId
          ? { ...m, toDo: [...m.toDo, text] }
          : m
      );
      setFormData({ ...formData, roundTable: updated });
      setCurrentMember(updated.find((m) => m.memberId === currentMember.memberId)!);
    }
  };

  const handleAddBlockage = () => {
    const text = prompt('Quel est le blocage ?');
    if (text) {
      const updated = formData.roundTable.map((m) =>
        m.memberId === currentMember.memberId
          ? { ...m, blockages: [...m.blockages, text] }
          : m
      );
      setFormData({ ...formData, roundTable: updated });
      setCurrentMember(updated.find((m) => m.memberId === currentMember.memberId)!);
    }
  };

  const handleAddDecision = () => {
    const description = prompt('Décrivez la décision prise :');
    if (description) {
      const impact = prompt('Impact ? (planning / budget / quality / scope)') || 'planning';
      setFormData({
        ...formData,
        decisions: [
          ...formData.decisions,
          {
            id: Date.now().toString(),
            description,
            decidedBy: formData.facilitator,
            date: meeting.date,
            impact: impact as any,
          },
        ],
      });
    }
  };

  const handleGenerateSuggestions = () => {
    // Ici on analyserait le tour de table pour générer des suggestions
    setShowSuggestions(true);
  };

  const handleSave = () => {
    console.log('Compte rendu sauvegardé:', formData);
    alert('✅ Compte rendu publié avec succès !\n\n📝 Actions créées automatiquement\n✓ Tâches mises à jour\n🔔 Notifications envoyées');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-lg">#{meeting.number}</span>
                <h2 className="text-2xl font-bold">{meeting.title}</h2>
              </div>
              <div className="flex items-center gap-4 text-blue-100 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(meeting.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formData.attendees.length} participants
                </span>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  📝 Rédacteur : {meeting.writerName}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {[
              { id: 'info', label: 'Infos réunion', icon: Calendar },
              { id: 'roundtable', label: 'Tour de table', icon: Users },
              { id: 'decisions', label: 'Décisions', icon: CheckCircle },
              { id: 'actions', label: 'Actions', icon: Target },
              { id: 'goals', label: 'Objectifs suivants', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Tab: Infos réunion */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Trame de CR ISO 9001</h3>
                <p className="text-sm text-blue-800">
                  Cette trame garantit la traçabilité complète conformément à ISO 9001 §7.5
                  (informations documentées).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Animateur
                  </label>
                  <input
                    type="text"
                    value={formData.facilitator}
                    onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Durée réelle (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.actualDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, actualDuration: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordre du jour
                </label>
                <div className="space-y-2">
                  {formData.agenda.map((item, idx) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {idx + 1}. {item.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Objectif : {item.objective}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{item.duration} min</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes générales (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes libres sur le déroulement de la réunion..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Tab: Tour de table */}
          {activeTab === 'roundtable' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  Tour de table guidé (Option A - Recommandée)
                </h3>
                <p className="text-sm text-green-800">
                  Chaque membre remplit 3 champs rapides. L'IA saura exactement qui fait quoi, et
                  créera automatiquement les actions.
                </p>
              </div>

              {/* Sélection du membre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sélectionnez le membre
                </label>
                <div className="flex gap-2 flex-wrap">
                  {formData.roundTable.map((member) => (
                    <button
                      key={member.memberId}
                      onClick={() => setCurrentMember(member)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentMember.memberId === member.memberId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {member.memberName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire pour le membre sélectionné */}
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{currentMember.memberName}</h3>

                {/* ✅ Fait */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      ✅ Fait (tâches terminées)
                    </h4>
                    <button
                      onClick={handleAddCompleted}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                  {currentMember.completed.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucune tâche terminée déclarée</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentMember.completed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 📌 À faire */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      📌 À faire (nouvelles tâches)
                    </h4>
                    <button
                      onClick={handleAddToDo}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                  {currentMember.toDo.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucune nouvelle tâche</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentMember.toDo.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 🚫 Blocages */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-600" />
                      🚫 Blocages
                    </h4>
                    <button
                      onClick={handleAddBlockage}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                  {currentMember.blockages.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucun blocage signalé</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentMember.blockages.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm bg-red-50 p-2 rounded">
                          <span className="flex-1 text-red-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Décisions */}
          {activeTab === 'decisions' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">
                  Décisions impactant le projet
                </h3>
                <p className="text-sm text-purple-800">
                  Documentez les décisions importantes (planning, budget, qualité, périmètre) pour
                  garantir la traçabilité ISO 9001.
                </p>
              </div>

              <button
                onClick={handleAddDecision}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter une décision
              </button>

              {formData.decisions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune décision enregistrée</p>
              ) : (
                <div className="space-y-3">
                  {formData.decisions.map((decision: any) => (
                    <div
                      key={decision.id}
                      className="bg-white border-2 border-purple-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{decision.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-600">Par : {decision.decidedBy}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              decision.impact === 'planning'
                                ? 'bg-blue-100 text-blue-800'
                                : decision.impact === 'budget'
                                ? 'bg-green-100 text-green-800'
                                : decision.impact === 'quality'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              Impact : {decision.impact}
                            </span>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Actions */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Automatisation intelligente
                </h3>
                <p className="text-sm text-blue-800">
                  POPILOT analyse automatiquement le tour de table pour détecter les actions
                  terminées et les nouvelles tâches à créer.
                </p>
              </div>

              <button
                onClick={handleGenerateSuggestions}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Générer les suggestions automatiques
              </button>

              {showSuggestions && <ActionSuggestionsPanel roundTable={formData.roundTable} />}
            </div>
          )}

          {/* Tab: Objectifs suivants */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Objectifs de la prochaine réunion
                </h3>
                <p className="text-sm text-orange-800">
                  Définissez 3 à 7 objectifs mesurables pour la prochaine réunion. Cela structure
                  le travail de l'équipe.
                </p>
              </div>

              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter un objectif
              </button>

              <p className="text-center text-gray-500 py-8">Aucun objectif défini</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Publier le compte rendu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
