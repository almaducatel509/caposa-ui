"use client";

import React, { useEffect, useState } from "react";
import { HolidayData } from "@/app/components/holidays/validations";
import HolidayCalendar from "@/app/components/holidays/HolidayCalendar";
import { fetchHolidays } from "@/app/lib/api/holiday";

export default function HolidaysDashboard() {
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [loading, setLoading] = useState(true);

  // const loadHolidays = async () => {
  //   try {
  //     const apiData = await fetchHolidays();

  //     const convertedData: HolidayData[] = apiData.map((apiHoliday) => ({
  //       id: String(apiHoliday.id),
  //       date: apiHoliday.date,
  //       description: apiHoliday.description,
  //       created_at: apiHoliday.created_at ?? undefined,
  //       updated_at: apiHoliday.updated_at ?? undefined,
  //       branch_code: apiHoliday.branch_code ?? undefined,
  //     }));

  //     setHolidays(convertedData);
  //   } catch (error) {
  //     console.error("Error fetching holidays:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadHolidays();
  // }, []);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
  //         <p className="text-gray-600">Chargement des jours fériés...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Jours fériés
        </h1>
      </div>

      <HolidayCalendar holidays={holidays} />
    </div>
  );
}
