"use client";

import { useState } from "react";

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
    await new Promise(r => setTimeout(r, 1000));
    alert(`Horaire créé pour ${branchName}`);
    onSuccess();
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
