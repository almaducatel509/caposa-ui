'use client';
import React from 'react';
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <FaClock />, 
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          label: 'En attente',
        };
      case 'completed':
        return { 
          icon: <FaCheckCircle />, 
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          label: 'Complété',
        };
      case 'failed':
        return { 
          icon: <FaTimesCircle />, 
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          label: 'Échoué',
        };
      case 'processing':
        return { 
          icon: <FaBolt />, 
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          label: 'En cours',
        };
      default:
        return { 
          icon: <FaClock />, 
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          label: 'Inconnu',
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
        
        {/* Status Badge */}
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
        </span>
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
        <button
          onClick={() => onView(transaction)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FaEye />
          <span>Voir</span>
        </button>
        
        <button
          onClick={() => onEdit(transaction)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <FaEdit />
          <span>Modifier</span>
        </button>

        {transaction.status === 'pending' && (
          <button
            onClick={() => onProcess(transaction)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <FaBolt />
            <span>Traiter</span>
          </button>
        )}

        <button
          onClick={() => onDelete(transaction)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
        >
          <FaTrash />
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;