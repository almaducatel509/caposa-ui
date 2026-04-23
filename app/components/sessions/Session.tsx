'use client';
import { useState, useEffect } from 'react';
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
    id:                       'sess-001',
    username:                 'jean.dupont',
    caissier_nom:             'Jean Dupont',
    numero_caisse:            'C-01',
    branch:                   'uuid-branch-pap',
    branch_name:              'Agence Port-au-Prince',
    devise:                   'HTG',
    superviseur:              'marie.joseph',
    id_responsable_cash:      'paul.martin',
    montant_ouverture:        50000,
    montant_fermeture:        undefined,
    statut:                   'ouverte',
    ouverture_at:             new Date(now - h(3)).toISOString(),
    fermeture_at:             undefined,
    tentatives_ouverture:     0,
    remise_effectuee:         false,
    reconciliation_effectuee: false,
    actif:                    true,
    nom_caisse:               'Caisse principale',
    localisation:             'Rez-de-chaussée',
    solde_actuel:             65000,
    solde_initial:            50000,
    nb_sessions:              1,
    ip_address:               '192.168.1.10',
    device_id:                'Chrome/124 · Windows 11',
    nb_transactions:          12,
    derniere_session:         undefined,
    created_at:               undefined,
  },

  // ─── 2. OUVERTE — USD ───────────────────────────────────
  {
    id:                       'sess-002',
    username:                 'sophie.louis',
    caissier_nom:             'Sophie Louis',
    numero_caisse:            'C-05',
    branch:                   'uuid-branch-pap',
    branch_name:              'Agence Port-au-Prince',
    devise:                   'USD',
    superviseur:              'marie.joseph',
    id_responsable_cash:      'paul.martin',
    montant_ouverture:        800,
    montant_fermeture:        undefined,
    statut:                   'ouverte',
    ouverture_at:             new Date(now - h(1.5)).toISOString(),
    fermeture_at:             undefined,
    tentatives_ouverture:     0,
    remise_effectuee:         false,
    reconciliation_effectuee: false,
    actif:                    true,
    nom_caisse:               'Caisse USD',
    localisation:             'Rez-de-chaussée',
    solde_actuel:             800,
    solde_initial:            800,
    nb_sessions:              1,
    ip_address:               '192.168.1.15',
    device_id:                'Chrome/124 · Windows 11',
    taux_change:              135.50,
    montant_equivalent:       108400,
    nb_transactions:          3,
    derniere_session:         undefined,
    created_at:               undefined,
  },

  // ─── 3. FERMÉE NORMALE — par caissier ──────────────────
  {
    id:                       'sess-003',
    username:                 'robert.jean',
    caissier_nom:             'Robert Jean',
    numero_caisse:            'C-03',
    branch:                   'uuid-branch-pv',
    branch_name:              'Agence Pétion-Ville',
    devise:                   'HTG',
    superviseur:              'clara.bien',
    id_responsable_cash:      'henri.louis',
    montant_ouverture:        30000,
    montant_fermeture:        30000,
    statut:                   'fermée',
    ouverture_at:             new Date(now - h(28)).toISOString(),
    fermeture_at:             new Date(now - h(20)).toISOString(),
    tentatives_ouverture:     0,
    remise_effectuee:         true,
    reconciliation_effectuee: true,
    actif:                    false,
    nom_caisse:               'Caisse 3',
    localisation:             'Bureau 2',
    solde_actuel:             0,
    solde_initial:            30000,
    nb_sessions:              5,
    ip_address:               '192.168.2.12',
    device_id:                'Edge/124',
    nb_transactions:          18,
    ferme_par:                'robert.jean',
    derniere_session:         undefined,
    created_at:               undefined,
  } as CaisseSession & { ferme_par?: string },

  // ─── 4. FERMÉE AVEC ÉCART NÉGATIF — par superviseur ───
  {
    id:                       'sess-004',
    username:                 'alice.pierre',
    caissier_nom:             'Alice Pierre',
    numero_caisse:            'C-02',
    branch:                   'uuid-branch-pap',
    branch_name:              'Agence Port-au-Prince',
    devise:                   'HTG',
    superviseur:              'marie.joseph',
    id_responsable_cash:      'paul.martin',
    montant_ouverture:        75000,
    montant_fermeture:        74500,
    statut:                   'fermée',
    ouverture_at:             new Date(now - h(10)).toISOString(),
    fermeture_at:             new Date(now - h(2)).toISOString(),
    note_fermeture:           'Écart de 500 HTG — billet endommagé retiré de la caisse et remis au superviseur.',
    tentatives_ouverture:     0,
    remise_effectuee:         true,
    reconciliation_effectuee: true,
    actif:                    false,
    nom_caisse:               'Caisse secondaire',
    localisation:             '1er étage',
    solde_actuel:             0,
    solde_initial:            75000,
    nb_sessions:              3,
    ip_address:               '192.168.1.22',
    device_id:                'Chrome/124',
    nb_transactions:          24,
    ferme_par:                'marie.joseph',
    derniere_session:         undefined,
    created_at:               undefined,
  } as CaisseSession & { ferme_par?: string },

  // ─── 5. FERMÉE AVEC ÉCART POSITIF ─────────────────────
  {
    id:                       'sess-005',
    username:                 'pierre.boncoeur',
    caissier_nom:             'Pierre Boncœur',
    numero_caisse:            'C-04',
    branch:                   'uuid-branch-cap',
    branch_name:              'Agence Cap-Haïtien',
    devise:                   'HTG',
    superviseur:              'yves.francois',
    id_responsable_cash:      'nadege.laurent',
    montant_ouverture:        40000,
    montant_fermeture:        40250,
    statut:                   'fermée',
    ouverture_at:             new Date(now - d(2)).toISOString(),
    fermeture_at:             new Date(now - d(2) + h(8)).toISOString(),
    note_fermeture:           'Écart positif de 250 HTG — à investiguer le lendemain.',
    tentatives_ouverture:     1,
    remise_effectuee:         true,
    reconciliation_effectuee: true,
    actif:                    false,
    nom_caisse:               'Caisse Cap',
    localisation:             'Guichet 1',
    solde_actuel:             0,
    solde_initial:            40000,
    nb_sessions:              8,
    ip_address:               '10.20.1.5',
    device_id:                'Firefox/123',
    nb_transactions:          15,
    ferme_par:                'pierre.boncoeur',
    derniere_session:         undefined,
    created_at:               undefined,
  } as CaisseSession & { ferme_par?: string },

  // ─── 6. FERMÉE DE FORCE — fin de journée admin ────────
  {
    id:                       'sess-006',
    username:                 'claude.durand',
    caissier_nom:             'Claude Durand',
    numero_caisse:            'C-06',
    branch:                   'uuid-branch-pap',
    branch_name:              'Agence Port-au-Prince',
    devise:                   'HTG',
    superviseur:              'marie.joseph',
    id_responsable_cash:      'paul.martin',
    montant_ouverture:        60000,
    montant_fermeture:        55000,
    statut:                   'fermée',
    ouverture_at:             new Date(now - d(1) - h(2)).toISOString(),
    fermeture_at:             new Date(now - d(1)).toISOString(),
    note_fermeture:           'Caissier parti sans clôturer.',
    tentatives_ouverture:     0,
    remise_effectuee:         false,
    reconciliation_effectuee: false,
    actif:                    false,
    nom_caisse:               'Caisse 6',
    localisation:             'Guichet 3',
    solde_actuel:             0,
    solde_initial:            60000,
    nb_sessions:              12,
    ip_address:               '192.168.1.30',
    device_id:                'Chrome/124',
    nb_transactions:          8,
    forcee_par:               'admin.system',
    raison_forcage:           'Clôture forcée automatique — fin de journée atteinte sans action du caissier.',
    ferme_par:                'admin.system',
    derniere_session:         undefined,
    created_at:               undefined,
  } as CaisseSession & { ferme_par?: string },

  // ─── 7. FERMÉE DE FORCE — incident sécurité ───────────
  {
    id:                       'sess-007',
    username:                 'michel.antoine',
    caissier_nom:             'Michel Antoine',
    numero_caisse:            'C-08',
    branch:                   'uuid-branch-pv',
    branch_name:              'Agence Pétion-Ville',
    devise:                   'HTG',
    superviseur:              'clara.bien',
    id_responsable_cash:      'henri.louis',
    montant_ouverture:        25000,
    montant_fermeture:        25000,
    statut:                   'fermée',
    ouverture_at:             new Date(now - d(3)).toISOString(),
    fermeture_at:             new Date(now - d(3) + h(1)).toISOString(),
    note_fermeture:           'Session fermée suite à une alerte.',
    tentatives_ouverture:     3,
    remise_effectuee:         false,
    reconciliation_effectuee: false,
    actif:                    false,
    nom_caisse:               'Caisse 8',
    localisation:             'Guichet 4',
    solde_actuel:             0,
    solde_initial:            25000,
    nb_sessions:              2,
    ip_address:               '192.168.2.18',
    device_id:                'Chrome/124',
    nb_transactions:          1,
    forcee_par:               'security.admin',
    raison_forcage:           'Tentatives multiples de connexion suspectes. Session suspendue en attente d\'investigation.',
    ferme_par:                'security.admin',
    derniere_session:         undefined,
    created_at:               undefined,
  } as CaisseSession & { ferme_par?: string },

  // ─── 8. FERMÉE NORMALE — ancienne session ────────────
  {
    id:                       'sess-008',
    username:                 'françoise.etienne',
    caissier_nom:             'Françoise Étienne',
    numero_caisse:            'C-07',
    branch:                   'uuid-branch-cap',
    branch_name:              'Agence Cap-Haïtien',
    devise:                   'HTG',
    superviseur:              'yves.francois',
    id_responsable_cash:      'nadege.laurent',
    montant_ouverture:        45000,
    montant_fermeture:        45000,
    statut:                   'fermée',
    ouverture_at:             new Date(now - d(4)).toISOString(),
    fermeture_at:             new Date(now - d(4) + h(7)).toISOString(),
    tentatives_ouverture:     0,
    remise_effectuee:         true,
    reconciliation_effectuee: true,
    actif:                    false,
    nom_caisse:               'Caisse 7',
    localisation:             'Guichet 2',
    solde_actuel:             0,
    solde_initial:            45000,
    nb_sessions:              15,
    ip_address:               '10.20.1.8',
    device_id:                'Chrome/124',
    nb_transactions:          21,
    ferme_par:                'françoise.etienne',
    derniere_session:         undefined,
    created_at:               undefined,
  } as CaisseSession & { ferme_par?: string },
];

