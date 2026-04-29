"use client";

import React, { useMemo } from "react";
import { CalendarDays, AlertTriangle, Info, MapPin } from "lucide-react";
import type {
  HolidayData,
  HolidayType,
  HolidayScope,
} from "./validations"; // ← AJUSTE chemin
import type { Branch } from "@/types/branche";
import {
  computeHolidayStats,
  formatHolidayDate,
  getBranchesForGroup,
  getDayNumber,
  getMonthShort,
  GroupedHoliday,
  groupHolidaysByEvent,
  isUpcoming,
} from "@/types/holidayHelpers"; // ← AJUSTE chemin (ou "../holidayHelpers")

/* ─── Couleurs par type — typage strict ─────────────────────────────── */

const TYPE_COLORS: Record<
  HolidayType,
  { bg: string; mainText: string; subText: string }
> = {
  ferie:       { bg: "#E6F1FB", mainText: "#042C53", subText: "#0C447C" },
  local:       { bg: "#FBEAF0", mainText: "#4B1528", subText: "#72243E" },
  interne:     { bg: "#E1F5EE", mainText: "#04342C", subText: "#085041" },
  election:    { bg: "#EEEDFE", mainText: "#26215C", subText: "#3C3489" },
  maintenance: { bg: "#FAEEDA", mainText: "#412402", subText: "#633806" },
  autre:       { bg: "#F1EFE8", mainText: "#2C2C2A", subText: "#5F5E5A" },
};

const SCOPE_LABELS: Record<HolidayScope, string> = {
  national: "national",
  regional: "régional",
  branch: "succursale",
  autre: "autre",
};

/* ─── Props ──────────────────────────────────────────────────────────── */

interface HolidayInvertedViewProps {
  holidays: HolidayData[];
  branches: Branch[];
  filteredHolidays?: HolidayData[];
  onManageGroup: (group: GroupedHoliday) => void;
}

/* ─── Composant principal ────────────────────────────────────────────── */

const HolidayInvertedView: React.FC<HolidayInvertedViewProps> = ({
  holidays,
  branches,
  filteredHolidays,
  onManageGroup,
}) => {
  const sourceHolidays = filteredHolidays ?? holidays;

  const groups = useMemo(
    () => groupHolidaysByEvent(sourceHolidays),
    [sourceHolidays]
  );

  const stats = useMemo(
    () => computeHolidayStats(groups, branches),
    [groups, branches]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Vue par jour férié
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pour chaque férié, voyez quelles branches sont concernées
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="À venir" value={stats.upcoming} />
        <StatCard label="Brouillons" value={stats.pending} warn={stats.pending > 0} />
        <StatCard
          label="Sans assignation"
          value={stats.unassigned}
          warn={stats.unassigned > 0}
        />
      </div>

      {groups.length > 0 ? (
        <div className="space-y-2.5">
          {groups.map((group) => (
            <HolidayGroupCard
              key={group.id}
              group={group}
              allBranches={branches}
              onManage={() => onManageGroup(group)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Aucun jour férié trouvé
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Ajustez les filtres ou créez un nouveau jour férié
          </p>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
        <div className="text-xs text-[#355C7D] leading-relaxed">
          <p className="font-semibold mb-1">Modèle d'assignation inversée</p>
          <p>
            Au lieu de configurer les fériés branche par branche, choisissez
            quelles branches sont concernées par chaque férié. Plus rapide, plus
            clair, et chaque action est tracée dans le journal d'audit.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── StatCard ───────────────────────────────────────────────────────── */

const StatCard: React.FC<{
  label: string;
  value: number;
  warn?: boolean;
}> = ({ label, value, warn }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-3.5">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p
      className={`text-xl font-bold ${
        warn ? "text-amber-600" : "text-gray-900"
      }`}
    >
      {value}
    </p>
  </div>
);

/* ─── HolidayGroupCard ───────────────────────────────────────────────── */

interface HolidayGroupCardProps {
  group: GroupedHoliday;
  allBranches: Branch[];
  onManage: () => void;
}

const HolidayGroupCard: React.FC<HolidayGroupCardProps> = ({
  group,
  allBranches,
  onManage,
}) => {
  const concernedBranches = useMemo(
    () => getBranchesForGroup(group, allBranches),
    [group, allBranches]
  );

  const totalBranches = allBranches.length;
  const concernedCount = concernedBranches.length;
  const isUnassigned = concernedCount === 0;
  const isPending = group.isPending;
  const isUpcomingDate = isUpcoming(group.date);

  // 🎯 group.type est typé HolidayType — pas de erreur d'index
  const colors = TYPE_COLORS[group.type];

  /* Badge de compteur */
  const counterBadge = isPending ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle className="w-3 h-3" />
      Brouillon
    </span>
  ) : isUnassigned ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle className="w-3 h-3" />
      Aucune branche
    </span>
  ) : (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
        concernedCount === totalBranches
          ? "bg-[#DDEAD5] text-[#1B5E20]"
          : "bg-amber-50 text-amber-800 border border-amber-200"
      }`}
    >
      {concernedCount} / {totalBranches} branche
      {totalBranches > 1 ? "s" : ""}
    </span>
  );

  /* Bouton */
  const actionButton =
    isPending || isUnassigned ? (
      <button
        onClick={onManage}
        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        Assigner
      </button>
    ) : (
      <button
        onClick={onManage}
        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
      >
        Gérer
      </button>
    );

  return (
    <div
      className={`bg-white border-2 rounded-2xl p-4 transition-colors ${
        isPending || isUnassigned ? "border-amber-200" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
            style={{ backgroundColor: colors.bg }}
          >
            <span
              className="text-[10px] font-semibold uppercase leading-none"
              style={{ color: colors.subText }}
            >
              {getMonthShort(group.date)}
            </span>
            <span
              className="text-base font-bold leading-none mt-0.5"
              style={{ color: colors.mainText }}
            >
              {getDayNumber(group.date)}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {group.description}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatHolidayDate(group.date)}
              <span className="text-gray-400"> · </span>
              <span className="capitalize">
                {SCOPE_LABELS[group.effectiveScope]}
              </span>
              {!isUpcomingDate && (
                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">
                  passé
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {counterBadge}
          {actionButton}
        </div>
      </div>

      {concernedBranches.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>Branches concernées</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {concernedBranches.slice(0, 5).map((b) => (
              <span
                key={b.branch_code}
                className="inline-block px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100"
              >
                {b.branch_name}
              </span>
            ))}
            {concernedBranches.length > 5 && (
              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                +{concernedBranches.length - 5} autres
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayInvertedView;