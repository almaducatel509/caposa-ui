'use client';
import { Printer, RefreshCw } from 'lucide-react';
import type { DepositFormValidated } from '../validation/deposit';

/** Ce que l'API renvoie après création (POST /transactions/deposit/). Tous optionnels :
 *  le reçu affiche « — » plutôt qu'une valeur inventée si un champ manque. */
export interface DepositApiResult {
  id?:             string;
  reference?:      string | null;
  status?:         string | null;
  amount?:         string | number | null;
  currency?:       string | null;
  account_number?: string | null;
  member_name?:    string | null;
  new_balance?:    string | number | null;
  created_at?:     string | null;
}

interface Props {
  data:         DepositFormValidated;
  apiResponse?: DepositApiResult | null;
  memberName?:  string;
  onReset:      () => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed:  { label: 'Encaissé',   color: 'text-[#2E7D32]' },
  pending:    { label: 'En attente', color: 'text-[#B45309]' },
  processing: { label: 'En cours',   color: 'text-[#355C7D]' },
  failed:     { label: 'Échoué',     color: 'text-[#B91C1C]' },
  cancelled:  { label: 'Annulé',     color: 'text-gray-500'  },
};

function formatHTG(n: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-HT').format(n) + ' ' + devise;
}

const toNumber = (v: unknown): number | null => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || isNaN(n) ? null : n;
};

export default function DepositReceipt({ data, apiResponse, memberName, onReset }: Props) {
  // ── Valeurs officielles (backend) avec repli explicite ──
  const devise   = apiResponse?.currency ?? 'HTG';
  const montant  = toNumber(apiResponse?.amount) ?? data.montantTransaction;
  const solde    = toNumber(apiResponse?.new_balance);
  const statut   = STATUS_LABEL[String(apiResponse?.status ?? '').toLowerCase()];
  const horodate = apiResponse?.created_at ? new Date(apiResponse.created_at) : null;

  const date  = horodate?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—';
  const heure = horodate?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) ?? '—';

  const rows: Array<[string, React.ReactNode]> = [
    // ['Référence', <span className="font-bold font-mono">{apiResponse?.reference ?? '—'}</span>],
    ['Date',      date],
    ['Heure',     heure],
    ['Membre',    <span className="font-semibold">{apiResponse?.member_name ?? memberName ?? '—'}</span>],
    ['Compte',    <span className="font-mono">{apiResponse?.account_number ?? data.idCompte}</span>],
    ['Mode',      data.depositSubtype === 'cash' ? 'Espèces' : 'Chèque'],
    ['Source',    data.source],
    ['Montant',   <span className="font-bold text-[#2E7D32]">{formatHTG(montant, devise)}</span>],
    ['Statut',    statut
      ? <span className={`font-bold ${statut.color}`}>{statut.label}</span>
      : <span className="text-gray-400">{apiResponse?.status ?? '—'}</span>],
  ];

  if (solde !== null) {
    rows.push(['Nouveau solde', <span className="font-semibold">{formatHTG(solde, devise)}</span>]);
  }

  if (data.depositSubtype === 'check') {
    rows.push(
      ['Banque émettrice', data.issuingBank ?? '—'],
      ['N° chèque',        data.checkNumber ?? '—'],
      ['Bénéficiaire',     data.beneficiary ?? '—'],
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 print:hidden">
        <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">Dépôt enregistré</p>
      </div>

      <div id="deposit-receipt" className="bg-white border border-gray-200 rounded-2xl p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="text-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">CAPOSA</h1>
          <p className="text-sm text-gray-600 mt-1">Confirmation de dépôt</p>
        </div>

        <dl className="divide-y divide-gray-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2.5 text-sm">
              <dt className="text-gray-500 uppercase text-xs tracking-wider">{label}</dt>
              <dd className="text-gray-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Veuillez conserver cette confirmation pour vos dossiers.</p>
          <p>Pour toute question, contactez notre service à la clientèle.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 print:hidden">
        <button type="button" onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          <RefreshCw className="w-4 h-4" /> Nouveau dépôt
        </button>
        <button type="button" onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all">
          <Printer className="w-4 h-4" /> Imprimer
        </button>
      </div>
    </div>
  );
}