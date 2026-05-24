'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight, Building2,
  CheckCircle2, XCircle, AlertCircle, Download, Pencil,
  Grid,
} from 'lucide-react';
import TransferExportModal from './TransferExportModal';
import { TransferData, TransferStatus, TransferType } from '../validation/transfert';
import { TransactionData } from '../types';

interface TransferTableProps {
  transfers: TransferData[];
  loading:   boolean;
  onView:    (t: TransferData) => void;
  onEdit:    (t: TransferData) => void;
  onExport:  (ids: number[]) => Promise<void>;
}

// ─── Constantes ───────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
};

const STATUS_CFG: Record<TransferStatus, { label: string; bg: string; text: string; dot: string }> = {
  approuve:   { label: 'Approuvé',   bg: C.greenPale, text: C.greenDark, dot: C.green   },
  en_attente: { label: 'En attente', bg: '#FEF9EC',   text: '#B45309',   dot: '#F59E0B' },
  en_cours:   { label: 'En cours',   bg: '#EBF2F8',   text: C.blue,      dot: C.blue    },
  echoue:     { label: 'Échoué',     bg: '#FEF2F2',   text: '#B91C1C',   dot: '#EF4444' },
  annule:     { label: 'Annulé',     bg: '#F3F4F6',   text: '#6B7280',   dot: '#9CA3AF' },
};



// Config alignée sur les 2 types du schema : 'interne' | 'externe'
const TYPE_CFG: Record<TransferType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  interne: { icon: ArrowLeftRight, label: 'Interne', color: C.green, bg: C.greenPale },
  externe: { icon: Building2, label: 'Externe', color: C.blue, bg: '#EBF2F8' },
  internal: {
    icon: 'symbol',
    label: '',
    color: '',
    bg: ''
  },
  supplier: {
    icon: 'symbol',
    label: '',
    color: '',
    bg: ''
  },
  loan_payment: {
    icon: 'symbol',
    label: '',
    color: '',
    bg: ''
  }
};

// const COLS = '40px 1.4fr 1.2fr 1.2fr 1fr 1.2fr 1fr 90px';
const GRID = '40px 1.3fr 1.2fr 1fr 0.9fr 1fr 1fr 90px';

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d       = new Date(iso);
  const diffMs  = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH   < 24) return `Il y a ${diffH} h`;
  if (diffD   <  7) return `Il y a ${diffD} j`;
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

// ─── Main ────────────────────────────────────────────────────────

