'use client';

import { useState } from 'react';
import { Banknote, Percent, TrendingDown, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { genererAnalyseFinanciere } from './genererAnalyseFinanciere';
import { validerAnalyseFinanciere } from './validation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoanParams {
  id_loan:        string;
  montantDemande: number;
  tauxInteret:    number;
  dureeMois:      number;
}

interface AnalyseResultat {
  mensualiteEstimee:     number;
  capaciteRemboursement: number;
  ratioEndettement:      number;
}

interface Props {
  loan: LoanParams;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{children}</p>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />{msg}
    </p>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyseFinanciereForm({ loan }: Props) {
  const [revenu,    setRevenu]    = useState<number | ''>('');
  const [depenses,  setDepenses]  = useState<number | ''>('');
  const [resultat,  setResultat]  = useState<AnalyseResultat | null>(null);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (revenu === '' || depenses === '') {
      setErrors({ revenuMensuel: 'Requis', depensesMensuelles: 'Requis' });
      return;
    }

    setLoading(true);
    const analyse = genererAnalyseFinanciere({
      id_analyse:         crypto.randomUUID(),
      id_pret:            loan.id_loan,
      montant:            loan.montantDemande,
      tauxAnnuel:         loan.tauxInteret,
      dureeMois:          loan.dureeMois,
      revenuMensuel:      revenu as number,
      depensesMensuelles: depenses as number,
    });

    const validation = validerAnalyseFinanciere(analyse);
    setLoading(false);

    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    setErrors({});
    setResultat(analyse);
    // TODO: await fetch('/api/analyse', { method: 'POST', body: JSON.stringify(analyse) });
  };

  // ── Couleur ratio endettement ──
  const ratioColor = (ratio: number) =>
    ratio > 0.4 ? '#EF4444' : ratio > 0.3 ? '#D4AF37' : '#2E7D32';

  return (
    <div className="flex flex-col gap-5">

      {/* Résumé prêt */}
      <div className="p-4 bg-[#DDEAD5]/30 rounded-xl border border-[#DDEAD5]">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-2">Prêt à analyser</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Montant</p>
            <p className="font-bold text-gray-800">{formatHTG(loan.montantDemande)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Taux annuel</p>
            <p className="font-bold text-gray-800">{loan.tauxInteret}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Durée</p>
            <p className="font-bold text-gray-800">{loan.dureeMois} mois</p>
          </div>
        </div>
      </div>

      {/* Champs saisie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Revenu mensuel (HTG)</Label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#355C7D]" />
            <input
              type="number" min={0}
              value={revenu}
              onChange={e => setRevenu(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm font-semibold text-[#355C7D] focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]"
            />
          </div>
          <FieldError msg={errors.revenuMensuel} />
        </div>

        <div>
          <Label>Dépenses mensuelles (HTG)</Label>
          <div className="relative">
            <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number" min={0}
              value={depenses}
              onChange={e => setDepenses(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
          </div>
          <FieldError msg={errors.depensesMensuelles} />
        </div>
      </div>

      {/* Bouton */}
      <button onClick={handleSubmit} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Calcul en cours…</>
          : <><Percent className="w-4 h-4" /> Générer l'analyse</>
        }
      </button>

      {/* Résultats */}
      {resultat && (
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Résultats</p>

          <div className="grid grid-cols-1 gap-2">
            {/* Mensualité */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <p className="text-sm text-gray-600">Mensualité estimée</p>
              <p className="text-sm font-bold text-[#355C7D]">{formatHTG(resultat.mensualiteEstimee)}</p>
            </div>

            {/* Capacité */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <p className="text-sm text-gray-600">Capacité de remboursement</p>
              <p className={`text-sm font-bold ${resultat.capaciteRemboursement >= resultat.mensualiteEstimee ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                {formatHTG(resultat.capaciteRemboursement)}
              </p>
            </div>

            {/* Ratio endettement */}
            <div className="py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-gray-600">Ratio d'endettement</p>
                <p className="text-sm font-bold" style={{ color: ratioColor(resultat.ratioEndettement) }}>
                  {(resultat.ratioEndettement * 100).toFixed(1)}%
                </p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, resultat.ratioEndettement * 100)}%`,
                    backgroundColor: ratioColor(resultat.ratioEndettement),
                  }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Seuil recommandé : 40%</p>
            </div>

            {/* Verdict */}
            <div className={`flex items-center gap-2 p-3 rounded-xl mt-1 ${
              resultat.capaciteRemboursement >= resultat.mensualiteEstimee && resultat.ratioEndettement <= 0.4
                ? 'bg-[#DDEAD5]/40 text-[#1B5E20]'
                : 'bg-red-50 text-red-700'
            }`}>
              {resultat.capaciteRemboursement >= resultat.mensualiteEstimee && resultat.ratioEndettement <= 0.4
                ? <><CheckCircle2 className="w-4 h-4 shrink-0" /><p className="text-xs font-semibold">Profil financier favorable</p></>
                : <><AlertTriangle className="w-4 h-4 shrink-0" /><p className="text-xs font-semibold">Risque identifié — révision recommandée</p></>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}