'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowDownCircle, TrendingDown, ArrowLeftRight, Landmark,
  User, CreditCard, Hash, FileText, Clock,
  CheckCircle2, AlertTriangle, XCircle, Loader2,
  Banknote, Building2, Calendar, Tag, ExternalLink,
  UserCheck, Cpu, Receipt,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { fetchEmployeeById } from '@/app/lib/api/deposit';

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
  status: 'approuve' | 'decaisse' | 'en_attente' | 'en_cours' | 'echoue' | 'annule';

  transferType?:      'interne' | 'externe' | 'internal' | 'supplier' | 'loan_payment';
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
  approuve:   { label: 'Approuvé',    bg: '#DDEAD5', text: '#1B5E20', dot: '#2E7D32', icon: CheckCircle2 },
  rembourse:  { label: 'Remboursé',   bg: '#F0FDF4', text: '#166534', dot: '#22C55E', icon: CheckCircle2 },
  en_attente: { label: 'En attente',  bg: '#FEF9EC', text: '#B45309', dot: '#F59E0B', icon: Clock        },
  en_cours:   { label: 'En cours',    bg: '#EBF2F8', text: '#355C7D', dot: '#355C7D', icon: Loader2      },
  echoue:     { label: 'Échoué',      bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', icon: XCircle      },
  annule:     { label: 'Annulé',      bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF', icon: XCircle      },
  encaisse:   { label: 'Encaissé',    bg: '#DDEAD5', text: '#1B5E20', dot: '#2E7D32', icon: CheckCircle2 },
};

const DEPOSIT_SUBTYPE: Record<string, string> = {
  cash: 'Espèces', check: 'Chèque', transfer: 'Virement', other: 'Autre',
};
const WITHDRAWAL_SUBTYPE: Record<string, string> = {
  counter: 'Comptoir', check: 'Chèque', loan_disbursement: 'Décaissement prêt', other: 'Autre',
};
const TRANSFER_TYPE: Record<string, string> = {
  interne: 'Interne (même membre)', externe: 'Vers un autre membre',
  internal: 'Entre comptes', supplier: 'Fournisseur', loan_payment: 'Remboursement prêt',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n?: number | string | null) {
  if (n == null || n === '') return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(n)) + ' HTG';
}

