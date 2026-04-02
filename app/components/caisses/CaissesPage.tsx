'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PiCashRegisterFill } from 'react-icons/pi';
import {
  Search, RefreshCw, ChevronDown, ChevronUp,
  Banknote, MapPin, Building2, Hash, Coins,
  ToggleLeft, ToggleRight, Eye, X,
  Archive, AlertCircle, CheckCircle2,
  TrendingUp, Clock, Loader2, Plus,
} from 'lucide-react';
import { fetchBranches, createCaisse, Branch } from '@/app/lib/api/caisse';
import {
  CaisseSchema,
  CaisseFormValues,
  validateForm,
} from '@/app/components/sessions/validation';
import CaisseForm from '@/app/components/caisses/CaisseForm';
import AxiosInstance from '@/app/lib/axiosInstance';
import { Caisse } from '@/types/caisse';

// ─── TODO API : remplacer l'interface locale par l'import global ──
// import { Caisse } from '@/types/caisse';
// Une fois que le backend retourne les mêmes champs, supprimer

// ─── Helpers ─────────────────────────────────────────────────────

function fmt(v: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: devise, minimumFractionDigits: 2,
  }).format(v);
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── TODO API : supprimer ce bloc quand l'API est prête ──────────
// Ces mocks simulent ce que GET /caisses/ devrait retourner.
// Structure attendue du serializer Django :
//
// class CaisseSerializer(serializers.ModelSerializer):
//     branch_name    = serializers.CharField(source='branch.__str__')
//     solde_actuel   = serializers.SerializerMethodField()
//     nb_sessions    = serializers.IntegerField(read_only=True)      # annotate
//     derniere_session = serializers.DateTimeField(read_only=True)   # annotate
//
//     def get_solde_actuel(self, obj):
//         return obj.calculer_solde_actuel()

const MOCK_CAISSES: Caisse[] = [
  {
    id: '1', numero_caisse: 'C-01', nom_caisse: 'Caisse principale',
    localisation: 'Rez-de-chaussée — Accueil', branch: 'uuid-1',
    branch_name: 'Agence Port-au-Prince', devise: 'HTG',
    solde_initial: 50000, solde_actuel: 53700, actif: true,
    created_at: '2024-01-15T08:00:00Z', nb_sessions: 42,
    derniere_session: '2026-03-30T15:35:00Z',
  },
  {
    id: '2', numero_caisse: 'C-02', nom_caisse: 'Caisse secondaire',
    localisation: '1er étage — Guichet B', branch: 'uuid-1',
    branch_name: 'Agence Port-au-Prince', devise: 'HTG',
    solde_initial: 30000, solde_actuel: 28500, actif: true,
    created_at: '2024-02-01T08:00:00Z', nb_sessions: 28,
    derniere_session: '2026-03-29T17:00:00Z',
  },
  {
    id: '3', numero_caisse: 'C-03', nom_caisse: 'Caisse USD',
    localisation: 'Rez-de-chaussée — Devises', branch: 'uuid-2',
    branch_name: 'Agence Pétion-Ville', devise: 'USD',
    solde_initial: 5000, solde_actuel: 4800, actif: false,
    created_at: '2024-03-10T08:00:00Z', nb_sessions: 15,
    derniere_session: '2026-02-28T16:00:00Z',
  },
];
// ─── FIN MOCK ────────────────────────────────────────────────────

// ─── Modal générique ─────────────────────────────────────────────

