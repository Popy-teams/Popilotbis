import { useEffect, useMemo, useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { Plus, Mail, Phone, Award, Upload, Users, Pencil, Trash2, Eye, Check, ClipboardList, GraduationCap, Bell } from 'lucide-react';
import { TEST_TEAM_MEMBERS, calculateMemberWorkload, getCategories, type TeamMemberData } from '../data/testTeamData';
import { TEST_TASKS } from '../data/testData';
import { PageBackHeader } from './shared/PageBackHeader';
import { TestModeBadge } from './shared/displayHelpers';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';

type PageMode = 'list' | 'create' | 'view' | 'edit';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: '',
  category: 'Direction & Coordination',
  photoUrl: '',
};

export function TeamViewWithTestData() {
  const { matchesProject, activeProjectSlug } = useProjectContext();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [members, setMembers] = useState<TeamMemberData[]>(TEST_TEAM_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:team-local');
      if (raw) setMembers(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:team-local', JSON.stringify(members));
    } catch {}
  }, [members]);

  const scopedMembers = useMemo(
    () => filterByActiveProject(members, matchesProject),
    [members, matchesProject]
  );

  const totalTasks = TEST_TASKS.length;
  const membersWithWorkload = scopedMembers.map((member) => ({
    ...member,
    workload: calculateMemberWorkload(member.id, totalTasks),
  }));

  const categories = getCategories();
  const filteredMembers = selectedCategory
    ? membersWithWorkload.filter((m) => m.category === selectedCategory)
    : membersWithWorkload;

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'text-red-600 bg-red-100';
    if (workload >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability === 'Surchargé') return 'bg-red-100 text-red-700 border-red-300';
    if (availability === 'En congé') return 'bg-gray-100 text-gray-700 border-gray-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const toMember = (base?: TeamMemberData): TeamMemberData => ({
    id: base?.id ?? `user-${Date.now()}`,
    name: form.name,
    initials: form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    role: form.role,
    category: form.category,
    email: form.email,
    phone: form.phone,
    photoUrl: form.photoUrl || base?.photoUrl,
    workload: base?.workload ?? 0,
    assignedTasks: base?.assignedTasks ?? [],
    responsibilities: base?.responsibilities ?? [],
    skills: base?.skills ?? [],
    availability: base?.availability ?? 'Disponible',
    trophies: base?.trophies ?? [],
    projectId: base?.projectId ?? activeProjectSlug ?? 'popy',
  });

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toMember(pageMode === 'edit' ? selectedMember ?? undefined : undefined);
    if (pageMode === 'create') {
      setMembers((prev) => [...prev, next]);
    } else {
      setMembers((prev) => prev.map((m) => (m.id === next.id ? next : m)));
      setSelectedMember(next);
    }
    setPageMode('list');
    setForm(emptyForm);
    setPhotoPreview(null);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMember(null);
    setPageMode('list');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setForm({ ...form, photoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const memberFormPage = (
    <ViewShell narrow>
      <PageBackHeader
        title={pageMode === 'create' ? 'Ajouter un membre' : 'Modifier le membre'}
        subtitle={<TestModeBadge />}
        onBack={() => setPageMode(selectedMember ? 'view' : 'list')}
      />
      <form onSubmit={submitForm} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Photo de profil</label>
          <div className="flex items-center gap-4">
            {photoPreview || form.photoUrl ? (
              <img src={photoPreview || form.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center"><Upload className="w-8 h-8 text-gray-500" /></div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Upload className="w-4 h-4" /> Choisir une photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>
        {(['name', 'email', 'phone', 'role'] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">{field === 'name' ? 'Nom complet *' : field === 'email' ? 'Email *' : field === 'role' ? 'Role *' : 'Telephone'}</label>
            <input
              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              required={field === 'name' || field === 'email' || field === 'role'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Categorie *</label>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setPageMode(selectedMember ? 'view' : 'list')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{pageMode === 'create' ? 'Ajouter' : 'Enregistrer'}</button>
        </div>
      </form>
    </ViewShell>
  );

  if (pageMode === 'create' || pageMode === 'edit') return memberFormPage;

  if (pageMode === 'view' && selectedMember) {
    const m = membersWithWorkload.find((x) => x.id === selectedMember.id) ?? selectedMember;
    return (
      <ViewShell narrow>
        <PageBackHeader
          title={m.name}
          subtitle={<span className="text-indigo-600 font-medium">{m.role}</span>}
          onBack={() => { setPageMode('list'); setSelectedMember(null); }}
          actions={
            <div className="flex gap-2">
              <button type="button" onClick={() => { setForm({ name: m.name, email: m.email, phone: m.phone ?? '', role: m.role, category: m.category, photoUrl: m.photoUrl ?? '' }); setPhotoPreview(m.photoUrl ?? null); setPageMode('edit'); }} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><Pencil className="w-4 h-4" /> Modifier</button>
              <button type="button" onClick={() => removeMember(m.id)} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center gap-4">
            {m.photoUrl ? <img src={m.photoUrl} alt="" className="w-20 h-20 rounded-full" /> : <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">{m.initials}</div>}
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getAvailabilityColor(m.availability)}`}>{m.availability}</span>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2"><Mail className="w-4 h-4" />{m.email}</p>
              {m.phone && <p className="text-sm text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4" />{m.phone}</p>}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Charge : {m.workload}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-full rounded-full ${m.workload >= 80 ? 'bg-red-500' : m.workload >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${m.workload}%` }} /></div>
          </div>
          {m.responsibilities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Responsabilites</h3>
              <ul className="text-sm space-y-1">{m.responsibilities.map((r, i) => <li key={i} className="flex gap-2"><span className="text-indigo-500">-</span>{r}</li>)}</ul>
            </div>
          )}
          {m.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">{m.skills.map((s, i) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">{s}</span>)}</div>
          )}
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Equipe POPY"
        subtitle={<span className="flex items-center flex-wrap gap-1">Gerez votre equipe <TestModeBadge /></span>}
        actions={
          <ActionButton icon={Plus} onClick={() => { setForm(emptyForm); setPhotoPreview(null); setPageMode('create'); }} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0">
            Ajouter un membre
          </ActionButton>
        }
      />

      <div className={viewGrids.stats4}>
        <div className="bg-white p-4 rounded-lg border"><div className="text-2xl font-bold">{membersWithWorkload.length}</div><div className="text-sm text-gray-600">Membres</div></div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200"><div className="text-2xl font-bold text-green-900">{membersWithWorkload.filter((m) => m.availability === 'Disponible').length}</div><div className="text-sm text-green-700">Disponibles</div></div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200"><div className="text-2xl font-bold text-red-900">{membersWithWorkload.filter((m) => m.workload >= 80).length}</div><div className="text-sm text-red-700">Surcharges</div></div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200"><div className="text-2xl font-bold text-indigo-900">{categories.length}</div><div className="text-sm text-indigo-700">Categories</div></div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-lg font-medium ${selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-white border'}`}><Users className="w-4 h-4 inline mr-2" />Tous</button>
        {categories.map((category) => (
          <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg font-medium ${selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>{category}</button>
        ))}
      </div>

      <div className="space-y-6">
        {categories.filter((cat) => !selectedCategory || cat === selectedCategory).map((category) => {
          const categoryMembers = filteredMembers.filter((m) => m.category === category);
          return (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 p-5">
                    <div className="flex items-start gap-4 mb-4">
                      {member.photoUrl ? <img src={member.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl flex items-center justify-center font-bold">{member.initials}</div>}
                      <div className="flex-1 min-w-0">
                        <button type="button" onClick={() => { setSelectedMember(member); setPageMode('view'); }} className="font-bold text-lg hover:text-indigo-600 text-left">{member.name}</button>
                        <p className="text-sm text-indigo-600">{member.role}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs border ${getAvailabilityColor(member.availability)}`}>{member.availability}</span>
                      </div>
                    </div>
                    <div className="space-y-1 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{member.email}</div>
                      {member.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{member.phone}</div>}
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1"><span>Charge</span><span className={`font-bold px-2 py-0.5 rounded ${getWorkloadColor(member.workload)}`}>{member.workload}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-full rounded-full ${member.workload >= 80 ? 'bg-red-500' : member.workload >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${member.workload}%` }} /></div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <button type="button" onClick={() => { setSelectedMember(member); setPageMode('view'); }} className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-sm border rounded-lg hover:bg-gray-50"><Eye className="w-4 h-4" />Voir</button>
                      <button type="button" onClick={() => { setSelectedMember(member); setForm({ name: member.name, email: member.email, phone: member.phone ?? '', role: member.role, category: member.category, photoUrl: member.photoUrl ?? '' }); setPageMode('edit'); }} className="p-2 border rounded-lg hover:bg-gray-50"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removeMember(member.id)} className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {member.trophies.length > 0 && (
                      <div className="pt-3 mt-3 border-t flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        {member.trophies.map((t, i) => <span key={i} className="text-xs bg-yellow-50 px-2 py-1 rounded">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ViewShell>
  );
}
