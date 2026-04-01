// app/dashboard/archives/transaction/[id]/page.tsx
// Page de détail pour les archives de type transaction_journaliere.
// Couvre : dépôts, retraits, décaissements de prêt, remboursements.
//
// ─── INTÉGRATION API ──────────────────────────────────────────────────────────
// En production, remplacer MOCK_TRANSACTION_ARCHIVE par :
//   const archive = await fetch(`/api/archives/${params.id}`).then(r => r.json());
// Le type TransactionArchiveData correspond à Archive<TransactionMetadata> de l'API.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React from 'react';
import {
  ArrowLeft, Lock, User, Clock, FileText,
  Printer, CheckCircle2, AlertTriangle,
  Banknote, ArrowDownCircle, ArrowUpCircle, Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Types ────────────────────────────────────────────────────────────────────
// Correspond à Archive<TransactionMetadata> côté API
type TransactionType = 'depot' | 'retrait' | 'decaissement_pret' | 'remboursement_pret';
type TransactionStatus = 'decaisse' | 'en_attente' | 'echoue';

interface TransactionArchiveData {
  // Champs communs à toutes les archives
  id:           string;
  category:     'operational';
  type:         'transaction_journaliere';
  date:         Date;
  employeeId:   string;
  employeeName: string;
  employeeRole: string;
  summary:      string;
  isDeleted:    boolean;
  isLocked:     boolean;
  createdAt:    Date;
  updatedAt:    Date;

  // Données spécifiques à la transaction — TransactionMetadata
  transactionData: {
    transactionId:  string;          // Identifiant unique de la transaction
    memberId:       string;          // Identifiant du membre
    memberName:     string;          // Nom complet du membre
    memberNumero:   string;          // Numéro de dossier membre
    accountId:      string;          // Identifiant du compte débité/crédité
    accountNumero:  string;          // Numéro de compte
    montant:        number;          // Montant en HTG
    transType:      TransactionType; // Type de mouvement
    status:         TransactionStatus;
    caisseId:       string;          // Identifiant de la caisse
    caisseNumero:   string;          // Numéro de la caisse physique
    sessionId:      string;          // Session caisse associée
    recu:           string;          // Numéro de reçu imprimé
    soldeAvant:     number;          // Solde compte avant transaction
    soldeApres:     number;          // Solde compte après transaction
    note?:          string;          // Note optionnelle du caissier
  };
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: Remplacer par fetch(`/api/archives/${params.id}`) — voir commentaire en tête de fichier
const MOCK_TRANSACTION_ARCHIVE: TransactionArchiveData = {
  id:           'ARC_20260215_00006',
  category:     'operational',
  type:         'transaction_journaliere',
  date:         new Date('2026-02-15'),
  employeeId:   'emp_001',
  employeeName: 'Jean Dupont',
  employeeRole: 'Caissier',
  summary:      'Dépôt — Sophie Lavoie — 15 000 HTG',
  isDeleted:    false,
  isLocked:     true,
  createdAt:    new Date('2026-02-15T11:20:00'),
  updatedAt:    new Date('2026-02-15T11:20:00'),
  transactionData: {
    transactionId: 'tx_20260215_0123',
    memberId:      'mbr_5678',
    memberName:    'Sophie Lavoie',
    memberNumero:  'MBR-2022-5678',
    accountId:     'acc_5678_01',
    accountNumero: 'CPT-2022-5678-01',
    montant:       15000,
    transType:     'depot',
    status:        'decaisse',
    caisseId:      'CAI-001',
    caisseNumero:  '01',
    sessionId:     'SES-1023',
    recu:          'REC-20260215-0123',
    soldeAvant:    32500,
    soldeApres:    47500,
    note:          'Dépôt espèces — billets vérifiés.',
  },
};

// ─── Config types de transaction ──────────────────────────────────────────────
const TRANS_TYPE_CFG: Record<TransactionType, {
  label: string; icon: React.ElementType; bg: string; text: string; direction: 'credit' | 'debit'
}> = {
  depot:              { label: 'Dépôt',                  icon: ArrowDownCircle, bg: C.greenPale, text: C.greenDark, direction: 'credit' },
  retrait:            { label: 'Retrait',                icon: ArrowUpCircle,   bg: '#FEF2F2',   text: '#B91C1C',   direction: 'debit'  },
  decaissement_pret:  { label: 'Décaissement de prêt',   icon: ArrowUpCircle,   bg: '#EBF2F8',   text: C.blue,      direction: 'debit'  },
  remboursement_pret: { label: 'Remboursement de prêt',  icon: ArrowDownCircle, bg: C.greenPale, text: C.greenDark, direction: 'credit' },
};

const STATUS_CFG: Record<TransactionStatus, { label: string; bg: string; text: string }> = {
  decaisse:   { label: 'Complétée',  bg: C.greenPale, text: C.greenDark },
  en_attente: { label: 'En attente', bg: '#FEF9EC',   text: '#B45309'   },
  echoue:     { label: 'Échouée',    bg: '#FEF2F2',   text: '#B91C1C'   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}
function formatDateTime(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ArchiveDetailTransactionPage() {
  const router = useRouter();

  // TODO: En prod, récupérer l'id depuis params et fetcher l'API
  // const { id } = params;
  // const archive = await fetchTransactionArchive(id);
  const archive = MOCK_TRANSACTION_ARCHIVE;
  const { transactionData: tx } = archive;

  const typeCfg   = TRANS_TYPE_CFG[tx.transType];
  const statusCfg = STATUS_CFG[tx.status];
  const TypeIcon  = typeCfg.icon;

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
                style={{ backgroundColor: typeCfg.bg }}>
                <TypeIcon className="w-5 h-5" style={{ color: typeCfg.text }} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Archive — {typeCfg.label}
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
              <button onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-[#F9F9F6] transition-colors">
                <Printer className="w-4 h-4" /> Imprimer
              </button>
              {/* TODO: handleExportPDF → POST /api/archives/${archive.id}/export-pdf */}
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all">
                <FileText className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {[
              { label: 'Type',            value: 'Opérationnel — Transaction'    },
              { label: 'Date',            value: archive.date.toLocaleDateString('fr-FR') },
              { label: 'Archive créée le',value: formatDateTime(archive.createdAt) },
              { label: 'Reçu',            value: tx.recu                         },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Montant & statut ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border-2 p-5 flex items-center justify-between"
          style={{ backgroundColor: typeCfg.bg, borderColor: typeCfg.text + '33' }}>
          <div className="flex items-center gap-3">
            <TypeIcon className="w-7 h-7 shrink-0" style={{ color: typeCfg.text }} />
            <div>
              <p className="text-base font-bold" style={{ color: typeCfg.text }}>{typeCfg.label}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold mt-1"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
                {tx.status === 'decaisse' && <CheckCircle2 className="w-3 h-3" />}
                {tx.status === 'echoue'   && <AlertTriangle className="w-3 h-3" />}
                {statusCfg.label}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">Montant</p>
            <p className="text-3xl font-bold mt-0.5" style={{ color: typeCfg.text }}>
              {typeCfg.direction === 'credit' ? '+' : '-'}{formatHTG(tx.montant)}
            </p>
          </div>
        </div>

        {/* ── Membre & compte ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#355C7D]" />
            <p className="text-sm font-bold text-gray-800">Membre & compte</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Membre */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#EBF2F8]/40 border border-[#BFDBFE]">
              <div className="w-10 h-10 rounded-xl bg-[#355C7D] flex items-center justify-center text-white font-bold shrink-0">
                {tx.memberName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{tx.memberName}</p>
                <p className="text-xs font-mono text-gray-400">{tx.memberNumero}</p>
              </div>
              {/* TODO: En prod, lien vers dashboard/archives */}
              <button onClick={() => router.push(`/dashboard/archives/`)}
                className="text-xs font-semibold text-[#355C7D] hover:underline shrink-0">
                Dossier
              </button>
            </div>

            {/* Compte */}
            <div className="p-4 rounded-xl bg-[#F9F9F6] border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Compte</p>
              <p className="text-sm font-bold text-gray-800 font-mono">{tx.accountNumero}</p>
              {/* TODO: En prod, lien vers /dashboard/accounts/${tx.accountId} */}
              <button onClick={() => router.push(`/dashboard/accounts/${tx.accountId}`)}
                className="text-xs font-semibold text-[#355C7D] hover:underline mt-1 block">
                Voir le compte
              </button>
            </div>
          </div>
        </div>

        {/* ── Mouvement du solde ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Banknote className="w-4 h-4 text-[#2E7D32]" />
            <p className="text-sm font-bold text-gray-800">Mouvement du solde</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Solde avant',    value: formatHTG(tx.soldeAvant), accent: C.blue  },
              { label: 'Mouvement',      value: `${typeCfg.direction === 'credit' ? '+' : '-'}${formatHTG(tx.montant)}`, accent: typeCfg.direction === 'credit' ? C.green : '#EF4444' },
              { label: 'Solde après',    value: formatHTG(tx.soldeApres), accent: C.green },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: accent + '0D', borderColor: accent + '33' }}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-bold" style={{ color: accent }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Traçabilité caisse ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#355C7D]" />
            <p className="text-sm font-bold text-gray-800">Traçabilité caisse</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Caissier',           value: archive.employeeName                },
              { label: 'Caisse',             value: `Caisse #${tx.caisseNumero}`        },
              { label: 'Session caisse',     value: tx.sessionId                        },
              { label: 'ID Transaction',     value: tx.transactionId                    },
              { label: 'Horodatage archive', value: formatDateTime(archive.createdAt)   },
              { label: 'Reçu',               value: tx.recu                             },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-[#F9F9F6] border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-gray-800 font-mono">{value}</p>
              </div>
            ))}
          </div>

          {/* TODO: En prod, lien vers /dashboard/caisses/${tx.caisseId}/sessions/${tx.sessionId} */}
          <button onClick={() => router.push(`/dashboard/caisses/${tx.caisseId}/sessions/${tx.sessionId}`)}
            className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#355C7D] hover:underline">
            <FileText className="w-3.5 h-3.5" />
            Voir la session caisse complète
          </button>
        </div>

        {/* ── Note du caissier ─────────────────────────────────────────────── */}
        {tx.note && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Note du caissier</p>
            <div className="border-l-4 border-[#D4AF37] bg-[#FEF9EC]/60 p-4 rounded-r-xl">
              <p className="text-sm text-gray-700 leading-relaxed">{tx.note}</p>
            </div>
          </div>
        )}

        {/* ── Immuabilité ───────────────────────────────────────────────────── */}
        <div className="p-4 rounded-2xl border-2 bg-[#FEF2F2] border-[#FCA5A5]">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#B91C1C] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B91C1C] mb-1">Archive immuable — Transaction journalière</p>
              <ul className="flex flex-col gap-1 text-xs text-[#B91C1C]">
                <li>• Cette transaction ne peut jamais être modifiée ou supprimée.</li>
                <li>• Elle est liée à la session caisse #{tx.sessionId} et au reçu {tx.recu}.</li>
                <li>• Ce document fait foi en cas de réconciliation ou d'audit.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 