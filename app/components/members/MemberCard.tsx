"use client";

import React from "react";
import { Card, CardBody, Chip, Button, Avatar } from "@heroui/react";
import { FaEye, FaEdit, FaTrash, FaMoneyBillWave, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaCalendar, FaCreditCard } from "react-icons/fa";
import { formatGender, MemberData } from "./validations";

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
  return (
    <Card 
      className="h-full bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 rounded-2xl overflow-hidden group"
    >
      <CardBody className="p-0">
        {/* Header avec genre et status */}
        <div className="relative bg-linear-to-br from-purple-50 to-pink-50 p-6 pb-16">
          <div className="flex justify-between items-start mb-4">
            {/* Badge Genre */}
            {member.gender && (
              <div className={`flex items-center gap-1.5 ${getGenderColor(member.gender)} backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm`}>
                <FaVenusMars className="text-sm" />
                <span className="text-xs font-semibold">{genderLabel}</span>
              </div>
            )}
          </div>

          {/* Avatar centré */}
          <div className="flex justify-center">
            <Avatar
              src={member.photo_profil || undefined}
              alt={fullName}
              className="w-24 h-24 border-4 border-white shadow-lg ring-2 ring-purple-100"
              showFallback
              name={fullName}
            />
          </div>
        </div>

        {/* Informations principales */} m pa
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
                  {firstAccount.account_type} — {safeString(firstAccount.account_number)}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-4"></div>

          {/* Actions buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant="flat"
              color="default"
              className="flex-1 font-medium"
              startContent={<FaCalendar className="text-sm" />}
              onPress={() => onView(member)}
            >
              Profil
            </Button>
            
            {onViewTransactions && (
              <Button
                size="sm"
                variant="flat"
                color="success"
                className="flex-1 font-medium"
                startContent={<FaMoneyBillWave className="text-sm" />}
                onPress={() => onViewTransactions(member)}
              >
                Transactions
              </Button>
            )}
          </div>

          {/* Action icons */}
          <div className="flex justify-center gap-2 pt-4 border-t border-gray-100">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              onPress={() => onView(member)}
              className="hover:bg-blue-50"
              title="Voir les détails"
            >
              <FaEye className="text-base" />
            </Button>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="warning"
              onPress={() => onEdit(member)}
              className="hover:bg-orange-50"
              title="Modifier"
            >
              <FaEdit className="text-base" />
            </Button>
            
            {onViewTransactions && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="secondary"
                onPress={() => onViewTransactions(member)}
                className="hover:bg-purple-50"
                title="Voir les transactions"
              >
                <FaMoneyBillWave className="text-base" />
              </Button>
            )}
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => onDelete(member)}
              className="hover:bg-red-50"
              title="Supprimer"
            >
              <FaTrash className="text-base" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MemberCard;