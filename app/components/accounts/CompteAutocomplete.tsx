'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchMembers } from '@/app/lib/api/members';
import { MemberData } from '../members/validations';

interface CompteAutocompleteProps {
  selectedKey?:       string;
  onSelectionChange?: (key: string) => void;
  errorMessage?:      string;
  isDisabled?:        boolean;
  isRequired?:        boolean;
  className?:         string;
  label?:             string;
  placeholder?:       string;
  excludeMemberId?:   string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function Avatar({ member }: { member: MemberData }) {
  if (member.photo_profil) {
    return (
      <img
        src={member.photo_profil}
        alt={`${member.first_name} ${member.last_name}`}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = `${member.first_name[0] ?? ''}${member.last_name[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#DDEAD5] flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-[#2E7D32]">{initials || '?'}</span>
    </div>
  );
}

function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── Main ────────────────────────────────────────────────────────────────
export default function CompteAutocomplete({
  selectedKey,
  onSelectionChange,
  errorMessage,
  isDisabled  = false,
  isRequired  = false,
  className   = '',
  label       = 'Membre',
  placeholder = 'Rechercher un membre par ID ou nom…',
  excludeMemberId,
}: CompteAutocompleteProps) {

  const [members,   setMembers]   = useState<MemberData[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  const [open,        setOpen]        = useState(false);
  const [query,       setQuery]       = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  // Position du dropdown (portail)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);

  // ── Chargement initial ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMembers();
        if (!cancelled) {
          setMembers(data);
          setLoadError('');
        }
      } catch (err) {
        console.error('Erreur chargement membres :', err);
        if (!cancelled) setLoadError('Impossible de charger les membres.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Membre sélectionné ────────────────────────────────────────────────
  const selectedMember = useMemo(
    () => members.find(m => m.id === selectedKey) ?? null,
    [members, selectedKey]
  );

  // ── Filtrage ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return members
      .filter(m => m.id !== excludeMemberId)
      .filter(m => {
        if (!q) return true;
        const haystack = normalize(`${m.id} ${m.first_name} ${m.last_name}`);
        return haystack.includes(q);
      });
  }, [members, query, excludeMemberId]);

  // ── Calcul de la position du dropdown ─────────────────────────────────
  const updatePosition = () => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  // ── Fermeture au clic extérieur ───────────────────────────────────────
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideWrapper = wrapperRef.current?.contains(target);
      const insideList    = listRef.current?.contains(target);
      if (!insideWrapper && !insideList) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // ── Reset de l'index actif ────────────────────────────────────────────
  useEffect(() => {
    setActiveIndex(filtered.length > 0 ? 0 : -1);
  }, [filtered.length, open]);

  // ── Scroll auto sur l'élément actif ───────────────────────────────────
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelect = (member: MemberData) => {
    onSelectionChange?.(member.id);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onSelectionChange?.('');
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const displayValue = open
    ? query
    : selectedMember
      ? `${selectedMember.first_name} ${selectedMember.last_name}`
      : '';

  const isDisabledFinal = isDisabled || loading || !!loadError;

  // ── Dropdown (rendu via portail) ──────────────────────────────────────
  const dropdown = open && !isDisabledFinal ? (
    <div
      style={{
        position: 'fixed',
        top:      pos.top,
        left:     pos.left,
        width:    pos.width,
        zIndex:   9999,
      }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
    >
      {filtered.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-gray-400 italic">
          Aucun membre trouvé pour « {query} »
        </div>
      ) : (
        <ul
          ref={listRef}
          role="listbox"
          className="max-h-72 overflow-y-auto py-1"
        >
          {filtered.map((member, idx) => {
            const isActive   = idx === activeIndex;
            const isSelected = member.id === selectedKey;
            return (
              <li
                key={member.id}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(member)}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
                  ${isActive   ? 'bg-[#DDEAD5]/50' : ''}
                  ${isSelected ? 'bg-[#DDEAD5]'    : ''}`}
              >
                <Avatar member={member} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-gray-400 font-mono truncate">
                    ID: {member.id.slice(0, 8)}…
                  </p>
                </div>
                {member.accounts && member.accounts.length > 0 && (
                  <span className="text-xs font-semibold text-[#355C7D] bg-[#EBF2F8] px-2 py-0.5 rounded-md shrink-0">
                    {member.accounts.length} compte{member.accounts.length > 1 ? 's' : ''}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1">
        {label} {isRequired && <span className="text-red-400">*</span>}
      </label>

      {/* Champ */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={loading ? 'Chargement…' : placeholder}
          disabled={isDisabledFinal}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label={label}
          aria-expanded={open}
          aria-autocomplete="list"
          className={`w-full pl-9 pr-16 py-2.5 text-sm rounded-xl border outline-none transition-all
            focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${errorMessage
              ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 bg-white hover:border-gray-300'}`}
        />

        {/* Actions à droite */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedMember && !open && !isDisabledFinal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Effacer la sélection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {loading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-1" />
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform mr-1 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Dropdown via portail */}
      {typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}

      {/* Erreur chargement */}
      {loadError && (
        <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{loadError}</p>
        </div>
      )}

      {/* Erreur de validation */}
      {errorMessage && !loadError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" /> {errorMessage}
        </p>
      )}
    </div>
  );
}