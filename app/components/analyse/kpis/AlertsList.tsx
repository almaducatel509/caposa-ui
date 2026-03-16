// app/membres/alertes/page.tsx
// Alertes MEMBRES INDIVIDUELS (niveau micro) — distinct des alertes KPI institutionnelles
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, AlertTriangle, XCircle, TrendingDown, Clock,
  ChevronRight, FileWarning, TrendingUp, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { MemberFinancialData } from '@/types/analyses';
import { generateAlerts } from '../generateAlerts';

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Types ────────────────────────────────────────────────────────────────────
interface Alert {
  id:          string;
  memberId:    string;
  member:      MemberFinancialData;
  type:        'score_faible' | 'endettement_eleve' | 'pret_retard' | 'capacite_insuffisante';
  severity:    'critique' | 'alerte' | 'attention';
  status:      'a_afficher' | 'a_traiter' | 'a_reflechir' | 'a_decider';
  title:       string;
  description: string;
  createdAt:   Date;
  updatedAt:   Date;
  updatedBy?:  string;
}

// ─── Mock membres ─────────────────────────────────────────────────────────────
function generateSampleMembers(): MemberFinancialData[] {
  const noms    = ['Joseph', 'Dupont', 'Antoine', 'Pierre', 'Moreau', 'Beaumont', 'Thermidor', 'Désir', 'Celestin', 'Toussaint'];
  const prenoms = ['Hudson', 'Marie', 'Jean-Pierre', 'Roseline', 'Claudette', 'Réginald', 'Nadège', 'Wilgens', 'Josiane', 'Patrick'];
  return Array.from({ length: 25 }, (_, i) => {
    const hasLoan = Math.random() > 0.3;
    const isLate  = hasLoan && Math.random() > 0.7;
    const revenu  = Math.floor(Math.random() * 40000) + 15000;
    return {
      id:                       `MEM${1000 + i}`,
      nom:                      noms[i   % noms.length],
      prenom:                   prenoms[i % prenoms.length],
      historique:               [],
      revenuMensuelMoyen:       revenu,
      depensesMensuellesMoyennes: Math.floor(revenu * 0.6),
      capaciteRemboursement:    Math.floor(revenu * 0.3),
      ratioEndettement:         parseFloat((Math.random() * 0.6).toFixed(2)),
      scoreStabilite:           Math.floor(Math.random() * 100),
      estSaisonnier:            Math.random() > 0.7,
      anciennete:               Math.floor(Math.random() * 10) + 1,
      nombrePrets:              Math.floor(Math.random() * 5),
      tauxRemboursement:        parseFloat((Math.random() * 30 + 70).toFixed(1)),
      dernierPret: hasLoan ? {
        montant:   Math.floor(Math.random() * 50000) + 10000,
        statut:    isLate ? 'en_retard' : Math.random() > 0.5 ? 'en_cours' : 'rembourse',
        mensualite:Math.floor(Math.random() * 5000) + 1000,
      } : undefined,
    };
  });
}

