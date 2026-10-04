"use client";

import React, { useEffect, useMemo, useState } from "react";import {
  FaPlayCircle, FaBuilding,
  FaCalendarAlt, FaClock, FaExternalLinkAlt,
} from "react-icons/fa";

import { BsTelephone, BsPeople } from "react-icons/bs";
import { MdLocationOn, MdEmail } from "react-icons/md";
// ─── NOUVEAU : icônes lucide pour remplacer les emojis ─────────────────────
import { Loader2, Wallet, ClipboardList, Landmark, User } from "lucide-react";
import type { OpeningHour } from "@/types/branche";
import { Modal } from "../../ui/Modal";
import { Holiday } from "../../holidays/validations";
import { BranchData } from "../validations";
import { EmployeeData } from "../../employees/validations";
import { PostData } from "../../postes/validations";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchData;
  onEdit?: (branch: BranchData, mode: "edit" | "activate") => void;
  openingHours?: OpeningHour[];
  holidays?: Holiday[];
  isLoadingData?: boolean;
  error?: string | null; // ← nouveau : erreur de chargement (réseau/API), différent d'un tableau vide légitime
  employees?: EmployeeData[];
  posts?: PostData[]; // ← nouveau
}
/* ─── Helpers schedule (inchangés) ───────────────────────────────────────── */

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

/* ─── Modal horaires ─────────────────────────────────────────────────────── */

const ScheduleDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  branch: BranchData;
  openingHours: OpeningHour[];
  
}> = ({ isOpen, onClose, branch, openingHours }) => {
  const branchHours = openingHours.find((oh) => oh.id === branch?.opening_hour);
  const scheduleData = branchHours ? parseSchedule(branchHours.schedule) : {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <FaClock className="text-[#2E7D32]" size={15} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Horaires d'ouverture</h3>
            <p className="text-xs text-gray-400 mt-0.5">{branch.branch_name}</p>
          </div>
        </div>
      }
    >
      {/* Body */}
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        {branchHours ? (
          <div className="space-y-2">
            {DAYS_OF_WEEK.map(({ key, label, weekend }) => {
              const hours = scheduleData[key];
              const isClosed = !hours;

              // ─── Ancienne version (commentée pour référence) ────────────
              // weekend ? "bg-[#355C7D]/6 border-[#355C7D]/20"   ❌ bleu hors charte
              //         : "bg-[#DDEAD5]/40 border-[#2E7D32]/20"
              // ─── Nouvelle version : neutre/gris pour weekend, vert pour semaine ─
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 ${
                    isClosed ? "bg-gray-50 border-gray-100 opacity-70"
                    : weekend ? "bg-gray-50 border-gray-200"
                    : "bg-[#DDEAD5]/40 border-[#2E7D32]/20"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isClosed ? "text-gray-400" : "text-gray-800"}`}>
                    {label}
                  </span>
                  <span className={`text-sm ${
                    isClosed ? "text-gray-400 italic"
                    : weekend ? "text-gray-700 font-semibold"
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

      <div className="border-t border-gray-100 p-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
        >
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
  error = null, employees = [], posts = [],
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!branch) return null;

  /* ── Loading ── */
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
/* ── Erreur de chargement (distincte d'une absence légitime de données) ── */
  if (error) {
    console.error("[BranchDetailsModal] Erreur de chargement des données :", error);
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <FaExternalLinkAlt className="text-red-500" size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Impossible de charger les données de la branche</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </Modal>
    );
  }
  /* ── 🎯 LOGIQUE MÉTIER : statut calculé automatiquement ── */
  const hasOpeningHour = Boolean(branch.opening_hour);
  const hasHolidays = Array.isArray(branch.holidays) && branch.holidays.length > 0;
  const isArchived = branch.statusBranche === "archive";

  const isActive = !isArchived && hasOpeningHour && hasHolidays;

  const missingItems: string[] = [];
  if (!hasOpeningHour) missingItems.push("horaires d'ouverture");
  if (!hasHolidays) missingItems.push("jours fériés");

  /* ── Données dérivées ── */
  const displayHolidays = useMemo(() => {
    const ids = branch?.holidays || [];
    if (!passedHolidays.length || !Array.isArray(ids)) return [];
    return passedHolidays.filter((h) => ids.includes(h.id));
  }, [branch?.holidays, passedHolidays]);

  const branchOpeningHours = useMemo(
    () => openingHours.find((oh) => oh.id === branch?.opening_hour),
    [openingHours, branch?.opening_hour]
  );

/* ── Employés réellement rattachés à cette branche ── */
  /* ── Employés réellement rattachés à cette branche (comparaison par id, pas par nom) ── */
  const branchEmployees = useMemo(
    () => employees.filter((e) => e.branch === branch.id),
    [employees, branch.id]
  );

  const positionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    branchEmployees.forEach((e) => {
      const names = e.posts
        ?.map((postId) => posts.find((p) => p.id === postId)?.name)
        .filter((n): n is string => Boolean(n));

      if (names && names.length > 0) {
        names.forEach((name) => {
          counts[name] = (counts[name] || 0) + 1;
        });
      } else {
        counts["Poste non spécifié"] = (counts["Poste non spécifié"] || 0) + 1;
      }
    });
    return counts;
  }, [branchEmployees, posts]);

  const totalStaff = branchEmployees.length;

  // Palette cyclique CAPOSA pour les cartes de poste (peu importe combien de postes distincts)
  const POSITION_PALETTE = [
    { bg: "bg-[#DDEAD5]/60", iconBg: "bg-[#2E7D32]", countColor: "text-[#1B5E20]" },
    { bg: "bg-[#DDEAD5]/30", iconBg: "bg-[#1B5E20]", countColor: "text-[#1B5E20]" },
    { bg: "bg-amber-50/60",  iconBg: "bg-[#D4AF37]", countColor: "text-[#B8860B]" },
  ];
  // ─── Ancienne version (commentée) ────────────────────────────────────────
  // bg: "bg-[#2E7D32]" pour grandes/moyennes, "bg-[#D4AF37]" pour petites
  // ─── Nouvelle version : palette CAPOSA cohérente (déjà OK ici) ──────────
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
  useEffect(() => {
  if (branch) {
    console.log("[BranchDetailsModal] Données affichées :", {
      branch,
      openingHours: branchOpeningHours ?? "non configuré",
      holidays: displayHolidays,
      employees: branchEmployees,
      positionCounts,
      totalStaff,
      isActive,
      missingItems,
    });
  }
}, [branch, branchOpeningHours, displayHolidays, branchEmployees, positionCounts, totalStaff, isActive, missingItems]);
  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <FaBuilding className="text-[#2E7D32]" size={15} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{branch.branch_name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 font-mono">{branch.branch_code}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isArchived ? "bg-gray-100 text-gray-600"
                  : isActive ? "bg-[#DDEAD5] text-[#1B5E20]"
                  : "bg-amber-50 text-amber-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isArchived ? "bg-gray-400"
                    : isActive ? "bg-[#2E7D32]"
                    : "bg-amber-400"
                  }`} />
                  {isArchived ? "Archivée" : isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        }
      >
        {/* ── Body ── */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Bandeau "Inactive" — uniquement si vraiment incomplet */}
          {!isActive && !isArchived && missingItems.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaPlayCircle className="text-amber-500 text-lg mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-0.5 text-sm">Branche inactive</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Il manque : <strong>{missingItems.join(" et ")}</strong>. La branche s'activera automatiquement une fois complétée.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── Informations générales ────────────────────────────────── */}
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
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    isArchived ? "bg-gray-100 text-gray-600"
                    : isActive ? "bg-[#DDEAD5] text-[#1B5E20]"
                    : "bg-amber-100 text-amber-700"
                  }`}>
                    {isArchived ? "Archivée" : isActive ? "Active" : "En attente"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Contact & Horaires ─────────────────────────────────────── */}
            {/* ─── Ancienne version (commentée) : border-blue-100, fond bleu ───── */}
            {/* <div className="bg-white border-2 border-blue-100 rounded-2xl p-5"> */}
            {/* <p className="text-...text-[#355C7D]"> ❌ bleu hors charte */}

            {/* ─── Nouvelle version : palette CAPOSA (vert + or + neutres) ────── */}
            <div className="bg-white border-2 border-[#DDEAD5] rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-2">
                <BsTelephone className="text-[#2E7D32]" /> Contact & Horaires
              </p>
              <div className="space-y-3">

                {/* Téléphone — fond vert clair CAPOSA */}
                <div className="flex items-center gap-3 p-3 bg-[#DDEAD5]/40 rounded-xl">
                  <BsTelephone className="text-[#2E7D32] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <a href={`tel:${branch.branch_phone_number}`} className="text-sm font-medium text-[#2E7D32] hover:underline">
                      {branch.branch_phone_number}
                    </a>
                  </div>
                </div>

                {/* Email — fond gris neutre (était bleu) */}
                {/* ─── Ancienne version : bg-blue-50, text-[#355C7D] ─────────── */}
                {/* ─── Nouvelle : bg-gray-50, text gris/vert CAPOSA ──────────── */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MdEmail className="text-gray-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${branch.branch_email}`} className="text-sm font-medium text-gray-700 hover:text-[#2E7D32] hover:underline truncate block">
                      {branch.branch_email}
                    </a>
                  </div>
                </div>

                {/* Bloc horaires — ambre uniquement si configuré (sémantique : info importante) */}
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
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Voir détails <FaExternalLinkAlt size={10} />
                      </button>
                    ) : (
                      onEdit && (
                        <button
                          onClick={() => { onEdit(branch, "activate"); onClose(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Configurer
                        </button>
                      )
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

                 {/* ── Personnel (basé sur les vrais employés de la branche) ── */}
          <div className="bg-white border-2 border-[#DDEAD5] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-2">
              <BsPeople className="text-[#2E7D32]" />
              Répartition du personnel
              <span className="ml-1 px-2.5 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded-lg text-xs font-semibold">
                {totalStaff} employé{totalStaff > 1 ? "s" : ""}
              </span>
            </p>

            {totalStaff === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                <User className="text-gray-300 w-8 h-8 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Aucun employé assigné à cette branche</p>
              </div>
            ) : (
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(positionCounts).length, 3)}, minmax(0, 1fr))` }}>
                {Object.entries(positionCounts).map(([position, count], i) => {
                  const palette = POSITION_PALETTE[i % POSITION_PALETTE.length];
                  return (
                    <div key={position} className={`text-center p-4 ${palette.bg} border border-gray-100 rounded-xl`}>
                      <div className={`w-10 h-10 rounded-xl ${palette.iconBg} flex items-center justify-center mx-auto mb-2`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className={`text-3xl font-bold ${palette.countColor}`}>{count}</div>
                      <div className="text-xs text-gray-600 mt-1 font-medium">{position}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* ── Jours fériés ────────────────────────────────────────────── */}  
          {/* ── Jours fériés ────────────────────────────────────────────── */}
          <div className="bg-white border-2 border-[#DDEAD5] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-[#2E7D32]" />
              Jours fériés assignés
              {hasHolidays && (
                <span className="ml-1 px-2.5 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded-lg text-xs font-semibold">
                  {displayHolidays.length}
                </span>
              )}
            </p>

            {hasHolidays && displayHolidays.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayHolidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-[#DDEAD5]/40 rounded-xl">
                    <span className="text-sm font-medium text-gray-800">{h.description}</span>
                    <span className="text-xs text-gray-600">{formatDate(h.date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Absence légitime de données : pas une erreur ── */
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                <FaCalendarAlt className="text-gray-300 text-3xl mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Aucun jour férié assigné pour le moment</p>
                {onEdit && (
                  <button
                    onClick={() => { onEdit(branch, "activate"); onClose(); }}
                    className="mt-3 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Configurer
                  </button>
                )}
              </div>
            )}
          </div>     
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          {onEdit && (
            <button
              onClick={() => { onEdit(branch, "edit"); onClose(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#DDEAD5] hover:bg-[#c8e0bc] text-[#1B5E20] text-sm font-semibold transition-colors"
            >
              Modifier
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
          >
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
    </div>
  );
};

export default BranchDetailsModal;