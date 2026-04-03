"use client";

import React from "react";
import { X, Edit, User, Phone, Mail, MapPin, CreditCard, Clock, Calendar, IdCard } from "lucide-react";
import { Modal } from "../ui/Modal";
import UserAvatar from "@/app/components/core/UserAvatar";
import { MemberData } from "./validations";
import { tierOf, tierLabel, calculateAge, formatDate, formatDateTime, formatBalance, accountTypeLabel } from "./utils";

interface MemberDetailModalProps {
  isOpen:  boolean;
  onClose: () => void;
  member:  MemberData | null;
  onEdit:  () => void;
}

const TIER_BADGE: Record<string, string> = {
  junior:   'bg-blue-100 text-blue-700',
  standard: 'bg-[#DDEAD5] text-[#1B5E20]',
  senior:   'bg-purple-100 text-purple-700',
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-[#2E7D32]" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen, onClose, member, onEdit,
}) => {
  if (!member) return null;

  const tier = tierOf(member);
  const age  = member.date_of_birthday ? calculateAge(member.date_of_birthday) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] rounded-t-2xl">
        <UserAvatar
          user={{ ...member, photo_profil: member.photo_profil ?? undefined }}
          size="xl"
          type="member"
          className="ring-2 ring-white"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-semibold text-gray-900 capitalize">
              {member.first_name} {member.last_name}
            </p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[tier] ?? 'bg-gray-100 text-gray-600'}`}>
              {tierLabel(tier)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">#{member.id_member}</p>

          {/* Comptes résumé */}
          {member.accounts?.length ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {member.accounts.map(acc => (
                <div key={acc.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/70 rounded-lg text-xs">
                  <CreditCard className="w-3 h-3 text-[#2E7D32]" />
                  <span className="text-gray-600">{acc.account_number}</span>
                  <span className="font-semibold text-[#1B5E20]">{acc.balance != null ? formatBalance(acc.balance) : '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2 py-1 rounded-lg inline-block">
              Aucun compte associé
            </p>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors self-start">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">

        {/* Informations personnelles */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Informations personnelles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Calendar} label="Date de naissance"
              value={member.date_of_birthday
                ? `${formatDate(member.date_of_birthday)}${age ? ` (${age} ans)` : ''}`
                : undefined} />
            <InfoRow icon={IdCard} label="Numéro d'identité" value={member.id_number} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Contact */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> Contact
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail}  label="Email"     value={member.email ?? 'N/A'} />
            <InfoRow icon={Phone} label="Téléphone" value={member.phone_number} />
            <div className="sm:col-span-2">
              <InfoRow icon={MapPin} label="Adresse"
                value={[member.address, member.city, member.department].filter(Boolean).join(', ')} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Comptes détail */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5" /> Compte(s)
          </p>
          {member.accounts?.length ? (
            <div className="space-y-2">
              {member.accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{accountTypeLabel(acc.account_type)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{acc.account_number}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1B5E20]">
                    {acc.balance != null
                      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG' }).format(Number(acc.balance))
                      : '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
              Ce membre n'a aucun compte. Créez au moins un compte pour bénéficier des services.
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* Système */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Informations système
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Clock} label="Créé le"    value={formatDateTime(member.created_at)} />
            <InfoRow icon={Clock} label="Modifié le" value={formatDateTime(member.updated_at)} />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Fermer
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl hover:shadow-md transition-all">
          <Edit className="w-3.5 h-3.5" />
          Modifier
        </button>
      </div>
    </Modal>
  );
};

export default MemberDetailModal;