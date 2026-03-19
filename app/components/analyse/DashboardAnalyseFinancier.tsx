'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, CheckCircle2, AlertTriangle, XCircle,
  BarChart3, Sun, AlertCircle, ChevronDown, ChevronUp,
  Plus,
  Landmark,
  X,
} from 'lucide-react';
import { MemberFinancialData } from '@/types/analyses';
import MemberCard from './MemberCardAnalyse';
import MemberDetailModal from './MemberDetailModal';
import { generateMemberData } from './MemberDataMock';
import { GiReceiveMoney } from 'react-icons/gi';
import PageHeader from '../header';
import LoanForm from '../loans/LoanFormFields';

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = {
  green: '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:  '#355C7D',
  gold:  '#D4AF37',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string | number; accent: string;
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
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FinancialAnalysisDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [members] = useState<MemberFinancialData[]>(
    generateMemberData().filter(
      (m): m is MemberFinancialData =>
        m != null && typeof m.scoreStabilite === 'number' && !!m.nom && !!m.prenom
    )
  );
  const [search,         setSearch]        = useState('');
  const [scoreFilter,    setScoreFilter]   = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selected,       setSelected]      = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember]= useState<MemberFinancialData | null>(null);
  const [sortField,      setSortField]     = useState<'nom' | 'score' | 'revenu' | 'prets'>('score');
  const [sortAsc,        setSortAsc]       = useState(false);

  const filtered = useMemo(() => {
    const r = members.filter(m => {
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ||
        m.nom.toLowerCase().includes(q) ||
        m.prenom.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      const matchScore =
        scoreFilter === 'all'    ? true :
        scoreFilter === 'high'   ? m.scoreStabilite >= 75 :
        scoreFilter === 'medium' ? m.scoreStabilite >= 50 && m.scoreStabilite < 75 :
                                   m.scoreStabilite < 50;
      return matchSearch && matchScore;
    });
    return [...r].sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'nom')    return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`) * dir;
      if (sortField === 'revenu') return (a.revenuMensuelMoyen - b.revenuMensuelMoyen) * dir;
      if (sortField === 'prets')  return (a.nombrePrets - b.nombrePrets) * dir;
      return (a.scoreStabilite - b.scoreStabilite) * dir;
    });
  }, [members, search, scoreFilter, sortField, sortAsc]);

  const stats = useMemo(() => ({
    high:        members.filter(m => m.scoreStabilite >= 75).length,
    medium:      members.filter(m => m.scoreStabilite >= 50 && m.scoreStabilite < 75).length,
    low:         members.filter(m => m.scoreStabilite < 50).length,
    avgScore:    members.reduce((s, m) => s + m.scoreStabilite, 0) / members.length,
    saisonniers: members.filter(m => m.estSaisonnier).length,
  }), [members]);

  const handleSort = (f: typeof sortField) => {
    if (sortField === f) setSortAsc(a => !a); else { setSortField(f); setSortAsc(false); }
  };

  const handleSelectAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(m => m.id)));

  const SortIcon = ({ f }: { f: typeof sortField }) =>
    sortField === f
      ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
      : null;

  return (
    <div className="w-full min-h-screen bg-[#F9F9F6] p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Analyse Financière des Membres"
          subtitle="Évaluation de la capacité de remboursement et stabilité financière"
          icon={<GiReceiveMoney className="font-light text-4xl" />}
        />

        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Nouveau prêt
        </button>
      </div>
      {/* Filtres score */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all',    label: 'Tous'   },
          { key: 'high',   label: 'Élevé'  },
          { key: 'medium', label: 'Moyen'  },
          { key: 'low',    label: 'Faible' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setScoreFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              scoreFilter === f.key
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#F9F9F6]'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard icon={CheckCircle2}  label="Score élevé (75+)"   value={stats.high}                accent={C.green}   />
        <KPICard icon={AlertTriangle} label="Score moyen (50–74)"  value={stats.medium}              accent={C.gold}    />
        <KPICard icon={XCircle}       label="Score faible (<50)"   value={stats.low}                 accent="#EF4444"   />
        <KPICard icon={BarChart3}     label="Score moyen"          value={stats.avgScore.toFixed(0)} accent={C.blue}    />
        <KPICard icon={Sun}           label="Saisonniers"          value={stats.saisonniers}         accent={C.gold}    />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Recherche */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Nom, prénom ou ID…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          </div>
          <span className="ml-auto text-xs text-gray-400 shrink-0">
            {filtered.length} membre{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Header colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-1">
              <input type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
            </div>
            <div className="col-span-3 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('nom')}>
              Membre <SortIcon f="nom" />
            </div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('score')}>
              Stabilité <SortIcon f="score" />
            </div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('revenu')}>
              Revenu moyen <SortIcon f="revenu" />
            </div>
            <div className="col-span-2">Statut prêt</div>
            <div className="col-span-1 cursor-pointer flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              onClick={() => handleSort('prets')}>
              Prêts <SortIcon f="prets" />
            </div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Badge sélection */}
        {selected.size > 0 && (
          <div className="bg-[#DDEAD5]/50 border-b border-[#DDEAD5] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#1B5E20]">
                {selected.size} membre{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
              <button onClick={() => setSelected(new Set())}
                className="text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium underline">
                Désélectionner
              </button>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Exporter
            </button>
          </div>
        )}

        {/* Lignes — MemberCard comme ligne de table */}
        <div>
          {filtered.map((member, idx) => (
            <MemberCard
              key={member.id}
              member={member}
              idx={idx}
              isSelected={selected.has(member.id)}
              onSelect={() => setSelected(s => {
                const n = new Set(s);
                n.has(member.id) ? n.delete(member.id) : n.add(member.id);
                return n;
              })}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>

        {/* État vide */}
        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Aucun membre trouvé</p>
            <p className="text-xs text-gray-400">Modifiez vos critères de recherche</p>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> membre{filtered.length !== 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              {stats.high} élevé · {stats.medium} moyen · {stats.low} faible
            </span>
          </div>
        )}
      </div>
{/* Modal nouveau prêt */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
          <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Nouvelle demande de prêt</p>
                  <p className="text-xs text-gray-400">Remplissez les informations du prêt</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[80vh]">
              <LoanForm onCancel={() => setModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {selectedMember && (
        <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}