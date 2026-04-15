'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight, Building2, Landmark, MoreHorizontal,
  CheckCircle2, XCircle, AlertCircle, Download, Pencil,
} from 'lucide-react';
import { STATUS_CFG } from '@/config/statusConfig';
import TransferExportModal from './TransferExportModal';

// ─── Types ────────────────────────────────────────────────────────

export interface TransferData {
  id:                number;
  compteSource:      string;
  compteDestination: string;
  montant:           number;
  reference:         string;
  type:              'internal' | 'supplier' | 'loan_payment';
  description?:      string;
  memberName:        string;
  status:            'decaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';
  created_at:        string;
  processed_by:      string;
  validated_by:      string;
  caisse_numero:     string;
  caisse_id:         string;
  session_id:        string;
}

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
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};

const TYPE_CFG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  internal:     { icon: ArrowLeftRight, label: 'Entre comptes', color: C.green,   bg: C.greenPale },
  supplier:     { icon: Building2,      label: 'Fournisseur',   color: C.blue,    bg: '#EBF2F8'   },
  loan_payment: { icon: Landmark,       label: 'Remb. prêt',    color: C.gold,    bg: '#FBF6E7'   },
  other:        { icon: MoreHorizontal, label: 'Autre',         color: '#6E6E6E', bg: '#F3F3F3'   },
};

const COLS = '40px 1.4fr 1.2fr 1.2fr 1fr 1.2fr 1fr 90px';

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(iso: string) {
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
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('all');
  const [typeF,      setTypeF]      = useState('all');
  const [selected,   setSelected]   = useState<Set<number>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = transfers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      t.memberName.toLowerCase().includes(q) ||
      t.reference.toLowerCase().includes(q)   ||
      t.compteSource.toLowerCase().includes(q);
    return matchSearch &&
      (statusF === 'all' || t.status === statusF) &&
      (typeF   === 'all' || t.type   === typeF);
  });

  const pendingCount = transfers.filter(t => t.status === 'en_attente').length;
  const allSel  = selected.size === filtered.length && filtered.length > 0;
  const someSel = selected.size > 0 && !allSel;

  const toggleAll = () =>
    allSel ? setSelected(new Set()) : setSelected(new Set(filtered.map(t => t.id)));

  const toggleRow = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── En-tête + filtres ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Liste des virements</p>
          <p className="text-xs text-gray-400">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Membre, référence…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-3 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] w-44"
          />
          <select
            value={statusF}
            onChange={e => setStatusF(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] text-gray-600"
          >
            <option value="all">Tous statuts</option>
            <option value="decaisse">Complété</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="echoue">Échoué</option>
            <option value="annule">Annulé</option>
          </select>
          <select
            value={typeF}
            onChange={e => setTypeF(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] text-gray-600"
          >
            <option value="all">Tous types</option>
            <option value="internal">Entre comptes</option>
            <option value="supplier">Fournisseur</option>
            <option value="loan_payment">Remb. prêt</option>
          </select>
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
            <button
              onClick={() => setExportOpen(true)}
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
        className="grid items-center px-5 py-3 border-b border-gray-100 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
        style={{ gridTemplateColumns: COLS }}
      >
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={allSel}
            ref={el => { if (el) el.indeterminate = someSel; }}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer"
          />
        </div>
        {['Membre', 'Comptes', 'Référence', 'Type', 'Montant', 'Statut', 'Actions'].map(col => (
          <div key={col} className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {col}
          </div>
        ))}
      </div>

      {/* ── Corps ── */}
      <div className="divide-y divide-gray-50">

        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: COLS }}>
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucun virement trouvé</p>
          </div>
        )}

        {!loading && filtered.map(t => {
          const stCfg  = STATUS_CFG[t.status] ?? STATUS_CFG['en_attente'];
          const tpCfg  = TYPE_CFG[t.type]     ?? TYPE_CFG['other'];
          const TpIcon = tpCfg.icon;
          const isSel  = selected.has(t.id);
          const TERMINAL = ['decaisse', 'echoue', 'annule'];
          const canEdit  = !TERMINAL.includes(t.status);

          return (
            <div
              key={t.id}
              className={`grid items-center px-5 py-3 transition-colors border-l-2 ${
                isSel
                  ? 'bg-[#DDEAD5]/50 border-[#2E7D32]'
                  : 'hover:bg-[#DDEAD5]/10 border-transparent'
              }`}
              style={{ gridTemplateColumns: COLS }}
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
                  <span className="text-xs font-bold text-[#2E7D32]">{t.memberName[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.memberName}</p>
                  <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                </div>
              </div>

              {/* Comptes */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-mono text-gray-600 truncate">{t.compteSource}</span>
                <ArrowLeftRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="text-xs font-mono text-gray-600 truncate">{t.compteDestination}</span>
              </div>

              {/* Référence */}
              <p className="text-xs font-mono text-gray-500">{t.reference}</p>

              {/* Type */}
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit"
                style={{ backgroundColor: tpCfg.bg, color: tpCfg.color }}
              >
                <TpIcon className="w-3 h-3 shrink-0" />{tpCfg.label}
              </span>

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
      {!loading && filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{filtered.length}</span>{' '}
            virement{filtered.length !== 1 ? 's' : ''}
          </p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            {pendingCount} en attente
          </span>
        </div>
      )}

      <TransferExportModal
        open={exportOpen}
        transfers={filtered.filter(t => selected.has(t.id))}
        onClose={() => setExportOpen(false)}
        onConfirm={async (ids) => {
          await onExport(ids);
          setSelected(new Set());
          setExportOpen(false);
        }}
      />
    </div>
  );
}