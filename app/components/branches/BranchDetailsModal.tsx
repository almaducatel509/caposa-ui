"use client";

import React, { useMemo, useState } from "react";
import {
  FaUniversity, FaCheckCircle, FaPlayCircle, FaBuilding,
  FaCalendarAlt, FaClock, FaExternalLinkAlt,
} from "react-icons/fa";
import { BsTelephone, BsPeople } from "react-icons/bs";
import { MdLocationOn, MdEmail } from "react-icons/md";
import { X, Loader2 } from "lucide-react";
import type { Branch, Holiday, OpeningHour } from "@/types/branche";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch;
  onEdit?: (branch: Branch, mode: "edit" | "activate") => void;
  openingHours?: OpeningHour[];
  holidays?: Holiday[];
  isLoadingData?: boolean;
}

/* ─── Modal générique ────────────────────────────────────────────────────── */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const SIZES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl",
  "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl",
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = "lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${SIZES[size]} w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        {children}
      </div>
    </div>
  );
};

/* ─── Modal horaires ─────────────────────────────────────────────────────── */

const DAYS_OF_WEEK = [
  { key: "monday",    label: "Lundi",     weekend: false },
  { key: "tuesday",   label: "Mardi",     weekend: false },
  { key: "wednesday", label: "Mercredi",  weekend: false },
  { key: "thursday",  label: "Jeudi",     weekend: false },
  { key: "friday",    label: "Vendredi",  weekend: false },
  { key: "saturday",  label: "Samedi",    weekend: true  },
  { key: "sunday",    label: "Dimanche",  weekend: true  },
];

const FR_TO_KEY: Record<string, string> = {
  lundi: "monday", mardi: "tuesday", mercredi: "wednesday",
  jeudi: "thursday", vendredi: "friday", samedi: "saturday", dimanche: "sunday",
};

function parseSchedule(schedule: string): Record<string, string> {
  const days: Record<string, string> = {};
  schedule.split("\n").forEach((line) => {
    const match = line.match(/(\w+):\s*(.+)/);
    if (match) {
      const key = FR_TO_KEY[match[1].toLowerCase()];
      if (key) days[key] = match[2];
    }
  });
  return days;
}

const ScheduleDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  branch: Branch;
  openingHours: OpeningHour[];
}> = ({ isOpen, onClose, branch, openingHours }) => {
  const branchHours = openingHours.find((oh) => oh.id === branch?.opening_hour);
  const scheduleData = branchHours ? parseSchedule(branchHours.schedule) : {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {/* Header blanc */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <FaClock className="text-amber-600" size={15} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Horaires d'ouverture</h3>
            <p className="text-xs text-gray-400 mt-0.5">{branch.branch_name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto flex-1">
        {branchHours ? (
          <div className="space-y-2">
            {DAYS_OF_WEEK.map(({ key, label, weekend }) => {
              const hours = scheduleData[key];
              const isClosed = !hours;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 ${
                    isClosed ? "bg-gray-50 border-gray-100 opacity-70"
                    : weekend ? "bg-[#355C7D]/6 border-[#355C7D]/20"
                    : "bg-[#DDEAD5]/40 border-[#2E7D32]/20"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isClosed ? "text-gray-400" : "text-gray-800"}`}>
                    {label}
                  </span>
                  <span className={`text-sm ${
                    isClosed ? "text-gray-400 italic"
                    : weekend ? "text-[#355C7D] font-semibold"
                    : "text-[#1B5E20] font-semibold"
                  }`}>
                    {isClosed ? "Fermé" : hours}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaClock className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun horaire configuré</p>
          </div>
        )}

        {branchHours && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <FaCalendarAlt className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Ces horaires peuvent changer pendant les jours fériés.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-4 flex justify-end shrink-0">
        <button onClick={onClose} className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
          Fermer
        </button>
      </div>
    </Modal>
  );
};

/* ─── Composant principal ────────────────────────────────────────────────── */

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  isOpen, onClose, branch, onEdit,
  openingHours = [], holidays: passedHolidays = [], isLoadingData = false,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!branch) return null;

  if (isLoadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2E7D32]" />
          <p className="text-sm text-gray-500">Chargement des données…</p>
        </div>
      </Modal>
    );
  }

  const isActive = branch.status === "active";
  const hasConfiguration = branch.opening_hour && Array.isArray(branch.holidays) && branch.holidays.length > 0;

  const displayHolidays = useMemo(() => {
    const ids = branch?.holidays || [];
    if (!passedHolidays.length || !Array.isArray(ids)) return [];
    return passedHolidays.filter((h) => ids.includes(h.id));
  }, [branch?.holidays, passedHolidays]);

  const branchOpeningHours = useMemo(
    () => openingHours.find((oh) => oh.id === branch?.opening_hour),
    [openingHours, branch?.opening_hour]
  );

  const totalStaff = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;

  const getBranchCategory = () => {
    if (totalStaff >= 20) return { text: "Grande branche",  bg: "bg-[#2E7D32]" };
    if (totalStaff >= 10) return { text: "Branche moyenne", bg: "bg-[#2E7D32]" };
    return                       { text: "Petite branche",  bg: "bg-[#D4AF37]" };
  };

  const category = getBranchCategory();

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    try {
      const d = dateString.includes("T") ? new Date(dateString) : new Date(dateString + "T12:00:00");
      return d.toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
    } catch { return dateString; }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">

        {/* ── Header blanc ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <FaBuilding className="text-[#2E7D32]" size={15} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{branch.branch_name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 font-mono">{branch.branch_code}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? "bg-[#DDEAD5] text-[#1B5E20]" : "bg-amber-50 text-amber-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#2E7D32]" : "bg-amber-400"}`} />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {!isActive && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaPlayCircle className="text-amber-500 text-lg mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-0.5 text-sm">Branche inactive</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {!hasConfiguration
                      ? "Cette branche n'a pas encore d'horaire. Activez-la pour la rendre opérationnelle."
                      : "Cette branche est configurée mais reste inactive."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Informations générales */}
            <div className="bg-white border-2 border-[#DDEAD5] rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-2">
                <FaBuilding className="text-[#2E7D32]" /> Informations générales
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Adresse complète</p>
                  <div className="flex items-start gap-2 text-sm text-gray-800 font-medium">
                    <MdLocationOn className="text-[#2E7D32] mt-0.5 shrink-0" />
                    {branch.branch_address}
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Date d'ouverture</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                    <FaCalendarAlt className="text-[#D4AF37]" />
                    {formatDate(branch.opening_date)}
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Catégorie</span>
                  <span className={`${category.bg} text-white px-3 py-1 rounded-lg text-xs font-semibold`}>{category.text}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Statut</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${isActive ? "bg-[#DDEAD5] text-[#1B5E20]" : "bg-amber-100 text-amber-700"}`}>
                    {isActive ? "Opérationnelle" : "En attente"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Horaires */}
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#355C7D] mb-4 flex items-center gap-2">
                <BsTelephone className="text-[#355C7D]" /> Contact & Horaires
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#DDEAD5]/40 rounded-xl">
                  <BsTelephone className="text-[#2E7D32] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <a href={`tel:${branch.branch_phone_number}`} className="text-sm font-medium text-[#2E7D32] hover:underline">
                      {branch.branch_phone_number}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <MdEmail className="text-[#355C7D] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${branch.branch_email}`} className="text-sm font-medium text-[#355C7D] hover:underline truncate block">
                      {branch.branch_email}
                    </a>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border-2 ${branchOpeningHours ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FaClock className={branchOpeningHours ? "text-amber-600" : "text-gray-400"} />
                      <div>
                        <p className="text-xs text-gray-500">Heures d'ouverture</p>
                        <p className={`text-sm font-medium ${branchOpeningHours ? "text-gray-800" : "text-gray-400 italic"}`}>
                          {branchOpeningHours ? "Configuré" : "Non configuré"}
                        </p>
                      </div>
                    </div>
                    {branchOpeningHours ? (
                      <button onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors">
                        Voir détails <FaExternalLinkAlt size={10} />
                      </button>
                    ) : (!isActive && onEdit && (
                      <button onClick={() => { onEdit(branch, "activate"); onClose(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors">
                        <FaPlayCircle size={12} /> Activer
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personnel */}
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-2">
              <BsPeople className="text-[#2E7D32]" />
              Répartition du personnel
              <span className="ml-1 px-2.5 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded-lg text-xs font-semibold">{totalStaff} employés</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { emoji: "💰", count: branch.number_of_tellers,         label: "Caissiers",      from: "from-[#DDEAD5]", to: "to-[#c8e0bc]", color: "text-[#2E7D32]" },
                { emoji: "📋", count: branch.number_of_clerks,          label: "Commis",         from: "from-blue-50",   to: "to-blue-100",   color: "text-[#355C7D]" },
                { emoji: "🏦", count: branch.number_of_credit_officers, label: "Agents crédit",  from: "from-amber-50",  to: "to-amber-100",  color: "text-amber-600" },
              ].map(({ emoji, count, label, from, to, color }) => (
                <div key={label} className={`text-center p-4 bg-gradient-to-br ${from} ${to} rounded-xl`}>
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className={`text-3xl font-bold ${color}`}>{count}</div>
                  <div className="text-xs text-gray-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jours fériés */}
          <div className="bg-white border-2 border-[#DDEAD5] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-[#2E7D32]" />
              Jours fériés
              <span className="ml-1 px-2.5 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded-lg text-xs font-semibold">
                {displayHolidays.length} jour{displayHolidays.length !== 1 ? "s" : ""}
              </span>
            </p>
            {displayHolidays.length > 0 ? (
              <div className="space-y-2">
                {displayHolidays
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((holiday, i) => {
                    const isUpcoming = new Date(holiday.date) > new Date();
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-l-4 ${isUpcoming ? "bg-blue-50 border-l-[#355C7D]" : "bg-gray-50 border-l-gray-300"}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{formatDate(holiday.date)}</p>
                          {holiday.description && <p className="text-xs text-gray-500 mt-0.5">{holiday.description}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${isUpcoming ? "bg-blue-100 text-[#355C7D]" : "bg-gray-100 text-gray-500"}`}>
                          {isUpcoming ? "À venir" : "Passé"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Aucun jour férié configuré</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          {!isActive && onEdit && (
            <button onClick={() => { onEdit(branch, "activate"); onClose(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
              <FaPlayCircle /> Activer la branche
            </button>
          )}
          {onEdit && (
            <button onClick={() => { onEdit(branch, "edit"); onClose(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#DDEAD5] hover:bg-[#c8e0bc] text-[#1B5E20] text-sm font-semibold transition-colors">
              Modifier
            </button>
          )}
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
            Fermer
          </button>
        </div>
      </Modal>

      <ScheduleDetailModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        branch={branch}
        openingHours={openingHours}
      />
    </>
  );
};

export default BranchDetailsModal;