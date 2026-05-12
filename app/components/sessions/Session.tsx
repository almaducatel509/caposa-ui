'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  History, LogIn, LogOut,
  Banknote, Loader2, RefreshCw, Plus,
} from 'lucide-react';
import { CaisseSession, OpenSessionPayload } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';
import { SessionManager } from '@/app/lib/api/Sessionmanager';
import { Modal } from '@/app/components/ui/Modal';
import OpenSessionModal from './modals/Opensessionmodal';
import CloseSessionModal from './modals/Closesessionmodal';
import SessionDetailModal from './modals/SessionDetailModal';

// 🆕 Règles d'ouverture (horaires + calendrier)
import SessionClosedBanner from '@/app/components/sessions/SessionClosedBanner';
import { useSessionOpeningRules } from '@/hooks/useSessionOpeningRules';
import { SessionBulkAction } from './SessionBulkActionDropdown';
import SessionTable from './sessionTable';

import { useRouter } from 'next/navigation';
import { fetchBranches, fetchHolidays, fetchOpeningHours } from '@/app/lib/api/branche';
import { BranchData,   } from '../branches/validations';
import { Holiday } from '../holidays/validations';
//chemin douteux
import { OpeningHour } from '@/types/branche';
import { ExportAllButton } from '@/app/ExportAllButton';

// ═══════════════════════════════════════════════════════════════
// MOCK_SESSIONS — données réalistes pour développement UI
// À SUPPRIMER quand l'API /sessions/ renvoie les vraies données
// ═══════════════════════════════════════════════════════════════

const now = Date.now();
const h = (n: number) => n * 60 * 60 * 1000;
const d = (n: number) => n * 24 * 60 * 60 * 1000;

const MOCK_SESSIONS: CaisseSession[] = [
  // ─── 1. OUVERTE — Port-au-Prince HTG ─────────────────────
  {
    id: 'sess-001', username: 'jean.dupont', caissier_nom: 'Jean Dupont',
    numero_caisse: 'C-01', branch: 'uuid-branch-pap', branch_name: 'Agence Port-au-Prince',
    devise: 'HTG', superviseur: 'marie.joseph', id_responsable_cash: 'paul.martin',
    montant_ouverture: 50000, montant_fermeture: undefined, statut: 'ouverte',
    ouverture_at: new Date(now - h(3)).toISOString(), fermeture_at: undefined,
    tentatives_ouverture: 0, remise_effectuee: false, reconciliation_effectuee: false,
    actif: true, nom_caisse: 'Caisse principale', localisation: 'Rez-de-chaussée',
    solde_actuel: 65000, solde_initial: 50000, nb_sessions: 1,
    ip_address: '192.168.1.10', device_id: 'Chrome/124 · Windows 11',
    nb_transactions: 12, derniere_session: undefined, created_at: undefined,
  },
  // … (j'ai raccourci ici — garde tes 8 sessions mock, je les omets juste pour la lisibilité)
  // Colle ici tes sess-002 à sess-008 comme tu les avais
];

// ═══════════════════════════════════════════════════════════════
// Wrapper Modal — Ouverture de session
// ═══════════════════════════════════════════════════════════════

interface SessionModalWrapperProps {
  onClose:      () => void;
  onSuccess:    () => void;
  branches:     BranchData[];
  openingHours: OpeningHour[];
  holidays:     Holiday[];
}

