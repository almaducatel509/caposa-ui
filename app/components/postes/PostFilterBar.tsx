"use client";

import React from "react";
import { Button, Chip } from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import { FaPlus, FaDownload } from "react-icons/fa";

interface PostFilterBarProps {
  filterValue: string;
  totalCount: number;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onAdd: () => void;
  onExport: () => void;
}

const PostFilterBar: React.FC<PostFilterBarProps> = ({
  filterValue,
  totalCount,
  onSearchChange,
  onClear,
  onAdd,
  onExport,
}) => {
  return (
    <div className="space-y-2">
      {/* Recherche + actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:max-w-xl">
          <FiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher un poste..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 pl-12 pr-12 rounded-xl text-sm bg-white shadow-sm border-2 border-transparent hover:border-green-200 focus:border-green-500 focus:outline-none transition-colors"
          />
          {filterValue && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onClear();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          {/* Nouveau Poste */}
          <Button
            startContent={<FaPlus />}
            onPress={onAdd}
            className="
              flex-1 lg:flex-none
              bg-green-600 
              hover:bg-green-700
              text-white
              rounded-lg
              shadow-sm
              hover:shadow-md
              transition-all
            "
          >
            Nouveau Poste
          </Button>
          {/* Exporter */}
          <Button
            variant="bordered"
            startContent={<FaDownload />}
            onPress={onExport}
            className="
              flex-1 lg:flex-none
              border border-gray-300
              text-gray-700
              hover:bg-gray-100
              rounded-lg
              transition-all
            "
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Résultats */}
      <div className=" border border-gray-100 bg-linear-to-r from-green-50 via-white to-emerald-50 rounded-xl p-4 shadow-xs shadow-green-700/20 ">
          <span className="text-md font-semibold text-gray-600 pr-2">Résultats :</span>
          <div className="
            inline-flex items-center 
            px-3 py-1.5 
            bg-green-600/10 
            text-green-700 
            border border-green-200 
            rounded-md 
            text-sm font-medium
          ">
            {totalCount} Poste(s)
          </div>
      </div>
    </div>
  );
};

export default PostFilterBar;