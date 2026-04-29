'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Clock, AlertTriangle, CheckCircle,
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Package,
  Calculator, Lock, Unlock, Sun, Sunset, ChevronRight,
  Bell, RefreshCw, Banknote, FileText, XCircle,
  History, LogIn, LogOut, Loader2, CheckCircle2,
} from 'lucide-react';
import { fetchDashboard, fetchTransactions, fetchAlerts, openSession, closeSession } from '@/app/lib/api/caisse';
import { CaisseAlert, CaisseTransaction, CaisseSession, CaisseStatus, OpenSessionPayload } from '@/types/caisse';
import OpenSessionModal  from '../../sessions/modals/Opensessionmodal';
import CloseSessionModal from '../../sessions/modals/Closesessionmodal';
   // Remplace le quickModal générique actuel par tes vrais composants

import DepositForm    from '@/app/components/transactions/deposits/DepositForm';
import WithdrawalForm from '@/app/components/transactions/withdrawals/WithdrawalForm';
import TransferForm   from '@/app/components/transactions/transfers/TransferForm';
import { Modal } from '../../ui/Modal';


function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: 'HTG', minimumFractionDigits: 2,
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
       :           { text: 'Bonsoir',        icon: Sunset };
}

// ─── Modal générique ─────────────────────────────────────────────
// utilise le composant modal
// function Modal({ title, onClose, children, size = 'md' }: {
//   title: React.ReactNode; onClose: () => void;
//   children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';  // ← ajoute 'xl'
// }) {
//   const w = {
//     sm: 'max-w-sm',
//     md: 'max-w-md',
//     lg: 'max-w-lg',
//     xl: 'max-w-3xl',  // ← ajoute cette ligne
//   }[size];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
//       <div className={`relative w-full ${w} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
//           {title}
//           <button onClick={onClose}
//             className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
//             <XCircle size={18} />
//           </button>
//         </div>
//         <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
//       </div>
//     </div>
//   );
// }

// ─── Petits composants ────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, sub, color, border }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; border: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${border} hover:shadow-md transition-shadow`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

const TX_CFG: Record<string, { icon: React.ElementType; color: string; bg: string; sign: string; label: string }> = {
  deposit:    { icon: ArrowDownCircle, color: 'text-[#2E7D32]', bg: 'bg-[#DDEAD5]', sign: '+', label: 'Dépôt'     },
  withdrawal: { icon: ArrowUpCircle,   color: 'text-red-600',   bg: 'bg-red-50',    sign: '-', label: 'Retrait'   },
  transfer:   { icon: ArrowLeftRight,  color: 'text-[#355C7D]', bg: 'bg-blue-50',   sign: '→', label: 'Transfert' },
  loan:       { icon: Banknote,        color: 'text-[#D4AF37]', bg: 'bg-yellow-50', sign: '+', label: 'Prêt'      },
};

