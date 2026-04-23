"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PiBankLight } from "react-icons/pi";

/* ── Composants ── */
import PageHeader         from "@/app/components/header";
import BranchFilterBar    from "./BranchFilterBar";
import BranchDetailsModal from "./modals/BranchDetailsModal";
import DeleteBranchModal  from "./modals/DeleteBranchModal";
import EditBranchModal    from "./modals/EditBranchModal";   // ← modal, pas la page standalone

/* ── API ── */
import {
  fetchBranches,
  fetchHolidays,
  fetchOpeningHours,
} from "@/app/lib/api/branche";

/* ── Types ── */
import type { Branch, Holiday, OpeningHour } from "@/types/branche";
import { BranchData }        from "./validations";
import BrancheTable from "./BrancheTable";

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface BranchesGridProps {
  branches?: Branch[];
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const BranchesGrid: React.FC<BranchesGridProps> = ({
  branches: initialBranches,
}) => {
  /* ── Data ── */
  const [branches,      setBranches]      = useState<Branch[]>(initialBranches || []);
  const [isLoading,     setIsLoading]     = useState(!initialBranches);
  const [error,         setError]         = useState<string | null>(null);
  const [holidays,      setHolidays]      = useState<Holiday[]>([]);
  const [openingHours,  setOpeningHours]  = useState<OpeningHour[]>([]);
  const [isLoadingRef,  setIsLoadingRef]  = useState(true);

  /* ── Filtres ── */
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSize,    setSelectedSize]    = useState("all");
  const [selectedStatus,  setSelectedStatus]  = useState("all");

  /* ── Modals ── */
  const [selectedBranch,   setSelectedBranch]   = useState<Branch | null>(null);
  const [isEditMode,       setIsEditMode]        = useState(false);
  const [editModalMode,    setEditModalMode]     = useState<"create" | "edit">("create");
  const [showEditModal,    setShowEditModal]     = useState(false);
  const [showDeleteModal,  setShowDeleteModal]   = useState(false);
  const [showDetailsModal, setShowDetailsModal]  = useState(false);

  /* ── Chargement branches ── */
  const loadBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchBranches();
      setBranches(data);
    } catch {
      setError("Impossible de charger les branches. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadBranches(); }, [loadBranches]);
console.log("Branches API:", branches);

  /* ── Données de référence ── */
  useEffect(() => {
    const load = async () => {
      setIsLoadingRef(true);
      try {
        const [h, oh] = await Promise.all([fetchHolidays(), fetchOpeningHours()]);
        setHolidays(h);
        setOpeningHours(oh);
      } catch {
        setHolidays([]);
        setOpeningHours([]);
      } finally {
        setIsLoadingRef(false);
      }
    };
    load();
  }, []);
console.log("Branches API:", branches);

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(search.trim().toLowerCase()),
      300
    );
    return () => clearTimeout(t);
  }, [search]);
    
  const hydrateBranch = useCallback((b: BranchData) => ({
    ...b,
    total_staff:
      b.number_of_tellers +
      b.number_of_clerks +
      b.number_of_credit_officers,
    full_address: `${b.branch_address}, ${b.city}`,
  }), []);


  const hydratedBranches = useMemo(
    () => branches.map(hydrateBranch),
    [branches, hydrateBranch],
  );



  /* ── Filtrage ── */
  const filteredBranches = useMemo(() => {
  let filtered = [...branches];

  // Recherche
  if (debouncedSearch) {
    filtered = filtered.filter((b) =>
      b.branch_name.toLowerCase().includes(debouncedSearch)     ||
      b.branch_address.toLowerCase().includes(debouncedSearch)  ||
      b.branch_code.toLowerCase().includes(debouncedSearch)     ||
      b.branch_email.toLowerCase().includes(debouncedSearch)
    );
  }

  // Taille
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

  // Statut (nouvelle version)
  if (selectedStatus !== "all") {
      filtered = filtered.filter(b => (b.statusBranche ?? 'actif') === selectedStatus);
  }

  // Tri
  return filtered.sort((a, b) =>
    a.branch_name.localeCompare(b.branch_name)
  );
}, [branches, debouncedSearch, selectedSize, selectedStatus]);

  /* ── Export CSV ── */
  const handleExport = useCallback(() => {
    const rows = [
      "Code,Nom,Ville,Département,Téléphone,Email,Caissiers,Commis,Agents,Ouverture,Statut",
      ...filteredBranches.map((b) =>
        [
          b.branch_code,  b.branch_name,    b.city,
          b.department_code,
          b.branch_phone_number, b.branch_email,
          b.number_of_tellers,   b.number_of_clerks, b.number_of_credit_officers,
          b.opening_date, b.statusBranche,
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

 
  
  /* ── Handlers ── */
  const handleAdd = () => {
    setSelectedBranch(null);
    setIsEditMode(false);
    setEditModalMode("create");
    setShowEditModal(true);
  };

  const handleEdit = (branch: BranchData) => {
    setSelectedBranch(branch as unknown as Branch);
    setIsEditMode(true);
    setEditModalMode("edit");
    setShowEditModal(true);
  };

  const handleActivate = (branch: BranchData) => {
    setSelectedBranch(branch as unknown as Branch);
    setShowDetailsModal(true);
  };

  const handleDelete = (branch: BranchData) => {
    setSelectedBranch(branch as unknown as Branch);
    setShowDeleteModal(true);
  };

  const handleView = (branch: BranchData) => {
    setSelectedBranch(branch as unknown as Branch);
    setShowDetailsModal(true);
  };

  const handleSuccess = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    loadBranches();
  };

  /* ── Render ── */
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

      {/*
        onSearchChange reçoit string — compatible avec setSearch (Dispatch<SetStateAction<string>>)
        L'ancien BranchFilterBar avait (value?: string) qui causait l'incompatibilité.
        Le nouveau BranchFilterBar utilise (value: string) — aligné ici.
      */}
      <BranchFilterBar
        filterValue={search}
        selectedSize={selectedSize}
        selectedStatus={selectedStatus}
        totalCount={filteredBranches.length}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
        onSizeChange={setSelectedSize}
        onStatusChange={setSelectedStatus}
        onAdd={handleAdd}
        onExport={handleExport}
      />

      <BrancheTable
        branches={hydratedBranches}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />

      {/* ── Modals ── */}

      {showEditModal && (
        <EditBranchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch}
          isEditMode={isEditMode}
          mode={editModalMode}
          holidays={holidays}
        />
      )}

      {showDeleteModal && selectedBranch && (
        <DeleteBranchModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch as any}
        />
      )}

      {showDetailsModal && selectedBranch && (
        <BranchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          branch={selectedBranch}
          onEdit={(_branch, mode) => {
            setIsEditMode(true);
            setEditModalMode(mode === "activate" ? "edit" : mode);
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          openingHours={openingHours}
          holidays={holidays}
          isLoadingData={isLoadingRef}
        />
      )}
    </div>
  );
};

export default BranchesGrid; 