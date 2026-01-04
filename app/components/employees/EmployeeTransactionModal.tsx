"use client";

import React, { useState } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import { X, TrendingUp, TrendingDown, DollarSign, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FaMoneyBillWave, FaHistory, FaFileInvoiceDollar, FaUserClock, FaChartLine } from "react-icons/fa";

interface Transaction {
  id: string;
  type: 'payment' | 'bonus' | 'deduction' | 'reimbursement';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdBy: string;
}

interface ActivityLog {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  date: string;
  modifiedBy: string;
}

interface EmployeeTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    photo_profil: string | null;
    payment_ref: string;
  } | null;
}

const generateMockTransactions = (employeeId: string): Transaction[] => [
  {
    id: '1', type: 'payment', amount: 2500.00, currency: 'USD',
    description: 'Salaire mensuel - Janvier 2025', date: '2025-01-15T14:30:00',
    status: 'completed', createdBy: 'Système RH'
  },
  {
    id: '2', type: 'bonus', amount: 500.00, currency: 'USD',
    description: 'Prime de performance Q4 2024', date: '2025-01-10T10:00:00',
    status: 'completed', createdBy: 'Marie Martin (Manager)'
  },
  {
    id: '3', type: 'reimbursement', amount: 150.00, currency: 'USD',
    description: 'Remboursement frais de transport', date: '2025-01-08T16:45:00',
    status: 'completed', createdBy: 'Comptabilité'
  },
  {
    id: '4', type: 'deduction', amount: -50.00, currency: 'USD',
    description: 'Cotisation assurance santé', date: '2025-01-05T09:00:00',
    status: 'completed', createdBy: 'Système RH'
  },
  {
    id: '5', type: 'payment', amount: 2500.00, currency: 'USD',
    description: 'Salaire mensuel - Décembre 2024', date: '2024-12-15T14:30:00',
    status: 'completed', createdBy: 'Système RH'
  }
];

const generateMockActivityLogs = (employeeId: string): ActivityLog[] => [
  {
    id: '1', action: 'update', field: 'phone_number',
    oldValue: '+1234567890', newValue: '+0987654321',
    date: '2025-01-12T11:20:00', modifiedBy: 'Jean Dupont (Admin)'
  },
  {
    id: '2', action: 'update', field: 'address',
    oldValue: '123 Rue Principale', newValue: '456 Avenue Centrale',
    date: '2025-01-10T15:30:00', modifiedBy: 'Marie Martin (RH)'
  },
  {
    id: '3', action: 'update', field: 'posts',
    oldValue: 'Developer', newValue: 'Senior Developer',
    date: '2025-01-05T09:15:00', modifiedBy: 'Pierre Durand (Manager)'
  },
  {
    id: '4', action: 'create',
    date: '2024-06-15T10:00:00', modifiedBy: 'Admin Système'
  }
];

const EmployeeTransactionModal: React.FC<EmployeeTransactionModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  if (!employee) return null;
  
  const [selectedTab, setSelectedTab] = useState<"transactions" | "activity">("transactions");
  
  const transactions = generateMockTransactions(employee.id);
  const activityLogs = generateMockActivityLogs(employee.id);
  
  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyChange = 12.5; // Mock percentage
  
  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <ArrowUpRight className="text-green-500" size={20} />;
    return <ArrowDownRight className="text-red-500" size={20} />;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      {/* Modern Fintech Header */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-t-2xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {employee.photo_profil ? (
                <img
                  src={employee.photo_profil}
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center border-2 border-white/20 shadow-lg">
                  <span className="text-white text-xl font-bold">
                    {getInitials(`${employee.first_name} ${employee.last_name}`)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-sm text-white/70">
                  Ref: {employee.payment_ref}
                </p>
              </div>
            </div>
            
            {/* Balance Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-xs text-white/70 mb-1">Total Balance</p>
              <p className="text-3xl font-bold mb-2">
                {formatCurrency(totalAmount, 'USD')}
              </p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-green-400 font-semibold">+{monthlyChange}%</span>
                <span className="text-white/60">ce mois</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { 
                label: 'Paiements', 
                value: formatCurrency(transactions.filter(t => t.type === 'payment' && t.status === 'completed').reduce((s, t) => s + t.amount, 0), 'USD'),
                icon: <DollarSign size={16} />,
                color: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
              },
              { 
                label: 'Bonus', 
                value: formatCurrency(transactions.filter(t => t.type === 'bonus').reduce((s, t) => s + t.amount, 0), 'USD'),
                icon: <TrendingUp size={16} />,
                color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
              },
              { 
                label: 'Déductions', 
                value: formatCurrency(Math.abs(transactions.filter(t => t.type === 'deduction').reduce((s, t) => s + t.amount, 0)), 'USD'),
                icon: <TrendingDown size={16} />,
                color: 'from-red-500/20 to-orange-500/20 border-red-500/30'
              },
              { 
                label: 'Remboursements', 
                value: formatCurrency(transactions.filter(t => t.type === 'reimbursement').reduce((s, t) => s + t.amount, 0), 'USD'),
                icon: <FaFileInvoiceDollar size={16} />,
                color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
              },
            ].map((stat, i) => (
              <div key={i} className={`bg-linear-to-br ${stat.color} backdrop-blur-sm rounded-xl p-3 border`}>
                <div className="flex items-center gap-2 text-white/70 mb-1">
                  {stat.icon}
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex">
          <button
            onClick={() => setSelectedTab("transactions")}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
              selectedTab === "transactions"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaMoneyBillWave />
              <span>Transactions</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {transactions.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab("activity")}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
              selectedTab === "activity"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaHistory />
              <span>Historique</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {activityLogs.length}
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 max-h-[50vh] overflow-y-auto bg-gray-50">
        {selectedTab === "transactions" ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.amount > 0 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {getTransactionIcon(transaction.type, transaction.amount)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {transaction.description}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.createdBy} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium mt-1 ${
                      transaction.type === 'payment' ? 'bg-green-100 text-green-700' :
                      transaction.type === 'bonus' ? 'bg-blue-100 text-blue-700' :
                      transaction.type === 'deduction' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {transaction.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaUserClock className="text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    {log.action === 'create' ? (
                      <h4 className="font-semibold text-sm text-gray-900">
                        Création du profil employé
                      </h4>
                    ) : (
                      <>
                        <h4 className="font-semibold text-sm text-gray-900">
                          Modification du champ "{log.field}"
                        </h4>
                        {log.oldValue && log.newValue && (
                          <div className="mt-2 text-xs flex items-center gap-2">
                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded line-through">
                              {log.oldValue}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded font-medium">
                              {log.newValue}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {log.modifiedBy} • {formatDate(log.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-white border-t p-4 flex justify-end gap-3 rounded-b-2xl">
        <button 
          onClick={onClose}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Fermer
        </button>
        <button 
          className="flex items-center gap-2 px-6 py-2 bg-linear-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Download size={16} />
          Exporter PDF
        </button>
      </div>
    </Modal>
  );
};

export default EmployeeTransactionModal;