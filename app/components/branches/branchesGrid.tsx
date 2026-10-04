"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PiBankLight } from "react-icons/pi";

/* ── Composants ── */
import PageHeader         from "@/app/components/header";
import BranchFilterBar    from "./BranchFilterBar";
import BranchDetailsModal from "./modals/BranchDetailsModal";
import DeleteBranchModal  from "./modals/DeleteBranchModal";
import EditBranchModal    from "./modals/EditBranchModal";
import CreateBranchModal  from "./modals/CreateBranchModal";

/* ── API ── */
import {
  fetchBranches,
  fetchHolidays,
  fetchOpeningHours,
} from "@/app/lib/api/branche";

/* ── Types ── */
import type { Branch, OpeningHour } from "@/types/branche";
import { BranchData } from "./validations";
import BrancheTable from "./BrancheTable";
import { getEffectiveStatus } from "@/app/utils/branchStatus";
import { Holiday, HolidayData } from "../holidays/validations";
import { Loader2 } from "lucide-react";
import { EmployeeData, PostData } from "../employees/validations";
import { fetchEmployees } from "@/app/lib/api/employee";
import { fetchPosts } from "@/app/lib/api/post";

/* ─── Type local pour les onglets ──────────────────────────────────────── */
type BranchTabId = "active" | "inactive" | "archive";

/* ─── Composant principal ─────────────────────────────────────────────── */

