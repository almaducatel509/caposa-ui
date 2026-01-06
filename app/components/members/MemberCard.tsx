"use client";

import React from "react";
import { FaEye, FaEdit, FaTrash, FaMoneyBillWave, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";
import { formatGender, MemberData } from "./validations";
import { PiCheckFat } from "react-icons/pi";

interface MemberCardProps {
  member: MemberData;
  onView: (member: MemberData) => void;
  onEdit: (member: MemberData) => void;
  onDelete: (member: MemberData) => void;
  onViewTransactions?: (member: MemberData) => void;
}

const safeString = (v: any) =>
  v === null || v === undefined ? "N/A" : typeof v === "string" ? v : String(v);

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onView,
  onEdit,
  onDelete,
  onViewTransactions,
}) => {
  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Sans nom';
  const dob = member.date_of_birthday || member.date_of_birth;
  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : null;
  const firstAccount = member.accounts?.[0];
  const genderLabel = formatGender(member.gender);

  // Couleur du badge genre
  const getGenderColor = (gender?: string) => {
    switch (gender?.toUpperCase()) {
      case 'M':
      case 'MALE':
        return 'bg-blue-100 text-blue-700';
      case 'F':
      case 'FEMALE':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  // Générer les initiales pour l'avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 rounded-2xl overflow-hidden group">
      <div className="p-0">
        {/* Header avec genre et status */}
        <div className="relative bg-linear-to-br from-purple-50 to-gray-200 p-6 pb-16">
          {/* Avatar centré */}
          <div className="flex justify-center">
            {member.photo_profil ? (
              <img
                src={member.photo_profil}
                alt={fullName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg ring-2 ring-purple-100 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg ring-2 ring-purple-100 bg-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(fullName)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="px-6 pt-4 pb-5 -mt-8 relative">
          {/* Nom et âge */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 capitalize">
              {fullName}
            </h3>
          </div>

          {/* Informations de contact */}
          <div className="space-y-2.5 mb-4">
            {member.email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaEnvelope className="text-gray-400 shrink-0" />
                <span className="truncate">{safeString(member.email)}</span>
              </div>
            )}
            
            {member.phone_number && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaPhone className="text-gray-400 shrink-0" />
                <span>{safeString(member.phone_number)}</span>
              </div>
            )}
            
            {(member.city || member.department) && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                <span className="truncate capitalize">
                  {safeString(member.city)}{member.city && member.department ? ', ' : ''}{safeString(member.department)}
                </span>
              </div>
            )}

            {/* Compte bancaire */}
            {firstAccount && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaCreditCard className="text-gray-400 shrink-0" />
                <span className="truncate">
                  {safeString(firstAccount.account_number)}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-4"></div>

          {/* Action icons */}
          <div className="flex justify-center gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onView(member)}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              title="Voir les détails"
            >
              <FaEye className="text-base" />
            </button>
            
            <button
              onClick={() => onEdit(member)}
              className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
              title="Modifier"
            >
              <FaEdit className="text-base" />
            </button>
            
            {onViewTransactions && (
              <button
                onClick={() => onViewTransactions(member)}
                className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                title="Voir les transactions"
              >
                <FaMoneyBillWave className="text-base" />
              </button>
            )}
            
            <button
              onClick={() => onDelete(member)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Supprimer"
            >
              <FaTrash className="text-base" />
            </button>
            <button   
              className={ "text-blue-600 hover:bg-blue-100 w-8 p-2 rounded-xl" }
              title="Active"
            >
              <PiCheckFat />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;