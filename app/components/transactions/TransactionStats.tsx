'use client';

import React from 'react';
import {
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Landmark,
  TrendingUp, Clock, CheckCircle2, Users,
} from 'lucide-react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie,
} from 'recharts';
import { TransactionData } from './types';

interface TransactionStatsProps {
  transactions: TransactionData[];
}

// ─── Palette CAPOSA ────────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  goldPale:  '#EDE7D6',
  page:      '#F9F9F6',
};

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KPI({
  icon: Icon, label, value, sub, from, to, textDark = false,
}: {
  icon: React.ElementType; label: string; value: string; sub: string;
  from: string; to: string; textDark?: boolean;
}) {
  const txt = textDark ? 'text-gray-700' : 'text-white';
  const sub_txt = textDark ? 'text-gray-500' : 'text-white/70';
  return (
    <div className={`rounded-2xl p-5 shadow-sm`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${textDark ? 'bg-black/5' : 'bg-white/20'}`}>
        <Icon className={`w-5 h-5 ${txt}`} />
      </div>
      <p className={`text-xs font-medium mb-1 ${sub_txt}`}>{label}</p>
      <p className={`text-2xl font-bold ${txt} leading-tight`}>{value}</p>
      <p className={`text-xs mt-1 ${sub_txt}`}>{sub}</p>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {

  const stats = {
    total:          transactions.length,
    totalAmount:    transactions.reduce((s, t) => s + (t.amount || 0), 0),
    pendingCount:   transactions.filter(t => t.status === 'pending').length,
    completedToday: transactions.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.created_at).toDateString() === today && t.status === 'completed';
    }).length,
  };

  // Volume 7 jours
  const volumeData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const day = transactions.filter(t => t.created_at?.startsWith(key));
    return {
      date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count: day.length,
      montant: day.reduce((s, t) => s + (t.amount || 0), 0),
    };
  });

  // Répartition par type
  const typeData = [
    { name: 'Dépôts',   key: 'deposit',    color: C.green  },
    { name: 'Retraits', key: 'withdrawal', color: C.blue   },
    { name: 'Virements',key: 'transfer',   color: C.gold   },
    { name: 'Prêts',    key: 'loan',       color: '#81C784'},
  ].map(t => ({
    ...t,
    value: transactions.filter(tx => tx.type === t.key).length,
    amount: transactions.filter(tx => tx.type === t.key).reduce((s, tx) => s + (tx.amount || 0), 0),
  }));

  // Activité horaire
  const hourlyData = Array.from({ length: 9 }, (_, i) => {
    const h = i + 9;
    return {
      label: `${h}h`,
      count: transactions.filter(t => t.created_at && new Date(t.created_at).getHours() === h).length,
    };
  });

  // Top membres
  const memberMap: Record<string, { count: number; total: number }> = {};
  transactions.forEach(t => {
    const n = t.member_name || 'Anonyme';
    if (!memberMap[n]) memberMap[n] = { count: 0, total: 0 };
    memberMap[n].count++;
    memberMap[n].total += t.amount || 0;
  });
  const topMembers = Object.entries(memberMap)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '12px',
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          icon={ArrowLeftRight}
          label="Total transactions"
          value={String(stats.total)}
          sub="Toutes périodes"
          from={C.blue} to="#2A4A5E"
        />
        <KPI
          icon={TrendingUp}
          label="Montant total"
          value={formatHTG(stats.totalAmount)}
          sub="Flux cumulé"
          from={C.green} to={C.greenDark}
        />
        <KPI
          icon={Clock}
          label="En attente"
          value={String(stats.pendingCount)}
          sub="À traiter"
          from={C.gold} to="#C9A820"
        />
        <KPI
          icon={CheckCircle2}
          label="Complétées aujourd'hui"
          value={String(stats.completedToday)}
          sub="Depuis minuit"
          from={C.greenPale} to="#C8E0BC"
          textDark
        />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Volume 7 jours */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Volume — 7 derniers jours</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Transactions']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {volumeData.map((_, i) => (
                  <Cell key={i} fill={i === 6 ? C.green : C.greenPale} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activité horaire */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Activité par heure</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [v ?? 0, 'Transactions']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 3 ? C.blue : entry.count > 1 ? '#7DA5C7' : '#D4E3EF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Répartition par type (donut) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Répartition par type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={180}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v: number | undefined, _: string | undefined, props: any) => [`${v ?? 0} (${formatHTG(props.payload.amount)})`, props.payload.name ?? '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-2">
              {typeData.map(t => (
                <div key={t.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-xs text-gray-600">{t.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top membres */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Top 3 membres actifs</p>
          </div>
          {topMembers.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">Aucune donnée</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topMembers.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3 p-3 bg-[#F9F9F6] rounded-xl">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: [C.green, C.blue, C.gold][i] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.count} transaction{m.count > 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-[#2E7D32] shrink-0">{formatHTG(m.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;