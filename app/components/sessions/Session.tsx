'use client';
import { useState, useEffect } from 'react';
import {
  History, LogIn, LogOut, Search,
  Banknote, Loader2, RefreshCw, Plus,
} from 'lucide-react';
import { CaisseSession, OpenSessionPayload } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';
import SessionCard from '@/app/components/sessions/SessionCard';
import { SessionManager } from '@/app/lib/api/Sessionmanager';
import { Modal } from '@/app/components/ui/Modal';
import OpenSessionModal from './modals/Opensessionmodal';

// ─── Mock temporaire — à supprimer quand l'API est prête ─────────

const MOCK_SESSIONS: CaisseSession[] = [
  {
    id:                       '1',
    username:                 'jean.dupont',
    caissier_nom:             'Jean Dupont',
    numero_caisse:            'C-01',
    branch:                   'uuid-branch-1',
    branch_name:              'Agence Port-au-Prince',
    devise:                   'HTG',
    superviseur:              'marie.joseph',
    id_responsable_cash:      'paul.martin',
    montant_ouverture:        50000,
    montant_fermeture:        undefined,
    statut:                   'ouverte',
    ouverture_at:             new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    fermeture_at:             undefined,
    tentatives_ouverture:     0,
    remise_effectuee:         false,
    reconciliation_effectuee: false,
    actif:                    true,
    nom_caisse:               'Caisse principale',
    localisation:             'Rez-de-chaussée',
    solde_actuel:             50000,
    solde_initial:            50000,
    nb_sessions:              1,
    derniere_session: undefined,
    created_at:       undefined,
  },
  {
    id:                       '2',
    username:                 'alice.pierre',
    caissier_nom:             'Alice Pierre',
    numero_caisse:            'C-02',
    branch:                   'uuid-branch-1',
    branch_name:              'Agence Port-au-Prince',
    devise:                   'HTG',
    superviseur:              'marie.joseph',
    id_responsable_cash:      'paul.martin',
    montant_ouverture:        75000,
    montant_fermeture:        74500,
    statut:                   'fermée',
    ouverture_at:             new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    fermeture_at:             new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    note_fermeture:           'Écart de 500 HTG — billet endommagé retiré.',
    tentatives_ouverture:     0,
    remise_effectuee:         true,
    reconciliation_effectuee: true,
    actif:                    false,
    nom_caisse:               'Caisse secondaire',
    localisation:             '1er étage',
    solde_actuel:             0,
    solde_initial:            75000,
    nb_sessions:              3,
    derniere_session: undefined,
    created_at:       undefined,
  },
  {
    id:                       '3',
    username:                 'robert.jean',
    caissier_nom:             'Robert Jean',
    numero_caisse:            'C-03',
    branch:                   'uuid-branch-2',
    branch_name:              'Agence Pétion-Ville',
    devise:                   'USD',
    superviseur:              'clara.bien',
    id_responsable_cash:      'henri.louis',
    montant_ouverture:        1200,
    montant_fermeture:        1200,
    statut:                   'fermée',
    ouverture_at:             new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    fermeture_at:             new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    tentatives_ouverture:     1,
    remise_effectuee:         true,
    reconciliation_effectuee: true,
    actif:                    false,
    nom_caisse:               'Caisse USD',
    localisation:             'Bureau 2',
    solde_actuel:             0,
    solde_initial:            1200,
    nb_sessions:              5,
    derniere_session: undefined,
    created_at:       undefined,
  },
];

// ─── Wrapper Modal ────────────────────────────────────────────────

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

// ─── Composant principal ──────────────────────────────────────────

export default function SessionsComponent() {
  const [sessions,   setSessions]  = useState<CaisseSession[]>([]);
  const [filtered,   setFiltered]  = useState<CaisseSession[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]    = useState('');
  const [filter,     setFilter]    = useState<'all' | 'ouverte' | 'fermée'>('all');
  const [showModal,  setShowModal]  = useState(false);

  // ── Chargement ─────────────────────────────────────────────────

  const load = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await AxiosInstance.get<CaisseSession[]>('/sessions/');
      data.forEach(s => SessionManager.set(s));
      setSessions(data);
    } catch {
      // TODO : retirer MOCK_SESSIONS quand l'API /sessions/ est prête
      setSessions(MOCK_SESSIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filtrage ───────────────────────────────────────────────────

  useEffect(() => {
    let result = [...sessions];
    if (filter !== 'all') result = result.filter(s => s.statut === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.numero_caisse.toLowerCase().includes(q) ||
        s.superviseur.toLowerCase().includes(q) ||
        s.caissier_nom?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [sessions, search, filter]);

  // ── KPIs ───────────────────────────────────────────────────────

  const nbOuvertes  = sessions.filter(s => s.statut === 'ouverte').length;
  const nbFermees   = sessions.filter(s => s.statut === 'fermée').length;
  const totalOuvert = sessions
    .filter(s => s.statut === 'ouverte')
    .reduce((sum, s) => sum + s.montant_ouverture, 0);

  const formatHTG = (v: number) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency', currency: 'HTG', minimumFractionDigits: 2,
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
      {showModal && (
        <SessionModalWrapper
          onClose={() => setShowModal(false)}
          onSuccess={() => load(true)}
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
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#2E7D32] text-white text-sm font-semibold hover:bg-[#256427] transition-colors shadow-sm"
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

        {/* ── KPIs ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Ouvertes',  value: nbOuvertes,             color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]/50', Icon: LogIn    },
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

        {/* ── Filtres ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher caissier, caisse, superviseur…"
              className="w-full h-10 pl-9 pr-4 rounded-xl border-2 border-gray-200 text-sm bg-white focus:outline-none focus:border-[#2E7D32] transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['all', 'ouverte', 'fermée'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-[#2E7D32] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Liste ── */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <History className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune session trouvée</p>
              <p className="text-xs text-gray-400">
                Ajustez vos filtres ou ouvrez une première session.
              </p>
            </div>
          ) : (
            filtered.map(s => (
              <SessionCard key={s.id} session={s} onRefresh={() => load(true)} />
            ))
          )}
        </div>

      </div>
    </>
  );
}