'use client';
import { useState, useMemo } from 'react';
import {
  LogOut, Wallet, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Loader2,
  AlertCircle, FileText, ShieldCheck, Clock,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';

// ─── Format réel renvoyé par l'API : chaque jour est une string "HH:mm-HH:mm" ───
// Correspond à OpeningHourDetail (@/types/branche) et OpeningHoursAPI
// (@/app/lib/api/branche) — clés anglaises, jour = plage compacte, pas
// d'objet {heure_debut, heure_fin} séparé.
interface OpeningHourDetailLike {
  monday:    string;
  tuesday:   string;
  wednesday: string;
  thursday:  string;
  friday:    string;
  saturday?: string | null;
  sunday?:   string | null;
}

// Index par Date.getDay() : 0 = dimanche, 1 = lundi, ...
const JOURS_EN = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
] as const;

function formatHTG(v: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: devise, minimumFractionDigits: 2,
  }).format(v);
}

const cls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

// ─── Détection du dépassement d'horaire ────────────────────────────────────
function getOvertimeInfo(schedule?: OpeningHourDetailLike) {
  if (!schedule) return { isOvertime: false, heureFin: null as string | null };

  const now    = new Date();
  const dayKey = JOURS_EN[now.getDay()];
  const raw    = schedule[dayKey]; // ex: "08:00-16:00", ou vide/null si fermé ce jour-là

  if (!raw) {
    // Aucun horaire pour aujourd'hui (ex. dimanche) — considéré hors-horaire
    return { isOvertime: true, heureFin: null };
  }

  const [, endPart] = raw.split('-');
  if (!endPart) return { isOvertime: false, heureFin: null };

  const [h, m] = endPart.split(':').map(Number);
  const finDuJour = new Date(now);
  finDuJour.setHours(h, m, 0, 0);

  return { isOvertime: now > finDuJour, heureFin: endPart };
}

interface CloseSessionModalProps {
  session:   CaisseSession;
  onClose:   () => void;
  onConfirm: (payload: {
    montant_fermeture: number;
    note_fermeture?:   string;
    motif_retard?:     string;
  }) => Promise<void>;
  schedule?: OpeningHourDetailLike; // branch.opening_hour_details de la branche de la session
}

