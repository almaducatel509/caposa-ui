'use client';
import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle,
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Package,
  Calculator, Lock, Unlock, Sun, Sunset, ChevronRight,
  Bell, RefreshCw, Banknote, Vault, FileText, XCircle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type CaisseStatus = 'fermée' | 'ouverte';
type CoffreStatus = 'scellé' | 'ouvert' | 'fermé';
type AlertSeverity = 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  time: string;
}

interface Transaction {
  id: string;
  type: 'dépôt' | 'retrait' | 'transfert';
  amount: number;
  time: string;
  note?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_ALERTS: Alert[] = [
  { id: '1', severity: 'warning', message: 'Remise de 14h non complétée', time: '14:02' },
  { id: '2', severity: 'error',   message: 'Écart de 250 HTG détecté hier', time: '09:15' },
  { id: '3', severity: 'info',    message: 'Audit prévu à 16h00 aujourd\'hui', time: '08:00' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'dépôt',    amount: 12500, time: '10:32', note: 'Dépôt client #4821' },
  { id: 't2', type: 'retrait',  amount: 3200,  time: '10:18', note: 'Retrait client #3302' },
  { id: 't3', type: 'transfert',amount: 8000,  time: '09:55', note: 'Transfert vers coffre' },
  { id: 't4', type: 'dépôt',    amount: 5400,  time: '09:41', note: 'Dépôt client #1190' },
  { id: 't5', type: 'retrait',  amount: 1750,  time: '09:20', note: 'Retrait client #2287' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(v: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'HTG', minimumFractionDigits: 2 }).format(v);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Bonjour', icon: Sun };
  if (h < 18) return { text: 'Bon après-midi', icon: Sun };
  return { text: 'Bonsoir', icon: Sunset };
}

function getNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

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

function AlertBadge({ severity, message, time, onDismiss }: Alert & { onDismiss: (id: string) => void; id: string }) {
  const styles = {
    error:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    icon: XCircle,       dot: 'bg-red-500' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle, dot: 'bg-yellow-500' },
    info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: Bell,          dot: 'bg-blue-500' },
  }[severity];
  const Icon = styles.icon;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${styles.bg} border ${styles.border}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.text}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: {
  icon: React.ElementType; label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-[#2E7D32]/30 transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const cfg = {
    dépôt:     { icon: ArrowDownCircle, color: 'text-[#2E7D32]',  bg: 'bg-[#DDEAD5]',  sign: '+' },
    retrait:   { icon: ArrowUpCircle,   color: 'text-red-600',    bg: 'bg-red-50',     sign: '-' },
    transfert: { icon: ArrowLeftRight,  color: 'text-[#355C7D]',  bg: 'bg-blue-50',    sign: '→' },
  }[tx.type];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#DDEAD5]/20 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
        <p className="text-xs text-gray-400 truncate">{tx.note}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${cfg.color}`}>
          {cfg.sign} {formatCurrency(tx.amount)}
        </p>
        <p className="text-xs text-gray-400">{tx.time}</p>
      </div>
    </div>
  );
}

// ─── Modal Placeholder ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardCaissier() {
  const [caisseStatus, setCaisseStatus] = useState<CaisseStatus>('fermée');
  const [coffreStatus] = useState<CoffreStatus>('scellé');
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [time, setTime] = useState(getNow());
  const [modal, setModal] = useState<string | null>(null);
  const [isEndOfDay, setIsEndOfDay] = useState(false);

  const greeting = getGreeting();
  const GreetIcon = greeting.icon;

  // Clock
  useEffect(() => {
    const t = setInterval(() => {
      setTime(getNow());
      const h = new Date().getHours();
      setIsEndOfDay(h >= 15);
    }, 60000);
    setIsEndOfDay(new Date().getHours() >= 15);
    return () => clearInterval(t);
  }, []);

  const dismissAlert = (id: string) => setAlerts(a => a.filter(x => x.id !== id));

  const totalTx = transactions.reduce((s, t) => s + (t.type === 'dépôt' ? t.amount : -t.amount), 0);
  const montantCaisse = 48750 + totalTx;
  const nbTx = transactions.length;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

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
              <span className="text-xs font-semibold text-red-700">{alerts.length} alerte{alerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <button className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Section 1 : Ouverture de caisse ── */}
      <div className={`mb-6 rounded-2xl border-2 p-5 transition-all ${
        caisseStatus === 'fermée'
          ? 'bg-orange-50 border-orange-200'
          : 'bg-[#DDEAD5] border-[#2E7D32]/40'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              caisseStatus === 'fermée' ? 'bg-orange-200' : 'bg-[#2E7D32]'
            }`}>
              {caisseStatus === 'fermée'
                ? <Lock className="w-6 h-6 text-orange-700" />
                : <Unlock className="w-6 h-6 text-white" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  caisseStatus === 'fermée' ? 'bg-orange-200 text-orange-800' : 'bg-[#2E7D32] text-white'
                }`}>
                  {caisseStatus === 'fermée' ? '● FERMÉE' : '● OUVERTE'}
                </span>
              </div>
              <p className="text-base font-bold text-gray-900 mt-1">
                {caisseStatus === 'fermée' ? 'Caisse non ouverte — action requise' : 'Caisse ouverte · Opérations actives'}
              </p>
              <p className="text-xs text-gray-500">
                {caisseStatus === 'fermée'
                  ? 'Ouvrez la caisse avant de commencer toute opération'
                  : `Ouverte à ${time} · Caissier : Jean Dupont`
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setCaisseStatus(s => s === 'fermée' ? 'ouverte' : 'fermée')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
              caisseStatus === 'fermée'
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white'
                : 'bg-white border-2 border-red-300 text-red-700 hover:bg-red-50'
            }`}
          >
            {caisseStatus === 'fermée' ? 'Ouvrir la caisse maintenant' : 'Fermer la caisse'}
          </button>
        </div>
      </div>

      {/* ── Section 2 : KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={Banknote}
          label="Montant en caisse"
          value={formatCurrency(montantCaisse)}
          sub="Solde actuel"
          color="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]"
          border="border-[#DDEAD5]"
        />
        <KPICard
          icon={TrendingUp}
          label="Transactions du jour"
          value={nbTx.toString()}
          sub={`Total : ${formatCurrency(Math.abs(totalTx))}`}
          color="bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]"
          border="border-blue-100"
        />
        <KPICard
          icon={Clock}
          label="Dernière remise"
          value="10h45"
          sub="Il y a 2h15"
          color="bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]"
          border="border-yellow-100"
        />
        <KPICard
          icon={Vault}
          label="État du coffre"
          value={coffreStatus.charAt(0).toUpperCase() + coffreStatus.slice(1)}
          sub="Dernière vérif. 09h00"
          color={coffreStatus === 'scellé' ? 'bg-gradient-to-br from-[#81C784] to-[#66BB6A]' : 'bg-gradient-to-br from-orange-400 to-orange-600'}
          border={coffreStatus === 'scellé' ? 'border-green-100' : 'border-orange-100'}
        />
      </div>

      {/* ── Section 3 : Alertes + Actions rapides ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Alertes */}
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
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle className="w-10 h-10 text-[#2E7D32] mb-2" />
                <p className="text-sm font-medium text-gray-700">Aucune alerte active</p>
                <p className="text-xs text-gray-400">Tout est en ordre 🎉</p>
              </div>
            ) : (
              alerts.map(a => (
                <AlertBadge key={a.id} {...a} onDismiss={dismissAlert} />
              ))
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Calculator className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Actions Rapides</h2>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3">
            <QuickAction icon={ArrowDownCircle}  label="Dépôt"          color="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]" onClick={() => setModal('depot')} />
            <QuickAction icon={ArrowUpCircle}    label="Retrait"        color="bg-gradient-to-br from-red-500 to-red-700"       onClick={() => setModal('retrait')} />
            <QuickAction icon={ArrowLeftRight}   label="Transfert"      color="bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]"  onClick={() => setModal('transfert')} />
            <QuickAction icon={Package}          label="Remise"         color="bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]"  onClick={() => setModal('remise')} />
            <QuickAction icon={Calculator}       label="Réconciliation" color="bg-gradient-to-br from-purple-500 to-purple-700" onClick={() => setModal('recon')} />
            <QuickAction icon={FileText}         label="Rapport"        color="bg-gradient-to-br from-gray-500 to-gray-700"     onClick={() => setModal('rapport')} />
          </div>
        </div>
      </div>

      {/* ── Section 4 : Transactions du jour ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Transactions du jour</h2>
          </div>
          <button className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium hover:underline">
            Voir tout <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
        </div>
      </div>

      {/* ── Section 5 : Fin de journée (visible après 15h) ── */}
      {isEndOfDay && (
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 text-white mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sunset className="w-5 h-5 text-[#DDEAD5]" />
                <span className="text-sm font-semibold text-[#DDEAD5] uppercase tracking-wide">Fin de journée</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Rappels de clôture obligatoires</h3>
              <p className="text-sm text-green-200">Complétez ces étapes avant de quitter votre poste.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { icon: Package,    label: 'Faire la remise',        action: 'remise' },
              { icon: Calculator, label: 'Réconciliation finale',  action: 'recon' },
              { icon: Lock,       label: 'Fermer la caisse',       action: 'fermer' },
            ].map(item => (
              <button
                key={item.action}
                onClick={() => item.action === 'fermer' ? setCaisseStatus('fermée') : setModal(item.action)}
                className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
              >
                <item.icon className="w-5 h-5 text-[#DDEAD5] flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-green-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 6 : Performance du caissier ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Ma performance aujourd'hui</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Transactions', value: nbTx.toString(),   sub: 'aujourd\'hui' },
            { label: 'Volume total', value: formatCurrency(Math.abs(totalTx)), sub: 'traité' },
            { label: 'Taux de succès', value: '100%',          sub: 'aucun écart' },
          ].map(stat => (
            <div key={stat.label} className="px-5 py-4 text-center">
              <p className="text-xl font-bold text-[#2E7D32]">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <Modal
          title={{
            depot:     'Faire un dépôt',
            retrait:   'Faire un retrait',
            transfert: 'Faire un transfert',
            remise:    'Créer une remise',
            recon:     'Ouvrir la réconciliation',
            rapport:   'Générer un rapport',
          }[modal] ?? ''}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Montant (HTG)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Note (optionnel)</label>
              <input
                type="text"
                placeholder="Référence ou commentaire..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl text-sm font-semibold shadow hover:shadow-md transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}