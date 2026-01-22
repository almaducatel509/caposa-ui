// app/analyse/kpis/page.tsx
"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import KpisPage from '@/app/components/analyse/kpis/KPISDashboard';

// Note: metadata ne peut pas être exporté dans un composant client
// Il faut le mettre dans un layout.tsx parent ou utiliser next/head

// Loading component
function KpisLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Chargement des KPIs...</h2>
        <p className="text-gray-500 mt-2">Analyse des indicateurs en cours</p>
      </div>
    </div>
  );
}

export default function KPIsPageWrapper() {
  return (
    <Suspense fallback={<KpisLoading />}>
      <KpisPage />
    </Suspense>
  );
}