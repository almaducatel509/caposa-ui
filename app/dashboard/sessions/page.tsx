'use client';
import { useState, useEffect } from 'react';
import {
  History, LogIn, LogOut, Search,
  Banknote, Loader2, RefreshCw,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';
import SessionCard from '@/app/components/sessions/SessionCard';
import { SessionManager } from '@/app/lib/api/Sessionmanager';

// ─── Page ────────────────────────────────────────────────────────

export default function SessionsPage() {
  const [sessions,   setSessions]  = useState<CaisseSession[]>([]);
  const [filtered,   setFiltered]  = useState<CaisseSession[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]    = useState('');
  const [filter,     setFilter]    = useState<'all' | 'ouverte' | 'fermée'>('all');

  // ── Chargement ───────────────────────────────────────────────────

  const load = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await AxiosInstance.get<CaisseSession[]>('/sessions/');
      data.forEach(s => SessionManager.set(s));
      setSessions(data);
    } catch {
      setSessions(SessionManager.getAll());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filtrage ─────────────────────────────────────────────────────

  useEffect(() => {
    let result = [...sessions];
    if (filter !== 'all') result = result.filter(s => s.statut === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.caissier_nom.toLowerCase().includes(q) ||
        s.numero_caisse.toLowerCase().includes(q) ||
        s.superviseur.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [sessions, search, filter]);

  // ── KPIs ─────────────────────────────────────────────────────────

  const nbOuvertes  = sessions.filter(s => s.statut === 'ouverte').length;
  const nbFermees   = sessions.filter(s => s.statut === 'fermée').length;
  const totalOuvert = sessions
    .filter(s => s.statut === 'ouverte')
    .reduce((sum, s) => sum + s.montant_ouverture, 0);

  const formatHTG = (v: number) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency', currency: 'HTG', minimumFractionDigits: 2,
    }).format(v);

  // ── Chargement initial ───────────────────────────────────────────

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
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Ouvertes',  value: nbOuvertes,           color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]/50', Icon: LogIn    },
          { label: 'Fermées',   value: nbFermees,            color: 'text-gray-700',  bg: 'bg-gray-100',     Icon: LogOut   },
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

      {/* ── Liste de SessionCard ── */}
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
            <SessionCard key={s.id} session={s} />
          ))
        )}
      </div>

    </div>
  );
}