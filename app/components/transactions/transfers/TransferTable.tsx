'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeftRight, Repeat, UserRound,
  CheckCircle2, X, Eye,
  ChevronDown, ChevronsUpDown, ChevronUp, Check,
} from 'lucide-react';
import { ExportAllButton } from '@/app/ExportAllButton';
import Pagination from '@/app/components/ui/Pagination';
import type { TransferData } from '../validation/transfert';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransferTableProps {
  transfers: TransferData[];
  loading?:  boolean;
  onView:    (t: TransferData) => void;
  onExport?: (ids: TransferData['id'][]) => void | Promise<void>;
}

// Ligne normalisée (évite les `??` partout dans le rendu)
interface TransferRow {
  raw:        TransferData;
  id:         TransferData['id'];
  member:     string;
  source:     string;
  dest:       string;
  destName:   string;
  reference:  string;
  amount:     number;
  status:     string;
  type:       string;
  motif:      string;
  created_at: string;
}

function normalize(t: TransferData): TransferRow {
  return {
    raw:        t,
    id:         t.id,
    member:     t.member_name ?? '',
    source:     t.account_source ?? '',
    dest:       t.account_destination ?? '',
    destName:   t.destination_name ?? '',
    reference:  t.reference ?? '',
    amount:     Number(t.montant ?? 0),
    status:     String(t.status ?? ''),
    type:       String(t.typeTransfert ?? ''),
    motif:      t.description ?? '',
    created_at: t.created_at ?? t.dateTransfert ?? '',
  };
}

// ─── Config statut & type ─────────────────────────────────────────────────────

type Tone = { label: string; bg: string; text: string; dot: string };

