'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, LogOut, Clock,
  User, ShieldCheck, Building2, Hash, Banknote,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Check, CheckCircle2, X,
  LayoutGrid, LogIn, Archive,
  AlertTriangle, TrendingUp, TrendingDown,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';
import SessionBulkActionModal from './modals/SessionBulkActionModal';
import SessionBulkActionDropdown, { SessionBulkAction } from './SessionBulkActionDropdown';

type TabId = 'toutes' | 'ouverte' | 'fermée' | 'interrompue';

interface SessionTableProps {
  sessions:     CaisseSession[];
  isLoading:    boolean;
  onView:       (s: CaisseSession) => void;
  onClose?:     (s: CaisseSession) => void;
  onBulkAction: (action: SessionBulkAction, ids: string[]) => Promise<void>;
  activeTab?:   TabId;
  onTabChange?: (tab: TabId) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const GRID = '40px 2fr 1.5fr 1.2fr 1.2fr 1fr 1fr 130px';

const COLS = [
  { label: 'Caissier',    field: 'caissier_nom' as keyof CaisseSession },
  { label: 'Superviseur', field: 'superviseur'  as keyof CaisseSession },
  { label: 'Agence',      field: 'branch_name'  as keyof CaisseSession },
  { label: 'Caisse',      field: 'numero_caisse' as keyof CaisseSession },
  { label: 'Montant',     field: 'montant_ouverture' as keyof CaisseSession },
  { label: 'Ouverte',     field: 'ouverture_at' as keyof CaisseSession },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatMoney(v: number | undefined, devise = 'HTG'): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: devise, minimumFractionDigits: 0,
  }).format(v);
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  });
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
}

