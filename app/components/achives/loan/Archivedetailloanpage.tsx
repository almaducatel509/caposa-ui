// app/dashboard/archives/loan/[id]/page.tsx
// Page de détail pour les archives de type pret_approuve et pret_refuse.
//
// ─── INTÉGRATION API ──────────────────────────────────────────────────────────
// En production, remplacer MOCK_LOAN_ARCHIVE par :
//   const archive = await fetch(`/api/archives/${params.id}`).then(r => r.json());
// Le type LoanArchiveData correspond à l'interface Archive<LoanMetadata> de l'API.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React from 'react';
import {
  ArrowLeft, Lock, User, Clock, FileText,
  Printer, CheckCircle2, XCircle, Banknote,
  Calendar, CreditCard, AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Types ────────────────────────────────────────────────────────────────────
// Correspond à Archive<LoanMetadata> côté API
interface LoanArchiveData {
  // Champs communs à toutes les archives
  id:           string;
  category:     'operational';
  type:         'pret_approuve' | 'pret_refuse';
  date:         Date;
  employeeId:   string;
  employeeName: string;
  employeeRole: string;
  summary:      string;
  isDeleted:    boolean;
  isLocked:     boolean;
  createdAt:    Date;
  updatedAt:    Date;

  // Données spécifiques au prêt — LoanMetadata
  loanData: {
    loanId:        string;       // Identifiant du prêt dans le système
    memberId:      string;       // Identifiant du membre
    memberName:    string;       // Nom complet du membre
    memberNumero:  string;       // Numéro de dossier membre
    montant:       number;       // Montant demandé en HTG
    type:          string;       // Type de prêt (commerce, logement, etc.)
    duree:         number;       // Durée en mois
    tauxInteret:   number;       // Taux d'intérêt annuel en %
    mensualite:    number;       // Mensualité calculée en HTG
    decision:      'approuve' | 'rejete';
    approvedBy?:   string;       // Nom du superviseur ayant approuvé
    approvedRole?: string;       // Rôle du superviseur
    rejectionReason?: string;    // Motif de refus si rejeté
    garantie?:     string;       // Type de garantie fournie
    but:           string;       // But déclaré du prêt
    commentaire?:  string;       // Commentaire de l'agent
  };
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: Remplacer par fetch(`/api/archives/${params.id}`) — voir commentaire en tête de fichier
const MOCK_LOAN_ARCHIVE: LoanArchiveData = {
  id:           'ARC_20260214_00004',
  category:     'operational',
  type:         'pret_approuve',
  date:         new Date('2026-02-14'),
  employeeId:   'emp_003',
  employeeName: 'Marie Tremblay',
  employeeRole: 'Agent de crédit',
  summary:      'Prêt approuvé — Jean Baptiste — 50 000 HTG',
  isDeleted:    false,
  isLocked:     true,
  createdAt:    new Date('2026-02-14T14:30:00'),
  updatedAt:    new Date('2026-02-14T14:30:00'),
  loanData: {
    loanId:       'loan_2026_0234',
    memberId:     'mbr_1234',
    memberName:   'Jean Baptiste',
    memberNumero: 'MBR-2023-1234',
    montant:      50000,
    type:         'Commerce',
    duree:        24,
    tauxInteret:  18,
    mensualite:   2500,
    decision:     'approuve',
    approvedBy:   'Réginald Toussaint',
    approvedRole: 'Superviseur de crédit',
    garantie:     'Bien immobilier — terrain section communale',
    but:          'Achat de stock pour épicerie — renouvellement fonds de roulement',
    commentaire:  'Membre fiable, historique de remboursement excellent sur 3 prêts précédents. Activité commerciale stable.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}
function formatDateTime(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ArchiveDetailLoanPage() {
  const router  = useRouter();

  // TODO: En prod, récupérer l'id depuis params et fetcher l'API
  // const { id } = params;
  // const archive = await fetchLoanArchive(id);
  const archive = MOCK_LOAN_ARCHIVE;
  const { loanData } = archive;

  const isApproved = loanData.decision === 'approuve';

  // TODO: handleExportPDF — POST /api/archives/${archive.id}/export-pdf
  const handleExportPDF = () => { console.log('TODO: Export PDF archive', archive.id); };
  const handlePrint     = () => { window.print(); };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-5">

        {/* Navigation */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-[#355C7D] hover:text-[#1E3A5F] text-sm font-semibold transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour aux archives
        </button>

        {/* ── Header carte ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: isApproved ? C.greenPale : '#FEF2F2' }}>
                {isApproved
                  ? <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                  : <XCircle      className="w-5 h-5 text-[#EF4444]" />
                }
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Archive — {isApproved ? 'Prêt approuvé' : 'Prêt refusé'}
                </h1>
                <p className="text-xs font-mono text-gray-400 mt-0.5">#{archive.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {archive.isLocked && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Verrouillée</span>
                </div>
              )}
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-[#F9F9F6] transition-colors">
                <Printer className="w-4 h-4" /> Imprimer
              </button>
              <button onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all">
                <FileText className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

          {/* Méta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {[
              { label: 'Type',            value: 'Opérationnel — Prêt'           },
              { label: 'Date décision',   value: formatDate(archive.date)        },
              { label: 'Archive créée le',value: formatDateTime(archive.createdAt) },
              { label: 'Modifiable',      value: 'Jamais'                        },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Décision ─────────────────────────────────────────────────────── */}
        <div className={`rounded-2xl border-2 p-5 flex items-center justify-between ${
          isApproved ? 'bg-[#DDEAD5]/30 border-[#DDEAD5]' : 'bg-[#FEF2F2] border-[#FCA5A5]'
        }`}>
          <div className="flex items-center gap-3">
            {isApproved
              ? <CheckCircle2 className="w-7 h-7 text-[#2E7D32] shrink-0" />
              : <XCircle      className="w-7 h-7 text-[#EF4444] shrink-0" />
            }
            <div>
              <p className="text-base font-bold" style={{ color: isApproved ? C.greenDark : '#B91C1C' }}>
                {isApproved ? 'Prêt approuvé' : 'Prêt refusé'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {isApproved
                  ? `Approuvé par ${loanData.approvedBy} — ${loanData.approvedRole}`
                  : `Refusé — ${loanData.rejectionReason ?? 'Motif non spécifié'}`
                }
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Montant</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: isApproved ? C.greenDark : '#B91C1C' }}>
              {formatHTG(loanData.montant)}
            </p>
          </div>
        </div>

        {/* ── Informations membre ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#355C7D]" />
            <p className="text-sm font-bold text-gray-800">Membre concerné</p>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#EBF2F8]/40 border border-[#BFDBFE]">
            <div className="w-12 h-12 rounded-xl bg-[#355C7D] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {loanData.memberName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{loanData.memberName}</p>
              <p className="text-xs font-mono text-gray-500 mt-0.5">{loanData.memberNumero}</p>
            </div>
            {/* TODO: En prod, ce lien pointe vers /dashboard/members/${loanData.memberId} */}
            <button onClick={() => router.push(`/dashboard/members/${loanData.memberId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BFDBFE] bg-white text-xs font-semibold text-[#355C7D] hover:bg-[#EBF2F8] transition-colors">
              Voir le dossier
            </button>
          </div>
        </div>

        {/* ── Détails du prêt ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#2E7D32]" />
            <p className="text-sm font-bold text-gray-800">Caractéristiques du prêt</p>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Montant',      value: formatHTG(loanData.montant),    accent: C.green },
              { label: 'Durée',        value: `${loanData.duree} mois`,       accent: C.blue  },
              { label: 'Taux annuel',  value: `${loanData.tauxInteret} %`,    accent: C.gold  },
              { label: 'Mensualité',   value: formatHTG(loanData.mensualite), accent: C.green },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl border p-3 text-center"
                style={{ backgroundColor: accent + '0D', borderColor: accent + '33' }}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-bold" style={{ color: accent }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Autres infos */}
          <div className="flex flex-col gap-2">
            {[
              { label: 'Type de prêt', value: loanData.type, icon: Banknote   },
              { label: 'But du prêt',  value: loanData.but,  icon: FileText   },
              { label: 'Garantie',     value: loanData.garantie ?? '—', icon: Lock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-[#F9F9F6] border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Commentaire de l'agent ────────────────────────────────────────── */}
        {loanData.commentaire && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Commentaire de l'agent de crédit
            </p>
            <div className="border-l-4 border-[#D4AF37] bg-[#FEF9EC]/60 p-4 rounded-r-xl">
              <p className="text-sm text-gray-700 leading-relaxed">{loanData.commentaire}</p>
            </div>
          </div>
        )}

        {/* ── Motif de refus ────────────────────────────────────────────────── */}
        {!isApproved && loanData.rejectionReason && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <p className="text-sm font-bold text-gray-800">Motif de refus</p>
            </div>
            <div className="border-l-4 border-[#EF4444] bg-[#FEF2F2]/60 p-4 rounded-r-xl">
              <p className="text-sm text-gray-700 leading-relaxed">{loanData.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* ── Traçabilité ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#355C7D]" />
            <p className="text-sm font-bold text-gray-800">Traçabilité</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Agent de crédit */}
            <div className="p-4 rounded-xl border bg-[#EBF2F8]/40 border-[#BFDBFE]">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Agent de crédit</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#355C7D] flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {archive.employeeName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{archive.employeeName}</p>
                  <p className="text-xs text-gray-500">{archive.employeeRole}</p>
                  {/* TODO: En prod, afficher archive.employeeId si nécessaire */}
                </div>
              </div>
            </div>

            {/* Superviseur */}
            {isApproved && loanData.approvedBy && (
              <div className="p-4 rounded-xl border bg-[#DDEAD5]/40 border-[#DDEAD5]">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Approuvé par</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {loanData.approvedBy.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{loanData.approvedBy}</p>
                    <p className="text-xs text-gray-500">{loanData.approvedRole}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Horodatage */}
            <div className="p-4 rounded-xl border bg-[#F9F9F6] border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Horodatage
              </p>
              <p className="text-xs text-gray-500 mb-0.5">Archive créée</p>
              <p className="text-xs font-semibold font-mono text-gray-700">{formatDateTime(archive.createdAt)}</p>
              <p className="text-xs font-bold text-[#B91C1C] mt-2">Modifiable : Jamais</p>
            </div>

            {/* Référence prêt */}
            <div className="p-4 rounded-xl border bg-[#F9F9F6] border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Référence prêt</p>
              {/* TODO: En prod, ce lien pointe vers /dashboard/loans/${loanData.loanId} */}
              <button onClick={() => router.push(`/dashboard/loans/${loanData.loanId}`)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#355C7D] hover:underline">
                <FileText className="w-3.5 h-3.5" />
                {loanData.loanId}
              </button>
              <p className="text-xs text-gray-400 mt-1">Voir le dossier de prêt complet</p>
            </div>
          </div>
        </div>

        {/* ── Immuabilité ───────────────────────────────────────────────────── */}
        <div className="p-4 rounded-2xl border-2 bg-[#FEF2F2] border-[#FCA5A5]">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#B91C1C] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B91C1C] mb-1">Décision officielle de crédit — Archive immuable</p>
              <ul className="flex flex-col gap-1 text-xs text-[#B91C1C]">
                <li>• Cette décision de prêt ne peut jamais être modifiée ou désactivée.</li>
                <li>• Elle constitue une pièce officielle du dossier de crédit du membre.</li>
                <li>• Ce document fait foi en cas d'audit ou de litige.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}