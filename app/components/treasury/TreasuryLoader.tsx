'use client';
import React from 'react';

const TreasuryLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-4">
    <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="text-gray-600 font-medium">Chargement des données de trésorerie...</p>
  </div>
);

export default TreasuryLoader;
