// ─── Source de vérité unique ──────────────────────────────────────────────────
// Quand l'API est prête, remplacer ces imports par :
//   useEffect(() => {
//     fetch('/api/treasury/handovers?status=pending').then(r => r.json()).then(setPending);
//     fetch('/api/treasury/handovers?status=archived').then(r => r.json()).then(setArchived);
//   }, []);
'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Clock, Archive, ShieldAlert, Check, X, AlertTriangle, Inbox,
  ChevronDown, ChevronUp, ChevronsUpDown, FileDown,
} from 'lucide-react';
import AnomalieModal from './AnomalieModal';
import { Remise, Decision, AnomalieDecision } from '@/types/remise';
import AxiosInstance from '@/app/lib/axiosInstance';
import { TableSkeleton } from '../ui/TableSkeleton';
import Pagination from '@/app/components/ui/Pagination';


// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' G';

// fmt pour jsPDF — évite les espaces insécables et caractères non-Latin1
// jsPDF encode en Latin1 par défaut, Intl.NumberFormat injecte U+202F (espace fine insécable)
const pdfFmt = (n: number) => {
  const abs = Math.abs(Math.round(n));
  return abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' HTG';
};

// ─── Export PDF (jsPDF) ───────────────────────────────────────────────────────
// jsPDF est importé dynamiquement pour éviter le bundle côté serveur
const exportRemisePDF = async (r: Remise) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const GREEN  = [46, 125, 50]  as [number, number, number];
  const GRAY   = [100, 100, 100] as [number, number, number];
  const BLACK  = [30, 30, 30]   as [number, number, number];
  const RED    = [185, 28, 28]  as [number, number, number];

  let y = 18;
  const lm = 18; // left margin
  const rw = 174; // usable width

  // ── En-tête ──
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPOSA Remise de Caisse', lm, 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 192, 8, { align: 'right' });

  y = 22;

  // ── Titre ──
  doc.setTextColor(...BLACK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Remise ${r.id}`, lm, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Session : ${r.session_id}   ·   Date : ${r.date} à ${r.time}`, lm, y);
  y += 10;

  // ── Séparateur ──
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(lm, y, lm + rw, y);
  y += 7;

  // ── Bloc acteurs ──
  const colW = rw / 3;
  const acteurs = [
    { label: 'Caissière',   value: r.cashier.name },
    { label: 'Vérifié par', value: r.verified_by.name },
    { label: 'Décidé par',  value: r.decided_by ?? '—' },
  ];
  acteurs.forEach((a, i) => {
    const x = lm + i * colW;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(a.label.toUpperCase(), x, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text(a.value, x, y + 5);
  });
  y += 16;

  // ── Bloc montants ──
  doc.setFillColor(240, 247, 240);
  doc.roundedRect(lm, y, rw, 22, 2, 2, 'F');

  // Ouverture
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
  doc.text('OUVERTURE (DONNE)', lm + 5, y + 5);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
  doc.text(pdfFmt(r.opening_amount), lm + 5, y + 10);

  // Fermeture
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
  doc.text('FERMETURE (REMIS)', lm + 65, y + 5);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN);
  doc.text(pdfFmt(r.amount), lm + 65, y + 10);

  // Écart net
  const ecartNet = r.amount - r.opening_amount;
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
  doc.text('ECART NET', lm + 125, y + 5);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(ecartNet === 0 ? GREEN : ecartNet < 0 ? RED : [146, 64, 14] as [number,number,number]));
  doc.text(ecartNet === 0 ? '--' : (ecartNet > 0 ? '+' : '-') + pdfFmt(ecartNet), lm + 125, y + 10);

  y += 28;

  // ── Décision ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('DÉCISION', lm, y);
  y += 4;
  const decisionLabel = r.decision === 'approved' ? 'Approuvé' : 'Rejeté';
  const decisionColor = r.decision === 'approved' ? GREEN : RED;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...decisionColor);
  doc.text(decisionLabel, lm, y);
  if (r.decided_at) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(`le ${r.date} à ${r.decided_at} par ${r.decided_by ?? '—'}`, lm + 28, y);
  }
  y += 10;

  // ── Anomalie si présente ──
  if (r.anomalie_decision) {
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.line(lm, y, lm + rw, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    const resLabel = r.anomalie_decision.resolution === 'justified'
      ? 'ANOMALIE JUSTIFIEE'
      : 'ANOMALIE IMPUTEE A LA CAISSIERE';
    doc.text(resLabel, lm, y);
    if (r.anomalie_decision.amount) {
      doc.text(`· ${pdfFmt(r.anomalie_decision.amount)}`, lm + 60, y);
    }
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(r.anomalie_decision.note, rw);
    doc.text(noteLines, lm, y);
    y += noteLines.length * 5 + 4;
  }

  // ── Motif de rejet ──
  if (r.reject_reason) {
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.4);
    doc.line(lm, y, lm + rw, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...RED);
    doc.text('MOTIF DE REJET', lm, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.setFontSize(9);
    const rejectLines = doc.splitTextToSize(r.reject_reason, rw);
    doc.text(rejectLines, lm, y);
    y += rejectLines.length * 5 + 4;
  }

  // ── Audit trail ──
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(lm, y, lm + rw, y);
  y += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('AUDIT TRAIL', lm, y);
  y += 5;
  const steps = [
    `Remise effectuée · ${r.time}`,
    `Vérifié par ${r.verified_by.name}`,
    `Décision · ${r.decided_by ?? '—'} · ${r.decided_at ?? '—'}`,
  ];
  steps.forEach(step => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.text(`• ${step}`, lm + 2, y);
    y += 5;
  });

  // ── Pied de page ──
  doc.setFillColor(248, 248, 248);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`CAPOSA · Document genere automatiquement · ${new Date().toLocaleString('fr-FR')}`, 105, 291, { align: 'center' });

  doc.save(`remise_${r.id}_${r.date}.pdf`);
};

