'use client';
import React from 'react';

interface TreasuryErrorProps {
  message?: string;
  onRetry?: () => void;
}

const TreasuryError: React.FC<TreasuryErrorProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
    <span className="text-6xl">❌</span>
    <h3 className="text-xl font-semibold text-gray-900">Erreur de chargement</h3>
    <p className="text-gray-600">{message || "Impossible de récupérer les données de trésorerie."}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Réessayer
      </button>
    )}
  </div>
);

export default TreasuryError;
