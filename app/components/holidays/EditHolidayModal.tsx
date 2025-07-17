'use client';

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input 
} from '@nextui-org/react';
import { FaCalendarAlt } from 'react-icons/fa';
import { HolidayData } from './validations'; // ✅ Utilise HolidayData au lieu de HolidayDataBase
// import { updateHoliday } from '@/api/holidays'; // à décommenter si tu as une fonction API

interface EditHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: HolidayData | null; // ✅ Permet null
  isEditMode: boolean;
}

const EditHolidayModal: React.FC<EditHolidayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  holiday,
  isEditMode
}) => {
  const [date, setDate] = useState(holiday?.date || '');
  const [description, setDescription] = useState(holiday?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ✅ useEffect pour réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && holiday) {
      setDate(holiday.date || '');
      setDescription(holiday.description || '');
      setApiError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, holiday]);

  // ✅ Validation côté client
  const validateForm = (): boolean => {
    setApiError(null);
    
    if (!date.trim()) {
      setApiError("La date est requise");
      return false;
    }
    
    // Validation format date YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setApiError("La date doit être au format AAAA-MM-JJ");
      return false;
    }
    
    if (!description.trim()) {
      setApiError("La description est requise");
      return false;
    }
    
    if (description.trim().length < 6) {
      setApiError("La description doit contenir au moins 6 caractères");
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    // Validation
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // ✅ Vérification que l'ID existe (en mode édition seulement)
      if (isEditMode && !holiday?.id) {
        throw new Error("ID du jour férié manquant");
      }

      // Import de la fonction API
      // await updateHoliday(holiday.id, { date: date.trim(), description: description.trim() });
      
      if (isEditMode) {
        console.log('Mise à jour:', { 
          id: holiday?.id, 
          date: date.trim(), 
          description: description.trim() 
        });
      } else {
        console.log('Création:', { 
          date: date.trim(), 
          description: description.trim() 
        });
      }
      
      // ✅ Message de succès temporaire
      setSuccessMessage(isEditMode ? 'Jour férié mis à jour avec succès !' : 'Jour férié créé avec succès !');
      
      // Attendre un peu pour montrer le message de succès
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
      
    } catch (error: any) {
      console.error('Erreur mise à jour:', error);
      setApiError(error.message || "Impossible de mettre à jour le jour férié.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Réinitialiser les états lors de la fermeture
    setApiError(null);
    setSuccessMessage(null);
    setDate(holiday?.date || '');
    setDescription(holiday?.description || '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white">
          <FaCalendarAlt />
          <div>
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Modifier le jour férié' : 'Ajouter un jour férié'}
            </h3>
            <p className="text-sm opacity-90">
              {isEditMode ? 'Apportez les changements nécessaires' : 'Créer un nouveau jour férié'}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="p-6 space-y-4">
          {/* Message d'erreur */}
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          {/* Message de succès */}
          {successMessage && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Champ Date */}
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            isRequired
            placeholder="AAAA-MM-JJ"
            description="Sélectionnez la date du jour férié"
            isDisabled={isSubmitting}
          />

          {/* Champ Description */}
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            isRequired
            placeholder="Ex: Fête nationale, Noël, etc."
            description="Minimum 6 caractères"
            isDisabled={isSubmitting}
            maxLength={100}
          />

          {/* Informations additionnelles en mode édition */}
          {isEditMode && holiday?.id && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>ID:</strong> {holiday.id}</p>
              {holiday.created_at && (
                <p><strong>Créé le:</strong> {new Date(holiday.created_at).toLocaleDateString('fr-FR')}</p>
              )}
              {holiday.updated_at && (
                <p><strong>Modifié le:</strong> {new Date(holiday.updated_at).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={handleClose} 
            isDisabled={isSubmitting}
            className="text-gray-600"
          >
            Annuler
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={isSubmitting}
            isDisabled={isSubmitting || !date.trim() || !description.trim()}
            className="bg-green-600 text-white"
          >
            {isSubmitting ? 'Sauvegarde...' : (isEditMode ? 'Sauvegarder' : 'Créer')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditHolidayModal;