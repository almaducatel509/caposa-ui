'use client';

import React, { useEffect } from 'react';
import { X, Wallet, User, BarChart2, Calendar } from 'lucide-react';
import type { AccountData } from '../validationsaccount';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface AccountDetailModalProps {
  isOpen:  boolean;
  onClose: () => void;
  account: AccountData | null;
  // onEdit retiré — un compte ne se modifie pas
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  actif:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Actif'    },
  suspendu: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', dot: 'bg-[#355C7D]', label: 'Suspendu' },
  ferme:    { bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400',  label: 'Fermé'    },
};

const TYPE_CFG: Record<string, { bg: string; text: string; label: string }> = {
  epargne: { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', label: 'Compte Épargne'  },
  cheques: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', label: 'Compte Chèques'  },
  terme:   { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Compte à Terme' },
};

function formatHTG(n?: number | null) {
  if (n == null) return '—';
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon: Icon, title, color, children }: {
  icon: React.ElementType; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-500 shrink-0" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, full = false }: {
  label: string; value: React.ReactNode; full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-gray-800">{value ?? '—'}</div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function AccountDetailModal({ isOpen, onClose, account }: AccountDetailModalProps) {

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !account) return null;

  const status  = account.account_status ?? 'actif';
  const sCfg    = STATUS_CFG[status]  ?? STATUS_CFG['actif'];
  const tCfg    = TYPE_CFG[account.typeCompte ?? ''] ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: account.typeCompte ?? '—' };
  const solde   = account.soldeActuel ?? parseFloat(account.balance ?? '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight font-mono">
                {account.account_number}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {account.member_details?.full_name ?? account.id_membre ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sCfg.bg} ${sCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
              {sCfg.label}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* Général */}
          <Section icon={Wallet} title="Informations générales" color="bg-[#F9F9F6] border-gray-100">
            <Field label="Numéro de compte" value={
              <span className="font-mono text-gray-900">{account.account_number}</span>
            } full />
            <Field label="Type de compte" value={
              <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold ${tCfg.bg} ${tCfg.text}`}>
                {tCfg.label}
              </span>
            } />
            <Field label="Date d'ouverture"  value={formatDate(account.dateOuverture ?? account.created_at)} />
            {account.dateFermeture && (
              <Field label="Date de fermeture" value={formatDate(account.dateFermeture)} />
            )}
          </Section>

          {/* Financier */}
          <Section icon={BarChart2} title="Informations financières" color="bg-[#F9F9F6] border-gray-100">
            <Field label="Solde actuel" value={
              <span className={`text-base font-bold ${solde > 0 ? 'text-[#2E7D32]' : solde < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {formatHTG(solde)}
              </span>
            } full />
            {account.tauxInteret != null && (
              <Field label="Taux d'intérêt" value={`${account.tauxInteret} %`} />
            )}
            {account.limiteTrait != null && (
              <Field label="Limite de retrait" value={formatHTG(account.limiteTrait)} />
            )}
            {account.fraisServiceMensuel != null && (
              <Field label="Frais mensuels" value={formatHTG(account.fraisServiceMensuel)} />
            )}
          </Section>

          {/* Membre */}
          {account.member_details && (
            <Section icon={User} title="Membre titulaire" color="bg-[#F9F9F6] border-gray-100">
              <Field label="Nom complet" value={
                account.member_details.full_name ??
                `${account.member_details.first_name} ${account.member_details.last_name}`
              } full />
              <Field label="N° identification" value={account.member_details.id_number} />
              {account.member_details.phone_number && (
                <Field label="Téléphone" value={account.member_details.phone_number} />
              )}
              {account.member_details.email && (
                <Field label="Email" value={account.member_details.email} />
              )}
              {account.member_details.city && (
                <Field label="Ville" value={`${account.member_details.city}${account.member_details.department ? `, ${account.member_details.department}` : ''}`} />
              )}
            </Section>
          )}

          {/* Stats */}
          {(account.total_transactions != null || account.total_deposits != null) && (
            <Section icon={BarChart2} title="Statistiques" color="bg-[#F9F9F6] border-gray-100">
              {account.total_transactions != null && (
                <Field label="Total transactions" value={account.total_transactions} />
              )}
              {account.last_transaction_date && (
                <Field label="Dernière transaction" value={formatDate(account.last_transaction_date)} />
              )}
              {account.total_deposits != null && (
                <Field label="Total dépôts"  value={<span className="text-[#2E7D32]">{formatHTG(account.total_deposits)}</span>} />
              )}
              {account.total_withdrawals != null && (
                <Field label="Total retraits" value={<span className="text-red-500">{formatHTG(account.total_withdrawals)}</span>} />
              )}
            </Section>
          )}

          {/* Métadonnées */}
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-3 flex flex-wrap gap-x-6 gap-y-1">
            <span>ID : <span className="font-mono">{account.id}</span></span>
            {account.created_at && <span>Créé : {new Date(account.created_at).toLocaleString('fr-FR')}</span>}
            {account.updated_at && <span>Modifié : {new Date(account.updated_at).toLocaleString('fr-FR')}</span>}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-[#F9F9F6] rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}