// ─── Icône de tri ─────────────────────────────────────────────────────────────
const SortIcon: React.FC<{ field: string; sortField: string; sortDir: 'asc' | 'desc' }> = ({
  field, sortField, sortDir,
}) => {
  if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-gray-300 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3 h-3 text-[#2E7D32] inline ml-1" />
    : <ChevronDown className="w-3 h-3 text-[#2E7D32] inline ml-1" />;
};

// ─── Micro-composants ─────────────────────────────────────────────────────────
const Avatar: React.FC<{ initials: string; color?: 'green' | 'blue' }> = ({
  initials, color = 'green',
}) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
    color === 'green' ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-[#E3EAF5] text-[#1E3A5F]'
  }`}>
    {initials}
  </div>
);

const Tag: React.FC<{ color: 'amber' | 'red'; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
    color === 'amber' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'
  }`}>
    {children}
  </span>
);

const AuditStep: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] shrink-0" />
    <span className="text-xs text-gray-400">{label}</span>
  </div>
);

const headerBase =
  'bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600';

// ─── État vide pending — deux variantes selon le contexte ─────────────────────
// Distinction importante :
//  - "rien à faire" : aucune remise n'a jamais existé aujourd'hui (aucune session
//    ouverte/fermée) → pas de check vert, ce serait mensonger.
//  - "tout traité" : il y a eu des remises et elles ont toutes été décidées
//    → check vert légitime, et la réconciliation peut démarrer.
const EmptyPendingState: React.FC<{ hasArchived: boolean }> = ({ hasArchived }) => {
  if (hasArchived) {
    return (
      <div className="py-14 text-center text-sm text-gray-400">
        <Check className="w-8 h-8 mx-auto mb-2 text-[#2E7D32]" />
        Toutes les remises ont été traitées
      </div>
    );
  }
  return (
    <div className="py-14 text-center text-sm text-gray-400">
      <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
      <p className="text-gray-500 font-medium">Aucune remise pour le moment</p>
      <p className="text-xs text-gray-400 mt-1">
        Aucune session n&apos;a encore été clôturée aujourd&apos;hui.
        Les remises apparaîtront ici dès qu&apos;une caissière fermera sa session.
      </p>
    </div>
  );
};
const toNum = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const nameOf = (info: any): string =>
  typeof info === 'string' ? info : info?.name ?? info?.nom ?? info?.username ?? '—';
const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';

