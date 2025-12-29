import React, { useState } from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';

// ============= TYPES =============
export interface ScheduleData {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface ScheduleFormProps {
  branchId: string;
  branchName: string;
  defaultValues?: Partial<ScheduleData>;
  onSuccess: (scheduleData: ScheduleData) => void | Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  showWarning?: boolean;
}

// ============= DEFAULT SCHEDULE =============
const DEFAULT_SCHEDULE: ScheduleData = {
  monday: "08:00 - 17:00",
  tuesday: "08:00 - 17:00",
  wednesday: "08:00 - 17:00",
  thursday: "08:00 - 17:00",
  friday: "08:00 - 17:00",
  saturday: "",
  sunday: "",
};

const DAYS_OF_WEEK = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

// ============= COMPOSANT PRINCIPAL =============
export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  branchId,
  branchName,
  defaultValues = DEFAULT_SCHEDULE,
  onSuccess,
  onCancel,
  submitButtonText = "✓ Créer l'horaire régulier",
  showWarning = true,
}) => {
  const [formData, setFormData] = useState<ScheduleData>({
    ...DEFAULT_SCHEDULE,
    ...defaultValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 🔌 API CALL - À REMPLACER PAR TON VRAI ENDPOINT
      // const response = await fetch(`/api/branches/${branchId}/opening-hours`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Erreur lors de la création');

      // ⏱️ Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Creating schedule for branch:", branchId, formData);

      // ✅ Appeler le callback parent avec les données
      await onSuccess(formData);
      
    } catch (err) {
      console.error("Error creating schedule:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'horaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (day: string, value: string) => {
    setFormData(prev => ({ ...prev, [day]: value }));
  };

  const handleClearField = (day: string) => {
    setFormData(prev => ({ ...prev, [day]: "" }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 p-6 max-w-2xl mx-auto">
      {/* Header avec avertissement */}
      {showWarning && (
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Créer un horaire régulier</h3>
              <p className="text-sm text-gray-600 mt-1">
                Aucun horaire régulier n'a encore été défini pour <strong>{branchName}</strong>.
              </p>
              <p className="text-sm text-gray-600">
                Créez un horaire pour activer cette succursale.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Titre simple si pas de warning */}
      {!showWarning && (
        <div className="mb-6">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <Clock className="text-emerald-600" size={24} />
            Horaire pour {branchName}
          </h3>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Formulaire des jours */}
      <div className="space-y-3 mb-6">
        {DAYS_OF_WEEK.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-28 font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={formData[key as keyof ScheduleData]}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              placeholder="08:00 - 17:00 ou laissez vide si fermé"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {formData[key as keyof ScheduleData] && (
              <button
                onClick={() => handleClearField(key)}
                disabled={isSubmitting}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Marquer comme fermé"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Création en cours..." : submitButtonText}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};