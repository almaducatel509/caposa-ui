'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Banknote, FileCheck, HandCoins, MoreHorizontal,
  CheckCircle2, X, ShieldAlert, Hash, Eye,
  ChevronDown, ChevronsUpDown, ChevronUp, Check,
  ArrowUpRight,
} from 'lucide-react';
import { ExportAllButton } from '@/app/ExportAllButton';
import Pagination from '@/app/components/ui/Pagination';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WithdrawalData {
  id:                   string;
  idCompte:             string;
  codeAutorisation:     string;
  montantTransaction:   number;
  withdrawalSubtype:    'counter' | 'check' | 'loan_disbursement' | 'other';
  motif:                string;
  description?:         string;
  requiresVerification: boolean;
  status:               'decaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';
  created_at:           string;
  member_name:          string;
  processed_by:         string;
  validated_by:         string;
  caisse_numero:        string;
  caisse_id:            string;
  session_id:           string;
}

interface WithdrawalTableProps {
  withdrawals: WithdrawalData[];
  loading?:    boolean;
  onView:      (w: WithdrawalData) => void;
  onExport?:   (ids: string[]) => void | Promise<void>;
}

// ─── Config statut & type ─────────────────────────────────────────────────────

const STATUS_CFG: Record<WithdrawalData['status'], { label: string; bg: string; text: string; dot: string }> = {
  decaisse:   { label: 'Décaissé',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  en_attente: { label: 'En attente', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  en_cours:   { label: 'En cours',   bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  echoue:     { label: 'Échoué',     bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  annule:     { label: 'Annulé',     bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]' },
};

const SUBTYPE_CFG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  counter:           { label: 'Comptoir',          icon: Banknote,       bg: 'bg-[#DDEAD5]', text: 'text-[#2E7D32]' },
  check:             { label: 'Chèque',            icon: FileCheck,      bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]' },
  loan_disbursement: { label: 'Décaissement prêt', icon: HandCoins,      bg: 'bg-[#FBF6E7]', text: 'text-[#A8841F]' },
  other:             { label: 'Autre',             icon: MoreHorizontal, bg: 'bg-[#F3F3F3]', text: 'text-[#6E6E6E]' },
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WithdrawalTable({
  withdrawals, loading = false, onView,
}: WithdrawalTableProps) {

  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [sortField,   setSortField]   = useState('created_at');
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  // Retour page 1 + vidage de la sélection quand la liste change
  // (le filtrage est fait par le parent → `withdrawals` change)
  useEffect(() => {
    setCurrentPage(1);
    setSelected(new Set());
  }, [withdrawals, sortField, sortDir, pageSize]);

  // ── Tri ──
  const sorted = useMemo(() => [...withdrawals].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'montant':    return (Number(a.montantTransaction) - Number(b.montantTransaction)) * dir;
      case 'status':     return a.status.localeCompare(b.status) * dir;
      case 'subtype':    return a.withdrawalSubtype.localeCompare(b.withdrawalSubtype) * dir;
      case 'caisse':     return (a.caisse_numero ?? '').localeCompare(b.caisse_numero ?? '') * dir;
      case 'created_at': return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      default:           return (a.member_name ?? '').localeCompare(b.member_name ?? '') * dir;
    }
  }), [withdrawals, sortField, sortDir]);

  // ── Pagination ──
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // ── Sélection ──
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(w => w.id)));
  const toggleRow    = (id: string) => {
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
        <p className="text-sm font-semibold text-gray-800">Liste des retraits</p>
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
              {selected.size} retrait{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ExportAllButton
              data={sorted
                .filter(w => selected.has(w.id))
                .map(w => ({
                  code:       w.codeAutorisation,
                  compte:     w.idCompte,
                  membre:     w.member_name,
                  type:       SUBTYPE_CFG[w.withdrawalSubtype]?.label ?? '—',
                  detail:     w.motif,
                  montant:    Number(w.montantTransaction),
                  statut:     STATUS_CFG[w.status]?.label ?? '—',
                  caisse:     w.caisse_numero,
                  traite_par: w.processed_by,
                  valide_par: w.validated_by,
                  date:       w.created_at?.split('T')[0] ?? '—',
                }))}
              filename="retraits_selection"
              headerLabels={{
                code:       'Code',
                compte:     'N° de compte',
                membre:     'Membre',
                type:       'Type',
                detail:     'Motif',
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
                  <ArrowUpRight className="w-7 h-7 text-[#2E7D32]" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Aucun retrait trouvé</p>
                <p className="text-xs text-gray-400">Modifiez vos critères pour voir plus de résultats</p>
              </div>
            )}

            {!loading && paginated.map(w => {
              const st      = STATUS_CFG[w.status]             ?? STATUS_CFG.en_attente;
              const sub     = SUBTYPE_CFG[w.withdrawalSubtype] ?? SUBTYPE_CFG.other;
              const SubIcon = sub.icon;
              const isSel   = selected.has(w.id);

              return (
                <div
                  key={w.id}
                  className={`grid items-center px-5 py-3.5 border-l-2 transition-colors ${
                    isSel ? 'bg-[#DDEAD5]/50 border-[#2E7D32]' : 'border-transparent hover:bg-[#DDEAD5]/10'
                  }`}
                  style={{ gridTemplateColumns: GRID }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => toggleRow(w.id)}
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
                      <span className="text-xs font-bold uppercase text-[#2E7D32]">{w.member_name?.[0] ?? '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight capitalize">{w.member_name ?? '—'}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{w.idCompte}</p>
                    </div>
                  </div>

                  {/* Type + motif */}
                  <div className="min-w-0 flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold w-fit ${sub.bg} ${sub.text}`}>
                      <SubIcon className="w-3 h-3 shrink-0" />{sub.label}
                    </span>
                    {w.motif && <p className="text-xs text-gray-400 truncate">{w.motif}</p>}
                  </div>

                  {/* Montant + code */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#B91C1C]">−{formatHTG(w.montantTransaction)}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{w.codeAutorisation}</p>
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
                    {w.caisse_numero ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                        <Hash className="w-2.5 h-2.5" />{w.caisse_numero}
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{formatDate(w.created_at)}</p>
                    <p className="text-xs text-gray-400">{formatTime(w.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="Voir les détails"
                      onClick={() => onView(w)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-[#EBF2F8] hover:text-[#355C7D] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {w.requiresVerification && (
                      <span
                        title="Vérification requise"
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium bg-[#FEF9EC] text-[#B45309]"
                      >
                        <ShieldAlert className="w-2.5 h-2.5" />Vérif.
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