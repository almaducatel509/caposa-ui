/**
 * Utilitaires universels d'export CSV / Excel compatibles Microsoft Excel, Google Sheets et LibreOffice.
 *
 * Résout les problèmes d'encodage et de formatage sous Excel :
 * 1. BOM UTF-8 (\uFEFF) en tête de fichier : force Microsoft Excel à lire le fichier en UTF-8,
 *    préservant ainsi l'ensemble des caractères accentués (é, è, ê, à, ç, ï, etc.).
 * 2. Pas de directive "sep=" par défaut : sur Windows Excel, la présence de "sep=" désactive
 *    le BOM UTF-8 et fait basculer Excel en encodage ANSI (Windows-1252), ce qui corrompt les accents.
 * 3. Séparateur ';' par défaut : correspond au standard régional francophone (Haiti, France, Canada)
 *    et garantit que les colonnes se séparent automatiquement dans Excel.
 * 4. Protection contre l'injection de formules CSV (CWE-1236 / CVE CSV injection) : neutralise
 *    les cellules commençant par =, +, -, @, tabulation ou retour chariot en les préfixant par une apostrophe.
 * 5. Respect de la norme RFC 4180 : guillemets doublés et fins de ligne CRLF (\r\n).
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

export interface ExportCSVOptions {
  filename: string;
  headers: string[];
  rows: unknown[][];
  separator?: ';' | ',';
}

export function exportToCSVFile({
  filename,
  headers,
  rows,
  separator = ';',
}: ExportCSVOptions): void {
  const headerLine = headers.map(escapeCSVCell).join(separator);
  const dataLines = rows.map((r) => r.map(escapeCSVCell).join(separator));

  // BOM UTF-8 (\uFEFF) placé directement avant les données
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanFilename = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}_${dateStr}.csv`;

  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