export default function CloseSessionModal({ session, onClose, onConfirm, schedule }: CloseSessionModalProps) {
  const [montant,          setMontant]          = useState('');
  const [note,             setNote]             = useState('');
  const [motifRetard,      setMotifRetard]      = useState('');
  const [remiseConfirmee,  setRemiseConfirmee]  = useState(false);
  const [errors,           setErrors]           = useState<Record<string, string>>({});
  const [loading,          setLoading]          = useState(false);

  const devise      = session.devise ?? 'HTG';
  const reference   = session.montant_theorique ?? session.montant_ouverture;
  const ecart       = montant ? parseFloat(montant) - reference : null;
  const ecartAbsolu = ecart != null ? Math.abs(ecart) : null;
  const hasEcart    = ecart != null && ecart !== 0;

  const { isOvertime, heureFin } = useMemo(() => getOvertimeInfo(schedule), [schedule]);

    // const validate = (): boolean => {
    //   const e: Record<string, string> = {};
    //   const m = parseFloat(montant);
    //   if (isNaN(m) || m < 0) e.montant = 'Montant invalide';
    //   if (hasEcart && !note.trim()) e.note = 'Une note est requise en cas d\'écart';
    //   if (isOvertime && motifRetard.trim().length < 10) {
    //     e.motifRetard = 'Un motif d\'au moins 10 caractères est requis pour une fermeture hors horaire';
    //   }
    //   setErrors(e);
    //   return Object.keys(e).length === 0;
    // };
    const validate = (): boolean => {
    const e: Record<string, string> = {};
    const m = parseFloat(montant);
    if (!montant.trim())        e.montant = 'Le montant compté est requis';
    else if (isNaN(m) || m < 0) e.montant = 'Montant invalide';
    if (hasEcart && !note.trim()) e.note = 'Une note est requise en cas d\'écart';
    if (isOvertime && motifRetard.trim().length < 10) {
      e.motifRetard = 'Un motif d\'au moins 10 caractères est requis pour une fermeture hors horaire';
    }
    if (!remiseConfirmee) e.remise = 'Vous devez confirmer la remise au superviseur';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors(er => ({ ...er, submit: '' }));
    try {
      await onConfirm({
        montant_fermeture: parseFloat(montant),
        note_fermeture:    note.trim() || undefined,
        motif_retard:      isOvertime ? motifRetard.trim() : undefined,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        'La fermeture de la session a échoué. Veuillez réessayer.';
      setErrors(er => ({ ...er, submit: String(msg) }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Bandeau dépassement d'horaire ── */}
      {isOvertime && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Fermeture hors horaire d'agence
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {heureFin
                ? `L'agence ferme normalement à ${heureFin}. Un motif sera conservé dans le journal d'audit.`
                : "Aucun horaire n'est défini pour aujourd'hui. Un motif sera conservé dans le journal d'audit."}
            </p>
          </div>
        </div>
      )}

      {/* ── Récap session ── */}
      <div className="p-4 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl space-y-2 text-sm">
        {[
          ['Caissier',             session.username],
          ['Caisse',               session.numero_caisse],
          ['Devise',               session.devise],
          ['Ouverture',            session.ouverture_at],
          ['Montant d\'ouverture', formatHTG(session.montant_ouverture, devise)],
          ['Montant théorique',    session.montant_theorique != null
            ? formatHTG(session.montant_theorique, devise)
            : '— (calcul en cours)'],
          ['Superviseur',          session.superviseur],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Montant de fermeture ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          Montant compté ({devise}) *
        </p>
        <div className="relative">
          <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="number" min={0}
            value={montant}
            onChange={e => { setMontant(e.target.value); setErrors(er => ({ ...er, montant: '' })); }}
            placeholder="0"
            className={cls(errors.montant) + ' pl-8'}
          />
        </div>
        {errors.montant && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.montant}
          </p>
        )}
      </div>

      {/* ── Écart en temps réel ── */}
      {ecart !== null && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          ecart === 0 ? 'bg-[#DDEAD5] text-[#1B5E20]'
          : ecart > 0 ? 'bg-blue-50 text-blue-700'
          :              'bg-red-50 text-red-700'
        }`}>
          {ecart === 0
            ? <><CheckCircle2 size={16} />Aucun écart — parfait !</>
            : ecart > 0
            ? <><TrendingUp size={16} />Excédent de {formatHTG(ecartAbsolu!, devise)}</>
            : <><TrendingDown size={16} />Déficit de {formatHTG(ecartAbsolu!, devise)}</>
          }
        </div>
      )}

      {/* ── Note ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-1.5">
          Note de fermeture {hasEcart ? '*' : '(optionnel)'}
        </p>
        {hasEcart && (
          <p className="text-xs text-orange-600 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={11} />
            Un écart a été détecté — une explication est requise.
          </p>
        )}
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setErrors(er => ({ ...er, note: '' })); }}
            placeholder="Ex : Billet abîmé de 250 HTG, client a payé en monnaie…"
            rows={3}
            className={`w-full px-4 py-2.5 pl-8 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none resize-none transition-colors ${
              errors.note
                ? 'border-red-400 ring-2 ring-red-100'
                : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
            }`}
          />
        </div>
        {errors.note && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.note}
          </p>
        )}
      </div>

      {/* ── Motif de retard — visible uniquement si hors horaire ── */}
      {isOvertime && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
            Motif de la fermeture tardive *
          </p>
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <textarea
              value={motifRetard}
              onChange={e => { setMotifRetard(e.target.value); setErrors(er => ({ ...er, motifRetard: '' })); }}
              placeholder="Ex : Client en cours de traitement à l'heure de fermeture, session close à 17h35."
              rows={3}
              className={`w-full px-4 py-2.5 pl-8 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none resize-none transition-colors ${
                errors.motifRetard
                  ? 'border-red-400 ring-2 ring-red-100'
                  : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
              }`}
            />
          </div>
          {errors.motifRetard && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={11} />{errors.motifRetard}
            </p>
          )}
        </div>
      )}

      {/* ── Confirmation remise ── */}
      {/* <label className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remiseConfirmee}
          onChange={e => setRemiseConfirmee(e.target.checked)}
          className="mt-0.5 accent-[#2E7D32] w-4 h-4 shrink-0"
        />
        <span className="text-sm text-orange-800 font-medium">
          Je confirme avoir compté et remis le montant indiqué au superviseur.
          Cette remise sera enregistrée et transmise à la trésorerie pour vérification.
        </span>
      </label> */}
      <div>
        <label className={`flex items-start gap-3 p-3 bg-orange-50 border rounded-xl cursor-pointer select-none ${
          errors.remise ? 'border-red-400 ring-2 ring-red-100' : 'border-orange-200'
        }`}>
          <input
            type="checkbox"
            checked={remiseConfirmee}
            onChange={e => { setRemiseConfirmee(e.target.checked); setErrors(er => ({ ...er, remise: '' })); }}
            className="mt-0.5 accent-[#2E7D32] w-4 h-4 shrink-0"
          />
          <span className="text-sm text-orange-800 font-medium">
            Je confirme avoir compté et remis le montant indiqué au superviseur.
            Cette remise sera enregistrée et transmise à la trésorerie pour vérification.
          </span>
        </label>
        {errors.remise && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.remise}
          </p>
        )}
      </div>
      {errors.submit && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {errors.submit}
        </div>
      )}
      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 bg-white">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          // disabled={loading || !montant || !remiseConfirmee}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
        >
         {loading
            ? <><Loader2 size={14} className="animate-spin" />Fermeture…</>
            : <><ShieldCheck size={14} />Confirmer & fermer</>
          }
        </button>
      </div>
    </div>
  );
}