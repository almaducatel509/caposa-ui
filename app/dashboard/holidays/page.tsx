'use client';

import React, { useState, useEffect } from 'react';
import Search from '@/app/components/search';
import { HolidayData } from '@/app/components/holidays/validations';
import HolidayTable from '@/app/components/holidays/holidayTable';
import { fetchHolidays } from '@/app/lib/api/holiday';

const HolidaysDashboard = () => {
  // État pour stocker les données avec le bon type
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHolidays = async () => {
    try {
      // Récupérer les données de l'API
      const apiData = await fetchHolidays();
      
      // Convertir les données API en HolidayData
      const convertedData: HolidayData[] = apiData.map(apiHoliday => ({
        id: apiHoliday.id || '', // Assurer que id est toujours une string
        date: apiHoliday.date,
        description: apiHoliday.description,
        // Ajouter les propriétés optionnelles si elles existent
        created_at: undefined,
        updated_at: undefined,
        branch_code: undefined
      }));
      
      // Stocker les données converties
      setHolidays(convertedData);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34963d] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des jours fériés...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2c2e2f]">Jours Fériés</h1>
      </div>
      <HolidayTable holidays={holidays} />
    </div>
  );
};

export default HolidaysDashboard;