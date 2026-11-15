"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  icon?: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  id?: string;
  name?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  disabled = false,
  error = false,
  icon,
  className = "",
  emptyMessage = "Aucun résultat trouvé",
  id,
  name,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normaliser les options (accepte strings ou objets SelectOption)
  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Option actuellement sélectionnée
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Filtrage selon la recherche (insensible à la casse et aux accents)
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return normalizedOptions.filter((opt) => {
      const l = opt.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const v = opt.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const s = opt.sublabel
        ? opt.sublabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        : "";
      return l.includes(q) || v.includes(q) || s.includes(q);
    });
  }, [normalizedOptions, searchQuery]);

  // Détection position (haut/bas) et autofocus
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250 && rect.top > 250) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Fermeture au clic externe et touche Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input caché pour compatibilité formulaire standard */}
      {name && <input type="hidden" name={name} id={id} value={value} />}

      {/* Bouton déclencheur */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between text-left transition-all ${
          icon ? 'pl-8 pr-3' : 'px-3.5'
        } py-2.5 rounded-xl text-sm border min-h-[42px] ${
          error
            ? 'border-red-300 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-200'
            : isOpen
            ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20 bg-white text-gray-900 shadow-sm'
            : 'border-gray-200 bg-[#F9F9F6] text-gray-800 hover:border-gray-300 hover:bg-white'
        } ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100 hover:border-gray-200'
            : 'cursor-pointer'
        }`}
      >
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}

        <span
          className={`block truncate ${
            !selectedOption ? 'text-gray-400 font-normal' : 'font-medium text-gray-800'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={15}
          className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2E7D32]' : ''
          }`}
        />
      </button>

      {/* Menu déroulant avec champ de recherche */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Barre de recherche */}
          <div className="relative mb-2 px-1">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/30 text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Liste des options */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-xs transition-colors ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#DDEAD5]/60 text-[#1B5E20] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate">{opt.label}</p>
                      {opt.sublabel && (
                        <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[#2E7D32] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
