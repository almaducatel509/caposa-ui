'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  CheckCircle2, X, Clock, Hash, Eye,
  ChevronDown, ChevronsUpDown, ChevronUp, Check,
  ArrowDownLeft,
} from 'lucide-react';
import { DepositFilterPeriod, DepositFilterRange } from './DepositFilterBar';
import { DepositData } from '../validation/deposit';
import { ExportAllButton } from '@/app/ExportAllButton';
import Pagination from '@/app/components/ui/Pagination';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepositTableProps {
  deposits:       DepositData[];
  loading:        boolean;
  onView:         (dep: DepositData) => void;
  onExport:       (ids: number[]) => Promise<void>;
  selectedType:   string;
  selectedStatus: string;
  selectedPeriod: DepositFilterPeriod;
  selectedRange:  DepositFilterRange;
  search?:        string;
}

// ─── Config statut & type ─────────────────────────────────────────────────────

const STATUS_CFG: Record<DepositData['status'], { label: string; bg: string; text: string; dot: string }> = {
  encaisse:   { label: 'Encaissé',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  en_attente: { label: 'En attente', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  en_cours:   { label: 'En cours',   bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  echoue:     { label: 'Échoué',     bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  annule:     { label: 'Annulé',     bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]' },
};

const SUBTYPE_CFG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  cash:     { label: 'Espèces',  icon: Banknote,       bg: 'bg-[#DDEAD5]', text: 'text-[#2E7D32]' },
  check:    { label: 'Chèque',   icon: FileCheck,      bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]' },
  transfer: { label: 'Virement', icon: ArrowLeftRight, bg: 'bg-[#FBF6E7]', text: 'text-[#A8841F]' },
  other:    { label: 'Autre',    icon: MoreHorizontal, bg: 'bg-[#F3F3F3]', text: 'text-[#6E6E6E]' },
};

// ─── Grille & colonnes ────────────────────────────────────────────────────────
// Checkbox | Membre | Type | Montant | Statut | Caisse | Date | Actions
const GRID = '40px 2fr 1.4fr 1.3fr 1.1fr 0.9fr 1.1fr 96px';

const COLS = [
  { label: 'Membre',  field: 'member_name' },
  { label: 'Type',    field: 'subtype'     },
  { label: 'Montant', field: 'montant'     },
  { label: 'Statut',  field: 'status'      },
  { label: 'Caisse',  field: 'caisse'      },
  { label: 'Date',    field: 'created_at'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHTG(n: number | string) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(n)) + ' HTG';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: GRID }}>
      <div className="flex justify-center"><div className="w-4 h-4 rounded bg-gray-100 animate-pulse" /></div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-28 bg-gray-100 animate-pulse rounded" />
          <div className="h-2.5 w-20 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
      ))}
      <div className="flex justify-center"><div className="w-4 h-4 bg-gray-100 animate-pulse rounded" /></div>
    </div>
  );
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
  deposits, loading, onView,
  search = '',
  selectedType,
  selectedStatus,
  selectedPeriod,
  selectedRange,
}: DepositTableProps) {

  const [selected,    setSelected]    = useState<Set<number>>(new Set());
  const [sortField,   setSortField]   = useState('created_at');
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  // Retour page 1 + vidage de la sélection quand la liste change
  useEffect(() => {
    setCurrentPage(1);
    setSelected(new Set());
  }, [deposits, search, selectedType, selectedStatus, selectedPeriod, selectedRange, sortField, sortDir, pageSize]);

  // ── Filtrage ──
  const filtered = useMemo(() => {
    const q = (search ?? '').toLowerCase().trim();
    return deposits.filter(d => {
      const matchSearch = q === ''
        || (d.member_name ?? '').toLowerCase().includes(q)
        || (d.idCompte ?? '').toLowerCase().includes(q)
        || String(d.id).includes(q)
        || (d.codeAutorisation ?? '').toLowerCase().includes(q)
        || (d.source ?? '').toLowerCase().includes(q);
      const matchType    = selectedType   === 'all' || d.depositSubtype === selectedType;
      const matchStatus  = selectedStatus === 'all' || d.status         === selectedStatus;
      const matchRange_  = matchesRange(Number(d.montantTransaction), selectedRange);
      const matchPeriod_ = matchesPeriod(d.created_at, selectedPeriod);
      return matchSearch && matchType && matchStatus && matchRange_ && matchPeriod_;
    });
  }, [deposits, search, selectedType, selectedStatus, selectedRange, selectedPeriod]);

  // ── Tri ──
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'montant':    return (Number(a.montantTransaction) - Number(b.montantTransaction)) * dir;
      case 'status':     return a.status.localeCompare(b.status) * dir;
      case 'subtype':    return a.depositSubtype.localeCompare(b.depositSubtype) * dir;
      case 'caisse':     return (a.caisse_numero ?? '').localeCompare(b.caisse_numero ?? '') * dir;
      case 'created_at': return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      default:           return (a.member_name ?? '').localeCompare(b.member_name ?? '') * dir;
    }
  }), [filtered, sortField, sortDir]);

  // ── Pagination ──
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // ── Sélection ──
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(d => d.id)));
  const toggleRow    = (id: number) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── En-tête ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Liste des dépôts</p>
        <p className="text-xs text-gray-400">
          {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Barre de sélection ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} dépôt{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ExportAllButton
              data={sorted
                .filter(d => selected.has(d.id))
                .map(d => ({
                  code:       d.codeAutorisation,
                  compte:     d.idCompte,
                  membre:     d.member_name,
                  type:       SUBTYPE_CFG[d.depositSubtype]?.label ?? '—',
                  detail:     d.source,
                  montant:    Number(d.montantTransaction),
                  statut:     STATUS_CFG[d.status]?.label ?? '—',
                  caisse:     d.caisse_numero,
                  traite_par: d.processed_by,
                  valide_par: d.validated_by,
                  date:       d.created_at?.split('T')[0] ?? '—',
                }))}
              filename="depots_selection"
              headerLabels={{
                code:       'Code',
                compte:     'N° de compte',
                membre:     'Membre',
                type:       'Type',
                detail:     'Source',
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
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-scroll overflow-x-auto">
        <div className="min-w-[950px]">

          {/* En-têtes de colonnes */}
          <div
            className="grid items-center px-5 py-3 border-b border-gray-200 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
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
                key={col.field}
                onClick={() => toggleSort(col.field)}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left text-gray-600 hover:text-[#1B5E20] cursor-pointer transition-colors"
              >
                {col.label}
                <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
              </button>
            ))}
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-gray-50">

            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-full bg-[#DDEAD5] flex items-center justify-center mb-3">
                  <ArrowDownLeft className="w-7 h-7 text-[#2E7D32]" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Aucun dépôt trouvé</p>
                <p className="text-xs text-gray-400">Modifiez vos critères pour voir plus de résultats</p>
              </div>
            )}

            {!loading && paginated.map(d => {
              const st      = STATUS_CFG[d.status]          ?? STATUS_CFG.en_attente;
              const sub     = SUBTYPE_CFG[d.depositSubtype] ?? SUBTYPE_CFG.other;
              const SubIcon = sub.icon;
              const isSel   = selected.has(d.id);

              return (
                <div
                  key={d.id}
                  className={`grid items-center px-5 py-3.5 border-l-2 transition-colors ${
                    isSel ? 'bg-[#DDEAD5]/50 border-[#2E7D32]' : 'border-transparent hover:bg-[#DDEAD5]/10'
                  }`}
                  style={{ gridTemplateColumns: GRID }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => toggleRow(d.id)}
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSel ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                      }`}
                    >
                      {isSel && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </button>
                  </div>

                  {/* Membre + compte */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase text-[#2E7D32]">{d.member_name?.[0] ?? '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight capitalize">{d.member_name ?? '—'}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{d.idCompte}</p>
                    </div>
                  </div>

                  {/* Type + source */}
                  <div className="min-w-0 flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold w-fit ${sub.bg} ${sub.text}`}>
                      <SubIcon className="w-3 h-3 shrink-0" />{sub.label}
                    </span>
                    {d.source && <p className="text-xs text-gray-400 truncate">{d.source}</p>}
                  </div>

                  {/* Montant + code */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#2E7D32]">+{formatHTG(d.montantTransaction)}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{d.codeAutorisation}</p>
                  </div>

                  {/* Statut */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  {/* Caisse */}
                  <div>
                    {d.caisse_numero ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                        <Hash className="w-2.5 h-2.5" />{d.caisse_numero}
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{formatDate(d.created_at)}</p>
                    <p className="text-xs text-gray-400">{formatTime(d.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="Voir les détails"
                      onClick={() => onView(d)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-[#EBF2F8] hover:text-[#355C7D] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {d.holdPeriod > 0 && (
                      <span
                        title={`Fonds bloqués ${d.holdPeriod} jour${d.holdPeriod > 1 ? 's' : ''}`}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium bg-[#FEF9EC] text-[#B45309]"
                      >
                        <Clock className="w-2.5 h-2.5" />{d.holdPeriod}j
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Pied ── */}
      {!loading && sorted.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={sorted.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}