function mapHandover(h: any): Remise {
  const cashierName  = nameOf(h.cashier_info);
  const verifierName = h.verified_by_info ? nameOf(h.verified_by_info) : '—';
  return {
    id:             String(h.id),
    session_id:     String(h.session_id ?? ''),
    date:           h.date ?? '',
    time:           String(h.time ?? '').slice(0, 5),
    opening_amount: toNum(h.opening_amount),
    amount:         toNum(h.amount),
    anomaly:        Boolean(h.anomaly),
    late_days:      Number(h.late_days) || 0,
    cashier:        { name: cashierName,  initials: initialsOf(cashierName) },
    verified_by:    { name: verifierName, initials: initialsOf(verifierName) },
    decision:       h.decision ?? undefined,
    decided_at:     h.decided_at
      ? new Date(h.decided_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : undefined,
    decided_by:     h.decision ? verifierName : undefined,
    reject_reason:  h.reject_reason || undefined,
    anomalie_decision: h.anomalie_resolution
      ? {
          resolution: h.anomalie_resolution,
          note:       h.anomalie_note ?? '',
          amount:     h.anomalie_amount != null ? toNum(h.anomalie_amount) : undefined,
        }
      : undefined,
  };
}

// ─── Composant principal ──────────────────────────────────────────────────────
const RemisesTable: React.FC = () => {
  const [tab,      setTab]      = useState<'pending' | 'archived'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  useEffect(() => { setCurrentPage(1); }, [tab]);
  const [pending,  setPending]  = useState<Remise[]>([]);
  const [archived, setArchived] = useState<Remise[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,  setError]  = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

// Une seule requête : en attente = pas encore de décision, archive = décidée
  const load = useCallback(async () => {
    try {
      const { data } = await AxiosInstance.get('/treasury/handovers/');
      const list = (Array.isArray(data) ? data : data?.results ?? []).map(mapHandover);
      setPending(list.filter((r: Remise) => !r.decision));
      setArchived(list.filter((r: Remise) => r.decision));
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Impossible de charger les remises.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Modale anomalie
  const [anomalieTarget, setAnomalieTarget] = useState<Remise | null>(null);
  // Expand archive
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  // ── Tri (archive seulement) ───────────────────────────────────────────────
  const [sortField, setSortField] = useState('date');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortedArchived = useMemo(() => [...archived].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'amount')    return (a.amount - b.amount) * dir;
    if (sortField === 'cashier')   return a.cashier.name.localeCompare(b.cashier.name) * dir;
    if (sortField === 'decision')  return (a.decision ?? '').localeCompare(b.decision ?? '') * dir;
    // date (défaut)
    return (new Date(`${a.date}T${a.time.replace('h', ':')}`)
      .getTime() - new Date(`${b.date}T${b.time.replace('h', ':')}`)
      .getTime()) * dir;
  }), [archived, sortField, sortDir]);

  // ── Décision simple ───────────────────────────────────────────────────────
  const decide = async (id: string, body: object) => {
  setBusyId(id);
  setError(null);
  try {
    await AxiosInstance.post(`/treasury/handovers/${id}/decide/`, body);
    await load();
  } catch (e: any) {
    setError(e?.response?.data?.detail ?? "Impossible d'enregistrer la décision.");
    throw e;
  } finally {
    setBusyId(null);
  }
};

const handleDecide = async (id: string, decision: Decision) => {
  let reject_reason: string | undefined;
  if (decision === 'rejected') {
    const reason = window.prompt('Motif du rejet :');
    if (!reason?.trim()) return;
    reject_reason = reason.trim();
  }
  try { await decide(id, { decision, reject_reason }); } catch { /* message déjà affiché */ }
};

const handleAnomalieConfirm = async (id: string, decision: Decision, anomalie: AnomalieDecision) => {
  try {
    await decide(id, { decision, anomalie });
    setAnomalieTarget(null);
  } catch { /* message déjà affiché */ }
};
  const activeList = tab === 'pending' ? pending : sortedArchived;
  const totalPages = Math.max(1, Math.ceil(activeList.length / pageSize));
  const paginatedList = useMemo(() => activeList.slice((currentPage - 1) * pageSize, currentPage * pageSize), [activeList, currentPage, pageSize]);

  // ── En-tête triable ───────────────────────────────────────────────────────
  const SortTh: React.FC<{ field: string; label: string }> = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:text-[#1B5E20] transition-colors"
    >
      {label}
      <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-6">
        <TableSkeleton columns={7} rows={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error && (
          <div className="flex items-start gap-2 px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Onglets ── */}
        <div className="flex border-b border-gray-100 px-1">
          {[
            { id: 'pending'  as const, label: 'En attente de validation', icon: <Clock   className="w-3.5 h-3.5" />, count: pending.length,  activeClass: 'border-yellow-500 text-yellow-800', badgeClass: 'bg-yellow-100 text-yellow-800' },
            { id: 'archived' as const, label: 'Archive & audit trail',    icon: <Archive className="w-3.5 h-3.5" />, count: archived.length, activeClass: 'border-gray-500 text-gray-700',    badgeClass: 'bg-gray-100 text-gray-600'    },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 whitespace-nowrap ${
                tab === t.id
                  ? `${t.activeClass} font-semibold`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  tab === t.id ? t.badgeClass : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Bannière archive ── */}
        {tab === 'archived' && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Lecture seule — sessions clôturées avec audit trail complet
          </div>
        )}

        {/* ── En-têtes colonnes ── */}
        {tab === 'pending' ? (
          <div className={`${headerBase} grid grid-cols-[1.5fr_1.2fr_110px_1fr_110px_160px] gap-3`}>
            <span>Caissière</span>
            <span>Vérifié par</span>
            <span>Montant</span>
            <span>Session</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>
        ) : (
          /* Archive — colonnes triables */
          <div className={`${headerBase} grid grid-cols-[1.4fr_1.2fr_110px_1fr_1.5fr_110px_44px] gap-3`}>
            <SortTh field="cashier"  label="Caissière" />
            <span>Vérifié par</span>
            <SortTh field="amount"   label="Montant" />
            <SortTh field="date"     label="Date" />
            <span>Audit trail</span>
            <SortTh field="decision" label="Décision" />
            <span></span>
          </div>
        )}

        {/* ── Lignes ── */}
        <div className="divide-y divide-gray-50">

          {/* Vide pending — distingue "rien à faire" vs "tout traité" */}
          {tab === 'pending' && pending.length === 0 && (
            <EmptyPendingState hasArchived={archived.length > 0} />
          )}

          {/* ── En attente ── */}
          {tab === 'pending' && paginatedList.map(r => (
            <div
              key={r.id}
              className="grid grid-cols-[1.5fr_1.2fr_110px_1fr_110px_160px] gap-3 items-center px-5 py-3.5 hover:bg-[#FAFAF6] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Avatar initials={r.cashier.initials} color="green" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {r.cashier.name}
                    {r.anomaly       && <Tag color="amber">⚠ Anomalie</Tag>}
                    {r.late_days > 0 && <Tag color="red">{r.late_days}j retard</Tag>}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{r.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">En attente de vérification</p>
              <p className="text-[15px] font-bold text-[#2E7D32]">{fmt(r.amount)}</p>
              <div>
                <p className="text-sm font-medium text-gray-800 font-mono">{r.session_id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400">{r.date} · {r.time}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF9EC] text-[#B45309]">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                En attente
              </span>
              <div className="flex items-center gap-2">
                {r.anomaly ? (
                  <button
                  disabled={busyId === r.id}
                    onClick={() => setAnomalieTarget(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-800 border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" /> Traiter
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecide(r.id, 'approved')}
                      disabled={busyId === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B5E20] border border-[#A7D1A2] hover:bg-[#DDEAD5] transition-colors"
                    >
                      <Check className="w-3 h-3" /> Valider
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleDecide(r.id, 'rejected')}
                      className="p-1.5 rounded-lg text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ── Archive ── */}
          {tab === 'archived' && archived.length === 0 && (
            <div className="py-14 text-center text-sm text-gray-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 font-medium">Aucune remise archivée</p>
              <p className="text-xs text-gray-400 mt-1">
                L&apos;historique apparaîtra ici une fois des remises traitées.
              </p>
            </div>
          )}

          {tab === 'archived' && paginatedList.map(r => {
            const isOpen = expandedId === r.id;
            return (
              <div key={r.id} className="border-b border-gray-50 last:border-0">

                {/* Ligne principale */}
                <div
                  onClick={() => toggleExpand(r.id)}
                  className={`grid grid-cols-[1.4fr_1.2fr_110px_1fr_1.5fr_110px_44px] gap-3 items-center px-5 py-3.5 cursor-pointer transition-colors ${
                    isOpen ? 'bg-[#F5F9F3]' : 'hover:bg-[#FAFAF6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={r.cashier.initials} color="green" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{r.cashier.name}</p>
                      <p className="text-xs text-gray-400">{r.id} · {r.session_id}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 italic">En attente de vérification</p>
                  <p className="text-[15px] font-bold text-[#2E7D32]">{fmt(r.amount)}</p>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.date}</p>
                    <p className="text-xs text-gray-400">{r.time}</p>
                  </div>
                  <div className="space-y-1">
                    <AuditStep label={`Remise · ${r.time}`} />
                    <AuditStep label={`Vérif · ${r.verified_by.name}`} />
                    <AuditStep label={`Décision · ${r.decided_by} · ${r.decided_at}`} />
                    {r.anomalie_decision && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                        <span className="text-xs text-yellow-700 font-medium">
                          Anomalie {r.anomalie_decision.resolution === 'justified' ? 'justifiée' : 'imputée'}
                          {r.anomalie_decision.amount ? ` · ${fmt(r.anomalie_decision.amount)}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Décision badge */}
                  <div>
                    {r.decision === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> Approuvé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rejeté
                      </span>
                    )}
                  </div>
                  {/* Chevron expand */}
                  <div className="flex justify-center">
                    {isOpen
                      ? <ChevronUp   className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>

                {/* Expand détail */}
                {isOpen && (
                  <div className="bg-[#F5F9F3] border-t border-[#DDEAD5] px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ExpandSection title="Acteurs">
                        <ExpandField label="Caissière"   value={r.cashier.name} />
                        <ExpandField label="Vérifié par" value={r.verified_by.name} />
                        <ExpandField label="Décidé par"  value={r.decided_by ?? '—'} />
                      </ExpandSection>
                      <ExpandSection title="Montants">
                        <ExpandField label="Ouverture (donné)"   value={fmt(r.opening_amount)} />
                        <ExpandField label="Fermeture (remis)"   value={fmt(r.amount)} green />
                        <ExpandField label="Écart net"
                          value={(() => {
                            const ecart = r.opening_amount - r.amount;
                            if (ecart === 0) return '—';
                            return (ecart > 0 ? '+' : '−') + fmt(Math.abs(ecart));
                          })()}
                        />
                        {r.anomalie_decision?.amount != null && (
                          <ExpandField
                            label={r.anomalie_decision.resolution === 'justified' ? 'Montant justifié' : 'Montant imputé'}
                            value={fmt(r.anomalie_decision.amount)}
                          />
                        )}
                        <ExpandField label="Session"      value={r.session_id} />
                        <ExpandField label="Date · Heure" value={`${r.date} · ${r.time}`} />
                      </ExpandSection>
                      <ExpandSection title="Note du trésorier">
                        {r.anomalie_decision ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                              {r.anomalie_decision.resolution === 'justified' ? 'Justification' : "Motif d'imputation"}
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg px-3 py-2.5 border border-[#DDEAD5]">
                              {r.anomalie_decision.note}
                            </p>
                          </div>
                        ) : r.reject_reason ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Motif de rejet</p>
                            <p className="text-sm text-red-600 leading-relaxed bg-red-50 rounded-lg px-3 py-2.5 border border-red-100">
                              {r.reject_reason}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Aucune note</p>
                        )}
                      </ExpandSection>
                    </div>

                    {/* Bouton export PDF */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={e => { e.stopPropagation(); exportRemisePDF(r); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Exporter PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Footer pagination */}
        {activeList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-[#F9F9F6] px-5 py-3 gap-3">
            <p className="text-xs text-gray-500">
              Affichage de <span className="font-semibold text-gray-700">{Math.min(activeList.length, (currentPage - 1) * pageSize + 1)}</span> à{" "}
              <span className="font-semibold text-gray-700">{Math.min(activeList.length, currentPage * pageSize)}</span> sur{" "}
              <span className="font-semibold text-gray-700">{activeList.length}</span> remise{activeList.length !== 1 ? 's' : ''}
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={activeList.length}
              pageSize={pageSize}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Modale anomalie */}
      <AnomalieModal
        remise={anomalieTarget}
        onClose={() => setAnomalieTarget(null)}
        onConfirm={handleAnomalieConfirm}
      />
    </div>
  );
};

// ─── Expand sub-composants ────────────────────────────────────────────────────
const ExpandSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const ExpandField: React.FC<{ label: string; value: string; green?: boolean }> = ({ label, value, green }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-xs text-gray-400 shrink-0">{label}</span>
    <span className={`text-sm font-medium text-right ${green ? 'text-[#2E7D32]' : 'text-gray-700'}`}>{value}</span>
  </div>
);

export default RemisesTable;