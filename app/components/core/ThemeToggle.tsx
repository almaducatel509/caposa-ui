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
    if (theme === 'light') return 'Thème : Clair (Cliquer pour passer en Sombre)';
    if (theme === 'dark') return 'Thème : Sombre (Cliquer pour passer en Système)';
    return 'Thème : Système (Cliquer pour passer en Clair)';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={getTitle()}
      aria-label={getTitle()}
      className={clsx(
        "group relative flex flex-col items-center justify-center w-9 h-9 rounded-xl",
        "bg-gray-100/90 hover:bg-gray-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700",
        "border border-gray-200 dark:border-zinc-700 transition-all duration-200 cursor-pointer shadow-xs shrink-0",
        className
      )}
    >
      {/* ── Icône vectorielle officielle Lucide (Sun / Moon / Monitor) ── */}
      <div className="relative flex items-center justify-center">
        {theme === 'light' && (
          <Sun className="w-4 h-4 text-amber-500 transition-all duration-200 stroke-[2.2]" />
        )}
        {theme === 'dark' && (
          <Moon className="w-4 h-4 text-[#4CAF50] transition-all duration-200 stroke-[2.2] -rotate-12" />
        )}
        {theme === 'system' && (
          <Monitor className="w-4 h-4 text-gray-600 dark:text-zinc-300 transition-all duration-200 stroke-[2.2]" />
        )}
      </div>

      {/* ── Indicateur 3 états : 3 points parfaitement circulaires et proportionnés ── */}
      <div className="flex items-center gap-1 mt-1" aria-hidden="true">
        <span
          className={clsx(
            "w-1 h-1 rounded-full transition-all duration-200",
            theme === 'light'
              ? "bg-amber-500 scale-125"
              : "bg-gray-300 dark:bg-zinc-600 opacity-50"
          )}
        />
        <span
          className={clsx(
            "w-1 h-1 rounded-full transition-all duration-200",
            theme === 'dark'
              ? "bg-[#4CAF50] scale-125"
              : "bg-gray-300 dark:bg-zinc-600 opacity-50"
          )}
        />
        <span
          className={clsx(
            "w-1 h-1 rounded-full transition-all duration-200",
            theme === 'system'
              ? "bg-gray-700 dark:bg-zinc-200 scale-125"
              : "bg-gray-300 dark:bg-zinc-600 opacity-50"
          )}
        />
      </div>
    </button>
  );
}
