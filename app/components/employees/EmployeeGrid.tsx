'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { FaUsers } from "react-icons/fa6";

// Types et API
import { fetchEmployees } from '@/app/lib/api/employee';
import { fetchBranches } from '@/app/lib/api/branche';
import { fetchPosts } from '@/app/lib/api/post';

// Composants
import EmployeeFilterBar from '@/app/components/employees/EmployeeFilterBar';
import EmployeeCard from '@/app/components/employees/EmployeeCard';
import EmployeeDetailModal from '@/app/components/employees/EmployeeDetailModal';
import EditEmployeeModal from '@/app/components/employees/EditEmployeeModal';
import DeleteEmployeeModal from '@/app/components/employees/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/EmployeeTransactionModal';
import { BranchData, EmployeeData, PostData } from '@/app/components/employees/validations';

interface EmployeeGridProps {
  employees?: EmployeeData[];
  onSuccess?: () => void;
}

const EmployeeGrid: React.FC<EmployeeGridProps> = ({ employees: initialEmployees, onSuccess: parentOnSuccess }) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // États modals
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(filterValue), 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // Charger données
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [branchesData, postsData, existingEmployees] = await Promise.all([
        fetchBranches(),
        fetchPosts(),
        fetchEmployees(),
      ]);
      setBranches(branchesData);
      setPosts(postsData);
      setEmployees(existingEmployees);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données de l'employé.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (initialEmployees && initialEmployees.length) {
      setEmployees(initialEmployees);
      setIsLoading(false);
      setError(null);
    } else {
      loadEmployees();
    }
  }, [initialEmployees]);

  // Filtrage avancé
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (debouncedValue) {
      const v = debouncedValue.toLowerCase();
      filtered = filtered.filter(e =>
        e.first_name?.toLowerCase().includes(v) ||
        e.last_name?.toLowerCase().includes(v) ||
        e.user?.email?.toLowerCase().includes(v) ||
        e.phone_number?.toLowerCase().includes(v) ||
        e.payment_ref?.toLowerCase().includes(v)
      );
    }

    if (selectedBranch !== 'all') filtered = filtered.filter(e => e.branch === selectedBranch);
    if (selectedStatus !== 'all') filtered = filtered.filter(e => (e.status || 'active') === selectedStatus);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(e => e.created_at && (today.getTime() - new Date(e.created_at).getTime()) / (1000 * 3600 * 24) <= 30);
        break;
      case 'thisMonth':
        filtered = filtered.filter(e => e.created_at && new Date(e.created_at).getMonth() === currentMonth && new Date(e.created_at).getFullYear() === currentYear);
        break;
      case 'thisYear':
        filtered = filtered.filter(e => e.created_at && new Date(e.created_at).getFullYear() === currentYear);
        break;
    }

    return filtered.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
  }, [employees, debouncedValue, selectedFilter, selectedBranch, selectedStatus]);

  // Gestionnaires
  const handleAdd = () => { setSelectedEmployee(null); setShowEditModal(true); };
  const handleView = (employee: EmployeeData) => { setSelectedEmployee(hydrateDetails(employee)); setShowDetailModal(true); };
  const handleEdit = (employee: EmployeeData) => { setSelectedEmployee(employee); setShowEditModal(true); };
  const handleDelete = (employee: EmployeeData) => { setSelectedEmployee(employee); setShowDeleteModal(true); };
  const handleViewTransactions = (employee: EmployeeData) => { setSelectedEmployee(employee); setShowTransactionModal(true); };

 const hydrateDetails = (e: EmployeeData) => {
  const branchInfo = branches.find(b => b.id === e.branch);

  const withBranch =
    e.branch_details || !e.branch
      ? e
      : {
          ...e,
          branch_details: branchInfo
            ? {
                id: branchInfo.id,
                branch_name: branchInfo.branch_name,
                branch_code: branchInfo.branch_code,
              }
            : undefined,
        };

  const withPosts =
    withBranch.posts_details || !Array.isArray(withBranch.posts)
      ? withBranch
      : {
          ...withBranch,
          posts_details: withBranch.posts
            .map(pid => posts.find(p => p.id === pid))
            .filter(Boolean)
            .map(p => ({
              id: p!.id,
              post_name: p!.post_name || p!.name || "Poste non défini", // ✅ obligatoire
              name: p!.name || p!.post_name || "Poste non défini",      // ✅ optionnel
            })),
        };

  return withPosts;
};


  const handleDeleteSuccess = (deletedId?: string) => {
    if (deletedId) setEmployees(prev => prev.filter(e => e.id !== deletedId));
    setSelectedEmployee(null);
    setShowDetailModal(false);
    setShowDeleteModal(false);
  };

  const onSearchChange = useCallback((v?: string) => setFilterValue(v || ''), []);
  const onClear = useCallback(() => setFilterValue(''), []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-green-50/30 via-white to-green-50/30 min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-80 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardBody className="p-6 space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-green-50/30 via-white to-green-50/30 min-h-screen">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
          <Button size="sm" onClick={loadEmployees} className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">Réessayer</Button>
        </div>
      )}

      <EmployeeFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        selectedBranch={selectedBranch}
        selectedStatus={selectedStatus}
        branches={branches}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={setSelectedFilter}
        onBranchChange={setSelectedBranch}
        onStatusChange={setSelectedStatus}
        onAdd={handleAdd}
        onImport={() => console.log('Import')}
        onExport={() => console.log('Export')}
        totalCount={filteredEmployees.length}
      />

      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
        <span className="text-sm font-semibold text-gray-700">{filteredEmployees.length} employé(s) trouvé(s)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(e => (
            <EmployeeCard
              key={e.id}
              employee={e}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={handleViewTransactions}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <FaUsers className="text-5xl text-green-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{filterValue ? "Aucun employé trouvé" : "Aucun employé"}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{filterValue ? "Essayez de modifier vos critères de recherche" : "Commencez par ajouter votre premier employé"}</p>
            <Button 
              onPress={filterValue ? onClear : handleAdd} 
              size="lg"
              className={filterValue ? "border-2 border-green-700 bg-white text-green-700 hover:bg-green-50 font-semibold shadow-md" : "bg-green-700 hover:bg-green-800 text-white font-semibold shadow-lg"}
            >
              {filterValue ? "Effacer les filtres" : "Ajouter un employé"}
            </Button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <EmployeeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        employee={selectedEmployee}
        onEdit={() => { setShowDetailModal(false); setShowEditModal(true); }}
      />
      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={selectedEmployee}
        branches={branches}
        posts={posts}
        onSuccess={(updated) => {
          setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
          setSelectedEmployee(updated);
          setShowEditModal(false);
        }}
      />
      <DeleteEmployeeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        employee={selectedEmployee}
        onSuccess={handleDeleteSuccess}
      />
      <EmployeeTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        employee={selectedEmployee ? {
          id: selectedEmployee.id,
          first_name: selectedEmployee.first_name,
          last_name: selectedEmployee.last_name,
          photo_profil: selectedEmployee.photo_profil ?? null,
          payment_ref: selectedEmployee.payment_ref,
        } : null}
      />
    </div>
  );
};

export default EmployeeGrid;