export default function TransferTable({ transfers, loading, onView, onEdit, onExport }: TransferTableProps) {
   const [selected, setSelected] = useState<Set<number>>(new Set());
// ── Tri ───────────────────────────────────────────────────────
  const [sortField, setSortField] = useState('created_at');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => {
    const active = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-[#2E7D32] transition-colors"
      >
        {label}
        <span className="flex flex-col leading-none">
          <span className={`text-[8px] ${active && sortDir === 'asc' ? 'text-[#2E7D32]' : 'text-gray-300'}`}>▲</span>
          <span className={`text-[8px] -mt-0.5 ${active && sortDir === 'desc' ? 'text-[#2E7D32]' : 'text-gray-300'}`}>▼</span>
        </span>
      </button>
    );
  };
  const sorted = useMemo(() => [...transfers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'montant')
      return (a.montant - b.montant) * dir;

    if (sortField === 'status')
      return (a.status ?? '').localeCompare(b.status ?? '') * dir;

    if (sortField === 'typeTransfert')
      return a.typeTransfert.localeCompare(b.typeTransfert) * dir;

    if (sortField === 'reference')
      return (a.reference ?? '').localeCompare(b.reference ?? '') * dir;

    if (sortField === 'description')
      return (a.description ?? '').localeCompare(b.description ?? '') * dir;

    if (sortField === 'caisse')
      return (a.caisse_numero ?? '').localeCompare(b.caisse_numero ?? '') * dir;

    if (sortField === 'created_at')
      return (
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime()
      ) * dir;

    if (sortField === 'dateTransfert')
      return (
        new Date(a.dateTransfert ?? 0).getTime() -
        new Date(b.dateTransfert ?? 0).getTime()
      ) * dir;

    if (sortField === 'member_name')
      return (a.member_name ?? '').localeCompare(b.member_name ?? '') * dir;

    if (sortField === 'destination_name')
      return (a.destination_name ?? '').localeCompare(b.destination_name ?? '') * dir;
    // fallback
    return (a.member_name ?? '').localeCompare(b.member_name ?? '') * dir;

  }), [transfers, sortField, sortDir]);

  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const pendingCount = transfers.filter(t => t.status === 'en_attente').length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(w => w.id)));

  const toggleRow = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Barre sélection ── */}
      {selected.size > 0 && (
        <div className="px-5 py-2.5 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-sm font-semibold text-[#1B5E20]">
            {selected.size} transfert{selected.size > 1 ? 's' : ''}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => onExport([...selected])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#355C7D] text-white rounded-xl hover:bg-[#2a4a65] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête colonnes ── */}
       <div
        className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
        style={{ display: 'grid', gridTemplateColumns: GRID }}
      >
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={someSelected}
            ref={el => { if (el) el.indeterminate = someSelected; }}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer"
          />
        </div>
        <SortHeader field="member_name" label="Membre" />
        <SortHeader field="account_source" label="Comptes" />
        <SortHeader field="reference" label="Référence" />
        {/* <SortHeader field="typeTransfert" label="Type" /> */}
        <SortHeader field="created_at" label="Date" />
        <SortHeader field="status" label="Statut" />    
        <SortHeader field="montant" label="Montant" />

        <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">Actions</div>
      </div>

      {/* ── Corps ── */}
      <div className="divide-y divide-gray-50">

        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} className="grid items-center px-5 py-3.5"         
            style={{ gridTemplateColumns: GRID }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ))}

        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucun virement trouvé</p>
          </div>
        )}
        {!loading && sorted.map(t => {
          const stCfg     = STATUS_CFG[t.status];
          const tpCfg     = TYPE_CFG[t.typeTransfert];
          const TpIcon    = tpCfg.icon;
          const isSel     = selected.has(t.id);
          const TERMINAL  = ['approuve', 'echoue', 'annule'];
          const canEdit   = t.status ? !TERMINAL.includes(t.status) : true;
          const memberLbl = t.member_name ?? t.id_member;
          const initial   = memberLbl.charAt(0).toUpperCase() || '?';

          return (
            <div
              key={t.id}
              className={`grid items-center px-5 py-3 transition-colors border-l-2 ${
                isSel
                  ? 'bg-[#DDEAD5]/50 border-[#2E7D32]'
                  : 'hover:bg-[#DDEAD5]/10 border-transparent'
              }`}
              style={{ gridTemplateColumns: GRID }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleRow(t.id)}
                  className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer"
                />
              </div>

             {/* Membre */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#2E7D32]">{initial}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{memberLbl}</p>
              </div>

              {/* Comptes */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-mono text-gray-600 truncate">{t.account_source}</span>
                <ArrowLeftRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="text-xs font-mono text-gray-600 truncate">{t.account_destination}</span>
              </div>

              {/* Référence */}
              <p className="text-xs font-mono text-gray-500">{t.reference ?? '—'}</p>

              {/* Type */}
              {/* <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit"
                style={{ backgroundColor: tpCfg.bg, color: tpCfg.color }}
              >
                <TpIcon className="w-3 h-3 shrink-0" />{tpCfg.label}
              </span> */}
              {/* Date */}
              <p className="text-xs text-gray-500">{formatDate(t.created_at ?? t.dateTransfert)}</p>
              {/* Montant */}
              <p className="text-sm font-bold text-[#355C7D]">{formatHTG(t.montant)}</p>

              {/* Statut */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                style={{ backgroundColor: stCfg.bg, color: stCfg.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stCfg.dot }} />
                {stCfg.label}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  title="Voir les détails"
                  onClick={() => onView(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors"
                >
                  <EyeIcon />
                </button>
                {canEdit ? (
                  <button
                    title="Modifier ce virement"
                    onClick={() => onEdit(t)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    title="Statut terminal — modification impossible"
                    disabled
                    className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
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
            virement{sorted.length !== 1 ? 's' : ''}
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