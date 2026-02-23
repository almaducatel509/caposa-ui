'use client';
import { useState } from 'react';
import {
  AlertTriangle, CheckCircle, Clock, Eye, Users, TrendingUp,
  XCircle, ChevronRight, Bell, RefreshCw, Search, Filter,
  FileText, Lock, Unlock, ArrowLeftRight, Check, X,
  ShieldAlert, Activity, BarChart2, Calendar
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type CaisseState = 'ouverte' | 'fermée' | 'en retard';
type AlertLevel  = 'critique' | 'warning' | 'info';
type TxStatus    = 'match' | 'écart' | 'en attente' | 'validé';

interface CaisseInfo {
  id: string;
  caissier: string;
  initiales: string;
  status: CaisseState;
  montant: number;
  ouvertureAt: string;
  nbTx: number;
  ecart: number;
}

interface AlerteItem {
  id: string;
  level: AlertLevel;
  caissier: string;
  message: string;
  time: string;
  resolved: boolean;
}

interface TxSuspecte {
  id: string;
  caissier: string;
  type: string;
  montant: number;
  time: string;
  status: TxStatus;
  motif: string;
}

interface ValidationItem {
  id: string;
  caissier: string;
  action: string;
  montant: number;
  time: string;
}

// ─── Mock data ──────────────────────────────────────────────────────────────────
const CAISSES: CaisseInfo[] = [
  { id: 'c1', caissier: 'Jean Dupont',    initiales: 'JD', status: 'ouverte',   montant: 48750, ouvertureAt: '08:02', nbTx: 14, ecart: 0 },
  { id: 'c2', caissier: 'Marie Tremblay', initiales: 'MT', status: 'ouverte',   montant: 32100, ouvertureAt: '08:15', nbTx: 9,  ecart: -250 },
  { id: 'c3', caissier: 'Paul Martin',    initiales: 'PM', status: 'en retard', montant: 0,     ouvertureAt: '—',     nbTx: 0,  ecart: 0 },
  { id: 'c4', caissier: 'Sophie Lavoie',  initiales: 'SL', status: 'ouverte',   montant: 61200, ouvertureAt: '07:58', nbTx: 21, ecart: 0 },
  { id: 'c5', caissier: 'Luc Gagnon',     initiales: 'LG', status: 'fermée',    montant: 0,     ouvertureAt: '—',     nbTx: 0,  ecart: 0 },
];

const ALERTES: AlerteItem[] = [
  { id: 'a1', level: 'critique', caissier: 'Marie Tremblay', message: 'Écart de 250 HTG détecté à la réconciliation', time: '11:42', resolved: false },
  { id: 'a2', level: 'warning',  caissier: 'Paul Martin',    message: 'Caisse non ouverte — poste à vérifier',        time: '09:00', resolved: false },
  { id: 'a3', level: 'warning',  caissier: 'Jean Dupont',    message: 'Remise de 10h non complétée',                  time: '10:05', resolved: false },
  { id: 'a4', level: 'info',     caissier: 'Sophie Lavoie',  message: 'Volume de transactions élevé (21 tx)',         time: '11:30', resolved: false },
];

const TX_SUSPECTES: TxSuspecte[] = [
  { id: 'tx1', caissier: 'Marie Tremblay', type: 'Retrait', montant: 15000, time: '10:22', status: 'écart',      motif: 'Montant inhabituel' },
  { id: 'tx2', caissier: 'Jean Dupont',    type: 'Dépôt',   montant: 8500,  time: '09:55', status: 'en attente', motif: 'Sans référence client' },
  { id: 'tx3', caissier: 'Sophie Lavoie',  type: 'Transfert',montant: 22000, time: '08:40', status: 'validé',    motif: 'Validé par superviseur' },
];

const VALIDATIONS: ValidationItem[] = [
  { id: 'v1', caissier: 'Marie Tremblay', action: 'Annulation de transaction',  montant: 3200,  time: '11:38' },
  { id: 'v2', caissier: 'Paul Martin',    action: 'Retrait hors-limite',        montant: 18000, time: '10:50' },
  { id: 'v3', caissier: 'Jean Dupont',    action: 'Justification d\'écart',     montant: 250,   time: '10:15' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(v: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'HTG', minimumFractionDigits: 0 }).format(v);
}

function getDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, badge, action }: {
  icon: React.ElementType; title: string; badge?: number; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {badge !== undefined && badge > 0 && (
          <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {action}
    </div>
  );
}

function CaisseCard({ caisse, onSelect, selected }: {
  caisse: CaisseInfo; onSelect: () => void; selected: boolean;
}) {
  const statusCfg = {
    ouverte:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', border: 'border-[#2E7D32]/20' },
    fermée:     { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   border: 'border-gray-200' },
    'en retard':{ bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    border: 'border-red-200' },
  }[caisse.status];

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
        selected ? 'border-[#2E7D32] shadow-md' : 'border-gray-100 hover:border-[#2E7D32]/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold">
            {caisse.initiales}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{caisse.caissier}</p>
            <p className="text-xs text-gray-400">Caisse #{caisse.id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {caisse.status}
        </span>
      </div>

      {caisse.status !== 'fermée' && caisse.status !== 'en retard' ? (
        <>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(caisse.montant)}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">{caisse.nbTx} tx · ouv. {caisse.ouvertureAt}</p>
            {caisse.ecart !== 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">
                Écart {formatCurrency(caisse.ecart)}
              </span>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 mt-1">
          {caisse.status === 'en retard' ? '⚠️ Non ouverte ce matin' : '🔒 Session fermée'}
        </p>
      )}
    </div>
  );
}

function AlertRow({ alerte, onResolve }: { alerte: AlerteItem; onResolve: (id: string) => void }) {
  const cfg = {
    critique: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    icon: XCircle,       dot: 'bg-red-500' },
    warning:  { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle, dot: 'bg-yellow-500' },
    info:     { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   icon: Bell,          dot: 'bg-blue-400' },
  }[alerte.level];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-0 ${alerte.resolved ? 'opacity-40' : ''}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.text}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${cfg.text}`}>{alerte.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{alerte.caissier} · {alerte.time}</p>
      </div>
      {!alerte.resolved && (
        <button
          onClick={() => onResolve(alerte.id)}
          className="shrink-0 px-3 py-1 text-xs font-medium bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-[#DDEAD5] hover:text-[#1B5E20] hover:border-[#2E7D32]/30 transition-all"
        >
          Résoudre
        </button>
      )}
    </div>
  );
}

const TX_STATUS_CFG: Record<TxStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  match:        { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', border: 'border-[#2E7D32]/20', icon: Check },
  validé:       { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', border: 'border-[#2E7D32]/20', icon: CheckCircle },
  écart:        { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100',       icon: XCircle },
  'en attente': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200',    icon: Clock },
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardSuperviseur() {
  const [alertes, setAlertes] = useState<AlerteItem[]>(ALERTES);
  const [txSuspectes, setTxSuspectes] = useState<TxSuspecte[]>(TX_SUSPECTES);
  const [selectedCaisse, setSelectedCaisse] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [validations, setValidations] = useState<ValidationItem[]>(VALIDATIONS);

  const alertesActives = alertes.filter(a => !a.resolved);
  const nbEcarts = CAISSES.filter(c => c.ecart !== 0).length;
  const nbOuvertes = CAISSES.filter(c => c.status === 'ouverte').length;
  const nbEnRetard = CAISSES.filter(c => c.status === 'en retard').length;
  const totalMontant = CAISSES.reduce((s, c) => s + c.montant, 0);
  const totalTx = CAISSES.reduce((s, c) => s + c.nbTx, 0);

  const resolveAlerte = (id: string) =>
    setAlertes(a => a.map(x => x.id === id ? { ...x, resolved: true } : x));

  const validateTx = (id: string, status: TxStatus) =>
    setTxSuspectes(t => t.map(x => x.id === id ? { ...x, status } : x));

  const approveValidation = (id: string) =>
    setValidations(v => v.filter(x => x.id !== id));

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2E7D32] mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Tableau de contrôle</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Superviseur</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{getDate()}</p>
        </div>
        <div className="flex items-center gap-3">
          {alertesActives.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-700">
                {alertesActives.length} alerte{alertesActives.length > 1 ? 's' : ''} active{alertesActives.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          <button className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { icon: Unlock,       label: 'Caisses ouvertes',   value: `${nbOuvertes} / ${CAISSES.length}`, color: 'bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]', border: 'border-[#DDEAD5]' },
          { icon: AlertTriangle,label: 'En retard',          value: nbEnRetard.toString(),               color: nbEnRetard > 0 ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-gray-400 to-gray-500', border: nbEnRetard > 0 ? 'border-red-100' : 'border-gray-100' },
          { icon: ShieldAlert,  label: 'Écarts détectés',    value: nbEcarts.toString(),                 color: nbEcarts > 0 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-gray-400 to-gray-500', border: nbEcarts > 0 ? 'border-orange-100' : 'border-gray-100' },
          { icon: Activity,     label: 'Transactions totales',value: totalTx.toString(),                 color: 'bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]',  border: 'border-blue-100' },
          { icon: BarChart2,    label: 'Volume total',       value: formatCurrency(totalMontant),        color: 'bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]',  border: 'border-yellow-100' },
        ].map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-2xl p-4 shadow-sm border ${kpi.border} hover:shadow-md transition-shadow`}>
            <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── État de toutes les caisses ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <SectionHeader
          icon={Users}
          title="État de toutes les caisses"
          action={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] w-40"
              />
            </div>
          }
        />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {CAISSES.filter(c =>
            c.caissier.toLowerCase().includes(search.toLowerCase())
          ).map(c => (
            <CaisseCard
              key={c.id}
              caisse={c}
              selected={selectedCaisse === c.id}
              onSelect={() => setSelectedCaisse(selectedCaisse === c.id ? null : c.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Alertes + Validations en attente ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Alertes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader
            icon={Bell}
            title="Alertes & Anomalies"
            badge={alertesActives.length}
            action={
              <button className="text-xs text-[#2E7D32] font-medium hover:underline flex items-center gap-1">
                Tout voir <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="divide-y divide-gray-50">
            {alertes.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <CheckCircle className="w-10 h-10 text-[#2E7D32] mb-2" />
                <p className="text-sm text-gray-600 font-medium">Aucune alerte</p>
              </div>
            ) : (
              alertes.map(a => (
                <AlertRow key={a.id} alerte={a} onResolve={resolveAlerte} />
              ))
            )}
          </div>
        </div>

        {/* Validations en attente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader
            icon={Clock}
            title="Autorisations en attente"
            badge={validations.length}
          />
          <div className="divide-y divide-gray-50">
            {validations.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <CheckCircle className="w-10 h-10 text-[#2E7D32] mb-2" />
                <p className="text-sm text-gray-600 font-medium">Aucune validation requise</p>
              </div>
            ) : (
              validations.map(v => (
                <div key={v.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {v.caissier.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.action}</p>
                    <p className="text-xs text-gray-400">{v.caissier} · {v.time} · {formatCurrency(v.montant)}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => approveValidation(v.id)}
                      className="w-7 h-7 rounded-lg bg-[#DDEAD5] hover:bg-[#2E7D32] text-[#1B5E20] hover:text-white flex items-center justify-center transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => approveValidation(v.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Transactions suspectes ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <SectionHeader
          icon={ShieldAlert}
          title="Transactions suspectes"
          badge={txSuspectes.filter(t => t.status === 'écart' || t.status === 'en attente').length}
          action={
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" /> Filtrer
            </button>
          }
        />

        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-3">Caissier</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Motif</div>
          <div className="col-span-1">Heure</div>
          <div className="col-span-2 text-center">Action</div>
        </div>

        <div className="divide-y divide-gray-50">
          {txSuspectes.map((tx, i) => {
            const cfg = TX_STATUS_CFG[tx.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={tx.id} className={`grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-[#DDEAD5]/20 transition-colors ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#355C7D] to-[#2A4A5E] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {tx.caissier.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-sm text-gray-900 truncate">{tx.caissier}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-700">{tx.type}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(tx.montant)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500">{tx.motif}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs text-gray-400">{tx.time}</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <StatusIcon className="w-3 h-3" />{tx.status}
                  </span>
                  {(tx.status === 'écart' || tx.status === 'en attente') && (
                    <button
                      onClick={() => validateTx(tx.id, 'validé')}
                      className="w-6 h-6 rounded-lg bg-[#DDEAD5] hover:bg-[#2E7D32] text-[#1B5E20] hover:text-white flex items-center justify-center transition-all"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Activité des caissiers ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <SectionHeader
          icon={Activity}
          title="Activité des caissiers — aujourd'hui"
          action={
            <button className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium hover:underline">
              Rapport complet <ChevronRight className="w-3 h-3" />
            </button>
          }
        />

        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-3">Caissier</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-right">Tx</div>
          <div className="col-span-2 text-right">Volume</div>
          <div className="col-span-2 text-right">Écart</div>
          <div className="col-span-1 text-center">Perf.</div>
        </div>

        <div className="divide-y divide-gray-50">
          {CAISSES.map((c, i) => {
            const statusCfg = {
              ouverte:     { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', border: 'border-[#2E7D32]/20', dot: 'bg-[#2E7D32]' },
              fermée:      { bg: 'bg-gray-100',  text: 'text-gray-500',  border: 'border-gray-200',      dot: 'bg-gray-400' },
              'en retard': { bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-200',       dot: 'bg-red-500' },
            }[c.status];

            const perf = c.ecart === 0 && c.status !== 'en retard' ? '🟢' : c.ecart !== 0 ? '🔴' : '⚪';

            return (
              <div key={c.id} className={`grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-[#DDEAD5]/20 transition-colors ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.initiales}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{c.caissier}</p>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {c.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold text-gray-900">{c.nbTx}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold text-gray-900">{c.montant > 0 ? formatCurrency(c.montant) : '—'}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className={`text-sm font-semibold ${c.ecart < 0 ? 'text-red-600' : 'text-[#2E7D32]'}`}>
                    {c.ecart !== 0 ? formatCurrency(c.ecart) : '—'}
                  </p>
                </div>
                <div className="col-span-1 text-center text-base">{perf}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}