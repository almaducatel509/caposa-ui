'use client';

import { useTheme } from '@/app/_providers/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={clsx("w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800/60 animate-pulse shrink-0", className)} />
    );
  }

  const getTitle = () => {
    if (theme === 'light') return 'Thème : Clair (Cliquer pour Sombre)';
    if (theme === 'dark') return 'Thème : Sombre (Cliquer pour Système)';
    return 'Thème : Système (Cliquer pour Clair)';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={getTitle()}
      aria-label={getTitle()}
      className={clsx(
        "group relative flex flex-col items-center justify-center w-9 h-9 rounded-xl",
        "bg-gray-100/80 hover:bg-gray-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80",
        "border border-gray-200/80 dark:border-zinc-700/80 transition-all duration-200 cursor-pointer shadow-xs shrink-0",
        className
      )}
    >
      {/* ── Icône animée du mode actif (Superposées / L'une sur l'autre) ── */}
      <div className="relative w-4 h-4 flex items-center justify-center">
        {theme === 'light' && (
          <Sun className="w-4 h-4 text-amber-500 transition-all duration-200 scale-100 rotate-0" />
        )}
        {theme === 'dark' && (
          <Moon className="w-4 h-4 text-[#4CAF50] transition-all duration-200 scale-100 -rotate-12" />
        )}
        {theme === 'system' && (
          <Monitor className="w-4 h-4 text-gray-600 dark:text-zinc-300 transition-all duration-200 scale-100" />
        )}
      </div>

      {/* ── Indicateur 3 états (Light / Dark / Système) ── */}
      <div className="flex items-center gap-0.5 mt-0.5" aria-hidden="true">
        <span
          className={clsx(
            "h-1 rounded-full transition-all duration-200",
            theme === 'light'
              ? "w-2.5 bg-amber-500"
              : "w-1 bg-gray-300 dark:bg-zinc-600 opacity-60"
          )}
        />
        <span
          className={clsx(
            "h-1 rounded-full transition-all duration-200",
            theme === 'dark'
              ? "w-2.5 bg-[#4CAF50]"
              : "w-1 bg-gray-300 dark:bg-zinc-600 opacity-60"
          )}
        />
        <span
          className={clsx(
            "h-1 rounded-full transition-all duration-200",
            theme === 'system'
              ? "w-2.5 bg-gray-700 dark:bg-zinc-200"
              : "w-1 bg-gray-300 dark:bg-zinc-600 opacity-60"
          )}
        />
      </div>
    </button>
  );
}
