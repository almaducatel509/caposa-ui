"use client";

import React from 'react';
import { BsTelephone, BsPeople } from "react-icons/bs";
import { MdMailOutline } from "react-icons/md";
import { GrMapLocation } from 'react-icons/gr';
import type { Branch,  } from "@/types/branche";
import { GoTrash } from "react-icons/go";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { CiViewTimeline } from "react-icons/ci";
import { LiaEdit } from "react-icons/lia";
import { CiBank } from "react-icons/ci";


interface BranchCardProps {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onViewDetails: (branch: Branch) => void;
  onActivate?: (branch: Branch) => void;
}

// ============= BRANCH CARD (Composant de présentation pur) =============
const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onEdit,
  onDelete,
  onViewDetails,
  onActivate,
}) => {
  const totalStaff = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
  const isActive = branch.status === 'active';
  
  const getBranchCategory = () => {
    if (totalStaff >= 20) return { text: "Grande branche", bgColor: "bg-[#34963d]" };
    if (totalStaff >= 10) return { text: "Branche moyenne", bgColor: "bg-[#34963d]" };
    return { text: "Petite branche", bgColor: "bg-[#f8bf2c]" };
  };

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
    <div 
      className="bg-white border-2 border-[#e4e4e7] hover:border-[#34963d] rounded-xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => onViewDetails(branch)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <span className={`${category.bgColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
          {category.text}
        </span>
      </div>

      {/* Nom et code */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <CiBank  className="text-black text-3xl" />
          <h3 className="text-lg font-bold text-[#2c2e2f]">
            {branch.branch_name}
          </h3>
        </div>
        <p className="text-sm text-[#2c2e2f]/60 font-mono">
          Code: {branch.branch_code}
        </p>
      </div>

      {/* Personnel */}
      <div className="mb-4 p-3 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg">
        <p className="text-xs text-[#2c2e2f]/60 mb-1">Personnel total</p>
        <div className="flex items-center gap-2">
          <BsPeople className="text-[#34963d] text-xl" />
          <p className="text-2xl font-bold text-[#34963d]">
            {totalStaff}
          </p>
          <span className="text-sm text-[#2c2e2f]/60">employés</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1.5 text-xs text-[#2c2e2f]/60 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <GrMapLocation className="text-[#34963d] shrink-0" />
          <span className="truncate">{branch.branch_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <BsTelephone className="text-[#34963d] shrink-0" />
          <span>{branch.branch_phone_number}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdMailOutline className="text-[#34963d] shrink-0" />
          <span className="truncate">{branch.branch_email}</span>
        </div>
      </div>

      {/* Date */}
      <div className="text-xs text-[#2c2e2f]/60 mb-4">
        <span>Ouverte le: </span>
        <span className="font-medium">{formatDate(branch.opening_date)}</span>
      </div>
      <div
        className="flex gap-2 pt-4 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Voir */}
        <button
          onClick={() => onViewDetails(branch)}
          className="group flex-1 flex items-center justify-center gap-2 bg-blue-50 text-green-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <CiViewTimeline  />
          <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-200 overflow-hidden">
            Voir
          </span>
        </button>
{/* Bouton Modifier — toujours visible */}
        <button
          onClick={() => onEdit(branch)}
          className="group flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <LiaEdit />
          <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-200 overflow-hidden">
            Modifier
          </span>
        </button>

        {/* Bouton Activer — seulement si la branche n'est pas active */}
        {!isActive && onActivate && (
          <button
            onClick={() => onActivate(branch)}
            className="group flex-1 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <IoCheckmarkDoneSharp  />
            <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-200 overflow-hidden">
              Activer
            </span>
          </button>
        )}
        {/* Delete */}
        <button
          onClick={() => onDelete(branch)}
          className="group flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
        >
          <GoTrash  />
          <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-200 overflow-hidden ml-1">
            Supprimer
          </span>
        </button>
      </div>

    </div>
  );
};

export default BranchCard;