import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import type { ScrumMeetingRecord } from '../../types/scrumMeetings';
import type { ReportFormState } from '../../utils/meetingFollowUp';
import {
  pdfDataFromForm,
  pdfDataFromMeeting,
  downloadMeetingReportPdf,
  printMeetingReportPdf,
  meetingReportPdfFilename,
} from '../../utils/meetingReportPdf';

interface ExportMeetingReportPdfButtonProps {
  meeting: ScrumMeetingRecord;
  /** Si fourni, exporte l'état courant du formulaire (brouillon). */
  form?: ReportFormState;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ExportMeetingReportPdfButton({
  meeting,
  form,
  variant = 'secondary',
  className = '',
}: ExportMeetingReportPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const data = form ? pdfDataFromForm(meeting, form, !meeting.hasReport) : pdfDataFromMeeting(meeting);

    try {
      await downloadMeetingReportPdf(data);
    } catch {
      try {
        printMeetingReportPdf(data);
      } catch {
        window.alert(
          'Export PDF impossible pour le moment. Réessayez dans quelques secondes.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const base =
    variant === 'primary'
      ? 'inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-semibold shadow-sm'
      : 'inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700';

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={loading}
      className={`${base} disabled:opacity-60 ${className}`}
      title={`Télécharger : ${meetingReportPdfFilename(meeting)}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {loading ? 'Génération…' : 'Télécharger le PDF'}
    </button>
  );
}
