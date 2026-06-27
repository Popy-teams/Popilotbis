import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Video,
  FileText,
  Link2,
  StickyNote,
  Bell,
  ExternalLink,
  Copy,
  Download,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Target,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import type { CalendarEvent, CalendarEventLink, CalendarEventAttachment } from '../../types/calendarEvent';
import {
  getTypeLabel,
  getPriorityLabel,
  getEventAccentBorder,
  getEventColorClass,
  formatEventDateTime,
  buildGoogleMapsUrl,
  normalizeUrl,
  findScheduleConflicts,
  getCeremonyBadge,
  meetingPrepHints,
} from '../../utils/calendarEventPresentation';
import { downloadIcsEvent } from '../../utils/calendarIcsExport';
import { isEventCoreEditable, saveEnrichment } from '../../utils/calendarEventStore';
import { ViewShell, ActionButton } from '../shared';
import { PageBackHeader } from '../shared/PageBackHeader';

interface DocOption {
  id: string;
  title: string;
}

export interface CalendarEventDetailPageProps {
  event: CalendarEvent;
  allEvents: CalendarEvent[];
  documents: DocOption[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNavigateMeetings: () => void;
  onNavigateTasks: () => void;
  onNavigateDocs: () => void;
  onEventUpdated: (event: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
}

function newId(): string {
  return `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CalendarEventDetailPage({
  event,
  allEvents,
  documents,
  onBack,
  onEdit,
  onDelete,
  onNavigateMeetings,
  onNavigateTasks,
  onNavigateDocs,
  onEventUpdated,
  onDuplicate,
}: CalendarEventDetailPageProps) {
  const [notesDraft, setNotesDraft] = useState(event.notes ?? '');
  const [locationDraft, setLocationDraft] = useState(event.location ?? '');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [attachName, setAttachName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddAttach, setShowAddAttach] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotesDraft(event.notes ?? '');
    setLocationDraft(event.location ?? '');
  }, [event.id, event.notes, event.location]);

  const coreEditable = isEventCoreEditable(event);
  const conflicts = useMemo(() => findScheduleConflicts(event, allEvents), [event, allEvents]);
  const ceremonyBadge = getCeremonyBadge(event.ceremonyType);
  const prepHints = meetingPrepHints(event.ceremonyType);
  const linkedDocs = documents.filter((d) => event.linkedDocumentIds?.includes(d.id));

  const persistEnrichment = (patch: Partial<CalendarEvent>) => {
    saveEnrichment(event.id, patch);
    onEventUpdated({ ...event, ...patch });
  };

  const saveNotes = () => {
    persistEnrichment({ notes: notesDraft.trim() || undefined });
  };

  const saveLocation = () => {
    persistEnrichment({ location: locationDraft.trim() || undefined });
  };

  const addLink = () => {
    if (!linkLabel.trim() || !linkUrl.trim()) return;
    const links: CalendarEventLink[] = [
      ...(event.links ?? []),
      { id: newId(), label: linkLabel.trim(), url: normalizeUrl(linkUrl) },
    ];
    persistEnrichment({ links });
    setLinkLabel('');
    setLinkUrl('');
    setShowAddLink(false);
  };

  const removeLink = (id: string) => {
    persistEnrichment({ links: (event.links ?? []).filter((l) => l.id !== id) });
  };

  const addAttachment = () => {
    if (!attachName.trim() || !attachUrl.trim()) return;
    const attachments: CalendarEventAttachment[] = [
      ...(event.attachments ?? []),
      { id: newId(), name: attachName.trim(), url: normalizeUrl(attachUrl), kind: 'file' },
    ];
    persistEnrichment({ attachments });
    setAttachName('');
    setAttachUrl('');
    setShowAddAttach(false);
  };

  const removeAttachment = (id: string) => {
    persistEnrichment({ attachments: (event.attachments ?? []).filter((a) => a.id !== id) });
  };

  const attachDocument = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    const ids = [...new Set([...(event.linkedDocumentIds ?? []), docId])];
    const attachments: CalendarEventAttachment[] = [
      ...(event.attachments ?? []),
      ...(event.attachments?.some((a) => a.linkedDocumentId === docId)
        ? []
        : [{ id: newId(), name: doc.title, url: '#doc', kind: 'document' as const, linkedDocumentId: docId }]),
    ];
    persistEnrichment({ linkedDocumentIds: ids, attachments });
  };

  const copyVideoLink = async () => {
    if (!event.videoConferenceUrl) return;
    await navigator.clipboard.writeText(event.videoConferenceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ViewShell>
      <PageBackHeader
        title={event.title}
        subtitle={getTypeLabel(event.type)}
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" icon={Download} onClick={() => downloadIcsEvent(event)}>
              Exporter .ics
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => onDuplicate(event)}>
              Dupliquer
            </ActionButton>
            {coreEditable ? (
              <>
                <ActionButton variant="secondary" icon={Pencil} onClick={onEdit}>
                  Modifier
                </ActionButton>
                <ActionButton variant="danger" icon={Trash2} onClick={onDelete}>
                  Supprimer
                </ActionButton>
              </>
            ) : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <article
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 ${getEventAccentBorder(event.type)}`}
          >
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${getEventColorClass(event.type)}`}>
                  {getTypeLabel(event.type)}
                </span>
                {ceremonyBadge ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
                    {ceremonyBadge}
                  </span>
                ) : null}
                {event.priority === 'high' ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                    Priorité haute
                  </span>
                ) : null}
              </div>

              <DetailRow icon={CalendarIcon} title="Date et heure">
                <p className="text-slate-900 font-medium">{formatEventDateTime(event)}</p>
                {event.priority && event.type === 'deadline' ? (
                  <p className="text-sm text-slate-500 mt-1">Priorité : {getPriorityLabel(event.priority)}</p>
                ) : null}
              </DetailRow>

              <DetailRow icon={MapPin} title="Lieu">
                <input
                  type="text"
                  value={locationDraft}
                  onChange={(e) => setLocationDraft(e.target.value)}
                  onBlur={saveLocation}
                  placeholder="Adresse, salle, bâtiment…"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-violet-500"
                />
                {locationDraft.trim() ? (
                  <a
                    href={buildGoogleMapsUrl(locationDraft)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ouvrir dans Google Maps
                  </a>
                ) : null}
              </DetailRow>

              {event.videoConferenceUrl ? (
                <DetailRow icon={Video} title="Visioconférence">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={event.videoConferenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                    >
                      <Video className="w-4 h-4" />
                      Rejoindre la réunion
                    </a>
                    <button
                      type="button"
                      onClick={copyVideoLink}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copié !' : 'Copier le lien'}
                    </button>
                  </div>
                </DetailRow>
              ) : null}

              {event.description ? (
                <DetailRow icon={FileText} title="Description">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                </DetailRow>
              ) : null}

              <DetailRow icon={StickyNote} title="Notes">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  onBlur={saveNotes}
                  rows={4}
                  placeholder="Notes privées, ordre du jour, points à aborder…"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y min-h-[100px]"
                />
                <p className="text-xs text-slate-400 mt-1">Enregistré automatiquement à la sortie du champ.</p>
              </DetailRow>

              {event.participants && event.participants.length > 0 ? (
                <DetailRow icon={Sparkles} title="Participants">
                  <div className="flex flex-wrap gap-2">
                    {event.participants.map((p) => (
                      <span
                        key={p}
                        className="text-sm px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </DetailRow>
              ) : null}

              <DetailRow icon={Link2} title="Liens & ressources">
                <div className="space-y-2">
                  {(event.links ?? []).map((link) => (
                    <div key={link.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-600 hover:underline truncate"
                      >
                        {link.label}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="text-xs text-red-600 hover:underline shrink-0"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                  {showAddLink ? (
                    <div className="p-4 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 space-y-3">
                      <input
                        type="text"
                        placeholder="Libellé (ex. Board Miro)"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="url"
                        placeholder="https://…"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={addLink} className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg">
                          Ajouter
                        </button>
                        <button type="button" onClick={() => setShowAddLink(false)} className="px-3 py-1.5 text-sm text-slate-600">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddLink(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:text-violet-900"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un lien
                    </button>
                  )}
                </div>
              </DetailRow>

              <DetailRow icon={Paperclip} title="Documents & pièces jointes">
                <div className="space-y-2">
                  {(event.attachments ?? []).map((att) => (
                    <div key={att.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{att.name}</p>
                        {att.kind === 'document' ? (
                          <button type="button" onClick={onNavigateDocs} className="text-xs text-indigo-600 hover:underline">
                            Voir dans Documentation
                          </button>
                        ) : (
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                            Ouvrir
                          </a>
                        )}
                      </div>
                      <button type="button" onClick={() => removeAttachment(att.id)} className="text-xs text-red-600 shrink-0">
                        Retirer
                      </button>
                    </div>
                  ))}
                  {linkedDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-sm text-slate-800 flex-1 truncate">{doc.title}</span>
                      <button type="button" onClick={onNavigateDocs} className="text-xs text-indigo-600 font-medium">
                        Ouvrir
                      </button>
                    </div>
                  ))}
                  {showAddAttach ? (
                    <div className="p-4 rounded-xl border border-dashed border-violet-200 space-y-3">
                      <input
                        type="text"
                        placeholder="Nom du fichier"
                        value={attachName}
                        onChange={(e) => setAttachName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="url"
                        placeholder="URL du document"
                        value={attachUrl}
                        onChange={(e) => setAttachUrl(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={addAttachment} className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg">
                          Joindre
                        </button>
                        <button type="button" onClick={() => setShowAddAttach(false)} className="text-sm text-slate-600">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAttach(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700"
                      >
                        <Plus className="w-4 h-4" />
                        URL / fichier
                      </button>
                      {documents.length > 0 ? (
                        <select
                          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) attachDocument(e.target.value);
                            e.target.value = '';
                          }}
                        >
                          <option value="">Lier un document ISO…</option>
                          {documents.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.title}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  )}
                </div>
              </DetailRow>

              {event.reminders && event.reminders.length > 0 ? (
                <DetailRow icon={Bell} title="Rappels">
                  <ul className="space-y-1">
                    {event.reminders.map((r) => (
                      <li key={r.id} className="text-sm text-slate-700">
                        {r.label ?? `${r.minutesBefore} min avant`}
                      </li>
                    ))}
                  </ul>
                </DetailRow>
              ) : null}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          {conflicts.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Conflit d&apos;horaire</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Chevauchement avec {conflicts.length} autre(s) événement(s) :
                  </p>
                  <ul className="mt-2 space-y-1">
                    {conflicts.slice(0, 3).map((c) => (
                      <li key={c.id} className="text-xs text-amber-900">
                        {c.time} — {c.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {event.type === 'meeting' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Checklist pré-réunion
              </h3>
              <ul className="space-y-2">
                {prepHints.map((hint) => (
                  <li key={hint} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-4 h-4 rounded border border-slate-300 shrink-0 mt-0.5" />
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Liens rapides</h3>
            {event.linkedMeetingId ? (
              <ActionButton variant="secondary" icon={Link2} onClick={onNavigateMeetings} className="w-full justify-center">
                Réunion & CR
              </ActionButton>
            ) : null}
            {event.linkedTaskId ? (
              <ActionButton variant="secondary" icon={Target} onClick={onNavigateTasks} className="w-full justify-center">
                Tâche associée
              </ActionButton>
            ) : null}
            {!event.linkedMeetingId && !event.linkedTaskId ? (
              <p className="text-xs text-slate-500">Aucune entité liée — enrichissez via liens ou documentation.</p>
            ) : null}
          </div>

          {event.organizer ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <span className="text-slate-500">Organisateur · </span>
              <span className="font-medium text-slate-800">{event.organizer}</span>
            </div>
          ) : null}
        </aside>
      </div>
    </ViewShell>
  );
}

function DetailRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 h-fit shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</h3>
        {children}
      </div>
    </section>
  );
}