const TONE = {
  ok:      { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  wait:    { bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  run:     { bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  fail:    { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  off:     { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]' },
};

const STATUS_CFG: Record<string, Tone> = {
  approuve:   { label: 'Approuvé',   ...TONE.ok   },
  en_attente: { label: 'En attente', ...TONE.wait },
  en_cours:   { label: 'En cours',   ...TONE.run  },
  echoue:     { label: 'Échoué',     ...TONE.fail },
  annule:     { label: 'Annulé',     ...TONE.off  },
};
const STATUS_FALLBACK: Tone = { label: 'En attente', ...TONE.wait };

const TYPE_CFG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  interne: { label: 'Interne',           icon: Repeat,        bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]' },
  externe: { label: 'Vers autre membre', icon: UserRound,     bg: 'bg-[#FBF6E7]', text: 'text-[#A8841F]' },
  other:   { label: 'Transfert',         icon: ArrowLeftRight, bg: 'bg-[#F3F3F3]', text: 'text-[#6E6E6E]' },
};

// ─── Grille & colonnes ────────────────────────────────────────────────────────
// Checkbox | Membre | Type | Montant | Statut | Comptes | Date | Actions
const GRID = '40px 2fr 1.4fr 1.3fr 1.1fr 1.5fr 1.1fr 96px';

const COLS = [
  { label: 'Membre',  field: 'member_name'    },
  { label: 'Type',    field: 'typeTransfert'  },
  { label: 'Montant', field: 'montant'        },
  { label: 'Statut',  field: 'status'         },
  { label: 'Comptes', field: 'account_source' },
  { label: 'Date',    field: 'created_at'     },
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TransferTable({
  transfers, loading = false, onView,
}: TransferTableProps) {

  const isBusy = loading;
  const rows   = useMemo(() => transfers.map(normalize), [transfers]);

  const [selected,    setSelected]    = useState<Set<TransferData['id']>>(new Set());
  const [sortField,   setSortField]   = useState('created_at');
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  // Retour page 1 + vidage de la sélection quand la liste change
  // (le filtrage est fait par la page → la liste reçue change)
  useEffect(() => {
    setCurrentPage(1);
    setSelected(new Set());
  }, [transfers, sortField, sortDir, pageSize]);

  // ── Tri ──
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'montant':        return (a.amount - b.amount) * dir;
      case 'status':         return a.status.localeCompare(b.status) * dir;
      case 'typeTransfert':  return a.type.localeCompare(b.type) * dir;
      case 'account_source': return a.source.localeCompare(b.source) * dir;
      case 'created_at': return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      default:           return a.member.localeCompare(b.member) * dir;
    }
  }), [rows, sortField, sortDir]);

  // ── Pagination ──
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // ── Sélection ──
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(t => t.id)));
  const toggleRow    = (id: TransferData['id']) => {
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
        <p className="text-sm font-semibold text-gray-800">Liste des transferts</p>
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
              {selected.size} transfert{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ExportAllButton
              data={sorted
                .filter(t => selected.has(t.id))
                .map(t => ({
                  reference:   t.reference,
                  membre:      t.member,
                  source:      t.source,
                  destination: t.dest,
                  beneficiaire: t.destName,
                  type:        (TYPE_CFG[t.type] ?? TYPE_CFG.other).label,
                  montant:     t.amount,
                  statut:      (STATUS_CFG[t.status] ?? STATUS_FALLBACK).label,
                  motif:       t.motif,
                  date:        t.created_at?.split('T')[0] ?? '—',
                }))}
              filename="transferts_selection"
              headerLabels={{
                reference:   'Référence',
                membre:      'Membre',
                source:      'Compte source',
                destination: 'Compte destination',
                beneficiaire: 'Bénéficiaire',
                type:        'Type',
                montant:     'Montant (HTG)',
                statut:      'Statut',
                motif:       'Motif',
                date:        'Date',
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
        <div className="min-w-[1000px]">

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

            {isBusy && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!isBusy && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-full bg-[#DDEAD5] flex items-center justify-center mb-3">
                  <ArrowLeftRight className="w-7 h-7 text-[#2E7D32]" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Aucun transfert trouvé</p>
                <p className="text-xs text-gray-400">Modifiez vos critères pour voir plus de résultats</p>
              </div>
            )}

            {!isBusy && paginated.map(t => {
              const st      = STATUS_CFG[t.status] ?? STATUS_FALLBACK;
              const typ     = TYPE_CFG[t.type]     ?? TYPE_CFG.other;
              const TypIcon = typ.icon;
              const isSel   = selected.has(t.id);

              return (
                <div
                  key={t.id}
                  className={`grid items-center px-5 py-3.5 border-l-2 transition-colors ${
                    isSel ? 'bg-[#DDEAD5]/50 border-[#2E7D32]' : 'border-transparent hover:bg-[#DDEAD5]/10'
                  }`}
                  style={{ gridTemplateColumns: GRID }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => toggleRow(t.id)}
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSel ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                      }`}
                    >
                      {isSel && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </button>
                  </div>

                  {/* Membre + compte source */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase text-[#2E7D32]">{t.member?.[0] ?? '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight capitalize">{t.member || '—'}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{t.source || '—'}</p>
                    </div>
                  </div>

                  {/* Type + motif */}
                  <div className="min-w-0 flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold w-fit ${typ.bg} ${typ.text}`}>
                      <TypIcon className="w-3 h-3 shrink-0" />{typ.label}
                    </span>
                    {t.motif && <p className="text-xs text-gray-400 truncate">{t.motif}</p>}
                  </div>

                  {/* Montant + référence */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#355C7D]">{formatHTG(t.amount)}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{t.reference}</p>
                  </div>

                  {/* Statut */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  {/* Comptes : source → destination (sur 2 lignes, sans troncature) */}
                  <div className="min-w-0 font-mono text-xs leading-5">
                    <p className="text-gray-700 whitespace-nowrap">{t.source || '—'}</p>
                    <p className="text-gray-400 whitespace-nowrap">→ {t.dest || '—'}</p>
                    {t.type === 'externe' && t.destName && (
                      <p className="font-sans text-gray-400 truncate capitalize">{t.destName}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{formatDate(t.created_at)}</p>
                    <p className="text-xs text-gray-400">{formatTime(t.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="Voir les détails"
                      onClick={() => onView(t.raw)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-[#EBF2F8] hover:text-[#355C7D] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Pied ── */}
      {!isBusy && sorted.length > 0 && (
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