function Modal({
  title, onClose, children, size = 'md',
}: {
  title: React.ReactNode; onClose: () => void;
  children: React.ReactNode; size?: 'md' | 'lg';
}) {
  const w = size === 'lg' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${w} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          {title}
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Modal détail caisse ──────────────────────────────────────────

function CaisseDetailModal({ caisse, onClose }: { caisse: Caisse; onClose: () => void }) {
  return (
    <Modal
      size="md"
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${caisse.actif ? 'bg-[#DDEAD5]' : 'bg-gray-100'}`}>
            <PiCashRegisterFill className={`w-5 h-5 ${caisse.actif ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{caisse.nom_caisse}</h3>
            <p className="text-xs text-gray-400">{caisse.numero_caisse}</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Statut */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
          caisse.actif ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-gray-100 text-gray-500'
        }`}>
          {caisse.actif
            ? <><CheckCircle2 size={16} />Caisse active</>
            : <><AlertCircle size={16} />Caisse inactive</>
          }
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Hash,       label: 'Numéro',      value: caisse.numero_caisse                },
            { icon: Coins,      label: 'Devise',       value: caisse.devise                       },
            { icon: MapPin,     label: 'Localisation', value: caisse.localisation                 },
            { icon: Building2,  label: 'Agence',       value: caisse.branch_name ?? caisse.branch },
            { icon: Clock,      label: 'Créée le',     value: formatDate(caisse.created_at)       },
            { icon: TrendingUp, label: 'Nb sessions',  value: String(caisse.nb_sessions ?? '—')   },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Icon size={11} />{label}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Soldes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Banknote size={11} />Solde initial
            </p>
            <p className="text-lg font-bold text-[#1B5E20]">{fmt(caisse.solde_initial, caisse.devise)}</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Banknote size={11} />Solde actuel
            </p>
            {/* TODO API : solde_actuel doit être retourné par Django
                via SerializerMethodField ou annotate() sur le queryset.
                Si absent → on affiche le solde initial comme fallback. */}
            <p className="text-lg font-bold text-blue-700">
              {caisse.solde_actuel != null ? fmt(caisse.solde_actuel, caisse.devise) : '—'}
            </p>
          </div>
        </div>

        {/* Dernière session */}
        {caisse.derniere_session && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
            <Clock size={14} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Dernière session</p>
              {/* TODO API : derniere_session = Max('sessions__ouverture_at')
                  à annoter dans CaisseViewSet.get_queryset() */}
              <p className="text-sm font-semibold text-gray-700">{formatDate(caisse.derniere_session)}</p>
            </div>
          </div>
        )}

        {/* Lien sessions filtrées par caisse
            TODO API : la page sessions doit lire ?caisse=C-01
            et filtrer via GET /sessions/?numero_caisse=C-01 */}
        <Link
          href={`/dashboard/sessions?caisse=${caisse.numero_caisse}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-[#2E7D32] text-sm font-semibold text-[#2E7D32] hover:bg-[#DDEAD5]/40 transition-colors"
        >
          Voir les sessions de {caisse.numero_caisse}
        </Link>
      </div>
    </Modal>
  );
}

// ─── Card caisse ─────────────────────────────────────────────────

function CaisseCard({ caisse, onOpenDetail }: { caisse: Caisse; onOpenDetail: (c: Caisse) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      caisse.actif ? 'border-gray-100 shadow-sm' : 'border-dashed border-gray-200 opacity-75'
    }`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${caisse.actif ? 'bg-[#DDEAD5]' : 'bg-gray-100'}`}>
          <PiCashRegisterFill className={`w-5 h-5 ${caisse.actif ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{caisse.nom_caisse}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{caisse.numero_caisse}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{caisse.devise}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${caisse.actif ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-gray-100 text-gray-400'}`}>
              {caisse.actif ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {caisse.localisation} · {caisse.branch_name ?? caisse.branch}
          </p>
        </div>

        {/* TODO API : solde_actuel doit venir du backend
            Fallback sur solde_initial si non retourné */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-bold text-[#2E7D32]">
            {fmt(caisse.solde_actuel ?? caisse.solde_initial, caisse.devise)}
          </p>
          <p className="text-xs text-gray-400">Solde actuel</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onOpenDetail(caisse)} className="p-2 rounded-xl text-gray-400 hover:text-[#2E7D32] hover:bg-[#DDEAD5]/40 transition-colors" title="Voir les détails">
            <Eye size={16} />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Déroulement — tous les champs annotés côté Django */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Banknote,   label: 'Solde initial',    value: fmt(caisse.solde_initial, caisse.devise),                                              color: 'text-gray-700'  },
            { icon: TrendingUp, label: 'Solde actuel',     value: caisse.solde_actuel != null ? fmt(caisse.solde_actuel, caisse.devise) : '—',            color: 'text-[#2E7D32]' },
            { icon: Clock,      label: 'Sessions',         value: String(caisse.nb_sessions ?? '—'),   /* TODO API : annotate Count('sessions') */         color: 'text-blue-600'  },
            { icon: Clock,      label: 'Dernière session', value: formatDate(caisse.derniere_session), /* TODO API : annotate Max('sessions__ouverture_at') */ color: 'text-gray-700' },
            { icon: MapPin,     label: 'Localisation',     value: caisse.localisation,                                                                    color: 'text-gray-700'  },
            { icon: Building2,  label: 'Agence',           value: caisse.branch_name ?? '—',           /* TODO API : source='branch.__str__' dans serializer */ color: 'text-gray-700' },
            { icon: Clock,      label: 'Créée le',         value: formatDate(caisse.created_at),       /* TODO API : auto_now_add=True sur le modèle */    color: 'text-gray-700'  },
            { icon: Coins,      label: 'Devise',           value: caisse.devise,                                                                          color: 'text-blue-600'  },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Icon size={11} />{label}</p>
              <p className={`text-sm font-semibold ${color} truncate`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────

export default function CaissesPage() {
  const [caisses,      setCaisses]     = useState<Caisse[]>([]);
  const [filtered,     setFiltered]    = useState<Caisse[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [refreshing,   setRefreshing]  = useState(false);
  const [search,       setSearch]      = useState('');
  const [filter,       setFilter]      = useState<'all' | 'active' | 'inactive'>('all');
  const [detailModal,  setDetailModal] = useState<Caisse | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // ── Chargement ───────────────────────────────────────────────────
  // TODO API : GET /caisses/
  // Endpoint attendu : /api/caisses/ ou /api/cash-registers/
  // Query params supportés par le backend :
  //   ?actif=true     → caisses actives seulement
  //   ?branch=uuid    → filtrer par agence
  //   ?devise=HTG     → filtrer par devise
  // Le backend doit annoter nb_sessions, derniere_session, solde_actuel.

  const load = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await AxiosInstance.get<Caisse[]>('/caisses/');
      setCaisses(data);
    } catch {
      // TODO API : supprimer ce fallback quand l'API est disponible
      setCaisses(MOCK_CAISSES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filtrage local ────────────────────────────────────────────────
  // TODO API : quand le volume de caisses devient grand,
  // déléguer le filtrage au backend via query params :
  // GET /caisses/?actif=true&search=C-01&branch=uuid

  useEffect(() => {
    let result = [...caisses];
    if (filter === 'active')   result = result.filter(c => c.actif);
    if (filter === 'inactive') result = result.filter(c => !c.actif);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.numero_caisse.toLowerCase().includes(q) ||
        c.nom_caisse.toLowerCase().includes(q) ||
        c.localisation.toLowerCase().includes(q) ||
        (c.branch_name ?? '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [caisses, search, filter]);

  const nbActives   = caisses.filter(c => c.actif).length;
  const nbInactives = caisses.filter(c => !c.actif).length;
  const totalHTG    = caisses
    .filter(c => c.devise === 'HTG' && c.actif)
    .reduce((s, c) => s + (c.solde_actuel ?? c.solde_initial), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
          <p className="text-sm text-gray-500">Chargement des caisses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2E7D32] mb-1">
            <PiCashRegisterFill className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Gestion</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Caisses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{caisses.length} caisse(s) enregistrée(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(true)} disabled={refreshing} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Ouvre CaisseForm dans un modal → POST /caisses/
              TODO API : CaisseForm envoie POST /caisses/ avec le payload CaisseFormValues.
              Après succès → load(true) rafraîchit la liste. */}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={16} />Nouvelle caisse
          </button>
        </div>
      </div>

      {/* KPIs
          TODO API : ces valeurs sont calculées localement depuis les données chargées.
          Quand l'API retourne des aggregats, utiliser GET /caisses/stats/ à la place. */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Actives',   value: nbActives,     color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]/50', icon: ToggleRight },
          { label: 'Inactives', value: nbInactives,   color: 'text-gray-500',  bg: 'bg-gray-100',     icon: ToggleLeft  },
          { label: 'Total HTG', value: fmt(totalHTG), color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]/50', icon: Banknote    },
        ].map(({ label, value, color, bg, icon: Icon }) => (
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

      {/* Filtres — actuellement côté client
          TODO API : passer en server-side si > 100 caisses */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher caisse, localisation, agence…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border-2 border-gray-200 text-sm bg-white focus:outline-none focus:border-[#2E7D32] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {([
            { key: 'all',      label: 'Toutes'    },
            { key: 'active',   label: 'Actives'   },
            { key: 'inactive', label: 'Inactives' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3 mb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <PiCashRegisterFill className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucune caisse trouvée</p>
            <p className="text-xs text-gray-400">Ajustez vos filtres ou créez une nouvelle caisse.</p>
          </div>
        ) : (
          filtered.map(c => (
            <CaisseCard key={c.id} caisse={c} onOpenDetail={setDetailModal} />
          ))
        )}
      </div>

      {/* Lien Archives → /dashboard/archives
          Les caisses archivées (actif=false) sont visibles dans la page archives globale
          sous la catégorie "Administratif / Gestion caisse".
          TODO API : le lien peut inclure ?categorie=caisse quand le backend supporte ce filtre. */}
      <Link
        href="/dashboard/archives"
        className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
          <Archive className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Caisses archivées</p>
          <p className="text-xs text-gray-400">Voir les caisses désactivées et hors service</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-auto -rotate-90 group-hover:text-gray-600 transition-colors" />
      </Link>

      {/* Modal détail caisse */}
      {detailModal && (
        <CaisseDetailModal caisse={detailModal} onClose={() => setDetailModal(null)} />
      )}

      {/* Modal nouvelle caisse
          CaisseForm envoie POST /caisses/ via AxiosInstance.
          onSuccess → ferme le modal + rafraîchit la liste sans rechargement de page. */}
      {showNewModal && (
        <Modal
          size="lg"
          onClose={() => setShowNewModal(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
                <PiCashRegisterFill className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Nouvelle caisse</h3>
                <p className="text-xs text-gray-400 mt-0.5">Renseignez les informations de la caisse</p>
              </div>
            </div>
          }
        >
          <CaisseForm
            onCancel={() => setShowNewModal(false)}
            onSuccess={() => {
              setShowNewModal(false);
              load(true); // rafraîchit GET /caisses/ après création
            }}
          />
        </Modal>
      )}

    </div>
  );
}