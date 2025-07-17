'use client';
import React from 'react';
import { Button, Chip } from "@nextui-org/react";
import { TransactionData } from './types';
import { FaEye, FaEdit, FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaBolt } from "react-icons/fa";

interface TransactionCardProps {
  transaction: TransactionData;
  onView: (transaction: TransactionData) => void;
  onEdit: (transaction: TransactionData) => void;
  onDelete: (transaction: TransactionData) => void;
  onProcess: (transaction: TransactionData) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onView,
  onEdit,
  onDelete,
  onProcess
}) => {
  // Fonction pour obtenir l'icône et la couleur selon le type
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'deposit':
        return { icon: '💵', color: 'text-green-600', bg: 'bg-green-50', label: 'Dépôt' };
      case 'withdrawal':
        return { icon: '💸', color: 'text-red-600', bg: 'bg-red-50', label: 'Retrait' };
      case 'transfer':
        return { icon: '🔄', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Virement' };
      case 'loan':
        return { icon: '🏦', color: 'text-purple-600', bg: 'bg-purple-50', label: 'Prêt' };
      default:
        return { icon: '📊', color: 'text-gray-600', bg: 'bg-gray-50', label: 'Autre' };
    }
  };

  // Fonction pour obtenir le statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <FaClock />, 
          color: 'warning', 
          label: 'En attente',
          textColor: 'text-orange-600'
        };
      case 'completed':
        return { 
          icon: <FaCheckCircle />, 
          color: 'success', 
          label: 'Complété',
          textColor: 'text-green-600'
        };
      case 'failed':
        return { 
          icon: <FaTimesCircle />, 
          color: 'danger', 
          label: 'Échoué',
          textColor: 'text-red-600'
        };
      case 'processing':
        return { 
          icon: <FaBolt />, 
          color: 'primary', 
          label: 'En cours',
          textColor: 'text-blue-600'
        };
      default:
        return { 
          icon: <FaClock />, 
          color: 'default', 
          label: 'Inconnu',
          textColor: 'text-gray-600'
        };
    }
  };

  const typeInfo = getTypeInfo(transaction.type);
  const statusInfo = getStatusInfo(transaction.status);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${typeInfo.bg}`}>
            <span className="text-xl">{typeInfo.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{typeInfo.label}</h3>
            <p className="text-sm text-gray-500">#{transaction.reference || transaction.id}</p>
          </div>
        </div>
        <Chip
          color={statusInfo.color as any}
          variant="flat"
          startContent={statusInfo.icon}
          size="sm"
        >
          {statusInfo.label}
        </Chip>
      </div>

      {/* Montant */}
      <div className="mb-4">
        <p className={`text-3xl font-bold ${typeInfo.color}`}>
          {formatCurrency(transaction.amount || 0)}
        </p>
        {transaction.currency && transaction.currency !== 'CAD' && (
          <p className="text-sm text-gray-500">{transaction.currency}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-800 font-medium line-clamp-2">
          {transaction.description}
        </p>
        {transaction.notes && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
            {transaction.notes}
          </p>
        )}
      </div>

      {/* Informations supplémentaires */}
      <div className="space-y-2 mb-4">
        {transaction.member_name && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">👤</span>
            <span className="text-sm text-gray-700">{transaction.member_name}</span>
          </div>
        )}
        
        {transaction.account_number && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">🏛️</span>
            <span className="text-sm text-gray-700">Compte: {transaction.account_number}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">📅</span>
          <span className="text-sm text-gray-700">
            {formatDate(transaction.created_at || new Date().toISOString())}
          </span>
        </div>

        {/* Spécial pour les prêts */}
        {transaction.type === 'loan' && transaction.loan_info && (
          <div className="bg-purple-50 p-3 rounded-lg mt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-600">🏦</span>
              <span className="text-sm font-medium text-purple-800">Détails du Prêt</span>
            </div>
            <div className="space-y-1 text-xs text-purple-700">
              {transaction.loan_info.duration && (
                <p>Durée: {transaction.loan_info.duration}</p>
              )}
              {transaction.loan_info.interest_rate && (
                <p>Taux: {transaction.loan_info.interest_rate}%</p>
              )}
              {transaction.loan_info.status && (
                <p>Statut: {transaction.loan_info.status}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
        <Button
          size="sm"
          variant="ghost"
          startContent={<FaEye />}
          onClick={() => onView(transaction)}
          className="text-blue-600 hover:bg-blue-50"
        >
          Voir
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          startContent={<FaEdit />}
          onClick={() => onEdit(transaction)}
          className="text-green-600 hover:bg-green-50"
        >
          Modifier
        </Button>

        {transaction.status === 'pending' && (
          <Button
            size="sm"
            variant="ghost"
            startContent={<FaBolt />}
            onClick={() => onProcess(transaction)}
            className="text-purple-600 hover:bg-purple-50"
          >
            Traiter
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          startContent={<FaTrash />}
          onClick={() => onDelete(transaction)}
          className="text-red-600 hover:bg-red-50 ml-auto"
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default TransactionCard;