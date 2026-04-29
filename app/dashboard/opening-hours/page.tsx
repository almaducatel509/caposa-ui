"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clock, Calendar, RefreshCw } from "lucide-react";
// Quand API prete : importer fetchOpeningHours, useState, useEffect, convertToOpeningHours
import { MOCK_OPENING_HOURS } from "@/app/components/OpeningHours/mock";
import PageHeader from "@/app/components/header";
import StatsCards from "@/app/components/OpeningHours/StatsCards";
import { computeStats, convertToOpeningHours, OpeningHrs } from "@/app/components/OpeningHours/validations";
import BranchScheduleManager from "@/app/components/OpeningHours/BranchScheduleManager";
import { fetchOpeningHours } from "@/app/lib/api/branche";

export default function OpeningHoursPage() {
  // Quand API prete : remplacer par useState([]) + useEffect + fetchOpeningHours()
  // const stats = useMemo(() => computeStats(MOCK_OPENING_HOURS), []);
const [hours, setHours] = useState<OpeningHrs[]>([]);

useEffect(() => {
  const load = async () => {
    const data = await fetchOpeningHours();

    const mapped = data.map(convertToOpeningHours);

    setHours(mapped);
  };

  load();
}, []);

const loadOpeningHours = async () => {
  const data = await fetchOpeningHours();
  const mapped = data.map(convertToOpeningHours);
  setHours(mapped);
};

const stats = useMemo(() => computeStats(hours), [hours]);
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 print:bg-white print:p-0 print:m-0 p-6 md:p-8">
      <div className="max-w-7xl mx-auto ">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <PageHeader
            title="Horaires d'Ouverture"
            subtitle="Configuration et consultation des horaires d'ouverture des succursales"
            icon={<Clock className="text-[#2E7D32]" size={28} />}
          />
          {/* Quand API prete : brancher onClick sur loadOpeningHours() */}
          <button
          onClick={loadOpeningHours}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       border border-gray-200 bg-white text-gray-700
                       hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 mt-1"
                       
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsCards stats={stats} />
        </div>

        {/* BranchScheduleManager */}
        <BranchScheduleManager />

        {/* Footer */}
        <div className="mt-4 flex items-start gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-700 mb-1.5">A propos des horaires</p>
            <ul className="flex flex-col gap-1 text-xs text-gray-500">
              <li>Les horaires configures s'appliquent a toutes les succursales par defaut</li>
              <li>Les changements sont appliques immediatement apres validation</li>
              <li>Les horaires archives restent consultables pour audit</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}