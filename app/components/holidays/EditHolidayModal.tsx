"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea
} from "@nextui-org/react";
import { FaEdit, FaPlus, FaCalendarAlt } from "react-icons/fa";
import { HolidayData } from './validations';
import { createHoliday, updateHoliday } from '@/app/lib/api/holiday';

interface EditHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: HolidayData | null;
  isEditMode: boolean;
}

export const EditHolidayModal: React.FC<EditHolidayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  holiday,
  isEditMode
}) => {
  const [formData, setFormData] = useState({
    date: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (isEditMode && holiday) {
      setFormData({
        date: holiday.date || '',
        description: holiday.description || ''
      });
    } else {
      // Mode création : formulaire vide
      setFormData({
        date: '',
        description: ''
      });
    }
    // Reset des erreurs
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
  }, [isEditMode, holiday, isOpen]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    } else {
      // Vérifier que c'est une date valide
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date)) {
        newErrors.date = 'Format de date invalide (YYYY-MM-DD)';
      }
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 3) {
      newErrors.description = 'La description doit contenir au moins 3 caractères';
    } else if (formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      if (isEditMode && holiday?.id) {
        // Appel API pour mise à jour
        await updateHoliday(holiday.id, formData);
        setSuccessMessage('Jour férié modifié avec succès !');
      } else {
        // Appel API pour création
        await createHoliday(formData);
        setSuccessMessage('Jour férié créé avec succès !');
      }

      // Fermer le modal après succès
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Gestion des erreurs API
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Si l'API retourne des erreurs par champ
          const fieldErrors: {[key: string]: string} = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              fieldErrors[key] = errorData[key][0];
            } else {
              fieldErrors[key] = errorData[key];
            }
          });
          setErrors(fieldErrors);
        } else {
          setApiError(`Une erreur est survenue lors de la ${isEditMode ? 'modification' : 'création'}.`);
        }
      } else {
        setApiError(`Une erreur est survenue lors de la ${isEditMode ? 'modification' : 'création'}.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Supprimer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      placement="center"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white">
          {isEditMode ? <FaEdit /> : <FaPlus />}
          <div>
            <h3 className="text-lg font-bold">
              {isEditMode ? "Modifier le jour férié" : "Nouveau jour férié"}
            </h3>
            <p className="text-sm opacity-90">
              {isEditMode 
                ? `Mettre à jour les informations` 
                : "Créer un nouveau jour férié"
              }
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {apiError}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Date */}
            <div>
              <Input
                label="Date"
                placeholder="YYYY-MM-DD"
                type="date"
                value={formData.date}
                onValueChange={(value) => handleChange('date', value)}
                isInvalid={!!errors.date}
                errorMessage={errors.date}
                isDisabled={isSubmitting}
                startContent={<FaCalendarAlt className="text-gray-400" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-200 hover:border-[#34963d] focus-within:border-[#34963d]"
                }}
              />
            </div>

            {/* Description */}
            <div>
              <Textarea
                label="Description"
                placeholder="Décrivez ce jour férié..."
                value={formData.description}
                onValueChange={(value) => handleChange('description', value)}
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                isDisabled={isSubmitting}
                maxRows={4}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-200 hover:border-[#34963d] focus-within:border-[#34963d]"
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 caractères
              </div>
            </div>

            {/* Informations en mode édition */}
            {isEditMode && holiday && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informations</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>ID: {holiday.id.substring(0, 16)}...</div>
                  {holiday.created_at && (
                    <div>
                      Créé le: {new Date(holiday.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {holiday.updated_at && holiday.updated_at !== holiday.created_at && (
                    <div>
                      Modifié le: {new Date(holiday.updated_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric', 
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isSubmitting}
            className="text-[#2c2e2f]"
          >
            Annuler
          </Button>
          <Button 
            className="bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditMode ? "Modification..." : "Création...") 
              : (isEditMode ? "Modifier" : "Créer")
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};