function SessionModalWrapper({
  onClose,
  onSuccess,
  branches,
  openingHours,
  holidays,
}: SessionModalWrapperProps) {

  const handleConfirm = async (payload: OpenSessionPayload) => {
    await AxiosInstance.post('/sessions/', payload);
    onSuccess();
    onClose();
  };

  const handleRequireOverride = (reason: string, details: string) => {
    // TODO : ouvrir le SessionOverrideModal ici
    alert(`⚠️ Approbation directeur requise\n\nRaison : ${reason}\n${details}`);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="3xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <LogIn className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Ouvrir une session caisse</h2>
            <p className="text-xs text-gray-400 mt-0.5">Renseignez les informations de la session</p>
          </div>
        </div>
      }
    >
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        <OpenSessionModal
          onClose={onClose}
          onConfirm={handleConfirm}
          branches={branches}
          openingHours={openingHours}
          holidays={holidays}
          onRequireOverride={handleRequireOverride}
        />
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════════════════════════

export default function SessionsComponent() {
  const [sessions,     setSessions]     = useState<CaisseSession[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [showOpen,     setShowOpen]     = useState(false);

  // Données de référence pour vérifier l'éligibilité
  const [branches,     setBranches]     = useState<BranchData[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [holidays,     setHolidays]     = useState<Holiday[]>([]);

  const router = useRouter();

  // Modal détail (déclenché par 👁)
  const [detailSession, setDetailSession] = useState<CaisseSession | null>(null);

  // Modal fermeture (déclenché par 🚪)
  const [closeSession,  setCloseSession]  = useState<CaisseSession | null>(null);

  // 🆕 Vérification horaires + calendrier
  const { rules: openingRules } = useSessionOpeningRules();
  const canOpen = openingRules ? openingRules.canOpen : true;

  // ── Chargement des données de référence (branches, horaires, jours fériés) ──
  useEffect(() => {
    const loadRefData = async () => {
      try {
        const [b, oh, hd] = await Promise.all([
          fetchBranches(),
          fetchOpeningHours(),
          fetchHolidays(),
        ]);
        setBranches(b);
        setOpeningHours(oh);
        setHolidays(hd);
      } catch (err) {
        console.error('Erreur chargement données de référence:', err);
      }
    };
    loadRefData();
  }, []);

  // ── Chargement des sessions ────────────────────────────────────
  const load = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await AxiosInstance.get<CaisseSession[]>('/sessions/');
      data.forEach(s => SessionManager.set(s));
      setSessions(data);
    } catch {
      // ⚠️ MOCK_SESSIONS utilisé en dev — à retirer quand l'API est prête
      setSessions(MOCK_SESSIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Actions groupées (UI only pour l'instant) ──────────────────
  const handleBulkAction = async (action: SessionBulkAction, ids: string[]) => {
    console.log(`[UI] Bulk action: ${action}`, ids);

    if (action === 'export') {
      alert(`[Mock] Export CSV de ${ids.length} session(s) — à implémenter`);
    }

    if (action === 'print') {
      alert(`[Mock] Impression de ${ids.length} fiche(s) — à implémenter`);
    }
  };

  // ── KPIs ───────────────────────────────────────────────────────
  const nbOuvertes  = sessions.filter(s => s.statut === 'ouverte').length;
  const nbFermees   = sessions.filter(s => s.statut === 'fermée').length;
  const totalOuvert = sessions
    .filter(s => s.statut === 'ouverte' && s.devise === 'HTG')
    .reduce((sum, s) => sum + s.montant_ouverture, 0);

  const formatHTG = (v: number) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency', currency: 'HTG', minimumFractionDigits: 0,
    }).format(v);

  
  const exportData = useMemo(() => sessions.map(s => ({
    date: s.ouverture_at ? new Date(s.ouverture_at).toLocaleDateString('fr-CA') : '',
    branche: s.branch_name ?? s.branch ?? '',
    caisse: s.numero_caisse ?? '',
    ouvert_par: s.caissier_nom ?? s.username ?? '',
    ferme_par: s.fermeture_at ? (s.forcee_par ?? s.superviseur ?? '') : '',
    total_transactions: s.nb_transactions ?? 0,
    total_entrees: s.total_entrees ?? 0,
    total_sorties: s.total_sorties ?? 0,
    montant_ouverture: s.montant_ouverture,
    montant_fermeture: s.montant_fermeture ?? '',
    ecart: s.montant_fermeture != null ? s.montant_fermeture - s.montant_ouverture : '',
    statut: s.statut,
    notes: s.notes_completes ?? '',
  })), [sessions]);

if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
          <p className="text-sm text-gray-500">Chargement des sessions…</p>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Modal ouverture */}
      {showOpen && (
        <SessionModalWrapper
          onClose={() => setShowOpen(false)}
          onSuccess={() => load(true)}
          branches={branches}
          openingHours={openingHours}
          holidays={holidays}
        />
      )}

      {/* Modal fermeture */}
      {closeSession && (
        <Modal isOpen onClose={() => setCloseSession(null)} size="3xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <LogOut className="text-red-500" size={15} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Fermer la session</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Clôture de {closeSession.caissier_nom} · {closeSession.numero_caisse}
                </p>
              </div>
            </div>
          }
        >
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <CloseSessionModal
              session={closeSession}
              onClose={() => setCloseSession(null)}
              onConfirm={async (payload) => {
                await AxiosInstance.post(`/sessions/${closeSession.id}/fermer/`, payload);
                setCloseSession(null);
                load(true);
              }}
            />
          </div>
        </Modal>
      )}

      {/* Modal détail (déclenché par 👁) */}
      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          onClose={() => setDetailSession(null)}
        />
      )}

      <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#2E7D32] mb-1">
              <History size={16} />
              <span className="text-xs font-semibold uppercase tracking-widest">Historique</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sessions caisse</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {sessions.length} session(s) enregistrée(s)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOpen(true)}
              disabled={!canOpen}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#2E7D32] text-white text-sm font-semibold hover:bg-[#256427] transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              <Plus className="w-4 h-4" />
              Démarrer une session
            </button>
            <ExportAllButton
              data={exportData}
              filename="sessions"
              label="Exporter"
              separator=","
              excelSepHint={false}   // ← AJOUTE ÇA pour les accents
              headerLabels={{
                date: 'Date',
                branche: 'Branche',
                caisse: 'Caisse',
                ouvert_par: 'Ouvert par',
                ferme_par: 'Fermé par',
                total_transactions: 'Total transactions',
                total_entrees: 'Total entrées',
                total_sorties: 'Total sorties',
                montant_ouverture: 'Montant ouverture',
                montant_fermeture: 'Montant fermeture',
                ecart: 'Écart',
                statut: 'Statut',
                notes: 'Notes',
              }}
            />
            

            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Banner — règles horaires/calendrier */}
        {openingRules && <SessionClosedBanner rules={openingRules} />}

        {/* ── KPIs ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Ouvertes',  value: nbOuvertes,             color: 'text-green-700', bg: 'bg-green-50',     Icon: LogIn    },
            { label: 'Fermées',   value: nbFermees,              color: 'text-gray-700',  bg: 'bg-gray-100',     Icon: LogOut   },
            { label: 'En caisse', value: formatHTG(totalOuvert), color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]/50', Icon: Banknote },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <SessionTable
          sessions={sessions}
          isLoading={loading}
          onView={(s) => router.push(`/dashboard/sessions/${s.id}/audit`)}
          onClose={(s) => setCloseSession(s)}
          onBulkAction={handleBulkAction}
        />
      </div>
    </>
  );
}