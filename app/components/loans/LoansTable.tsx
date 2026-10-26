'use client';

/**
 * LoansTable.tsx — registre des prêts
 * ─────────────────────────────────────────────────────────────────
 * Données réelles via GET /loans/ (aucun mock). Après chaque action,
 * la liste est rechargée depuis le backend (aucune mise à jour optimiste).
 *
 * Actions disponibles maintenant : créer, voir, approuver, rejeter
 * (en ligne ou en lot). Décaisser et rembourser restent désactivés
 * tant que le backend ne bouge pas l'argent (contrat, points 5 et 6).
 *
 * Aucun calcul financier : solde, échéance et retard s'affichent
 * s'ils viennent du backend, sinon « — ».
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye, Users, CheckCircle2, AlertTriangle, Clock, Check, X, Archive,
  ShieldAlert, ChevronDown, ChevronUp, ChevronsUpDown, FileText, Landmark,
  HandCoins, Wallet, Loader2, RefreshCw, XCircle,
} from 'lucide-react';

import PageHeader from '../header';
import LoanFilterBar, { LoanFilterPeriod, LoanFilterType, LoanFilterRange } from './LoanFilterBar';
import NewLoanModal from './modals/NewLoanModal';
import LoanBulkActionDropdown, { LoanBulkAction } from './LoanBulkActionDropdown';
import LoanBulkActionModal from './modals/LoanBulkActionModal';
import LoanDetailModal from './modals/LoanDetailModal';
import { UserRole } from '@/app/lib/auth';
import { fetchLoans } from '@/app/lib/api/loans';
import {
  LoanData, LoanStatus, LoanTab,
  LOAN_STATUS_LABELS, LOAN_TYPE_LABELS, PAYMENT_FREQUENCY_LABELS,
  getLoanTab, getRiskLevel,
} from '../transactions/validation/loanSchema';

// ─── Rôle (temporaire) ────────────────────────────────────────────
// ⚠️ MOCK tant que getRole() n'est pas branché sur la session NextAuth.
// Le backend vérifie les permissions de toute façon : ceci évite seulement
// d'afficher des boutons inutiles.
const MOCK_ROLE: UserRole = 'superviseur';
const DECIDER_ROLES  = new Set<string>(['superviseur', 'directeur', 'administrateur', 'admin']);
const DIRECTOR_ROLES = new Set<string>(['directeur', 'administrateur', 'admin']);

// ─── Styles ───────────────────────────────────────────────────────

const STATUS_STYLE: Record<LoanStatus, { bg: string; text: string; dot: string }> = {
  pending:  { bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  approved: { bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  active:   { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  paid:     { bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', dot: 'bg-[#22C55E]' },
  rejected: { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
};

const GRID = '40px 2fr 1.1fr 1.4fr 1.2fr 1.4fr 1fr 130px';

type SortField = 'member_name' | 'loan_type' | 'loan_amount' | 'status' | 'col5' | 'created_at';

// ─── Helpers ──────────────────────────────────────────────────────

const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

function formatRelative(iso: string) {
  const d       = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 60)        return `Il y a ${Math.max(diffMin, 0)} min`;
  if (diffMin < 24 * 60)   return `Il y a ${Math.floor(diffMin / 60)} h`;
  if (diffMin < 7 * 1440)  return `Il y a ${Math.floor(diffMin / 1440)} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function matchesPeriod(iso: string, period: LoanFilterPeriod): boolean {
  if (period === 'all') return true;
  const d = new Date(iso), now = new Date();
  if (period === 'today') return d.toDateString() === now.toDateString();
  if (period === 'week')  return now.getTime() - d.getTime() <= 7 * 86_400_000;
  if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === 'year')  return d.getFullYear() === now.getFullYear();
  return true;
}

function matchesRange(amount: number, range: LoanFilterRange): boolean {
  if (range === 'all')    return true;
  if (range === 'small')  return amount < 10_000;
  if (range === 'medium') return amount >= 10_000 && amount <= 50_000;
  if (range === 'large')  return amount > 50_000 && amount <= 100_000;
  if (range === 'xlarge') return amount > 100_000;
  return true;
}

/** Tri : les valeurs absentes (null) vont toujours en bas. */
function compareNullable(a: number | null | undefined, b: number | null | undefined, dir: number) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return (a - b) * dir;
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

