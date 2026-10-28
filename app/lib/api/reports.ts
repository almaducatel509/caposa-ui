/**
 * reports.ts  —  API layer rapports & relevés
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/lib/api/reports.ts
 *
 * Appels HTTP uniquement, même règle que loans.ts et caisse.ts :
 * aucun mock, aucun fallback silencieux.
 * Remplace app/api/reports/route.ts (mock Next) et lib/mockRapports.ts.
 *
 * Aligné sur caposa-api master @ 53e4c51 (vérifié en local le 2026-10-28).
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { describeError } from './caisse';

// ─── Choix Django (reports/models.py) ─────────────────────────────

export const REPORT_TYPES = {
  liquidite:        'Liquidité',
  solvabilite:      'Solvabilité',
  endettement:      'Endettement',
  conformite:       'Conformité',
  prets_souffrance: 'Prêts en souffrance',
  mensuel:          'Rapport Mensuel Entreprise',
  annuel:           'Rapport Annuel Entreprise',
  activite:         'Rapport d’Activité',
} as const;
export type ReportType = keyof typeof REPORT_TYPES;

export const REPORT_STATUTS = { conforme: 'Conforme', alerte: 'Alerte', critique: 'Critique' } as const;
export type ReportStatut = keyof typeof REPORT_STATUTS;

export const REPORT_ETATS = { actif: 'Actif', archive: 'Archivé' } as const;
export type ReportEtat = keyof typeof REPORT_ETATS;

export const REPORT_PERIODES = { semaine: 'Semaine', mois: 'Mois', annee: 'Année' } as const;
export type ReportPeriode = keyof typeof REPORT_PERIODES;

// ─── Formes renvoyées par DRF ─────────────────────────────────────

type Decimal = string | number | null | undefined;

export interface ReportSnapshot {
  kpiPrincipal?:   unknown;
  kpisDetailles?:  unknown[];
  recommandations?: unknown[];
  [key: string]:   unknown;
}

export interface ReportData {
  id:              string;
  type:            ReportType;
  periode:         ReportPeriode;
  periode_libelle: string;
  date_debut:      string | null;
  date_fin:        string | null;
  snapshot:        ReportSnapshot;
  statut:          ReportStatut;
  etat:            ReportEtat;
  /** Versionnée si un même mois est regénéré : RAP-M-2026-10, -02, -03… */
  reference:       string;
  hasPdf:          boolean;
  genere_par_nom:  string;
  genere_le:       string;
  updated_at:      string;
}

interface ReportApiRaw {
  id:              string;
  type:            ReportType;
  periode:         ReportPeriode;
  periode_libelle: string;
  date_debut:      string | null;
  date_fin:        string | null;
  snapshot:        ReportSnapshot | null;
  statut:          ReportStatut;
  etat:            ReportEtat;
  reference:       string;
  pdf_file:        string | null;
  pdf_url:         string | null;
  genere_par:      string | number | null;
  genere_par_info: { id: string | null; nom: string } | null;
  genere_le:       string;
  updated_at:      string;
}

export interface AccountStatementData {
  id:             string;
  reference:      string;
  account:        string;
  account_number: string;
  member_name:    string | null;
  date_debut:     string;
  date_fin:       string;
  solde_initial:  number;
  solde_final:    number;
  total_credits:  number;
  total_debits:   number;
  hasPdf:         boolean;
  genere_par_nom: string;
  created_at:     string;
}

interface AccountStatementApiRaw {
  id:             string;
  reference:      string;
  account:        string;
  account_number: string;
  member_name:    string | null;
  date_debut:     string;
  date_fin:       string;
  solde_initial:  Decimal;
  solde_final:    Decimal;
  total_credits:  Decimal;
  total_debits:   Decimal;
  pdf_file:       string | null;
  pdf_url:        string | null;
  genere_par:     string | number | null;
  genere_par_nom: string;
  created_at:     string;
}

/** Réponse de génération quand download=false (HTTP 201). */
export interface GeneratedPdf {
  /** id du Report / AccountStatement créé → downloadReportPdf / downloadStatementPdf */
  id:         string;
  reference:  string;
  filename:   string;
  /** Rapports seulement, ex. "Octobre 2026" */
  periode?:   string;
  // Relevés seulement
  solde_initial?:      number;
  solde_final?:        number;
  total_credits?:      number;
  total_debits?:       number;
  transactions_count?: number;
}

const num = (v: Decimal): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const optNum = (v: Decimal): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const mapReport = (r: ReportApiRaw): ReportData => ({
  id:              String(r.id),
  type:            r.type,
  periode:         r.periode,
  periode_libelle: r.periode_libelle ?? '',
  date_debut:      r.date_debut ?? null,
  date_fin:        r.date_fin ?? null,
  snapshot:        r.snapshot ?? {},
  statut:          r.statut,
  etat:            r.etat,
  reference:       r.reference,
  hasPdf:          Boolean(r.pdf_file),
  genere_par_nom:  r.genere_par_info?.nom ?? 'Système',
  genere_le:       r.genere_le,
  updated_at:      r.updated_at,
});

const mapStatement = (r: AccountStatementApiRaw): AccountStatementData => ({
  id:             String(r.id),
  reference:      r.reference,
  account:        String(r.account),
  account_number: r.account_number ?? '',
  member_name:    r.member_name ?? null,
  date_debut:     r.date_debut,
  date_fin:       r.date_fin,
  solde_initial:  num(r.solde_initial),
  solde_final:    num(r.solde_final),
  total_credits:  num(r.total_credits),
  total_debits:   num(r.total_debits),
  hasPdf:         Boolean(r.pdf_file),
  genere_par_nom: r.genere_par_nom ?? 'Système',
  created_at:     r.created_at,
});

const unwrapList = <T,>(data: T[] | { results?: T[] }): T[] =>
  Array.isArray(data) ? data : data?.results ?? [];

// ─── Téléchargement des PDF ───────────────────────────────────────
// On passe toujours par axios (token JWT) plutôt que par pdf_url :
// /media/ n'est servi par Django qu'en DEBUG.

export interface PdfFile {
  blob:     Blob;
  filename: string;
}

function filenameFrom(headers: Record<string, unknown>, fallback: string): string {
  const custom = headers['x-report-file-name'];
  if (typeof custom === 'string' && custom) return custom;
  const cd = headers['content-disposition'];
  if (typeof cd === 'string') {
    const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    if (m) return decodeURIComponent(m[1]);
  }
  return fallback;
}

/**
 * Avec responseType 'blob', les erreurs Django ({ detail }) arrivent
 * elles aussi en Blob : on les relit en JSON pour que describeError
 * affiche le vrai message.
 */
async function unblobError(err: unknown): Promise<unknown> {
  const e = err as { response?: { data?: unknown } };
  const data = e?.response?.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob && data.type.includes('json')) {
    try {
      e.response!.data = JSON.parse(await data.text());
    } catch { /* on garde l'erreur d'origine */ }
  }
  return err;
}

async function postPdf(url: string, body: object, fallbackName: string): Promise<PdfFile> {
  const res = await AxiosInstance.post<Blob>(url, { ...body, download: true }, { responseType: 'blob' });
  return { blob: res.data, filename: filenameFrom(res.headers as Record<string, unknown>, fallbackName) };
}

async function getPdf(url: string, fallbackName: string): Promise<PdfFile> {
  const res = await AxiosInstance.get<Blob>(url, { responseType: 'blob' });
  return { blob: res.data, filename: filenameFrom(res.headers as Record<string, unknown>, fallbackName) };
}

/** Déclenche le téléchargement navigateur. */
export function savePdf({ blob, filename }: PdfFile): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Ouvre le PDF dans un nouvel onglet (aperçu). */
export function previewPdf({ blob }: PdfFile): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ─── Rapports d'entreprise ────────────────────────────────────────

export interface ReportFilters {
  type?:   ReportType;
  statut?: ReportStatut;
  etat?:   ReportEtat;
}

/** GET /reports/ — trié par genere_le décroissant côté Django */
export async function fetchReports(params?: ReportFilters): Promise<ReportData[]> {
  try {
    const { data } = await AxiosInstance.get<ReportApiRaw[] | { results: ReportApiRaw[] }>('/reports/', { params });
    return unwrapList(data).map(mapReport);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les rapports'));
  }
}

/** GET /reports/{id}/ */
export async function fetchReport(id: string): Promise<ReportData> {
  try {
    const { data } = await AxiosInstance.get<ReportApiRaw>(`/reports/${id}/`);
    return mapReport(data);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger ce rapport'));
  }
}

/** DELETE /reports/{id}/ — directeur / admin seulement (vérifié par Django) */
export async function deleteReport(id: string): Promise<void> {
  try {
    await AxiosInstance.delete(`/reports/${id}/`);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de supprimer ce rapport'));
  }
}

export interface EnterpriseReportRequest {
  report_type: 'monthly' | 'annual';
  year:        number;
  /** 1–12, requis si monthly */
  month?:      number;
  branch_id?:  string;
}

function checkEnterprise(req: EnterpriseReportRequest): void {
  if (req.report_type === 'monthly' && !(req.month && req.month >= 1 && req.month <= 12)) {
    throw new Error('Choisissez un mois pour le rapport mensuel.');
  }
}

/**
 * POST /reports/enterprise/pdf/ (download=false)
 * Génère et archive le rapport, renvoie son id et sa référence.
 * Regénérer un même mois crée une nouvelle version (-02, -03…).
 */
export async function generateEnterpriseReport(req: EnterpriseReportRequest): Promise<GeneratedPdf> {
  checkEnterprise(req);
  try {
    const { data } = await AxiosInstance.post('/reports/enterprise/pdf/', { ...req, download: false });
    return {
      id:        String(data.id),
      reference: data.reference,
      filename:  data.filename,
      periode:   data.data?.periode,
    };
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de générer le rapport'));
  }
}

/** POST /reports/enterprise/pdf/ (download=true) — génère et renvoie directement le PDF */
export async function downloadEnterpriseReport(req: EnterpriseReportRequest): Promise<PdfFile> {
  checkEnterprise(req);
  const suffix = req.report_type === 'monthly' ? `${req.year}_${String(req.month).padStart(2, '0')}` : `${req.year}`;
  try {
    return await postPdf('/reports/enterprise/pdf/', req, `rapport_${req.report_type}_${suffix}.pdf`);
  } catch (err) {
    throw new Error(describeError(await unblobError(err), 'Impossible de générer le rapport'));
  }
}

/** GET /reports/{id}/download-pdf/ — PDF d'un rapport déjà archivé */
export async function downloadReportPdf(id: string, reference?: string): Promise<PdfFile> {
  try {
    return await getPdf(`/reports/${id}/download-pdf/`, `${reference ?? id}.pdf`);
  } catch (err) {
    throw new Error(describeError(await unblobError(err), 'Impossible de télécharger ce rapport'));
  }
}

// ─── Relevés de compte ────────────────────────────────────────────

export interface StatementRequest {
  account_number: string;
  /** YYYY-MM-DD */
  start_date:     string;
  /** YYYY-MM-DD */
  end_date:       string;
}

function checkStatement(req: StatementRequest): void {
  if (!req.account_number.trim()) throw new Error('Le numéro de compte est obligatoire.');
  if (!req.start_date || !req.end_date) throw new Error('Choisissez une période.');
  if (req.start_date > req.end_date) throw new Error('La date de début doit précéder la date de fin.');
}

/** GET /account-statements/?account_number= (recherche partielle) */
export async function fetchStatements(accountNumber?: string): Promise<AccountStatementData[]> {
  try {
    const { data } = await AxiosInstance.get<AccountStatementApiRaw[] | { results: AccountStatementApiRaw[] }>(
      '/account-statements/',
      { params: accountNumber ? { account_number: accountNumber } : undefined },
    );
    return unwrapList(data).map(mapStatement);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les relevés'));
  }
}

/**
 * POST /reports/account-statement/pdf/ (download=false)
 * Génère et archive le relevé, renvoie son id, sa référence et ses totaux.
 */
export async function generateStatement(req: StatementRequest): Promise<GeneratedPdf> {
  checkStatement(req);
  try {
    const { data } = await AxiosInstance.post('/reports/account-statement/pdf/', { ...req, download: false });
    const d = data.data ?? {};
    return {
      id:                 String(data.id),
      reference:          data.reference,
      filename:           data.filename,
      solde_initial:      optNum(d.solde_initial),
      solde_final:        optNum(d.solde_final),
      total_credits:      optNum(d.total_credits),
      total_debits:       optNum(d.total_debits),
      transactions_count: typeof d.transactions_count === 'number' ? d.transactions_count : undefined,
    };
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de générer le relevé'));
  }
}

/** POST /reports/account-statement/pdf/ (download=true) — génère et renvoie directement le PDF */
export async function downloadStatement(req: StatementRequest): Promise<PdfFile> {
  checkStatement(req);
  try {
    return await postPdf(
      '/reports/account-statement/pdf/',
      req,
      `releve_${req.account_number}_${req.start_date}_${req.end_date}.pdf`,
    );
  } catch (err) {
    throw new Error(describeError(await unblobError(err), 'Impossible de générer le relevé'));
  }
}

/** GET /account-statements/{id}/download/ — PDF d'un relevé déjà archivé */
export async function downloadStatementPdf(id: string, reference?: string): Promise<PdfFile> {
  try {
    return await getPdf(`/account-statements/${id}/download/`, `${reference ?? id}.pdf`);
  } catch (err) {
    throw new Error(describeError(await unblobError(err), 'Impossible de télécharger ce relevé'));
  }
}