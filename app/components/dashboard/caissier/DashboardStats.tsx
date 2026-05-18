'use client';

import React from 'react';
import {
  BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line,
} from 'recharts';
import {
  ArrowDownCircle, TrendingUp, CalendarDays,
  Users, ShieldCheck, Clock,
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────

export interface VolumePoint {
  label:  string;
  date:   string;
  count:  number;
  amount: number;
}

export interface TypePoint {
  key:    string;
  name:   string;
  value:  number;
  amount: number;
  color:  string;
  [key: string]: any; // ← requis par recharts PieChart
}
interface DashboardStatsProps {
  // KPIs
  totalAmount:    number;
  depositCount:   number;
  completedCount: number;
  avgAmount:      number;
  uniqueMembers:  number;
  pendingCount:   number;
  completionRate: number;
  // Graphiques
  volumeData: VolumePoint[];
  typeData:   TypePoint[];
}

// ─── Constantes ───────────────────────────────────────────────────

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

const tooltipStyle = {
  backgroundColor: 'white',
  border:          '1px solid #DDEAD5',
  borderRadius:    '12px',
  fontSize:        '12px',
  boxShadow:       '0 4px 16px rgba(0,0,0,0.06)',
};

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── KPI Card ────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon:   React.ElementType;
  label:  string;
  value:  string | number;
  sub?:   string;
  accent: string;
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

// ─── Main ────────────────────────────────────────────────────────

export default function DashboardStats({
  totalAmount, depositCount, completedCount, avgAmount,
  uniqueMembers, pendingCount, completionRate,
  volumeData, typeData,
}: DashboardStatsProps) {
  return (
    <>
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard icon={ArrowDownCircle} label="Montant total"      value={formatHTG(totalAmount)}              accent={C.green} />
        <KPICard icon={TrendingUp}      label="Nombre de dépôts"   value={depositCount} sub={`${completedCount} complétés`} accent={C.blue} />
        <KPICard icon={CalendarDays}    label="Moyenne / dépôt"    value={formatHTG(avgAmount)}                accent={C.gold}  />
        <KPICard icon={Users}           label="Membres actifs"     value={uniqueMembers} sub="déposants"       accent={C.green} />
        <KPICard icon={ShieldCheck}     label="Taux de complétion" value={`${completionRate.toFixed(1)}%`}     accent={C.green} />
        <KPICard icon={Clock}           label="En attente"         value={pendingCount}  sub="à traiter"       accent={C.gold}  />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Volume dépôts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Volume — dépôts</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v) || 0, 'Dépôts']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {volumeData.map((_, i) => (
                  <Cell key={i} fill={i === volumeData.length - 1 ? C.green : C.greenPale} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Montants déposés */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Montants déposés (HTG)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatHTG(Number(v) || 0), 'Montant']} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {volumeData.map((_, i) => (
                  <Cell key={i} fill={i === volumeData.length - 1 ? C.blue : '#D4E3EF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Répartition par type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={160}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  paddingAngle={3} dataKey="value">
                  {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v, _, props: any) =>
                    [`${Number(v) || 0} (${formatHTG(props?.payload?.amount ?? 0)})`, props?.payload?.name ?? '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-2.5">
              {typeData.map(t => {
                const cfg  = SUBTYPE_CFG[t.key];
                const Icon = cfg?.icon ?? MoreHorizontal;
                return (
                  <div key={t.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: cfg?.bg }}>
                        <Icon className="w-3 h-3" style={{ color: cfg?.color }} />
                      </div>
                      <span className="text-xs text-gray-600">{cfg?.label ?? t.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{t.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tendance montants */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Tendance montants (HTG)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatHTG(Number(v) || 0), 'Montant']}/>
              <Line type="monotone" dataKey="amount" stroke={C.green} strokeWidth={2.5}
                dot={{ fill: C.green, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </>
  );
}