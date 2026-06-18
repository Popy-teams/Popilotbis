import { useState } from 'react';
import { X, Users } from 'lucide-react';
import { apiPut } from '../hooks/useApi';
import { Project } from '../types';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

// Liste des membres disponibles (à terme, cela pourrait venir d'une API)
const availableMembers = [
  { id: '1', name: 'Jean Dupont', initials: 'JD', color: 'bg-blue-600' },
  { id: '2', name: 'Marie Martin', initials: 'MM', color: 'bg-purple-600' },
  { id: '3', name: 'Pierre Dubois', initials: 'PD', color: 'bg-green-600' },
  { id: '4', name: 'Sophie Bernard', initials: 'SB', color: 'bg-orange-600' },
  { id: '5', name: 'Luc Petit', initials: 'LP', color: 'bg-pink-600' },
  { id: '6', name: 'Emma Roux', initials: 'ER', color: 'bg-indigo-600' },
];

export function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  // Convertir les initiales existantes en IDs de membres
  const initialMemberIds = availableMembers
    .filter(m => project.team.includes(m.initials))
    .map(m => m.id);

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate || '',
    deadline: project.deadline,
    budget: project.budget.total.toString(),
    selectedMembers: initialMemberIds,
  });

  const toggleMember = (memberId: string) => {
    setFormData({
      ...formData,
      selectedMembers: formData.selectedMembers.includes(memberId)
        ? formData.selectedMembers.filter(id => id !== memberId)
        : [...formData.selectedMembers, memberId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMemberInitials = availableMembers
        .filter(m => formData.selectedMembers.includes(m.id))
        .map(m => m.initials);
        
      await apiPut<Project>(`/projects/${project.id}`, {
        ...project,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: formData.startDate,
        deadline: formData.deadline,
        budget: {
          ...project.budget,
          total: parseInt(formData.budget),
        },
        team: selectedMemberInitials,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Erreur lors de la modification du projet');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Modifier le projet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Refonte plateforme digitale"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez les objectifs du projet..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="on-track">Dans les temps</option>
              <option value="at-risk">À risque</option>
              <option value="delayed">En retard</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget total (€) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 180000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membres de l'équipe
            </label>
            <p className="text-xs text-gray-500 mb-3">Sélectionnez les membres qui travailleront sur ce projet</p>
            <div className="grid grid-cols-3 gap-3">
              {availableMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    formData.selectedMembers.includes(member.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-semibold`}>
                    {member.initials}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    {formData.selectedMembers.includes(member.id) && (
                      <div className="text-xs text-blue-600 font-medium">✓ Sélectionné</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {formData.selectedMembers.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-900">
                  <span className="font-medium">{formData.selectedMembers.length}</span> membre{formData.selectedMembers.length > 1 ? 's' : ''} sélectionné{formData.selectedMembers.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
