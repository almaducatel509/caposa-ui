"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Filter, X } from 'lucide-react';

export interface DatePeriodFilterProps {
  selectedPeriod: string; // 'all' | 'recent' | 'thisMonth' | 'thisYear' | 'custom'
  startDate?: string;
  endDate?: string;
  onPeriodChange: (period: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  label?: string;
  className?: string;
}

const PRESET_OPTIONS = [
  { key: 'all',       label: 'Toutes périodes',  icon: Filter   },
  { key: 'recent',    label: 'Récents (30j)',    icon: Calendar },
  { key: 'thisMonth', label: 'Ce mois',          icon: Calendar },
  { key: 'thisYear',  label: 'Cette année',      icon: Calendar },
];

function formatDateDisplay(ymd: string): string {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return ymd;
}

/**
 * Filtre réutilisable par période et/ou plage de dates personnalisée :
 * - Récents (30j), Ce mois, Cette année
 * - Date début seule (depuis telle date jusqu'à maintenant)
 * - Date début ET date fin
 */
export const DatePeriodFilter: React.FC<DatePeriodFilterProps> = ({
  selectedPeriod,
  startDate = '',
  endDate = '',
  onPeriodChange,
  onDateRangeChange,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const hasCustomDates = !!startDate || !!endDate;
  const isCustom = selectedPeriod === 'custom' || hasCustomDates;

  // Calcul du libellé affiché sur le bouton trigger
  let triggerLabel = 'Toutes périodes';
  if (isCustom) {
    if (startDate && endDate) {
      triggerLabel = `Du ${formatDateDisplay(startDate)} au ${formatDateDisplay(endDate)}`;
    } else if (startDate) {
      triggerLabel = `Depuis le ${formatDateDisplay(startDate)}`;
    } else if (endDate) {
      triggerLabel = `Jusqu'au ${formatDateDisplay(endDate)}`;
    } else {
      triggerLabel = 'Personnalisé';
    }
  } else {
    const found = PRESET_OPTIONS.find((o) => o.key === selectedPeriod);
    if (found) triggerLabel = found.label;
  }

  const isFilterActive = selectedPeriod !== 'all' || hasCustomDates;

  const handleSelectPreset = (key: string) => {
    onDateRangeChange('', '');
    onPeriodChange(key);
    setOpen(false);
  };

  const handleStartDateChange = (val: string) => {
    onDateRangeChange(val, endDate);
    onPeriodChange('custom');
  };

  const handleEndDateChange = (val: string) => {
    onDateRangeChange(startDate, val);
    onPeriodChange('custom');
  };

  const handleResetDates = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onDateRangeChange('', '');
    onPeriodChange('all');
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all cursor-pointer ${
          isFilterActive
            ? 'bg-[#DDEAD5] border-[#2E7D32]/40 text-[#1B5E20] font-medium shadow-xs'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Calendar className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
        <span className="truncate max-w-[210px]">{triggerLabel}</span>
        {isFilterActive && (
          <span
            onClick={handleResetDates}
            title="Effacer ce filtre"
            className="hover:bg-[#2E7D32]/20 p-0.5 rounded-full text-[#1B5E20] transition-colors"
          >
            <X className="w-3 h-3" />
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-72 sm:w-80 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Options prédéfinies */}
          <div className="px-1 space-y-0.5">
            {PRESET_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedPeriod === opt.key && !hasCustomDates;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectPreset(opt.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#2E7D32]" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Séparateur & Plage personnalisée */}
          <div className="mt-2 pt-2.5 px-3 border-t border-gray-100 bg-[#F9F9F6]/60">
            <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
              Période personnalisée
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                  Date de début :
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                  Date de fin <span className="text-gray-400 font-normal">(optionnel)</span> :
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                />
              </div>

              {hasCustomDates && (
                <div className="pt-1 flex justify-between items-center">
                  <span className="text-[11px] text-gray-500 italic">
                    {startDate && !endDate
                      ? 'Filtre actif à partir de cette date'
                      : 'Filtre actif entre les deux dates'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDates}
                    className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Effacer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Fonction universelle de vérification de date
 */
export function matchesDateFilter(
  dateValue: string | Date | null | undefined,
  period: string,
  startDate?: string,
  endDate?: string
): boolean {
  if (period === 'all' && !startDate && !endDate) return true;
  if (!dateValue) return false;

  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return false;

  const now = new Date();

  // Si une date de début ou de fin personnalisée est fournie
  if (startDate || endDate || period === 'custom') {
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      if (d < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      if (d > e) return false;
    }
    return true;
  }

  if (period === 'recent') {
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  }
  if (period === 'thisMonth') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (period === 'thisYear') {
    return d.getFullYear() === now.getFullYear();
  }
  if (period === 'today') {
    return d.toDateString() === now.toDateString();
  }
  if (period === 'week') {
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }

  return true;
}
