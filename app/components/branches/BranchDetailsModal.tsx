
"use client";

import React, { useMemo, useState } from 'react';
import { FaUniversity, FaCheckCircle, FaPlayCircle, FaBuilding, FaEdit, FaCalendarAlt, FaClock, FaExternalLinkAlt } from "react-icons/fa";
import { BsTelephone, BsPeople } from "react-icons/bs";
import { MdLocationOn, MdEmail } from "react-icons/md";
import { X } from 'lucide-react';
import type { Branch, Holiday, OpeningHour } from "@/types/branche";


interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch;
  onEdit?: (branch: Branch, mode: 'edit' | 'activate') => void;
  openingHours?: OpeningHour[];
  holidays?: Holiday[];
  isLoadingData?: boolean;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses: Record<NonNullable<typeof size>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${sizeClasses[size]} w-full bg-white rounded-2xl shadow-2xl`}>
        <div className="max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Schedule Detail Modal
const ScheduleDetailModal = ({ isOpen, onClose, branch, openingHours }: any) => {
  if (!isOpen) return null;

  const branchOpeningHours = openingHours?.find((oh: OpeningHour) => oh.id === branch?.opening_hour);
  
  const daysOfWeek = [
    { key: "monday", label: "Lundi", emoji: "📅" },
    { key: "tuesday", label: "Mardi", emoji: "📅" },
    { key: "wednesday", label: "Mercredi", emoji: "📅" },
    { key: "thursday", label: "Jeudi", emoji: "📅" },
    { key: "friday", label: "Vendredi", emoji: "📅" },
    { key: "saturday", label: "Samedi", emoji: "🏖️" },
    { key: "sunday", label: "Dimanche", emoji: "☀️" },
  ];

  // Parse schedule string back to individual days
  const parseSchedule = (schedule: string) => {
    const days: any = {};
    schedule.split('\n').forEach(line => {
      const match = line.match(/(\w+):\s*(.+)/);
      if (match) {
        const dayFr = match[1].toLowerCase();
        const hours = match[2];
        // Map French day names to keys
        const dayMap: any = {
          'lundi': 'monday',
          'mardi': 'tuesday',
          'mercredi': 'wednesday',
          'jeudi': 'thursday',
          'vendredi': 'friday',
          'samedi': 'saturday',
          'dimanche': 'sunday'
        };
        if (dayMap[dayFr]) {
          days[dayMap[dayFr]] = hours;
        }
      }
    });
    return days;
  };

  const scheduleData = branchOpeningHours ? parseSchedule(branchOpeningHours.schedule) : {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <FaClock size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Horaires d'ouverture</h3>
            <p className="text-emerald-100 text-sm mt-1">{branch.branch_name}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {branchOpeningHours ? (
          <div className="space-y-3">
            {daysOfWeek.map(({ key, label, emoji }) => {
              const hours = scheduleData[key];
              const isWeekend = key === 'saturday' || key === 'sunday';
              const isClosed = !hours || hours === '';

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isClosed
                      ? 'bg-gray-50 border-gray-200'
                      : isWeekend
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <span className={`font-semibold ${
                      isClosed ? 'text-gray-500' : 'text-gray-800'
                    }`}>
                      {label}
                    </span>
                  </div>
                  <div className={`text-right ${
                    isClosed
                      ? 'text-gray-400 italic'
                      : isWeekend
                      ? 'text-blue-700 font-semibold'
                      : 'text-emerald-700 font-semibold'
                  }`}>
                    {isClosed ? 'Fermé' : hours}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaClock className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun horaire configuré</p>
            <p className="text-gray-400 text-sm mt-2">
              Les horaires seront définis lors de l'activation de la branche
            </p>
          </div>
        )}

        {/* Info supplémentaire */}
        {branchOpeningHours && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Note importante</p>
                <p>
                  Ces horaires sont susceptibles de changer pendant les jours fériés.
                  Consultez la liste des jours fériés dans les détails de la branche.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
};

// Main Component
const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  isOpen,
  onClose,
  branch,
  onEdit,
  openingHours = [],
  holidays: passedHolidays = [],
  isLoadingData = false
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!branch) return null;

  if (isLoadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Chargement des données...</p>
            <p className="text-sm text-gray-400">
              Récupération des horaires et jours fériés pour {branch.branch_name}
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  const isActive = branch.status === 'active';
  const hasConfiguration = branch.opening_hour && branch.holidays && Array.isArray(branch.holidays) && branch.holidays.length > 0;

  const displayHolidays = useMemo(() => {
    const branchHolidays = branch?.holidays || [];
    if (!branch || !passedHolidays.length || !Array.isArray(branchHolidays)) return [];
    return passedHolidays.filter(holiday => branchHolidays.includes(holiday.id));
  }, [branch?.holidays, passedHolidays]);

  const branchOpeningHours = useMemo(() => {
    return openingHours.find(oh => oh.id === branch?.opening_hour);
  }, [openingHours, branch?.opening_hour]);

  const totalStaff = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;

  const getBranchCategory = () => {
    if (totalStaff >= 20) return { text: "Grande branche", bgColor: "bg-emerald-600" };
    if (totalStaff >= 10) return { text: "Branche moyenne", bgColor: "bg-emerald-500" };
    return { text: "Petite branche", bgColor: "bg-amber-500" };
  };

  const category = getBranchCategory();

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = dateString.includes('T') 
        ? new Date(dateString)
        : new Date(dateString + 'T12:00:00');
      
      return date.toLocaleDateString('fr-CA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FaBuilding size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{branch.branch_name}</h3>
                <p className="text-emerald-100 text-sm mt-1">Détails complets de la branche</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-white/30 rounded-full text-sm font-semibold">
                  <FaCheckCircle />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-white/30 rounded-full text-sm font-semibold">
                  <FaPlayCircle />
                  Inactive
                </span>
              )}
              <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-sm font-mono">
                {branch.branch_code}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Alert si inactive */}
          {!isActive && (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaPlayCircle className="text-orange-500 text-xl mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">Branche inactive</h4>
                  <p className="text-sm text-orange-700">
                    {!hasConfiguration 
                      ? "Cette branche vient d’être créée et n’a pas encore d’horaire. Rendez-vous dans la section « Horaires » pour créer un horaire et permettre son activation."
                      : "Cette branche est configurée mais reste inactive. Rendez-vous « Modifier » pour mettre à jour ses informations."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="bg-white border-2 border-emerald-100 rounded-xl p-5">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBuilding className="text-emerald-600" />
                Informations générales
              </h4>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Adresse complète</p>
                  <div className="flex items-start gap-2">
                    <MdLocationOn className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-800 font-medium">{branch.branch_address}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date d'ouverture</span>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-amber-500" />
                    <span className="font-medium text-gray-800">{formatDate(branch.opening_date)}</span>
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Catégorie</span>
                  <span className={`${category.bgColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                    {category.text}
                  </span>
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {isActive ? 'Opérationnelle' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Horaires */}
            <div className="bg-white border-2 border-blue-100 rounded-xl p-5">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BsTelephone className="text-blue-600" />
                Contact & Horaires
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <BsTelephone className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-600">Téléphone</p>
                    <a 
                      href={`tel:${branch.branch_phone_number}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {branch.branch_phone_number}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MdEmail className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <a 
                      href={`mailto:${branch.branch_email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm break-all"
                    >
                      {branch.branch_email}
                    </a>
                  </div>
                </div>

                {/* 🎯 HORAIRES - Afficher détails OU bouton activer */}
                <div className={`p-3 rounded-lg border-2 ${
                  branchOpeningHours ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaClock className={branchOpeningHours ? 'text-amber-600' : 'text-gray-400'} />
                      <div>
                        <p className="text-xs text-gray-600">Heures d'ouverture</p>
                        <p className={`text-sm font-medium ${
                          branchOpeningHours ? 'text-gray-800' : 'text-gray-400 italic'
                        }`}>
                          {branchOpeningHours ? 'Configuré' : 'Non configuré'}
                        </p>
                      </div>
                    </div>
                    
                    {branchOpeningHours ? (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Voir détails
                        <FaExternalLinkAlt size={12} />
                      </button>
                    ) : !isActive && onEdit && (
                      <button
                        onClick={() => {
                          onEdit(branch, 'activate');
                          onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <FaPlayCircle size={14} />
                        Fermer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personnel */}
          <div className="bg-white border-2 border-amber-100 rounded-xl p-5">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BsPeople className="text-emerald-600" />
              Répartition du personnel
              <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                {totalStaff} employés
              </span>
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-3xl font-bold text-emerald-600">{branch.number_of_tellers}</div>
                <div className="text-sm text-gray-600 mt-1">Caissiers</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-3xl font-bold text-blue-600">{branch.number_of_clerks}</div>
                <div className="text-sm text-gray-600 mt-1">Commis</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                <div className="text-2xl mb-2"><FaUniversity /></div>
                <div className="text-3xl font-bold text-amber-600">{branch.number_of_credit_officers}</div>
                <div className="text-sm text-gray-600 mt-1">Agents crédit</div>
              </div>
            </div>
          </div>

          {/* Jours fériés */}
          <div className="bg-white border-2 border-emerald-100 rounded-xl p-5">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600" />
              Jours fériés
              <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                {displayHolidays.length} jours
              </span>
            </h4>

            {displayHolidays.length > 0 ? (
              <div className="space-y-2">
                {displayHolidays
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((holiday, index) => {
                    const holidayDate = new Date(holiday.date);
                    const isUpcoming = holidayDate > new Date();
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                          isUpcoming ? 'bg-blue-50 border-l-blue-400' : 'bg-gray-50 border-l-gray-400'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {formatDate(holiday.date)}
                          </div>
                          {holiday.description && (
                            <p className="text-sm text-gray-600 mt-1">{holiday.description}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isUpcoming ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isUpcoming ? 'À venir' : 'Passé'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun jour férié configuré</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Fermer
          </button>        
        </div>
      </Modal>

      {/* Schedule Detail Modal */}
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