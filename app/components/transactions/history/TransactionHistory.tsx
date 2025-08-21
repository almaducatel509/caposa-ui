'use client';
import React, { useState, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import TransactionStats from '../TransactionStats';
import TransactionFilters from '../TransactionFilters';
import TransactionGrid from '../TransactionGrid';
import { TransactionData } from '../types';
import { fetchTransactions } from '@/app/lib/api/transactions';
import { FaPlus, FaSync } from "react-icons/fa";

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

  // Charger les transactions
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des transactions...');
      const data = await fetchTransactions();
      setTransactions(data);
      console.log('✅ Transactions chargées:', data.length);
    } catch (err) {
      console.error('❌ Erreur chargement transactions:', err);
      setError('Erreur lors de la récupération des transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  const handleNewTransaction = () => {
    console.log('💰 Nouvelle transaction');
    // TODO: Ouvrir modal de création
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord - Transactions</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 text-xl">💰</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">Récupération des données</p>
            <p className="text-sm text-gray-500 mt-1">Chargement des transactions en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord - Transactions</h1>
        </div>
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h3 className="text-xl font-medium text-red-600 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            color="primary"
            startContent={<FaSync />}
            onClick={handleRefresh}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-6">
      {/* En-tête avec titre et actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord - Transactions</h1>
          <p className="text-gray-600 mt-1">Gestion et suivi de toutes les transactions financières</p>
        </div>
        <div className="flex gap-3">
          <Button
            color="default"
            variant="bordered"
            startContent={<FaSync />}
            onClick={handleRefresh}
          >
            Actualiser
          </Button>
          <Button
            color="primary"
            startContent={<FaPlus />}
            onClick={handleNewTransaction}
          >
            Nouvelle Transaction
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <TransactionStats transactions={transactions} />

      {/* Filtres */}
      <TransactionFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onRefresh={handleRefresh}
      />

      {/* Grille des transactions */}
      <TransactionGrid 
        transactions={transactions}
        filters={filters}
      />
    </div>
  );
};

export default TransactionDashboard;