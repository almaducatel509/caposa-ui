"use client";

import React, { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { fetchMembers } from "@/app/lib/api/members";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  gender: "M" | "F" | null;
  accounts?: Account[];
}

interface Account {
  id: string;
  account_type: string;
}

interface CompteAutocompleteProps {
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  errorMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function CompteAutocomplete({
  selectedKey,
  onSelectionChange,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  className = "",
  label = "Member",
  placeholder = "Search member by ID or name...",
}: CompteAutocompleteProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const data = await fetchMembers();
        console.log("✅ Members loaded:", data);
        setMembers(data);
        setError("");
      } catch (err) {
        console.error("❌ Error loading members:", err);
        setError("Unable to load members");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleSelectionChange = (key: React.Key | null) => {
    const memberId = key as string;
    console.log("🎯 Member selected:", memberId);
    
    if (onSelectionChange) {
      onSelectionChange(memberId);
    }
  };

  const getAvatarOrEmoji = (member: Member, size: "sm" | "md" = "sm") => {
    const sizeClasses = {
      sm: "w-8 h-8 text-2xl",
      md: "w-10 h-10 text-3xl"
    };

    if (member.photo_url) {
      const imgSizes = sizeClasses[size].split(' ').slice(0, 2).join(' ');
      return (
        <img
          src={member.photo_url}
          alt={`${member.first_name} ${member.last_name}`}
          className={`${imgSizes} rounded-full object-cover`}
        />
      );
    }

    const emojiSize = sizeClasses[size].split(' ')[2];
    
    if (member.gender === "F") {
      return <span className={emojiSize}>👩</span>;
    } else if (member.gender === "M") {
      return <span className={emojiSize}>👨</span>;
    }
    
    return <span className={emojiSize}>👤</span>;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}
      
      <Autocomplete
        aria-label={label}
        selectedKey={selectedKey}
        placeholder={loading ? "Loading..." : placeholder}
        variant="bordered"
        radius="lg"
        isDisabled={loading || !!error || isDisabled}
        
        defaultItems={members}
        onSelectionChange={handleSelectionChange}
        
        classNames={{
          base: "w-full",
          listboxWrapper: "max-h-[320px]",
          selectorButton: "text-gray-500",
        }}
        
        inputProps={{
          classNames: {
            input: "ml-1 text-sm",
            inputWrapper: "h-[52px] shadow-sm",
          },
        }}
        
        listboxProps={{
          hideSelectedIcon: true,
          itemClasses: {
            base: [
              "rounded-lg",
              "text-gray-700",
              "transition-all",
              "data-[hover=true]:bg-blue-50",
              "data-[hover=true]:text-blue-900",
              "data-[selectable=true]:focus:bg-blue-100",
              "data-[pressed=true]:opacity-80",
            ],
          },
        }}
        
        popoverProps={{
          offset: 12,
          classNames: {
            base: "rounded-xl",
            content: "p-2 border border-gray-200 bg-white shadow-lg",
          },
        }}
      >
        {(member) => (
          <AutocompleteItem 
            key={member.id}
            textValue={`${member.id} ${member.first_name} ${member.last_name}`}
          >
            <div className="flex gap-3 items-center py-1">
              {getAvatarOrEmoji(member, "sm")}
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {member.first_name} {member.last_name}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  ID: {member.id.slice(0, 8)}...
                </span>
                {member.accounts && member.accounts.length > 0 && (
                  <span className="text-xs text-blue-600">
                    📊 {member.accounts.length} account{member.accounts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Loading members...
        </div>
      )}
    </div>
  );
}