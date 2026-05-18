'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, User, X, AlertTriangle, Loader2 } from 'lucide-react';
import { MemberOption } from './validations';
//\app\components\members\MemberPicker.tsx
// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberPickerProps {
  members:          MemberOption[];
  selectedMember:   MemberOption | null;
  onSelect:         (member: MemberOption | null) => void;
  loading?:         boolean;
  errorMessage?:    string;
  label?:           string;
  placeholder?:     string;
  isRequired?:      boolean;
  excludeMemberId?: string;
  className?:       string;
}

// ─── Helper : normalisation des accents ───────────────────────────────────────
function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MemberPicker({
  members,
  selectedMember,
  onSelect,
  loading         = false,
  errorMessage,
  label           = 'Membre',
  placeholder     = 'Nom ou numéro de membre…',
  isRequired      = false,
  excludeMemberId,
  className       = '',
}: MemberPickerProps) {

  const [search, setSearch] = useState('');
  const [open,   setOpen]   = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Filtrage ──
  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return members
      .filter(m => m.id !== excludeMemberId)
      .filter(m => {
        if (!q) return true;
        const haystack = normalize(`${m.member_name} ${m.id_number}`);
        return haystack.includes(q);
      });
  }, [members, search, excludeMemberId]);

  // ── Fermeture au clic extérieur ──
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSelect = (m: MemberOption) => {
    onSelect(m);
    setSearch('');
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearch('');
  };

  return (
    <div ref={wrapperRef} className={`flex flex-col gap-2 ${className}`}>

      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label} {isRequired && <span className="text-red-400">*</span>}
      </p>

      {!selectedMember ? (
        // ── État : aucune sélection → champ de recherche ──────────────
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={loading ? 'Chargement…' : placeholder}
            disabled={loading}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition-all
              focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${errorMessage
                ? 'border-red-300 bg-red-50/30'
                : 'border-gray-200 bg-[#F9F9F6]'}`}
          />

          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}

          {/* Dropdown */}
          {open && !loading && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden max-h-[280px] overflow-y-auto">
              {filtered.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onMouseDown={() => handleSelect(m)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9F9F6] text-left border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.member_name}</p>
                    <p className="text-xs text-gray-400">#{m.id_number}</p>
                  </div>
                  {m.phone_number && (
                    <p className="text-xs text-gray-400 shrink-0 ml-2">{m.phone_number}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {open && !loading && filtered.length === 0 && search && (
            <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-6 text-center">
              <p className="text-xs text-gray-400 italic">
                Aucun membre trouvé pour « {search} »
              </p>
            </div>
          )}
        </div>
      ) : (
        // ── État : sélection → carte compacte ──────────────────────
        <div className="flex items-center justify-between p-3 bg-[#DDEAD5]/40 rounded-xl border border-[#DDEAD5]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{selectedMember.member_name}</p>
              <p className="text-xs text-gray-500 truncate">
                #{selectedMember.id_number}
                {selectedMember.phone_number && ` · ${selectedMember.phone_number}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Changer de membre"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Erreur */}
      {errorMessage && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" /> {errorMessage}
        </p>
      )}
    </div>
  );
}