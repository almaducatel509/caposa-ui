import React, { useState } from 'react';
import { Clock, Check, X, Calendar } from 'lucide-react';
import { OpeningHours, openingHoursSchema, ErrorMessages } from './validations';
import { createOpeningHours } from '@/app/lib/api/opening_hour';

const OpeningHoursForm = () => {
  const [formData, setFormData] = useState<OpeningHours>({
    monday: "08:00-17:00",
    tuesday: "08:00-17:00",
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
    saturday: "",
    sunday: "",
  });

  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const dayLabels = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  const dayIcons = {
    monday: '📅',
    tuesday: '📅',
    wednesday: '📅',
    thursday: '📅',
    friday: '📅',
    saturday: '🌴',
    sunday: '☀️',
  };

  const parseTimeString = (timeString: string) => {
    if (!timeString) return { open: '', close: '' };
    const [open, close] = timeString.split('-');
    return { open: open || '', close: close || '' };
  };

  const handleTimeChange = (day: keyof OpeningHours, timeType: 'open' | 'close', value: string) => {
    const currentTime = formData[day] || "08:00-17:00";
    const { open, close } = parseTimeString(currentTime);
    
    const newTime = timeType === 'open' 
      ? `${value}-${close}` 
      : `${open}-${value}`;
    
    setFormData({ ...formData, [day]: newTime });
    
    if (errors[day]) {
      setErrors({ ...errors, [day]: undefined });
    }
  };

  const toggleWeekendDay = (day: 'saturday' | 'sunday') => {
    if (formData[day]) {
      setFormData({ ...formData, [day]: '' });
    } else {
      setFormData({ ...formData, [day]: '08:00-17:00' });
    }
  };

  const validate = () => {
    const newErrors: ErrorMessages<OpeningHours> = {};
    
    // Utiliser ton schema Zod pour la validation
    const result = openingHoursSchema.safeParse(formData);
    
    if (result.success) {
      setErrors({});
      return true;
    }

    // Extraire les erreurs de Zod
    result.error.errors.forEach((err) => {
      const field = err.path[0] as keyof OpeningHours;
      newErrors[field] = err.message;
    });

    setErrors(newErrors);
    return false;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Préparer les données pour l'API
      const dataToSend: any = {
        monday: formData.monday,
        tuesday: formData.tuesday,
        wednesday: formData.wednesday,
        thursday: formData.thursday,
        friday: formData.friday,
      };

      // Ajouter saturday et sunday seulement s'ils ont une valeur
      if (formData.saturday) {
        dataToSend.saturday = formData.saturday;
      }
      if (formData.sunday) {
        dataToSend.sunday = formData.sunday;
      }

      console.log('Données envoyées à l\'API:', dataToSend);
      
      // Appel API réel
      const response = await createOpeningHours(dataToSend);
      
      console.log('Réponse de l\'API:', response);
      
      setShowSuccess(true);
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          monday: "08:00-17:00",
          tuesday: "08:00-17:00",
          wednesday: "08:00-17:00",
          thursday: "08:00-17:00",
          friday: "08:00-17:00",
          saturday: "",
          sunday: "",
        });
      }, 3000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      
      // Gérer les erreurs de l'API
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message
        || error.message 
        || "Une erreur est survenue lors de l'enregistrement.";
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Clock className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Horaires d'Ouverture</h1>
              <p className="text-gray-500 mt-1">Configurez les heures de fonctionnement</p>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6 flex items-center gap-3 animate-pulse">
            <Check className="text-green-600" size={24} />
            <p className="text-green-700 font-semibold">Horaires enregistrés avec succès!</p>
          </div>
        )}

        {apiError && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6 flex items-center gap-3">
            <X className="text-red-600" size={24} />
            <p className="text-red-700 font-semibold">{apiError}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Jours de semaine
              </h2>
              <div className="space-y-4">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => {
                  const { open, close } = parseTimeString(formData[day]);
                  return (
                    <div key={day} className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-100">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-2 md:w-40">
                          <span className="text-2xl">{dayIcons[day]}</span>
                          <label className="font-semibold text-gray-700">
                            {dayLabels[day]}
                          </label>
                        </div>
                        
                        <div className="flex-1 flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Ouverture
                            </label>
                            <input
                              type="time"
                              value={open}
                              onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Fermeture
                            </label>
                            <input
                              type="time"
                              value={close}
                              onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {errors[day] && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <X size={16} />
                          {errors[day]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                Week-end (optionnel)
              </h2>
              <div className="space-y-4">
                {(['saturday', 'sunday'] as const).map((day) => {
                  const isEnabled = !!formData[day];
                  const { open, close } = parseTimeString(formData[day] || '');
                  
                  return (
                    <div key={day} className={`rounded-xl p-4 border-2 transition-all ${
                      isEnabled 
                        ? 'bg-linear-to-r from-purple-50 to-pink-50 border-purple-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => toggleWeekendDay(day)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            isEnabled ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                        <span className="text-2xl">{dayIcons[day]}</span>
                        <label className="font-semibold text-gray-700">
                          {dayLabels[day]}
                        </label>
                      </div>
                      
                      {isEnabled && (
                        <div className="flex flex-col sm:flex-row gap-4 mt-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Ouverture
                            </label>
                            <input
                              type="time"
                              value={open}
                              onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Fermeture
                            </label>
                            <input
                              type="time"
                              value={close}
                              onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      )}
                      
                      {errors[day] && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <X size={16} />
                          {errors[day]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Enregistrer les horaires
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu des données JSON</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(formData).filter(([_, value]) => value)
              ),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default OpeningHoursForm;