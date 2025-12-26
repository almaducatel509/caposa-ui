"use client";

import React from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FaBuilding, FaEdit, FaTrash, FaEye, FaPlayCircle, FaCheckCircle } from "react-icons/fa";
import { BsTelephone, BsPeople } from "react-icons/bs";
import { MdLocationOn, MdEmail, MdMailOutline } from "react-icons/md";
import { BranchData } from './validations';
import { GrMapLocation } from 'react-icons/gr';

export interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

interface BranchCardProps {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onViewDetails: (branch: Branch) => void;
  onActivate?: (branch: Branch) => void;
}

const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onEdit,
  onDelete,
  onViewDetails,
  onActivate
}) => {
  const totalStaff = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
  const isActive = branch.status === 'active';
  
  // 🎨 Catégorie de la branche
  const getBranchCategory = () => {
    if (totalStaff >= 20) return { color: "success", text: "Grande branche", bgColor: "bg-[#34963d]" };
    if (totalStaff >= 10) return { color: "primary", text: "Branche moyenne", bgColor: "bg-[#34963d]" };
    return { color: "warning", text: "Petite branche", bgColor: "bg-[#f8bf2c]" };
  };

  // 🎨 Couleur du statut
  const getStatusColor = () => {
    return isActive ? 'success' : 'warning';
  };

  // 📅 Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const category = getBranchCategory();

  return (
    <Card 
      className="border-2 border-[#e4e4e7] hover:border-[#34963d] transition-all duration-300 hover:shadow-lg bg-white"
      isPressable
      onPress={() => onViewDetails(branch)}
    >
      <CardBody className="p-6">
        {/* En-tête avec badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <Chip 
              size="sm" 
              className={`${category.bgColor} text-white`}
              variant="flat"
            >
              {category.text}
            </Chip>
            
          </div>
        </div>

        {/* Nom et code de la branche */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FaBuilding className="text-[#34963d] text-lg" />
            <h3 className="text-lg font-bold text-[#2c2e2f]">
              {branch.branch_name}
            </h3>
          </div>
          <p className="text-sm text-[#2c2e2f]/60 font-mono">
            Code: {branch.branch_code}
          </p>
        </div>

        {/* Personnel - Mise en évidence */}
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <p className="text-xs text-[#2c2e2f]/60 mb-1">Personnel total</p>
          <div className="flex items-center gap-2">
            <BsPeople className="text-[#34963d] text-xl" />
            <p className="text-2xl font-bold text-[#34963d]">
              {totalStaff}
            </p>
            <span className="text-sm text-[#2c2e2f]/60">employés</span>
          </div>
        </div>

        {/* Répartition du personnel */}
       

        {/* Informations de contact (compactes) */}
        <div className="space-y-1.5 text-xs text-[#2c2e2f]/60 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <GrMapLocation  className="text-[#34963d] flex-shrink-0" />
            <span className="truncate">{branch.branch_address}</span>
          </div>
          <div className="flex items-center gap-2">
            <BsTelephone className="text-[#34963d] flex-shrink-0" />
            <span>{branch.branch_phone_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdMailOutline  className="text-[#34963d] flex-shrink-0" />
            <span className="truncate">{branch.branch_email}</span>
          </div>
        </div>

        {/* Date d'ouverture */}
        <div className="text-xs text-[#2c2e2f]/60 mb-4">
          <span>Ouverte le: </span>
          <span className="font-medium">{formatDate(branch.opening_date)}</span>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            size="sm"
            variant="flat"
            className="flex-1 bg-blue-50 text-green-600 hover:bg-blue-100"
            startContent={<FaEye />}
            onPress={() => onViewDetails(branch)}
          >
            Voir
          </Button>
          
          {!isActive && onActivate ? (
            <Button
              size="sm"
              variant="flat"
              className="flex-1 bg-orange-50 text-orange-600 hover:bg-orange-100"
              startContent={<FaPlayCircle />}
              onPress={() => onActivate(branch)}
            >
              Activer
            </Button>
          ) : (
            <Button
              size="sm"
              variant="flat"
              className="flex-1 bg-green-50 text-green-600 hover:bg-green-100"
              startContent={<FaEdit />}
              onPress={() => onEdit(branch)}
            >
              Modifier
            </Button>
          )}
          
          <Button
            size="sm"
            variant="flat"
            className="bg-red-50 text-red-600 hover:bg-red-100"
            isIconOnly
            onPress={() => onDelete(branch)}
          >
            <FaTrash />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default BranchCard;