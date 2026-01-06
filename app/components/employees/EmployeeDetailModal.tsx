"use client";

import React from 'react';
import { Modal } from "@/app/components/ui/Modal";
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
import { X } from "lucide-react";
import UserAvatar from '@/app/components/core/UserAvatar';
import { EmployeeData, formatGender, getEmployeeStatus } from './validations';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeData | null;
  onEdit: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit
}) => {
  if (!employee) return null;
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: "bg-green-100 text-green-700", text: "Actif", dot: "bg-green-500" };
      case 'inactive':
        return { color: "bg-gray-100 text-gray-700", text: "Inactif", dot: "bg-gray-500" };
      case 'suspended':
        return { color: "bg-orange-100 text-orange-700", text: "Suspendu", dot: "bg-orange-500" };
      default:
        return { color: "bg-green-100 text-green-700", text: "Actif", dot: "bg-green-500" };
    }
  }
  
  ;console.log("EMPLOYEE CARD DATA", employee);

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
            user={employee}
            size="xl"
            type="employee"
            className="border-2 border-white"
          />
          <div className="flex-1 capitalize">
            <h3 className="capitalize text-xl font-bold flex items-center gap-2">
              {employee.first_name} {employee.last_name}
              <span className={`${status.color} ml-2 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.text}
              </span>
            </h3>
            <p className="text-sm opacity-90 capitalize">
              {employee.role || employee.user?.username || 'Employé'} • Réf: {employee.payment_ref}
            </p>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
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

        <div className="h-px bg-gray-200 my-6"></div>

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

        <div className="h-px bg-gray-200 my-6"></div>

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
                      <span 
                        key={post.id}
                        className="capitalize px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                      >
                        {post.name}
                      </span>
                    ))
                  ) : (
                    <p className="font-medium">Aucun poste assigné</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-6"></div>

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

export default EmployeeDetailModal;