// ─── Config types / sévérité / statut ─────────────────────────────────────────
const TYPE_CFG = {
  score_faible:          { icon: TrendingDown, label: 'Score faible',           bg: '#FEF9EC', text: '#B45309', dot: C.gold    },
  endettement_eleve:     { icon: AlertTriangle,label: 'Endettement élevé',      bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
  pret_retard:           { icon: Clock,        label: 'Retard de paiement',     bg: '#FEF9EC', text: '#B45309', dot: C.gold    },
  capacite_insuffisante: { icon: XCircle,      label: 'Capacité insuffisante',  bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
} as const;

const SEVERITY_CFG = {
  critique: { label: 'Critique',  bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5' },
  alerte:   { label: 'Alerte',    bg: '#FEF9EC', text: '#B45309', border: '#FDE68A' },
  attention:{ label: 'Attention', bg: C.greenPale, text: C.greenDark, border: '#DDEAD5' },
} as const;

const STATUS_CFG = {
  a_afficher: { label: 'À afficher', bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  a_traiter:  { label: 'À traiter',  bg: '#EBF2F8', text: C.blue,    border: '#BFDBFE' },
  a_reflechir:{ label: 'À réfléchir',bg: '#FEF9EC', text: '#B45309', border: '#FDE68A' },
  a_decider:  { label: 'À décider',  bg: C.greenPale, text: C.greenDark, border: '#DDEAD5' },
} as const;

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, trend, accent }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; trend?: number; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + '22' }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <span className={`text-xs font-bold mb-0.5 ${trend > 0 ? 'text-[#B91C1C]' : trend < 0 ? 'text-[#2E7D32]' : 'text-gray-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const selectCls = "px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AlertesPage() {
  const members   = useMemo(() => generateSampleMembers(), []);
  const allAlerts = useMemo(() => generateAlerts(members), [members]);

  const [periodFilter,   setPeriodFilter]   = useState<'jour'|'semaine'|'mois'|'trimestre'|'annee'>('mois');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm,     setSearchTerm]     = useState('');

  // Filtrage par période
  const alertsByPeriod = useMemo(() => {
    const days = { jour: 1, semaine: 7, mois: 30, trimestre: 90, annee: 365 }[periodFilter];
    return allAlerts.filter(a => (Date.now() - a.createdAt.getTime()) / 86400000 <= days);
  }, [allAlerts, periodFilter]);

  // Stats
  const stats = useMemo(() => {
    const critiques   = alertsByPeriod.filter(a => a.severity === 'critique');
    const alertes     = alertsByPeriod.filter(a => a.severity === 'alerte');
    const enTraitement= alertsByPeriod.filter(a => a.status   === 'a_traiter');
    const nouvelles   = alertsByPeriod.filter(a => (Date.now() - a.createdAt.getTime()) / 86400000 <= 7);

    // Tendance vs période précédente
    const daysBack = { jour: 1, semaine: 7, mois: 30, trimestre: 90, annee: 365 }[periodFilter];
    const prev     = allAlerts.filter(a => {
      const d = (Date.now() - a.createdAt.getTime()) / 86400000;
      return d > daysBack && d <= daysBack * 2;
    });
    const prevCrit = prev.filter(a => a.severity === 'critique').length;
    const prevAlt  = prev.filter(a => a.severity === 'alerte').length;

    const perf = alertsByPeriod.length > 0
      ? Math.round((1 - critiques.length / alertsByPeriod.length) * 100)
      : 100;

    return {
      critiques:     critiques.length,
      critiquesEnCours: critiques.filter(a => a.status === 'a_traiter').length,
      critiqueTrend: prevCrit > 0 ? Math.round(((critiques.length - prevCrit) / prevCrit) * 100) : 0,
      alertes:       alertes.length,
      nouvelles:     nouvelles.length,
      alerteTrend:   prevAlt  > 0 ? Math.round(((alertes.length - prevAlt) / prevAlt) * 100) : 0,
      enTraitement:  enTraitement.length,
      perf,
    };
  }, [alertsByPeriod, allAlerts, periodFilter]);

  // Filtrage tableau
  const filtered = useMemo(() =>
    alertsByPeriod.filter(a =>
      (statusFilter   === 'all' || a.status   === statusFilter) &&
      (severityFilter === 'all' || a.severity === severityFilter) &&
      (searchTerm === '' ||
        a.member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.member.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [alertsByPeriod, statusFilter, severityFilter, searchTerm]
  );

  // Groupement par date
  const grouped = useMemo(() =>
    [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .reduce((acc, alert) => {
        const key = alert.createdAt.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        if (!acc[key]) acc[key] = [];
        acc[key].push(alert);
        return acc;
      }, {} as Record<string, Alert[]>),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">

      {/* Filtre période */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Période</p>
        <div className="flex gap-2 flex-wrap">
          {(['jour', 'semaine', 'mois', 'trimestre', 'annee'] as const).map(p => (
            <button key={p} onClick={() => setPeriodFilter(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                periodFilter === p
                  ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#DDEAD5]/20'
              }`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard icon={AlertTriangle} label="Critiques"          value={stats.critiques}  sub={`${stats.critiquesEnCours} en cours`} trend={stats.critiqueTrend} accent="#EF4444" />
        <KPICard icon={Bell}          label="Alertes"            value={stats.alertes}    sub={`${stats.nouvelles} nouvelles`}       trend={stats.alerteTrend}   accent={C.gold}  />
        <KPICard icon={Clock}         label="En traitement"      value={stats.enTraitement}                                                                      accent={C.blue}  />
        <KPICard icon={TrendingUp}    label="Performance globale" value={`${stats.perf}/100`} sub={stats.perf >= 75 ? 'Bon niveau' : stats.perf >= 50 ? 'Moyen' : 'À améliorer'} accent={C.green} />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher un membre…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="all">Tous les statuts</option>
            <option value="a_afficher">À afficher</option>
            <option value="a_traiter">À traiter</option>
            <option value="a_reflechir">À réfléchir</option>
            <option value="a_decider">À décider</option>
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className={selectCls}>
            <option value="all">Toutes les criticités</option>
            <option value="critique">Critique</option>
            <option value="alerte">Alerte</option>
            <option value="attention">Attention</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-3">Membre</div>
            <div className="col-span-2">Type d'alerte</div>
            <div className="col-span-2">Criticité</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-2">Mise à jour</div>
            <div className="col-span-1 text-center">Action</div>
          </div>
        </div>

        {/* Corps */}
        <div>
          {Object.keys(grouped).length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
                <FileWarning className="w-7 h-7 text-[#2E7D32]" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Aucune alerte trouvée</p>
              <p className="text-xs text-gray-400">Modifiez les filtres pour voir plus de résultats</p>
            </div>
          ) : (
            Object.entries(grouped).map(([dateLabel, alerts]) => (
              <div key={dateLabel}>
                {/* Séparateur date */}
                <div className="bg-linear-to-r from-[#DDEAD5]/40 to-[#F9F9F6] px-5 py-2 border-t border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{dateLabel}</p>
                </div>

                {/* Lignes */}
                {alerts.map((alert, idx) => {
                  const tc = TYPE_CFG[alert.type];
                  const sc = SEVERITY_CFG[alert.severity];
                  const stc = STATUS_CFG[alert.status];
                  const TypeIcon = tc.icon;

                  return (
                    <div key={alert.id}
                      className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group border-b border-gray-50 last:border-0 ${
                        idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
                      }`}>

                      {/* Membre */}
                      <div className="col-span-3 flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 text-[#1B5E20] font-bold text-xs group-hover:scale-105 transition-transform">
                          {alert.member.prenom[0]}{alert.member.nom[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {alert.member.prenom} {alert.member.nom}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">#{alert.member.id}</p>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: tc.bg, color: tc.text }}>
                          <TypeIcon className="w-3.5 h-3.5 shrink-0" />
                          {tc.label}
                        </span>
                      </div>

                      {/* Criticité */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border-2"
                          style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.text }} />
                          {sc.label}
                        </span>
                      </div>

                      {/* Statut */}
                      <div className="col-span-2">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border"
                          style={{ backgroundColor: stc.bg, color: stc.text, borderColor: stc.border }}>
                          {stc.label}
                        </span>
                        {alert.updatedBy && (
                          <p className="text-xs text-gray-400 mt-1">par {alert.updatedBy}</p>
                        )}
                      </div>

                      {/* Mise à jour */}
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-gray-700">
                          {alert.updatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {alert.updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="col-span-1 flex justify-center">
                        <Link href={`/membres/alertes/${alert.id}`}>
                          <button className="w-8 h-8 rounded-lg bg-linear-to-r from-[#2E7D32] to-[#1B5E20] flex items-center justify-center hover:shadow-md transition-all group/btn">
                            <ChevronRight className="w-4 h-4 text-white group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> alerte{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur <span className="font-semibold">{alertsByPeriod.length}</span> pour cette période
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              {stats.critiques} critique{stats.critiques !== 1 ? 's' : ''} · {stats.enTraitement} en traitement
            </span>
          </div>
        )}
      </div>
    </div>
  );
}