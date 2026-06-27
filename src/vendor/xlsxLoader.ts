/**
 * Charge SheetJS (vendu localement) pour générer de vrais fichiers .xlsx.
 */
// @ts-nocheck
import './xlsx.min.js';

type XlsxLib = {
  utils: {
    book_new: () => unknown;
    book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
    aoa_to_sheet: (data: unknown[][]) => Record<string, unknown>;
  };
  writeFile: (wb: unknown, filename: string) => void;
};

function resolveXlsx(): XlsxLib {
  const lib =
    (typeof globalThis !== 'undefined' &&
      (globalThis as { XLSX?: XlsxLib }).XLSX) ||
    (typeof window !== 'undefined' && (window as { XLSX?: XlsxLib }).XLSX);

  if (!lib?.utils) {
    throw new Error('SheetJS (XLSX) introuvable — vérifiez src/vendor/xlsx.min.js');
  }
  return lib;
}

const XLSX: XlsxLib = new Proxy({} as XlsxLib, {
  get(_target, prop) {
    return resolveXlsx()[prop as keyof XlsxLib];
  },
});

export default XLSX;
