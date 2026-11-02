"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import {
  X, User, Phone, Mail, MapPin, CreditCard,
  Calendar, Clock, IdCard, Pencil,
} from "lucide-react";
import UserAvatar from "@/app/components/core/UserAvatar";
import { tierOf, calculateAge, tierLabel, formatDate, formatDateTime } from "../utils";
import { MemberData, accountTypeLabel, getMemberStatus } from "../validations";
import { fetchAccountsByMember, CaisseAccountOption } from "@/app/lib/api/caisse";

// Les comptes ne sont pas inclus dans GET /members/ : on les charge à l'ouverture.
const ACCOUNT_STATUS: Record<string, { label: string; cls: string }> = {
  actif:      { label: "Actif",      cls: "bg-[#DDEAD5] text-[#1B5E20]" },
  en_attente: { label: "En attente", cls: "bg-yellow-50 text-yellow-700" },
  gele:       { label: "Gelé",       cls: "bg-blue-50 text-blue-700" },
  ferme:      { label: "Fermé",      cls: "bg-gray-100 text-gray-500" },
  archive:    { label: "Archivé",    cls: "bg-gray-100 text-gray-500" },
};
const EXCLUDED_FROM_TOTAL = new Set(["ferme", "archive"]);

const formatHTG = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " HTG";

function useMemberAccounts(memberId: string | undefined, enabled: boolean) {
  const [accounts, setAccounts] = useState<CaisseAccountOption[] | null>(null);
  const [error,    setError]    = useState(false);

  useEffect(() => {
    if (!enabled || !memberId) return;
    let cancelled = false;
    setAccounts(null);
    setError(false);
    fetchAccountsByMember(memberId)
      .then(a => { if (!cancelled) setAccounts(a); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [memberId, enabled]);

  return { accounts, error, loading: enabled && !!memberId && accounts === null && !error };
}

interface MemberDetailModalProps {
  isOpen:  boolean;
  onClose: () => void;
  member:  MemberData | null;
  onEdit:  () => void;
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[#2E7D32]" />
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Actif'    },
  inactive:  { bg: 'bg-gray-100',  text: 'text-gray-600',  dot: 'bg-gray-400',   label: 'Inactif'  },
  suspended: { bg: 'bg-orange-50', text: 'text-orange-700',dot: 'bg-orange-500', label: 'Suspendu' },
};
 
const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen, onClose, member, onEdit,
}) => {
  const { accounts, error: accountsError, loading: accountsLoading } =
    useMemberAccounts(member ? String(member.id) : undefined, isOpen);

  if (!member) return null;
  const statusKey = getMemberStatus(member);
  const status    = STATUS_CFG[statusKey] ?? STATUS_CFG.active;
  const tier = tierOf(member);
  const age  = member.date_of_birthday ? calculateAge(member.date_of_birthday) : null;

  const fmtDate     = (d?: string | null) => d
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T12:00:00` : d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  const fmtDateTime = (d?: string | null) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <UserAvatar user={member} size="lg" type="member" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 capitalize">
                {member.first_name} {member.last_name}
              </h3>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {[member.city, member.department_code ? `Réf : ${member.department_code}` : null]
                .filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5 max-h-[70vh]">

        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader title="Informations personnelles" icon={User} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Nom complet" value={<span className="capitalize">{member.first_name} {member.last_name}</span>} />
            <InfoRow label="Numéro d'identité" value={member.id_number} mono />
            <InfoRow
              label="Date de naissance"
              value={member.date_of_birthday
                ? <span>{fmtDate(member.date_of_birthday)} <span className="text-gray-400">({age} ans)</span></span>
                : '—'}
            />
            <InfoRow label="Niveau" value={tierLabel(tier)} />
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader title="Informations de contact" icon={Phone} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Email</p>
              <a href={`mailto:${member.email}`}
                className="text-sm font-medium text-[#2E7D32] hover:underline truncate">
                {member.email || '—'}
              </a>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Téléphone</p>
              <a href={`tel:${member.phone_number}`}
                className="text-sm font-medium text-[#2E7D32] hover:underline">
                {member.phone_number || '—'}
              </a>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Adresse</p>
              <p className="text-sm font-medium text-gray-900">
                {[member.address, member.city, member.department].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Compte(s) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader title="Compte(s)" icon={CreditCard} />
          {accountsLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1].map(i => <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : accountsError ? (
            <p className="text-sm text-red-600">Impossible de charger les comptes. Réessayez plus tard.</p>
          ) : accounts && accounts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {accounts.map(acc => {
                const st = ACCOUNT_STATUS[acc.account_status] ?? { label: acc.account_status, cls: "bg-gray-100 text-gray-600" };
                const excluded = EXCLUDED_FROM_TOTAL.has(acc.account_status);
                return (
                  <div key={acc.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl ${excluded ? "opacity-60" : ""}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{accountTypeLabel(acc.typeCompte)}</p>
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{acc.account_number}</p>
                    </div>
                    <p className={`text-sm font-semibold whitespace-nowrap ${excluded ? "text-gray-400 line-through" : "text-[#1B5E20]"}`}>
                      {formatHTG(Number(acc.soldeActuel) || 0)}
                    </p>
                  </div>
                );
              })}
              {accounts.length > 1 && (
                <div className="flex items-center justify-between px-4 pt-2 text-sm">
                  <span className="text-gray-500">Solde total disponible</span>
                  <span className="font-bold text-[#1B5E20]">
                    {formatHTG(accounts
                      .filter(a => !EXCLUDED_FROM_TOTAL.has(a.account_status))
                      .reduce((t, a) => t + (Number(a.soldeActuel) || 0), 0))}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun compte associé</p>
          )}
        </div>

        {/* Informations système */}
        <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
          <SectionHeader title="Informations système" icon={Clock} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Créé le"              value={fmtDateTime(member.created_at)} />
            <InfoRow label="Dernière modification" value={fmtDateTime(member.updated_at)} />
            <div className="sm:col-span-2 flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">ID Membre</p>
              <div className="text-xs font-mono text-gray-500">{member.id}</div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Fermer
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all">
          <Pencil className="w-4 h-4" /> Modifier
        </button>
      </div>

    </Modal>
  );
};

export default MemberDetailModal;