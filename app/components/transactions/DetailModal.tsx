'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, ArrowDownCircle, TrendingDown, ArrowLeftRight, Landmark,
  User, CreditCard, Hash, FileText, Clock, ShieldCheck,
  CheckCircle2, AlertTriangle, XCircle, Loader2,
  Banknote, Building2, Calendar, Tag, ExternalLink,
  UserCheck, Cpu, Receipt,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getDepositAudit } from '@/app/lib/api/deposit';

// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Types ────────────────────────────────────────────────────────────────────
export type TransactionKind = 'deposit' | 'withdrawal' | 'transfer' | 'loan';

// ─── Base commune à toutes les transactions ──────────────────────────────────
interface TransactionBase {
  id:                string | number;
  montant:           number;
  created_at:        string;
  codeAutorisation?: string;
  description?:      string;
  reference?:        string;

  // Membre / Compte
  member_name?:    string;
  member_id?:      string;
  account_number?: string;
  idCompte?:       string;
  requiresVerification?: boolean;
  mensualité?: number;
  remainingBalance?: number;

  // Traçabilité
  processed_by?:    string;
  processed_by_id?: string;
  validated_by?:    string;
  validated_by_id?: string;
  caisse_numero?:   string;
  caisse_id?:       string;
  session_id?:      string;
}

// ─── Dépôt ───────────────────────────────────────────────────────────────────
export interface DepositDetail extends TransactionBase {
  kind:   'deposit';
  status: 'encaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';

  depositSubtype?:       'cash' | 'check' | 'transfer' | 'other';
  source?:               string;
  holdPeriod?:           number;
  requiresVerification?: boolean;
  transferReference?:    string;
  senderName?:           string;
}

// ─── Retrait ─────────────────────────────────────────────────────────────────
export interface WithdrawalDetail extends TransactionBase {
  kind:   'withdrawal';
  status: 'decaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule' | 'rembourse';

  withdrawalSubtype?:    'counter' | 'check' | 'loan_disbursement' | 'other';
  motif?:                string;
  requiresVerification?: boolean;
}

// ─── Virement ────────────────────────────────────────────────────────────────
export interface TransferDetail extends TransactionBase {
  kind:   'transfer';
  status: 'decaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';

  transferType?:      'internal' | 'supplier' | 'loan_payment';
  compteSource?:      string;
  compteDestination?: string;
  supplierName?:      string;
  invoiceRef?:        string;
  loanNumber?:        string;
}

// ─── Prêt ────────────────────────────────────────────────────────────────────
export interface LoanDetail extends TransactionBase {
  kind:   'loan';
  status: 'decaisse' | 'rembourse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';

  loanPurpose?:     string;
  monthlyPayment?:  number;
  remainingBalance?: number;
}

// ─── Union discriminée ───────────────────────────────────────────────────────
export type TransactionDetail =
  | DepositDetail
  | WithdrawalDetail
  | TransferDetail
  | LoanDetail;

