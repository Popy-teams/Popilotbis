import { useState } from 'react';
import { X, UserPlus, Save, GraduationCap, Calendar } from 'lucide-react';

interface AddTeamMemberModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddTeamMemberModal({ onClose, onSubmit }: AddTeamMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experienceLevel: 'intermediate' as 'junior' | 'intermediate' | 'senior' | 'expert',
    joinDate: new Date().toISOString().split('T')[0],
    availability: 100,
    skills: [] as string[],
  });

  const availableSkills = [
    { id: 'python', name: 'Python', domain: 'software' },
    { id: 'react', name: 'React', domain: 'software' },
    { id: 'electronics', name: 'Électronique', domain: 'hardware' },
    { id: 'ia', name: 'Intelligence Artificielle', domain: 'ia' },
    { id: 'tests', name: 'Tests & Validation', domain: 'qualite' },
    { id: 'gestion-projet', name: 'Gestion de projet', domain: 'gestion' },
    { id: 'documentation', name: 'Documentation qualité', domain: 'qualite' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleSkill = (skillId: string) => {
    if (formData.skills.includes(skillId)) {
      setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skillId) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skillId] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Ajouter un nouveau membre</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info onboarding */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Onboarding automatisé
            </h3>
            <p className="text-sm text-blue-800">
              POPILOT va générer automatiquement un plan d'intégration adapté au profil du membre
              (tâches de lecture, setup, formations, mini-objectifs progressifs).
            </p>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sophie Martin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sophie.martin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rôle *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Ex: Développeur IA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Niveau d'expérience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Niveau d'expérience *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'junior', label: 'Junior', desc: '0-2 ans' },
                { value: 'intermediate', label: 'Intermédiaire', desc: '2-5 ans' },
                { value: 'senior', label: 'Senior', desc: '5-10 ans' },
                { value: 'expert', label: 'Expert', desc: '10+ ans' },
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      experienceLevel: level.value as any,
                    })
                  }
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold text-sm">{level.label}</div>
                  <div className="text-xs mt-1">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date d'arrivée */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date d'arrivée *
            </label>
            <input
              type="date"
              required
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Disponibilité */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Disponibilité (% temps sur le projet)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-center font-semibold text-green-600 text-lg">
              {formData.availability}%
            </div>
          </div>

          {/* Compétences existantes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Compétences existantes
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Sélectionnez les compétences que le membre possède déjà
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableSkills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                    <div className="text-xs text-gray-500">{skill.domain}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info plan d'onboarding */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              📋 Plan d'onboarding automatique
            </h4>
            <p className="text-sm text-green-800 mb-2">
              POPILOT va créer automatiquement :
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Tâches de lecture des documents obligatoires (Politique qualité, Plan projet)</li>
              <li>✓ Setup de l'environnement de travail</li>
              <li>✓ Formations adaptées au niveau d'expérience</li>
              <li>✓ Mini-objectifs progressifs (charge allégée les 2 premières semaines)</li>
              <li>✓ Accès automatique à la documentation projet</li>
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
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Ajouter et générer l'onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
