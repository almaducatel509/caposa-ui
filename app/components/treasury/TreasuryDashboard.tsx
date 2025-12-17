'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@heroui/react";
import { FaSync, FaPlus } from "react-icons/fa";
import TreasuryStats from './TreasuryStats';
import TreasuryFilters from './TreasuryFilters';
import TreasuryTable from './TreasuryCard';
import TreasuryLoader from './TreasuryLoader';
import TreasuryError from './TreasuryError';
import { TreasuryOperation } from './types';
import { fetchTreasuryOperations } from '@/app/lib/api/treasury';
import { TreasuryData } from './validation';
import TreasuryCard from './TreasuryCard';

const TreasuryDashboard: React.FC = () => {
  const [treasury, setTreasury] = useState<TreasuryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTreasuryOperations();
      setOperations(data);
    } catch (err) {
      console.error('Erreur chargement trésorerie:', err);
      setError('Impossible de charger les opérations de trésorerie.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => loadOperations();

  const handleNewOperation = () => {
    console.log('💼 Nouvelle opération de trésorerie');
    // TODO: ouvrir modal de création
  };

  if (loading) return <TreasuryLoader />;
  if (error) return <TreasuryError message={error} onRetry={handleRefresh} />;

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord - Trésorerie</h1>
          <p className="text-gray-600 mt-1">
            Suivi en temps réel des flux financiers et liquidités
          </p>
        </div>
        <div className="flex gap-3">
          <Button color="default" variant="bordered" startContent={<FaSync />} onClick={handleRefresh}>
            Actualiser
          </Button>
          <Button color="primary" startContent={<FaPlus />} onClick={handleNewOperation}>
            Nouvelle Opération
          </Button>
        </div>
      </div>


      {/* Statistiques */}
      <TreasuryStats 
        treasury={treasury} 
      />      
      <TreasuryFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        onRefresh={handleRefresh} 
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {operations.map(op => (
          <TreasuryCard
            key={op.id}
            operation={op}
            onView={handleView}
            onProcess={handleProcess}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TreasuryDashboard;
