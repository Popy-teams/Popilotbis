import { useState } from 'react';
import { X, Calendar, Clock, Users, Save } from 'lucide-react';

interface CreateMeetingModalProps {
  onClose: () => void;
}

export function CreateMeetingModal({ onClose }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '14:00',
    duration: 60,
    projectId: 'popy',
    participants: [] as string[],
  });

  const teamMembers = [
    'Mériem Alami',
    'Alice Chevalier',
    'Thomas Serrano',
    'Paul Leblanc',
    'Marie Laurent',
    'Jean Dupont',
    'Aline Moreau',
    'Karim Benali',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Réunion créée:', formData);
    alert('✅ Réunion planifiée avec succès !\n\nLe rédacteur sera calculé automatiquement selon la rotation.');
    onClose();
  };

  const toggleParticipant = (name: string) => {
    if (formData.participants.includes(name)) {
      setFormData({
        ...formData,
        participants: formData.participants.filter((p) => p !== name),
      });
    } else {
      setFormData({ ...formData, participants: [...formData.participants, name] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Planifier une réunion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Titre de la réunion *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Sprint Review #13 - POPY"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Heure *</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Durée (minutes) *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
              <option value={120}>2 heures</option>
              <option value={180}>3 heures</option>
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Participants *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {teamMembers.map((member) => (
                <label
                  key={member}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(member)}
                    onChange={() => toggleParticipant(member)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{member}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.participants.length} participant(s) sélectionné(s)
            </p>
          </div>

          {/* Info rotation */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">ℹ️ Rédacteur automatique</h4>
            <p className="text-sm text-purple-800">
              Le rédacteur sera calculé automatiquement selon la rotation configurée (tous les 15
              jours). Vous recevrez une notification 2 jours avant si vous êtes désigné.
            </p>
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Planifier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
