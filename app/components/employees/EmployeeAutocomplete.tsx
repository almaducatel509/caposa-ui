'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedEmployee = employees.find(e => e.id === selectedKey);

  const filteredEmployees = searchValue
    ? employees.filter(e =>
        `${e.first_name} ${e.last_name} ${e.user?.username || ''} ${e.user?.email || ''}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : employees;

  const handleSelect = (employee: EmployeeData) => {
    onSelectionChange(employee.id);
    setSearchValue('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredEmployees.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredEmployees[focusedIndex]) {
          handleSelect(filteredEmployees[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
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

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Search by name or username..."
          className={`w-full px-4 py-3 pl-12 pr-10 rounded-lg border-2 transition-all ${
            errorMessage
              ? 'border-red-500 focus:border-red-600'
              : 'border-gray-300 focus:border-purple-500'
          } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} focus:outline-none`}
        />
        
        {/* Start Icon */}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">👔</span>
        
        {/* Loading or Clear Button */}
        {isLoading ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : searchValue && (
          <button
            onClick={() => {
              setSearchValue('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
        
        {/* Description */}
        <p className="mt-2 text-xs text-gray-600">
          {isLoading
            ? "Loading employees..."
            : searchValue && filteredEmployees.length > 0
            ? `Found ${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? 's' : ''}`
            : employees.length === 0
            ? "No employees available"
            : "Search by name or username"}
        </p>
        
        {/* Error Message */}
        {errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
        
        {/* Dropdown */}
        {isOpen && !isDisabled && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => handleSelect(employee)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-purple-50 transition-colors text-left ${
                    focusedIndex === index ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-purple-100 to-purple-200 rounded-full shrink-0">
                    <span className="text-lg">👔</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 truncate">
                      {employee.first_name} {employee.last_name}
                    </span>
                    {employee.user?.username && (
                      <span className="text-xs text-gray-500 mt-0.5 truncate">
                        @{employee.user.username}
                      </span>
                    )}
                    {employee.user?.email && (
                      <span className="text-xs text-gray-400 mt-0.5 truncate">
                        {employee.user.email}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">👔</div>
                <p className="text-gray-600 mb-3 font-medium">
                  {isLoading ? "Loading..." : "No employees found"}
                </p>
                {!isLoading && onAddNew && (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    onClick={() => {
                      onAddNew();
                      setIsOpen(false);
                    }}
                  >
                    + Add New Employee
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Employee Display */}
      {selectedEmployee && (
        <div className="mt-2 p-3 bg-linear-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
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