// ═══════════════════════════════════════════════════════════════
// Wrapper Modal — Ouverture de session
// ═══════════════════════════════════════════════════════════════

function SessionModalWrapper({ onClose, onSuccess }: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const handleConfirm = async (payload: OpenSessionPayload) => {
    await AxiosInstance.post('/sessions/', payload);
    onSuccess();
    onClose();
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
        <OpenSessionModal onClose={onClose} onConfirm={handleConfirm} />
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════════════════════════

export default function SessionsComponent() {
  const [sessions, setSessions] = useState<CaisseSession[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOpen,   setShowOpen]   = useState(false);

  const router = useRouter();  // ✅ ICI, à l'intérieur du composant

  // Modal détail (déclenché par 👁)
  const [detailSession, setDetailSession] = useState<CaisseSession | null>(null);

  // Modal fermeture (déclenché par 🚪)
  const [closeSession, setCloseSession] = useState<CaisseSession | null>(null);

  // 🆕 Vérification horaires + calendrier
  const { rules: openingRules } = useSessionOpeningRules();
  const canOpen = openingRules ? openingRules.canOpen : true;

  // ── Chargement ─────────────────────────────────────────────────
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
            { label: 'Ouvertes',   value: nbOuvertes,              color: 'text-green-700',  bg: 'bg-green-50',     Icon: LogIn    },
            { label: 'Fermées',    value: nbFermees,               color: 'text-gray-700',    bg: 'bg-gray-100',    Icon: LogOut   },
            { label: 'En caisse',  value: formatHTG(totalOuvert),  color: 'text-[#2E7D32]',   bg: 'bg-[#DDEAD5]/50', Icon: Banknote },
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
          onView={(s) => router.push(`/dashboard/sessions/${s.id}/audit`)}  // ✅
          onClose={(s) => setCloseSession(s)}
          onBulkAction={handleBulkAction}
        />
      </div>
    </>
  );
}