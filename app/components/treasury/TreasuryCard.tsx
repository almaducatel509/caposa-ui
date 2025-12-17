'use client';
import React from 'react';
import { Button, Chip } from "@heroui/react";
import { FaEye, FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaBolt, FaMoneyBillWave, FaExchangeAlt, FaUniversity } from "react-icons/fa";
import { TreasuryOperation } from './types';

interface TreasuryCardProps {
  operation: TreasuryOperation;
  onView: (operation: TreasuryOperation) => void;
  onDelete: (operation: TreasuryOperation) => void;
  onProcess: (operation: TreasuryOperation) => void;
    onEdit: (operation: TreasuryOperation) => void;
  
}

const TreasuryCard: React.FC<TreasuryCardProps> = ({
  operation,
  onView,
  onDelete,
  onProcess,
  onEdit,
}) => {
  // Type visuel
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'deposit':
        return { icon: <FaMoneyBillWave />, color: 'text-green-600', bg: 'bg-green-50', label: 'Dépôt' };
      case 'withdrawal':
        return { icon: <FaMoneyBillWave />, color: 'text-red-600', bg: 'bg-red-50', label: 'Retrait' };
      case 'transfer':
        return { icon: <FaExchangeAlt />, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Transfert' };
      case 'loan':
        return { icon: <FaUniversity />, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Prêt' };
      default:
        return { icon: <FaBolt />, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Autre' };
    }
  };

  // Statut visuel
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: <FaClock />, color: 'warning', label: 'En attente', textColor: 'text-orange-600' };
      case 'completed':
        return { icon: <FaCheckCircle />, color: 'success', label: 'Complété', textColor: 'text-green-600' };
      case 'failed':
        return { icon: <FaTimesCircle />, color: 'danger', label: 'Échoué', textColor: 'text-red-600' };
      case 'processing':
        return { icon: <FaBolt />, color: 'primary', label: 'En cours', textColor: 'text-blue-600' };
      default:
        return { icon: <FaClock />, color: 'default', label: 'Inconnu', textColor: 'text-gray-600' };
    }
  };

  const typeInfo = getTypeInfo(operation.type);
  const statusInfo = getStatusInfo(operation.status);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${typeInfo.bg}`}>
            <span className={`text-xl ${typeInfo.color}`}>{typeInfo.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{typeInfo.label}</h3>
            <p className="text-sm text-gray-500">#{operation.reference || operation.id}</p>
          </div>
        </div>
        <Chip color={statusInfo.color as any} variant="flat" startContent={statusInfo.icon} size="sm">
          {statusInfo.label}
        </Chip>
      </div>

      {/* Montant */}
      <div className="mb-4">
        <p className={`text-3xl font-bold ${typeInfo.color}`}>
          {formatCurrency(operation.amount || 0)}
        </p>
      </div>

      {/* Description */}
      {operation.description && (
        <p className="text-gray-800 font-medium mb-4 line-clamp-2">
          {operation.description}
        </p>
      )}

      {/* Infos */}
      <div className="space-y-2 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">🏢</span>
          <span>Agence: {operation.branch_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">👤</span>
          <span>Employé: {operation.employee_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📅</span>
          <span>{formatDate(operation.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
        <Button
          size="sm"
          variant="ghost"
          startContent={<FaEye />}
          onClick={() => onView(operation)}
          className="text-blue-600 hover:bg-blue-50"
        >
          Détails
        </Button>

        {operation.status === 'pending' && (
          <Button
            size="sm"
            variant="ghost"
            startContent={<FaBolt />}
            onClick={() => onProcess(operation)}
            className="text-purple-600 hover:bg-purple-50"
          >
            Traiter
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          startContent={<FaTrash />}
          onClick={() => onDelete(operation)}
          className="text-red-600 hover:bg-red-50 ml-auto"
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default TreasuryCard;
