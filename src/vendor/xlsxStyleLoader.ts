/**
 * SheetJS + styles (xlsx-js-style) pour exports Excel graphiques.
 */
// @ts-nocheck

export type StyledCell = {
  v?: string | number;
  t?: string;
  s?: Record<string, unknown>;
};

export type StyledSheet = Record<string, StyledCell> & {
  '!ref'?: string;
  '!cols'?: { wch?: number; wpx?: number }[];
  '!rows'?: { hpt?: number }[];
  '!merges'?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
  '!pane'?: Record<string, unknown>;
};

export type XlsxStyleLib = {
  utils: {
    book_new: () => unknown;
    book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
    encode_cell: (addr: { r: number; c: number }) => string;
    decode_range: (ref: string) => { s: { r: number; c: number }; e: { r: number; c: number } };
    encode_range: (range: { s: { r: number; c: number }; e: { r: number; c: number } }) => string;
  };
  writeFile: (wb: unknown, filename: string) => void;
};

let loading: Promise<XlsxStyleLib> | null = null;

export function loadXlsxStyle(): Promise<XlsxStyleLib> {
  if (!loading) {
    loading = import('./xlsx-style.bundle.js').then(() => {
      const lib =
        (typeof globalThis !== 'undefined' &&
          (globalThis as { XLSX?: XlsxStyleLib }).XLSX) ||
        (typeof window !== 'undefined' && (window as { XLSX?: XlsxStyleLib }).XLSX);
      if (!lib?.utils) {
        throw new Error('xlsx-js-style introuvable');
      }
      return lib;
    });
  }
  return loading;
}
