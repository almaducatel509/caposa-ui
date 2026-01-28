'use client';
import React, { useState, useEffect } from 'react';
import TransactionStats from './TransactionStats';
import TransactionFilters from './TransactionFilters';
import TransactionGrid from './TransactionGrid';
import { TransactionData } from './types';
import { fetchTransactions } from '@/app/lib/api/transactions';
import { BiImport } from "react-icons/bi";
import PageHeader from '../header';
import { FaSync } from 'react-icons/fa';

const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });
  
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      setError('Erreur lors de la récupération des transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  const handleNewTransaction = () => {
    console.log('Nouvelle transaction');
  };

  if (loading) {
    return (
      <div className="w-full p-4 min-h-screen">
        <div className="flex justify-between items-center mb-8">
           <PageHeader
            title="Transactions"
            subtitle="Gestion et suivi financier"
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-violet-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Gestion financière</p>
          </div>
        </div>
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold shadow-lg"
          >
            <FaSync />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
        <div className="flex justify-between items-center">
          <PageHeader
            title="Transactions"
            subtitle="Gestion et suivi financier"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
          >
            <FaSync className="text-sm" />
            Actualiser
          </button>
          <button
            onClick={handleNewTransaction}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <BiImport  className="text-xl" />
              Importer 
          </button>
        </div>
      </div>
      {/* Stats */}
      <TransactionStats transactions={transactions} />
      {/* Filters */}
      
      {/* Grid */}
      <TransactionGrid 
        transactions={transactions}
        filters={filters}
      />
    </div>
  );
};

export default TransactionDashboard;