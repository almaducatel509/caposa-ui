'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line,
} from 'recharts';
import {
  ArrowLeftRight, RefreshCw, Plus, X,
  Building2, Landmark,
  CheckCircle2, Clock, Loader2, XCircle, TrendingUp,
  Users, CalendarDays, ShieldCheck, AlertCircle,
} from 'lucide-react';
import TransferForm from './TransferForm';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface TransferData {
  id:               number;
  compteSource:     string;
  compteDestination:string;
  montant:          number;
  reference:        string;
  type:             'internal' | 'supplier' | 'loan_payment';
  description?:     string;
  memberName:       string;
  status:           'completed' | 'pending' | 'processing' | 'failed';
  created_at:       string;
}

// ─── Config CAPOSA ──────────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  bg:        '#F9F9F6',
};

const TYPE_CFG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  internal:     { label: 'Entre comptes', icon: ArrowLeftRight, color: C.green, bg: C.greenPale },
  supplier:     { label: 'Fournisseur',   icon: Building2,      color: C.blue,  bg: '#EBF2F8'  },
  loan_payment: { label: 'Remb. prêt',    icon: Landmark,       color: C.gold,  bg: '#FBF6E7'  },
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

// ─── Helpers ────────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  const diffH   = Math.floor(diffMin / 60);
  const diffD   = Math.floor(diffH  / 24);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH   < 24) return `Il y a ${diffH} h`;
  if (diffD   <  7) return `Il y a ${diffD} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Mock data ──────────────────────────────────────────────────────────────────
function generateMockTransfers(daysBack: number): TransferData[] {
  const types:    TransferData['type'][]   = ['internal', 'internal', 'internal', 'supplier', 'loan_payment'];
  const statuses: TransferData['status'][] = ['completed', 'completed', 'completed', 'pending', 'processing', 'failed'];
  const members   = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];

  const data: TransferData[] = [];
  let attempts = 0, i = 0;

  while (i < 60 && attempts < 200) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    if (date.getDay() === 0 || date.getDay() === 6) { attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const type = types[Math.floor(Math.random() * types.length)];
    data.push({
      id:                i + 1,
      compteSource:      `ACC${1000 + i}`,
      compteDestination: `ACC${2000 + i}`,
      montant:           Math.floor(Math.random() * 80000) + 1000,
      reference:         `VIR-${String(i + 1).padStart(4, '0')}`,
      type,
      memberName:        members[Math.floor(Math.random() * members.length)],
      status:            statuses[Math.floor(Math.random() * statuses.length)],
      created_at:        date.toISOString(),
    });
    i++; attempts++;
  }
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─── KPI Card ───────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent: string;
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

// ─── Main ────────────────────────────────────────────────────────────────────────
export default function TransferDashboard() {
  const [period,    setPeriod]    = useState<'day' | 'week' | 'month'>('week');
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [typeF,     setTypeF]     = useState('all');
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  const daysBack   = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const transfers  = useMemo(() => generateMockTransfers(daysBack), [period]);

  const filtered = useMemo(() => transfers.filter(t => {
    const q = search.toLowerCase();
    return (!search || t.memberName.toLowerCase().includes(q) || t.compteSource.includes(q) || t.reference.includes(q))
      && (statusF === 'all' || t.status === statusF)
      && (typeF   === 'all' || t.type   === typeF);
  }), [transfers, search, statusF, typeF]);

  // KPIs
  const completed      = transfers.filter(t => t.status === 'completed');
  const totalAmount    = completed.reduce((s, t) => s + t.montant, 0);
  const avgAmount      = completed.length ? totalAmount / completed.length : 0;
  const uniqueMembers  = new Set(completed.map(t => t.memberName)).size;
  const pendingCount   = transfers.filter(t => t.status === 'pending').length;
  const completionRate = transfers.length ? completed.length / transfers.length * 100 : 0;

  // Volume data
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
          days.unshift({ label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), date: d.toISOString().split('T')[0], count: 0, amount: 0 });
        }
      }
    }
    transfers.forEach(t => {
      const idx = days.findIndex(item =>
        period === 'day'
          ? new Date(item.date).getHours() === new Date(t.created_at).getHours()
          : item.date === t.created_at.split('T')[0]
      );
      if (idx >= 0) { days[idx].count++; days[idx].amount += t.montant; }
    });
    return days;
  }, [transfers, period]);

  // Type distribution
  const typeData = useMemo(() =>
    Object.entries(TYPE_CFG).map(([key, cfg]) => {
      const items = transfers.filter(t => t.type === key);
      return { key, name: cfg.label, value: items.length, amount: items.reduce((s, t) => s + t.montant, 0), color: cfg.color };
    }), [transfers]);

  // Sélection
  const allSel  = selected.size === filtered.length && filtered.length > 0;
  const someSel = selected.size > 0 && !allSel;
  const toggleAll = () => allSel ? setSelected(new Set()) : setSelected(new Set(filtered.map(t => t.id)));
  const toggleRow = (id: number) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Virements</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des virements membres</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Nouveau virement
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
        <KPICard icon={ArrowLeftRight} label="Montant total"      value={formatHTG(totalAmount)}           accent={C.green} />
        <KPICard icon={TrendingUp}     label="Nombre virements"   value={transfers.length} sub={`${completed.length} complétés`} accent={C.blue} />
        <KPICard icon={CalendarDays}   label="Moyenne / virement" value={formatHTG(avgAmount)}             accent={C.gold}  />
        <KPICard icon={Users}          label="Membres actifs"     value={uniqueMembers}   sub="virements"  accent={C.green} />
        <KPICard icon={ShieldCheck}    label="Taux de complétion" value={`${completionRate.toFixed(1)}%`}  accent={C.green} />
        <KPICard icon={Clock}          label="En attente"         value={pendingCount}    sub="à traiter"  accent={C.gold}  />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Volume — virements</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Virements']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {volumeData.map((_, i) => <Cell key={i} fill={i === volumeData.length - 1 ? C.green : C.greenPale} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Montants virés (HTG)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
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
                const cfg  = TYPE_CFG[t.key];
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
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [formatHTG(v ?? 0), 'Montant']} />
              <Line type="monotone" dataKey="amount" stroke={C.green} strokeWidth={2.5} dot={{ fill: C.green, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header table */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Liste des virements</p>
            <p className="text-xs text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="Membre, référence…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-3 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] w-44" />
            <select value={statusF} onChange={e => setStatusF(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] text-gray-600">
              <option value="all">Tous statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="failed">Échoué</option>
            </select>
            <select value={typeF} onChange={e => setTypeF(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] text-gray-600">
              <option value="all">Tous types</option>
              <option value="internal">Entre comptes</option>
              <option value="supplier">Fournisseur</option>
              <option value="loan_payment">Remb. prêt</option>
            </select>
          </div>
        </div>

        {/* Barre sélection */}
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

        {/* Header colonnes */}
        <div className="grid items-center px-5 py-3 border-b border-gray-100 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
          style={{ gridTemplateColumns: '40px 1.4fr 1.2fr 1.2fr 1fr 1.2fr 1fr 90px' }}>
          <div className="flex justify-center">
            <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = someSel; }}
              onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer" />
          </div>
          {['Membre', 'Comptes', 'Référence', 'Type', 'Montant', 'Statut', 'Actions'].map(col => (
            <div key={col} className="text-xs font-semibold uppercase tracking-widest text-gray-500">{col}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: '40px 1.4fr 1.2fr 1.2fr 1fr 1.2fr 1fr 90px' }}>
              {Array.from({ length: 8 }).map((_, j) => <div key={j} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />)}
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucun virement trouvé</p>
            </div>
          )}

          {!loading && filtered.map(t => {
            const stCfg  = STATUS_CFG[t.status]  ?? STATUS_CFG['pending'];
            const tpCfg  = TYPE_CFG[t.type]      ?? TYPE_CFG['internal'];
            const TpIcon = tpCfg.icon;
            const isSel  = selected.has(t.id);
            return (
              <div key={t.id}
                className={`grid items-center px-5 py-3 transition-colors ${isSel ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]' : 'hover:bg-[#DDEAD5]/10 border-l-2 border-transparent'}`}
                style={{ gridTemplateColumns: '40px 1.4fr 1.2fr 1.2fr 1fr 1.2fr 1fr 90px' }}>

                <div className="flex justify-center">
                  <input type="checkbox" checked={isSel} onChange={() => toggleRow(t.id)}
                    className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer" />
                </div>

                {/* Membre */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#2E7D32]">{t.memberName[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.memberName}</p>
                    <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                  </div>
                </div>

                {/* Comptes */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-mono text-gray-600 truncate">{t.compteSource}</span>
                  <ArrowLeftRight className="w-3 h-3 text-gray-300 shrink-0" />
                  <span className="text-xs font-mono text-gray-600 truncate">{t.compteDestination}</span>
                </div>

                {/* Référence */}
                <p className="text-xs font-mono text-gray-500">{t.reference}</p>

                {/* Type */}
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit"
                  style={{ backgroundColor: tpCfg.bg, color: tpCfg.color }}>
                  <TpIcon className="w-3 h-3 shrink-0" />{tpCfg.label}
                </span>

                {/* Montant */}
                <p className="text-sm font-bold text-[#355C7D]">{formatHTG(t.montant)}</p>

                {/* Statut */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                  style={{ backgroundColor: stCfg.bg, color: stCfg.text }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stCfg.dot }} />
                  {stCfg.label}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button title="Voir" className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> virement{filtered.length !== 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {pendingCount} en attente
            </span>
          </div>
        )}
      </div>

      {/* ── Modal Nouveau virement ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
          <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nouveau virement</p>
                  <p className="text-xs text-gray-400">Transfert entre comptes ou vers tiers</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[80vh]">
              <TransferForm onCancel={() => setModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}