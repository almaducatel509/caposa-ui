'use client';
import React from 'react';
import { TransactionData } from './types';
import { FaEye, FaEdit, FaTrash, FaBolt, FaArrowUp, FaArrowDown } from "react-icons/fa";

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
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'deposit':
        return { 
          gradient: 'from-emerald-500 to-teal-500',
          icon: <FaArrowDown className="rotate-180" />,
          label: 'Dépôt',
          textColor: 'text-emerald-600'
        };
      case 'withdrawal':
        return { 
          gradient: 'from-rose-500 to-pink-500',
          icon: <FaArrowDown />,
          label: 'Retrait',
          textColor: 'text-rose-600'
        };
      case 'transfer':
        return { 
          gradient: 'from-blue-500 to-indigo-500',
          icon: <div className="flex gap-0.5"><FaArrowUp className="text-xs" /><FaArrowDown className="text-xs" /></div>,
          label: 'Virement',
          textColor: 'text-blue-600'
        };
      case 'loan':
        return { 
          gradient: 'from-violet-500 to-purple-500',
          icon: <span className="text-sm">💰</span>,
          label: 'Prêt',
          textColor: 'text-violet-600'
        };
      default:
        return { 
          gradient: 'from-gray-500 to-slate-500',
          icon: <span>📊</span>,
          label: 'Autre',
          textColor: 'text-gray-600'
        };
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-400 animate-pulse';
      case 'completed':
        return 'bg-emerald-500';
      case 'failed':
        return 'bg-rose-500';
      case 'processing':
        return 'bg-blue-500 animate-pulse';
      default:
        return 'bg-gray-400';
    }
  };

  const typeConfig = getTypeConfig(transaction.type);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300">
      {/* Gradient Bar */}
      <div className={`h-1.5 bg-linear-to-r ${typeConfig.gradient}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-md bg-linear-to-br ${typeConfig.gradient} flex items-center justify-center text-white shadow-lg`}>
              {typeConfig.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{typeConfig.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">#{transaction.reference || transaction.id}</p>
            </div>
          </div>
          
          {/* Status Dot */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusDot(transaction.status)}`} />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className={`text-3xl font-bold ${typeConfig.textColor} tracking-tight`}>
            {formatCurrency(transaction.amount || 0)}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 font-medium line-clamp-2 mb-4">
          {transaction.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {transaction.member_name && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {transaction.member_name}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium">{formatDate(transaction.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3">
          <button
            onClick={() => onView(transaction)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaEye className="text-sm" />
            Voir
          </button>
          
          {transaction.status === 'pending' && (
            <button
              onClick={() => onProcess(transaction)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-md transition-all shadow-md"
            >
              <FaBolt className="text-sm" />
              Traiter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;