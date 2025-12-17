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

export default function MemberAutocomplete() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const data = await fetchMembers();
        console.log("Membres chargés:", data);
        setMembers(data);
        setError("");
      } catch (err) {
        console.error("Erreur chargement membres:", err);
        setError("Impossible de charger les membres");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleSelectionChange = (key: React.Key | null) => {
    console.log("ID sélectionné:", key);
    setSelected(key as string);
  };

  const getAvatarOrEmoji = (member: Member, size: "sm" | "md" = "md") => {
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
    <div className="flex flex-col gap-6 p-8 max-w-lg">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Rechercher un employé</h3>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}
        
        <Autocomplete
          aria-label="Rechercher un employé"
          labelPlacement="outside"
          placeholder={loading ? "Chargement..." : "Entrer ID ou nom..."}
          variant="bordered"
          radius="lg"
          isDisabled={loading || !!error}
          
          // ✅ CHANGEMENT CRUCIAL : defaultItems au lieu de items !
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
                </div>
              </div>
            </AutocompleteItem>
          )}
        </Autocomplete>

        {selected && !loading && (() => {
          const member = members.find(m => m.id === selected);
          if (!member) return null;
          
          const accountCount = member.accounts?.length || 0;

          return (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getAvatarOrEmoji(member, "md")}
                
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-green-700 font-mono">
                    ID: {member.id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-green-600">
                    📊 {accountCount} compte{accountCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Chargement des membres...
          </div>
        )}
      </div>
    </div>
  );
}