'use client';

import React from 'react';
import {
  X, ArrowDownCircle, TrendingDown, ArrowLeftRight, Landmark,
  User, CreditCard, Hash, FileText, Clock, ShieldCheck,
  CheckCircle2, AlertTriangle, XCircle, Loader2,
  Banknote, Building2, Calendar, Tag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type TransactionKind = 'deposit' | 'withdrawal' | 'transfer' | 'loan';

export interface TransactionDetail {
  // Commun
  id:               string | number;
  kind:             TransactionKind;
  status:           'completed' | 'pending' | 'processing' | 'failed';
  montant:          number;
  created_at:       string;
  codeAutorisation?: string;
  description?:     string;
  reference?:       string;

  // Membre / Compte
  member_name?:     string;
  member_id?:       string;
  account_number?:  string;
  idCompte?:        string;

  // Dépôt
  depositSubtype?:  'cash' | 'check' | 'transfer' | 'other';
  source?:          string;
  holdPeriod?:      number;
  requiresVerification?: boolean;
  transferReference?: string;
  senderName?:      string;

  // Retrait
  withdrawalSubtype?: 'counter' | 'check' | 'loan_disbursement' | 'other';
  motif?:           string;

  // Virement
  transferType?:    'internal' | 'supplier' | 'loan_payment';
  compteSource?:    string;
  compteDestination?: string;
  supplierName?:    string;
  invoiceRef?:      string;
  loanNumber?:      string;

  // Prêt
  loanPurpose?:     string;
  monthlyPayment?:  number;
  remainingBalance?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const KIND_CFG: Record<TransactionKind, { label: string; icon: React.ElementType; color: string; bg: string; gradient: string }> = {
  deposit:    { label: 'Dépôt',    icon: ArrowDownCircle, color: '#2E7D32', bg: '#DDEAD5', gradient: 'from-[#2E7D32] to-[#1B5E20]' },
  withdrawal: { label: 'Retrait',  icon: TrendingDown,    color: '#DC2626', bg: '#FEF2F2', gradient: 'from-[#DC2626] to-[#B91C1C]' },
  transfer:   { label: 'Virement', icon: ArrowLeftRight,  color: '#355C7D', bg: '#EBF2F8', gradient: 'from-[#355C7D] to-[#2C4D69]' },
  loan:       { label: 'Prêt',     icon: Landmark,        color: '#D4AF37', bg: '#FBF6E7', gradient: 'from-[#D4AF37] to-[#B8962E]' },
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string; icon: React.ElementType }> = {
  completed:  { label: 'Complétée',  bg: '#DDEAD5', text: '#1B5E20', dot: '#2E7D32', icon: CheckCircle2  },
  pending:    { label: 'En attente', bg: '#FEF9EC', text: '#B45309', dot: '#F59E0B', icon: Clock         },
  processing: { label: 'En cours',   bg: '#EBF2F8', text: '#355C7D', dot: '#355C7D', icon: Loader2       },
  failed:     { label: 'Échouée',    bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', icon: XCircle       },
};

const DEPOSIT_SUBTYPE: Record<string, string> = {
  cash: 'Espèces', check: 'Chèque', transfer: 'Virement', other: 'Autre',
};
const WITHDRAWAL_SUBTYPE: Record<string, string> = {
  counter: 'Comptoir', check: 'Chèque', loan_disbursement: 'Décaissement prêt', other: 'Autre',
};
const TRANSFER_TYPE: Record<string, string> = {
  internal: 'Entre comptes', supplier: 'Fournisseur', loan_payment: 'Remboursement prêt',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n?: number) {
  if (n == null) return '—';
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Row({ icon: Icon, label, value, mono, accent }: {
  icon: React.ElementType; label: string; value?: string | number | null;
  mono?: boolean; accent?: string;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#F9F9F6] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold break-all ${mono ? 'font-mono' : ''}`}
          style={{ color: accent ?? '#1f2937' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</p>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  onClose:     () => void;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const kindCfg   = KIND_CFG[transaction.kind];
  const statusCfg = STATUS_CFG[transaction.status] ?? STATUS_CFG['pending'];
  const KindIcon  = kindCfg.icon;
  const StatusIcon = statusCfg.icon;

  const account = transaction.account_number ?? transaction.idCompte ?? transaction.compteSource;

  // Signe montant
  const montantSign =
    transaction.kind === 'deposit'    ? '+' :
    transaction.kind === 'withdrawal' ? '−' : '';
  const montantColor =
    transaction.kind === 'deposit'    ? '#2E7D32' :
    transaction.kind === 'withdrawal' ? '#DC2626'  :
    transaction.kind === 'transfer'   ? '#355C7D'  : '#D4AF37';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${kindCfg.gradient} flex items-center justify-center`}>
              <KindIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Détail — {kindCfg.label}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {transaction.reference ?? `#${transaction.id}`}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Bandeau montant + statut ── */}
        <div className="px-5 py-5 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Montant</p>
            <p className="text-3xl font-bold" style={{ color: montantColor }}>
              {montantSign}{formatHTG(transaction.montant)}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${transaction.status === 'processing' || transaction.status === 'pending' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: statusCfg.dot }} />
            {statusCfg.label}
          </span>
        </div>

        {/* ── Corps ── */}
        <div className="p-4 flex flex-col gap-3">

          {/* Membre & Compte */}
          <Section title="Membre et compte">
            <Row icon={User}       label="Membre"  value={transaction.member_name} />
            <Row icon={CreditCard} label="Compte"  value={account}                 mono />
            {transaction.member_id && (
              <Row icon={Hash} label="N° membre" value={transaction.member_id} mono />
            )}
          </Section>

          {/* Détails spécifiques selon le type */}
          {transaction.kind === 'deposit' && (
            <Section title="Détails du dépôt">
              <Row icon={Banknote}   label="Type"   value={DEPOSIT_SUBTYPE[transaction.depositSubtype ?? ''] ?? '—'} />
              <Row icon={Tag}        label="Source" value={transaction.source} />
              {transaction.depositSubtype === 'transfer' && (
                <>
                  <Row icon={Hash}     label="Référence virement" value={transaction.transferReference} mono />
                  <Row icon={User}     label="Émetteur"            value={transaction.senderName} />
                </>
              )}
              {(transaction.holdPeriod ?? 0) > 0 && (
                <Row icon={Clock} label="Délai de compensation"
                  value={`${transaction.holdPeriod} jour${transaction.holdPeriod! > 1 ? 's' : ''}`}
                  accent="#B45309" />
              )}
            </Section>
          )}

          {transaction.kind === 'withdrawal' && (
            <Section title="Détails du retrait">
              <Row icon={TrendingDown} label="Type"  value={WITHDRAWAL_SUBTYPE[transaction.withdrawalSubtype ?? ''] ?? '—'} />
              <Row icon={Tag}          label="Motif" value={transaction.motif} />
            </Section>
          )}

          {transaction.kind === 'transfer' && (
            <Section title="Détails du virement">
              <Row icon={ArrowLeftRight} label="Type"             value={TRANSFER_TYPE[transaction.transferType ?? ''] ?? '—'} />
              {transaction.compteSource      && <Row icon={CreditCard} label="Compte source"      value={transaction.compteSource}      mono />}
              {transaction.compteDestination && <Row icon={CreditCard} label="Compte destination" value={transaction.compteDestination} mono />}
              {transaction.supplierName      && <Row icon={Building2}  label="Fournisseur"         value={transaction.supplierName} />}
              {transaction.invoiceRef        && <Row icon={FileText}   label="Référence facture"   value={transaction.invoiceRef}   mono />}
              {transaction.loanNumber        && <Row icon={Landmark}   label="N° prêt"             value={transaction.loanNumber}   mono />}
            </Section>
          )}

          {transaction.kind === 'loan' && (
            <Section title="Détails du prêt">
              <Row icon={Landmark} label="Objet"           value={transaction.loanPurpose} />
              <Row icon={Banknote} label="Mensualité"       value={formatHTG(transaction.monthlyPayment)} />
              <Row icon={Banknote} label="Solde restant"    value={formatHTG(transaction.remainingBalance)} accent="#355C7D" />
            </Section>
          )}

          {/* Informations générales */}
          <Section title="Informations générales">
            <Row icon={Calendar}     label="Date et heure"       value={formatDateTime(transaction.created_at)} />
            {transaction.reference && <Row icon={Hash} label="Référence" value={transaction.reference} mono />}
            {transaction.description && <Row icon={FileText} label="Description" value={transaction.description} />}
          </Section>

          {/* Autorisation */}
          {transaction.codeAutorisation && (
            <Section title="Autorisation">
              <Row icon={ShieldCheck} label="Code d'autorisation"
                value={transaction.codeAutorisation} mono accent="#355C7D" />
              <div className="flex items-start gap-2 px-1 py-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#355C7D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#355C7D]">
                  Code fourni par le superviseur ou le chef de caisse.
                </p>
              </div>
            </Section>
          )}

          {/* Avertissements */}
          {transaction.requiresVerification && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 font-medium">
                Cette transaction nécessite une vérification superviseur.
              </p>
            </div>
          )}
          {transaction.status === 'failed' && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">
                Transaction échouée — veuillez contacter un superviseur pour vérification.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 bg-white border-t border-gray-100 flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}