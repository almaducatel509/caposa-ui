'use client';

import { useTheme } from '@/app/_providers/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const STATES = ['light', 'dark', 'system'] as const;

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
      {/* ── Icône animée avec rotation et fondu fluide ── */}
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' && (
            <motion.div
              key="light"
              initial={{ opacity: 0, rotate: -70, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 70, scale: 0.5 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4 h-4 text-amber-500 stroke-[2.2]" />
            </motion.div>
          )}

          {theme === 'dark' && (
            <motion.div
              key="dark"
              initial={{ opacity: 0, rotate: -70, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 70, scale: 0.5 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4 h-4 text-[#4CAF50] stroke-[2.2] -rotate-12" />
            </motion.div>
          )}

          {theme === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, scale: 0.5, y: -3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 3 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Monitor className="w-4 h-4 text-gray-600 dark:text-zinc-300 stroke-[2.2]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Indicateur 3 états avec pastille glissante animée ── */}
      <div className="flex items-center gap-1 mt-1" aria-hidden="true">
        {STATES.map((st) => {
          const isActive = theme === st;
          return (
            <div
              key={st}
              className="relative w-1.5 h-1.5 flex items-center justify-center"
            >
              {/* Point inactif */}
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-600 opacity-50" />

              {/* Pastille active avec transition glissante */}
              {isActive && (
                <motion.span
                  layoutId="active-theme-dot"
                  className={clsx(
                    "absolute inset-0 rounded-full",
                    st === 'light' && "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]",
                    st === 'dark' && "bg-[#4CAF50] shadow-[0_0_6px_rgba(76,175,80,0.6)]",
                    st === 'system' && "bg-gray-700 dark:bg-zinc-200"
                  )}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
}
