'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, CheckCircle2, Clock, Check, X,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Users, Banknote, FileCheck, HandCoins, MoreHorizontal,
  Loader2, XCircle, ArrowDownLeft,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WithdrawalData {
  id:                   number;
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
  session_statut:       'ouverte' | 'fermée';
}

interface WithdrawalTableProps {
  withdrawals: WithdrawalData[];
  loading?:    boolean;
  onView:      (w: WithdrawalData) => void;
  onEdit:      (w: WithdrawalData) => void;
  onExport:    (ids: number[]) => Promise<void>;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5',
  blue:  '#355C7D', gold: '#D4AF37',
};

// ─── Config statut & type ─────────────────────────────────────────────────────
const STATUS_CFG: Record<WithdrawalData['status'], { label: string; bg: string; text: string; dot: string; icon: any }> = {
  decaisse:   { label: 'Décaissé',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', icon: CheckCircle2 },
  en_attente: { label: 'En attente', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]', icon: Clock        },
  en_cours:   { label: 'En cours',   bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]', icon: Loader2      },
  echoue:     { label: 'Échoué',     bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]', icon: XCircle      },
  annule:     { label: 'Annulé',     bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]', icon: XCircle      },
};  

const SUBTYPE_CFG: Record<WithdrawalData['withdrawalSubtype'], { label: string; icon: any }> = {
  counter:           { label: 'Comptoir',          icon: Banknote       },
  check:             { label: 'Chèque',            icon: FileCheck      },
  loan_disbursement: { label: 'Décaissement prêt', icon: HandCoins      },
  other:             { label: 'Autre',             icon: MoreHorizontal },
};

// ─── Grid layout ──────────────────────────────────────────────────────────────
const GRID = '40px 2fr 1.2fr 1.4fr 1.2fr 1.5fr 1fr 120px';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── SortIcon ─────────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WithdrawalTable({
  withdrawals, loading = false, onView, onEdit, onExport,
}: WithdrawalTableProps) {

  // ── Tri ───────────────────────────────────────────────────────
  const [sortField, setSortField] = useState('created_at');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // ── Sélection ─────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ── Liste triée ───────────────────────────────────────────────
  const sorted = useMemo(() => [...withdrawals].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'montant')   return (a.montantTransaction - b.montantTransaction) * dir;
    if (sortField === 'status')    return a.status.localeCompare(b.status) * dir;
    if (sortField === 'subtype')   return a.withdrawalSubtype.localeCompare(b.withdrawalSubtype) * dir;
    if (sortField === 'motif')     return (a.motif ?? '').localeCompare(b.motif ?? '') * dir;
    if (sortField === 'caisse')    return a.caisse_numero.localeCompare(b.caisse_numero) * dir;
    if (sortField === 'created_at')
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    return a.member_name.localeCompare(b.member_name) * dir;
  }), [withdrawals, sortField, sortDir]);

  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(w => w.id)));
  const toggleRow    = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  // ── Colonnes ──────────────────────────────────────────────────
  const COLS = [
    { label: 'Membre',  field: 'member_name' },
    { label: 'Type',    field: 'subtype'     },
    { label: 'Montant', field: 'montant'     },
    { label: 'Statut',  field: 'status'      },
    { label: 'Motif',   field: 'motif'       },
    { label: 'Date',    field: 'created_at'  },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

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
            <button
              onClick={() => onExport([...selected])}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Exporter la sélection
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-têtes ── */}
      <div
        className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
        style={{ display: 'grid', gridTemplateColumns: GRID }}
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

        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">
          Actions
        </span>
      </div>

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">
        {loading && (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-6 h-6 animate-spin text-[#2E7D32]" />
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-[#DDEAD5] flex items-center justify-center mb-3">
              <ArrowDownLeft className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Aucun retrait trouvé</p>
            <p className="text-xs text-gray-400">Modifiez vos critères pour voir plus de résultats</p>
          </div>
        )}

        {!loading && sorted.map((w, i) => {
          const cfg        = STATUS_CFG[w.status];
          const sub        = SUBTYPE_CFG[w.withdrawalSubtype];
          const SubIcon    = sub.icon;
          const isSelected = selected.has(w.id);

          return (
            <div
              key={w.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${
                isSelected
                  ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : i % 2 === 0
                    ? 'bg-white hover:bg-[#DDEAD5]/10'
                    : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
              }`}
              style={{ gridTemplateColumns: GRID }}
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => toggleRow(w.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#2E7D32] border-[#2E7D32]'
                      : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* Membre */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight text-gray-900">
                    {w.member_name}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{w.idCompte}</p>
                </div>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2">
                <SubIcon className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                <p className="text-xs font-medium text-gray-700 truncate">{sub.label}</p>
              </div>

              {/* Montant */}
              <div>
                <p className="text-sm font-bold text-gray-800">{formatHTG(w.montantTransaction)}</p>
                <p className="text-xs text-gray-400 font-mono">{w.codeAutorisation}</p>
              </div>

              {/* Statut */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Motif */}
              <div className="min-w-0">
                <p className="text-xs text-gray-700 truncate">{w.motif}</p>
                <p className="text-xs text-gray-400 truncate">Caisse {w.caisse_numero}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-semibold text-gray-700">{formatDate(w.created_at)}</p>
                <p className="text-xs text-gray-400">
                  {new Date(w.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button
                  title="Voir"
                  onClick={() => onView(w)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Modifier"
                  onClick={() => onEdit(w)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-[#DDEAD5] hover:text-[#2E7D32] transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!loading && sorted.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span> retrait{sorted.length !== 1 ? 's' : ''} affiché{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}