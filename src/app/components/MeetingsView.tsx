import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Edit,
  Eye,
  RotateCcw,
  Save,
  Trash2,
  Pencil,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PageBackHeader } from './shared/PageBackHeader';
import { useProjectContext } from '../context/ProjectContext';
import { DEMO_MEETINGS_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import { calculateCurrentWriter, calculateNextWriter } from '../types/meetings';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';

type PageMode = 'list' | 'create' | 'view' | 'edit' | 'report';

interface LocalMeeting {
  id: number;
  number: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  participants: number;
  participantNames?: string[];
  writerId: string;
  writerName: string;
  status: 'planned' | 'in-progress' | 'completed';
  hasReport: boolean;
  projectId?: string;
  projectName: string;
  decisions: number;
  actions: number;
  reportDecisions?: string;
  reportActions?: string;
}

const INITIAL_MEETINGS: LocalMeeting[] = [
  {
    id: 1,
    number: 12,
    title: 'Sprint Review #12 - POPY',
    date: '2026-01-17',
    time: '14:00',
    duration: 120,
    participants: 8,
    writerId: 'user-2',
    writerName: 'Alice Chevalier',
    status: 'planned',
    hasReport: false,
    projectName: 'POPY',
    decisions: 0,
    actions: 0,
  },
  {
    id: 2,
    number: 11,
    title: 'Sprint Review #11 - POPY',
    date: '2026-01-03',
    time: '14:00',
    duration: 90,
    participants: 8,
    writerId: 'user-1',
    writerName: 'Mériem Alami',
    status: 'completed',
    hasReport: true,
    projectName: 'POPY',
    decisions: 4,
    actions: 12,
  },
  {
    id: 3,
    number: 10,
    title: 'Comité Pilotage POPY',
    date: '2025-12-20',
    time: '10:00',
    duration: 120,
    participants: 10,
    writerId: 'user-3',
    writerName: 'Thomas Serrano',
    status: 'completed',
    hasReport: true,
    projectName: 'POPY',
    decisions: 7,
    actions: 8,
  },
  {
    id: 4,
    number: 9,
    title: 'Revue Technique Hardware',
    date: '2025-12-15',
    time: '15:00',
    duration: 60,
    participants: 5,
    writerId: 'user-4',
    writerName: 'Paul Leblanc',
    status: 'completed',
    hasReport: true,
    projectName: 'POPY',
    decisions: 3,
    actions: 6,
  },
];

const TEAM_MEMBERS = [
  'Mériem Alami',
  'Alice Chevalier',
  'Thomas Serrano',
  'Paul Leblanc',
  'Marie Laurent',
  'Jean Dupont',
  'Aline Moreau',
  'Karim Benali',
];

const ROTATION = {
  id: 'rotation-1',
  projectId: 'popy',
  membersOrder: ['user-1', 'user-2', 'user-3', 'user-4'],
  memberNames: ['Mériem Alami', 'Alice Chevalier', 'Thomas Serrano', 'Paul Leblanc'],
  periodDays: 15,
  startDate: '2026-01-01',
};

const emptyForm = {
  title: '',
  date: '',
  time: '14:00',
  duration: 60,
  participants: [] as string[],
};

function countLines(text: string): number {
  return text.split('\n').filter((l) => l.trim()).length;
}

export function MeetingsView() {
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [meetings, setMeetings] = useState<LocalMeeting[]>(INITIAL_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<LocalMeeting | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [reportDecisions, setReportDecisions] = useState('');
  const [reportActions, setReportActions] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:meetings-local');
      const saved = raw ? (JSON.parse(raw) as LocalMeeting[]) : [];
      setMeetings(mergeDemoData(saved, DEMO_MEETINGS_BY_PROJECT, INITIAL_MEETINGS));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:meetings-local', JSON.stringify(meetings));
    } catch {
      /* ignore */
    }
  }, [meetings]);

  const scopedMeetings = useMemo(
    () => meetings.filter((m) => matchesProject(m.projectId ?? 'popy')),
    [meetings, matchesProject]
  );

  const currentWriterId = calculateCurrentWriter(ROTATION, new Date().toISOString());
  const currentWriterIndex = ROTATION.membersOrder.indexOf(currentWriterId);
  const currentWriterName = ROTATION.memberNames[currentWriterIndex];
  const nextWriter = calculateNextWriter(ROTATION, currentWriterId);
  const nextWriterIndex = ROTATION.membersOrder.indexOf(nextWriter.nextWriterId);
  const nextWriterName = ROTATION.memberNames[nextWriterIndex];

  const upcomingMeetings = scopedMeetings.filter((m) => m.status === 'planned');
  const pastMeetings = scopedMeetings.filter((m) => m.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWriterForDate = (date: string) => {
    const writerId = calculateCurrentWriter(ROTATION, date);
    const idx = ROTATION.membersOrder.indexOf(writerId);
    return { writerId, writerName: ROTATION.memberNames[idx] ?? 'Non assigné' };
  };

  const toggleParticipant = (name: string) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(name)
        ? prev.participants.filter((p) => p !== name)
        : [...prev.participants, name],
    }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setSelectedMeeting(null);
    setPageMode('create');
  };

  const openEdit = (meeting: LocalMeeting) => {
    setSelectedMeeting(meeting);
    setForm({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      participants: meeting.participantNames ?? [],
    });
    setPageMode('edit');
  };

  const openView = (meeting: LocalMeeting) => {
    setSelectedMeeting(meeting);
    setPageMode('view');
  };

  const openReport = (meeting: LocalMeeting) => {
    setSelectedMeeting(meeting);
    setReportDecisions(meeting.reportDecisions ?? '');
    setReportActions(meeting.reportActions ?? '');
    setPageMode('report');
  };

  const deleteMeeting = (id: number) => {
    if (!confirm('Supprimer cette réunion ?')) return;
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setSelectedMeeting(null);
    setPageMode('list');
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const { writerId, writerName } = getWriterForDate(form.date);

    if (pageMode === 'create') {
      const nextNumber = Math.max(0, ...meetings.map((m) => m.number)) + 1;
      const nextId = Math.max(0, ...meetings.map((m) => m.id)) + 1;
      const created: LocalMeeting = {
        id: nextId,
        number: nextNumber,
        title: form.title,
        date: form.date,
        time: form.time,
        duration: form.duration,
        participants: form.participants.length,
        participantNames: form.participants,
        writerId,
        writerName,
        status: 'planned',
        hasReport: false,
        projectId: activeProjectSlug ?? 'popy',
        projectName: activeProject?.name ?? 'POPY',
        decisions: 0,
        actions: 0,
      };
      setMeetings((prev) => [created, ...prev]);
      setPageMode('list');
    } else if (pageMode === 'edit' && selectedMeeting) {
      const updated: LocalMeeting = {
        ...selectedMeeting,
        title: form.title,
        date: form.date,
        time: form.time,
        duration: form.duration,
        participants: form.participants.length,
        participantNames: form.participants,
        writerId,
        writerName,
      };
      setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedMeeting(updated);
      setPageMode('view');
    }
    setForm(emptyForm);
  };

  const publishReport = () => {
    if (!selectedMeeting) return;
    const decisions = countLines(reportDecisions);
    const actions = countLines(reportActions);
    const updated: LocalMeeting = {
      ...selectedMeeting,
      status: 'completed',
      hasReport: true,
      decisions,
      actions,
      reportDecisions,
      reportActions,
    };
    setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelectedMeeting(null);
    setPageMode('list');
  };

  const meetingFormPage = (
    <ViewShell narrow>
      <PageBackHeader
        title={pageMode === 'create' ? 'Planifier une réunion' : 'Modifier la réunion'}
        subtitle="Traçabilité ISO 9001"
        onBack={() => setPageMode(pageMode === 'edit' && selectedMeeting ? 'view' : 'list')}
      />
      <form onSubmit={submitForm} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Titre de la réunion *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: Sprint Review #13 - POPY"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Heure *</label>
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Durée (minutes) *</label>
          <select
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value, 10) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 heure</option>
            <option value={90}>1h30</option>
            <option value={120}>2 heures</option>
            <option value={180}>3 heures</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Participants *</label>
          <div className="grid grid-cols-2 gap-2">
            {TEAM_MEMBERS.map((member) => (
              <label
                key={member}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.participants.includes(member)}
                  onChange={() => toggleParticipant(member)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{member}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{form.participants.length} participant(s) sélectionné(s)</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Rédacteur automatique
          </h4>
          <p className="text-sm text-purple-800">
            Le rédacteur sera calculé automatiquement selon la rotation configurée (tous les {ROTATION.periodDays} jours).
          </p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setPageMode(pageMode === 'edit' && selectedMeeting ? 'view' : 'list')}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {pageMode === 'create' ? 'Planifier' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </ViewShell>
  );

  if (pageMode === 'create' || pageMode === 'edit') return meetingFormPage;

  if (pageMode === 'view' && selectedMeeting) {
    const meeting = selectedMeeting;
    return (
      <ViewShell>
        <PageBackHeader
          title={meeting.title}
          subtitle={
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm">#{meeting.number}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                {meeting.status === 'completed' ? 'Publié' : 'Planifiée'}
              </span>
            </span>
          }
          onBack={() => { setPageMode('list'); setSelectedMeeting(null); }}
          actions={
            <div className="flex gap-2">
              {meeting.status === 'planned' && (
                <button
                  type="button"
                  onClick={() => openReport(meeting)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                  Rédiger CR
                </button>
              )}
              <button
                type="button"
                onClick={() => openEdit(meeting)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => deleteMeeting(meeting.id)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              {meeting.time} ({meeting.duration} min)
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4" />
              {meeting.participants} participants
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="w-4 h-4" />
              Rédacteur : {meeting.writerName}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{meeting.projectName}</span>
            {meeting.hasReport && (
              <>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {meeting.decisions} décisions
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {meeting.actions} actions
                </span>
              </>
            )}
          </div>
          {meeting.reportDecisions && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Décisions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.reportDecisions}</p>
            </div>
          )}
          {meeting.reportActions && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.reportActions}</p>
            </div>
          )}
        </div>
      </ViewShell>
    );
  }

  if (pageMode === 'report' && selectedMeeting) {
    const meeting = selectedMeeting;
    return (
      <ViewShell narrow>
        <PageBackHeader
          title={`Compte rendu — ${meeting.title}`}
          subtitle={
            <span className="flex items-center gap-2 flex-wrap text-sm">
              <span className="font-mono">#{meeting.number}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(meeting.date).toLocaleDateString('fr-FR')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                <FileText className="w-3 h-3" />
                {meeting.writerName}
              </span>
            </span>
          }
          onBack={() => { setPageMode('list'); setSelectedMeeting(null); }}
        />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Décisions</label>
            <textarea
              rows={6}
              value={reportDecisions}
              onChange={(e) => setReportDecisions(e.target.value)}
              placeholder="Une décision par ligne..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
            <textarea
              rows={6}
              value={reportActions}
              onChange={(e) => setReportActions(e.target.value)}
              placeholder="Une action par ligne..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => { setPageMode('list'); setSelectedMeeting(null); }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={publishReport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Publier le compte rendu
            </button>
          </div>
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Réunions & Comptes Rendus"
        subtitle="Traçabilité ISO 9001 - Décisions & Actions documentées"
        actions={<ActionButton icon={Plus} onClick={openCreate}>Planifier une réunion</ActionButton>}
      />

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600 text-white rounded-lg">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 text-lg mb-3">
              Rotation automatique du rédacteur (tous les {ROTATION.periodDays} jours)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Rédacteur actuel</div>
                <div className="text-xl font-bold text-purple-900">{currentWriterName}</div>
                <div className="text-xs text-gray-500 mt-1">Période en cours jusqu&apos;au {nextWriter.startDate}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Prochain rédacteur</div>
                <div className="text-xl font-bold text-purple-900">{nextWriterName}</div>
                <div className="text-xs text-gray-500 mt-1">À partir du {nextWriter.startDate}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-purple-800">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="flex items-center flex-wrap gap-1">
                Ordre de rotation :
                {ROTATION.memberNames.map((name, idx) => (
                  <span key={idx} className="inline-flex items-center">
                    {idx > 0 && <ArrowRight className="w-3 h-3 mx-1 text-purple-600" />}
                    <strong className={name === currentWriterName ? 'text-purple-900' : ''}>{name}</strong>
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={viewGrids.stats4}>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Réunions planifiées</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingMeetings.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600 bg-blue-100 p-2 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CR publiés</p>
              <p className="text-2xl font-bold text-green-600">{pastMeetings.length}</p>
            </div>
            <FileText className="w-10 h-10 text-green-600 bg-green-100 p-2 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Décisions tracées</p>
              <p className="text-2xl font-bold text-purple-600">
                {pastMeetings.reduce((acc, m) => acc + m.decisions, 0)}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-purple-600 bg-purple-100 p-2 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actions créées</p>
              <p className="text-2xl font-bold text-orange-600">
                {pastMeetings.reduce((acc, m) => acc + m.actions, 0)}
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-orange-600 bg-orange-100 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {upcomingMeetings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Réunions à venir
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {upcomingMeetings.map((meeting) => {
              const daysUntil = Math.ceil(
                (new Date(meeting.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isToday = daysUntil === 0;
              const isSoon = daysUntil <= 2 && daysUntil > 0;

              return (
                <div
                  key={meeting.id}
                  className={`border-2 rounded-xl p-6 ${
                    isToday ? 'border-blue-500 bg-blue-50' : isSoon ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-500">#{meeting.number}</span>
                        <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
                        {isToday && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">AUJOURD&apos;HUI</span>
                        )}
                        {isSoon && (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full font-semibold">DANS {daysUntil}J</span>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.time} ({meeting.duration} min)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.participants} participants
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200 font-medium inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Rédacteur : {meeting.writerName}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{meeting.projectName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openReport(meeting)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Rédiger CR
                      </button>
                      <button
                        onClick={() => openView(meeting)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Voir"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  {meeting.writerName === currentWriterName && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-900">Vous êtes le rédacteur de cette réunion</p>
                          <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1 flex-wrap">
                            {daysUntil === 0 ? (
                              <>
                                <FileText className="w-3 h-3" />
                                Trame prête, remplissez pendant la réunion
                              </>
                            ) : daysUntil === 1 ? (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                Demain : préparez-vous à rédiger le CR
                              </>
                            ) : (
                              `Rédaction du CR dans ${daysUntil} jours`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Historique des comptes rendus
          </h2>
        </div>
        <TableWrap>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réunion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rédacteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Décisions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pastMeetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-500">#{meeting.number}</span>
                      <div>
                        <div className="font-medium text-gray-900">{meeting.title}</div>
                        <div className="text-xs text-gray-500">{meeting.projectName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(meeting.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{meeting.writerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      {meeting.decisions} décisions
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {meeting.actions} actions
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status === 'completed' ? 'Publié' : 'En cours'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button onClick={() => openView(meeting)} className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Voir">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => deleteMeeting(meeting.id)} className="p-2 hover:bg-red-50 rounded transition-colors" aria-label="Supprimer">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </div>
    </ViewShell>
  );
}
