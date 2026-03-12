'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line,
} from 'recharts';
import {
  ArrowDownCircle, RefreshCw, Plus, X,
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  CheckCircle2, Clock, Loader2, XCircle, TrendingUp,
  Users, CalendarDays, ShieldCheck,
} from 'lucide-react';
import DepositForm from './DepositForm';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';

interface DepositData {
  id: number;
  idCompte: string;
  codeAutorisation: string;
  montantTransaction: number;
  depositSubtype: 'cash' | 'check' | 'transfer' | 'other';
  source: string;
  description?: string;
  holdPeriod: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  created_at: string;
  member_name: string;
  // Traçabilité
  processed_by:    string;
  validated_by:    string;
  caisse_numero:   string;
  caisse_id:       string;
  session_id:      string;
}

const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};

const SUBTYPE_CFG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  cash:     { icon: Banknote,       label: 'Espèces',  color: C.green,   bg: C.greenPale },
  check:    { icon: FileCheck,      label: 'Chèque',   color: C.blue,    bg: '#EBF2F8'   },
  transfer: { icon: ArrowLeftRight, label: 'Virement', color: C.gold,    bg: '#FBF6E7'   },
  other:    { icon: MoreHorizontal, label: 'Autre',    color: '#6E6E6E', bg: '#F3F3F3'   },
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  completed:  { label: 'Complété',   bg: C.greenPale, text: C.greenDark, dot: C.green   },
  pending:    { label: 'En attente', bg: '#FEF9EC',   text: '#B45309',   dot: '#F59E0B' },
  processing: { label: 'En cours',   bg: '#EBF2F8',   text: C.blue,      dot: C.blue    },
  failed:     { label: 'Échoué',     bg: '#FEF2F2',   text: '#B91C1C',   dot: '#EF4444' },
};

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #DDEAD5',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH   < 24) return `Il y a ${diffH} h`;
  if (diffD   <  7) return `Il y a ${diffD} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function generateMockDeposits(daysBack: number): DepositData[] {
  const subtypes: DepositData['depositSubtype'][] = ['cash', 'check', 'transfer', 'other'];
  const statuses: DepositData['status'][]         = ['completed', 'completed', 'completed', 'pending', 'processing', 'failed'];
  const members  = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];
  const sources  = ['Salaire', 'Remboursement', 'Épargne', 'Vente', 'Envoi diaspora', 'Dividendes'];
  const employes = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers   = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses  = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }, { id: 'CAI003', numero: '03' }];

  const data: DepositData[] = [];
  let attempts = 0, i = 0;

  while (i < 60 && attempts < 200) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    if (date.getDay() === 0 || date.getDay() === 6) { attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
    const subtype    = subtypes[Math.floor(Math.random() * subtypes.length)];
    const amount     = Math.floor(Math.random() * 80000) + 1000;
    const holdPeriod = subtype === 'check' ? Math.floor(Math.random() * 5) + 1 : 0;
    const caisse = caisses[Math.floor(Math.random() * caisses.length)];
    data.push({
      id: i + 1, idCompte: `ACC${1000 + i}`, codeAutorisation: `AUTH${100000 + i}`,
      montantTransaction: amount, depositSubtype: subtype,
      source: sources[Math.floor(Math.random() * sources.length)],
      description: Math.random() > 0.6 ? 'Dépôt régulier' : undefined,
      holdPeriod, status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: date.toISOString(),
      member_name: members[Math.floor(Math.random() * members.length)],
      processed_by:  employes[Math.floor(Math.random() * employes.length)],
      validated_by:  supers[Math.floor(Math.random() * supers.length)],
      caisse_numero: caisse.numero,
      caisse_id:     caisse.id,
      session_id:    `SES-${1000 + i}`,
    });
    i++; attempts++;
  }
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─── KPI Card (pur affichage, aucun state ici) ─────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + '22' }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DepositDashboard() {
  const [period,    setPeriod]    = useState<'day' | 'week' | 'month'>('week');
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [subtypeF,  setSubtypeF]  = useState('all');
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [detailTx,  setDetailTx]  = useState<TransactionDetail | null>(null);

  const handleView = (dep: DepositData) => {
    setDetailTx({
      id:                   dep.id,
      kind:                 'deposit',
      status:               dep.status,
      montant:              dep.montantTransaction,
      created_at:           dep.created_at,
      codeAutorisation:     dep.codeAutorisation,
      description:          dep.description,
      member_name:          dep.member_name,
      account_number:       dep.idCompte,
      depositSubtype:       dep.depositSubtype,
      source:               dep.source,
      holdPeriod:           dep.holdPeriod,
      requiresVerification: dep.holdPeriod > 0 || dep.montantTransaction > 50000,
      processed_by:         dep.processed_by,
      validated_by:         dep.validated_by,
      caisse_numero:        dep.caisse_numero,
      caisse_id:            dep.caisse_id,
      session_id:           dep.session_id,
    });
  };

  const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const deposits  = useMemo(() => generateMockDeposits(daysBack), [period]);

  const filtered = useMemo(() => deposits.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      d.member_name.toLowerCase().includes(q) ||
      d.source.toLowerCase().includes(q) ||
      d.idCompte.toLowerCase().includes(q);
    return matchSearch &&
      (statusF  === 'all' || d.status         === statusF)  &&
      (subtypeF === 'all' || d.depositSubtype  === subtypeF);
  }), [deposits, search, statusF, subtypeF]);

  const completed      = deposits.filter(d => d.status === 'completed');
  const totalAmount    = completed.reduce((s, d) => s + d.montantTransaction, 0);
  const avgAmount      = completed.length ? totalAmount / completed.length : 0;
  const uniqueMembers  = new Set(completed.map(d => d.member_name)).size;
  const pendingCount   = deposits.filter(d => d.status === 'pending').length;
  const completionRate = deposits.length ? (completed.length / deposits.length * 100) : 0;

  const volumeData = useMemo(() => {
    const days: { label: string; date: string; count: number; amount: number }[] = [];
    let back = 0;
    while (days.length < (period === 'day' ? 9 : 5)) {
      back++;
      if (period === 'day') {
        const h = 9 + days.length;
        const d = new Date(); d.setHours(h, 0, 0, 0);
        days.push({ label: `${h}h`, date: d.toISOString(), count: 0, amount: 0 });
        if (days.length >= 9) break;
      } else {
        const d = new Date(); d.setDate(d.getDate() - back);
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          days.unshift({
            label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            date:  d.toISOString().split('T')[0],
            count: 0, amount: 0,
          });
        }
      }
    }
    deposits.forEach(d => {
      const idx = days.findIndex(item =>
        period === 'day'
          ? new Date(item.date).getHours() === new Date(d.created_at).getHours()
          : item.date === d.created_at.split('T')[0]
      );
      if (idx >= 0) { days[idx].count++; days[idx].amount += d.montantTransaction; }
    });
    return days;
  }, [deposits, period]);

  const typeData = useMemo(() =>
    Object.entries(SUBTYPE_CFG).map(([key, cfg]) => {
      const items = deposits.filter(d => d.depositSubtype === key);
      return { key, name: cfg.label, value: items.length, amount: items.reduce((s, d) => s + d.montantTransaction, 0), color: cfg.color };
    }), [deposits]);

  const allSel  = selected.size === filtered.length && filtered.length > 0;
  const someSel = selected.size > 0 && !allSel;
  const toggleAll = () => allSel ? setSelected(new Set()) : setSelected(new Set(filtered.map(d => d.id)));
  const toggleRow = (id: number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dépôts</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des dépôts membres</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Nouveau dépôt
          </button>
        </div>
      </div>

      {/* ── Filtre période ── */}
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

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard icon={ArrowDownCircle} label="Montant total"      value={formatHTG(totalAmount)}           accent={C.green} />
        <KPICard icon={TrendingUp}      label="Nombre de dépôts"   value={deposits.length} sub={`${completed.length} complétés`} accent={C.blue} />
        <KPICard icon={CalendarDays}    label="Moyenne / dépôt"    value={formatHTG(avgAmount)}             accent={C.gold}  />
        <KPICard icon={Users}           label="Membres actifs"     value={uniqueMembers}   sub="déposants"  accent={C.green} />
        <KPICard icon={ShieldCheck}     label="Taux de complétion" value={`${completionRate.toFixed(1)}%`}  accent={C.green} />
        <KPICard icon={Clock}           label="En attente"         value={pendingCount}    sub="à traiter"  accent={C.gold}  />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Volume — dépôts</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Dépôts']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {volumeData.map((_, i) => <Cell key={i} fill={i === volumeData.length - 1 ? C.green : C.greenPale} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Montants déposés (HTG)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), 'Montant']} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {volumeData.map((_, i) => <Cell key={i} fill={i === volumeData.length - 1 ? C.blue : '#D4E3EF'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Répartition par type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={160}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v: number | undefined, _: string | undefined, props: any) =>
                    [`${v ?? 0} (${formatHTG(props?.payload?.amount ?? 0)})`, props?.payload?.name ?? '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-2.5">
              {typeData.map(t => {
                const cfg = SUBTYPE_CFG[t.key];
                const Icon = cfg.icon;
                return (
                  <div key={t.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                        <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                      </div>
                      <span className="text-xs text-gray-600">{cfg.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{t.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Tendance montants (HTG)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), 'Montant']} />
              <Line type="monotone" dataKey="amount" stroke={C.green} strokeWidth={2.5} dot={{ fill: C.green, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Liste des dépôts</p>
            <p className="text-xs text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="Membre, compte…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-3 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] w-44" />
            <select value={statusF} onChange={e => setStatusF(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] text-gray-600">
              <option value="all">Tous statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="failed">Échoué</option>
            </select>
            <select value={subtypeF} onChange={e => setSubtypeF(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] text-gray-600">
              <option value="all">Tous types</option>
              <option value="cash">Espèces</option>
              <option value="check">Chèque</option>
              <option value="transfer">Virement</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="px-5 py-2.5 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">Exporter</button>
              <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-all">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid items-center px-5 py-3 border-b border-gray-100 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
          style={{ gridTemplateColumns: '40px 1.4fr 1.2fr 1fr 1fr 1.2fr 1fr 90px' }}>
          <div className="flex justify-center">
            <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = someSel; }}
              onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer" />
          </div>
          {['Membre', 'Compte', 'Type', 'Source', 'Montant', 'Statut', 'Actions'].map(col => (
            <div key={col} className="text-xs font-semibold uppercase tracking-widest text-gray-500">{col}</div>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: '40px 1.4fr 1.2fr 1fr 1fr 1.2fr 1fr 90px' }}>
              {Array.from({ length: 8 }).map((_, j) => <div key={j} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />)}
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucun dépôt trouvé</p>
            </div>
          )}

          {!loading && filtered.map(dep => {
            const stCfg   = STATUS_CFG[dep.status]         ?? STATUS_CFG['pending'];
            const subCfg  = SUBTYPE_CFG[dep.depositSubtype] ?? SUBTYPE_CFG['other'];
            const SubIcon = subCfg.icon;
            const isSel   = selected.has(dep.id);
            return (
              <div key={dep.id}
                className={`grid items-center px-5 py-3 transition-colors ${isSel ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]' : 'hover:bg-[#DDEAD5]/10 border-l-2 border-transparent'}`}
                style={{ gridTemplateColumns: '40px 1.4fr 1.2fr 1fr 1fr 1.2fr 1fr 90px' }}>
                <div className="flex justify-center">
                  <input type="checkbox" checked={isSel} onChange={() => toggleRow(dep.id)}
                    className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer" />
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#2E7D32]">{dep.member_name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{dep.member_name}</p>
                    <p className="text-xs text-gray-400">{formatDate(dep.created_at)}</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-gray-600 truncate">{dep.idCompte}</p>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit"
                  style={{ backgroundColor: subCfg.bg, color: subCfg.color }}>
                  <SubIcon className="w-3 h-3 shrink-0" />{subCfg.label}
                </span>
                <p className="text-xs text-gray-500 truncate">{dep.source}</p>
                <p className="text-sm font-bold text-[#2E7D32]">+{formatHTG(dep.montantTransaction)}</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                  style={{ backgroundColor: stCfg.bg, color: stCfg.text }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stCfg.dot }} />{stCfg.label}
                </span>
                <div className="flex items-center gap-1">
                  <button title="Voir" onClick={() => handleView(dep)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {dep.holdPeriod > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">{dep.holdPeriod}j</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> dépôt{filtered.length !== 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {pendingCount} en attente
            </span>
          </div>
        )}
      </div>

      {/* ── Modal Nouveau dépôt ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
          <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                  <ArrowDownCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nouveau dépôt</p>
                  <p className="text-xs text-gray-400">Enregistrer un dépôt membre</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[80vh]">
              <DepositForm
                onSubmit={async (data) => {
                  console.log('Dépôt soumis :', data);
                  setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />

    </div>
  );
}