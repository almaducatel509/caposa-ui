import { exportToXLSXFile, ExportExcelOptions } from './excelExport';

export { exportToXLSXFile };
export type { ExportExcelOptions };

export interface ExportCSVOptions {
  filename: string;
  headers: string[];
  rows: unknown[][];
  documentTitle?: string;
  separator?: ';' | ',';
}

/**
 * Nettoie une cellule pour le format CSV si nécessaire (compatibilité descendante).
 */
export function escapeCSVCell(val: unknown): string {
  if (val === null || val === undefined) return '""';

  let str: string;
  if (val instanceof Date) {
    str = val.toISOString();
  } else if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }

  // Protection contre l'injection de formule dans Excel
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exporte les données au format XLSX avec en-tête institutionnel complet (comme le PDF)
 * et ajustement automatique de la taille des cellules.
 */
export function exportToCSVFile(options: ExportCSVOptions): void {
  // Redirige automatiquement vers l'export XLSX enrichi
  exportToXLSXFile({
    filename: options.filename,
    documentTitle: options.documentTitle,
    headers: options.headers,
    rows: options.rows,
  }).catch((err) => {
    console.error('Erreur export XLSX:', err);
  });
}