// ─── Composant ────────────────────────────────────────────────────

export default function LoansTable() {
  const userRole: UserRole = MOCK_ROLE;
  const canDecide  = DECIDER_ROLES.has(userRole);
  const canDelete  = DIRECTOR_ROLES.has(userRole);

  // Actions masquées selon le rôle (le backend revérifie de toute façon)
  const hiddenActions: LoanBulkAction[] = [
    ...(canDecide ? [] : (['approve', 'reject'] as LoanBulkAction[])),
    ...(canDelete ? [] : (['delete'] as LoanBulkAction[])),
  ];

  // ── Données ──
  const [loans,   setLoans]   = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLoans(await fetchLoans());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les prêts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLoans(); }, [loadLoans]);

  // ── Filtres, tri, sélection ──
  const [activeTab,      setActiveTab]      = useState<LoanTab>('demandes');
  const [sortField,      setSortField]      = useState<SortField>('created_at');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');
  const [search,         setSearch]         = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<LoanFilterPeriod>('all');
  const [selectedType,   setSelectedType]   = useState<LoanFilterType>('all');
  const [selectedRange,  setSelectedRange]  = useState<LoanFilterRange>('all');
  const [selected,       setSelected]       = useState<Set<string>>(new Set());

  // ── Modals ──
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [detailLoan,  setDetailLoan]  = useState<LoanData | null>(null);
  const [bulk,         setBulk]         = useState<{ action: LoanBulkAction; loans: LoanData[] } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<LoanTab, number> = { demandes: 0, a_jour: 0, retard: 0, archive: 0 };
    loans.forEach(l => { c[getLoanTab(l)]++; });
    return c;
  }, [loans]);

  const isArchiveTab  = activeTab === 'archive';
  const isDemandesTab = activeTab === 'demandes';
  const canSelect     = true;   // l'export a du sens dans tous les onglets

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loans.filter(l => {
      if (getLoanTab(l) !== activeTab) return false;
      const matchSearch = q === ''
        || l.member_name.toLowerCase().includes(q)
        || l.account_number.toLowerCase().includes(q)
        || l.id.toLowerCase().includes(q);
      const matchType = selectedType === 'all' || l.loan_type === selectedType;
      return matchSearch && matchType
        && matchesRange(l.loan_amount, selectedRange)
        && matchesPeriod(l.created_at, selectedPeriod);
    });
  }, [loans, activeTab, search, selectedType, selectedRange, selectedPeriod]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'loan_amount': return (a.loan_amount - b.loan_amount) * dir;
      case 'status':      return a.status.localeCompare(b.status) * dir;
      case 'loan_type':   return a.loan_type.localeCompare(b.loan_type) * dir;
      case 'col5':        return isDemandesTab
        ? (a.loan_duration - b.loan_duration) * dir
        : compareNullable(a.remaining_balance, b.remaining_balance, dir);
      case 'created_at':  return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      default:            return a.member_name.localeCompare(b.member_name) * dir;
    }
  }), [filtered, sortField, sortDir, isDemandesTab]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const allSelected  = sorted.length > 0 && sorted.every(l => selected.has(l.id));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => setSelected(allSelected ? new Set() : new Set(sorted.map(l => l.id)));
  const toggleRow    = (id: string) => setSelected(prev => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const selectedLoans = useMemo(() => loans.filter(l => selected.has(l.id)), [loans, selected]);

  const handleTabChange = (tab: LoanTab) => {
    setActiveTab(tab);
    setSelected(new Set());
    setSearch('');
    setSelectedPeriod('all');
    setSelectedType('all');
    setSelectedRange('all');
    setSortField('created_at');
    setSortDir('desc');
  };

  const handleBulkDone = () => {
    setSelected(new Set());
    loadLoans();
  };

  const COLS: { label: string; field: SortField }[] = [
    { label: 'Membre',  field: 'member_name' },
    { label: 'Type',    field: 'loan_type'   },
    { label: 'Montant', field: 'loan_amount' },
    { label: 'Statut',  field: 'status'      },
    { label: isDemandesTab ? 'Durée' : 'Solde restant', field: 'col5' },
    { label: 'Date',    field: 'created_at'  },
  ];

  const TABS: { id: LoanTab; label: string; icon: React.ElementType; active: string; badge: string }[] = [
    { id: 'demandes', label: 'Demandes',  icon: Clock,         active: 'border-yellow-500 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
    { id: 'a_jour',   label: 'À jour',    icon: CheckCircle2,  active: 'border-[#2E7D32] text-[#1B5E20]',   badge: 'bg-[#DDEAD5] text-[#1B5E20]'   },
    { id: 'retard',   label: 'En retard', icon: AlertTriangle, active: 'border-orange-500 text-orange-600', badge: 'bg-orange-100 text-orange-600' },
    { id: 'archive',  label: 'Archive',   icon: Archive,       active: 'border-red-400 text-red-600',       badge: 'bg-red-100 text-red-600'       },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Prêts"
          subtitle="Registre complet — demandes, suivi et historique"
          icon={<Landmark className="w-8 h-8 text-[#2E7D32]" />}
        />
        <button onClick={loadLoans} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      <LoanFilterBar
        filterValue={search}
        selectedPeriod={selectedPeriod}
        selectedType={selectedType}
        selectedRange={selectedRange}
        onSearchChange={v => setSearch(v ?? '')}
        onClear={() => setSearch('')}
        onPeriodChange={setSelectedPeriod}
        onTypeChange={setSelectedType}
        onRangeChange={setSelectedRange}
        onAdd={() => setNewLoanOpen(true)}
        totalCount={sorted.length}
        loans={filtered}
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="flex-1 text-sm font-semibold text-red-700">{error}</p>
          <button onClick={loadLoans}
            className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md">
            Réessayer
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Onglets */}
        <div className="flex items-center px-2 border-b border-gray-100 bg-white overflow-x-auto overflow-y-hidden">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            const count = counts[tab.id];
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 whitespace-nowrap shrink-0 ${
                  isCurrent ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${isCurrent ? tab.badge : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {isArchiveTab && (
          <div className="flex items-start gap-3 px-5 py-3 bg-red-50 border-b border-red-100">
            <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">Section clôturée — prêts remboursés ou rejetés</p>
              <p className="text-xs text-red-500 mt-0.5">Lecture seule : aucune action n'est possible depuis cet onglet.</p>
            </div>
          </div>
        )}

        {/* Barre de sélection (approbation / rejet en lot) */}
        {canSelect && selected.size > 0 && (
          <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-sm font-semibold text-[#1B5E20]">
                {selected.size} prêt{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <LoanBulkActionDropdown
                selectedCount={selected.size}
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(o => !o)}
                onAction={action => setBulk({ action, loans: selectedLoans })}
                context={activeTab}
                hidden={hiddenActions}
              />
              <button onClick={() => setSelected(new Set())} aria-label="Vider la sélection"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* En-tête des colonnes */}
        <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
          style={{ display: 'grid', gridTemplateColumns: GRID }}>
          <div className="flex items-center justify-center">
            {canSelect && (
              <button onClick={toggleAll} aria-label="Tout sélectionner"
                className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                  allSelected || someSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                }`}>
                {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </button>
            )}
          </div>
          {COLS.map(col => (
            <button key={col.field} onClick={() => toggleSort(col.field)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left text-gray-600 hover:text-[#1B5E20]">
              {col.label}
              <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
            </button>
          ))}
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
        </div>

        {/* Lignes */}
        <div className="divide-y divide-gray-50">
          {loading && loans.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement des prêts…
            </div>
          )}

          {!loading && sorted.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isArchiveTab ? 'bg-red-50' : 'bg-[#DDEAD5]'}`}>
                {isArchiveTab ? <Archive className="w-7 h-7 text-red-400" /> : <FileText className="w-7 h-7 text-[#2E7D32]" />}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{isArchiveTab ? 'Aucun prêt archivé' : 'Aucun prêt trouvé'}</p>
              <p className="text-xs text-gray-400">
                {isArchiveTab ? 'Les prêts remboursés ou rejetés apparaîtront ici' : 'Modifiez vos critères pour voir plus de résultats'}
              </p>
            </div>
          )}

          {sorted.map((loan, i) => {
            const style      = STATUS_STYLE[loan.status];
            const isSelected = selected.has(loan.id);
            const risk       = getRiskLevel(loan.late_days);
            const isLate     = risk === 'late' || risk === 'critical';
            const isCritical = risk === 'critical';

            return (
              <div key={loan.id}
                className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${isArchiveTab ? 'opacity-75' : ''} ${
                  isSelected   ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : isCritical ? 'bg-red-50/30 hover:bg-red-50/50'
                  : isLate     ? 'bg-yellow-50/30 hover:bg-yellow-50/50'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
                }`}
                style={{ gridTemplateColumns: GRID }}>

                {/* Sélection */}
                <div className="flex items-center justify-center">
                  {canSelect && (
                    <button onClick={() => toggleRow(loan.id)} aria-label="Sélectionner"
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                      }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </button>
                  )}
                </div>

                {/* Membre */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0 ${isArchiveTab ? 'opacity-60 grayscale' : ''}`}>
                    <Users className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate leading-tight ${isArchiveTab ? 'text-gray-400' : 'text-gray-900'}`}>{loan.member_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{loan.account_number || '—'}</p>
                  </div>
                </div>

                {/* Type */}
                <p className="text-xs font-medium text-gray-700">{LOAN_TYPE_LABELS[loan.loan_type] ?? loan.loan_type}</p>

                {/* Montant */}
                <div>
                  <p className="text-sm font-bold text-gray-800">{formatHTG(loan.loan_amount)}</p>
                  <p className="text-xs text-gray-400">{loan.interest_rate} % · {loan.loan_duration} mois</p>
                </div>

                {/* Statut */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                    {LOAN_STATUS_LABELS[loan.status]}
                  </span>
                  {isLate && (
                    <p className={`text-xs font-semibold mt-0.5 ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                      {loan.late_days} j de retard
                    </p>
                  )}
                </div>

                {/* Durée (demandes) ou solde restant (autres onglets) */}
                {isDemandesTab ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{loan.loan_duration} mois</p>
                    <p className="text-xs text-gray-400 mt-0.5">{PAYMENT_FREQUENCY_LABELS[loan.payment_frequency]}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-700" title={loan.remaining_balance == null ? 'Calculé par le système (bientôt disponible)' : undefined}>
                      {loan.remaining_balance == null ? '—' : formatHTG(loan.remaining_balance)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {loan.next_due_date ? `Échéance : ${formatShortDate(loan.next_due_date)}` : loan.due_date ? `Fin : ${formatShortDate(loan.due_date)}` : ''}
                    </p>
                  </div>
                )}

                {/* Date */}
                <div>
                  <p className="text-xs font-semibold text-gray-700">{formatRelative(loan.created_at)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(loan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-1">
                  <button title="Voir le détail" onClick={() => setDetailLoan(loan)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500">
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {canDecide && loan.status === 'pending' && (
                    <button title="Approuver" onClick={() => setBulk({ action: 'approve', loans: [loan] })}
                      className="p-1.5 rounded-lg text-[#2E7D32] hover:bg-[#DDEAD5]">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {canDecide && (loan.status === 'pending' || loan.status === 'approved') && (
                    <button title="Rejeter" onClick={() => setBulk({ action: 'reject', loans: [loan] })}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* ⏳ Désactivé : le backend ne crédite pas encore le compte (contrat, point 5) */}
                  {loan.status === 'approved' && (
                    <button disabled title="Décaissement bientôt disponible (en attente du backend)"
                      className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed">
                      <HandCoins className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* ⏳ Désactivé : POST /loans/{id}/repay/ n'existe pas encore (contrat, point 6) */}
                  {loan.status === 'active' && (
                    <button disabled title="Remboursement bientôt disponible (en attente du backend)"
                      className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed">
                      <Wallet className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {loans.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{sorted.length}</span> résultat{sorted.length !== 1 ? 's' : ''} sur cet onglet
            </p>
            <p className="text-xs text-gray-400">{loans.length} prêt{loans.length !== 1 ? 's' : ''} au total</p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <NewLoanModal
        isOpen={newLoanOpen}
        onClose={() => setNewLoanOpen(false)}
        onCreated={loadLoans}
      />

      <LoanDetailModal loan={detailLoan} onClose={() => setDetailLoan(null)} />

      {/* Monté seulement quand une action est choisie : son état repart à zéro à chaque ouverture */}
      {bulk && (
        <LoanBulkActionModal
          action={bulk.action}
          loans={bulk.loans}
          onClose={() => setBulk(null)}
          onDone={handleBulkDone}
        />
      )}
    </div>
  );
}