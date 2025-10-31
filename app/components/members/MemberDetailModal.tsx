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
} from './validations';
import {
  tierOf,
  tierColor,
  tierLabel,
  calculateAge,
  formatDate,
  formatDateTime,
  formatBalance,
  formatGender,
  accountTypeLabel
} from "./utils";

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
  const membershipTier = tierOf(member); // "junior" | "standard" | "senior"
const age = member.date_of_birthday ? calculateAge(member.date_of_birthday) : null;


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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
            user={{
              ...member,
              photo_profil: member.photo_profil ?? undefined, // ✅ prevents TS error
            }}
            size="xl"
            type="member"
            className="border-2 border-white"
          />

          <div className="flex-1 capitalize">
            <h3 className="capitalize text-xl font-bold flex items-center gap-2">
              {member.first_name} {member.last_name}
              {(() => {
                const t = tierOf(member);
                return (
                  <Chip
                    size="sm"
                    color={tierColor(t) as any}
                    variant="flat"
                    className="ml-3"
                  >
                    {tierLabel(t)}
                  </Chip>
                );
              })()}
            </h3>

            {/* Sous-titre : source simple + ID */}
           {member.accounts?.length ? (
              <div className="space-y-2">
                {member.accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-2 rounded border border-gray-200">
                    <div className="text-sm">
                      <div className="font-medium">
                        {accountTypeLabel(acc.account_type)} — {acc.account_number}
                      </div>
                      {acc.balance != null && (
                        <div className="text-gray-600">Solde : {formatBalance(acc.balance)}</div>
                      )}
                    </div>
                    <Chip size="sm" variant="flat">{acc.id}</Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
                Ce membre n’a pas encore de compte. Il faut lier un compte pour bénéficier des services.
              </div>
            )}

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

          {/* Compte(s) */}
          <div className="my-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-[#34963d]" /> Compte(s)
            </h4>

            {member.accounts?.length ? (
              <div className="space-y-2">
                {member.accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between rounded border px-3 py-2">
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
                Ce membre n’a <b>aucun compte</b>. Pour bénéficier des services, créez au moins un compte.
              </div>
            )}
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
