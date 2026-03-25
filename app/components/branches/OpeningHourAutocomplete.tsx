"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { FaClock } from "react-icons/fa";
import { CheckCircle2, X, Loader2 } from "lucide-react";
import { fetchOpeningHours } from "@/app/lib/api/branche";
import type { OpeningHour } from "@/types/branche";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Résume un schedule multi-lignes en une ligne courte.
 * Ex: "Lundi: 08:00-17:00\nMardi: 08:00-17:00…" → "Lun–Ven 08:00–17:00"
 */
function summarizeSchedule(schedule: string): string {
  if (!schedule) return "Horaire non défini";
  const lines = schedule
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return "Horaire vide";

  // Extraire la première et dernière plage
  const first = lines[0];
  const last = lines[lines.length - 1];

  const firstHours = first.split(":").slice(1).join(":").trim();
  const lastDay = last.split(":")[0].trim();

  if (lines.length === 1) return first;
  return `${first.split(":")[0].trim()} – ${lastDay} · ${firstHours}`;
}

/**
 * Compte les jours actifs dans le schedule.
 */
function countActiveDays(schedule: string): number {
  return schedule
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.toLowerCase().includes("fermé")).length;
}

/* ─── Composant ──────────────────────────────────────────────────────────── */

interface OpeningHourAutocompleteProps {
  selectedKey?: string;
  onSelectionChange: (id: string) => void;
  errorMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  className?: string;
}

export function OpeningHourAutocomplete({
  selectedKey = "",
  onSelectionChange,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  className = "",
}: OpeningHourAutocompleteProps) {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [searchValue, setSearchValue]   = useState("");
  const [open, setOpen]                 = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Chargement ── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOpeningHours();
        setOpeningHours(data || []);
      } catch {
        setOpeningHours([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  /* ── Fermer au clic extérieur ── */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ── Dérivés ── */
  const selected = openingHours.find((oh) => oh.id === selectedKey);

  const filtered = searchValue.trim()
    ? openingHours.filter((oh) =>
        oh.schedule.toLowerCase().includes(searchValue.toLowerCase())
      )
    : openingHours;

  /* ── Actions ── */
  const selectHour = (oh: OpeningHour) => {
    onSelectionChange(oh.id);
    setSearchValue("");
    setOpen(false);
  };

  const clearSelection = () => {
    onSelectionChange("");
    setSearchValue("");
    inputRef.current?.focus();
  };

  /* ── Hint ── */
  const hint = isLoading
    ? "Chargement des horaires…"
    : openingHours.length === 0
    ? "Aucun horaire disponible — créez-en un dans l'entité Horaires"
    : selected
    ? `${countActiveDays(selected.schedule)} jour(s) actif(s) configuré(s)`
    : `${openingHours.length} horaire(s) disponible(s)`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>

      {/* ── Label ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Horaire d'ouverture
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {!isRequired && (
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-lg font-normal normal-case tracking-normal">
              optionnel
            </span>
          )}
        </p>
        {!isLoading && openingHours.length > 0 && (
          <span className="px-2 py-0.5 bg-[#DDEAD5] text-[#1B5E20] text-xs rounded-lg font-medium">
            {openingHours.length} disponible{openingHours.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Input ── */}
      <div className="relative">
        <FiSearch
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          disabled={isDisabled}
          value={selected && !open ? summarizeSchedule(selected.schedule) : searchValue}
          placeholder={
            isLoading
              ? "Chargement…"
              : openingHours.length === 0
              ? "Aucun horaire créé"
              : "Rechercher un horaire…"
          }
          onChange={(e) => {
            setSearchValue(e.target.value);
            setOpen(true);
            if (selectedKey) onSelectionChange("");
          }}
          onFocus={() => !isDisabled && setOpen(true)}
          className={`w-full h-11 pl-10 pr-10 rounded-xl border-2 text-sm transition-colors outline-none
            ${isDisabled
              ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100"
              : errorMessage
              ? "border-red-400 ring-2 ring-red-200"
              : open
              ? "border-[#2E7D32] ring-2 ring-[#2E7D32]/20"
              : "bg-[#F9F9F6] border-gray-200 hover:border-[#2E7D32]/40 focus:border-[#2E7D32]"
            }
          `}
        />

        {/* Spinner / Clear */}
        {isLoading ? (
          <Loader2
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2E7D32] animate-spin"
          />
        ) : selectedKey ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* ── Hint / Error ── */}
      {errorMessage ? (
        <p className="text-xs text-red-500">{errorMessage}</p>
      ) : (
        <p className="text-xs text-gray-400">{hint}</p>
      )}

      {/* ── Dropdown ── */}
      {open && !isDisabled && !isLoading && (
        <div className="relative z-50">
          <ul className="absolute w-full mt-0.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="py-8 text-center">
                <FaClock className="text-3xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium mb-1">
                  {openingHours.length === 0
                    ? "Aucun horaire configuré"
                    : "Aucun résultat"}
                </p>
                <p className="text-xs text-gray-400 px-4">
                  {openingHours.length === 0
                    ? "Créez un horaire dans l'entité Horaires, puis revenez ici."
                    : "Essayez un autre terme de recherche."}
                </p>
              </li>
            ) : (
              filtered.map((oh) => {
                const isSelected = oh.id === selectedKey;
                const activeDays = countActiveDays(oh.schedule);
                const summary    = summarizeSchedule(oh.schedule);

                return (
                  <li key={oh.id}>
                    <button
                      type="button"
                      onClick={() => selectHour(oh)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                        isSelected
                          ? "bg-[#DDEAD5] text-[#1B5E20]"
                          : "hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      {/* Icône */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#2E7D32]/15"
                            : "bg-amber-50"
                        }`}
                      >
                        <FaClock
                          className={`text-sm ${
                            isSelected ? "text-[#2E7D32]" : "text-amber-600"
                          }`}
                        />
                      </div>

                      {/* Infos */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-sm truncate">
                          {summary}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {activeDays} jour{activeDays !== 1 ? "s" : ""} actif{activeDays !== 1 ? "s" : ""}
                          {" · "}
                          <span className="font-mono text-gray-300 text-[10px]">
                            {oh.id.slice(0, 8)}…
                          </span>
                        </span>
                      </div>

                      {/* Check */}
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="text-[#2E7D32] shrink-0"
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* ── Confirmation sélection ── */}
      {selected && !open && (
        <div className="mt-1 p-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-2 border-[#2E7D32]/20 rounded-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FaClock className="text-[#2E7D32] shrink-0 text-sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {summarizeSchedule(selected.schedule)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {countActiveDays(selected.schedule)} jour(s) actif(s) configuré(s)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              title="Effacer la sélection"
            >
              <X size={14} />
            </button>
          </div>

          {/* Preview schedule compact */}
          <div className="mt-2 pt-2 border-t border-[#2E7D32]/10">
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {selected.schedule
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
                .slice(0, 6)
                .map((line, i) => {
                  const [day, ...rest] = line.split(":");
                  const hours = rest.join(":").trim();
                  const isClosed = hours.toLowerCase().includes("fermé");
                  return (
                    <div key={i} className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-gray-500">{day}</span>
                      <span
                        className={`text-xs font-medium ${
                          isClosed ? "text-gray-300 italic" : "text-[#1B5E20]"
                        }`}
                      >
                        {hours || "—"}
                      </span>
                    </div>
                  );
                })}
            </div>
            {selected.schedule.split("\n").filter(Boolean).length > 6 && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                + {selected.schedule.split("\n").filter(Boolean).length - 6} autre(s) jour(s)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}