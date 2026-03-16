// app/components/analyse/kpis/AlertePriseEnChargeModal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  X, AlertTriangle, CheckCircle2, Clock, User, FileText,
  ChevronRight, ArrowUpCircle, Bell, MessageSquare,
  History, Send, Lock,
} from 'lucide-react';

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Types ────────────────────────────────────────────────────────────────────
export type AlerteStatut =
  | 'nouvelle'        // vient d'être créée
  | 'en_traitement'   // quelqu'un l'a prise en charge
  | 'escaladee'       // transmise au superviseur
  | 'resolue_auto'    // KPI repassé sous le seuil automatiquement
  | 'resolue_manuelle'// responsable a forcé la fermeture
  | 'rouverte';       // KPI a redégradé après résolution

export interface ActionHistorique {
  id:          string;
  date:        Date;
  auteur:      string;
  role:        string;
  type:        'prise_en_charge' | 'commentaire' | 'escalade' | 'resolution' | 'reouverture' | 'notification';
  note:        string;
  ancienStatut?: AlerteStatut;
  nouveauStatut?: AlerteStatut;
}

export interface AlerteInstitutionnelle {
  id:          string;
  type:        'critique' | 'alerte';
  category:    'financier' | 'liquidite' | 'membres';
  title:       string;
  description: string;
  valeur:      number;
  seuil:       number;
  unite:       string;
  action:      string;
  responsable: string;
  echeance:    Date;
  // Gestion
  statut:          AlerteStatut;
  assigneA?:       string;
  assigneRole?:    string;
  historique:      ActionHistorique[];
  kpiActuel?:      number; // valeur live pour résolution auto
}

interface Props {
  alerte:   AlerteInstitutionnelle | null;
  onClose:  () => void;
  onUpdate: (alerteId: string, newStatut: AlerteStatut, action: ActionHistorique) => void;
  // Utilisateur connecté (en prod, vient du contexte d'auth)
  currentUser?: { nom: string; role: string };
}

// ─── Config statuts ───────────────────────────────────────────────────────────
const STATUT_CFG: Record<AlerteStatut, { label: string; bg: string; text: string; dot: string }> = {
  nouvelle:          { label: 'Nouvelle',           bg: '#EBF2F8',   text: C.blue,       dot: C.blue       },
  en_traitement:     { label: 'En traitement',      bg: '#FEF9EC',   text: '#B45309',    dot: C.gold       },
  escaladee:         { label: 'Escaladée',           bg: '#FEF2F2',   text: '#B91C1C',    dot: '#EF4444'    },
  resolue_auto:      { label: 'Résolue (auto)',      bg: C.greenPale, text: C.greenDark,  dot: C.green      },
  resolue_manuelle:  { label: 'Résolue (manuelle)',  bg: C.greenPale, text: C.greenDark,  dot: C.green      },
  rouverte:          { label: 'Rouverte',            bg: '#FEF2F2',   text: '#B91C1C',    dot: '#EF4444'    },
};

const ACTION_ICONS: Record<ActionHistorique['type'], React.ElementType> = {
  prise_en_charge: User,
  commentaire:     MessageSquare,
  escalade:        ArrowUpCircle,
  resolution:      CheckCircle2,
  reouverture:     AlertTriangle,
  notification:    Bell,
};

const SUPERVISEURS = [
  { nom: 'Marie-Ange Celestin', role: 'Superviseure générale'   },
  { nom: 'Réginald Toussaint',  role: 'Directeur financier'      },
  { nom: 'Josette Hyppolite',   role: 'Trésorière principale'    },
];

function formatDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Onglet prise en charge ───────────────────────────────────────────────────
function OngletAction({ alerte, currentUser, onUpdate, onClose }: {
  alerte: AlerteInstitutionnelle;
  currentUser: { nom: string; role: string };
  onUpdate: Props['onUpdate'];
  onClose: () => void;
}) {
  const [note,        setNote]        = useState('');
  const [notifEmail,  setNotifEmail]  = useState(false);
  const [notifSMS,    setNotifSMS]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const estPriseEnCharge = ['en_traitement', 'escaladee'].includes(alerte.statut);
  const estResolue       = alerte.statut.startsWith('resolue');

  const handlePrendreEnCharge = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600)); // simulation API

    const action: ActionHistorique = {
      id:            `act-${Date.now()}`,
      date:          new Date(),
      auteur:        currentUser.nom,
      role:          currentUser.role,
      type:          'prise_en_charge',
      note:          note.trim(),
      ancienStatut:  alerte.statut,
      nouveauStatut: 'en_traitement',
    };

    if (notifEmail || notifSMS) {
      // En production : appel API notification
      console.log(`Notification ${notifEmail ? 'email' : ''}${notifSMS ? ' SMS' : ''} → ${alerte.responsable}`);
    }

    onUpdate(alerte.id, 'en_traitement', action);
    setNote('');
    setSubmitting(false);
  };

  const handleResoudre = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const action: ActionHistorique = {
      id:            `act-${Date.now()}`,
      date:          new Date(),
      auteur:        currentUser.nom,
      role:          currentUser.role,
      type:          'resolution',
      note:          note.trim(),
      ancienStatut:  alerte.statut,
      nouveauStatut: 'resolue_manuelle',
    };

    onUpdate(alerte.id, 'resolue_manuelle', action);
    setNote('');
    setSubmitting(false);
    onClose();
  };

  const handleCommenter = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));

    const action: ActionHistorique = {
      id:    `act-${Date.now()}`,
      date:  new Date(),
      auteur: currentUser.nom,
      role:   currentUser.role,
      type:   'commentaire',
      note:   note.trim(),
    };

    onUpdate(alerte.id, alerte.statut, action);
    setNote('');
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Statut actuel */}
      <div className="flex items-center justify-between p-3 rounded-xl border bg-[#F9F9F6] border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Statut actuel</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: STATUT_CFG[alerte.statut].bg, color: STATUT_CFG[alerte.statut].text }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
              style={{ backgroundColor: STATUT_CFG[alerte.statut].dot }} />
            {STATUT_CFG[alerte.statut].label}
          </span>
        </div>
        {alerte.assigneA && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5" />
            <span>{alerte.assigneA}</span>
          </div>
        )}
      </div>

      {/* Note / commentaire — obligatoire */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {estPriseEnCharge ? 'Ajouter un commentaire' : 'Note de prise en charge'}
          <span className="text-[#EF4444] ml-0.5">*</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={
            estResolue
              ? 'Décrivez ce qui a été fait pour résoudre ce problème…'
              : estPriseEnCharge
              ? 'Décrivez les actions en cours ou les observations…'
              : 'Décrivez les actions que vous allez entreprendre…'
          }
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
        <div className="flex justify-between mt-1">
          {!note.trim() && <p className="text-xs text-[#EF4444]">Obligatoire</p>}
          <p className="text-xs text-gray-400 ml-auto">{note.length}/500</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="p-3 rounded-xl border border-gray-100 bg-[#F9F9F6]">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
          <Bell className="w-3.5 h-3.5" /> Notifier le responsable
        </p>
        <p className="text-xs text-gray-400 mb-3">Responsable assigné : <b className="text-gray-600">{alerte.responsable}</b></p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30" />
            <span className="text-xs font-semibold text-gray-600">Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifSMS} onChange={e => setNotifSMS(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30" />
            <span className="text-xs font-semibold text-gray-600">SMS</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {!estPriseEnCharge && !estResolue && (
          <button onClick={handlePrendreEnCharge} disabled={!note.trim() || submitting}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50">
            {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement…</> : <><User className="w-4 h-4" /> Prendre en charge</>}
          </button>
        )}

        {estPriseEnCharge && (
          <>
            <button onClick={handleCommenter} disabled={!note.trim() || submitting}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EBF2F8] text-[#355C7D] text-sm font-semibold hover:bg-[#D4E3EF] transition-all disabled:opacity-50">
              <MessageSquare className="w-4 h-4" /> Ajouter un commentaire
            </button>
            <button onClick={handleResoudre} disabled={!note.trim() || submitting}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50">
              <CheckCircle2 className="w-4 h-4" /> Marquer comme résolue
            </button>
          </>
        )}

        {estResolue && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#DDEAD5]/40 border border-[#DDEAD5]">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <p className="text-xs font-semibold text-[#1B5E20]">
              Cette alerte est résolue. Elle se rouvrira automatiquement si le KPI se dégrade à nouveau.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Onglet escalade ──────────────────────────────────────────────────────────
function OngletEscalade({ alerte, currentUser, onUpdate }: {
  alerte: AlerteInstitutionnelle;
  currentUser: { nom: string; role: string };
  onUpdate: Props['onUpdate'];
}) {
  const [superviseur, setSuperviseur] = useState('');
  const [raison,      setRaison]      = useState('');
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [done,        setDone]        = useState(false);

  const handleEscalade = async () => {
    if (!superviseur || !raison.trim()) return;
    setDone(true);

    const action: ActionHistorique = {
      id:            `act-${Date.now()}`,
      date:          new Date(),
      auteur:        currentUser.nom,
      role:          currentUser.role,
      type:          'escalade',
      note:          `Escaladée vers ${superviseur}. Raison : ${raison.trim()}`,
      ancienStatut:  alerte.statut,
      nouveauStatut: 'escaladee',
    };

    onUpdate(alerte.id, 'escaladee', action);
  };

  if (done) return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
        <ArrowUpCircle className="w-7 h-7 text-[#2E7D32]" />
      </div>
      <p className="text-sm font-bold text-gray-700">Escalade envoyée</p>
      <p className="text-xs text-gray-500 text-center">
        {superviseur} a été notifié{notifEmail ? ' par email' : ''} et prendra en charge cette alerte.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FEF9EC]">
        <p className="text-xs text-[#B45309]">
          L'escalade transfère la responsabilité de cette alerte à un superviseur. Utilisez cette option si vous ne pouvez pas résoudre le problème à votre niveau.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
          Transférer à <span className="text-[#EF4444]">*</span>
        </label>
        <div className="flex flex-col gap-2">
          {SUPERVISEURS.map(s => (
            <button key={s.nom} onClick={() => setSuperviseur(s.nom)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                superviseur === s.nom
                  ? 'border-[#2E7D32] bg-[#DDEAD5]/40'
                  : 'border-gray-200 bg-[#F9F9F6] hover:border-[#81C784]'
              }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DDEAD5] flex items-center justify-center text-[#1B5E20] font-bold text-xs shrink-0">
                  {s.nom.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.nom}</p>
                  <p className="text-xs text-gray-500">{s.role}</p>
                </div>
              </div>
              {superviseur === s.nom && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
          Raison de l'escalade <span className="text-[#EF4444]">*</span>
        </label>
        <textarea value={raison} onChange={e => setRaison(e.target.value)} rows={3} maxLength={300}
          placeholder="Expliquez pourquoi vous escaladez cette alerte…"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30" />
        <span className="text-xs font-semibold text-gray-600">Notifier par email</span>
      </label>

      <button onClick={handleEscalade} disabled={!superviseur || !raison.trim()}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] transition-all disabled:opacity-50 shadow-sm hover:shadow-md">
        <ArrowUpCircle className="w-4 h-4" /> Escalader l'alerte
      </button>
    </div>
  );
}

// ─── Onglet historique ────────────────────────────────────────────────────────
function OngletHistorique({ historique }: { historique: ActionHistorique[] }) {
  if (historique.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] flex items-center justify-center">
        <History className="w-6 h-6 text-gray-300" />
      </div>
      <p className="text-xs text-gray-400">Aucune action enregistrée</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-0">
      {[...historique].reverse().map((action, idx) => {
        const Icon = ACTION_ICONS[action.type];
        const isLast = idx === historique.length - 1;
        return (
          <div key={action.id} className="flex gap-3">
            {/* Ligne de timeline */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor:
                    action.type === 'resolution'  ? C.greenPale :
                    action.type === 'escalade'     ? '#FEF2F2'   :
                    action.type === 'reouverture'  ? '#FEF2F2'   :
                    '#EBF2F8',
                }}>
                <Icon className="w-4 h-4" style={{
                  color:
                    action.type === 'resolution'  ? C.green    :
                    action.type === 'escalade'     ? '#EF4444'  :
                    action.type === 'reouverture'  ? '#EF4444'  :
                    C.blue,
                }} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
            </div>

            {/* Contenu */}
            <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-xs font-bold text-gray-700">{action.auteur}</span>
                  <span className="text-xs text-gray-400 ml-1">· {action.role}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(action.date)}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{action.note}</p>
              {action.ancienStatut && action.nouveauStatut && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: STATUT_CFG[action.ancienStatut].bg, color: STATUT_CFG[action.ancienStatut].text }}>
                    {STATUT_CFG[action.ancienStatut].label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: STATUT_CFG[action.nouveauStatut].bg, color: STATUT_CFG[action.nouveauStatut].text }}>
                    {STATUT_CFG[action.nouveauStatut].label}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────
export default function AlertePriseEnChargeModal({ alerte, onClose, onUpdate, currentUser }: Props) {
  const [onglet, setOnglet] = useState<'action' | 'escalade' | 'historique'>('action');
  const user = currentUser ?? { nom: 'Utilisateur actuel', role: 'Employé' };

  if (!alerte) return null;

  const isCrit = alerte.type === 'critique';
  const sc = STATUT_CFG[alerte.statut];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCrit ? 'bg-[#FEF2F2]' : 'bg-[#FEF9EC]'}`}>
                {isCrit
                  ? <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  : <AlertTriangle className="w-5 h-5" style={{ color: C.gold }} />
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{alerte.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{alerte.description}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ml-2 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Valeur actuelle vs seuil */}
          <div className="flex items-center gap-3 mt-3">
            <div className="px-3 py-1.5 bg-[#F9F9F6] rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-400">Valeur actuelle</p>
              <p className={`text-sm font-bold ${isCrit ? 'text-[#B91C1C]' : 'text-[#B45309]'}`}>
                {alerte.valeur.toFixed(1)}{alerte.unite}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="px-3 py-1.5 bg-[#F9F9F6] rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-400">Seuil cible</p>
              <p className="text-sm font-bold text-[#2E7D32]">{alerte.seuil.toFixed(1)}{alerte.unite}</p>
            </div>
            <div className="ml-auto">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ backgroundColor: sc.bg, color: sc.text }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: sc.dot }} />
                {sc.label}
              </span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex bg-white border-b border-gray-100">
          {([
            { key: 'action',     label: 'Action',     icon: Send    },
            { key: 'escalade',   label: 'Escalade',   icon: ArrowUpCircle },
            { key: 'historique', label: `Historique (${alerte.historique.length})`, icon: History },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setOnglet(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                onglet === key
                  ? 'border-[#2E7D32] text-[#2E7D32]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu onglet */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {onglet === 'action' && (
            <OngletAction alerte={alerte} currentUser={user} onUpdate={onUpdate} onClose={onClose} />
          )}
          {onglet === 'escalade' && (
            <OngletEscalade alerte={alerte} currentUser={user} onUpdate={onUpdate} />
          )}
          {onglet === 'historique' && (
            <OngletHistorique historique={alerte.historique} />
          )}
        </div>

        {/* Footer — info résolution auto */}
        <div className="px-5 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-400">
            Résolution automatique activée — l'alerte se fermera si le KPI repasse sous le seuil.
          </p>
        </div>
      </div>
    </div>
  );
}