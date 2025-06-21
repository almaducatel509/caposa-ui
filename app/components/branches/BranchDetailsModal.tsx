"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Avatar,
  Divider,
  Spinner
} from "@nextui-org/react";
import { FaUniversity } from "react-icons/fa";
import { 
  FaBuilding, 
  FaEdit, 
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";
import { 
  BsTelephone, 
  BsPeople 
} from "react-icons/bs";
import { 
  MdLocationOn, 
  MdEmail 
} from "react-icons/md";

import { Branch } from './branchesTable';
import { Holiday, OpeningHour } from './validations';
import { appConfig } from '@/app/lib/actions';

interface BranchDetailsModalProps {
  isOpen: boolean;                   // Modal ouvert/fermé
  onClose: () => void;              // Fermer le modal
  branch: Branch;                   // Données de la branche (jamais null)
  onEdit?: (branch: Branch) => void;
  openingHours?: OpeningHour[];  // ✅ Typé correctement maintenant
  holidays?: Holiday[];             // Jours fériés déjà récupérés
  isLoadingData?: boolean;        // 🆕 Ajoutez cette prop pour gérer le loading

}

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  isOpen,
  onClose,
  branch,
  onEdit, //paramètre modifier
  openingHours = [],
  holidays: passedHolidays = [],
  isLoadingData = false  // 

}) => {
    // 🔍 DEBUG LOG
  console.log('🎯 BranchDetailsModal render:', {
    isOpen,
    branchName: branch?.branch_name,
    openingHoursCount: openingHours.length,
    holidaysCount: passedHolidays.length,
    isLoadingData
  });
// ❌ CONDITION 1: Si pas de branch, ne rien afficher
  if (!branch) {
    console.log('❌ Branch est null');
    return null;
  }

  // ⏳ CONDITION 2: Si chargement, afficher loading simple
  if (isLoadingData || (!passedHolidays.length && !openingHours.length)) {
    console.log('⏳ Affichage loading');
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" placement="center">
        <ModalContent>
          <ModalHeader className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Chargement des détails
            </h3>
          </ModalHeader>
          <ModalBody className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Chargement des données...</p>
            <p className="text-sm text-gray-400">
              Récupération des horaires et jours fériés pour {branch.branch_name}
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  // Utiliser useMemo pour éviter les boucles infinies
  const displayHolidays = useMemo(() => {
    if (!branch || !passedHolidays.length) return [];
    return passedHolidays.filter(holiday => 
      branch.holidays.includes(holiday.id)
    );
  }, [branch?.holidays, passedHolidays]);

  // Trouver les heures d'ouverture pour cette branche
  const branchOpeningHours = useMemo(() => {
    return openingHours.find(oh => oh.id === branch?.opening_hour);
  }, [openingHours, branch?.opening_hour]);
  
// Dans BranchDetailsModal, modifiez la logique :
const openingHourDisplay = useMemo(() => {
    if (branchOpeningHours?.schedule) {
      return branchOpeningHours.schedule;
    }
    return 'Heures non définies';
  }, [branchOpeningHours]);


  const totalStaff = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
  
  const getBranchCategory = () => {
    if (totalStaff >= 20) return { color: "success", text: "Grande branche", bgColor: "bg-[#34963d]" };
    if (totalStaff >= 10) return { color: "primary", text: "Branche moyenne", bgColor: "bg-[#1e7367]" };
    return { color: "warning", text: "Petite branche", bgColor: "bg-[#f8bf2c]" };
  };

  const category = getBranchCategory();

  const formatDate = (dateString: string) => {
  if (!dateString) return "Date inconnue";
  try {
    // Traiter différemment selon le format
    const date = dateString.includes('T') 
      ? new Date(dateString)  // Avec heure
      : new Date(dateString + 'T12:00:00');  // Sans heure, ajouter midi local
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return date.toLocaleDateString(appConfig.dateFormat, options);
  } catch (error) {
    return dateString;
  }
};

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh]",
        body: "overflow-y-auto max-h-[85vh] px-6 shadow-inner"
      }}
    >
      <ModalContent>
        <ModalHeader 
          className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white"
        >
          <Avatar
            icon={<FaBuilding />}
            classNames={{
              base: "bg-white/20",
              icon: "text-white"
            }}
          />
          <div>
            <h3 className="text-xl font-bold">{branch.branch_name}</h3>
            <p className="text-sm opacity-90">Détails complets de la branche</p>
          </div>
          <div className="ml-auto">
            <Chip 
              className={` bg-[#1e7367] text-white border border-white/30`}
              size="sm"
            >
              {branch.branch_code}
            </Chip>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6 space-y-6 border overflow-y-auto max-h-[85vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Informations générales */}
              <Card className="border border-[#34963d]/20">
                <CardBody className="p-5">
                  <h4 className="font-semibold text-[#2c2e2f] mb-4 flex items-center gap-2">
                    <FaBuilding className="text-[#34963d]" />
                    Informations générales
                  </h4>
                  
                  <div className="space-y-4">                 
                    <div className='p-2'>
                      <span className="text-gray-600 text-sm">Adresse complète :</span>
                      <div className="flex items-start gap-2 mt-2">
                        <MdLocationOn className="text-[#1e7367] w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="font-medium text-[#2c2e2f] text-sm leading-relaxed">
                          {branch.branch_address}
                        </p>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div className="flex items-center justify-between p-2">
                      <span className="text-gray-600 text-sm">Date d'ouverture :</span>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-[#f8bf2c] w-4 h-4" />
                        <span className="font-medium text-[#2c2e2f] text-sm">
                          {formatDate(branch.opening_date)}
                        </span>
                      </div>
                    </div>
                    <Divider />
                    <div className="flex items-center justify-between p-2">
                      <span className="text-gray-600 text-sm">Créée le :</span>
                      <span className="text-sm font-medium text-[#2c2e2f]">
                        {formatDate(branch.created_at || "")}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex items-center justify-between p-2">
                      <span className="text-gray-600 text-sm">Dernière modification :</span>
                      <span className="text-sm font-medium text-[#2c2e2f]">
                        {formatDate(branch.updated_at || "")}
                      </span>
                    </div>
{/* //  updated_at?: string; */}

                    <Divider />
                    <div className="flex items-center justify-between p-2">
                    <span className="text-gray-600 text-sm">Catégorie :</span>
                    <Chip size="sm" className={`${category.bgColor} text-white`}>
                      {category.text}
                    </Chip>
                  </div>
                  </div>
                </CardBody>
              </Card>

            {/* Contact */}
              <Card className="border border-[#1e7367]/20">
                <CardBody className="p-5">
                  <h4 className="font-semibold text-[#2c2e2f] mb-4 flex items-center gap-2">
                    <BsTelephone className="text-[#1e7367]" />
                    Contact & Horaires
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#34963d]/5 rounded-lg">
                      <BsTelephone className="text-[#34963d] w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-600">Téléphone</p>
                        <a 
                          href={`tel:${branch.branch_phone_number}`}
                          className="text-sm text-[#34963d] hover:text-[#1e7367] transition-colors font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {branch.branch_phone_number}
                        </a>                      
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-[#1e7367]/5 rounded-lg">
                      <MdEmail className="text-[#1e7367] w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <a 
                          href={`mailto:${branch.branch_email}`}
                          className="text-sm text-[#34963d] hover:text-[#1e7367] underline transition-colors break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {branch.branch_email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-[#f8bf2c]/5 rounded-lg">
                      <FaClock className="text-[#f8bf2c] w-4 h-4 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Heures d'ouverture</p>
                        <div className="text-sm font-medium text-[#2c2e2f] leading-relaxed">
                          {openingHourDisplay.split('\n').map((line, index) => (
                            <div key={index} className="mb-1">
                              {line.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Personnel détaillé */}
            <Card className="border border-[#f8bf2c]/30">
              <CardBody className="p-5">
                <h4 className="font-semibold text-[#2c2e2f] mb-4 flex items-center gap-2">
                  <BsPeople className="text-[#34963d]" />
                  Répartition du personnel
                  <Chip size="sm" className="ml-2 bg-[#34963d]/10 text-[#34963d]">
                    {totalStaff} employés au total
                  </Chip>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-[#34963d]/10 to-[#34963d]/5 rounded-xl border border-[#34963d]/20">
                    <div className="w-12 h-12 bg-[#34963d]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-[#34963d] mb-1">
                      {branch.number_of_tellers}
                    </div>
                    <div className="text-sm text-gray-600">Caissiers</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {totalStaff > 0 ? Math.round((branch.number_of_tellers / totalStaff) * 100) : 0}% du personnel
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-[#1e7367]/10 to-[#1e7367]/5 rounded-xl border border-[#1e7367]/20">
                    <div className="w-12 h-12 bg-[#1e7367]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="text-3xl font-bold text-[#1e7367] mb-1">
                      {branch.number_of_clerks}
                    </div>
                    <div className="text-sm text-gray-600">Commis</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {totalStaff > 0 ? Math.round((branch.number_of_clerks / totalStaff) * 100) : 0}% du personnel
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-[#f8bf2c]/10 to-[#f8bf2c]/5 rounded-xl border border-[#f8bf2c]/20">
                    <div className="w-12 h-12 bg-[#f8bf2c]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl"><FaUniversity size={32} color="#007bff" /></span>
                    </div>
                    <div className="text-3xl font-bold text-[#2c2e2f] mb-1">
                      {branch.number_of_credit_officers}
                    </div>
                    <div className="text-sm text-gray-600">Agents crédit</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {totalStaff > 0 ? Math.round((branch.number_of_credit_officers / totalStaff) * 100) : 0}% du personnel
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Jours fériés */}
            <Card className="border border-[#34963d]/20">
              <CardBody className="p-5">
                <h4 className="font-semibold text-[#2c2e2f] mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-[#34963d]" />
                  Jours fériés et fermetures spéciales
                  <Chip size="sm" className="ml-2 bg-[#34963d]/10 text-[#34963d]">
                    {displayHolidays.length} jours
                  </Chip>
                </h4>
                
                {displayHolidays.length > 0 ? (
                  <div className="space-y-3">
                    {displayHolidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((holiday, index) => {
                        const holidayDate = new Date(holiday.date);
                        const isUpcoming = holidayDate > new Date();
                        const isPast = holidayDate < new Date();
                        const dayName = holidayDate.toLocaleDateString('fr-FR', { weekday: 'long' });
                        
                        return (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                              isUpcoming 
                                ? 'bg-blue-50 border-l-blue-400' 
                                : isPast 
                                ? 'bg-gray-50 border-l-gray-400' 
                                : 'bg-orange-50 border-l-orange-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                isUpcoming ? 'bg-blue-400' : isPast ? 'bg-gray-400' : 'bg-orange-400'
                              }`}></div>
                              <div>
                                <div className="font-medium text-gray-800 capitalize">
                                  {dayName} {holidayDate.toLocaleDateString('fr-FR', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </div>
                                {holiday.description && (
                                  <p className="text-sm text-gray-600 mt-1">{holiday.description}</p>
                                )}
                              </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              isUpcoming 
                                ? 'bg-blue-100 text-blue-600' 
                                : isPast 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-orange-100 text-orange-600'
                            }`}>
                              {isUpcoming ? 'À venir' : isPast ? 'Passé' : 'Aujourd\'hui'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Aucun jour férié configuré pour cette branche</p>
                    <p className="text-gray-400 text-xs mt-1">La branche suit les horaires normaux toute l'année</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={onClose}
            className="text-[#2c2e2f]"
          >
            Fermer
          </Button>
          
          {onEdit && (
            <Button 
              className="bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors"
              startContent={<FaEdit />}
              onPress={() => {
                onEdit(branch);
                onClose();
              }}
            >
              Modifier
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export default BranchDetailsModal;