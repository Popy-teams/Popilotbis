import { useState } from 'react';
import { X, Target, Package, LifeBuoy, Shield, TrendingUp, Activity, Plus, Trash2 } from 'lucide-react';

interface CreateProcessModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: (process: any) => void;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  validatedBy?: string;
  validatedAt?: string;
}

export function CreateProcessModal({ projectId, projectName, onClose, onSuccess }: CreateProcessModalProps) {
  const [formData, setFormData] = useState({
    type: 'pilotage' as 'pilotage' | 'realisation' | 'support' | 'qualite' | 'amelioration' | 'indicateurs',
    title: '',
    objective: '',
    trigger: '',
    responsible: '',
    contributors: '',
    deliverables: '',
    validationCriteria: '',
    risks: '',
    improvementLink: '',
  });

  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: '1', title: '', description: '', status: 'todo' }
  ]);

  const processTypes = [
    { value: 'pilotage', label: 'Processus de pilotage', subtitle: 'DÉCIDER', icon: Target, color: 'indigo' },
    { value: 'realisation', label: 'Processus de réalisation', subtitle: 'FAIRE', icon: Package, color: 'blue' },
    { value: 'support', label: 'Processus support', subtitle: 'PERMETTRE', icon: LifeBuoy, color: 'green' },
    { value: 'qualite', label: 'Processus qualité & risques', subtitle: 'SÉCURISER', icon: Shield, color: 'orange' },
    { value: 'amelioration', label: 'Processus d\'amélioration continue', subtitle: 'AMÉLIORER', icon: TrendingUp, color: 'purple' },
    { value: 'indicateurs', label: 'Indicateurs de suivi', subtitle: 'MESURER', icon: Activity, color: 'pink' },
  ];

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), title: '', description: '', status: 'todo' }]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id: string, field: 'title' | 'description', value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProcess = {
      id: `process-${Date.now()}`,
      projectId,
      type: formData.type,
      title: formData.title,
      objective: formData.objective,
      trigger: formData.trigger,
      responsible: formData.responsible,
      contributors: formData.contributors.split('\n').filter(c => c.trim()),
      steps: steps.filter(s => s.title.trim()),
      deliverables: formData.deliverables.split('\n').filter(d => d.trim()),
      validationCriteria: formData.validationCriteria.split('\n').filter(v => v.trim()),
      risks: formData.risks.split('\n').filter(r => r.trim()),
      improvementLink: formData.improvementLink,
      status: 'todo' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    onSuccess(newProcess);
  };

  const selectedType = processTypes.find(t => t.value === formData.type);
  const Icon = selectedType?.icon || Target;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Créer un processus interactif</h2>
            <p className="text-sm text-gray-600 mt-1">Projet : {projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de processus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de processus *
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {processTypes.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <TypeIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${isSelected ? `text-${type.color}-900` : 'text-gray-900'}`}>
                        {type.subtitle}
                      </div>
                    </div>
                    {isSelected && (
                      <div className={`text-${type.color}-600 font-bold`}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du processus *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Validation V0 Robot"
            />
          </div>

          {/* Objectif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🎯 Objectif (1 phrase claire) *
            </label>
            <input
              type="text"
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Valider une version utilisable du robot"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🧩 Quand il s'applique (trigger)
            </label>
            <input
              type="text"
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Avant chaque déploiement de version"
            />
          </div>

          {/* Responsable & Contributeurs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Responsable principal *
              </label>
              <input
                type="text"
                required
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Sonia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👥 Contributeurs
              </label>
              <textarea
                value={formData.contributors}
                onChange={(e) => setFormData({ ...formData, contributors: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Un contributeur par ligne"
              />
            </div>
          </div>

          {/* Étapes (Checklist dynamique) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                🛠️ Étapes du processus (5-8 recommandées) *
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter une étape
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      required
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={`Titre de l'étape ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Description courte (optionnel)"
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Livrables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📄 Livrables attendus
            </label>
            <textarea
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Un livrable par ligne&#10;Ex:&#10;Prototype monté&#10;Tests validés&#10;Rapport de validation"
            />
          </div>

          {/* Critères de validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Critères de validation
            </label>
            <textarea
              value={formData.validationCriteria}
              onChange={(e) => setFormData({ ...formData, validationCriteria: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Un critère par ligne&#10;Ex:&#10;Tous les tests passent&#10;Aucun incident critique&#10;Validation du PO"
            />
          </div>

          {/* Risques fréquents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⚠️ Risques fréquents
            </label>
            <textarea
              value={formData.risks}
              onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Un risque par ligne&#10;Ex:&#10;Délais serrés&#10;Dépendances externes&#10;Tests incomplets"
            />
          </div>

          {/* Lien amélioration continue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔁 Lien amélioration continue
            </label>
            <input
              type="text"
              value={formData.improvementLink}
              onChange={(e) => setFormData({ ...formData, improvementLink: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: REX après chaque version"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              Créer le processus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}