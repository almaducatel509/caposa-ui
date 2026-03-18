'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive, Search, Filter, Eye, Trash2, RotateCcw,
  FileText, Download, AlertTriangle, CheckCircle2,
  Lock, X, Loader2,
} from 'lucide-react';
import {
  Archive as ArchiveType, ArchiveCategory,
  getCategoryLabel, getTypeLabel, getCategoryAccent,
  estDesactivable, getRaisonVerrouillage,
} from '@/types/archives';

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateMockArchives(): ArchiveType[] {
  return [
    {
      id: 'ARC_20260215_00001', category: 'operational', type: 'reconciliation_caisse',
      date: new Date('2026-02-15'), employeeId: 'emp_001', employeeName: 'Jean Dupont', employeeRole: 'Caissier',
      summary: 'Réconciliation journalière — Écart de -30.00 HTG expliqué',
      metadata: { reportId: 'rpt_20260213', openingCash: 2000, theoreticalCash: 7130, actualCash: 7100, discrepancy: -30, status: 'equilibre' },
      detailsUrl: '/dashboard/archives/reconciliation/ARC_20260215_00001',
      isDeleted: false, createdAt: new Date('2026-02-15T17:45:00'), updatedAt: new Date('2026-02-15T17:45:00'),
    },
    {
      id: 'ARC_20260201_00002', category: 'regulatory', type: 'rapport_liquidite',
      date: new Date('2026-02-01'), periode: 'Janvier 2026',
      employeeId: 'system', employeeName: 'Système', employeeRole: 'Automatique',
      summary: 'Rapport de liquidité — Janvier 2026 — Statut : Conforme',
      metadata: { reportType: 'liquidite', periode: 'Janvier 2026', status: 'conforme', keyMetrics: { ratioLiquidite: 18.5, liquiditeDisponible: 1200000 } },
      documentUrl: '/rapports/liquidite/janvier-2026.pdf',
      isDeleted: false, createdAt: new Date('2026-02-01T09:00:00'), updatedAt: new Date('2026-02-01T09:00:00'),
    },
    {
      id: 'ARC_20260201_00003', category: 'regulatory', type: 'rapport_solvabilite',
      date: new Date('2026-02-01'), periode: 'Janvier 2026',
      employeeId: 'system', employeeName: 'Système', employeeRole: 'Automatique',
      summary: 'Rapport de solvabilité — Janvier 2026 — Statut : Conforme',
      metadata: { reportType: 'solvabilite', periode: 'Janvier 2026', status: 'conforme', keyMetrics: { ratioSolvabilite: 12.3, capitalPropre: 800000 } },
      documentUrl: '/rapports/solvabilite/janvier-2026.pdf',
      isDeleted: false, createdAt: new Date('2026-02-01T09:15:00'), updatedAt: new Date('2026-02-01T09:15:00'),
    },
    {
      id: 'ARC_20260214_00004', category: 'operational', type: 'pret_approuve',
      date: new Date('2026-02-14'), employeeId: 'emp_003', employeeName: 'Marie Tremblay', employeeRole: 'Gestionnaire de prêts',
      summary: 'Prêt approuvé — Jean Baptiste — 50 000 HTG',
      metadata: { loanId: 'loan_2026_0234', memberId: 'mbr_1234', memberName: 'Jean Baptiste', amount: 50000, decision: 'approuve', approvedBy: 'Marie Tremblay' },
      detailsUrl: '/dashboard/archives/loan/ARC_20260214_00004',
      isDeleted: false, createdAt: new Date('2026-02-14T14:30:00'), updatedAt: new Date('2026-02-14T14:30:00'),
    },
    {
      id: 'ARC_20260210_00005', category: 'administrative', type: 'horaire',
      date: new Date('2026-02-10'), employeeId: 'emp_002', employeeName: 'Paul Martin', employeeRole: 'RH',
      summary: 'Modification horaire — Équipe caisse — Mars 2026',
      metadata: { scheduleId: 'sch_2026_03', period: 'Mars 2026', affectedEmployees: 5 },
      isDeleted: false, createdAt: new Date('2026-02-10T10:00:00'), updatedAt: new Date('2026-02-10T10:00:00'),
    },
    {
      id: 'ARC_20260215_00006', category: 'operational', type: 'transaction_journaliere',
      date: new Date('2026-02-15'), employeeId: 'emp_001', employeeName: 'Jean Dupont', employeeRole: 'Caissier',
      summary: 'Dépôt — Sophie Lavoie — 15 000 HTG',
      metadata: { transactionId: 'tx_20260215_0123', memberId: 'mbr_5678', memberName: 'Sophie Lavoie', amount: 15000, type: 'depot', status: 'decaisse' },
      detailsUrl: '/dashboard/archives/transaction/ARC_20260215_00006',
      isDeleted: false, createdAt: new Date('2026-02-15T11:20:00'), updatedAt: new Date('2026-02-15T11:20:00'),
    },
    {
      id: 'ARC_20260101_00007', category: 'administrative', type: 'document_interne',
      date: new Date('2026-01-01'), employeeId: 'emp_002', employeeName: 'Paul Martin', employeeRole: 'RH',
      summary: 'Document interne — Test (désactivé)',
      metadata: {},
      isDeleted: true, deletedBy: 'direction', deletedAt: new Date('2026-01-15T16:00:00'),
      deletionReason: 'Document de test — nettoyage administratif',
      createdAt: new Date('2026-01-01T08:00:00'), updatedAt: new Date('2026-01-15T16:00:00'),
    },
  ];
}

function formatDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Modal soft delete ────────────────────────────────────────────────────────
function SoftDeleteModal({ archive, onConfirm, onClose }: {
  archive: ArchiveType;
  onConfirm: (motif: string) => void;
  onClose: () => void;
}) {
  const [motif,      setMotif]      = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!motif.trim()) return;
    setConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    onConfirm(motif.trim());
    setConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Désactiver l'archive</p>
              <p className="text-xs text-gray-500">Direction uniquement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FEF9EC]">
            <p className="text-xs text-[#B45309]">
              Cette archive ne sera pas supprimée définitivement. Elle restera visible avec le filtre "Archives désactivées" et pourra être restaurée.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-gray-100 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-1">Archive concernée</p>
            <p className="text-xs font-mono text-gray-700">{archive.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">{archive.summary}</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Motif de désactivation <span className="text-[#EF4444]">*</span>
            </label>
            <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3} maxLength={300}
              placeholder="Expliquez la raison de cette désactivation…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
            <div className="flex justify-between mt-1">
              {!motif.trim() && <p className="text-xs text-[#EF4444]">Obligatoire</p>}
              <p className="text-xs text-gray-400 ml-auto">{motif.length}/300</p>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!motif.trim() || confirming}
              className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {confirming
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Désactivation…</>
                : <><Lock className="w-4 h-4" /> Confirmer</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal restauration ───────────────────────────────────────────────────────
function RestoreModal({ archive, onConfirm, onClose }: {
  archive: ArchiveType;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 500));
    onConfirm();
    setConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-bold text-gray-800">Restaurer l'archive</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl border border-gray-100 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-1">Archive à restaurer</p>
            <p className="text-xs font-mono text-gray-700">{archive.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">{archive.summary}</p>
          </div>
          {archive.deletionReason && (
            <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FEF9EC]">
              <p className="text-xs font-semibold text-[#B45309] mb-1">Motif de désactivation initial</p>
              <p className="text-xs text-[#B45309]">{archive.deletionReason}</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={confirming}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {confirming
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Restauration…</>
                : <><RotateCcw className="w-4 h-4" /> Restaurer</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ArchivesPage() {
  const router = useRouter();
  const [archives,         setArchives]         = useState<ArchiveType[]>(generateMockArchives);
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | 'all'>('all');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [showDeleted,      setShowDeleted]       = useState(false);
  const [deleteTarget,     setDeleteTarget]      = useState<ArchiveType | null>(null);
  const [restoreTarget,    setRestoreTarget]     = useState<ArchiveType | null>(null);

  const filtered = useMemo(() => archives.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (!showDeleted && a.isDeleted) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return a.id.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) ||
        a.employeeName.toLowerCase().includes(q) || getTypeLabel(a.type).toLowerCase().includes(q);
    }
    return true;
  }), [archives, selectedCategory, searchTerm, showDeleted]);

  const stats = useMemo(() => ({
    total:          archives.filter(a => !a.isDeleted).length,
    operational:    archives.filter(a => a.category === 'operational'    && !a.isDeleted).length,
    regulatory:     archives.filter(a => a.category === 'regulatory'     && !a.isDeleted).length,
    administrative: archives.filter(a => a.category === 'administrative' && !a.isDeleted).length,
    deleted:        archives.filter(a => a.isDeleted).length,
  }), [archives]);

  // ─── Routing vers la page de détail selon le type ─────────────────────────
  const handleViewDetails = (archive: ArchiveType) => {
    if      (archive.type === 'reconciliation_caisse')                           router.push(`/dashboard/archives/reconciliation/${archive.id}`);
    else if (archive.type === 'pret_approuve' || archive.type === 'pret_refuse') router.push(`/dashboard/archives/loan/${archive.id}`);
    else if (archive.type === 'transaction_journaliere')                         router.push(`/dashboard/archives/transaction/${archive.id}`);
    else if (archive.type === 'mouvement_tresorerie')                            router.push(`/dashboard/archives/treasury/${archive.id}`);
    else if (archive.category === 'regulatory')                                  router.push(`/dashboard/archives/rapport/${archive.id}`);
    else                                                                          router.push(`/dashboard/archives/detail/${archive.id}`);
  };

  const handleSoftDelete = (motif: string) => {
    if (!deleteTarget) return;
    setArchives(prev => prev.map(a =>
      a.id !== deleteTarget.id ? a : {
        ...a, isDeleted: true, deletedBy: 'direction',
        deletedAt: new Date(), deletionReason: motif, updatedAt: new Date(),
      }
    ));
    setDeleteTarget(null);
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    setArchives(prev => prev.map(a =>
      a.id !== restoreTarget.id ? a : {
        ...a, isDeleted: false, deletedBy: undefined,
        deletedAt: undefined, deletionReason: undefined, updatedAt: new Date(),
      }
    ));
    setRestoreTarget(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Catégorie', 'Type', 'Date', 'Employé', 'Résumé', 'Statut'];
    const rows = filtered.map(a => [
      a.id, getCategoryLabel(a.category), getTypeLabel(a.type),
      formatDate(a.date), a.employeeName, a.summary,
      a.isDeleted ? 'Désactivé' : 'Actif',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `archives_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const selectCls = "px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]";

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
              <p className="text-sm text-gray-500 mt-0.5">Traçabilité complète des opérations — Audit et conformité</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-[#F9F9F6] transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total archives',  value: stats.total,          accent: C.green, sub: `${stats.deleted} désactivée${stats.deleted > 1 ? 's' : ''}` },
            { label: 'Opérationnel',    value: stats.operational,    accent: C.blue  },
            { label: 'Réglementaire',   value: stats.regulatory,     accent: C.green },
            { label: 'Administratif',   value: stats.administrative, accent: C.gold  },
          ].map(({ label, value, accent, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-2">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
              {sub && <p className="text-xs text-gray-400">{sub}</p>}
              <div className="h-1 rounded-full mt-1" style={{ backgroundColor: accent + '33' }}>
                <div className="h-full rounded-full w-full" style={{ backgroundColor: accent }} />
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Catégorie
              </p>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as ArchiveCategory | 'all')} className={selectCls}>
                <option value="all">Toutes les catégories</option>
                <option value="operational">Opérationnel</option>
                <option value="regulatory">Réglementaire</option>
                <option value="administrative">Administratif</option>
              </select>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
                <Search className="w-3.5 h-3.5" /> Recherche
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="ID, employé, résumé, type…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-0.5">
              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30" />
              <span className="text-sm font-semibold text-gray-600">
                Désactivées ({stats.deleted})
              </span>
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header colonnes */}
          <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
            <div className="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase tracking-widest text-gray-500">
              <div className="col-span-3">Identifiant</div>
              <div className="col-span-2">Catégorie / Type</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Employé</div>
              <div className="col-span-2">Résumé</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
                  <Archive className="w-7 h-7 text-[#2E7D32]" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Aucune archive trouvée</p>
                <p className="text-xs text-gray-400">Modifiez les filtres pour voir plus de résultats</p>
              </div>
            ) : (
              filtered.map((archive, idx) => {
                const accent = getCategoryAccent(archive.category);
                return (
                  <div key={archive.id}
                    className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group ${
                      archive.isDeleted
                        ? 'bg-[#FEF2F2]/40 opacity-70'
                        : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
                    }`}>

                    {/* ID */}
                    <div className="col-span-3">
                      <p className="text-xs font-mono font-semibold text-gray-700">{archive.id}</p>
                      {archive.isDeleted && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[#FEF2F2] text-[#B91C1C]">
                          <Lock className="w-3 h-3" /> Désactivée
                        </span>
                      )}
                    </div>

                    {/* Catégorie / Type */}
                    <div className="col-span-2">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold mb-1"
                        style={{ backgroundColor: accent.bg, color: accent.text }}>
                        {getCategoryLabel(archive.category)}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">{getTypeLabel(archive.type)}</p>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-gray-700">{formatDate(archive.date)}</p>
                      <p className="text-xs text-gray-400">{formatTime(archive.createdAt)}</p>
                    </div>

                    {/* Employé */}
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">{archive.employeeName}</p>
                      <p className="text-xs text-gray-500">{archive.employeeRole}</p>
                    </div>

                    {/* Résumé */}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{archive.summary}</p>
                      {archive.periode && <p className="text-xs text-gray-400 mt-0.5">Période : {archive.periode}</p>}
                    </div>

                    {/* Actions — un seul Eye par ligne */}
                    <div className="col-span-1 flex items-center justify-center gap-1.5">
                      {archive.isDeleted ? (
                        // Désactivée : Eye → page désactivation + RotateCcw
                        <>
                          <button title="Voir la désactivation"
                            onClick={() => router.push(`/dashboard/archives/${archive.id}/desactivation`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-[#FEF9EC] hover:text-[#B45309] transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button title="Restaurer" onClick={() => setRestoreTarget(archive)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-[#DDEAD5] hover:text-[#2E7D32] transition-colors">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      ) : !estDesactivable(archive) ? (
                        // Verrouillée : Eye → détail + cadenas non-cliquable avec tooltip
                        <>
                          <button title="Voir les détails" onClick={() => handleViewDetails(archive)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-[#EBF2F8] hover:text-[#355C7D] transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="relative group/lock">
                            <button disabled className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed">
                              <Lock className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 w-56 px-3 py-2 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                              {getRaisonVerrouillage(archive.type)}
                            </div>
                          </div>
                        </>
                      ) : (
                        // Active désactivable : Eye → détail + Trash
                        <>
                          <button title="Voir les détails" onClick={() => handleViewDetails(archive)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-[#EBF2F8] hover:text-[#355C7D] transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button title="Désactiver (Direction)" onClick={() => setDeleteTarget(archive)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-[#EF4444] transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> archive{filtered.length !== 1 ? 's' : ''}
              {searchTerm && <> · Recherche : <b>"{searchTerm}"</b></>}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5" />
              Archives immuables — Soft delete direction uniquement
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#EBF2F8] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#355C7D]" />
            </div>
            <p className="text-sm font-bold text-gray-700">À propos des archives</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              ['Immuabilité', 'Les archives ne peuvent jamais être modifiées ou supprimées définitivement.'],
              ['Génération automatique', 'Chaque opération sensible crée automatiquement une archive.'],
              ['Soft delete', 'Seule la direction peut désactiver une archive avec justification obligatoire.'],
              ['Export', 'PDF et CSV disponibles pour audits externes et inspections réglementaires.'],
            ].map(([titre, desc]) => (
              <div key={titre} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 shrink-0" />
                <span><b>{titre} :</b> {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modales */}
      {deleteTarget  && <SoftDeleteModal archive={deleteTarget}  onConfirm={handleSoftDelete} onClose={() => setDeleteTarget(null)}  />}
      {restoreTarget && <RestoreModal    archive={restoreTarget} onConfirm={handleRestore}    onClose={() => setRestoreTarget(null)} />}
    </div>
  );
}