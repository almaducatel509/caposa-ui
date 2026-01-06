

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUsers } from "react-icons/fa6";

// Types et API
import { fetchEmployees } from '@/app/lib/api/employee';
import { fetchBranches } from '@/app/lib/api/branche';
import { fetchPosts } from '@/app/lib/api/post';
import PageHeader from '@/app/components/header';

// Composants
import EmployeeFilterBar from '@/app/components/employees/EmployeeFilterBar';
import EmployeeCard from '@/app/components/employees/EmployeeCard';
import EmployeeDetailModal from '@/app/components/employees/EmployeeDetailModal';
import EditEmployeeModal from '@/app/components/employees/EditEmployeeModal';
import DeleteEmployeeModal from '@/app/components/employees/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/EmployeeTransactionModal';
import { BranchData, EmployeeData, Post } from '@/app/components/employees/validations';
import { PiUsersThin } from 'react-icons/pi';

interface EmployeeGridProps {
  employees?: EmployeeData[];
  onSuccess?: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}
// Composant Loading Skeleton
const LoadingSkeleton = () => (
      <div className="flex flex-col gap-6 p-6 min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="p-6 space-y-4">
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
              </div>
            </div>
          ))}
        </div>
      </div>
  );
  // Composant Error Display
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
    <p className="text-red-700 mb-3">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
    >
      Réessayer
    </button>
  </div>
);

  

const EmployeeGrid: React.FC<EmployeeGridProps> = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
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
  //Chargement des membre
  const loadEmployees = async () => {
    // let isMounted = true;
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

    } catch (error) {
     console.error("Erreur lors du chargement des employes:", error);
      setError("Impossible de charger les employes. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);
  

  const header = (
    <PageHeader
      title="Gestion des Employés"
      subtitle="Gérez les employés, leurs rôles et affectations"
      icon={<PiUsersThin   className="text-5xl " />}
    />
  );

  // Filtrage avancé debouncedValue selectedStatus
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

 return (
    <div className="flex flex-col gap-6 p-6 ">
      {header}
      {error && <ErrorDisplay error={error} onRetry={loadEmployees} />}

 {/* Filter Bar */}
      {!isLoading && (
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
      )}

    


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
            <button 
              onClick={filterValue ? onClear : handleAdd}
              className={`px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors ${
                filterValue 
                  ? "border-2 border-green-700 bg-white text-green-700 hover:bg-green-50" 
                  : "bg-green-700 hover:bg-green-800 text-white"
              }`}
            >
              {filterValue ? "Effacer les filtres" : "Ajouter un employé"}
            </button>
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