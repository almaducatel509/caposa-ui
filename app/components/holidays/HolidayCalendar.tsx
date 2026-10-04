"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Calendar, MapPin,
  MessageSquare, User, Search, Plus, X, Edit2, Trash2, AlertTriangle, Loader2,
} from "lucide-react";
import { TbCalendarCog } from "react-icons/tb";
import PageHeader from "../header";
import EditHolidayModal from "./EditHolidayModal";
import DeleteHolidayModal from "./DeleteHolidayModal";
import HolidayInvertedView from "./HolidayInvertedView";
import AssignBranchesModal from "./modals/AssignBranchesModal";

import { fetchHolidays } from "@/app/lib/api/holidays";
import type { Branch } from "@/types/branche";
import type { GroupedHoliday } from "@/types/holidayHelpers";
import {
  HolidayType, HolidayScope, HolidayData as Holiday,
} from "./validations";
import { fetchBranches } from "@/app/lib/api/branche";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<HolidayType, string> = {
  ferie:       "Férié",
  local:       "Local",
  interne:     "Interne",
  election:    "Élection",
  maintenance: "Maintenance",
  autre:       "Autre",
};

const SCOPE_LABELS: Record<HolidayScope, string> = {
  national: "National",
  regional: "Régional",
  branch:   "Succursale",
  autre:    "Autre",
};

