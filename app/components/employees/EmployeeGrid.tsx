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
import { EmployeeData, BranchData, PostData } from '@/app/components/employees/validations';
import EmployeeTable  from './EmployeeTable';
import { EmployeeBulkAction } from './BulkActionDropdown';

// ─── Main ──────────────────────────────────────────────────────────────────────
const EmployeeGrid: React.FC = () => {

  // ── Data ──
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [branches,  setBranches]  = useState<BranchData[]>([]);
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

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeEmplTab, setActiveEmplTab] = useState<'actif' | 'inactif' | 'archive'>('actif');

  // ── Modals ──
  const [selectedEmployee,     setSelectedEmployee]     = useState<EmployeeData | null>(null);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showEditModal,        setShowEditModal]        = useState(false);
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  //Tab, ce state AccountGrid

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadEmployees = async () => {
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
      console.error(err);
      setError('Impossible de charger les employes.');
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
              name:      p!.name || p!.post_name || 'Poste non defini',
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
        e.first_name?.toLowerCase().includes(v)   ||
        e.last_name?.toLowerCase().includes(v)    ||
        e.user?.email?.toLowerCase().includes(v)  ||
        e.phone_number?.toLowerCase().includes(v) ||
        e.payment_ref?.toLowerCase().includes(v)
      );
    }

    if (selectedBranch !== 'all')
      list = list.filter(e => e.branch === selectedBranch);

    if (selectedStatus !== 'all')
      list = list.filter(e => (e.statutEmploye ?? 'actif') === selectedStatus);

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

  // ── Sync filtre statut ↔ tab ───────────────────────────────────────────────
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if      (status === 'inactif') setActiveEmplTab('inactif');
    else if (status === 'archive' || status === 'suspended') setActiveEmplTab('archive');
    else    setActiveEmplTab('actif');
  };

  // ── Bulk action ────────────────────────────────────────────────────────────
  // Export géré directement dans EmployeeTable — ici on traite uniquement les
  // actions métier qui nécessitent un appel API.
  const handleBulkAction = async (
    action:  EmployeeBulkAction,
    ids:     string [],
    payload?: string,
  ) => {
    switch (action) {
      case 'activate':
        await Promise.all(
          ids
            .map(id => hydratedEmployees.find(e => e.id === id))
            .filter(Boolean)
            .map(e => putEmployeeMultipart(String(e!.id), { status: 'actif' } as any))
        );
        break;
      case 'deactivate':
        await Promise.all(
          ids
            .map(id => hydratedEmployees.find(e => e.id === id))
            .filter(Boolean)
            .map(e => putEmployeeMultipart(String(e!.id), { status: 'inactif' } as any))
        );
        break;
      case 'change_branch':
        if (!payload) return;
        await Promise.all(
          ids.map(id => putEmployeeMultipart(String(id), { branch: payload } as any))
        );
        break;
      case 'change_post':
        if (!payload) return;
        await Promise.all(
          ids.map(id => putEmployeeMultipart(String(id), { posts: [payload] } as any))
        );
        break;
      case 'archive':
        await Promise.all(
          ids
            .map(id => hydratedEmployees.find(e => e.id === id))
            .filter(Boolean)
            .map(e => putEmployeeMultipart(String(e!.id), { status: 'archive' } as any))
        );
      break;
       case 'export':
        exportToCSV(ids);
        return; // pas de reload
    }
    await loadEmployees();
  };


  // ── Export CSV direct ──────────────────────────────────────────────────────
  const exportToCSV = (ids: string[]) => {
    const headers = ['Prenom', 'Nom', 'Email', 'Telephone', 'Succursale', 'Statut', 'Depuis'];
    const selectedEmployees = filteredEmployees.filter(e => ids.includes(e.id));
    const rows    = selectedEmployees.map(e => [
      e.first_name  ?? '',
      e.last_name   ?? '',
      e.user?.email ?? '',
      e.phone_number ?? '',
      e.branch_details?.branch_name ?? '',
      e.statutEmploye ?? 'actif',
      e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '',
    ]);
    const csv  = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `employes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 flex flex-col gap-6">

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
        selectedStatus={selectedStatus}
        branches={branches}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={setSelectedFilter}
        onBranchChange={setSelectedBranch}
        onStatusChange={handleStatusChange}
        onAdd={handleAdd}
        onImport={() => console.log('Import')}
        totalCount={filteredEmployees.length}
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
          // tab → dropdown (same as AccountGrid)
          setSelectedStatus(
            tab === 'inactif' ? 'inactif' :
            tab === 'archive'  ? 'suspended' : 'actif'
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
          payment_ref:  selectedEmployee.payment_ref,
        } : null}
      />
    </div>
  );
};

export default EmployeeGrid;