function duree(ouverture?: string, fermeture?: string): string {
  if (!ouverture) return '—';
  const fin   = fermeture ? new Date(fermeture) : new Date();
  const debut = new Date(ouverture);
  const diff  = Math.floor((fin.getTime() - debut.getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`;
}

function getInitials(name?: string): string {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex justify-center"><div className="w-4 h-4 rounded bg-gray-100 animate-pulse" /></div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-32 bg-gray-100 animate-pulse rounded" />
          <div className="h-2.5 w-24 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
      ))}
      <div className="flex justify-center gap-1">
        {[...Array(2)].map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const SessionTable: React.FC<SessionTableProps> = ({
  sessions, isLoading, activeTab: externalTab,
  onView, onClose, onBulkAction, onTabChange,
}) => {
  const [localTab,     setLocalTab]     = useState<TabId>('toutes');
  const [sortField,    setSortField]    = useState<keyof CaisseSession>('ouverture_at');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<SessionBulkAction | null>(null);

  const activeTab = externalTab ?? localTab;

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    toutes:  sessions.length,
    ouverte: sessions.filter(s => s.statut === 'ouverte').length,
    fermée:  sessions.filter(s => s.statut === 'fermée').length,
    // AJOUTER
    interrompue: sessions.filter(s => s.statut === 'interrompue').length,
  }), [sessions]);

  // ── Tab filter ────────────────────────────────────────────────────────────
  const tabSessions = useMemo(() => sessions.filter(s => {
    if (activeTab === 'toutes')  return true;
    if (activeTab === 'ouverte') return s.statut === 'ouverte';
    if (activeTab === 'fermée')  return s.statut === 'fermée';
    // AJOUTER
    if (activeTab === 'interrompue') return s.statut === 'interrompue';
    return false;
  }), [sessions, activeTab]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = (field: keyof CaisseSession) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => [...tabSessions].sort((a, b) => {
    let va: unknown = a[sortField] ?? '';
    let vb: unknown = b[sortField] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va === vb) return 0;
    const result = (va as number | string) < (vb as number | string) ? -1 : 1;
    return sortDir === 'asc' ? result : -result;
  }), [tabSessions, sortField, sortDir]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(s => s.id)));
  const toggleRow    = (id: string) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const handleTabChange = (tab: TabId) => {
    setLocalTab(tab);
    onTabChange?.(tab);
    setSelected(new Set());
  };

  const selectedSessions = useMemo(
    () => sorted.filter(s => selected.has(s.id)),
    [sorted, selected],
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets ── */}
      <div className="flex items-center gap-0 px-2 border-b border-gray-100 bg-white">
        {([
          { id: 'toutes'  as TabId, label: 'Toutes',   icon: LayoutGrid, active: 'border-[#2E7D32] text-[#1B5E20]',  badge: 'bg-[#DDEAD5] text-[#1B5E20]',  count: counts.toutes  },
          { id: 'ouverte' as TabId, label: 'Ouvertes', icon: LogIn,      active: 'border-green-500 text-green-700',  badge: 'bg-green-50 text-green-700',   count: counts.ouverte },
          { id: 'fermée'  as TabId, label: 'Fermées',  icon: Archive,    active: 'border-gray-500 text-gray-700',    badge: 'bg-gray-100 text-gray-600',    count: counts.fermée  },// AJOUTER dans le .map([...])
          { 
            id: 'interrompue' as TabId, 
            label: 'Interrompues', 
            icon: AlertTriangle,          // déjà importé ✓
            active: 'border-red-500 text-red-700', 
            badge: 'bg-red-50 text-red-700', 
            count: counts.interrompue 
          },
        ]).map(tab => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
                isCurrent ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${isCurrent ? tab.badge : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Barre sélection ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} session{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <SessionBulkActionDropdown
              selectedCount={selected.size}
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(o => !o)}
              onAction={(action) => setActiveAction(action)}
            />
            <button onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête colonnes ── */}
      <div className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
        style={{ display: 'grid', gridTemplateColumns: GRID }}>
        <div className="flex items-center justify-center">
          <button onClick={toggleAll}
            className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
              allSelected || someSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
            }`}>
            {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </button>
        </div>
        {COLS.map(col => (
          <button key={col.label} onClick={() => toggleSort(col.field)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left text-gray-600 hover:text-[#1B5E20] transition-colors">
            {col.label}
            <SortIcon field={col.field as string} sortField={sortField as string} sortDir={sortDir} />
          </button>
        ))}
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
      </div>

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">
        {isLoading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#DDEAD5]">
              <LayoutGrid className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Aucune session trouvée
            </p>
            <p className="text-xs text-gray-400">
              Aucune session dans cet onglet pour le moment
            </p>
          </div>
        )}

        {!isLoading && sorted.map((session, i) => {
          const isSelected = selected.has(session.id);
          const isOpen     = session.statut === 'ouverte';
          const isForcee   = !!session.forcee_par;
          const ecart      = session.montant_fermeture != null
            ? session.montant_fermeture - session.montant_ouverture
            : null;

          return (
            <div key={session.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${
                isSelected
                  ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
              }`}
              style={{ gridTemplateColumns: GRID }}>

              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button onClick={() => toggleRow(session.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* Caissier */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`... ${
                    session.statut === 'ouverte'      ? 'bg-[#DDEAD5] text-[#1B5E20]' :
                    session.statut === 'interrompue'  ? 'bg-red-50 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  {getInitials(session.caissier_nom)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {session.caissier_nom ?? session.username}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {session.statut === 'ouverte' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-green-50 text-green-700">
                          <span className="w-1 h-1 rounded-full bg-green-500" /> En cours
                        </span>
                      )}
                      {session.statut === 'fermée' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500">
                          <span className="w-1 h-1 rounded-full bg-gray-400" /> Fermée
                        </span>
                      )}
                      {session.statut === 'interrompue' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600">
                          <span className="w-1 h-1 rounded-full bg-red-500" /> Interrompue
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Superviseur */}
              <div className="flex items-center gap-1.5 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  {session.superviseur}
                </span>
              </div>

              {/* Agence */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  {session.branch_name ?? session.branch}
                </span>
              </div>

              {/* Caisse */}
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                  <Hash className="w-2.5 h-2.5" />
                  {session.numero_caisse}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {session.devise}
                </span>
              </div>

              {/* Montant + écart */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-[#1B5E20]">
                  {formatMoney(session.montant_ouverture, session.devise)}
                </span>
                {ecart != null && ecart !== 0 && (
                  <span className={`text-[10px] font-medium flex items-center gap-0.5 ${
                    ecart > 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {ecart > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    Écart {ecart > 0 ? '+' : ''}{formatMoney(ecart, session.devise)}
                  </span>
                )}
              </div>

              {/* Ouverte */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm text-gray-700">
                  {formatDate(session.ouverture_at)}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(session.ouverture_at)} · {duree(session.ouverture_at, session.fermeture_at)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button title="Voir détails" onClick={() => onView(session)}
                  className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-blue-500">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {isOpen && onClose && (
                  <button title="Fermer la session" onClick={() => onClose(session)}
                    className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!isLoading && sessions.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span> résultat{sorted.length !== 1 ? 's' : ''} sur cet onglet
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {counts.ouverte} Ouverte{counts.ouverte !== 1 ? 's' : ''}
            </span>
            {counts.fermée > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {counts.fermée} Fermée{counts.fermée !== 1 ? 's' : ''}
              </span>
            )}
            {/* AJOUTER après le badge fermées */}
            {counts.interrompue > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {counts.interrompue} Interrompue{counts.interrompue !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <SessionBulkActionModal
        action={activeAction}
        sessions={selectedSessions}
        onClose={() => setActiveAction(null)}
        onConfirm={async (action, ids) => {
          await onBulkAction(action, ids);
          setSelected(new Set());
          setActiveAction(null);
        }}
      />
    </div>
  );
};

export default SessionTable;