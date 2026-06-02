'use client';

import React, { useMemo, useState } from 'react';
import {
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  CheckCircle2, XCircle, Pencil, Download, Clock, Loader2,
  ChevronDown, ChevronsUpDown, ChevronUp, Check,
} from 'lucide-react';
// import DepositExportModal from './DepositExportModal';
import { DepositFilterPeriod, DepositFilterRange } from './DepositFilterBar';
import { DepositData } from '../validation/deposit';
import { ExportAllButton } from '@/app/ExportAllButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepositTableProps {
  deposits:       DepositData[];
  loading:        boolean;
  onView:         (dep: DepositData) => void;
  onEdit:         (dep: DepositData) => void;
  onExport:       (ids: number[]) => Promise<void>;
  selectedType:   string;
  selectedStatus: string;
  selectedPeriod: DepositFilterPeriod;
  selectedRange:  DepositFilterRange;
  search?:        string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const C = {
  green: '#2E7D32', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37',
};

const STATUS_CFG: Record<DepositData['status'], { label: string; bg: string; text: string; dot: string; icon: any }> = {
  encaisse:   { label: 'Encaissé',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', icon: CheckCircle2 },
  en_attente: { label: 'En attente', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]', icon: Clock        },
  en_cours:   { label: 'En cours',   bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]', icon: Loader2      },
  echoue:     { label: 'Échoué',     bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]', icon: XCircle      },
  annule:     { label: 'Annulé',     bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]', icon: XCircle      },
};

const SUBTYPE_CFG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  cash:     { icon: Banknote,       label: 'Espèces',  color: C.green,  bg: C.greenPale },
  check:    { icon: FileCheck,      label: 'Chèque',   color: C.blue,   bg: '#EBF2F8'   },
  transfer: { icon: ArrowLeftRight, label: 'Virement', color: C.gold,   bg: '#FBF6E7'   },
  other:    { icon: MoreHorizontal, label: 'Autre',    color: '#6E6E6E', bg: '#F3F3F3'  },
};

const GRID = '40px 2fr 1.2fr 1.2fr 1.4fr 1fr 1.2fr 140px';

