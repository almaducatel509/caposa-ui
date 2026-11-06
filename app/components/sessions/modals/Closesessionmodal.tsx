'use client';

/**
 * CloseSessionModal.tsx — clôture d'une session de caisse
 * ─────────────────────────────────────────────────────────────────
 * Montant théorique : fourni par Django (GET /sessions/{id}/), jamais
 * recalculé ici. Règle Django (confirmée par CS le 2026-11-02) :
 *   montant_theorique = montant_ouverture + total_entrees − total_sorties
 * montant_ouverture fait foi ; solde_initial (caisse physique) est ignoré.
 *
 * La session est RECHARGÉE à l'ouverture de la modale : l'objet reçu du
 * parent peut dater de plusieurs heures et ne pas inclure les derniers
 * encaissements (remboursements de prêts en espèces, dépôts…).
 *
 * Tant que le théorique n'est pas connu, aucun écart n'est affiché et la
 * fermeture est bloquée : jamais de « parfait ! » par défaut.
 *
 * Droit de fermer : le caissier titulaire, ou superviseur / directeur /
 * administrateur. Django renvoie 403 sinon ; l'écran le montre AVANT le clic.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2,
  AlertCircle, FileText, ShieldCheck, Clock, Lock, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';
import { useUserRoles } from '@/app/lib/useUserRoles';
// ─── Horaires d'agence (format API : "HH:mm-HH:mm" par jour) ──────

interface OpeningHourDetailLike {
  monday:    string;
  tuesday:   string;
  wednesday: string;
  thursday:  string;
  friday:    string;
  saturday?: string | null;
  sunday?:   string | null;
}

const JOURS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getOvertimeInfo(schedule?: OpeningHourDetailLike) {
  if (!schedule) return { isOvertime: false, heureFin: null as string | null };
  const now = new Date();
  const raw = schedule[JOURS_EN[now.getDay()]];
  if (!raw) return { isOvertime: true, heureFin: null };
  const [, endPart] = raw.split('-');
  if (!endPart) return { isOvertime: false, heureFin: null };
  const [h, m] = endPart.split(':').map(Number);
  const fin = new Date(now);
  fin.setHours(h, m, 0, 0);
  return { isOvertime: now > fin, heureFin: endPart };
}

// ─── Données de session renvoyées par Django ──────────────────────

type Money = string | number | null | undefined;

interface SessionTotals {
  montant_ouverture:  Money;
  montant_theorique:  Money;
  total_entrees?:     Money;
  total_sorties?:     Money;
  totaux_par_type?:   Record<string, Money>;
  nb_transactions?:   number;
  alerte_24h?:        boolean;
  duree_heures?:      number;
  ouverture_at?:      string;
  username?:          string;
}

/** Libellés et sens de chaque type de transaction caisse (règle Django). */
const TYPE_LINES: { key: string; label: string; sign: 1 | -1 }[] = [
  { key: 'depot',             label: 'Dépôts',                          sign:  1 },
  { key: 'transfert_entrant', label: 'Transferts entrants',             sign:  1 },
  { key: 'pret_encaisse',     label: 'Remboursements de prêts (espèces)', sign:  1 },
  { key: 'retrait',           label: 'Retraits',                        sign: -1 },
  { key: 'transfert_sortant', label: 'Transferts sortants',             sign: -1 },
  { key: 'pret_debourse',     label: 'Prêts décaissés en espèces',      sign: -1 },
  { key: 'frais',             label: 'Frais',                           sign: -1 },
];

const DECIDERS = ['superviseur', 'directeur', 'administrateur', 'admin'];

// ─── Helpers ──────────────────────────────────────────────────────

/** Django renvoie les montants en chaîne ("50000.00") : conversion sûre. */
const toNum = (v: Money): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Arrondi au centime : évite les écarts fantômes du type 0.0000001. */
const cents = (n: number) => Math.round(n * 100) / 100;

function formatMoney(v: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: devise, minimumFractionDigits: 2 }).format(v);
}

const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const cls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

// ─── Props ────────────────────────────────────────────────────────

