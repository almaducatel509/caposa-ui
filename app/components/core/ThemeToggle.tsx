'use client';

import { useTheme, Theme } from '@/app/_providers/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'system', label: 'Système', icon: Monitor },
  { value: 'dark', label: 'Sombre', icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={clsx("h-9 rounded-xl bg-gray-100 dark:bg-zinc-800/60 animate-pulse", className)} />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Thème d'affichage"
      className={clsx(
        "flex items-center p-1 rounded-xl bg-gray-100 dark:bg-zinc-800/70 border border-gray-200/60 dark:border-zinc-700/60 transition-colors",
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isSelected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(value)}
            title={`Mode ${label}`}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
              isSelected
                ? "bg-white dark:bg-zinc-900 text-[#1B5E20] dark:text-[#81C784] shadow-sm font-semibold"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
