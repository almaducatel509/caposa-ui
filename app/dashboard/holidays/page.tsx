'use client';

import React, { useState, useEffect } from 'react';
import Search from '@/app/components/search';
import { Holiday, convertToHoliday } from '@/app/dashboard/holidays/columns';
import HolidayTable from '@/app/components/holidays/holidayTable';
import { fetchHolidays, HolidayAPI } from '@/app/lib/api/holiday';

const HolidaysDashboard = () => {
  // État pour stocker les données après conversion
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHolidays = async () => {
    try {
      // Récupérer les données de l'API
      const apiData = await fetchHolidays();
      
      // Convertir HolidayAPI[] en Holiday[]
      const convertedData = apiData.map(apiHoliday => convertToHoliday(apiHoliday));
      
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
    return <div>Loading holidays...</div>;
  }
  
  return (
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Jours Fériés</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* card */} 
      </div>
      <HolidayTable holidays={holidays} />
    </div>
  );
};

export default HolidaysDashboard;