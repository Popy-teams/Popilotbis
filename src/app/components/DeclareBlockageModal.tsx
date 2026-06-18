import { useState } from 'react';
import { X, AlertTriangle, Send, Check } from 'lucide-react';

interface DeclareBlockageModalProps {
  onClose: () => void;
}

export function DeclareBlockageModal({ onClose }: DeclareBlockageModalProps) {
  const [formData, setFormData] = useState({
    taskId: '',
    description: '',
    impact: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    proposedSolution: '',
  });

  const myTasks = [
    { id: '1', title: 'Finaliser spécifications techniques POPY' },
    { id: '2', title: 'Validation prototype capteurs de mouvement' },
    { id: '3', title: 'Organiser réunion validation design UX' },
    { id: '4', title: 'Revue risques projet avec équipe qualité' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici on enverrait les données au backend
    console.log('Blocage déclaré:', formData);
    alert('Blocage déclaré avec succès ! Votre équipe en est informée.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Déclarer un blocage</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message d'encouragement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Pas d'inquiétude !</strong> Signaler un blocage est une bonne pratique.
              Cela permet à l'équipe de réagir rapidement et de vous débloquer. Nous sommes là
              pour vous aider.
            </p>
          </div>

          {/* Tâche concernée */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quelle tâche est bloquée ? *
            </label>
            <select
              required
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Sélectionnez une tâche</option>
              {myTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Description du blocage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Décrivez le blocage *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: J'attends la validation de Thomas sur le choix des capteurs depuis 3 jours, ce qui m'empêche d'avancer sur les spécifications techniques..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Soyez précis : qu'est-ce qui vous bloque ? Depuis quand ? Qu'avez-vous déjà tenté ?
            </p>
          </div>

          {/* Impact estimé */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Impact estimé sur le projet *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'low', label: 'Faible', color: 'green' },
                { value: 'medium', label: 'Moyen', color: 'yellow' },
                { value: 'high', label: 'Élevé', color: 'orange' },
                { value: 'critical', label: 'Critique', color: 'red' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      impact: option.value as 'low' | 'medium' | 'high' | 'critical',
                    })
                  }
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.impact === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Faible:</strong> Retard de quelques heures • <strong>Moyen:</strong> Retard
              de 1-2 jours • <strong>Élevé:</strong> Retard d'une semaine • <strong>
                Critique:
              </strong>{' '}
              Bloque tout le sprint
            </div>
          </div>

          {/* Solution proposée (optionnel) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Avez-vous une solution à proposer ? (optionnel)
            </label>
            <textarea
              value={formData.proposedSolution}
              onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
              placeholder="Ex: Organiser une réunion express avec Thomas demain matin pour trancher sur les capteurs"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Informations sur le traitement */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Que va-t-il se passer ?</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                Votre chef de projet sera notifié immédiatement
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                Le blocage sera ajouté au tableau des risques projet
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                Une action corrective sera créée automatiquement
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                Vous recevrez une réponse sous 24h maximum
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Déclarer le blocage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
