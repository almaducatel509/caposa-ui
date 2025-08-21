"use client";

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@nextui-org/react";
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
  formatGender,
  formatMembershipTier,
  getMembershipColor,
  formatBalance,
  calculateAge,
  formatAccountType
} from './validations';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberData;
  onEdit: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onEdit
}) => {
  const membershipTier = member.membership_tier || member.membership_type || 'basic';
  const age = member.date_of_birthday ? calculateAge(member.date_of_birthday) : null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white p-6">
          <UserAvatar
            user={member}
            size="xl"
            type="member"
            className="border-2 border-white"
          />
          <div className="flex-1 capitalize">
            <h3 className="capitalize text-xl font-bold">
              {member.first_name} {member.last_name}
              <Chip 
                size="sm" 
                color={getMembershipColor(membershipTier) as any}
                variant="flat"
                className="ml-3"
              >
                {formatMembershipTier(membershipTier)}
              </Chip>
            </h3>
            <p className="text-sm opacity-90 capitalize">
              {member.income_source || member.account_type || 'Membre'} • ID: {member.id_number}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-[#34963d]" /> Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium">{formatDate(member.date_of_birthday)} {age && (<span className="text-sm text-gray-500 ml-2">({age} ans)</span>)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">ID Membre</p>
                  <p className="font-medium text-xs">{member.id}</p>
                </div>
              </div>
            </div>
          </div>

          <Divider />

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

          <Divider />

          <div className="my-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-[#34963d]" /> Compte et finance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Compte</p>
                  <p className="font-medium">{formatAccountType(member.account_type)} - {member.account_number}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMoneyBillWave className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Solde initial</p>
                  <p className="font-medium">{formatBalance(member.initial_balance)}</p>
                </div>
              </div>
            </div>
          </div>

          <Divider />

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
        </ModalBody>

        <ModalFooter className="bg-gray-50 border-t">
          <Button variant="light" onPress={onClose} className="text-[#2c2e2f]">
            Fermer
          </Button>
          <Button 
            className="bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors"
            startContent={<FaEdit />}
            onPress={onEdit}
          >
            Modifier
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MemberDetailModal;
