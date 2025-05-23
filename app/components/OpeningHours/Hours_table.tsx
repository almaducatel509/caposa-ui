import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FilterBar from './FilterBar';
import ScheduleCard from './ScheduleCard';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';

import { OpeningHrs } from '@/app/dashboard/opening_hours/columns';
import { deleteOpeningHours } from '@/app/lib/api/opening_hour';

interface Holiday {
  id: string;
  date: string;
  description: string;
}

interface Branch {
  id: string;
  branch_name: string;
  holidays: string[];
}

export default function OpeningHoursTable({
  hourtable = [],
  holidays = [],
  branches = [],
  onRefresh = () => {},
}: {
  hourtable?: OpeningHrs[];
  holidays?: Holiday[];
  branches?: Branch[];
  onRefresh?: () => void;
}) {
  const [filterValue, setFilterValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<OpeningHrs | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (filterValue) {
      localStorage.setItem("lastFilter", filterValue);
    }
  }, [filterValue]);

  const filteredItems = useMemo(() => {
    if (!filterValue) return hourtable;
    
    const lowercasedFilter = filterValue.toLowerCase();
    return hourtable.filter((item) => 
      item.id.toLowerCase().includes(lowercasedFilter)
    );
  }, [hourtable, filterValue]);

  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        'ID,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        ...filteredItems.map(item => 
          `"${item.id}","${item.monday || ''}","${item.tuesday || ''}","${item.wednesday || ''}","${item.thursday || ''}","${item.friday || ''}","${item.saturday || ''}","${item.sunday || ''}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `opening_hours_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filteredItems]);

  const handleAdd = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setShowEditModal(true);
  };

  const handleEdit = (item: OpeningHrs) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const handleDelete = (item: OpeningHrs) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleSuccess = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    onRefresh();
  };

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
  }, []);

  const onFilterChange = useCallback((key: string) => {
    setSelectedFilter(key);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 min-h-screen">
      <FilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={onFilterChange}
        onAdd={handleAdd}
        onExport={handleExport}
        totalCount={filteredItems.length}
      />

      <div className="text-sm text-gray-600">
        {filteredItems.length} résultat(s) trouvé(s)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              holidays={holidays}
              branches={branches}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p>Aucun horaire trouvé</p>
            {filterValue && (
              <button onClick={onClear} className="text-blue-600 underline mt-2" aria-label="Effacer le filtre">
                Effacer le filtre
              </button>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
          initialData={selectedItem}
          isEditMode={isEditMode}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleSuccess}
          item={selectedItem}
          onDelete={deleteOpeningHours}
        />
      )}
    </div>
  );
}