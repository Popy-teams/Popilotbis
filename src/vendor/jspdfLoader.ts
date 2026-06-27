/**
 * jsPDF + autotable pour exports PDF vectoriels haute qualité.
 */
// @ts-nocheck

export type JsPdfDoc = {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number }; getNumberOfPages: () => number };
  setFillColor: (...args: number[]) => void;
  setDrawColor: (...args: number[]) => void;
  setTextColor: (...args: number[]) => void;
  setFont: (font: string, style?: string) => void;
  setFontSize: (size: number) => void;
  text: (text: string, x: number, y: number, options?: Record<string, unknown>) => void;
  rect: (x: number, y: number, w: number, h: number, style?: string) => void;
  roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  addPage: () => void;
  setPage: (page: number) => void;
  save: (filename: string) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  getTextWidth: (text: string) => number;
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable?: { finalY: number };
};

export type JsPdfConstructor = new (options?: Record<string, unknown>) => JsPdfDoc;

export type JsPdfBundle = {
  jsPDF: JsPdfConstructor;
};

let loading: Promise<JsPdfBundle> | null = null;

export function loadJsPdf(): Promise<JsPdfBundle> {
  if (!loading) {
    loading = (async () => {
      await import('./jspdf.umd.min.js');
      await import('./jspdf-autotable.min.js');
      const lib =
        (typeof globalThis !== 'undefined' &&
          (globalThis as { jspdf?: { jsPDF: JsPdfConstructor } }).jspdf) ||
        (typeof window !== 'undefined' && (window as { jspdf?: { jsPDF: JsPdfConstructor } }).jspdf);
      if (!lib?.jsPDF) {
        throw new Error('jsPDF introuvable');
      }
      return { jsPDF: lib.jsPDF };
    })();
  }
  return loading;
}
