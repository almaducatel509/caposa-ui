
// ============================================
// FILE: src/components/autocomplete/EmployeeAutocomplete.tsx
// ============================================
'use client';
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import React, { useState, useEffect } from 'react';
import { fetchEmployees } from '@/app/lib/api/employee';
import type { EmployeeData, BaseAutocompleteProps } from '@/types/autocomplete.types';

interface EmployeeAutocompleteProps extends BaseAutocompleteProps {
  onAddNew?: () => void;
}

export function EmployeeAutocomplete({
  selectedKey,
  onSelectionChange,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  onAddNew,
  className = '',
}: EmployeeAutocompleteProps) {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await fetchEmployees();
        setEmployees(data || []);
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const selectedEmployee = employees.find(e => e.id === selectedKey);

  const filteredEmployees = searchValue
    ? employees.filter(e =>
        `${e.first_name} ${e.last_name} ${e.user?.username || ''} ${e.user?.email || ''}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : employees;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-800 flex items-center justify-between">
        <span className="flex items-center">
          Select Employee {isRequired && <span className="text-red-500 ml-1">*</span>}
          {!isLoading && (
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {employees.length} available
            </span>
          )}
        </span>
      </label>

      <Autocomplete
        isRequired={isRequired}
        label="Employee"
        placeholder="Search by name or username..."
        defaultItems={filteredEmployees}
        selectedKey={selectedKey}
        onSelectionChange={(key) => onSelectionChange(key?.toString() || '')}
        inputValue={searchValue}
        onInputChange={setSearchValue}
        isDisabled={isDisabled}
        isLoading={isLoading}
        size="lg"
        variant="bordered"
        startContent={<span className="text-gray-400 text-xl">👔</span>}
        description={
          isLoading
            ? "Loading employees..."
            : searchValue && filteredEmployees.length > 0
            ? `Found ${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? 's' : ''}`
            : employees.length === 0
            ? "No employees available"
            : "Search by name or username"
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
              <div className="text-4xl mb-3">👔</div>
              <p className="text-gray-600 mb-3 font-medium">
                {isLoading ? "Loading..." : "No employees found"}
              </p>
              {!isLoading && onAddNew && (
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  onClick={onAddNew}
                >
                  + Add New Employee
                </button>
              )}
            </div>
          )
        }}
      >
        {(employee) => (
          <AutocompleteItem
            key={employee.id}
            textValue={`${employee.first_name} ${employee.last_name}`}
            startContent={
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                <span className="text-lg">👔</span>
              </div>
            }
          >
            <div className="flex flex-col py-2">
              <span className="font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </span>
              {employee.user?.username && (
                <span className="text-xs text-gray-500 mt-0.5">
                  @{employee.user.username}
                </span>
              )}
              {employee.user?.email && (
                <span className="text-xs text-gray-400 mt-0.5">
                  {employee.user.email}
                </span>
              )}
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>

      {selectedEmployee && (
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600">✓</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedEmployee.first_name} {selectedEmployee.last_name}
              </span>
              {selectedEmployee.user?.username && (
                <span className="text-xs text-gray-600">
                  (@{selectedEmployee.user.username})
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