interface CloseSessionModalProps {
  session:   CaisseSession;
  onClose:   () => void;
  onConfirm: (payload: {
    montant_fermeture: number;
    note_fermeture?:   string;
    motif_retard?:     string;
  }) => Promise<void>;
  schedule?: OpeningHourDetailLike;
}

// ─── Composant ────────────────────────────────────────────────────

export default function CloseSessionModal({ session, onClose, onConfirm, schedule }: CloseSessionModalProps) {
  const [montant,         setMontant]         = useState('');
  const [note,            setNote]            = useState('');
  const [motifRetard,     setMotifRetard]     = useState('');
  const [remiseConfirmee, setRemiseConfirmee] = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [loading,         setLoading]         = useState(false);
  const [showDetail,      setShowDetail]      = useState(false);

  // ── Session fraîche depuis Django ──
  const [fresh,        setFresh]        = useState<SessionTotals | null>(null);
  const [freshLoading, setFreshLoading] = useState(true);
  const [freshError,   setFreshError]   = useState<string | null>(null);

  const loadSession = async () => {
    setFreshLoading(true);
    setFreshError(null);
    try {
      const { data } = await AxiosInstance.get<SessionTotals>(`sessions/${session.id}/`);
      setFresh(data);
    } catch {
      setFreshError('Impossible de recalculer la caisse. Vérifiez la connexion puis réessayez.');
    } finally {
      setFreshLoading(false);
    }
  };

  useEffect(() => { loadSession(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [session.id]);

  // ── Droit de fermer ──
  const { hasRole, username, loading: rolesLoading } = useUserRoles();
  const titulaire = fresh?.username ?? session.username;
  const canCloseThis = !rolesLoading && (username === titulaire || hasRole(...DECIDERS));

  // ── Montants (Django) ──
  const devise     = session.devise ?? 'HTG';
  const ouverture  = toNum(fresh?.montant_ouverture ?? session.montant_ouverture);
  const theorique  = toNum(fresh?.montant_theorique);
  const entrees    = toNum(fresh?.total_entrees);
  const sorties    = toNum(fresh?.total_sorties);
  const detail     = TYPE_LINES
    .map(t => ({ ...t, value: toNum(fresh?.totaux_par_type?.[t.key]) ?? 0 }))
    .filter(t => t.value !== 0);
  const autre      = toNum(fresh?.totaux_par_type?.autre) ?? 0;

  // ── Écart : seulement si le théorique est connu ──
  const compte     = montant.trim() === '' ? null : Number(montant);
  const ecart      = theorique != null && compte != null && Number.isFinite(compte) ? cents(compte - theorique) : null;
  const hasEcart   = ecart != null && ecart !== 0;

  const { isOvertime, heureFin } = useMemo(() => getOvertimeInfo(schedule), [schedule]);
  const ouverteDepuisLongtemps   = Boolean(fresh?.alerte_24h);

  const blocked = !canCloseThis || theorique == null || freshLoading;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!montant.trim())                         e.montant = 'Le montant compté est requis';
    else if (compte == null || !Number.isFinite(compte) || compte < 0) e.montant = 'Montant invalide';
    if (hasEcart && !note.trim())                e.note = 'Une note est requise en cas d’écart';
    else if (ouverteDepuisLongtemps && !note.trim()) e.note = 'Expliquez pourquoi la session est restée ouverte plus de 24 h';
    if (isOvertime && motifRetard.trim().length < 10) {
      e.motifRetard = 'Un motif d’au moins 10 caractères est requis pour une fermeture hors horaire';
    }
    if (!remiseConfirmee)                        e.remise = 'Vous devez confirmer la remise au superviseur';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (blocked || !validate()) return;
    setLoading(true);
    setErrors(er => ({ ...er, submit: '' }));
    try {
      await onConfirm({
        montant_fermeture: cents(compte!),
        note_fermeture:    note.trim() || undefined,
        motif_retard:      isOvertime ? motifRetard.trim() : undefined,
      });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { detail?: string } }; message?: string };
      const msg = e?.response?.status === 403
        ? 'Vous n’avez pas l’autorisation de fermer cette session.'
        : e?.response?.data?.detail ?? e?.message ?? 'La fermeture de la session a échoué. Veuillez réessayer.';
      setErrors(er => ({ ...er, submit: String(msg) }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Pas le droit de fermer : affiché d'emblée ── */}
      {!rolesLoading && !canCloseThis && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            Seul le caissier titulaire (<strong>{titulaire}</strong>) ou un superviseur / administrateur peut clôturer
            cette session. Vous pouvez la consulter, pas la fermer.
          </p>
        </div>
      )}

      {/* ── Session ouverte depuis plus de 24 h ── */}
      {ouverteDepuisLongtemps && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Session ouverte depuis {fresh?.duree_heures != null ? `${Math.floor(fresh.duree_heures / 24)} j ${Math.round(fresh.duree_heures % 24)} h` : 'plus de 24 h'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Une caisse doit être clôturée chaque jour. Expliquez ce retard dans la note de fermeture.
            </p>
          </div>
        </div>
      )}

      {/* ── Fermeture hors horaire ── */}
      {isOvertime && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Fermeture hors horaire d&apos;agence</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {heureFin
                ? `L'agence ferme normalement à ${heureFin}. Un motif sera conservé dans le journal d'audit.`
                : "Aucun horaire n'est défini pour aujourd'hui. Un motif sera conservé dans le journal d'audit."}
            </p>
          </div>
        </div>
      )}

      {/* ── Récapitulatif ── */}
      <div className="p-4 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl space-y-2 text-sm">
        {[
          ['Caissier',    titulaire],
          ['Caisse',      session.numero_caisse],
          ['Devise',      devise],
          ['Ouverture',   formatDateTime(fresh?.ouverture_at ?? session.ouverture_at)],
          ['Superviseur', session.superviseur],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800 text-right">{value ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* ── Montant théorique et son détail ── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Montant théorique</p>
            <p className="text-xs text-gray-400">Ce que la caisse doit contenir selon le système</p>
          </div>
          {freshLoading ? (
            <span className="flex items-center gap-2 text-xs text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Calcul…</span>
          ) : theorique != null ? (
            <span className="shrink-0 whitespace-nowrap text-lg font-bold text-gray-900">{formatMoney(theorique, devise)}</span>
          ) : (
            <button onClick={loadSession} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline">
              <RefreshCw className="w-3.5 h-3.5" /> Réessayer
            </button>
          )}
        </div>

        {freshError && (
          <p className="px-4 pb-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{freshError}</p>
        )}

        {theorique != null && (
          <>
            <button onClick={() => setShowDetail(d => !d)}
              className="w-full flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs font-semibold text-gray-600 hover:bg-gray-100">
              <span>
                Détail du calcul · {fresh?.nb_transactions ?? 0} opération{(fresh?.nb_transactions ?? 0) > 1 ? 's' : ''}
              </span>
              {showDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDetail && (
              <div className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fond de caisse à l&apos;ouverture</span>
                  <span className="font-semibold text-gray-800">{ouverture != null ? formatMoney(ouverture, devise) : '—'}</span>
                </div>
                {detail.length === 0 && (
                  <p className="text-gray-400 italic">Aucune opération pendant cette session.</p>
                )}
                {detail.map(t => (
                  <div key={t.key} className="flex justify-between">
                    <span className="text-gray-600">{t.sign > 0 ? '+' : '−'} {t.label}</span>
                    <span className={`font-semibold ${t.sign > 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                      {formatMoney(t.value, devise)}
                    </span>
                  </div>
                ))}
                {autre !== 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Autres opérations (non comptées)</span>
                    <span>{formatMoney(autre, devise)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 mt-1.5 border-t border-gray-100">
                  <span className="text-gray-500">Entrées {entrees != null ? formatMoney(entrees, devise) : '—'} · Sorties {sorties != null ? formatMoney(sorties, devise) : '—'}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>= Montant théorique</span>
                  <span>{formatMoney(theorique, devise)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Montant compté ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Montant compté ({devise}) *</p>
        <div className="relative">
          <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="number" min={0} step="0.01" inputMode="decimal"
            value={montant}
            disabled={blocked}
            onChange={e => { setMontant(e.target.value); setErrors(er => ({ ...er, montant: '' })); }}
            placeholder="0"
            className={cls(errors.montant) + ' pl-8 disabled:opacity-50'}
          />
        </div>
        {errors.montant && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.montant}</p>
        )}
      </div>

      {/* ── Écart (uniquement contre le théorique Django) ── */}
      {ecart !== null && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          ecart === 0 ? 'bg-[#DDEAD5] text-[#1B5E20]'
          : ecart > 0 ? 'bg-blue-50 text-blue-700'
          :             'bg-red-50 text-red-700'
        }`}>
          {ecart === 0
            ? <><CheckCircle2 size={16} />Aucun écart avec le montant théorique</>
            : ecart > 0
            ? <><TrendingUp size={16} />Excédent de {formatMoney(Math.abs(ecart), devise)}</>
            : <><TrendingDown size={16} />Déficit de {formatMoney(Math.abs(ecart), devise)}</>}
        </div>
      )}
      {theorique == null && !freshLoading && compte != null && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">
          <AlertCircle size={16} />Écart impossible à calculer : le montant théorique n&apos;est pas disponible.
        </div>
      )}

      {/* ── Note ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          Note de fermeture {hasEcart || ouverteDepuisLongtemps ? '*' : '(optionnel)'}
        </p>
        {hasEcart && (
          <p className="text-xs text-orange-600 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={11} />Un écart a été détecté : une explication est requise.
          </p>
        )}
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <textarea
            value={note}
            disabled={blocked}
            onChange={e => { setNote(e.target.value); setErrors(er => ({ ...er, note: '' })); }}
            placeholder="Ex : Billet abîmé de 250 HTG, client a payé en monnaie…"
            rows={3}
            className={`w-full px-4 py-2.5 pl-8 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none resize-none transition-colors disabled:opacity-50 ${
              errors.note ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
            }`}
          />
        </div>
        {errors.note && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.note}</p>
        )}
      </div>

      {/* ── Motif de retard (hors horaire) ── */}
      {isOvertime && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Motif de la fermeture tardive *</p>
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <textarea
              value={motifRetard}
              disabled={blocked}
              onChange={e => { setMotifRetard(e.target.value); setErrors(er => ({ ...er, motifRetard: '' })); }}
              placeholder="Ex : Client en cours de traitement à l'heure de fermeture, session close à 17h35."
              rows={3}
              className={`w-full px-4 py-2.5 pl-8 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none resize-none transition-colors disabled:opacity-50 ${
                errors.motifRetard ? 'border-red-400 ring-2 ring-red-100' : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
              }`}
            />
          </div>
          {errors.motifRetard && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.motifRetard}</p>
          )}
        </div>
      )}

      {/* ── Confirmation de remise ── */}
      <div>
        <label className={`flex items-start gap-3 p-3 bg-orange-50 border rounded-xl select-none ${
          blocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${errors.remise ? 'border-red-400 ring-2 ring-red-100' : 'border-orange-200'}`}>
          <input
            type="checkbox"
            checked={remiseConfirmee}
            disabled={blocked}
            onChange={e => { setRemiseConfirmee(e.target.checked); setErrors(er => ({ ...er, remise: '' })); }}
            className="mt-0.5 accent-[#2E7D32] w-4 h-4 shrink-0"
          />
          <span className="text-sm text-orange-800 font-medium">
            Je confirme avoir compté et remis le montant indiqué au superviseur.
            Cette remise sera enregistrée et transmise à la trésorerie pour vérification.
          </span>
        </label>
        {errors.remise && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.remise}</p>
        )}
      </div>

      {errors.submit && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />{errors.submit}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 bg-white">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
          {canCloseThis ? 'Annuler' : 'Fermer'}
        </button>
        <button onClick={handleSubmit} disabled={loading || blocked}
          title={!canCloseThis ? 'Vous n’avez pas le droit de fermer cette session' : theorique == null ? 'Montant théorique indisponible' : undefined}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600">
          {loading
            ? <><Loader2 size={14} className="animate-spin" />Fermeture…</>
            : !canCloseThis
            ? <><Lock size={14} />Fermeture non autorisée</>
            : <><ShieldCheck size={14} />Confirmer &amp; fermer</>}
        </button>
      </div>
    </div>
  );
}