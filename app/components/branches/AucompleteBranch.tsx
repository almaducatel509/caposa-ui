
// ============================================
// FILE: src/components/autocomplete/BranchAutocomplete.tsx
// ============================================
'use client';
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import React, { useState, useEffect } from 'react';
import { fetchBranches } from '@/app/lib/api/branche';
import type { BranchData, BaseAutocompleteProps } from '@/types/autocomplete.types';

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
  className = '',
}: BranchAutocompleteProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBranches();
        setBranches(data || []);
      } catch (error) {
        console.error('Error loading branches:', error);
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranches();
  }, []);

  const selectedBranch = branches.find(b => b.id === selectedKey);

  const filteredBranches = searchValue
    ? branches.filter(b =>
        `${b.name} ${b.address} ${b.phone_number || ''}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : branches;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-800 flex items-center justify-between">
        <span className="flex items-center">
          Select Branch {isRequired && <span className="text-red-500 ml-1">*</span>}
          {!isLoading && (
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
              {branches.length} available
            </span>
          )}
        </span>
      </label>

      <Autocomplete
        isRequired={isRequired}
        label="Branch"
        placeholder="Search by name or address..."
        defaultItems={filteredBranches}
        selectedKey={selectedKey}
        onSelectionChange={(key) => onSelectionChange(key?.toString() || '')}
        inputValue={searchValue}
        onInputChange={setSearchValue}
        isDisabled={isDisabled}
        isLoading={isLoading}
        size="lg"
        variant="bordered"
        startContent={<span className="text-gray-400 text-xl">🏢</span>}
        description={
          isLoading
            ? "Loading branches..."
            : searchValue && filteredBranches.length > 0
            ? `Found ${filteredBranches.length} branch${filteredBranches.length !== 1 ? 'es' : ''}`
            : branches.length === 0
            ? "No branches available"
            : "Search by name or address"
        }
        errorMessage={errorMessage}
        isInvalid={!!errorMessage}
        classNames={{
          base: "max-w-full",
          listboxWrapper: "max-h-[320px]",
        }}
        listboxProps={{
          emptyContent: (
            <div className="py-8 text-center">
              <div className="text-4xl mb-3">🏢</div>
              <p className="text-gray-600 mb-3 font-medium">
                {isLoading ? "Loading..." : "No branches found"}
              </p>
              {!isLoading && onAddNew && (
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  onClick={onAddNew}
                >
                  + Add New Branch
                </button>
              )}
            </div>
          )
        }}
      >
        {(branch) => (
          <AutocompleteItem
            key={branch.id}
            textValue={branch.name}
            startContent={
              <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-orange-100 to-orange-200 rounded-full">
                <span className="text-lg">🏢</span>
              </div>
            }
          >
            <div className="flex flex-col py-2">
              <span className="font-semibold text-gray-900">
                {branch.name}
              </span>
              {branch.address && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {branch.address}
                </span>
              )}
              {branch.phone_number && (
                <span className="text-xs text-gray-400 mt-0.5">
                  {branch.phone_number}
                </span>
              )}
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>

      {selectedBranch && (
        <div className="mt-2 p-3 bg-linear-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600">🏢</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedBranch.name}
              </span>
              {selectedBranch.address && (
                <span className="text-xs text-gray-600">
                  · {selectedBranch.address}
                </span>
              )}
            </div>
            <button
              onClick={() => onSelectionChange('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear selection"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}