// ─── Config ───────────────────────────────────────────────────────────────────
const KIND_CFG: Record<TransactionKind, { label: string; icon: React.ElementType; color: string; bg: string; gradient: string }> = {
  deposit:    { label: 'Dépôt',    icon: ArrowDownCircle, color: '#2E7D32', bg: '#DDEAD5', gradient: 'from-[#2E7D32] to-[#1B5E20]' },
  withdrawal: { label: 'Retrait',  icon: TrendingDown,    color: '#DC2626', bg: '#FEF2F2', gradient: 'from-[#DC2626] to-[#B91C1C]' },
  transfer:   { label: 'Virement', icon: ArrowLeftRight,  color: '#355C7D', bg: '#EBF2F8', gradient: 'from-[#355C7D] to-[#2C4D69]' },
  loan:       { label: 'Prêt',     icon: Landmark,        color: '#D4AF37', bg: '#FBF6E7', gradient: 'from-[#D4AF37] to-[#B8962E]' },
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string; icon: React.ElementType }> = {
  decaisse:   { label: 'Décaissé',    bg: '#DDEAD5', text: '#1B5E20', dot: '#2E7D32', icon: CheckCircle2 },
  rembourse:  { label: 'Remboursé',   bg: '#F0FDF4', text: '#166534', dot: '#22C55E', icon: CheckCircle2 },
  en_attente: { label: 'En attente',  bg: '#FEF9EC', text: '#B45309', dot: '#F59E0B', icon: Clock        },
  en_cours:   { label: 'En cours',    bg: '#EBF2F8', text: '#355C7D', dot: '#355C7D', icon: Loader2      },
  echoue:     { label: 'Échoué',      bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', icon: XCircle      },
  annule:     { label: 'Annulé',      bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF', icon: XCircle      },
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
  }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Row simple ───────────────────────────────────────────────────────────────
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

// ─── Row cliquable (lien interne) ─────────────────────────────────────────────
function LinkRow({ icon: Icon, label, value, href, tooltip, mono, accent }: {
  icon: React.ElementType; label: string; value?: string | null;
  href: string; tooltip: string; mono?: boolean; accent?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#F9F9F6] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <a
          href={href}
          title={tooltip}
          className={`group inline-flex items-center gap-1.5 text-sm font-semibold break-all underline underline-offset-2 decoration-dotted
            hover:decoration-solid transition-all ${mono ? 'font-mono' : ''}`}
          style={{ color: accent ?? '#355C7D' }}
        >
          {value}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </a>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
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
  const statusCfg = STATUS_CFG[transaction.status] ?? STATUS_CFG['en_attente'];
  const KindIcon  = kindCfg.icon;

  const account =
    transaction.account_number ??
    transaction.idCompte ??
    (transaction.kind === 'transfer' ? transaction.compteSource : undefined);

  const montantSign =
    transaction.kind === 'deposit'    ? '+' :
    transaction.kind === 'withdrawal' ? '−' : '';
  const montantColor =
    transaction.kind === 'deposit'    ? '#2E7D32' :
    transaction.kind === 'withdrawal' ? '#DC2626'  :
    transaction.kind === 'transfer'   ? '#355C7D'  : '#D4AF37';

  // Liens de navigation
  const memberHref  = transaction.member_id
    ? `/dashboard/members/${transaction.member_id}`
    : transaction.member_name
    ? `/dashboard/members?search=${encodeURIComponent(transaction.member_name)}`
    : '#';
  const accountHref = account
    ? `/dashboard/accounts/${account}`
    : '#';
    // une fonction dédiée pour récupérer l’audit d’un dépôt 
// useEffect(() => {
//   async function loadAudit() {
//     const data = await getDepositAudit(id);
//     setAudit(data);
//   }
//   loadAudit();
// }, [id]);

  return (
    <Modal
    isOpen
    onClose={onClose}
    size="3xl"
    title={
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${kindCfg.gradient} flex items-center justify-center`}>
          <KindIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Détail — {kindCfg.label}</p>
          <p className="text-xs text-gray-400 font-mono">
            {transaction.reference ?? `#${transaction.id}`}
          </p>
        </div>
      </div>
    }
  >
    <div className="overflow-y-auto max-h-[75vh] bg-[#F9F9F6]">
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
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                transaction.status === 'en_cours' || transaction.status === 'en_attente' ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: statusCfg.dot }}
            />
            {statusCfg.label}
          </span>
        </div>

        {/* ── Corps ── */}
        <div className="p-4 flex flex-col gap-3">

          {/* ── Membre & Compte — liens cliquables ── */}
          <Section title="Membre et compte">
            <LinkRow
              icon={User}
              label="Membre"
              value={transaction.member_name}
              href={memberHref}
              tooltip="Voir la fiche du membre"
              accent="#355C7D"
            />
            <LinkRow
              icon={CreditCard}
              label="Compte"
              value={account}
              href={accountHref}
              tooltip="Voir le détail du compte"
              mono
              accent="#355C7D"
            />
            {transaction.member_id && (
              <Row icon={Hash} label="N° membre" value={transaction.member_id} mono />
            )}
          </Section>

          {/* ── Détails spécifiques selon le type ── */}
          {transaction.kind === 'deposit' && (
            <Section title="Détails du dépôt">
              <Row icon={Banknote} label="Type"   value={DEPOSIT_SUBTYPE[transaction.depositSubtype ?? ''] ?? '—'} />
              <Row icon={Tag}      label="Source" value={transaction.source} />
              {transaction.depositSubtype === 'transfer' && (
                <>
                  <Row icon={Hash} label="Référence virement" value={transaction.transferReference} mono />
                  <Row icon={User} label="Émetteur"            value={transaction.senderName} />
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
              <Row icon={ArrowLeftRight} label="Type" value={TRANSFER_TYPE[transaction.transferType ?? ''] ?? '—'} />
              {transaction.compteSource && (
                <LinkRow
                  icon={CreditCard}
                  label="Compte source"
                  value={transaction.compteSource}
                  href={`/dashboard/accounts/${transaction.compteSource}`}
                  tooltip="Voir le compte source"
                  mono accent="#355C7D"
                />
              )}
              {transaction.compteDestination && (
                <LinkRow
                  icon={CreditCard}
                  label="Compte destination"
                  value={transaction.compteDestination}
                  href={`/dashboard/accounts/${transaction.compteDestination}`}
                  tooltip="Voir le compte destination"
                  mono accent="#355C7D"
                />
              )}
              {transaction.supplierName && <Row icon={Building2} label="Fournisseur"       value={transaction.supplierName} />}
              {transaction.invoiceRef   && <Row icon={FileText}  label="Référence facture" value={transaction.invoiceRef} mono />}
              {transaction.loanNumber   && <Row icon={Landmark}  label="N° prêt"           value={transaction.loanNumber} mono />}
            </Section>
          )}

          {transaction.kind === 'loan' && (
            <Section title="Détails du prêt">
              <Row icon={Landmark} label="Objet"        value={transaction.loanPurpose} />
              <Row icon={Banknote} label="Mensualité"   value={formatHTG(transaction.monthlyPayment)} />
              <Row icon={Banknote} label="Solde restant" value={formatHTG(transaction.remainingBalance)} accent="#355C7D" />
            </Section>
          )}

          {/* ── Traçabilité ── */}
          <Section title="Traçabilité">

            {/* Date et heure */}
            <div className="flex items-start gap-3 py-2.5 border-b border-gray-50">
              <div className="w-7 h-7 rounded-lg bg-[#F9F9F6] flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Date et heure</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {formatDateTime(transaction.created_at)}
                </p>
              </div>
            </div>

            {/* Effectué par */}
            {transaction.processed_by && (
              <LinkRow
                icon={Cpu}
                label="Effectué par"
                value={transaction.processed_by}
                href={
                  transaction.processed_by_id
                    ? `/dashboard/employees/${transaction.processed_by_id}`
                    : `#`
                }
                tooltip="Voir la fiche de l'employé"
                accent="#2E7D32"
              />
            )}

            {/* Validé par */}
            {transaction.validated_by && (
              <LinkRow
                icon={UserCheck}
                label="Validé par"
                value={transaction.validated_by}
                href={
                  transaction.validated_by_id
                    ? `/dashboard/employees/${transaction.validated_by_id}`
                    : `#`
                }
                tooltip="Voir la fiche du superviseur"
                accent="#355C7D"
              />
            )}

            {/* Caisse */}
            {transaction.caisse_numero && (
              <LinkRow
                icon={Receipt}
                label="Caisse"
                value={`Caisse n° ${transaction.caisse_numero}`}
                href={
                  transaction.caisse_id
                    ? `/dashboard/caisses/${transaction.caisse_id}`
                    : `#`
                }
                tooltip="Voir le détail de la caisse"
                mono
                accent="#D4AF37"
              />
            )}

            {/* Session */}
            {transaction.session_id && (
              <Row
                icon={Hash}
                label="Session caisse"
                value={transaction.session_id}
                mono
                accent="#6E6E6E"
              />
            )}

            {/* Référence */}
            {transaction.reference && (
              <Row icon={Hash} label="Référence" value={transaction.reference} mono />
            )}
          </Section>

          {/* ── Autorisation ── */}
          {transaction.codeAutorisation && (
            <Section title="Autorisation superviseur">
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

          {/* ── Avertissements ── */}
          {transaction.requiresVerification && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 font-medium">
                Cette transaction nécessite une vérification superviseur.
              </p>
            </div>
          )}
          {transaction.status === 'echoue' && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">
                Transaction échouée — veuillez contacter un superviseur pour vérification.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Footer — fixe en bas, jamais dans le scroll */}
      <div className="px-5 py-4 bg-white border-t border-gray-100 flex justify-end shrink-0 rounded-2xl">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
          Fermer
        </button>
      </div>
  </Modal>
  );
}