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
  FaBriefcase,
  FaEdit,
  FaClock,
} from "react-icons/fa";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { BsGenderAmbiguous } from "react-icons/bs";
import UserAvatar from '@/app/components/core/UserAvatar';
import { EmployeeData, formatGender, getEmployeeStatus } from './validations';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeData;
  onEdit: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: "success", text: "Actif", dot: "bg-green-500" };
      case 'inactive':
        return { color: "default", text: "Inactif", dot: "bg-gray-500" };
      case 'suspended':
        return { color: "warning", text: "Suspendu", dot: "bg-orange-500" };
      default:
        return { color: "success", text: "Actif", dot: "bg-green-500" };
    }
  };

  const status = getStatusConfig(getEmployeeStatus(employee));

  const age = employee.date_of_birth 
    ? new Date().getFullYear() - new Date(employee.date_of_birth).getFullYear()
    : null;

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
            user={employee}
            size="xl"
            type="employee"
            className="border-2 border-white"
          />
          <div className="flex-1 capitalize">
            <h3 className="capitalize text-xl font-bold flex items-center gap-2">
              {employee.first_name} {employee.last_name}
              <Chip 
                size="sm" 
                color={status.color as any}
                variant="flat"
                className="ml-2"
                startContent={<div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />}
              >
                {status.text}
              </Chip>
            </h3>
            <p className="text-sm opacity-90 capitalize">
              {employee.role || employee.user?.username || 'Employé'} • Réf: {employee.payment_ref}
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6">
          {/* Informations personnelles */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-[#34963d]" />
              Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="capitalize font-medium">{employee.first_name} {employee.last_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsGenderAmbiguous className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Genre</p>
                  <p className="font-medium">{formatGender(employee.gender)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium">
                    {formatDate(employee.date_of_birth)}
                    {age && <span className="text-sm text-gray-500 ml-2">({age} ans)</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Référence de paiement</p>
                  <p className="font-medium">{employee.payment_ref}</p>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Contact */}
          <div className="my-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaPhone className="text-[#34963d]" />
              Informations de contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${employee.user?.email}`}
                    className="font-medium text-[#34963d] hover:underline"
                  >
                    {employee.user?.email || 'N/A'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaPhone className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <a 
                    href={`tel:${employee.phone_number}`}
                    className="font-medium text-[#34963d] hover:underline"
                  >
                    {employee.phone_number}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="capitalize font-medium">{employee.address}</p>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Professionnelles */}
          <div className="my-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaBriefcase className="text-[#34963d]" />
              Informations professionnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaUser className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Nom d'utilisateur</p>
                  <p className="capitalize font-medium">{employee.user?.username || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HiOutlineOfficeBuilding className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Branche</p>
                  <p className="capitalize font-medium">
                      {employee.branch_details?.branch_name || 'N/A'} 
                      {employee.branch_details?.branch_code && (
                      <span className="capitalize text-sm text-gray-500 ml-2">
                        ({employee.branch_details.branch_code})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <FaBriefcase className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Postes</p>
                  <div className="capitalize flex gap-2 flex-wrap mt-1">
                    {employee.posts_details && employee.posts_details.length > 0 ? (
                      employee.posts_details.map((post) => (
                        <Chip className='capitalize' key={post.id} size="sm" variant="flat">
                          {post.name}
                        </Chip>
                      ))
                    ) : (
                      <p className="font-medium">Aucun poste assigné</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider />
          {/* Système */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaClock className="text-[#34963d]" />
              Informations système
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaClock className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date de création</p>
                  <p className="font-medium">{formatDateTime(employee.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Dernière modification</p>
                  <p className="font-medium">{formatDateTime(employee.updated_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">ID Employé</p>
                  <p className="font-medium text-xs">{employee.id}</p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={onClose}
            className="text-[#2c2e2f]"
          >
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

export default EmployeeDetailModal;
