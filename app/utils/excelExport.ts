import ExcelJS from 'exceljs';
import { CAPOSA_LOGO_BASE64 } from './logoBase64';

export interface ExportExcelOptions {
  filename: string;
  documentTitle?: string;
  headers: string[];
  rows: unknown[][];
  sheetName?: string;
  separator?: string;
}

/**
 * Nettoie une valeur de cellule pour l'export Excel :
 * - Gère les dates, nombres, booléens et objets
 * - Protège contre l'injection de formules (CWE-1236)
 */
function cleanCellValue(val: unknown): { value: ExcelJS.CellValue; isNumeric: boolean; isDate: boolean } {
  if (val === null || val === undefined) {
    return { value: '', isNumeric: false, isDate: false };
  }

  if (typeof val === 'number') {
    return { value: val, isNumeric: true, isDate: false };
  }

  if (typeof val === 'boolean') {
    return { value: val ? 'Oui' : 'Non', isNumeric: false, isDate: false };
  }

  if (val instanceof Date) {
    return { value: val.toISOString().slice(0, 10), isNumeric: false, isDate: true };
  }

  let str = typeof val === 'object' ? JSON.stringify(val) : String(val).trim();

  // Détection des montants formatés (ex: "5000 HTG", "12,500.00 USD")
  const numericMatch = str.match(/^([+-]?[\d\s,.]+)\s*(HTG|USD|Gdes|\$|€)?$/i);
  if (numericMatch) {
    const rawNum = numericMatch[1].replace(/[\s,]/g, '');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && numericMatch[2]) {
      // On conserve le format avec devise mais propre
      return { value: str, isNumeric: false, isDate: false };
    }
  }

  // Protection contre l'injection de formules dans Excel
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  const isDateStr = /^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{2}\/\d{2}\/\d{4}/.test(str);
  return { value: str, isNumeric: false, isDate: isDateStr };
}

/**
 * Génère et télécharge un classeur Excel (.xlsx) professionnel aux couleurs de CAPOSA :
 * 1. En-tête institutionnel complet identique au PDF (Logo officiel, coordonnées, titre du rapport, date)
 * 2. En-têtes de colonnes vert corporate (#2E7D32) avec texte blanc en gras
 * 3. Données avec alternance de lignes (zebra), bordures nettes et typographie soignée
 * 4. Alignement intelligent (montants à droite, dates au centre, textes à gauche)
 * 5. Calcul automatique de la largeur optimale des colonnes (taille adaptée avec marge de confort)
 */
