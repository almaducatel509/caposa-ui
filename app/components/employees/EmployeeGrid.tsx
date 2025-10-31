'use client';

import React, { useState, useEffect, useCallback, useMemo} from 'react';
import {
  Card,
  CardBody,
  Button
} from "@nextui-org/react";
import { FaUsers } from "react-icons/fa6";

// Types et API
import { fetchEmployees } from '@/app/lib/api/employee';
import { fetchBranches } from '@/app/lib/api/branche';

// Composants
import EmployeeFilterBar from '@/app/components/employees/EmployeeFilterBar';
import EmployeeCard from '@/app/components/employees/EmployeeCard';
import EmployeeDetailModal from '@/app/components/employees/EmployeeDetailModal';
import EditEmployeeModal from '@/app/components/employees/EditEmployeeModal';
import DeleteEmployeeModal from '@/app/components/employees/DeleteEmployeeModal';
import EmployeeTransactionModal from '@/app/components/employees/EmployeeTransactionModal';
import { BranchData, BranchDetails, EmployeeData, PostData } from '@/app/components/employees/validations';
import { fetchPosts } from '@/app/lib/api/post';

interface EmployeeGridProps {
  employees?: EmployeeData[];
  onSuccess?: () => void;
}

const EmployeeGrid: React.FC<EmployeeGridProps> = ({ employees: initialEmployees, onSuccess: parentOnSuccess }) => {
  // États des données
const [employees, setEmployees] = useState<EmployeeData[]>([]);
const [branches, setBranches] = useState<BranchData[]>([]);
const [posts, setPosts] = useState<PostData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all'
  });
// États de filtrage
const [filterValue, setFilterValue] = useState('');
const [debouncedValue, setDebouncedValue] = useState(filterValue);
const [selectedFilter, setSelectedFilter] = useState('all');
const [selectedBranch, setSelectedBranch] = useState('all');
const [selectedStatus, setSelectedStatus] = useState('all');

// États des modals
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showTransactionModal, setShowTransactionModal] = useState(false);

// indicateur d’édition

