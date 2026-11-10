'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Layout/Page Error caught by error.tsx:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
        <p className="text-sm text-gray-600 mb-6">
          Impossible de charger cette section de la page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#144717] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
