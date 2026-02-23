"use client";

import React from 'react';
import { Eye, Edit, Trash2, Banknote, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { formatGender, MemberData, getMemberInitials } from './validations';

interface MemberCardProps {
  member: MemberData;
  onView:             (m: MemberData) => void;
  onEdit:             (m: MemberData) => void;
  onDelete:           (m: MemberData) => void;
  onViewTransactions?: (m: MemberData) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const safeStr = (v: unknown) =>
  v === null || v === undefined ? '' : typeof v === 'string' ? v : String(v);

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  savings:    'Épargne',
  checking:   'Courant',
  investment: 'Investissement',
  loan:       'Prêt',
};

const GENDER_CFG: Record<string, { bg: string; text: string; label: string }> = {
  m:    { bg: 'bg-blue-50',  text: 'text-blue-700',  label: 'Homme' },
  male: { bg: 'bg-blue-50',  text: 'text-blue-700',  label: 'Homme' },
  f:    { bg: 'bg-pink-50',  text: 'text-pink-700',  label: 'Femme' },
  female:{ bg: 'bg-pink-50', text: 'text-pink-700',  label: 'Femme' },
};

// ─── Component ─────────────────────────────────────────────────────────────────
const MemberCard: React.FC<MemberCardProps> = ({
  member, onView, onEdit, onDelete, onViewTransactions,
}) => {
  const fullName    = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Sans nom';
  const initials    = getMemberInitials(member);
  const firstAcct   = member.accounts?.[0];
  const genderKey   = (member.gender ?? '').toLowerCase();
  const genderCfg   = GENDER_CFG[genderKey] ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: 'N/S' };

  const location = [safeStr(member.city), safeStr(member.department)]
    .filter(Boolean).join(', ');

  const ACTIONS = [
    { icon: Eye,      label: 'Voir',         color: 'hover:bg-blue-50  text-blue-600',    onClick: () => onView(member) },
    { icon: Edit,     label: 'Modifier',     color: 'hover:bg-[#DDEAD5] text-[#2E7D32]', onClick: () => onEdit(member) },
    ...(onViewTransactions ? [{ icon: Banknote, label: 'Transactions', color: 'hover:bg-purple-50 text-purple-600', onClick: () => onViewTransactions(member) }] : []),
    { icon: Trash2,   label: 'Supprimer',    color: 'hover:bg-red-50   text-red-600',     onClick: () => onDelete(member) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#2E7D32]/30 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">

      {/* ── Avatar header ── */}
      <div className="bg-gradient-to-br from-[#F9F9F6] to-[#DDEAD5]/30 pt-6 pb-10 flex flex-col items-center gap-3 relative">

        {/* Badge genre */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${genderCfg.bg} ${genderCfg.text}`}>
          {genderCfg.label}
        </span>

        {/* Avatar */}
        {member.photo_profil ? (
          <img
            src={member.photo_profil}
            alt={fullName}
            className="w-20 h-20 rounded-full border-4 border-white shadow-md ring-2 ring-[#DDEAD5] object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md ring-2 ring-[#DDEAD5] bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
        )}
      </div>

      {/* ── Infos ── */}
      <div className="px-5 pb-4 -mt-6 flex flex-col flex-1">

        {/* Nom */}
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 capitalize">{fullName}</h3>
          {member.id_member && (
            <p className="text-xs text-gray-400 mt-0.5">#{member.id_member}</p>
          )}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2 mb-4 flex-1">
          {member.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{safeStr(member.email)}</span>
            </div>
          )}
          {member.phone_number && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{safeStr(member.phone_number)}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate capitalize">{location}</span>
            </div>
          )}
          {firstAcct && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CreditCard className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">
                {safeStr(firstAcct.account_number)}
                {firstAcct.account_type && (
                  <span className="ml-1 text-gray-400">
                    · {ACCOUNT_TYPE_LABEL[firstAcct.account_type] ?? firstAcct.account_type}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Solde si disponible */}
        {typeof member.total_amount === 'number' && (
          <div className="mb-3 px-3 py-2 bg-[#DDEAD5] rounded-xl flex items-center justify-between">
            <span className="text-xs text-[#1B5E20] font-medium">Solde total</span>
            <span className="text-sm font-bold text-[#1B5E20]">
              {member.total_amount.toLocaleString('fr-FR')} HTG
            </span>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-center gap-1 pt-3 border-t border-gray-100">
          {ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={a.onClick}
              title={a.label}
              className={`p-2 rounded-xl transition-colors ${a.color}`}
            >
              <a.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;