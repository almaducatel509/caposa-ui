"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchMembers } from "@/app/lib/api/members";
import { Autocomplete, AutocompleteItem } from "@heroui/react";

interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email?: string | null;
  phone_number?: string;
  photo_url?: string | null;
}

export default function MemberAutocomplete({
  selectedKey,
  onSelectionChange,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  className = "",
}: {
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  errorMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  className?: string;
}) {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Load members
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMembers();
        setMembers(data || []);
      } catch (error) {
        console.error("❌ Members load error:", error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, []);

  const selectedMember = members.find((m) => m.id === selectedKey);

  // Filtering
  const filteredMembers = useMemo(() => {
    if (!searchValue) return members;
    const q = searchValue.toLowerCase();
    return members.filter(
      (m) =>
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.id_number.toLowerCase().includes(q)
    );
  }, [searchValue, members]);

  const showEmptyContent =
    !isLoading && searchValue.length > 0 && filteredMembers.length === 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-800 flex items-center gap-2">
        Select Member
        {isRequired && <span className="text-red-500">*</span>}
        {members.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {members.length} available
          </span>
        )}
      </label>

      {/* ===========================
          HEROUI AUTOCOMPLETE
      ============================= */}
      

      {/* ===========================
          SELECTED MEMBER BANNER
      ============================= */}
      {selectedMember && (
        <div className="mt-2 p-3 bg-linear-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-lg">✓</span>
              <div>
                <span className="text-sm font-medium text-gray-900 block">
                  {selectedMember.first_name} {selectedMember.last_name}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  ID: {selectedMember.id_number}
                </span>
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={() => onSelectionChange("")}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
