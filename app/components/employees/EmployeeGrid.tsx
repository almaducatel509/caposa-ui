'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';

// API
import { fetchEmployees, putEmployeeMultipart } from '@/app/lib/api/employee';
import { fetchBranches }  from '@/app/lib/api/branche';
import { fetchPosts }     from '@/app/lib/api/post';

// UI
import PageHeader        from '@/app/components/header';
import EmployeeFilterBar from '@/app/components/employees/EmployeeFilterBar';

// Modals
import EmployeeDetailModal      from '@/app/components/employees/modals/EmployeeDetailModal';
import EditEmployeeModal        from '@/app/components/employees/modals/EditEmployeeModal';
import DeleteEmployeeModal      from '@/app/components/employees/modals/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/modals/EmployeeTransactionModal';

// Types
import { EmployeeData, PostData, BranchData } from '@/app/components/employees/validations';
import EmployeeTable  from './EmployeeTable';
import { EmployeeBulkAction } from './BulkActionDropdown';
import { exportToXLSXFile } from '@/app/utils/excelExport';
import { matchesDateFilter } from '@/app/components/common/DatePeriodFilter';

// ─── Main ──────────────────────────────────────────────────────────────────────
const EmployeeGrid: React.FC = () => {

  // ── Data ──
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
    // const [posts,     setPosts]     = useState<Post[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);

  // ── UI ──
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Filters ──
  const [filterValue,    setFilterValue]    = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [startDate,      setStartDate]      = useState('');
  const [endDate,        setEndDate]        = useState('');

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeEmplTab, setActiveEmplTab] = useState<'actif' | 'archive'>('actif');

  // ── Modals ──
  const [selectedEmployee,     setSelectedEmployee]     = useState<EmployeeData | null>(null);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showEditModal,        setShowEditModal]        = useState(false);
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);


  // ── Load ───────────────────────────────────────────────────────────────────
  //avant const loadEmployees = async () => {
  const loadEmployees = useCallback(async () => { 
    // apres
  try {
    setIsLoading(true);
    setError(null);
    const [emp, bra, pos] = await Promise.all([
      fetchEmployees(),
      fetchBranches(),
      fetchPosts(),
    ]);
      setEmployees(emp);
      setBranches(bra);
      setPosts(pos);
    } catch (err) {
      console.error("Erreur loadEmployees:",err);
      setError('Impossible de charger les employes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);


    // ── Debounce ───────────────────────────────────────────────────────────────
    useEffect(() => {
    const t = setTimeout(() => {
      const normalized = filterValue.trim().toLowerCase();
      setDebouncedValue(normalized);
    }, 300);

    return () => clearTimeout(t);
  }, [filterValue]);

  // useEffect(() => {
  //   const t = setTimeout(() => setDebouncedValue(filterValue.trim()), 300);
  //   return () => clearTimeout(t);
  // }, [filterValue]);

  // ── Hydration ──────────────────────────────────────────────────────────────
  // const hydrateEmployee = useCallback((e: EmployeeData): EmployeeData => {
  //   const branch = branches.find(b => b.id === e.branch);

  //   const withBranch = e.branch_details ? e : {
  //     ...e,
  //     branch_details: branch
  //       ? { id: branch.id, branch_name: branch.branch_name, branch_code: branch.branch_code }
  //       : undefined,
  //   };

  //   const withPosts = withBranch.posts_details ? withBranch : {
  //     ...withBranch,
  //     posts_details: Array.isArray(withBranch.posts)
  //       ? withBranch.posts
  //           .map(pid => posts.find(p => p.id === pid))
  //           .filter(Boolean)
  //           .map(p => ({
  //             id:        p!.id,
  //             name:      p!.name || p!.post_name || 'Poste non defini',
  //             post_name: p!.post_name,
  //           }))
  //       : [],
  //   };

  //   return withPosts;
  // }, [branches, posts]);
// ── 1. Filter + sort sur les données BRUTES ───────────────────────────────
  const filteredEmployees = useMemo(() => {
    let list = [...employees];

    if (debouncedValue) {
      const v = debouncedValue.toLowerCase();
      const cleanV = v.replace(/\D/g, '');
      list = list.filter(e => {
        const fn = e.first_name?.toLowerCase() ?? '';
        const ln = e.last_name?.toLowerCase() ?? '';
        const full1 = `${fn} ${ln}`.trim();
        const full2 = `${ln} ${fn}`.trim();
        const email = e.user?.email?.toLowerCase() ?? '';
        const phone = (e.phone_number ?? '').toLowerCase();
        const cleanPhone = phone.replace(/\D/g, '');
        const empId = (e.id ?? '').toLowerCase();
        const branchName = e.branch_details?.branch_name?.toLowerCase() ?? '';

        return (
          full1.includes(v) ||
          full2.includes(v) ||
          fn.includes(v) ||
          ln.includes(v) ||
          email.includes(v) ||
          phone.includes(v) ||
          (cleanV.length >= 3 && cleanPhone.includes(cleanV)) ||
          empId.includes(v) ||
          branchName.includes(v)
        );
      });
    }

    if (selectedBranch !== 'all')
      list = list.filter(e => e.branch === selectedBranch);

    list = list.filter(e => (e.is_active !== false) === (activeEmplTab === 'actif'));

    list = list.filter(e => matchesDateFilter(e.created_at, selectedFilter, startDate, endDate));

    return list.sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [employees, debouncedValue, selectedBranch, activeEmplTab, selectedFilter, startDate, endDate]);


  // ── 2. Hydrater UNIQUEMENT la liste filtrée ───────────────────────────────
  const hydratedEmployees = useMemo<EmployeeData[]>(() => {
    const branchesById = new Map(branches.map(b => [b.id, b]));
    const postsById = new Map(posts.map(p => [p.id, p]));

    return filteredEmployees.map(emp => ({
      ...emp,
      branch_details: branchesById.get(emp.branch),
      posts_details: (emp.posts ?? [])
        .map(id => postsById.get(id))
        .filter((p): p is PostData => p !== undefined),
      nomComplet: `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim(),
    }));
  }, [filteredEmployees, branches, posts]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd              = () => { setSelectedEmployee(null); setShowEditModal(true); };
  const handleView             = (e: EmployeeData) => { setSelectedEmployee(e); setShowDetailModal(true); };
  const handleEdit             = (e: EmployeeData) => { setSelectedEmployee(e); setShowEditModal(true); };
  const handleDelete           = (e: EmployeeData) => { setSelectedEmployee(e); setShowDeleteModal(true); };
  const handleViewTransactions = (e: EmployeeData) => { setSelectedEmployee(e); setShowTransactionModal(true); };
  const onSearchChange         = useCallback((v?: string) => setFilterValue(v ?? ''), []);
  const onClear = useCallback(() => {
    setFilterValue('');
    setSelectedFilter('all');
    setSelectedBranch('all');
    setStartDate('');
    setEndDate('');
  }, []);
  // ── Sync filtre statut ↔ tab ───────────────────────────────────────────────
 const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setActiveEmplTab(status === 'archive' ? 'archive' : 'actif');
  };


  // ── Bulk action ────────────────────────────────────────────────────────────
  // Export géré directement dans EmployeeTable — ici on traite uniquement les
  // actions métier qui nécessitent un appel API.
 const handleBulkAction = async (
  action: EmployeeBulkAction,
  ids: string[],
  payload?: string,
) => {

  const employees = ids
    .map(id => hydratedEmployees.find(e => e.id === id))
    .filter(Boolean);

  switch (action) {

    case 'activate':
      await Promise.all(
        employees.map(e =>
          putEmployeeMultipart(String(e!.id), { status: 'actif' } as any)
        )
      );
      break;

    case 'archive':
      await Promise.all(
        employees.map(e =>
          putEmployeeMultipart(String(e!.id), { status: 'archive' } as any)
        )
      );
      break;

    case 'change_branch':
      if (!payload) return;
      await Promise.all(
        ids.map(id =>
          putEmployeeMultipart(String(id), { branch: payload } as any)
        )
      );
      break;

    case 'change_post':
      if (!payload) return;
      await Promise.all(
        ids.map(id =>
          putEmployeeMultipart(String(id), { posts: [payload] } as any)
        )
      );
      break;

    case 'export':
      exportToCSV(ids);
      return; // pas de reload
  }

  await loadEmployees();
};


  // ── Export Excel / XLSX direct ────────────────────────────────────────────
  const exportToCSV = (ids: string[]) => {
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Succursale', 'Statut', 'Depuis'];
    const selectedEmployees = filteredEmployees.filter(e => ids.includes(e.id));
    const rows    = selectedEmployees.map(e => [
      e.first_name  ?? '',
      e.last_name   ?? '',
      e.user?.email ?? '',
      e.phone_number ?? '',
      e.branch_details?.branch_name ?? '',
      e.is_active === false ? 'Archivé' : 'Actif',
      e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '',
    ]);

    exportToXLSXFile({
      filename: 'employes',
      documentTitle: 'LISTE DES EMPLOYÉS',
      headers,
      rows,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-4 sm:p-6 md:p-8 flex flex-col gap-6">

      <PageHeader
        title="Gestion des Employes"
        subtitle="Gerez les employes, leurs roles et affectations"
        icon={<Users className="w-6 h-6 text-[#2E7D32]" />}
        className="mb-0"
      />

      <EmployeeFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        selectedBranch={selectedBranch}
        startDate={startDate}
        endDate={endDate}
        branches={branches}
        employees={employees}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={setSelectedFilter}
        onDateRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
        onBranchChange={setSelectedBranch}
        onStatusChange={handleStatusChange}
        onAdd={handleAdd}
        onImport={() => {}}
        totalCount={hydratedEmployees.length} 
        posts={posts}                      
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="flex-1 text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={loadEmployees}
            className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
          >
            Reessayer
          </button>
        </div>
      )}

      <EmployeeTable
        employees={hydratedEmployees}
        isLoading={isLoading}
        branches={branches}
        posts={posts}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewTransactions={handleViewTransactions}
        onBulkAction={handleBulkAction}
        activeTab={activeEmplTab}
        // onTabChange={setActiveAccountTab}      // ← NOUVEAU
        onTabChange={(tab) => {
          setActiveEmplTab(tab);
          setSelectedStatus(
            tab === 'archive'
              ? 'archive'
              : 'actif'
          );
        }}

      />

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
        } : null}
      />
    </div>
  );
};

export default EmployeeGrid;