const COLS = [
  { label: 'Membre',  field: 'member_name' },
  { label: 'Compte',  field: 'idCompte' },
  { label: 'Type',    field: 'depositSubtype' },
  { label: 'Montant', field: 'montantTransaction' },
  { label: 'Statut',  field: 'status' },
  { label: 'Date',    field: 'created_at' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24)   return `Il y a ${diffH} h`;
  if (diffD < 7)    return `Il y a ${diffD} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function EyeIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function matchesPeriod(iso: string, period: DepositFilterPeriod): boolean {
  if (period === 'all') return true;
  const d = new Date(iso);
  const now = new Date();
  if (period === 'today') return d.toDateString() === now.toDateString();
  if (period === 'week')  return (now.getTime() - d.getTime()) <= 7 * 86_400_000;
  if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === 'year')  return d.getFullYear() === now.getFullYear();
  return true;
}

function matchesRange(amount: number, range: DepositFilterRange): boolean {
  if (range === 'all')    return true;
  if (range === 'small')  return amount < 10_000;
  if (range === 'medium') return amount >= 10_000 && amount <= 50_000;
  if (range === 'large')  return amount > 50_000  && amount <= 100_000;
  if (range === 'xlarge') return amount > 100_000;
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DepositTable({
  deposits, loading, onView, onEdit, onExport,
  search = '',
  selectedType,
  selectedStatus,
  selectedPeriod,
  selectedRange,
}: DepositTableProps) {

  // ── States locaux UNIQUEMENT pour ce qui n'est pas géré par le parent ──
  const [selected,   setSelected]   = useState<Set<number>>(new Set());
  const [sortField,  setSortField]  = useState('created_at');
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc');

  // ── Filtrage (PROPS uniquement, pas de state local de filtre) ──
  const filtered = useMemo(() => {
    const q = (search ?? '').toLowerCase().trim();
    return deposits.filter(d => {
      const matchSearch = q === ''
        || d.member_name.toLowerCase().includes(q)
        || d.idCompte.toLowerCase().includes(q)
        || String(d.id).includes(q)
        || (d.codeAutorisation ?? '').toLowerCase().includes(q)
        || (d.source ?? '').toLowerCase().includes(q);
      const matchType    = selectedType   === 'all' || d.depositSubtype === selectedType;
      const matchStatus  = selectedStatus === 'all' || d.status         === selectedStatus;
      const matchRange_  = matchesRange(d.montantTransaction, selectedRange);
      const matchPeriod_ = matchesPeriod(d.created_at, selectedPeriod);
      return matchSearch && matchType && matchStatus && matchRange_ && matchPeriod_;
    });
  }, [deposits, search, selectedType, selectedStatus, selectedRange, selectedPeriod]);

  // ── Tri ──
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'montantTransaction') return (a.montantTransaction - b.montantTransaction) * dir;
    if (sortField === 'status')             return a.status.localeCompare(b.status) * dir;
    if (sortField === 'depositSubtype')     return a.depositSubtype.localeCompare(b.depositSubtype) * dir;
    if (sortField === 'idCompte')           return a.idCompte.localeCompare(b.idCompte) * dir;
    if (sortField === 'created_at')         return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    return a.member_name.localeCompare(b.member_name) * dir;
  }), [filtered, sortField, sortDir]);

  // ── Sélection ──
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () =>
    allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(d => d.id)));

  const toggleRow = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const pendingCount = deposits.filter(d => d.status === 'en_attente').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Liste des dépôts</p>
          <p className="text-xs text-gray-400">
            {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Barre sélection ── */}
      {selected.size > 0 && (
        <div className="px-5 py-2.5 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-sm font-semibold text-[#1B5E20]">
            {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
          </span>
          <div className="ml-auto flex items-center gap-2">
           // APRÈS
            <ExportAllButton
              data={sorted
                .filter(d => selected.has(d.id))
                .map(dep => ({
                  code:       dep.codeAutorisation,
                  compte:     dep.idCompte,
                  membre:     dep.member_name,
                  type:       SUBTYPE_CFG[dep.depositSubtype]?.label ?? '—',
                  source:     dep.source,
                  montant:    dep.montantTransaction,
                  statut:     STATUS_CFG[dep.status]?.label ?? '—',
                  caisse:     dep.caisse_numero,
                  traite_par: dep.processed_by,
                  valide_par: dep.validated_by,
                  date:       dep.created_at?.split('T')[0] ?? '—',
                }))}
              filename="depots_selection"
              headerLabels={{
                code:       "Code d'autorisation",
                compte:     'N° de compte',
                membre:     'Membre',
                type:       'Type',
                source:     'Source',
                montant:    'Montant (HTG)',
                statut:     'Statut',
                caisse:     'Caisse',
                traite_par: 'Traité par',
                valide_par: 'Validé par',
                date:       'Date',
              }}
              separator=";"
            />
            <button
              onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête colonnes (triable) ── */}
      <div
        className="grid items-center px-5 py-3 border-b border-gray-100 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
        style={{ gridTemplateColumns: GRID }}
      >
        <div className="flex items-center justify-center">
          <button
            onClick={toggleAll}
            className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
              allSelected || someSelected
                ? 'bg-[#2E7D32] border-[#2E7D32]'
                : 'bg-white border-gray-300 hover:border-[#2E7D32]'
            }`}
          >
            {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </button>
        </div>
        {COLS.map(col => (
          <button
            key={col.label}
            onClick={() => toggleSort(col.field)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left text-gray-600 hover:text-[#1B5E20] cursor-pointer transition-colors"
          >
            {col.label}
            <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
          </button>
        ))}
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
      </div>

      {/* ── Corps ── */}
      <div className="divide-y divide-gray-50">

        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: GRID }}>
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ))}

        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucun dépôt trouvé</p>
          </div>
        )}

        {!loading && sorted.map(dep => {
          const stCfg   = STATUS_CFG[dep.status]         ?? STATUS_CFG['en_attente'];
          const subCfg  = SUBTYPE_CFG[dep.depositSubtype] ?? SUBTYPE_CFG['other'];
          const SubIcon = subCfg.icon;
          const isSel   = selected.has(dep.id);
          const isLocked = dep.status === 'encaisse';
          const canEdit  = dep.session_statut === 'ouverte' && !isLocked;

          return (
            <div
              key={dep.id}
              className={`grid items-center px-5 py-3 transition-colors border-l-2 ${
                isSel
                  ? 'bg-[#DDEAD5]/50 border-[#2E7D32]'
                  : 'hover:bg-[#DDEAD5]/10 border-transparent'
              }`}
              style={{ gridTemplateColumns: GRID }}
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => toggleRow(dep.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSel ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}
                >
                  {isSel && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* Membre (sans la date en sous-titre, on la garde uniquement dans la colonne Date) */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#2E7D32]">{dep.member_name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{dep.member_name}</p>
                  <p className="text-xs text-gray-400 truncate">{dep.codeAutorisation}</p>
                </div>
              </div>

              {/* Compte */}
              <p className="text-xs font-mono text-gray-600 truncate">{dep.idCompte}</p>

              {/* Type */}
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit"
                style={{ backgroundColor: subCfg.bg, color: subCfg.color }}
              >
                <SubIcon className="w-3 h-3 shrink-0" />{subCfg.label}
              </span>

              {/* Montant */}
              <p className="text-sm font-bold text-[#2E7D32]">+{formatHTG(dep.montantTransaction)}</p>

              {/* Statut */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                style={{ backgroundColor: stCfg.bg.replace('bg-[', '').replace(']', ''), color: stCfg.text.replace('text-[', '').replace(']', '') }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stCfg.dot.replace('bg-[', '').replace(']', '') }} />
                {stCfg.label}
              </span>

              {/* Date (UNE seule colonne) */}
              <div>
                <p className="text-xs font-semibold text-gray-700">{formatDate(dep.created_at)}</p>
                <p className="text-xs text-gray-400">
                  {new Date(dep.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  title="Voir les détails"
                  onClick={() => onView(dep)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors"
                >
                  <EyeIcon />
                </button>

                {canEdit ? (
                  <button
                    title="Modifier ce dépôt"
                    onClick={() => onEdit(dep)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    title={isLocked
                      ? 'Dépôt encaissé — modification impossible'
                      : 'Session fermée — modification non autorisée'}
                    disabled
                    className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {dep.holdPeriod > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                    {dep.holdPeriod}j
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pied ── */}
      {!loading && sorted.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span>{' '}
            dépôt{sorted.length !== 1 ? 's' : ''}
          </p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            {pendingCount} en attente
          </span>
        </div>
      )}

     
    </div>
  );
}