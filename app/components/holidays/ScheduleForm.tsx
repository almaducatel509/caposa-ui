"use client";

import { useState } from "react";
import { createOpeningHours } from "@/app/lib/api/opening_hour";
export default function ScheduleForm({
  branchId,
  branchName,
  onSuccess,
  onCancel,
}: {
  branchId: string;
  branchName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
  setLoading(true);

  try {
    const data = {
      monday: "08:00-17:00",
      tuesday: "08:00-17:00",
      wednesday: "08:00-17:00",
      thursday: "08:00-17:00",
      friday: "08:00-17:00",
      saturday: null,
      sunday: null,
    };

    await createOpeningHours(data);

    onSuccess(); // 🔥 refresh + fermer form
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-white p-6 border-2 border-emerald-500 rounded-xl">
      <h3 className="font-bold mb-2">
        Aucun horaire défini pour {branchName}
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Lun-Ven : 08:00 - 17:00 · Sam-Dim : Fermé
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-emerald-600 text-white px-6 py-2 rounded"
        >
          Créer
        </button>
        <button onClick={onCancel} className="bg-gray-200 px-6 py-2 rounded">
          Annuler
        </button>
      </div>
    </div>
  );
}