const BranchesGrid: React.FC = () => {

  /* ── Data ── */
  const [branches,     setBranches]     = useState<Branch[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [holidays,     setHolidays]     = useState<Holiday[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  /* ── Filtres ── */
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSize,    setSelectedSize]    = useState("all");
  const [selectedStatus,  setSelectedStatus]  = useState("all");
  const [selectedBranch,  setSelectedBranch]  = useState<BranchData | null>(null);

  /* ── Onglet actif (synchronisé avec le filtre statut, comme AccountGrid) ── */
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'archive'>("active");

  /* ── Modals ── */
  const [showCreateModal,  setShowCreateModal]  = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);

  /* ── Chargement (branches + horaires + fériés en parallèle) ── */
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  const loadBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [bra, h, oh, emp, pos] = await Promise.all([
        fetchBranches(),
        fetchHolidays(),
        fetchOpeningHours(),
        fetchEmployees(), // ← nouveau
        fetchPosts(), // ← nouveau

      ]);
      setBranches(bra);
      setHolidays(h);
      setOpeningHours(oh);
      setEmployees(emp); // ← nouveau
      setPosts(pos); // ← nouveau

    } catch (err) {
      console.error("Erreur loadBranches:", err);
      setError("Impossible de charger les données. Branche, Horaire, Jour férié, Employé.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  /* ── Debounce de la recherche ── */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Hydrate une Branch (raw API) en BranchData (UI) ──
     Ajoute total_staff et full_address calculés, normalise holidays_details.
  */
  const hydrateBranch = useCallback(
    (b: Branch): BranchData => ({
      ...b,
      total_staff:
        b.number_of_tellers +
        b.number_of_clerks +
        b.number_of_credit_officers,
      full_address: `${b.branch_address}, ${b.city}`,
      holidays_details: b.holidays_details?.map(
        (h): HolidayData => ({
          ...h,
          type: h.type ?? "autre",
          scope: h.scope ?? "autre",
        })
      ),
    }),
    []
  );

  /* ─── Filtrage : sur la liste brute, AVANT hydratation ─────────────────
     Ordre logique :
       1. on filtre les Branch (raw) sur search + size + status
       2. on hydrate seulement les survivants → BranchData
       3. on les passe au tableau
  */
  const filteredBranches = useMemo(() => {
    let filtered = [...branches];

    // Recherche textuelle
    if (debouncedSearch) {
      filtered = filtered.filter(
        (b) =>
          b.branch_name.toLowerCase().includes(debouncedSearch) ||
          b.branch_address.toLowerCase().includes(debouncedSearch) ||
          b.branch_code.toLowerCase().includes(debouncedSearch) ||
          b.branch_email.toLowerCase().includes(debouncedSearch)
      );
    }

    // Filtre par taille (calculé depuis le total des employés)
    if (selectedSize !== "all") {
      filtered = filtered.filter((b) => {
        const total =
          b.number_of_tellers +
          b.number_of_clerks +
          b.number_of_credit_officers;
        if (selectedSize === "large")  return total >= 20;
        if (selectedSize === "medium") return total >= 10 && total < 20;
        if (selectedSize === "small")  return total < 10;
        return true;
      });
    }

    // Filtre par statut effectif
    if (selectedStatus !== "all") {
      filtered = filtered.filter((b) => getEffectiveStatus(b) === selectedStatus);
    }

    return filtered.sort((a, b) => a.branch_name.localeCompare(b.branch_name));
  }, [branches, debouncedSearch, selectedSize, selectedStatus]);

  /* ─── Hydratation APRÈS filtrage ──────────────────────────────────────
     Important : on hydrate uniquement ce que l'utilisateur a filtré,
     pas la liste complète — sinon le filtre n'a aucun effet visible
     sur ce qui est affiché.
  */
  const hydratedFilteredBranches = useMemo(
    () => filteredBranches.map(hydrateBranch),
    [filteredBranches, hydrateBranch]
  );

  const hydratedAllBranches = useMemo(
    () => branches.map(hydrateBranch),
    [branches, hydrateBranch]
  );

  /* ─── Synchro filtre statut → onglet (aligné sur AccountGrid) ─────────
     Quand l'utilisateur change le dropdown "Statut", on bouge aussi
     l'onglet. Avec alias possibles pour résilience face à l'API.
  */
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if      (status === "archive"  || status === "archived")  setActiveTab("archive");
    else if (status === "inactive" || status === "désactivé") setActiveTab("inactive");
    else    setActiveTab("active"); // "all" ou "active" → onglet par défaut
  };

  /* ─── Export CSV ─────────────────────────────────────────────────────── */
  const handleExport = useCallback(() => {
    const rows = [
      "Code,Nom,Ville,Département,Téléphone,Email,Caissiers,Commis,Agents,Ouverture,Statut",
      ...filteredBranches.map((b) =>
        [
          b.branch_code,
          b.branch_name,
          b.city,
          b.department_code,
          b.branch_phone_number,
          b.branch_email,
          b.number_of_tellers,
          b.number_of_clerks,
          b.number_of_credit_officers,
          b.opening_date,
          getEffectiveStatus(b),
        ]
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([rows], { type: "text/csv;charset=utf-8;" })
    );
    link.download = `branches_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredBranches]);

  /* ─── Handlers actions ──────────────────────────────────────────────── */
  const handleAdd = () => {
    setSelectedBranch(null);
    setShowCreateModal(true);
  };

  const handleEdit = (branch: BranchData) => {
    setSelectedBranch(branch);
    setShowEditModal(true);
  };

  const handleDelete = (branch: BranchData) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleView = (branch: BranchData) => {
    setSelectedBranch(branch);
    setShowDetailsModal(true);
  };

  const handleSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    loadBranches();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2E7D32]" />
        </div>
      </div>
    );
  }

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
      <PageHeader
        title="Gestion des branches"
        subtitle="Gérez toutes les branches et leurs informations"
        icon={<PiBankLight className="w-8 h-8 text-[#2E7D32]" />}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadBranches}
            className="text-sm font-medium text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      <BranchFilterBar
        filterValue={search}
        selectedSize={selectedSize}
        totalCount={filteredBranches.length}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
        onSizeChange={setSelectedSize}
        onAdd={handleAdd}
      />

      <BrancheTable
        branches={hydratedFilteredBranches}
        allBranches={hydratedAllBranches}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedStatus(tab);
        }}
      />

      {/* ── Modal CRÉATION ── */}
      {showCreateModal && (
        <CreateBranchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
          openingHours={openingHours}
          holidays={holidays}
        />
      )}

      {/* ── Modal ÉDITION (et activation) ── */}
      {showEditModal && selectedBranch && (
        <EditBranchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
          openingHours={openingHours}
          holidays={holidays}
          branch={selectedBranch}
        />
      )}

      {/* ── Modal SUPPRESSION (en réalité : archivage / soft delete) ── */}
      {showDeleteModal && selectedBranch && (
        <DeleteBranchModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch}
        />
      )}

      {/* ── Modal DÉTAILS ── */}
      {showDetailsModal && selectedBranch && (
        <BranchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          branch={selectedBranch}
          onEdit={(_branch, mode) => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          openingHours={openingHours}
          holidays={holidays}
          isLoadingData={isLoading}
          employees={employees}    // ← nouveau
          error={error}             // ← tant qu'à faire, connecte enfin l'erreur au modal
          posts={posts} // ← nouveau
        />
      )}
    </div>
  );
};

export default BranchesGrid;