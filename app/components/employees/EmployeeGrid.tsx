'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';

// API
import { fetchEmployees } from '@/app/lib/api/employee';
import { fetchBranches }  from '@/app/lib/api/branche';
import { fetchPosts }     from '@/app/lib/api/post';

// UI
import PageHeader              from '@/app/components/header';
import EmployeeFilterBar       from '@/app/components/employees/EmployeeFilterBar';
import EmployeeCard            from '@/app/components/employees/EmployeeCard';

// Modals
import EmployeeDetailModal     from '@/app/components/employees/EmployeeDetailModal';
import EditEmployeeModal       from '@/app/components/employees/EditEmployeeModal';
import DeleteEmployeeModal     from '@/app/components/employees/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/EmployeeTransactionModal';

// Types
import { EmployeeData, BranchData, Post } from '@/app/components/employees/validations';

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-br from-[#F9F9F6] to-[#DDEAD5]/20 pt-6 pb-10 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="px-5 pb-5 -mt-6 flex flex-col gap-3">
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-3 w-20 bg-gray-100 animate-pulse rounded-lg" />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="h-3 w-full bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-3 w-2/3 bg-gray-100 animate-pulse rounded-lg" />
        </div>
        <div className="flex justify-center gap-2 pt-3 border-t border-gray-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ hasFilter, onClear, onAdd }: {
  hasFilter: boolean; onClear: () => void; onAdd: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-[#DDEAD5] rounded-full flex items-center justify-center mb-5">
        <Users className="w-10 h-10 text-[#2E7D32]" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {hasFilter ? 'Aucun employé trouvé' : 'Aucun employé'}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        {hasFilter
          ? 'Essayez de modifier vos critères de recherche'
          : 'Commencez par ajouter votre premier employé'
        }
      </p>
      <button
        onClick={hasFilter ? onClear : onAdd}
        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
          hasFilter
            ? 'bg-white border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#DDEAD5]'
            : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {hasFilter ? 'Effacer les filtres' : 'Ajouter un employé'}
      </button>
    </div>
  );
}

// ─── Main Grid ──────────────────────────────────────────────────────────────────
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
  const [selectedEmployee,      setSelectedEmployee]      = useState<EmployeeData | null>(null);
  const [showDetailModal,       setShowDetailModal]       = useState(false);
  const [showEditModal,         setShowEditModal]         = useState(false);
  const [showDeleteModal,       setShowDeleteModal]       = useState(false);
  const [showTransactionModal,  setShowTransactionModal]  = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
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
        e.first_name?.toLowerCase().includes(v) ||
        e.last_name?.toLowerCase().includes(v)  ||
        e.user?.email?.toLowerCase().includes(v) ||
        e.phone_number?.toLowerCase().includes(v) ||
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
    [filteredEmployees, hydrateEmployee]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd              = () => { setSelectedEmployee(null); setShowEditModal(true); };
  const handleView             = (e: EmployeeData) => { setSelectedEmployee(e); setShowDetailModal(true); };
  const handleEdit             = (e: EmployeeData) => { setSelectedEmployee(e); setShowEditModal(true); };
  const handleDelete           = (e: EmployeeData) => { setSelectedEmployee(e); setShowDeleteModal(true); };
  const handleViewTransactions = (e: EmployeeData) => { setSelectedEmployee(e); setShowTransactionModal(true); };
  const onSearchChange         = useCallback((v?: string) => setFilterValue(v ?? ''), []);
  const onClear                = useCallback(() => setFilterValue(''), []);

  // ── Render ──────────────────────────────────────────────────────────────────
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
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
          <button
            onClick={loadEmployees}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        ) : hydratedEmployees.length > 0 ? (
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
          <EmptyState
            hasFilter={!!filterValue}
            onClear={onClear}
            onAdd={handleAdd}
          />
        )}
      </div>

      {/* Modals */}
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
          id:          selectedEmployee.id,
          first_name:  selectedEmployee.first_name,
          last_name:   selectedEmployee.last_name,
          photo_profil:selectedEmployee.photo_profil ?? null,
          payment_ref: selectedEmployee.payment_ref,
        } : null}
      />
    </div>
  );
};

export default EmployeeGrid;