// « Jeudi 12 novembre 2026 à 17:23:23 » — seule la 1re lettre en majuscule
function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  const s = d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Row simple ───────────────────────────────────────────────────────────────
function Row({ icon: Icon, label, value, mono, accent, capitalize }: {
  icon: React.ElementType; label: string; value?: string | number | null;
  mono?: boolean; accent?: string; capitalize?: boolean;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#F9F9F6] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold break-all ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}
          style={{ color: accent ?? '#1f2937' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Row cliquable (lien interne) ─────────────────────────────────────────────
// Sans href → s'affiche comme une Row simple (pas de faux lien vers "#")
function LinkRow({ icon: Icon, label, value, href, tooltip, mono, accent, capitalize }: {
  icon: React.ElementType; label: string; value?: string | null;
  href?: string; tooltip: string; mono?: boolean; accent?: string; capitalize?: boolean;
}) {
  if (!value) return null;
  if (!href) return <Row icon={Icon} label={label} value={value} mono={mono} capitalize={capitalize} />;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#F9F9F6] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <Link
          href={href}
          title={tooltip}
          className={`group inline-flex items-center gap-1.5 text-sm font-semibold break-all underline underline-offset-2 decoration-dotted
            hover:decoration-solid transition-all ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}
          style={{ color: accent ?? '#355C7D' }}
        >
          {value}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
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

// ─── Employé (Effectué par / Validé par) ──────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type EmployeeStatus = 'text' | 'loading' | 'found' | 'notfound';

interface EmployeeState {
  name?:       string;
  employeeId?: string;
  status:      EmployeeStatus;
}

function useEmployee(raw?: string, id?: string): EmployeeState {
  const isUuid     = !!raw && UUID_RE.test(raw);
  const employeeId = id ?? (isUuid ? raw : undefined);

  const [state, setState] = React.useState<EmployeeState>(
    isUuid ? { employeeId, status: 'loading' } : { name: raw, employeeId, status: employeeId ? 'found' : 'text' },
  );

  useEffect(() => {
    // Le backend envoie déjà un nom → rien à chercher
    if (!isUuid) {
      setState({ name: raw, employeeId, status: employeeId ? 'found' : 'text' });
      return;
    }
    if (!employeeId) return;

    let cancelled = false;
    setState({ employeeId, status: 'loading' });

    fetchEmployeeById(employeeId)
      .then((emp: any) => {
        if (cancelled) return;
        const full = [emp?.prenom ?? emp?.first_name, emp?.nom ?? emp?.last_name]
          .filter(Boolean).join(' ').trim();
        const name = full || emp?.user?.username;
        setState(name
          ? { name, employeeId, status: 'found' }
          : { employeeId, status: 'notfound' });
      })
      .catch(() => { if (!cancelled) setState({ employeeId, status: 'notfound' }); });

    return () => { cancelled = true; };
  }, [raw, employeeId, isUuid]);

  return state;
}

function EmployeeRow({ icon: Icon, label, employee, tooltip, accent }: {
  icon: React.ElementType; label: string; employee: EmployeeState; tooltip: string; accent: string;
}) {
  // Trouvé + id → lien vers la fiche
  if (employee.status === 'found' && employee.employeeId) {
    return (
      <LinkRow
        icon={Icon} label={label} value={employee.name}
        href={`/dashboard/employees/${employee.employeeId}`}
        tooltip={tooltip} accent={accent} capitalize
      />
    );
  }

  // Nom simple sans id → texte, sans lien
  if (employee.status === 'text') {
    return <Row icon={Icon} label={label} value={employee.name} capitalize />;
  }

  // Chargement ou introuvable → texte gris, sans lien
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#F9F9F6] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        {employee.status === 'loading' ? (
          <p className="text-sm text-gray-400 inline-flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> Chargement…
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic" title={employee.employeeId}>
            Utilisateur inconnu
            {employee.employeeId && (
              <span className="font-mono not-italic"> · {employee.employeeId.slice(0, 8)}…</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  onClose:     () => void;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const processedBy = useEmployee(transaction?.processed_by, transaction?.processed_by_id);
  const validatedBy = useEmployee(transaction?.validated_by, transaction?.validated_by_id);

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

  // Liens de navigation (undefined = pas de lien)
  const memberHref = transaction.member_id
    ? `/dashboard/members/${transaction.member_id}`
    : transaction.member_name
    ? `/dashboard/members?search=${encodeURIComponent(transaction.member_name)}`
    : undefined;
  const accountHref = account ? `/dashboard/accounts/${account}` : undefined;
  const caisseHref  = transaction.caisse_id ? `/dashboard/caisses/${transaction.caisse_id}` : undefined;

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
            <p className="text-sm font-bold text-gray-900">Détail {kindCfg.label.toLowerCase()}</p>
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

          {/* ── Membre & Compte ── */}
          <Section title="Membre et compte">
            <LinkRow
              icon={User}
              label="Membre"
              value={transaction.member_name}
              href={memberHref}
              tooltip="Voir la fiche du membre"
              accent="#355C7D"
              capitalize
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
                <div>
                  <Row icon={Hash} label="Référence virement" value={transaction.transferReference} mono />
                  <Row icon={User} label="Émetteur"            value={transaction.senderName} capitalize />
                </div>
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
              <Row icon={Landmark} label="Objet"         value={transaction.loanPurpose} />
              <Row icon={Banknote} label="Mensualité"    value={formatHTG(transaction.monthlyPayment)} />
              <Row icon={Banknote} label="Solde restant" value={formatHTG(transaction.remainingBalance)} accent="#355C7D" />
            </Section>
          )}

          {/* ── Traçabilité ── */}
          <Section title="Traçabilité">

            <Row icon={Calendar} label="Date et heure" value={formatDateTime(transaction.created_at)} />

            {transaction.processed_by && (
              <EmployeeRow
                icon={Cpu}
                label="Effectué par"
                employee={processedBy}
                tooltip="Voir la fiche de l'employé"
                accent="#2E7D32"
              />
            )}

            {transaction.validated_by && (
              <EmployeeRow
                icon={UserCheck}
                label="Validé par"
                employee={validatedBy}
                tooltip="Voir la fiche du superviseur"
                accent="#355C7D"
              />
            )}

            {transaction.caisse_numero && (
              <LinkRow
                icon={Receipt}
                label="Caisse"
                value={`Caisse n° ${transaction.caisse_numero}`}
                href={caisseHref}
                tooltip="Voir le détail de la caisse"
                mono
                accent="#D4AF37"
              />
            )}

            {transaction.session_id && (
              <Row icon={Hash} label="Session caisse" value={transaction.session_id} mono accent="#6E6E6E" />
            )}

            {transaction.reference && (
              <Row icon={Hash} label="Référence" value={transaction.reference} mono />
            )}
          </Section>

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