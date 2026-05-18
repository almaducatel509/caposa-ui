'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X,
  ChevronDown,
  ArrowLeftRight, ArrowRightLeft, Building2,
  BadgeCheck, CheckCircle2, Clock, Loader2, XCircle, Ban,
  Plus, RefreshCw,
} from 'lucide-react';
import { ExportAllButton } from '@/app/ExportAllButton';
import type { TransferData } from '../validation/transfert';

interface TransferFilterBarProps {
  filterValue:    string;
  selectedType:   string;
  selectedStatus: string;
  selectedPeriod: 'day' | 'week' | 'month';
  totalCount:     number;
  loading?:       boolean;
  onSearchChange: (v: string) => void;
  onClear:        () => void;
  onTypeChange:   (v: string) => void;
  onStatusChange: (v: string) => void;
  onPeriodChange: (v: 'day' | 'week' | 'month') => void;
  onAdd:          () => void;
  onRefresh:      () => void;
  transfers:      TransferData[];
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[200px]">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const TransferFilterBar: React.FC<TransferFilterBarProps> = ({
  filterValue, selectedType, selectedStatus, selectedPeriod, totalCount, loading = false,
  onSearchChange, onClear, onTypeChange, onStatusChange, onPeriodChange,
  onAdd, onRefresh, transfers,
}) => {

  // 🏛️ Types officiels CAPOSA — 2 valeurs uniquement
  // interne : compte A → compte B du même membre
  // externe : compte A → compte B d'un autre membre CAPOSA
  const TYPE_OPTIONS = [
    { key: 'all',     label: 'Tous les types', icon: ArrowLeftRight  },
    { key: 'interne', label: 'Interne',        icon: ArrowRightLeft  },
    { key: 'externe', label: 'Externe',        icon: Building2       },
  ];

  const STATUS_OPTIONS = [
    { key: 'all',        label: 'Tous les statuts', icon: CheckCircle2 },
    { key: 'approuve',   label: 'Approuvé',         icon: BadgeCheck   },
    { key: 'en_attente', label: 'En attente',       icon: Clock        },
    { key: 'en_cours',   label: 'En cours',         icon: Loader2      },
    { key: 'echoue',     label: 'Échoué',           icon: XCircle      },
    { key: 'annule',     label: 'Annulé',           icon: Ban          },
  ];

  const typeLabel   = TYPE_OPTIONS.find(o => o.key === selectedType)?.label     ?? 'Tous les types';
  const statusLabel = STATUS_OPTIONS.find(o => o.key === selectedStatus)?.label ?? 'Tous les statuts';
  const activeCount = (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

  // ── Export : transforme les transferts en lignes prêtes pour CSV ──
  const transfersForExport = transfers.map(t => {
    const typeLbl =
      t.typeTransfert === 'interne' ? 'Interne' :
      t.typeTransfert === 'externe' ? 'Externe' : '—';

    const statutLbl =
      t.status === 'approuve'   ? 'Approuvé'   :
      t.status === 'en_attente' ? 'En attente' :
      t.status === 'en_cours'   ? 'En cours'   :
      t.status === 'echoue'     ? 'Échoué'     :
      t.status === 'annule'     ? 'Annulé'     : '—';

    return {
      id_transfer:         t.id,
      reference:           t.reference ?? '—',
      membre:              t.member_name ?? t.id_member,
      account_source:      t.account_source,
      account_destination: t.account_destination,
      destination_name:    t.destination_name ?? '—',
      type:                typeLbl,
      montant:             t.montant,
      statut:              statutLbl,
      description:         t.description ?? '—',
      caisse:              t.caisse_numero ?? '—',
      traite_par:          t.processed_by ?? '—',
      valide_par:          t.validated_by ?? '—',
      date:                (t.dateTransfert ?? t.created_at)?.split('T')[0] ?? '—',
    };
  });

  return (
    <div className="space-y-3">

      {/* ── Ligne 1 : recherche + actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Référence, compte source/destination, membre…"
            className="w-full h-10 pl-10 pr-10 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] placeholder:text-gray-400 transition-all"
          />
          {filterValue && (
            <button
              onClick={() => { onSearchChange(''); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau transfert
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <ExportAllButton
            data={transfersForExport}
            filename="transferts"
            columns={[
              'id_transfer', 'reference', 'membre',
              'account_source', 'account_destination', 'destination_name',
              'type', 'montant', 'statut', 'description',
              'caisse', 'traite_par', 'valide_par', 'date',
            ]}
            headerLabels={{
              id_transfer:         'N° de transfert',
              reference:           'Référence',
              membre:              'Initiateur',
              account_source:      'Compte source',
              account_destination: 'Compte destination',
              destination_name:    'Bénéficiaire',
              type:                'Type',
              montant:             'Montant (HTG)',
              statut:              'Statut',
              description:         'Description',
              caisse:              'Caisse',
              traite_par:          'Traité par',
              valide_par:          'Validé par',
              date:                'Date',
            }}
            separator=";"
          />
        </div>
      </div>

      {/* ── Ligne 2 : filtres ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats</span>
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#DDEAD5] text-[#1B5E20]">
            {totalCount}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Filtre période */}
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedPeriod === p
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'day' ? "Aujourd'hui" : p === 'week' ? '7 jours' : '30 jours'}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Filtre type */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              selectedType !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {typeLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {TYPE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onTypeChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                  selectedType === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 text-[#2E7D32]" />
                {opt.label}
              </button>
            );
          })}
        </Dropdown>

        {/* Filtre statut */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              selectedStatus !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <BadgeCheck className="w-3.5 h-3.5" />
              {statusLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {STATUS_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onStatusChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                  selectedStatus === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 text-[#2E7D32]" />
                {opt.label}
              </button>
            );
          })}
        </Dropdown>

        {/* Réinitialiser */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { onTypeChange('all'); onStatusChange('all'); }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferFilterBar;