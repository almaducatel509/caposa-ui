"use client";

import React from 'react';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Tooltip,
} from "@nextui-org/react";
import { MemberData, formatGender, getMemberStatus, formatBalance, getMembershipColor, formatMembershipTier, formatAccountType, calculateAge } from './validations';
import UserAvatar from '@/app/components/core/UserAvatar';
import { FaEye, FaEdit, FaTrash, FaMoneyBillWave } from "react-icons/fa";

interface MemberCardProps {
  member: MemberData;
  onView: (member: MemberData) => void;
  onEdit: (member: MemberData) => void;
  onDelete: (member: MemberData) => void;
  onViewTransactions?: (member: MemberData) => void;
}

const safeString = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return 'N/A';
};

const MemberCard: React.FC<MemberCardProps> = ({ member, onView, onEdit, onDelete, onViewTransactions }) => {
  // Utiliser date_of_birthday (nouveau champ) avec fallback sur date_of_birth
  const dateOfBirth = member.date_of_birthday || member.date_of_birth;
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  
  // Utiliser membership_tier avec fallback sur membership_type
  const membershipTier = member.membership_tier || member.membership_type || 'basic';

  return (
    <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300 min-h-[360px]">
      <CardBody className="p-6 space-y-4">
        {/* Header avec avatar */}
        <div className="flex items-start gap-4">
          <UserAvatar user={member} size="lg" type="member" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold capitalize text-lg text-gray-800 truncate leading-relaxed">
              {safeString(member.first_name)} {safeString(member.last_name)}
            </h3>
            <p className="text-sm text-gray-500 truncate mt-1 capitalize">
              {safeString(member.income_source || member.account_type || 'Membre')}
            </p>
            {age && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                {age} ans
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Informations principales */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">📧</span>
              <span className="text-gray-700 truncate">{safeString(member.email || member.email)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">📞</span>
              <span className="text-gray-700">{safeString(member.phone_number)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">📍</span>
              <span className="capitalize text-gray-700 truncate">
                {safeString(member.city)}, {safeString(member.department)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">🆔</span>
              <span className="text-gray-700">{safeString(member.id_number)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">🏦</span>
              <span className="text-gray-700">
                {formatAccountType(member.account_type)} - {safeString(member.account_number)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">💰</span>
              <span className="text-gray-700 font-medium">
                {formatBalance(member.initial_balance)}
              </span>
            </div>
            {member.monthly_income && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-16">📈</span>
                <span className="text-gray-700">
                  Revenu: {formatBalance(member.monthly_income)}/mois
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer avec statut et actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <Chip 
            size="sm" 
            color={getMembershipColor(membershipTier) as any}
            variant="flat"
            className="text-xs"
          >
            {formatMembershipTier(membershipTier)}
          </Chip>
          
          <div className="flex gap-1">
            <Tooltip content="Voir profil">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => onView(member)}
              >
                <FaEye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Modifier">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                className="text-orange-600 hover:bg-orange-50"
                onClick={() => onEdit(member)}
              >
                <FaEdit className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Supprimer">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                className="text-red-600 hover:bg-red-50"
                onClick={() => onDelete(member)}
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            </Tooltip>
            {onViewTransactions && (
              <Tooltip content="Transactions">
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light" 
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => onViewTransactions(member)}
                >
                  <FaMoneyBillWave className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MemberCard;