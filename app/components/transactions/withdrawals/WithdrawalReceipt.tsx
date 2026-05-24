'use client';
import { Printer, RefreshCw } from 'lucide-react';
import type { WithdrawalFormValidated } from '../validation/withdrawal';

interface Props {
  data: WithdrawalFormValidated;
  memberName?: string;
  onReset: () => void;
}

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

export default function WithdrawalReceipt({ data, memberName, onReset }: Props) {
  const reference = `RET-${Date.now()}`;
  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const rows: Array<[string, React.ReactNode]> = [
    ['Référence',   <span className="font-bold">{reference}</span>],
    ['Date',        date],
    ['Heure',       heure],
    ['Membre',      <span className="font-semibold">{memberName ?? '—'}</span>],
    ['Compte',      <span className="font-mono">{data.idCompte}</span>],
    ['Montant',     <span className="font-bold text-red-600">{formatHTG(data.montantTransaction)}</span>],
    ['Code autorisation', <span className="font-mono">{data.codeAutorisation}</span>],
    ['Statut',      <span className="font-bold text-[#2E7D32]">En attente</span>],
  ];

  // Ligne raison uniquement si fournie
  if (data.reason) {
    rows.push(['Raison', data.reason]);
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