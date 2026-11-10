'use client';

export default function DashboardOverviewSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* ── En-tête : Salutations & Statut Caisse ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-800/60 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-10 w-32 bg-[#2E7D32]/20 dark:bg-[#2E7D32]/30 rounded-xl" />
        </div>
      </div>

      {/* ── 4 Cartes KPI Principales ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Volume total', color: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Transactions', color: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Membres actifs', color: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Taux de succès', color: 'bg-purple-50 dark:bg-purple-950/20' },
        ].map((card, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className={`w-9 h-9 rounded-xl ${card.color}`} />
            </div>
            <div className="h-8 w-36 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* ── Actions Rapides ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-3">
        <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-12 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/80"
            />
          ))}
        </div>
      </div>

      {/* ── Section Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique de Volume (2/3) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-44 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-56 bg-gray-100 dark:bg-zinc-800/60 rounded" />
            </div>
            <div className="h-8 w-24 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
          </div>
          {/* Faux graphiques en barres */}
          <div className="h-64 flex items-end gap-3 pt-6 px-2">
            {[45, 65, 30, 85, 55, 95, 70, 40, 75, 60, 90, 50].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#2E7D32]/20 dark:bg-[#2E7D32]/30 rounded-t-lg transition-all"
                  style={{ height: `${h}%` }}
                />
                <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par Type (1/3) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-48 bg-gray-100 dark:bg-zinc-800/60 rounded" />
          </div>
          {/* Faux donut chart */}
          <div className="h-44 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-[#2E7D32]/20 dark:border-[#2E7D32]/30 border-t-[#2E7D32] border-r-blue-400" />
          </div>
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-zinc-800" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-3 w-12 bg-gray-100 dark:bg-zinc-800/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tableau Activité Récente ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 bg-gray-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-gray-100 dark:bg-zinc-800 rounded" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-gray-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-24 bg-gray-100 dark:bg-zinc-800/60 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
