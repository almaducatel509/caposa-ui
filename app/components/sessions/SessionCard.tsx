'use client';
import { useState } from 'react';
import {
  LogIn, LogOut, Clock, Banknote,
  TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, X,
  AlertCircle, Loader2, CheckCircle2,
  ClipboardCheck, ShieldCheck,
} from 'lucide-react';
import { CaisseSession, CloseSessionPayload } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';
import { Modal } from '@/app/components/ui/Modal';
import { validateForm, CloseSessionSchema } from '@/app/components/sessions/validation';
import CloseSessionModal from './modals/Closesessionmodal';

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: 'HTG', minimumFractionDigits: 2,
  }).format(v);
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function duree(ouverture?: string, fermeture?: string): string {
  if (!ouverture) return '—';
  const fin   = fermeture ? new Date(fermeture) : new Date();
  const debut = new Date(ouverture);
  const diff  = Math.floor((fin.getTime() - debut.getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`;
}

// ─── Field helper ─────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-all ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;


// ─── Props ───────────────────────────────────────────────────────

interface SessionCardProps {
  session:   CaisseSession;
  onRefresh?: () => void;
}

// ─── SessionCard ─────────────────────────────────────────────────

export default function SessionCard({ session, onRefresh }: SessionCardProps) {
  const [expanded,    setExpanded]    = useState(false);
  const [showClose,   setShowClose]   = useState(false);

  const open  = session.statut === 'ouverte';
  const ecart = session.montant_fermeture != null
    ? session.montant_fermeture - session.montant_ouverture
    : null;

  return (
    <>
      {/* ── Modal fermeture ── */}
        {showClose && (
          <Modal isOpen onClose={() => setShowClose(false)} size="3xl"
            title={
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <LogOut className="text-red-500" size={15} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Fermer la session</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Clôture de {session.caissier_nom} · {session.numero_caisse}
                  </p>
                </div>
              </div>
            }
          >         
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <CloseSessionModal
                session={session}
                onClose={() => setShowClose(false)}
                onConfirm={async (payload) => {
                  await AxiosInstance.post(`/sessions/${session.id}/fermer/`, payload);
                  setShowClose(false);
                  onRefresh?.();
                }}
              />
            </div>
          </Modal>
        )}

      <div className={`bg-white rounded-2xl border transition-all ${
        open ? 'border-[#2E7D32]/30 shadow-sm' : 'border-gray-100'
      }`}>

        {/* ── Ligne principale ── */}
        <div className="flex items-center gap-4 px-5 py-4">

          {/* Icône statut */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            open ? 'bg-[#DDEAD5]' : 'bg-gray-100'
          }`}>
            {open
              ? <LogIn  className="w-5 h-5 text-[#2E7D32]" />
              : <LogOut className="w-5 h-5 text-gray-400"  />}
          </div>

          {/* Infos principales — cliquable pour expand */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">
                {session.caissier_nom}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                open ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-gray-100 text-gray-500'
              }`}>
                {session.numero_caisse}
              </span>
              {/* Badge statut */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {open ? '● En cours' : '✓ Fermée'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Superviseur : {session.superviseur} · {formatDate(session.ouverture_at)}
            </p>
          </button>

          {/* Montant ouverture */}
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-sm font-bold text-gray-800">
              {formatHTG(session.montant_ouverture)}
            </p>
            <p className="text-xs text-gray-400">Ouverture</p>
          </div>

          {/* Durée */}
          <div className="text-right shrink-0 hidden md:block">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              {duree(session.ouverture_at, session.fermeture_at)}
            </p>
            <p className="text-xs text-gray-400">{open ? 'en cours' : 'durée'}</p>
          </div>

          {/* Bouton fermer — seulement si ouverte */}
          {open && (
            <button
              onClick={() => setShowClose(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              <LogOut size={12} />
              Fermer
            </button>
            
          )}

          {/* Chevron expand */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* ── Détail expandé ── */}
        {expanded && (
          <div className="px-5 pb-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                icon:  Banknote,
                label: 'Montant ouverture',
                value: formatHTG(session.montant_ouverture),
                color: 'text-[#2E7D32]',
              },
              {
                icon:  Banknote,
                label: 'Montant fermeture',
                value: session.montant_fermeture != null
                  ? formatHTG(session.montant_fermeture)
                  : '—',
                color: 'text-gray-700',
              },
              {
                icon:  ecart != null && ecart < 0 ? TrendingDown : TrendingUp,
                label: 'Écart',
                value: ecart != null
                  ? ecart === 0
                    ? 'Aucun écart'
                    : `${ecart > 0 ? '+' : ''}${formatHTG(ecart)}`
                  : '—',
                color: ecart == null   ? 'text-gray-400'
                  : ecart === 0       ? 'text-[#2E7D32]'
                  : ecart > 0         ? 'text-blue-600'
                  :                     'text-red-600',
              },
              {
                icon:  Clock,
                label: 'Fermeture',
                value: formatDate(session.fermeture_at),
                color: 'text-gray-700',
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Icon size={11} />{label}
                </p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
              </div>
            ))}

            {/* Note de fermeture si présente */}
            {session.note_fermeture && (
              <div className="col-span-2 sm:col-span-4 mt-1 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500 italic">
                📝 {session.note_fermeture}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}