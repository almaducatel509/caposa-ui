"use client";

import React from "react";
import { Clock, CheckCircle, PauseCircle, Palmtree } from "lucide-react";

interface OpeningHoursStats {
  total: number;
  active: number;
  paused: number;
  vacation: number;
}

interface StatsCardsProps {
  stats: OpeningHoursStats;
}

const STAT_CARDS = [
  {
    key: "total" as keyof OpeningHoursStats,
    label: "Total horaires",
    icon: Clock,
    iconBg: "bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]",
    border: "border-gray-100",
    valueColor: "text-gray-900",
    labelColor: "text-gray-500",
  },
  {
    key: "active" as keyof OpeningHoursStats,
    label: "Actifs",
    icon: CheckCircle,
    iconBg: "bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]",
    border: "border-[#DDEAD5]",
    valueColor: "text-[#1B5E20]",
    labelColor: "text-[#2E7D32]",
  },
  {
    key: "paused" as keyof OpeningHoursStats,
    label: "En pause",
    icon: PauseCircle,
    iconBg: "bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]",
    border: "border-yellow-100",
    valueColor: "text-yellow-800",
    labelColor: "text-yellow-600",
  },
  {
    key: "vacation" as keyof OpeningHoursStats,
    label: "Vacances",
    icon: Palmtree,
    iconBg: "bg-gradient-to-br from-gray-500 to-gray-700",
    border: "border-gray-100",
    valueColor: "text-gray-700",
    labelColor: "text-gray-500",
  },
] as const;

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STAT_CARDS.map(({ key, label, icon: Icon, iconBg, border, valueColor, labelColor }) => (
        <div
          key={key}
          className={`bg-white rounded-2xl p-5 border ${border} shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className={`text-2xl font-bold ${valueColor}`}>{stats[key]}</p>
          <p className={`text-sm mt-0.5 ${labelColor}`}>{label}</p>
        </div>
      ))}
    </div>
  );
}