"use client";

import React, { useMemo, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

// Components
import HolidayCalendarFilterBar from "./HolidayCalendarFilterBar";
import EditHolidayModal from "./EditHolidayModal";
import DeleteHolidayModal from "./DeleteHolidayModal";
import { HolidayData } from "./validations";

// ================= TYPES =================
interface Holiday {
  id: string;
  date: string;
  description: string;
  type: "ferie" | "local" | "interne" | "election" | "maintenance" | "autre";
  scope: "national" | "regional" | "branch"|"autre";
  branch_code?: string;
}

interface Branch {
  id: string;
  branch_name: string;
}

// ================= SAMPLE DATA =================
const sampleBranches: Branch[] = [
  { id: "001", branch_name: "Port-au-Prince" },
  { id: "002", branch_name: "Cap-Haïtien" },
  { id: "003", branch_name: "Les Cayes" },
];

const sampleHolidays: Holiday[] = [
  { id: "1", date: "2024-01-01", description: "Jour de l'An", type: "ferie", scope: "national" },
  { id: "2", date: "2024-02-07", description: "Fête locale", type: "local", scope: "branch", branch_code: "001" },
  { id: "3", date: "2024-05-01", description: "Fête du Travail", type: "ferie", scope: "national" },
  { id: "4", date: "2024-09-12", description: "Réunion CA", type: "interne", scope: "national" },
];

// ================= CONSTANTS =================
const typeLabels: Record<string, string> = {
  ferie: "Férié",
  local: "Local",
  interne: "Interne",
  election: "Élection",
  maintenance: "Maintenance",
  autre: "Autre",
};

const typeColors: Record<string, string> = {
  ferie: 'bg-emerald-600 text-white', // Vert profond = officiel 
  local: 'bg-emerald-400 text-white', // Vert clair = régional 
  interne: 'bg-green-700 text-white', // Vert foncé = interne, sérieux 
  election: 'bg-blue-500 text-white', // Bleu = décision, vote 
  maintenance: 'bg-red-500 text-white', // Rouge = alerte, technique 
  autre: 'bg-gray-500 text-white', // Gris = neutre, flexible
};
interface HolidayCalendarProps {
  holidays: HolidayData[];
}

// ================= COMPONENT =================
export default function HolidayCalendar({ holidays }: HolidayCalendarProps) {
  // ---- state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // ---- filtering
  const filteredHolidays = useMemo(() => {
    return sampleHolidays.filter((holiday) => {
      const matchSearch =
        !filterValue ||
        holiday.description.toLowerCase().includes(filterValue.toLowerCase());

      const matchType =
        selectedType === "all" || holiday.type === selectedType;

      const matchBranch =
        selectedBranch === "all" ||
        holiday.scope === "national" ||
        holiday.branch_code === selectedBranch;

      return matchSearch && matchType && matchBranch;
    });
  }, [filterValue, selectedType, selectedBranch]);

  // ---- calendar helpers
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
  };

  const days = generateCalendarDays();

  const holidaysForDate = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    return filteredHolidays.filter((h) => h.date === key);
  };

  // ---- actions
  const handleAdd = () => {
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

  const handleExport = () => {
    console.log("EXPORT", filteredHolidays);
  };

  // ================= RENDER =================
  return (
    <div className="p-6 space-y-6">
      {/* ===== FILTER BAR ===== */}
      <HolidayCalendarFilterBar
        filterValue={filterValue}
        selectedType={selectedType}
        selectedBranch={selectedBranch}
        branches={sampleBranches}
        totalCount={filteredHolidays.length}
        onSearchChange={setFilterValue}
        onClearSearch={() => setFilterValue("")}
        onTypeChange={setSelectedType}
        onBranchChange={setSelectedBranch}
        onAdd={handleAdd}
        onExport={handleExport}
      />

      {/* ===== CALENDAR + LIST ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
              <ChevronLeft />
            </button>
            <h2 className="font-bold text-lg">
              {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) =>
              day ? (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className="aspect-square border rounded-lg p-2 hover:border-emerald-400"
                >
                  <span className="text-sm font-semibold">{day.getDate()}</span>
                  {holidaysForDate(day).map((h) => (
                    <div
                      key={h.id}
                      className={`h-1 mt-1 rounded ${typeColors[h.type]}`}
                    />
                  ))}
                </button>
              ) : (
                <div key={idx} />
              )
            )}
          </div>
        </div>

        {/* Event list */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          {(selectedDay
            ? holidaysForDate(selectedDay)
            : filteredHolidays
          ).map((holiday) => {
            const branch = sampleBranches.find(b => b.id === holiday.branch_code);
            return (
              <div key={holiday.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <Chip className={typeColors[holiday.type]}>
                    {typeLabels[holiday.type]}
                  </Chip>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(holiday)}><FaEdit /></button>
                    <button onClick={() => handleDelete(holiday)}><FaTrash /></button>
                  </div>
                </div>

                <p className="font-semibold mt-2">{holiday.description}</p>

                {branch && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> {branch.branch_name}
                  </p>
                )}
              </div>
            );
          })}

          {(selectedDay
            ? holidaysForDate(selectedDay)
            : filteredHolidays
          ).length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Calendar size={40} className="mx-auto mb-2" />
              Aucun événement
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {showEditModal && (
        <EditHolidayModal
          isOpen
          holiday={selectedHoliday}
          isEditMode={isEditMode}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && selectedHoliday && (
        <DeleteHolidayModal
          isOpen
          holiday={selectedHoliday}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
