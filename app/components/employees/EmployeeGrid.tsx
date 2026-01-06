'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaUsers } from "react-icons/fa6";
import { PiUsersThin } from 'react-icons/pi';
// API
import { fetchEmployees } from '@/app/lib/api/employee';
import { fetchBranches } from '@/app/lib/api/branche';
import { fetchPosts } from '@/app/lib/api/post';
// UI
import PageHeader from '@/app/components/header';
import EmployeeFilterBar from '@/app/components/employees/EmployeeFilterBar';
import EmployeeCard from '@/app/components/employees/EmployeeCard';
// Modals
import EmployeeDetailModal from '@/app/components/employees/EmployeeDetailModal';
import EditEmployeeModal from '@/app/components/employees/EditEmployeeModal';
import DeleteEmployeeModal from '@/app/components/employees/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/EmployeeTransactionModal';
// Types
import { EmployeeData, BranchData, Post } from '@/app/components/employees/validations';

/* ======================================================
   EmployeeGrid
====================================================== */
const EmployeeGrid: React.FC = () => {
  // DATA
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // UI STATES
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FILTERS
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // MODALS
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  /* ======================================================
     Load data
  ====================================================== */

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [employeesData, branchesData, postsData] = await Promise.all([
        fetchEmployees(),
        fetchBranches(),
        fetchPosts(),
      ]);

      setEmployees(employeesData);
      setBranches(branchesData);
      setPosts(postsData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les employés.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* ======================================================
     Debounce search
  ====================================================== */

//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearch(search), 300);
//     return () => clearTimeout(t);
//   }, [search]);
// Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(filterValue), 300);
    return () => clearTimeout(timer);
  }, [filterValue]);
  /* ======================================================
     HYDRATION (clé de tout le système)
  ====================================================== */

  const hydrateEmployee = useCallback(
    (e: EmployeeData): EmployeeData => {
      const branch = branches.find(b => b.id === e.branch);

      const withBranch = e.branch_details
        ? e
        : {
            ...e,
            branch_details: branch
              ? {
                  id: branch.id,
                  branch_name: branch.branch_name,
                  branch_code: branch.branch_code,
                }
              : undefined,
          };

      const withPosts = withBranch.posts_details
        ? withBranch
        : {
            ...withBranch,
            posts_details: Array.isArray(withBranch.posts)
              ? withBranch.posts
                  .map(pid => posts.find(p => p.id === pid))
                  .filter(Boolean)
                  .map(p => ({
                    id: p!.id,
                    name: p!.name || p!.post_name || 'Poste non défini',
                    post_name: p!.post_name,
                  }))
              : [],
          };

      return withPosts;
    },
    [branches, posts]
  );

  /* ======================================================
     FILTER + SORT
  ====================================================== */

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
    }, [employees, , selectedFilter, selectedBranch, ]);
  
  /* ======================================================
     FINAL DATA (HYDRATED)
  ====================================================== */
  const handleAdd = () => { setSelectedEmployee(null); setShowEditModal(true); };

  const hydratedEmployees = useMemo(
    () => filteredEmployees.map(hydrateEmployee),
    [filteredEmployees, hydrateEmployee]
  );

  /* ======================================================
     Handlers
  ====================================================== */

  const handleView = (e: EmployeeData) => {
    setSelectedEmployee(e);
    setShowDetailModal(true);
  };

  const handleEdit = (e: EmployeeData) => {
    setSelectedEmployee(e);
    setShowEditModal(true);
  };

  const handleDelete = (e: EmployeeData) => {
    setSelectedEmployee(e);
    setShowDeleteModal(true);
  };

  const handleViewTransactions = (e: EmployeeData) => {
    setSelectedEmployee(e);
    setShowTransactionModal(true);
  };

const onSearchChange = useCallback((v?: string) => setFilterValue(v || ''), []);
  const onClear = useCallback(() => setFilterValue(''), []);

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Gestion des Employés"
        subtitle="Gérez les employés, leurs rôles et affectations"
        icon={<PiUsersThin className="text-5xl" />}
      />

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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hydratedEmployees.length > 0 ? (
          hydratedEmployees.map(e => (
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
            <FaUsers className="text-5xl text-green-700 mx-auto mb-4" />
            <p className="text-gray-600">Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      <EmployeeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        employee={selectedEmployee}
        onEdit={() => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
      />

      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={selectedEmployee}
        branches={branches}
        posts={posts}
        onSuccess={loadEmployees}
      />

      <DeleteEmployeeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        employee={selectedEmployee}
        onSuccess={loadEmployees}
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