const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
const [showDetailModal, setShowDetailModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);

  // Effect pour le debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(filterValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // Chargement des données
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ Charger les données de référence (branches, posts, employés existants)
      const [branchesData, postsData, existingEmployees] = await Promise.all([
        fetchBranches(),
        fetchPosts(),
        fetchEmployees(),
      ]);
      
      setBranches(branchesData);
      setPosts(postsData);
      setEmployees(existingEmployees);
      
      // ✅ Initialiser les données selon le mode
     
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      setError("Impossible de charger les données de l'employé.");
    } finally {
      setIsLoading(false);
    }
  };
   
  useEffect(() => {
  if (initialEmployees && initialEmployees.length) {
    // On injecte les employés passés en props
    setEmployees(initialEmployees);
    setIsLoading(false);
    setError(null);
  } else {
    // Sinon on charge depuis l’API
    loadEmployees();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialEmployees]);


  // Logique de filtrage
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Filtre par recherche
    if (debouncedValue) {
      const lowercasedFilter = debouncedValue.toLowerCase();
      filtered = filtered.filter((employee) => 
        employee.first_name?.toLowerCase().includes(lowercasedFilter) ||
        employee.last_name?.toLowerCase().includes(lowercasedFilter) ||
        employee.user?.email?.toLowerCase().includes(lowercasedFilter) ||
        employee.phone_number?.toLowerCase().includes(lowercasedFilter) ||
        employee.payment_ref?.toLowerCase().includes(lowercasedFilter)
      );
    }

    // Filtre par branche
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(employee => employee.branch === selectedBranch);
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(employee => {
        const status = employee.status || 'active';
        return status === selectedStatus;
      });
    }

    // Filtre par période
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(employee => {
          if (!employee.created_at) return false;
          const createdDate = new Date(employee.created_at);
          const daysDiff = (today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 30;
        });
        break;
        
      case 'thisMonth':
        filtered = filtered.filter(employee => {
          if (!employee.created_at) return false;
          const createdDate = new Date(employee.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        });
        break;
        
      case 'thisYear':
        filtered = filtered.filter(employee => {
          if (!employee.created_at) return false;
          return new Date(employee.created_at).getFullYear() === currentYear;
        });
        break;
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [employees, debouncedValue, selectedFilter, selectedBranch, selectedStatus]);

  // Gestionnaires d'événements
  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        'Nom,Prénom,Email,Téléphone,Genre,Date de naissance,Adresse,Branche,Référence,Créé le',
        ...filteredEmployees.map(emp => 
          `"${emp.last_name}","${emp.first_name}","${emp.user?.email || ''}","${emp.phone_number}","${emp.gender}","${emp.date_of_birth}","${emp.address}","${emp.branch}","${emp.payment_ref}","${emp.created_at || ''}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filteredEmployees]);

   const handleImport = () => {
    console.log('Import employees');
  };

  const handleAdd = () => {
    console.log("🆕 Creating new employee"); 
    setSelectedEmployee(null);
    setShowEditModal(true);
    console.log("📋 Modal state:", { showEditModal: true, selectedEmployee: null, isEditMode: false }); // ✅ Et ça
  };

  const handleView = (employee: EmployeeData) => {
    const hydratedEmployee = hydrateDetails(employee);
    setSelectedEmployee(hydratedEmployee);
    setShowDetailModal(true);
  };

  const handleEdit = (employee: EmployeeData) => {
      console.log('🔍 handleEdit appelé:', {
      employee: employee?.first_name + ' ' + employee?.last_name,
      employeeId: employee?.id
    });
      setSelectedEmployee(employee);
    setShowEditModal(true);
    console.log('🔍 États après:', {
      selectedEmployee: employee?.first_name,
      isEditMode: true
    });
  };

  const handleDelete = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleViewTransactions = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setShowTransactionModal(true);
  };
// re-mappe aussi branch/posts "details" si le back ne les renvoie pas
function hydrateDetails(e: EmployeeData) {
  // branche
  const b = branches.find(br => br.id === e.branch);
  const withBranch =
    e.branch_details || !e.branch
      ? e
      : {
          ...e,
          branch_details: b
            ? {
                id: b.id,                         // ← AJOUT TRÈS IMPORTANT
                branch_name: b.branch_name,
                branch_code: b.branch_code,
              }
            : undefined,
        };

  // posts
  const withPosts =
    withBranch.posts_details || !Array.isArray(withBranch.posts)
      ? withBranch
      : {
          ...withBranch,
          posts_details: withBranch.posts
            .map(pid => posts.find(p => p.id === pid))
            .filter(Boolean)
            .map(p => ({ id: p!.id, name: p!.name || p!.post_name })),
        };

  return withPosts; // ← ceci est bien un EmployeeData
}


function handleDeleteSuccess(deletedId?: string) {
  if (deletedId) {
    setEmployees(prev => prev.filter(e => e.id !== deletedId));
    if (selectedEmployee?.id === deletedId) {
      setSelectedEmployee(null);
      setShowDetailModal(false);
    }
  } else {
    // Si le modal n'envoie pas d'id, on relit tout
    loadEmployees();
    setShowDetailModal(false);
  }
  setShowDeleteModal(false);
}

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-4 px-6 py-4 w-full bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Gestion d'erreurs */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button size="sm" onClick={loadEmployees} className="mt-2 bg-red-600 text-white">
            Réessayer
          </Button>
        </div>
      )}

      {/* FilterBar */}
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
        onTypeChange={(value) => setFilters({ ...filters, type: value })}
        onRefresh={() => window.location.reload()}
        onImport={handleImport}
        onExport={handleExport}
        totalCount={filteredEmployees.length}
        // Let the header breathe and focus on context.all buttons inside FilterBar.
      />

      <div className="text-sm text-[#2c2e2f]/70">
        {filteredEmployees.length} employé(s) trouvé(s)
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">  
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={handleViewTransactions}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-8xl mb-4 text-gray-300">
              <FaUsers />
            </div>
            <h3 className="text-xl font-semibold text-[#2c2e2f] mb-2">
              {filterValue ? "Aucun employé trouvé" : "Aucun employé"}
            </h3>
            <p className="text-[#2c2e2f]/70 mb-4">
              {filterValue 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier employé"
              }
            </p>
            {filterValue ? (
              <Button onPress={onClear} variant="light" className="text-[#34963d]">
                Effacer les filtres
              </Button>
            ) : (
              <Button onPress={handleAdd} className="bg-[#34963d] text-white">
                Ajouter un employé
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedEmployee && showDetailModal && (
        <EmployeeDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          employee={selectedEmployee}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Edit */}
      {showEditModal && (
       <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employee={selectedEmployee}
          branches={branches}
          posts={posts}
          onSuccess={(updated) => {
            // rafraîchir la liste + le détail
            setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
            setSelectedEmployee(updated);
          }}
       />

      )}

      {/* Delete */}
      {showDeleteModal && selectedEmployee && (
        <DeleteEmployeeModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          employee={selectedEmployee}
          onSuccess={handleDeleteSuccess}  // <= accepte id? et fallback reload
        />
      )}

      {/* Transactions */}
      {showTransactionModal && selectedEmployee && (
        <EmployeeTransactionModal
          isOpen={true}
          onClose={() => setShowTransactionModal(false)}
          employee={{
            id: selectedEmployee.id,
            first_name: selectedEmployee.first_name,
            last_name: selectedEmployee.last_name,
            photo_profil: selectedEmployee.photo_profil ?? null,
            payment_ref: selectedEmployee.payment_ref,
          }}
        />
      )}
    </div>
  );
}
export default EmployeeGrid; 
