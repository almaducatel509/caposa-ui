// 📁 app/dashboard/opening_hours/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchOpeningHours } from '@/app/lib/api/opening_hour';
import ScheduleGrid from '@/app/components/OpeningHours/ScheduleGrid';

/* ========= TYPES ========= */

export type OpeningHrs = {
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


/* ========= DATA MAPPING ========= */

export const convertToOpeningHours = (apiData: any): OpeningHrs => ({
  id: apiData.id,
  monday: apiData.monday,
  tuesday: apiData.tuesday,
  wednesday: apiData.wednesday,
  thursday: apiData.thursday,
  friday: apiData.friday,
  saturday: apiData.saturday ?? null,  // ✅ null au lieu de undefined
  sunday: apiData.sunday ?? null,      // ✅ null au lieu de undefined
  created_at: apiData.created_at,
  updated_at: apiData.updated_at,
  status: apiData.status || 'active',
});

/* ========= PAGE ========= */

const OpeningHoursPage = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHrs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOpeningHours = async () => {
    try {
      setLoading(true);
      const apiData = await fetchOpeningHours();
      setOpeningHours(apiData.map(convertToOpeningHours));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des horaires d'ouverture");
      setOpeningHours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpeningHours();
  }, []);

  /* ========= STATES ========= */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={loadOpeningHours}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* ========= RENDER ========= */

  return (
    <div className="w-full">
    <ScheduleGrid
      />

    </div>
  );
};

export default OpeningHoursPage;
