/**
 * Charge html2pdf.js (vendu localement) pour export PDF direct sans pop-up.
 */
// @ts-nocheck

type Html2PdfWorker = {
  set: (opt: object) => Html2PdfWorker;
  from: (el: HTMLElement) => Html2PdfWorker;
  save: () => Promise<void>;
};

export type Html2PdfFn = () => Html2PdfWorker;

let loading: Promise<Html2PdfFn> | null = null;

export function loadHtml2Pdf(): Promise<Html2PdfFn> {
  if (!loading) {
    loading = import('./html2pdf.bundle.min.js').then(() => {
      const lib =
        (typeof globalThis !== 'undefined' &&
          (globalThis as { html2pdf?: Html2PdfFn }).html2pdf) ||
        (typeof window !== 'undefined' && (window as { html2pdf?: Html2PdfFn }).html2pdf);
      if (!lib) {
        throw new Error('html2pdf.js introuvable — vérifiez src/vendor/html2pdf.bundle.min.js');
      }
      return lib;
    });
  }
  return loading;
}
