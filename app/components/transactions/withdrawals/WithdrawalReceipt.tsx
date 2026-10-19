'use client';
import { Printer, RefreshCw } from 'lucide-react';
import type { WithdrawalFormValidated } from '../validation/withdrawal';

/** Ce que l'API renvoie après création (POST /transactions/withdraw/). Tous optionnels :
 *  le reçu affiche « — » plutôt qu'une valeur inventée si un champ manque. */
export interface WithdrawalApiResult {
  id?:                  string;
  reference?:           string | null;
  status?:              string | null;
  amount?:              string | number | null;
  currency?:            string | null;
  account_number?:      string | null;
  member_name?:         string | null;
  reason?:              string | null;
  new_balance?:         string | number | null;
  caisse_numero?:       string | null;
  created_by_username?: string | null;
  created_at?:          string | null;
}

interface Props {
  data:         WithdrawalFormValidated;
  apiResponse?: WithdrawalApiResult | null;
  memberName?:  string;
  accountLabel?: string;   // account_number affiché, en repli si l'API ne le renvoie pas
  onReset:      () => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed: { label: 'Décaissé',   color: 'text-[#2E7D32]' },
  pending:   { label: 'En attente', color: 'text-[#B45309]' },
  failed:    { label: 'Échoué',     color: 'text-[#B91C1C]' },
  cancelled: { label: 'Annulé',     color: 'text-gray-500'  },
};

function formatMoney(n: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' ' + devise;
}

const toNumber = (v: unknown): number | null => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || isNaN(n) ? null : n;
};

export default function WithdrawalReceipt({ data, apiResponse, memberName, accountLabel, onReset }: Props) {
  // ── Valeurs officielles (backend) avec repli explicite ──
  const devise   = apiResponse?.currency ?? 'HTG';
  const montant  = toNumber(apiResponse?.amount) ?? data.montantTransaction;
  const solde    = toNumber(apiResponse?.new_balance);
  const statut   = STATUS_LABEL[String(apiResponse?.status ?? '').toLowerCase()];
  const horodate = apiResponse?.created_at ? new Date(apiResponse.created_at) : null;
  const motif    = apiResponse?.reason ?? data.reason;

  const date  = horodate?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—';
  const heure = horodate?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) ?? '—';

  const rows: Array<[string, React.ReactNode]> = [
    ['Référence', <span className="font-bold font-mono">{apiResponse?.reference ?? '—'}</span>],
    ['Date',      date],
    ['Heure',     heure],
    ['Membre',    <span className="font-semibold">{apiResponse?.member_name ?? memberName ?? '—'}</span>],
    ['Compte',    <span className="font-mono">{apiResponse?.account_number ?? accountLabel ?? '—'}</span>],
    ['Montant',   <span className="font-bold text-red-600">− {formatMoney(montant, devise)}</span>],
    ['Statut',    statut
      ? <span className={`font-bold ${statut.color}`}>{statut.label}</span>
      : <span className="text-gray-400">{apiResponse?.status ?? '—'}</span>],
  ];

  if (solde !== null) {
    rows.push(['Nouveau solde', <span className="font-semibold">{formatMoney(solde, devise)}</span>]);
  }
  if (motif) {
    rows.push(['Motif', motif]);
  }
  if (apiResponse?.caisse_numero) {
    rows.push(['Caisse', `N° ${apiResponse.caisse_numero}`]);
  }
  if (apiResponse?.created_by_username) {
    rows.push(['Caissier', apiResponse.created_by_username]);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header succès — visible uniquement à l'écran */}
      <div className="flex flex-col items-center gap-2 print:hidden">
        <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">Retrait enregistré</p>
      </div>

      {/* Fiche imprimable */}
      <div id="withdrawal-receipt" className="bg-white border border-gray-200 rounded-2xl p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="text-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">CAPOSA</h1>
          <p className="text-sm text-gray-600 mt-1">Confirmation de retrait</p>
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

      {/* Boutons — cachés à l'impression */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Nouveau retrait
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" /> Imprimer
        </button>
      </div>
    </div>
  );
}