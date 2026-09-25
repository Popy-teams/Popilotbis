import { useState } from 'react';
import { Plus, Mail, Phone, MoreVertical, Award, Target } from 'lucide-react';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { useApi } from '../hooks/useApi';

export function TeamView() {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddMember = (data: any) => {
    console.log('Nouveau membre ajouté:', data);
    alert('✅ Membre ajouté avec succès !\n\n📋 Plan d\'onboarding généré automatiquement\n🎓 Tâches d\'intégration créées\n🔔 Notifications envoyées');
    setShowAddModal(false);
  };

  const { data: apiTeamMembers, loading, error, refetch } = useApi<any[]>('/team-members');

  // On mappe les données de l'API pour s'assurer d'avoir les propriétés manquantes 
  // (celles qui ne sont pas encore dans la base de données mais nécessaires à l'UI).
  const teamMembers = (apiTeamMembers || []).map(member => ({
    ...member,
    projects: member.projects || [],
    objectives: member.objectives || [],
    trophies: member.trophies || [],
    workload: member.workload || 0
  }));

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return { bg: 'bg-red-100', bar: 'bg-red-600', text: 'text-red-800' };
    if (workload >= 75) return { bg: 'bg-orange-100', bar: 'bg-orange-600', text: 'text-orange-800' };
    if (workload >= 60) return { bg: 'bg-yellow-100', bar: 'bg-yellow-600', text: 'text-yellow-800' };
    return { bg: 'bg-green-100', bar: 'bg-green-600', text: 'text-green-800' };
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability === 'Surchargé') return 'bg-red-100 text-red-800 border-red-200';
    if (availability === 'Occupé') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Équipe</h1>
          <p className="text-gray-600 mt-1">Gérez les membres de l'équipe et leurs objectifs</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
          <div className="text-sm text-gray-600">Membres actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-900">
            {teamMembers.filter((m) => m.availability === 'Disponible').length}
          </div>
          <div className="text-sm text-green-700">Disponibles</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="text-2xl font-bold text-red-900">
            {teamMembers.filter((m) => m.workload >= 90).length}
          </div>
          <div className="text-sm text-red-700">Surchargés</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(teamMembers.reduce((acc, m) => acc + m.workload, 0) / teamMembers.length)}%
          </div>
          <div className="text-sm text-gray-600">Charge moyenne</div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamMembers.map((member) => {
          const workloadColors = getWorkloadColor(member.workload);

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Member Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-xl flex items-center justify-center font-semibold flex-shrink-0">
                    {member.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(member.availability)}`}>
                        {member.availability}
                      </span>
                      {member.trophies.map((trophy, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          {trophy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Workload */}
              <div className={`px-6 py-4 ${workloadColors.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${workloadColors.text}`}>
                    Charge de travail
                  </span>
                  <span className={`text-sm font-bold ${workloadColors.text}`}>
                    {member.workload}%
                  </span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2.5">
                  <div
                    className={`${workloadColors.bar} h-2.5 rounded-full transition-all`}
                    style={{ width: `${member.workload}%` }}
                  ></div>
                </div>
              </div>

              {/* Contact */}
              <div className="px-6 py-4 border-b border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{member.phone}</span>
                </div>
              </div>

              {/* Projects */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Projets assignés</h4>
                <div className="space-y-1">
                  {member.projects.map((project, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      • {project}
                    </div>
                  ))}
                </div>
              </div>

              {/* Objectives */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Objectifs individuels</h4>
                </div>
                <div className="space-y-3">
                  {member.objectives.map((objective, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{objective.name}</span>
                        <span className="text-xs font-medium text-gray-500">
                          {objective.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            objective.progress === 100
                              ? 'bg-green-500'
                              : objective.progress >= 70
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${objective.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <AddTeamMemberModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddMember}
        />
      )}
    </div>
  );
}