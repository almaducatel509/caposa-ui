"use client";

import React from 'react';
import { Modal } from "@/app/components/ui/Modal";
import { X } from "lucide-react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaMoneyBillWave,
} from "react-icons/fa";
import UserAvatar from '@/app/components/core/UserAvatar';
import {
  MemberData,
} from './validations';
import {
  tierOf,
  tierColor,
  tierLabel,
  calculateAge,
  formatDate,
  formatDateTime,
  formatBalance,
  accountTypeLabel
} from "./utils";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberData | null;
  onEdit: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onEdit
}) => {
  if (!member) return null;

  const membershipTier = tierOf(member);
  const age = member.date_of_birthday ? calculateAge(member.date_of_birthday) : null;

  // Couleurs du tier badge
  const getTierColorClasses = (tier: string) => {
    const colorMap: Record<string, string> = {
      junior: 'bg-blue-100 text-blue-700',
      standard: 'bg-green-100 text-green-700',
      senior: 'bg-purple-100 text-purple-700',
    };
    return colorMap[tier] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {/* Header */}
      <div className="bg-linear-to-r from-[#34963d] to-[#1e7367] text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <UserAvatar
            user={{
              ...member,
              photo_profil: member.photo_profil ?? undefined,
            }}
            size="xl"
            type="member"
            className="border-2 border-white"
          />

          <div className="flex-1 capitalize">
            <h3 className="capitalize text-xl font-bold flex items-center gap-2">
              {member.first_name} {member.last_name}
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getTierColorClasses(membershipTier)}`}>
                {tierLabel(membershipTier)}
              </span>
            </h3>

            {/* Comptes */}
            {member.accounts?.length ? (
              <div className="space-y-2 mt-3">
                {member.accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-2 rounded bg-white/10 backdrop-blur-sm">
                    <div className="text-sm">
                      <div className="font-medium">
                        {accountTypeLabel(acc.account_type)} — {acc.account_number}
                      </div>
                      {acc.balance != null && (
                        <div className="text-white/80">Solde : {formatBalance(acc.balance)}</div>
                      )}
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">{acc.id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 p-3 rounded bg-red-100 text-red-700 text-sm">
                Ce membre n'a pas encore de compte. Il faut lier un compte pour bénéficier des services.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-[#34963d]" /> Informations personnelles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Date de naissance</p>
                <p className="font-medium">
                  {formatDate(member.date_of_birthday)} 
                  {age && (<span className="text-sm text-gray-500 ml-2">({age} ans)</span>)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaIdCard className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">ID Membre</p>
                <p className="font-medium text-xs">{member.id_member}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-6"></div>

        <div className="my-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaPhone className="text-[#34963d]" /> Informations de contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FaEnvelope className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a href={`mailto:${member.email}`} className="font-medium text-[#34963d] hover:underline">
                  {member.email || 'N/A'}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaPhone className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <a href={`tel:${member.phone_number}`} className="font-medium text-[#34963d] hover:underline">
                  {member.phone_number}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-2">
              <FaMapMarkerAlt className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="capitalize font-medium">{member.address} - {member.city}, {member.department}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-6"></div>

        {/* Compte(s) */}
        <div className="my-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-[#34963d]" /> Compte(s)
          </h4>

          {member.accounts?.length ? (
            <div className="space-y-2">
              {member.accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
                  <div>
                    <div className="font-medium">{acc.account_type}</div>
                    <div className="text-sm text-gray-500">{acc.account_number}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {acc.balance != null ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "HTG" }).format(acc.balance) : "—"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
              Ce membre n'a <b>aucun compte</b>. Pour bénéficier des services, créez au moins un compte.
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-6"></div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaClock className="text-[#34963d]" /> Informations système
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FaClock className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Créé le</p>
                <p className="font-medium">{formatDateTime(member.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaClock className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Modifié le</p>
                <p className="font-medium">{formatDateTime(member.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t p-4 flex justify-end gap-3 rounded-b-2xl">
        <button 
          onClick={onClose}
          className="px-6 py-2 text-[#2c2e2f] hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Fermer
        </button>
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2 bg-[#34963d] text-white hover:bg-[#1e7367] rounded-lg font-medium transition-colors"
        >
          <FaEdit />
          Modifier
        </button>
      </div>
    </Modal>
  );
};

export default MemberDetailModal;