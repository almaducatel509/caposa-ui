'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Lock, Unlock, Sun, Sunset, ChevronRight,
  Bell, LogIn, LogOut, Loader2,
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, HandCoins,
  XCircle, AlertTriangle, CheckCircle,
  Landmark,
  Repeat,
} from 'lucide-react';
import { fetchPosts } from '@/app/lib/api/post'; // ajuste le chemin réel selon où se trouve fetchPosts

import { fetchDashboard, fetchTransactions, openSession, closeSession, fetchCaisses } from '@/app/lib/api/caisse';
import type { TransactionData } from '@/app/components/transactions/types';
import type {
  Caisse,
  CaisseAlert, CaisseSession, CaisseStatus, OpenSessionPayload,
} from '@/types/caisse';

import { fetchEmployees } from '@/app/lib/api/employee';

import OpenSessionModal  from '../../sessions/modals/Opensessionmodal';
import CloseSessionModal from '../../sessions/modals/Closesessionmodal';

import { Modal }         from '../../ui/Modal';
import { useSession }    from 'next-auth/react';
import DashboardStats, { TypePoint, VolumePoint } from './DashboardStats';
import { OpeningHour } from '@/types/branche';
import { fetchBranches, fetchOpeningHours, fetchHolidays } from '@/app/lib/api/branche';
import { BranchData } from '../../branches/validations';
import { Holiday } from '../../holidays/validations';
import { fetchRecentTransactions } from '@/app/lib/api/transaction';
import { FEATURES } from '@/app/lib/features';

// ─────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────

const C = {
  green:     '#2E7D32',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  red:       '#DC2626',
};

// Shape légère utilisée uniquement pour les "dernières transactions"
// des Actions rapides (recentTx) — pas le même type que TransactionData
// utilisé pour les stats/graphiques plus bas. Les deux coexistent
// volontairement, ne pas les fusionner sans vérifier les deux usages.
type Transaction = {
  id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_repayment';
  amount: string;
  created_at: string; // ISO string
};

// Config d'affichage (libellé + couleur) pour les graphiques DashboardStats.
// Clés alignées sur TransactionData['type'].
const TX_TYPE_META: Record<TransactionData['type'], { label: string; color: string }> = {
  deposit:    { label: 'Dépôt',     color: C.green },
  withdrawal: { label: 'Retrait',   color: C.red   },
  transfer:   { label: 'Transfert', color: C.blue  },
  loan:       { label: 'Prêt',      color: C.gold  },
};

// Config d'affichage (signe + couleur texte) pour le bloc "Actions rapides".
// ⚠️ Utilise 'loan_repayment' (type de `recentTx`) contrairement à TX_TYPE_META
// et TX_ROW_CFG qui utilisent 'loan' (type de `TransactionData`). C'est
// volontaire vu que ces deux sections lisent deux sources différentes
// (recentTx vs transactions) — attention si tu unifies un jour ces types.
const typeConfig: Record<string, { sign: string; color: string }> = {
  deposit:         { sign: '+', color: 'text-green-600' },
  withdrawal:      { sign: '-', color: 'text-red-600'   },
  transfer:        { sign: '+', color: 'text-blue-600'  },
  loan_repayment:  { sign: '-', color: 'text-yellow-600'},
};

// Config d'affichage (icône + couleurs) pour chaque ligne de la liste
// de transactions (TxRow), basée sur TransactionData['type'].
const TX_ROW_CFG: Record<TransactionData['type'], {
  icon: React.ElementType; color: string; bg: string; label: string;
}> = {
  deposit:    { icon: ArrowDownCircle, color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]', label: 'Dépôt'     },
  withdrawal: { icon: ArrowUpCircle,   color: 'text-red-600',   bg: 'bg-red-50',    label: 'Retrait'   },
  transfer:   { icon: ArrowLeftRight,  color: 'text-[#355C7D]', bg: 'bg-blue-50',   label: 'Transfert' },
  loan:       { icon: HandCoins,       color: 'text-[#D4AF37]', bg: 'bg-yellow-50', label: 'Prêt'      },
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: 'HTG', minimumFractionDigits: 0,
  }).format(v);
}

function getNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? { text: 'Bonjour',        icon: Sun    }
       : h < 18 ? { text: 'Bon après-midi', icon: Sun    }
       :          { text: 'Bonsoir',        icon: Sunset };
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────────────────────────
// Petits composants
// ─────────────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: TransactionData }) {
  const cfg  = TX_ROW_CFG[tx.type];
  const Icon = cfg.icon;
  const sign = tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : '·';
  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#DDEAD5]/10 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
        <p className="text-xs text-gray-400 truncate">{tx.description}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${cfg.color}`}>{sign} {formatHTG(tx.amount)}</p>
        <p className="text-xs text-gray-400">
          {new Date(tx.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function AlertBadge({ severity, message, time }: CaisseAlert) {
  const s = {
    error:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    Icon: XCircle       },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', Icon: AlertTriangle },
    info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   Icon: Bell          },
  }[severity];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${s.bg} border ${s.border}`}>
      <s.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.text}`} />
      <div>
        <p className={`text-sm font-medium ${s.text}`}>{message}</p>
        {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
      </div>
    </div>
  );
}

function AlertsBell({ alerts }: { alerts: CaisseAlert[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Ferme le popover au clic en dehors du composant (ref).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const count = alerts.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Alertes"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Alertes & anomalies</h3>
            {count > 0 && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <div className="p-3 max-h-96 overflow-y-auto flex flex-col gap-2">
            {count === 0 ? (
              <div className="flex flex-col items-center py-8">
                <CheckCircle className="w-10 h-10 text-[#2E7D32] mb-2" />
                <p className="text-sm font-medium text-gray-700">Aucune alerte active</p>
              </div>
            ) : (
              alerts.map(a => <AlertBadge key={a.id} {...a} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dashboard principal
// ─────────────────────────────────────────────────────────────────

export default function DashboardCaissier() {
  // ── State: données caisse / session ──
  const [sessions,       setSessions]      = useState<CaisseSession[]>([]);
  const [transactions,   setTransactions]  = useState<TransactionData[]>([]);
  const [alerts, setAlerts] = useState<CaisseAlert[] | null>(null);
  const [montantCaisse,  setMontantCaisse] = useState(0);
  const [caisseStatus,   setCaisseStatus]  = useState<CaisseStatus>('fermée');
  const [isLoading,      setIsLoading]     = useState(true);
// ...
const [posts, setPosts] = useState<any[]>([]); // remplace `any` par PostData si le type est importable ici
  // ── State: modals ──
  const [showOpenModal,  setShowOpenModal]  = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // ── State: UI (horloge, filtre période) ──
  const [time,   setTime]   = useState(getNow());
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  // ── State: données de référence pour OpenSessionModal ──
  // (succursales, horaires, jours fériés, caisses, employés)
  const [branches,     setBranches]     = useState<BranchData[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [holidays,     setHolidays]     = useState<Holiday[]>([]);
  const [caisses,      setCaisses]      = useState<Caisse[]>([]);
  const [employees,    setEmployees]    = useState<any[]>([]); // ← ajouté : nécessaire pour les selects Superviseur / Responsable cash

  // ── State: "Actions rapides" (dernière transaction par type) ──
  const [recentTx,  setRecentTx]  = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  const activeSession = sessions.find(s => s.statut === 'ouverte') ?? null;
  const greeting  = getGreeting();
  const GreetIcon = greeting.icon;
  const { data: session } = useSession();
  const [dashError, setDashError] = useState<string | null>(null);

  // Chargement des dernières transactions (bloc "Actions rapides").
  // Indépendant du chargement principal ci-dessous car il alimente
  // une autre partie de l'écran et n'a pas besoin de bloquer isLoading.
  useEffect(() => {
    fetchRecentTransactions().then((data) => {
      setRecentTx(data);
      setTxLoading(false);
    });
  }, []);

  // Dernière transaction connue pour un type donné (Actions rapides).
  const last = (type: string) =>
    recentTx.find((t) => t.transaction_type === type);

  // Horloge de l'en-tête, rafraîchie chaque minute.
  useEffect(() => {
    const t = setInterval(() => setTime(getNow()), 60000);
    return () => clearInterval(t);
  }, []);

  // Chargement initial de toutes les données du dashboard en parallèle.
  // fetchDashboard a son propre fallback pour ne pas faire échouer
  // tout le Promise.all si le endpoint dashboard tombe.
  useEffect(() => {
  Promise.all([
    fetchDashboard().catch((err: Error) => {
      setDashError(err.message);
      return { sessions: [], transactions: [], alerts: null, montant_caisse: 0 };
    }),
    fetchBranches(),
    fetchOpeningHours(),
    fetchHolidays(),
    fetchCaisses(),
    fetchEmployees(),
    fetchPosts(),
  ]).then(([dash, b, oh, h, c, emp, p]) => {
    setSessions(dash.sessions);
    setTransactions(dash.transactions);
    setAlerts(dash.alerts);
    setMontantCaisse(dash.montant_caisse);
    setCaisseStatus(dash.sessions.some((s: CaisseSession) => s.statut === 'ouverte') ? 'ouverte' : 'fermée');

    setBranches(Array.isArray(b) ? b : (b?.results ?? []));
    setOpeningHours(Array.isArray(oh) ? oh : (oh?.results ?? []));
    setHolidays(Array.isArray(h) ? h : (h?.results ?? []));
    setCaisses(Array.isArray(c) ? c : []);
    setEmployees(Array.isArray(emp) ? emp : (emp?.results ?? []));
    setPosts(Array.isArray(p) ? p : (p?.results ?? []));
  }).finally(() => setIsLoading(false));
}, []);

  const handleOpenSession = async (payload: OpenSessionPayload) => {
    const s = await openSession(payload);
    setSessions(prev => [...prev, s]);
    setCaisseStatus('ouverte');
    setShowOpenModal(false);
  };

  const handleCloseSession = async (payload: {
    montant_fermeture: number;
    note_fermeture?:   string;
  }) => {
    if (!activeSession) return;
    const closed = await closeSession(activeSession.id, payload);
    setSessions(prev => prev.map(s => s.id === activeSession.id ? closed : s));
    setCaisseStatus('fermée');
    setShowCloseModal(false);
  };

  const currentUser = {
    name: session?.user?.name ?? 'Utilisateur',
    role: (session?.user as any)?.role ?? 'Caissier',
  };

  // ── Filtre transactions selon la période sélectionnée ──
  const filteredTx = useMemo(() => {
    const now      = new Date();
    const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const cutoff   = new Date(now);
    cutoff.setDate(cutoff.getDate() - daysBack);
    cutoff.setHours(0, 0, 0, 0);
    return transactions.filter(tx => new Date(tx.created_at) >= cutoff);
  }, [transactions, period]);

  // ── KPIs passés à DashboardStats ──
  const completed         = filteredTx.filter(t => t.status === 'completed');
  const totalAmount       = montantCaisse;                                   // Solde caisse (net, pas filtré par période)
  const transactionCount  = filteredTx.length;
  const completedCount    = completed.length;
  const avgAmount         = completed.length
    ? completed.reduce((s, t) => s + t.amount, 0) / completed.length
    : 0;
  const uniqueMembers     = new Set(filteredTx.map(t => t.member_name).filter(Boolean)).size;
  const pendingCount      = filteredTx.filter(t => t.status === 'pending').length;
  const completionRate    = filteredTx.length
    ? (completedCount / filteredTx.length) * 100
    : 0;

  // ── Données pour les graphes Volume + Tendance ──
  // Construit d'abord des "buckets" vides (par heure si period='day',
  // sinon par jour ouvré), puis y agrège les transactions complétées.
  const volumeData = useMemo((): VolumePoint[] => {
    const days: VolumePoint[] = [];

    if (period === 'day') {
      // Étalement par heure de 9h à 17h (horaires d'ouverture standard)
      for (let h = 9; h <= 17; h++) {
        const d = new Date(); d.setHours(h, 0, 0, 0);
        days.push({ label: `${h}h`, date: d.toISOString(), count: 0, amount: 0 });
      }
    } else {
      // Jours ouvrés (lun-ven) sur la période, en remontant depuis aujourd'hui.
      // `back < 60` est un garde-fou pour éviter une boucle infinie.
      const target = period === 'week' ? 5 : 22;
      let back = 0;
      while (days.length < target && back < 60) {
        back++;
        const d = new Date(); d.setDate(d.getDate() - back);
        if (d.getDay() === 0 || d.getDay() === 6) continue; // saute weekends
        days.unshift({
          label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          date:  d.toISOString().split('T')[0],
          count: 0,
          amount: 0,
        });
      }
    }

    filteredTx.forEach(tx => {
      if (tx.status !== 'completed') return;
      const txDate = new Date(tx.created_at);
      const idx = days.findIndex(item =>
        period === 'day'
          ? new Date(item.date).getHours() === txDate.getHours()
          : item.date === tx.created_at.split('T')[0]
      );
      if (idx >= 0) {
        days[idx].count++;
        days[idx].amount += tx.amount;
      }
    });

    return days;
  }, [filteredTx, period]);

  // ── Données pour le donut "Répartition par type" ──
  const typeData = useMemo((): TypePoint[] =>
    (['deposit', 'withdrawal', 'transfer', 'loan'] as const).map(key => {
      const items = filteredTx.filter(t => t.type === key);
      return {
        key,
        name:   TX_TYPE_META[key].label,
        value:  items.length,
        amount: items.reduce((s, t) => s + t.amount, 0),
        color:  TX_TYPE_META[key].color,
      };
    }).filter(t => t.value > 0), // cache les types absents (évite les parts à 0 dans le donut)
  [filteredTx]);

  // ── Render ──

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2E7D32]" />
          <p className="text-sm text-gray-500">Chargement du dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2E7D32] mb-1">
            <GreetIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{greeting.text}, {currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Caissier</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{getDate()} · {time}</p>
        </div>
          {FEATURES.alerts && alerts && <AlertsBell alerts={alerts} />}
      </div>
      {/* juste sous le header */}
      {dashError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashError}
        </div>
      )}
      {/* ── Bannière statut caisse (ouverte/fermée) ── */}
      <div className={`rounded-2xl border-2 p-5 transition-all ${
        caisseStatus === 'fermée' ? 'bg-orange-50 border-orange-200' : 'bg-[#DDEAD5] border-[#2E7D32]/40'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              caisseStatus === 'fermée' ? 'bg-orange-200' : 'bg-[#2E7D32]'
            }`}>
              {caisseStatus === 'fermée'
                ? <Lock className="w-6 h-6 text-orange-700" />
                : <Unlock className="w-6 h-6 text-white" />}
            </div>
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                caisseStatus === 'fermée' ? 'bg-orange-200 text-orange-800' : 'bg-[#2E7D32] text-white'
              }`}>
                {caisseStatus === 'fermée' ? '● FERMÉE' : '● OUVERTE'}
              </span>
              <p className="text-base font-bold text-gray-900 mt-1">
                {caisseStatus === 'fermée'
                  ? 'Caisse non ouverte. Action requise'
                  : `Caisse ouverte · ${activeSession?.numero_caisse ?? ''}`}
              </p>
              <p className="text-xs text-gray-500">
                {caisseStatus === 'fermée'
                  ? 'Ouvrez la caisse avant de commencer toute opération'
                  : `Ouverte à ${activeSession?.ouverture_at} · Superviseur : ${activeSession?.superviseur}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => caisseStatus === 'fermée' ? setShowOpenModal(true) : setShowCloseModal(true)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
              caisseStatus === 'fermée'
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white'
                : 'bg-white border-2 border-red-300 text-red-700 hover:bg-red-50'
            }`}>
            {caisseStatus === 'fermée' ? 'Ouvrir la session' : 'Fermer la session'}
          </button>
        </div>
      </div>

      {/* ── Filtre période (agit sur filteredTx, volumeData, typeData) ── */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p ? 'bg-[#2E7D32] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {p === 'day' ? "Aujourd'hui" : p === 'week' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      {/* ── Stats (KPIs + Graphiques) ── */}
      <DashboardStats
        totalAmount={totalAmount}
        depositCount={transactionCount}
        completedCount={completedCount}
        avgAmount={avgAmount}
        uniqueMembers={uniqueMembers}
        pendingCount={pendingCount}
        completionRate={completionRate}
        volumeData={volumeData}
        typeData={typeData}
      />

      {/* ── Actions rapides (raccourcis + dernière transaction par type) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Actions rapides</h2>
        </div>

        <div className="divide-y divide-gray-50">
          {[
            { type: 'deposit',        href: '/dashboard/transactions/deposits',    icon: <ArrowDownCircle className="w-5 h-5 text-green-600"  />, label: 'Dépôt',     sub: 'Enregistrer un dépôt'       },
            { type: 'withdrawal',     href: '/dashboard/transactions/withdrawals', icon: <ArrowUpCircle   className="w-5 h-5 text-red-600"    />, label: 'Retrait',   sub: 'Effectuer un retrait'       },
            { type: 'transfer',       href: '/dashboard/transactions/transfers',   icon: <Repeat          className="w-5 h-5 text-blue-600"   />, label: 'Transfert', sub: 'Transférer entre comptes'   },
            { type: 'loan_repayment', href: '/dashboard/loans',                    icon: <Landmark        className="w-5 h-5 text-yellow-600" />, label: 'Prêt',      sub: 'Remboursement ou demande'   },
          ].map(({ type, href, icon, label, sub }) => {
            const tx  = last(type);
            const cfg = typeConfig[type];
            return (
              <Link key={type} href={href} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                </div>

                <div className="text-right">
                  {txLoading ? (
                    <p className="text-xs text-gray-400">…</p>
                  ) : tx ? (
                    <div>
                      <p className={`font-semibold ${cfg.color}`}>
                        {cfg.sign} {Number(tx.amount).toLocaleString('fr-HT')} HTG
                      </p>
                      <p className="text-xs text-gray-400">{fmtTime(tx.created_at)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucune transaction</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Modal : ouverture de session ── */}
      {showOpenModal && (
        <Modal isOpen size="3xl" onClose={() => setShowOpenModal(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Ouvrir une session caisse</h3>
                <p className="text-xs text-gray-400 mt-0.5">Renseignez les informations de la session</p>
              </div>
            </div>
          }>
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <OpenSessionModal
              onClose={() => setShowOpenModal(false)}
              onConfirm={handleOpenSession}
              branches={branches}
              openingHours={openingHours}
              holidays={holidays}
              caisses={caisses}
              employees={employees}
              posts={posts}          
              onRequireOverride={(reason, details) => {
                console.warn('Override requis:', reason, details);
                // TODO: ouvrir un modal d'approbation directeur
              }}
            />
          </div>
        </Modal>
      )}

      {/* ── Modal : fermeture de session ── */}
      {showCloseModal && activeSession && (
        <Modal isOpen size="lg" onClose={() => setShowCloseModal(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <LogOut className="text-red-500" size={15} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Fermer la session</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Clôture de {activeSession.caissier_nom} · {activeSession.numero_caisse}
                </p>
              </div>
            </div>
          }>
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <CloseSessionModal
              session={activeSession}
              onClose={() => setShowCloseModal(false)}
              onConfirm={handleCloseSession}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}