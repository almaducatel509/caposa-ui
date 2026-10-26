/**
 * reportsPdf.ts — génération des rapports PDF (backend Django)
 * ─────────────────────────────────────────────────────────────────
 *   POST /reports/statement/pdf/   → relevé de compte sur une période
 *   POST /reports/enterprise/pdf/  → rapport d'entreprise mensuel ou annuel
 *
 * Les deux renvoient un fichier PDF (blob). En cas d'erreur, Django
 * renvoie du JSON — on le relit pour afficher un message clair.
 * Aucun fallback : toute erreur remonte à l'UI.
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { isAxiosError } from 'axios';

// ─── Payloads (contrat CS) ────────────────────────────────────────

export interface StatementPdfPayload {
  account_number: string;   // ex. "001-01-007431"
  start_date:     string;   // "YYYY-MM-DD"
  end_date:       string;   // "YYYY-MM-DD"
}

export type EnterprisePdfPayload =
  | { report_type: 'monthly'; year: number; month: number }   // month : 1–12
  | { report_type: 'annual';  year: number };

// ─── Helpers ─────────────────────────────────────────────────────

/** Avec responseType 'blob', une erreur JSON arrive aussi en blob : on la relit. */
async function describePdfError(err: unknown, context: string): Promise<string> {
  if (isAxiosError(err)) {
    if (!err.response) return `${context} : serveur injoignable (${err.message}).`;

    const data = err.response.data;
    if (data instanceof Blob) {
      try {
        const body = JSON.parse(await data.text());
        const msg = body?.message ?? body?.detail ??
          Object.entries(body).map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ');
        if (msg) return `${context} : ${msg}.`;
      } catch { /* pas du JSON */ }
    }
    return `${context} : erreur ${err.response.status}.`;
  }
  if (err instanceof Error) return `${context} : ${err.message}`;
  return `${context} : erreur inconnue.`;
}

async function postPdf(url: string, payload: unknown, context: string): Promise<Blob> {
  try {
    const { data } = await AxiosInstance.post<Blob>(url, payload, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    return data;
  } catch (err) {
    throw new Error(await describePdfError(err, context));
  }
}

/** Déclenche le téléchargement d'un PDF dans le navigateur. */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Ouvre le PDF dans un nouvel onglet (aperçu / impression). */
export function openPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ─── Appels API ──────────────────────────────────────────────────

/** POST /reports/statement/pdf/ — relevé de compte. */
export function fetchStatementPdf(payload: StatementPdfPayload): Promise<Blob> {
  if (payload.start_date > payload.end_date) {
    return Promise.reject(new Error('La date de début doit précéder la date de fin.'));
  }
  return postPdf('/reports/statement/pdf/', payload, 'Impossible de générer le relevé');
}

/** POST /reports/enterprise/pdf/ — rapport mensuel ou annuel. */
export function fetchEnterprisePdf(payload: EnterprisePdfPayload): Promise<Blob> {
  if (payload.report_type === 'monthly' && (payload.month < 1 || payload.month > 12)) {
    return Promise.reject(new Error('Le mois doit être compris entre 1 et 12.'));
  }
  return postPdf('/reports/enterprise/pdf/', payload, 'Impossible de générer le rapport');
}

// ─── Noms de fichiers ────────────────────────────────────────────

export function statementFilename(p: StatementPdfPayload): string {
  return `releve_${p.account_number}_${p.start_date}_${p.end_date}.pdf`;
}

export function enterpriseFilename(p: EnterprisePdfPayload): string {
  return p.report_type === 'monthly'
    ? `rapport_mensuel_${p.year}-${String(p.month).padStart(2, '0')}.pdf`
    : `rapport_annuel_${p.year}.pdf`;
}