function TxRow({ tx }: { tx: CaisseTransaction }) {
  const cfg  = TX_CFG[tx.type] ?? TX_CFG['transfer'];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#DDEAD5]/10 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
        <p className="text-xs text-gray-400 truncate">{tx.note}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${cfg.color}`}>{cfg.sign} {formatHTG(tx.montant)}</p>
        <p className="text-xs text-gray-400">{tx.timestamp}</p>
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: CaisseSession }) {
  const open = session.statut === 'ouverte';
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#DDEAD5]/10 transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${open ? 'bg-[#DDEAD5]' : 'bg-gray-100'}`}>
        {open ? <LogIn className="w-4 h-4 text-[#2E7D32]" /> : <LogOut className="w-4 h-4 text-gray-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{open ? 'Session ouverte' : 'Session fermée'}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${open ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-gray-100 text-gray-500'}`}>
            {session.numero_caisse}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {session.caissier_nom} · Superviseur : {session.superviseur}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#2E7D32]">{formatHTG(session.montant_ouverture)}</p>
        <p className="text-xs text-gray-400">
          {session.ouverture_at}{session.fermeture_at ? ` → ${session.fermeture_at}` : ''}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: {
  icon: React.ElementType; label: string; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-[#2E7D32]/30 transition-all group">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────

export default function DashboardCaissier() {
  const [sessions,      setSessions]     = useState<CaisseSession[]>([]);
  const [transactions,  setTransactions] = useState<CaisseTransaction[]>([]);
  const [alerts,        setAlerts]       = useState<CaisseAlert[]>([]);
  const [montantCaisse, setMontantCaisse] = useState(0);
  const [caisseStatus,  setCaisseStatus]  = useState<CaisseStatus>('fermée');
  const [isLoading,     setIsLoading]    = useState(true);
  const [isRefreshing,  setIsRefreshing] = useState(false);
  const [activeTab,     setActiveTab]    = useState<'transactions' | 'sessions'>('transactions');
  const [showOpenModal, setShowOpenModal]  = useState(false);
  const [showCloseModal,setShowCloseModal] = useState(false);
  const [quickModal,    setQuickModal]   = useState<string | null>(null);
  const [time,          setTime]         = useState(getNow());
  const [isEndOfDay,    setIsEndOfDay]   = useState(false);

  const activeSession = sessions.find(s => s.statut === 'ouverte') ?? null;
  const greeting      = getGreeting();
  const GreetIcon     = greeting.icon;

  useEffect(() => {
    const t = setInterval(() => {
      setTime(getNow());
      setIsEndOfDay(new Date().getHours() >= 15);
    }, 60000);
    setIsEndOfDay(new Date().getHours() >= 15);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchDashboard().then(data => {
      setSessions(data.sessions);
      setTransactions(data.transactions);
      setAlerts(data.alerts);
      setMontantCaisse(data.montant_caisse);
      setCaisseStatus(data.sessions.some(s => s.statut === 'ouverte') ? 'ouverte' : 'fermée');
    }).finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const [tx, al] = await Promise.all([fetchTransactions(), fetchAlerts()]);
      setTransactions(tx);
      setAlerts(al);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const handleOpenSession = async (payload: OpenSessionPayload) => {
    const session = await openSession(payload);
    setSessions(prev => [...prev, session]);
    setCaisseStatus('ouverte');
    setShowOpenModal(false);
  };
// ✅ Nouvelle signature — correspond exactement au type attendu par CloseSessionModal
    const handleCloseSession = async (payload: {
      montant_fermeture:        number;
      note_fermeture?:          string;
      remise_effectuee:         boolean;
      reconciliation_effectuee: boolean;
    }) => {
      if (!activeSession) return;
      const closed = await closeSession(activeSession.id, payload);
      setSessions(prev => prev.map(s => s.id === activeSession.id ? closed : s));
      setCaisseStatus('fermée');
      setShowCloseModal(false);
    };
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
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2E7D32] mb-1">
            <GreetIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{greeting.text}, Jean Dupont</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Caissier</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{getDate()} · {time}</p>
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-700">
                {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          <button onClick={handleRefresh} disabled={isRefreshing}
            className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
            title="Actualiser">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Bannière caisse ── */}
      <div className={`mb-6 rounded-2xl border-2 p-5 transition-all ${
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
                  ? 'Caisse non ouverte — action requise'
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
            {caisseStatus === 'fermée' ? 'Ouvrir la caisse maintenant' : 'Fermer la session'}
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={Banknote}   label="Montant en caisse"    value={formatHTG(montantCaisse)} sub="Solde actuel"
          color="bg-linear-to-br from-[#2E7D32] to-[#1B5E20]" border="border-[#DDEAD5]" />
        <KPICard icon={TrendingUp} label="Transactions du jour" value={transactions.length.toString()}
          sub={`Total : ${formatHTG(transactions.reduce((s,t) => s + t.montant, 0))}`}
          color="bg-linear-to-br from-[#355C7D] to-[#2A4A5E]" border="border-blue-100" />
        <KPICard icon={Clock}      label="Dernière remise"      value="10h45" sub="Il y a 2h15"
          color="bg-linear-to-br from-[#D4AF37] to-[#C9B27C]" border="border-yellow-100" />
        <KPICard icon={History}    label="Sessions aujourd'hui" value={sessions.length.toString()}
          sub={activeSession ? `En cours · ${activeSession.numero_caisse}` : 'Aucune session active'}
          color={activeSession ? 'bg-linear-to-br from-[#81C784] to-[#66BB6A]' : 'bg-linear-to-br from-gray-400 to-gray-600'}
          border="border-green-100" />
      </div>

      {/* ── Alertes + Actions rapides ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Alertes & Anomalies</h2>
            </div>
            {alerts.length > 0 && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="p-4 flex flex-col gap-2">
            {alerts.length === 0
              ? <div className="flex flex-col items-center py-6">
                  <CheckCircle className="w-10 h-10 text-[#2E7D32] mb-2" />
                  <p className="text-sm font-medium text-gray-700">Aucune alerte active</p>
                </div>
              : alerts.map(a => <AlertBadge key={a.id} {...a} />)
            }
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Calculator className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Actions Rapides</h2>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3">
            <QuickAction icon={ArrowDownCircle} label="Dépôt"          color="bg-linear-to-br from-[#2E7D32] to-[#1B5E20]" onClick={() => setQuickModal('depot')} />
            <QuickAction icon={ArrowUpCircle}   label="Retrait"        color="bg-linear-to-br from-red-500 to-red-700"       onClick={() => setQuickModal('retrait')} />
            <QuickAction icon={ArrowLeftRight}  label="Transfert"      color="bg-linear-to-br from-[#355C7D] to-[#2A4A5E]"  onClick={() => setQuickModal('transfert')} />
            <QuickAction icon={Package}         label="Remise"         color="bg-linear-to-br from-[#D4AF37] to-[#C9B27C]"  onClick={() => setQuickModal('remise')} />
            <QuickAction icon={Calculator}      label="Réconciliation" color="bg-linear-to-br from-purple-500 to-purple-700" onClick={() => setQuickModal('recon')} />
            <QuickAction icon={FileText}        label="Rapport"        color="bg-linear-to-br from-gray-500 to-gray-700"     onClick={() => setQuickModal('rapport')} />
          </div>
        </div>
      </div>

      {/* ── Onglets Transactions | Sessions ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">

        {/* En-tête onglets — sans "Voir tout" */}
        <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-gray-100">
          {([
            { key: 'transactions', label: 'Transactions', count: transactions.length, Icon: TrendingUp },
            { key: 'sessions',     label: 'Sessions',     count: sessions.length,     Icon: History    },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2',
                activeTab === tab.key
                  ? 'border-[#2E7D32] text-[#1B5E20] bg-[#DDEAD5]/30'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
              ].join(' ')}>
              <tab.Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className={['px-2 py-0.5 rounded-lg text-xs font-bold',
                activeTab === tab.key ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-500',
              ].join(' ')}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-gray-50">
          {activeTab === 'transactions'
            ? transactions.length === 0
              ? <p className="text-sm text-gray-400 text-center py-10">Aucune transaction aujourd'hui</p>
              : transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
            : sessions.length === 0
              ? <p className="text-sm text-gray-400 text-center py-10">Aucune session enregistrée</p>
              : sessions.map(s => <SessionRow key={s.id} session={s} />)
          }
        </div>

        {/* ── Pied de tableau : Voir tout (en bas) ── */}
        <div className="border-t border-gray-100 px-5 py-3">
          <Link
            href={activeTab === 'transactions' ? '/dashboard/transactions' : '/dashboard/sessions'}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-[#2E7D32] hover:bg-[#DDEAD5]/40 transition-colors"
          >
            Voir toutes les {activeTab === 'transactions' ? 'transactions' : 'sessions'}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Fin de journée ── */}
      {isEndOfDay && (
        <div className="bg-linear-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 text-white mb-6">
          <p className="text-sm font-semibold text-[#DDEAD5] uppercase tracking-wide mb-1">Fin de journée</p>
          <h3 className="text-lg font-bold mb-1">Rappels de clôture obligatoires</h3>
          <p className="text-sm text-green-200 mb-4">Complétez ces étapes avant de quitter votre poste.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { Icon: Package,    label: 'Faire la remise',       done: false,                    action: () => setQuickModal('remise') },
              { Icon: Calculator, label: 'Réconciliation finale',  done: false,                    action: () => setQuickModal('recon')  },
              { Icon: Lock,       label: 'Fermer la caisse',       done: caisseStatus === 'fermée', action: () => caisseStatus === 'ouverte' && setShowCloseModal(true) },
            ].map((item, i) => (
              <button key={i} onClick={item.action} disabled={item.done}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left w-full',
                  item.done ? 'bg-white/20 opacity-80 cursor-default' : 'bg-white/10 hover:bg-white/20',
                ].join(' ')}>
                <item.Icon className="w-5 h-5 shrink-0 text-[#DDEAD5]" />
                <span className={`text-sm font-medium flex-1 ${item.done ? 'line-through opacity-70' : ''}`}>
                  {item.label}
                </span>
                {item.done
                  ? <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-green-300 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Performance ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Ma performance aujourd'hui</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Transactions',   value: transactions.length.toString(),                            sub: "aujourd'hui" },
            { label: 'Volume total',   value: formatHTG(transactions.reduce((s,t) => s + t.montant, 0)), sub: 'traité'      },
            { label: 'Taux de succès', value: '100%',                                                    sub: 'aucun écart' },
          ].map(stat => (
            <div key={stat.label} className="px-5 py-4 text-center">
              <p className="text-xl font-bold text-[#2E7D32]">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals actions rapides ── */}
          
        {quickModal === 'depot' && (
          <Modal isOpen size="xl" onClose={() => setQuickModal(null)}
            title={<h3 className="text-base font-bold text-gray-900">Faire un dépôt</h3>}>
            <DepositForm
              onSubmit={async (_data) => {
                setQuickModal(null);
                const tx = await fetchTransactions();   // rafraîchit la liste
                setTransactions(tx);
              }}
              onCancel={() => setQuickModal(null)}
            />
          </Modal>
        )}

          {quickModal === 'retrait' && (
        <Modal isOpen size="xl" onClose={() => setQuickModal(null)}
          title={<h3 className="text-base font-bold text-gray-900">Faire un retrait</h3>}>
          <WithdrawalForm
            onSubmit={async (_data) => {
              setQuickModal(null);
              const tx = await fetchTransactions();
              setTransactions(tx);
            }}
            onCancel={() => setQuickModal(null)}
          />
        </Modal>
      )}

      {quickModal === 'transfert' && (
        <Modal isOpen size="xl" onClose={() => setQuickModal(null)}
          title={<h3 className="text-base font-bold text-gray-900">Faire un transfert</h3>}>
          <TransferForm onCancel={() => setQuickModal(null)} />
        </Modal>
      )}
      {/* ── Modal ouverture session ── */}
      {showOpenModal && (
        <Modal 
          isOpen 
          size="3xl" 
          onClose={() => setShowOpenModal(false)}
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
              onConfirm={handleOpenSession} branches={[]} openingHours={[]} holidays={[]} onRequireOverride={function (reason: string, details: string): void {
                throw new Error('Function not implemented.');
              } }              />
            </div>
        </Modal>
      )}

      {/* ── Modal fermeture session ── */}
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