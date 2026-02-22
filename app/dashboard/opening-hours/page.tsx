// 📁 app/dashboard/opening_hours/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchOpeningHours } from '@/app/lib/api/opening_hour';
import ScheduleGrid from '@/app/components/OpeningHours/ScheduleGrid';
import { Clock, Calendar, TrendingUp, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import PageHeader from '@/app/components/header';

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
  saturday: apiData.saturday ?? null,
  sunday: apiData.sunday ?? null,
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

  // ========= STATISTIQUES =========
  const stats = useMemo(() => {
    const total = openingHours.length;
    const active = openingHours.filter(h => h.status === 'active').length;
    const paused = openingHours.filter(h => h.status === 'paused').length;
    const vacation = openingHours.filter(h => h.status === 'vacation').length;

    return { total, active, paused, vacation };
  }, [openingHours]);

  /* ========= LOADING STATE ========= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent" />
            </div>
            <p className="text-center text-gray-600 font-medium mt-4">Chargement des horaires...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ========= ERROR STATE ========= */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
              title="Horaires d'Ouverture"
              subtitle="Configuration et consultation des horaires d'ouverture des succursales"
              icon={ <Clock className="text-blue-600" size={32} />}
          />
          
          {/* Error Box */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertCircle className="text-red-600" size={48} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
              <button
                onClick={loadOpeningHours}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                <RefreshCw size={20} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========= MAIN RENDER ========= */
  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto  ">
        {/* ========= HEADER - Style Caposa ========= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <PageHeader
              title="Horaires d'Ouverture"
              subtitle="Configuration et consultation des horaires d'ouverture des succursales"
              icon={ <Clock className="text-blue-600" size={32} />}
          />

            {/* Actions */}
            <div className="flex items-center gap-3 ">
              <button
                onClick={loadOpeningHours}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 rounded-lg font-medium transition-all"
                title="Rafraîchir"
              >
                <RefreshCw size={18} />
                Actualiser
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-lg"
              >
                <Plus size={18} />
                Nouvel horaire
              </button>
            </div>
          </div>

          {/* ========= STATS CARDS - Style Caposa ========= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total horaires</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </div>

            {/* Actifs */}
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Actifs</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            {/* En pause */}
            <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700">En pause</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.paused}</p>
                </div>
                <div className="text-3xl">⏸️</div>
              </div>
            </div>

            {/* Vacances */}
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Vacances</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.vacation}</p>
                </div>
                <div className="text-3xl">🏖️</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========= INFO BOX (si aucun horaire) ========= */}
      <div className='bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6'>

        {openingHours.length === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Aucun horaire configuré</h3>
                <p className="text-sm text-blue-800">
                  Créez votre premier horaire d'ouverture en cliquant sur le bouton "Nouvel horaire" ci-dessus.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========= CONTENT - ScheduleGrid ========= */}
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ScheduleGrid />
        </div>

        {/* ========= FOOTER INFO ========= */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Calendar className="text-gray-600 flex-shrink-0 mt-1" size={20} />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">ℹ️ À propos des horaires</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Les horaires configurés s'appliquent à toutes les succursales par défaut</li>
                <li>Les changements sont appliqués immédiatement après validation</li>
                <li>Les horaires archivés restent consultables pour audit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};

export default OpeningHoursPage;