const TYPE_COLORS: Record<HolidayType, string> = {
  ferie:       "bg-[#1B5E20] text-white",
  local:       "bg-[#2E7D32] text-white",
  interne:     "bg-[#81C784] text-[#1B5E20]",
  election:    "bg-[#355C7D] text-white",
  maintenance: "bg-red-500 text-white",
  autre:       "bg-gray-500 text-white",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getDayBg = (holidays: Holiday[]): string => {
  if (holidays.length === 0) return "bg-white hover:bg-gray-50";
  if (holidays.some(h => h.type === "ferie" && h.scope === "national"))
    return "bg-red-50 border-red-200 hover:bg-red-100";
  if (holidays.some(h => h.type === "election"))
    return "bg-blue-50 border-blue-200 hover:bg-blue-100";
  if (holidays.some(h => h.type === "local" || h.scope === "branch"))
    return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
  return "bg-[#DDEAD5]/40 border-[#2E7D32]/20 hover:bg-[#DDEAD5]/70";
};

// ─── EventDetailCard ────────────────────────────────────────────────────────────
function EventDetailCard({
  holiday, allBranches, onEdit, onDelete,
}: {
  holiday: Holiday;
  allBranches: Branch[];
  onEdit: (h: Holiday) => void;
  onDelete: (h: Holiday) => void;
}) {
  const branch = allBranches.find(b => b.branch_code === holiday.branch_code);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${TYPE_COLORS[holiday.type]}`}>
            {TYPE_LABELS[holiday.type]}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            {SCOPE_LABELS[holiday.scope]}
          </span>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={() => onEdit(holiday)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-[#2E7D32] hover:bg-[#DDEAD5] transition-all"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(holiday)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{holiday.description}</h4>

      <div className="flex flex-col gap-1.5 text-sm">
        {branch && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
            <span>{branch.branch_name}</span>
          </div>
        )}
        {holiday.comment && (
          <div className="flex items-start gap-2 text-gray-600">
            <MessageSquare className="w-3.5 h-3.5 text-[#355C7D] shrink-0 mt-0.5" />
            <span className="italic text-gray-500">"{holiday.comment}"</span>
          </div>
        )}
        {holiday.modified_by && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <User className="w-3 h-3 shrink-0" />
            <span>Modifié par {holiday.modified_by}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HolidayCalendar() {
  const [currentDate,    setCurrentDate]    = useState(new Date(2026, 0, 1));
  const [selectedDay,    setSelectedDay]    = useState<Date | null>(null);
  const [filterValue,    setFilterValue]    = useState("");
  const [selectedType,   setSelectedType]   = useState("all");
  const [selectedScope,  setSelectedScope]  = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  /* ── Data réelle ── */
  const [holidays,       setHolidays]       = useState<Holiday[]>([]);
  const [allBranches,    setAllBranches]    = useState<Branch[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  /* ── Modaux ── */
  const [showEditModal,    setShowEditModal]    = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [showAssignModal,  setShowAssignModal]  = useState(false);
  const [selectedHoliday,  setSelectedHoliday]  = useState<Holiday | null>(null);
  const [selectedGroup,    setSelectedGroup]    = useState<GroupedHoliday | null>(null);
  const [isEditMode,       setIsEditMode]       = useState(false);

  const loadData = async () => {
    setLoading(true);
    setApiUnavailable(false);
    try {
      const [h, b] = await Promise.all([fetchHolidays(), fetchBranches()]);
      setHolidays(h);
      setAllBranches(b);
    } catch (e) {
      console.error("Erreur chargement calendrier fériés:", e);
      setApiUnavailable(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filteredHolidays = useMemo(() =>
    holidays.filter(h => {
      const matchSearch = !filterValue ||
        h.description.toLowerCase().includes(filterValue.toLowerCase());
      const matchType   = selectedType  === "all" || h.type  === selectedType;
      const matchScope  = selectedScope === "all" || h.scope === selectedScope;
      const matchBranch = selectedBranch === "all" ||
        h.scope === "national" ||
        h.branch_code === selectedBranch;
      return matchSearch && matchType && matchScope && matchBranch;
    }),
  [holidays, filterValue, selectedType, selectedScope, selectedBranch]);

  // ─── Calendar ────────────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
  }, [currentDate]);

  const holidaysForDate = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    return filteredHolidays.filter(h => h.date === key);
  };

  const eventsToShow = selectedDay
    ? holidaysForDate(selectedDay)
    : filteredHolidays.slice(0, 10);

  const prevMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    setSelectedHoliday(null);
    setIsEditMode(false);
    setShowEditModal(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowDeleteModal(true);
  };

  const handleManageGroup = (group: GroupedHoliday) => {
    setSelectedGroup(group);
    setShowAssignModal(true);
  };

  const handleSuccess = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAssignModal(false);
    setSelectedHoliday(null);
    setSelectedGroup(null);
    setIsEditMode(false);
    loadData(); // recharge les vraies données après toute modification
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <PageHeader
              title="Gestion de calendrier"
              subtitle="Calendrier haïtien — assignez chaque jour aux branches concernées"
              icon={<TbCalendarCog className="text-[#2E7D32]" size={28} />}
            />
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg hover:shadow-xl transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {apiUnavailable && (
            <div className="flex items-start gap-2.5 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Données des jours fériés indisponibles — backend en attente
                (modèle Holiday / table BranchHoliday, en cours côté CS).
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
              />
              {filterValue && (
                <button
                  onClick={() => setFilterValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] appearance-none transition-all"
            >
              <option value="all">Tous les types</option>
              {(Object.keys(TYPE_LABELS) as HolidayType[]).map(k => (
                <option key={k} value={k}>{TYPE_LABELS[k]}</option>
              ))}
            </select>

            <select
              value={selectedScope}
              onChange={e => setSelectedScope(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] appearance-none transition-all"
            >
              <option value="all">Toutes les portées</option>
              {(Object.keys(SCOPE_LABELS) as HolidayScope[]).map(k => (
                <option key={k} value={k}>{SCOPE_LABELS[k]}</option>
              ))}
            </select>

            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] appearance-none transition-all"
            >
              <option value="all">Toutes les succursales</option>
              {allBranches.map(b => (
                <option key={b.branch_code} value={b.branch_code}>{b.branch_name}</option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{filteredHolidays.length}</span> événement(s) trouvé(s)
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Chargement du calendrier…</p>
          </div>
        ) : (
        <div>
        {/* ── BLOC 1 : CALENDRIER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 text-[#2E7D32] transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-50 text-[#2E7D32] transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) =>
                day ? (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(
                      selectedDay?.toDateString() === day.toDateString() ? null : day
                    )}
                    className={`aspect-square border rounded-xl p-1.5 transition-all text-left ${getDayBg(holidaysForDate(day))} ${selectedDay?.toDateString() === day.toDateString() ? "ring-2 ring-[#2E7D32] ring-offset-1" : ""}`}
                  >
                    <div className="text-sm font-semibold text-gray-900 leading-none mb-1">
                      {day.getDate()}
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      {holidaysForDate(day).slice(0, 3).map(h => (
                        <div key={h.id} className={`h-1 flex-1 rounded-full ${TYPE_COLORS[h.type].split(" ")[0]}`} />
                      ))}
                    </div>
                  </button>
                ) : (
                  <div key={idx} />
                )
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Légende</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-200 rounded-lg" />
                  <span>Férié national</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded-lg" />
                  <span>Élection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded-lg" />
                  <span>Exception locale</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#DDEAD5] border border-[#2E7D32]/20 rounded-lg" />
                  <span>Interne / autre</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {selectedDay
                    ? selectedDay.toLocaleDateString("fr-FR", { dateStyle: "full" })
                    : "Tous les événements"}
                </h3>
              </div>
              {selectedDay && (
                <button onClick={() => setSelectedDay(null)} className="text-xs font-semibold text-[#2E7D32] hover:underline">
                  Voir tout
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {eventsToShow.length > 0 ? (
                eventsToShow.map(holiday => (
                  <EventDetailCard
                    key={holiday.id}
                    holiday={holiday}
                    allBranches={allBranches}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">Aucun événement</p>
                  <p className="text-xs mt-1 text-gray-400">
                    {selectedDay ? "Pas d'événement pour cette date" : "Aucun événement ne correspond aux filtres"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BLOC 2 : VUE INVERSÉE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <HolidayInvertedView
            holidays={holidays}
            branches={allBranches}
            filteredHolidays={filteredHolidays}
            onManageGroup={handleManageGroup}
          />
        </div>
        </div>
        )}

      </div>

      {/* Modals */}
      {showEditModal && (
        <EditHolidayModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedHoliday(null); setIsEditMode(false); }}
          onSuccess={handleSuccess}
          holiday={selectedHoliday}
          isEditMode={isEditMode}
          mode={isEditMode ? "edit" : "create"}
        />
      )}
      {showDeleteModal && selectedHoliday && (
        <DeleteHolidayModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedHoliday(null); }}
          onSuccess={handleSuccess}
          holiday={selectedHoliday}
        />
      )}
      {showAssignModal && selectedGroup && (
        <AssignBranchesModal
          isOpen={showAssignModal}
          onClose={() => { setShowAssignModal(false); setSelectedGroup(null); }}
          onSuccess={handleSuccess}
          group={selectedGroup}
          allBranches={allBranches}
        />
      )}
    </div>
  );
}