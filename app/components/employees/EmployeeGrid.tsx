'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';

// API
import { fetchEmployees } from '@/app/lib/api/employee';
import { fetchBranches }  from '@/app/lib/api/branche';
import { fetchPosts }     from '@/app/lib/api/post';

// UI
import PageHeader        from '@/app/components/header';
import EmployeeFilterBar from '@/app/components/employees/EmployeeFilterBar';

// Modals
import EmployeeDetailModal      from '@/app/components/employees/EmployeeDetailModal';
import EditEmployeeModal        from '@/app/components/employees/EditEmployeeModal';
import DeleteEmployeeModal      from '@/app/components/employees/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/EmployeeTransactionModal';

// Types
import { EmployeeData, BranchData, Post } from '@/app/components/employees/validations';
import EmployeeTable from './EmployeeTable';

// ─── Main ──────────────────────────────────────────────────────────────────────
const EmployeeGrid: React.FC = () => {

  // ── Data ──
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [branches,  setBranches]  = useState<BranchData[]>([]);
  const [posts,     setPosts]     = useState<Post[]>([]);

  // ── UI ──
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Filters ──
  const [filterValue,    setFilterValue]    = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // ── Modals ──
  const [selectedEmployee,     setSelectedEmployee]     = useState<EmployeeData | null>(null);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showEditModal,        setShowEditModal]        = useState(false);
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [emp, bra, pos] = await Promise.all([fetchEmployees(), fetchBranches(), fetchPosts()]);
      setEmployees(emp);
      setBranches(bra);
      setPosts(pos);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les employés.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  // ── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(filterValue.trim()), 300);
    return () => clearTimeout(t);
  }, [filterValue]);

  // ── Hydration ──────────────────────────────────────────────────────────────
  const hydrateEmployee = useCallback((e: EmployeeData): EmployeeData => {
    const branch = branches.find(b => b.id === e.branch);

    const withBranch = e.branch_details ? e : {
      ...e,
      branch_details: branch
        ? { id: branch.id, branch_name: branch.branch_name, branch_code: branch.branch_code }
        : undefined,
    };

    const withPosts = withBranch.posts_details ? withBranch : {
      ...withBranch,
      posts_details: Array.isArray(withBranch.posts)
        ? withBranch.posts
            .map(pid => posts.find(p => p.id === pid))
            .filter(Boolean)
            .map(p => ({
              id:        p!.id,
              name:      p!.name || p!.post_name || 'Poste non défini',
              post_name: p!.post_name,
            }))
        : [],
    };

    return withPosts;
  }, [branches, posts]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    let list = [...employees];

    if (debouncedValue) {
      const v = debouncedValue.toLowerCase();
      list = list.filter(e =>
        e.first_name?.toLowerCase().includes(v)    ||
        e.last_name?.toLowerCase().includes(v)     ||
        e.user?.email?.toLowerCase().includes(v)   ||
        e.phone_number?.toLowerCase().includes(v)  ||
        e.payment_ref?.toLowerCase().includes(v)
      );
    }

    if (selectedBranch !== 'all') list = list.filter(e => e.branch === selectedBranch);
    if (selectedStatus !== 'all') list = list.filter(e => (e.status ?? 'active') === selectedStatus);

    const now = new Date();
    if (selectedFilter === 'recent') {
      list = list.filter(e => e.created_at &&
        (now.getTime() - new Date(e.created_at).getTime()) / 86400000 <= 30);
    }
    if (selectedFilter === 'thisMonth') {
      list = list.filter(e => {
        if (!e.created_at) return false;
        const d = new Date(e.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (selectedFilter === 'thisYear') {
      list = list.filter(e => e.created_at &&
        new Date(e.created_at).getFullYear() === now.getFullYear());
    }

    return list.sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [employees, debouncedValue, selectedBranch, selectedStatus, selectedFilter]);

  const hydratedEmployees = useMemo(
    () => filteredEmployees.map(hydrateEmployee),
    [filteredEmployees, hydrateEmployee],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd              = () => { setSelectedEmployee(null); setShowEditModal(true); };
  const handleView             = (e: EmployeeData) => { setSelectedEmployee(e); setShowDetailModal(true); };
  const handleEdit             = (e: EmployeeData) => { setSelectedEmployee(e); setShowEditModal(true); };
  const handleDelete           = (e: EmployeeData) => { setSelectedEmployee(e); setShowDeleteModal(true); };
  const handleViewTransactions = (e: EmployeeData) => { setSelectedEmployee(e); setShowTransactionModal(true); };
  const onSearchChange         = useCallback((v?: string) => setFilterValue(v ?? ''), []);
  const onClear                = useCallback(() => setFilterValue(''), []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20">

      <PageHeader
        title="Gestion des Employés"
        subtitle="Gérez les employés, leurs rôles et affectations"
        icon={<Users className="w-8 h-8 text-[#2E7D32]" />}
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

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="flex-1 text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={loadEmployees}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Table (remplace la grille de cartes) ── */}
      <EmployeeTable
        employees={hydratedEmployees}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewTransactions={handleViewTransactions}
      />

      {/* Modals — inchangés */}
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
          id:           selectedEmployee.id,
          first_name:   selectedEmployee.first_name,
          last_name:    selectedEmployee.last_name,
          photo_profil: selectedEmployee.photo_profil ?? null,
          payment_ref:  selectedEmployee.payment_ref,
        } : null}
      />
    </div>
  );
};

export default EmployeeGrid;