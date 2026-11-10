'use client';

interface TablePageSkeletonProps {
  title?: string;
  subtitle?: string;
  rowCount?: number;
}

export default function TablePageSkeleton({
  title,
  subtitle,
  rowCount = 7,
}: TablePageSkeletonProps) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* ── En-tête : Titre & Bouton d'action principal ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-800" />
          <div className="space-y-1.5">
            {title ? (
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
            ) : (
              <div className="h-6 w-44 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            )}
            {subtitle ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>
            ) : (
              <div className="h-3.5 w-60 bg-gray-100 dark:bg-zinc-800/60 rounded" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="h-10 w-28 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-10 w-36 bg-[#2E7D32]/25 dark:bg-[#2E7D32]/35 rounded-xl" />
        </div>
      </div>

      {/* ── Barre de Filtres & Recherche ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Champ de recherche */}
        <div className="flex-1 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800/70 border border-gray-200/50 dark:border-zinc-700/50 flex items-center px-3 gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-zinc-600" />
          <div className="h-3 w-40 bg-gray-200 dark:bg-zinc-700 rounded" />
        </div>

        {/* Filtres dropdowns */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-36 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-10 w-32 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
          {/* Onglets Actif / Archivé */}
          <div className="h-10 w-40 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>

      {/* ── Tableau de données Réaliste ── */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <div className="min-w-[750px]">
            {/* Entête colonnes */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/70 dark:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800">
          <div className="col-span-4 h-3.5 bg-gray-200 dark:bg-zinc-700 rounded w-28" />
          <div className="col-span-3 h-3.5 bg-gray-200 dark:bg-zinc-700 rounded w-20" />
          <div className="col-span-2 h-3.5 bg-gray-200 dark:bg-zinc-700 rounded w-16" />
          <div className="col-span-2 h-3.5 bg-gray-200 dark:bg-zinc-700 rounded w-20" />
          <div className="col-span-1 h-3.5 bg-gray-200 dark:bg-zinc-700 rounded w-8 ml-auto" />
        </div>

        {/* Lignes de données */}
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {Array.from({ length: rowCount }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/40 dark:hover:bg-zinc-800/20 transition-colors"
            >
              {/* Colonne 1 : Avatar + Nom + Identifiant */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-32" />
                  <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded w-24" />
                </div>
              </div>

              {/* Colonne 2 : Détails / Succursale / Téléphone */}
              <div className="col-span-3 space-y-1">
                <div className="h-3.5 bg-gray-200 dark:bg-zinc-800 rounded w-28" />
                <div className="h-2.5 bg-gray-100 dark:bg-zinc-800/60 rounded w-20" />
              </div>

              {/* Colonne 3 : Rôle / Badge de type */}
              <div className="col-span-2">
                <div className="h-6 w-20 bg-gray-100 dark:bg-zinc-800 rounded-full" />
              </div>

              {/* Colonne 4 : Statut (pilule verte / grise) */}
              <div className="col-span-2">
                <div className="h-6 w-16 bg-[#2E7D32]/15 dark:bg-[#2E7D32]/25 rounded-full" />
              </div>

              {/* Colonne 5 : Actions (3 petits points ou boutons d'icônes) */}
              <div className="col-span-1 flex items-center justify-end gap-1">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>

        </div>
        </div>

        {/* ── Pied de Tableau : Pagination ── */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/30 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="h-3.5 w-44 bg-gray-200 dark:bg-zinc-700 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
            <div className="h-8 w-8 bg-[#2E7D32]/20 dark:bg-[#2E7D32]/30 rounded-lg" />
            <div className="h-8 w-8 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
            <div className="h-8 w-20 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
