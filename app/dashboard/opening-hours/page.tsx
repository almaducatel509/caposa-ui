// 📁 app/dashboard/opening_hours/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchOpeningHours } from '@/app/lib/api/opening_hour';
import Hours_table from '@/app/components/OpeningHours/Hours_table';

// 🔒 Typage sécurisé pour les données de l'API
export type OpeningHours = {
  id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string | null;
  sunday: string | null;
  created_at: string;
  updated_at: string;
  status: 'active' | 'paused' | 'vacation';
};

// 🔄 Conversion des données API vers le type local
export const convertToOpeningHours = (apiData: any): OpeningHours => {
  return {
    id: apiData.id,
    monday: apiData.monday,
    tuesday: apiData.tuesday,
    wednesday: apiData.wednesday,
    thursday: apiData.thursday,
    friday: apiData.friday,
    saturday: apiData.saturday || null,
    sunday: apiData.sunday || null,
    created_at: new Date(apiData.created_at).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    updated_at: apiData.updated_at,
    status: apiData.status || 'active'
  };
};

const OpeningHoursPage = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOpeningHours = async () => {
    try {
      setLoading(true);
      const apiData: any[] = await fetchOpeningHours();
      const convertedData = apiData.map(convertToOpeningHours);
      setOpeningHours(convertedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      setError("Erreur lors de la récupération des horaires d'ouverture");
      setOpeningHours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpeningHours();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <div className="text-center">
          <p className="text-2xl mb-4">{error}</p>
          <button
            onClick={loadOpeningHours}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Horaires d'ouverture</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* Des composants comme des cartes statistiques peuvent être insérés ici */}
      </div>
      <Hours_table
        hourtable={openingHours}
        holidays={[]}
        branches={[]}
        onRefresh={loadOpeningHours}
      />
    </div>
  );
};

export default OpeningHoursPage;
