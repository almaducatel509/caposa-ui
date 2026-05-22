"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, Upload, Filter, Calendar, Tag,
  Banknote, X, ChevronDown, TrendingUp,
} from 'lucide-react';
import { LoanData } from '../transactions/validation/loanSchema';

export type LoanFilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year';
export type LoanFilterType   = 'all' | 'agriculture' | 'commerce' | 'logement' | 'education' | 'sante'
                             | 'elevage' | 'equipement' | 'scolaire' | 'personnel' | 'autre';
export type LoanFilterRange  = 'all' | 'small' | 'medium' | 'large' | 'xlarge';

interface LoanFilterBarProps {
  filterValue:    string;
  selectedPeriod: LoanFilterPeriod;
  selectedType:   LoanFilterType;
  selectedRange:  LoanFilterRange;

  onSearchChange: (value?: string) => void;
  onClear:        () => void;
  onPeriodChange: (key: LoanFilterPeriod) => void;
  onTypeChange:   (key: LoanFilterType) => void;
  onRangeChange:  (key: LoanFilterRange) => void;

  onAdd:     () => void;
  onImport?: () => void;

  totalCount:    number;
  importLoading?: boolean;
  loans: LoanData[];
}

// ─── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown: React.FC<{
  trigger:  React.ReactNode;
  children: React.ReactNode;
}> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(o => !o)}>{trigger}</div>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[220px] max-h-[320px] overflow-y-auto">
          {React.Children.map(children, child => (
            <div onClick={() => setIsOpen(false)}>{child}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const LoanFilterBar: React.FC<LoanFilterBarProps> = ({
  filterValue,
  selectedPeriod,
  selectedType,
  selectedRange,
  onSearchChange,
  onClear,
  onPeriodChange,
  onTypeChange,
  onRangeChange,
  onAdd,
  onImport,
  totalCount,
  importLoading = false,
  loans,
}) => {

  const periodOptions: { key: LoanFilterPeriod; label: string; icon: React.ElementType }[] = [
    { key: 'all',    label: 'Toutes périodes', icon: Filter   },
    { key: 'today',  label: "Aujourd'hui",     icon: Calendar },
    { key: 'week',   label: '7 derniers jours', icon: Calendar },
    { key: 'month',  label: 'Ce mois',          icon: Calendar },
    { key: 'year',   label: 'Cette année',      icon: Calendar },
  ];

  const typeOptions: { key: LoanFilterType; label: string }[] = [
    { key: 'all',         label: 'Tous les types' },
    { key: 'agriculture', label: 'Agriculture'    },
    { key: 'commerce',    label: 'Commerce'       },
    { key: 'logement',    label: 'Logement'       },
    { key: 'education',   label: 'Éducation'      },
    { key: 'sante',       label: 'Santé'          },
    { key: 'elevage',     label: 'Élevage'        },
    { key: 'equipement',  label: 'Équipement'     },
    { key: 'scolaire',    label: 'Scolaire'       },
    { key: 'personnel',   label: 'Personnel'      },
    { key: 'autre',       label: 'Autre'          },
  ];

  const rangeOptions: { key: LoanFilterRange; label: string }[] = [
    { key: 'all',    label: 'Tous montants'       },
    { key: 'small',  label: '< 10 000 HTG'        },
    { key: 'medium', label: '10 000 – 50 000 HTG' },
    { key: 'large',  label: '50 000 – 100 000 HTG'},
    { key: 'xlarge', label: '> 100 000 HTG'       },
  ];

  const getPeriodLabel = () => periodOptions.find(o => o.key === selectedPeriod)?.label ?? 'Période';
  const getTypeLabel   = () => typeOptions.find(o => o.key === selectedType)?.label     ?? 'Type';
  const getRangeLabel  = () => rangeOptions.find(o => o.key === selectedRange)?.label   ?? 'Montant';

  const activeCount = [
    selectedPeriod !== 'all',
    selectedType   !== 'all',
    selectedRange  !== 'all',
  ].filter(Boolean).length;

  const handleReset = () => {
    onPeriodChange('all');
    onTypeChange('all');
    onRangeChange('all');
  };
// ── Export : transforme les prêts en lignes prêtes pour CSV ──
  const TYPE_LABELS_EXPORT: Record<string, string> = {
    agriculture: 'Agriculture',
    commerce:    'Commerce',
    logement:    'Logement',
    elevage:     'Élevage',
    equipement:  'Équipement',
    scolaire:    'Scolaire',
    personnel:   'Personnel',
  };

  const PURPOSE_LABELS_EXPORT: Record<string, string> = {
    achat_marchandises: 'Achat de marchandises',
    fonds_roulement:    'Fonds de roulement',
    construction:       'Construction',
    reparation_maison:  'Réparation maison',
    plantation:         'Plantation',
    elevage:            'Élevage',
    scolarite:          'Scolarité',
    urgence:            'Urgence',
    equipement:         'Équipement',
  };

  const STATUS_LABELS_EXPORT: Record<string, string> = {
    en_attente: 'En attente',
    approuve:   'Approuvé',
    decaisse:   'Décaissé',
    rembourse:  'Remboursé',
    rejete:     'Rejeté',
    annule:     'Annulé',
  };

  const loansForExport = loans.map(loan => ({
    id_loan:           loan.id_loan,
    membre:            loan.member_name,
    id_membre:         loan.id_member,
    compte:            loan.account_number,
    type:              TYPE_LABELS_EXPORT[loan.loan_type]    ?? loan.loan_type,
    montant:           loan.amount,
    taux_interet:      `${loan.interest_rate}%`,
    duree_mois:        loan.duration_months,
    mensualite:        Math.round(loan.monthly_payment),
    montant_total:     Math.round(loan.total_amount),
    paiements_faits:   `${loan.payments_made}/${loan.duration_months}`,
    total_paye:        Math.round(loan.total_paid ?? 0),
    solde_restant:     Math.round(loan.remaining_balance),
    progression:       `${loan.progress_pct}%`,
    jours_retard:      loan.late_days,
    statut:            STATUS_LABELS_EXPORT[loan.status]     ?? loan.status,
    date_demande:      loan.created_at?.split('T')[0]        ?? '—',
    date_approbation:  loan.approved_at?.split('T')[0]       ?? '—',
    date_decaissement: loan.disbursed_at?.split('T')[0]      ?? '—',
    date_cloture:      loan.closed_at?.split('T')[0]         ?? '—',
    agent_credit:      loan.processed_by ?? '—',
    superviseur:       loan.validated_by ?? '—',
    caisse:            loan.caisse_numero,
  }));
  return (
    <div className="flex flex-col gap-4">

      {/* ── Ligne 1 : Recherche + Actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        {/* Barre de recherche */}
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher par membre, ID, n° de prêt…"
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent hover:border-[#2E7D32]/40 transition-all shadow-sm"
          />
          {filterValue && (
            <button
              onClick={() => { onSearchChange(''); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau prêt
          </button>
          {onImport && (
            <button
              onClick={onImport}
              disabled={importLoading}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-white border-2 border-[#2E7D32] text-[#2E7D32] text-sm font-medium rounded-xl hover:bg-[#DDEAD5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
                  Import…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importer
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Ligne 2 : Filtres avancés ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-2 flex flex-wrap items-center gap-3">

        {/* Badge résultats */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm text-gray-500">Résultats :</span>
          <span className="bg-[#DDEAD5] text-[#1B5E20] font-bold text-sm px-3 py-0.5 rounded-lg">
            {totalCount}
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* Filtre période */}
        <CustomDropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selectedPeriod !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              {getPeriodLabel()}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {periodOptions.map(o => (
            <button
              key={o.key}
              onClick={() => onPeriodChange(o.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#DDEAD5]/40 transition-colors ${
                selectedPeriod === o.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : 'text-gray-700'
              }`}
            >
              <o.icon className="w-3.5 h-3.5 text-[#2E7D32]" />
              {o.label}
            </button>
          ))}
        </CustomDropdown>

        {/* Filtre type */}
        <CustomDropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selectedType !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Tag className="w-3.5 h-3.5" />
              {getTypeLabel()}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {typeOptions.map(o => (
            <button
              key={o.key}
              onClick={() => onTypeChange(o.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#DDEAD5]/40 transition-colors ${
                selectedType === o.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : 'text-gray-700'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#2E7D32]" />
              {o.label}
            </button>
          ))}
        </CustomDropdown>

        {/* Filtre montant */}
        <CustomDropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selectedRange !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Banknote className="w-3.5 h-3.5" />
              {getRangeLabel()}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {rangeOptions.map(o => (
            <button
              key={o.key}
              onClick={() => onRangeChange(o.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#DDEAD5]/40 transition-colors ${
                selectedRange === o.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : 'text-gray-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2E7D32]" />
              {o.label}
            </button>
          ))}
        </CustomDropdown>

        {/* Badge filtres actifs + reset */}
        {activeCount > 0 && (
          <>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-lg text-xs font-semibold">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-red-600 font-medium px-3 py-1 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoanFilterBar;