"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchBranches } from "@/app/lib/api/branche";
import type { BranchData, BaseAutocompleteProps } from "@/types/autocomplete.types";
import { CiBank } from "react-icons/ci";
import { GrMapLocation } from "react-icons/gr";
import { BsTelephone } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";

interface BranchAutocompleteProps extends BaseAutocompleteProps {
  onAddNew?: () => void;
}

export function BranchAutocomplete({
  selectedKey,
  onSelectionChange,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  onAddNew,
  className = "",
}: BranchAutocompleteProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Chargement ── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBranches();
        setBranches(data || []);
      } catch {
        setBranches([]);
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

  /* ── Calculs dérivés ── */
  const selectedBranch = branches.find((b) => b.id === selectedKey);

  const filteredBranches = searchValue
    ? branches.filter((b) =>
        `${b.name} ${b.address ?? ""} ${b.phone_number ?? ""}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : branches;

  /* ── Sélection d'un item ── */
  const selectBranch = (branch: BranchData) => {
    onSelectionChange(branch.id);
    setSearchValue(branch.name);
    setOpen(false);
  };

  /* ── Clear ── */
  const clearSelection = () => {
    onSelectionChange("");
    setSearchValue("");
    inputRef.current?.focus();
  };

  /* ── Hint sous le champ ── */
  const hint = isLoading
    ? "Chargement des branches…"
    : searchValue && filteredBranches.length > 0
    ? `${filteredBranches.length} branche${filteredBranches.length > 1 ? "s" : ""} trouvée${filteredBranches.length > 1 ? "s" : ""}`
    : branches.length === 0
    ? "Aucune branche disponible"
    : "Recherchez par nom ou adresse";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>

      {/* Label */}
      <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          Branche
          {isRequired && <span className="text-red-500">*</span>}
          {!isLoading && (
            <span className="ml-1 px-2 py-0.5 bg-[#DDEAD5] text-[#1B5E20] text-xs rounded-lg font-medium">
              {branches.length} disponibles
            </span>
          )}
        </span>
      </label>

      {/* Input wrapper */}
      <div className="relative">
        <FiSearch
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />

        <input
          ref={inputRef}
          type="text"
          disabled={isDisabled}
          value={selectedBranch && !open ? selectedBranch.name : searchValue}
          placeholder="Rechercher par nom ou adresse…"
          onChange={(e) => {
            setSearchValue(e.target.value);
            setOpen(true);
            if (selectedKey) onSelectionChange("");
          }}
          onFocus={() => setOpen(true)}
          className={`w-full h-11 pl-10 pr-10 rounded-xl text-sm border-2 transition-colors outline-none
            ${isDisabled ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200" : "bg-white"}
            ${errorMessage
              ? "border-red-400 ring-2 ring-red-200 focus:border-red-400"
              : open
              ? "border-[#2E7D32] ring-2 ring-[#2E7D32]/20"
              : "border-gray-200 hover:border-[#2E7D32]/40 focus:border-[#2E7D32]"
            }
          `}
        />

        {/* Spinner */}
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        )}

        {/* Clear */}
        {!isLoading && selectedKey && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Hint / error */}
      {errorMessage ? (
        <p className="text-xs text-red-500">{errorMessage}</p>
      ) : (
        <p className="text-xs text-gray-400">{hint}</p>
      )}

      {/* Dropdown */}
      {open && !isDisabled && (
        <div className="relative z-50">
          <ul className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto py-1">
            {filteredBranches.length === 0 ? (
              <li className="py-8 text-center">
                <CiBank className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium mb-3">
                  {isLoading ? "Chargement…" : "Aucune branche trouvée"}
                </p>
                {!isLoading && onAddNew && (
                  <button
                    type="button"
                    onClick={onAddNew}
                    className="px-4 py-2 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
                  >
                    + Ajouter une branche
                  </button>
                )}
              </li>
            ) : (
              filteredBranches.map((branch) => (
                <li key={branch.id}>
                  <button
                    type="button"
                    onClick={() => selectBranch(branch)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                      branch.id === selectedKey
                        ? "bg-[#DDEAD5] text-[#1B5E20]"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    {/* Icône */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DDEAD5] to-[#c8e0bc] flex items-center justify-center shrink-0">
                      <CiBank className="text-[#2E7D32] text-lg" />
                    </div>

                    {/* Infos */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{branch.name}</span>
                      {branch.address && (
                        <span className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <GrMapLocation className="text-[#2E7D32] shrink-0" size={10} />
                          {branch.address}
                        </span>
                      )}
                      {branch.phone_number && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <BsTelephone className="text-[#2E7D32] shrink-0" size={10} />
                          {branch.phone_number}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Sélection confirmée */}
      {selectedBranch && !open && (
        <div className="mt-1 p-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-2 border-[#2E7D32]/20 rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CiBank className="text-[#2E7D32] shrink-0 text-lg" />
              <span className="text-sm font-semibold text-gray-900 truncate">
                {selectedBranch.name}
              </span>
              {selectedBranch.address && (
                <span className="text-xs text-gray-500 hidden sm:block truncate">
                  · {selectedBranch.address}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none shrink-0"
              title="Effacer la sélection"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}