export async function exportToXLSXFile({
  filename,
  documentTitle,
  headers,
  rows,
  sheetName = 'Données',
}: ExportExcelOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CAPOSA Microfinance';
  workbook.lastModifiedBy = 'Système CAPOSA';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ showGridLines: true }],
  });

  const totalCols = Math.max(headers.length, 3);
  const rightColIdx = totalCols;

  // 1. Définition des hauteurs de lignes de l'en-tête
  worksheet.getRow(1).height = 22;
  worksheet.getRow(2).height = 16;
  worksheet.getRow(3).height = 16;
  worksheet.getRow(4).height = 16;
  worksheet.getRow(5).height = 12; // Espaceur
  worksheet.getRow(6).height = 28; // En-tête du tableau

  // 2. Intégration du logo officiel (haut gauche)
  try {
    if (CAPOSA_LOGO_BASE64) {
      const imageId = workbook.addImage({
        base64: CAPOSA_LOGO_BASE64,
        extension: 'png',
      });
      worksheet.addImage(imageId, {
        tl: { col: 0.15, row: 0.2 },
        ext: { width: 50, height: 50 },
      });
    }
  } catch (err) {
    console.warn('Impossible d\'intégrer le logo Excel:', err);
  }

  // 3. Bloc institutionnel gauche (Coordonnées CAPOSA)
  const bankCol = headers.length >= 2 ? 'B' : 'A';

  const cellBank1 = worksheet.getCell(`${bankCol}1`);
  cellBank1.value = "Caisse Populaire Solidarité Pour l'Avenir";
  cellBank1.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF0F172A' } };
  cellBank1.alignment = { vertical: 'middle', horizontal: 'left' };

  const cellBank2 = worksheet.getCell(`${bankCol}2`);
  cellBank2.value = '45, Rue Capois, Port-au-Prince, Haïti';
  cellBank2.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  cellBank2.alignment = { vertical: 'middle', horizontal: 'left' };

  const cellBank3 = worksheet.getCell(`${bankCol}3`);
  cellBank3.value = 'Tél. +509 2813-4500 • info@caposa.ht';
  cellBank3.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  cellBank3.alignment = { vertical: 'middle', horizontal: 'left' };

  const cellBank4 = worksheet.getCell(`${bankCol}4`);
  cellBank4.value = 'www.caposa.ht';
  cellBank4.font = { name: 'Calibri', size: 9, color: { argb: 'FF2E7D32' }, underline: true };
  cellBank4.alignment = { vertical: 'middle', horizontal: 'left' };

  // 4. Bloc institutionnel droit (Titre & Date d'exportation)
  const displayTitle = (
    documentTitle ||
    filename.replace(/[_-]/g, ' ').replace(/\.xlsx$/i, '').toUpperCase()
  ).trim();

  const cellRight1 = worksheet.getCell(1, rightColIdx);
  cellRight1.value = 'CAPOSA';
  cellRight1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF2E7D32' } };
  cellRight1.alignment = { vertical: 'middle', horizontal: 'right' };

  const cellRight2 = worksheet.getCell(2, rightColIdx);
  cellRight2.value = displayTitle;
  cellRight2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  cellRight2.alignment = { vertical: 'middle', horizontal: 'right' };

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const cellRight3 = worksheet.getCell(3, rightColIdx);
  cellRight3.value = `Exporté le ${dateStr} à ${timeStr}`;
  cellRight3.font = { name: 'Calibri', size: 8.5, italic: true, color: { argb: 'FF64748B' } };
  cellRight3.alignment = { vertical: 'middle', horizontal: 'right' };

  // 5. En-têtes de colonnes du tableau (Ligne 6)
  const headerRow = worksheet.getRow(6);
  headerRow.values = headers;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF236327' } },
      bottom: { style: 'medium', color: { argb: 'FF1B5E20' } },
      left: { style: 'thin', color: { argb: 'FF388E3C' } },
      right: { style: 'thin', color: { argb: 'FF388E3C' } },
    };
  });

  // 6. Remplissage des lignes de données (Ligne 7+)
  const dataRowStart = 7;
  const colMaxLength: number[] = headers.map((h) => String(h || '').length);

  rows.forEach((rowValues, rIdx) => {
    const rowNum = dataRowStart + rIdx;
    const row = worksheet.getRow(rowNum);
    row.height = 21;
    const isEven = rIdx % 2 === 1;

    headers.forEach((_, cIdx) => {
      const rawVal = rowValues[cIdx];
      const { value, isNumeric, isDate } = cleanCellValue(rawVal);
      const cell = row.getCell(cIdx + 1);
      cell.value = value;

      // Calcul de la longueur pour la largeur de colonne
      const strLen = String(value ?? '').length;
      if (strLen > (colMaxLength[cIdx] || 0)) {
        colMaxLength[cIdx] = strLen;
      }

      // Typographie
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };

      // Zebra striping
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }

      // Bordures discrètes
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Alignement intelligent
      if (isNumeric) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = Number.isInteger(value) ? '#,##0' : '#,##0.00';
      } else if (isDate) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        const valStr = String(value);
        if (
          valStr.length <= 10 &&
          (/^(Actif|Inactif|Bloqu|En attente|Clôturé|Validé|Rejeté|Dépôt|Retrait|Virement|Frais|Crédit)/i.test(valStr) ||
            /^[A-Z0-9_-]{2,8}$/.test(valStr))
        ) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (/[\d,.]+\s*(HTG|USD|Gdes|\$)/i.test(valStr)) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
    });
  });

  // 7. Ajustement automatique de la taille des cellules (largeur des colonnes)
  headers.forEach((_, cIdx) => {
    const col = worksheet.getColumn(cIdx + 1);
    const maxContent = colMaxLength[cIdx] || 10;
    // Marge de confort de +4 caractères, minimum 14, maximum 52
    let calculatedWidth = Math.max(maxContent + 4, 14);
    if (cIdx === 0 && headers.length >= 2) {
      // Colonne 1 avec logo au-dessus : minimum 16 pour laisser de l'espace
      calculatedWidth = Math.max(calculatedWidth, 16);
    }
    col.width = Math.min(calculatedWidth, 52);
  });

  // 8. Ligne de pied de page institutionnelle
  const lastDataRow = dataRowStart + rows.length;
  const footerRow = worksheet.getRow(lastDataRow + 1);
  footerRow.height = 18;
  const footerCell = footerRow.getCell(1);
  footerCell.value = 'Document généré automatiquement par le système CAPOSA • Confidentiel • Usage interne uniquement';
  footerCell.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF94A3B8' } };
  footerCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // 9. Génération du buffer et téléchargement dans le navigateur
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const ymd = now.toISOString().slice(0, 10);
  const cleanBase = filename.replace(/\.xlsx$/i, '').replace(/\.csv$/i, '');
  link.download = `${cleanBase}_${ymd}.xlsx`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
