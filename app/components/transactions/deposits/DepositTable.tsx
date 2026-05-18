'use client';

import React, { useState } from 'react';
import {
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  CheckCircle2, XCircle, Pencil,
  Download,
  Clock,
  Loader2,
} from 'lucide-react';
import DepositExportModal from './DepositExportModal';

// ─── Types ────────────────────────────────────────────────────────

export interface DepositData {
  id:                 number;
  idCompte:           string;
  codeAutorisation:   string;
  montantTransaction: number;
  depositSubtype:     'cash' | 'check' | 'transfer' | 'other';
  source:             string;
  description?:       string;
  holdPeriod:         number;
  status:             'encaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';
  created_at:         string;
  member_name:        string;
  processed_by:       string;
  validated_by:       string;
  caisse_numero:      string;
  caisse_id:          string;
  session_id:         string;
  session_statut:     'ouverte' | 'fermée';
}

interface DepositTableProps {
  deposits:  DepositData[];
  loading:   boolean;
  onView:    (dep: DepositData) => void;
  onEdit:    (dep: DepositData) => void;
  onExport:  (ids: number[]) => Promise<void>;  

}

// ─── Constantes ───────────────────────────────────────────────────

const C = {
  green:     '#2E7D32',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};
const STATUS_CFG: Record<DepositData['status'], { label: string; bg: string; text: string; dot: string; icon: any }> = {
  encaisse:   { label: 'Encaissé',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', icon: CheckCircle2 },
  en_attente: { label: 'En attente', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]', icon: Clock        },
  en_cours:   { label: 'En cours',   bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]', icon: Loader2      },
  echoue:     { label: 'Échoué',     bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]', icon: XCircle      },
  annule:     { label: 'Annulé',     bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]', icon: XCircle      },
};  
const SUBTYPE_CFG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  cash:     { icon: Banknote,       label: 'Espèces',  color: C.green, bg: C.greenPale },
  check:    { icon: FileCheck,      label: 'Chèque',   color: C.blue,  bg: '#EBF2F8'   },
  transfer: { icon: ArrowLeftRight, label: 'Virement', color: C.gold,  bg: '#FBF6E7'   },
  other:    { icon: MoreHorizontal, label: 'Autre',    color: '#6E6E6E', bg: '#F3F3F3' },
};

const COLS = '40px 1.4fr 1.2fr 1fr 1fr 1.2fr 1fr 110px';

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(iso: string) {
  const d      = new Date(iso);
  const now    = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH   < 24) return `Il y a ${diffH} h`;
  if (diffD   <  7) return `Il y a ${diffD} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Icône Voir ───────────────────────────────────────────────────

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

export default function DepositTable({ deposits, loading, onView, onEdit, onExport }: DepositTableProps) {
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('all');
  const [subtypeF, setSubtypeF] = useState('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = deposits.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      d.member_name.toLowerCase().includes(q) ||
      d.source.toLowerCase().includes(q)       ||
      d.idCompte.toLowerCase().includes(q);
    return matchSearch &&
      (statusF  === 'all' || d.status        === statusF)  &&
      (subtypeF === 'all' || d.depositSubtype === subtypeF);
  });

  const pendingCount = deposits.filter(d => d.status === 'en_attente').length;
  const allSel  = selected.size === filtered.length && filtered.length > 0;
  const someSel = selected.size > 0 && !allSel;

  const toggleAll = () =>
    allSel ? setSelected(new Set()) : setSelected(new Set(filtered.map(d => d.id)));

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
          <p className="text-sm font-semibold text-gray-800">Liste des dépôts</p>
          <p className="text-xs text-gray-400">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
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
        {['Membre', 'Compte', 'Type', 'Source', 'Montant', 'Statut', 'Actions'].map(col => (
          <div key={col} className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {col}
          </div>
        ))}
      </div>

      {/* ── Corps ── */}
      <div className="divide-y divide-gray-50">

        {/* Squelette chargement */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: COLS }}>
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ))}

        {/* Vide */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucun dépôt trouvé</p>
          </div>
        )}

        {/* Lignes */}
        {!loading && filtered.map(dep => {
          const stCfg   = STATUS_CFG[dep.status]          ?? STATUS_CFG['en_attente'];
          const subCfg  = SUBTYPE_CFG[dep.depositSubtype]  ?? SUBTYPE_CFG['other'];
          const SubIcon = subCfg.icon;
          const isSel   = selected.has(dep.id);
          // const canEdit = dep.session_statut === 'ouverte';
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
              style={{ gridTemplateColumns: COLS }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleRow(dep.id)}
                  className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer"
                />
              </div>

              {/* Membre */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#2E7D32]">{dep.member_name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{dep.member_name}</p>
                  <p className="text-xs text-gray-400">{formatDate(dep.created_at)}</p>
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

              {/* Source */}
              <p className="text-xs text-gray-500 truncate">{dep.source}</p>

              {/* Montant */}
              <p className="text-sm font-bold text-[#2E7D32]">+{formatHTG(dep.montantTransaction)}</p>

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

                {/* Voir */}
                <button
                  title="Voir les détails"
                  onClick={() => onView(dep)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors"
                >
                  <EyeIcon />
                </button>

                {/* Edit */}
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
                    title={
                      isLocked
                        ? 'Dépôt encaissé — modification impossible'
                        : 'Session fermée — modification non autorisée'
                    }
                    disabled
                    className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Badge hold */}
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
      {!loading && filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{filtered.length}</span>{' '}
            dépôt{filtered.length !== 1 ? 's' : ''}
          </p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            {pendingCount} en attente
          </span>
        </div>
      )}
       <DepositExportModal
        open={exportOpen}
        deposits={filtered.filter(d => selected.has(d.id))}
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