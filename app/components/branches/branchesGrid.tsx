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

/* ─── Props ──────────────────────────────────────────────────────────────── */
// Le modal reçoit BranchData (correct)

// onEdit reçoit BranchData (correct)
// interface BranchesGridProps {
//   branches?: Branch[];
// }

/* ─── Composant principal ────────────────────────────────────────────────── */

const BranchesGrid: React.FC = () => {
  /* ── Data ── */
  const [branches,     setBranches]     = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [holidays,     setHolidays]     = useState<Holiday[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  // /* ── Filtres ── */ filterValue=search
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSize,    setSelectedSize]    = useState("all");
  const [selectedBranch, setSelectedBranch] =  useState<BranchData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  /* ── Modals ── */
  // 🎯 Plus de "isEditMode" + "editModalMode" combinés.
  //    Maintenant : 2 modals séparés (Create / Edit) + un sous-mode pour Edit
  const [showCreateModal,  setShowCreateModal]  = useState(false);
  const [showEditModal,    setShowEditModal]    = useState(false);
  const [editSubMode,      setEditSubMode]      = useState<"edit" | "activate">("edit");
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  /* ── Chargement branches ── */
//   const loadBranches = useCallback(async () => {
//   try {
//     setIsLoading(true);
//     setError(null);
//     const data = await fetchBranches();
//     setBranches(data);
//   } catch (err) {
//     console.error("Erreur loadBranches:", err);
//     setError("Impossible de charger les branches.");
//   } finally {
//     setIsLoading(false);
//   }
// }, []);
  const loadBranches = useCallback(async () => { 
    try{ setIsLoading(true);
    setError(null);
    const [ bra, h, oh] = await Promise.all([
      fetchBranches(),
      fetchHolidays(),
      fetchOpeningHours(),
    ]);
    setBranches(bra);
    setHolidays(h);
    setOpeningHours(oh);
    } catch (err) {
      console.error("Erreur loadBranches:",err);
      setError("Impossible de charger les données. Branche, Horaire, Jour ferie");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  // /* ── Données de référence ── */
  // useEffect(() => {
  //   const load = async () => {
  //     setIsLoadingRef(true);
  //     try {
  //       const [h, oh] = await Promise.all([fetchHolidays(), fetchOpeningHours()]);
  //       setHolidays(h);
  //       setOpeningHours(oh);
  //     } catch {
  //       setHolidays([]);
  //       setOpeningHours([]);
  //     } finally {
  //       setIsLoadingRef(false);
  //     }
  //   };
  //   load();
  // }, []);

  /* ── Debounce ── */
    useEffect(() => {
    const t = setTimeout(() => {
      const normalized = search.trim().toLowerCase();
      setDebouncedSearch(normalized);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  // useEffect(() => {
  //   const t = setTimeout(
  //     () => setDebouncedSearch(search.trim().toLowerCase()),
  //     300
  //   );
  //   return () => clearTimeout(t);
  // }, [search]);

  // const hydrateBranch = useCallback(
  //   (b: Branch) => ({
  //     ...b,
  //     total_staff:
  //       b.number_of_tellers +
  //       b.number_of_clerks +
  //       b.number_of_credit_officers,
  //     full_address: `${b.branch_address}, ${b.city}`,
  //   }),
  //   []
  // );

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
        ...h, // ← garde toutes les propriétés existantes
        type: h.type ?? "autre",
        scope: h.scope ?? "autre",
        pending_assignment: h.pending_assignment ?? false,
      })
    ),
  }),
  []
);


  const hydratedBranches = useMemo(
    () => branches.map(hydrateBranch),
    [branches, hydrateBranch]
  );

  /* ── Filtrage ── */
  const filteredBranches = useMemo(() => {
    let filtered = [...branches];

    if (debouncedSearch) {
      filtered = filtered.filter(
        (b) =>
          b.branch_name.toLowerCase().includes(debouncedSearch) ||
          b.branch_address.toLowerCase().includes(debouncedSearch) ||
          b.branch_code.toLowerCase().includes(debouncedSearch) ||
          b.branch_email.toLowerCase().includes(debouncedSearch)
      );
    }

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

    if (selectedStatus !== "all") {
      filtered = filtered.filter((b) => getEffectiveStatus(b) === selectedStatus);
    }

    return filtered.sort((a, b) => a.branch_name.localeCompare(b.branch_name));
  }, [branches, debouncedSearch, selectedSize, selectedStatus]);

  /* ── Export CSV ── */
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
          getEffectiveStatus(b), // ← cohérent avec le filtre (statut effectif)
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
    setShowCreateModal(true); // ← ouvre le modal de CRÉATION
  };

  const handleEdit = (branch: BranchData) => {
    setSelectedBranch(branch);
    setEditSubMode("edit");
    setShowEditModal(true); // ← ouvre le modal d'ÉDITION
  };

  /**
   * "Activer" depuis la liste = ouvrir le modal d'édition en mode "activate"
   * (qui pré-sélectionne l'horaire par défaut + highlight la section qui manque)
   */
  const handleActivate = (branch: BranchData) => {
    setSelectedBranch(branch);
    setEditSubMode("activate");
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
          mode={editSubMode} // "edit" | "activate"
          openingHours={openingHours}
          holidays={holidays} 
          branch={selectedBranch}
        />
      )}

      {/* ── Modal SUPPRESSION ── */}
      {showDeleteModal && selectedBranch && (
        <DeleteBranchModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch}        />
      )}

      {/* ── Modal DÉTAILS ── */}
      {showDetailsModal && selectedBranch && (
        <BranchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          branch={selectedBranch}
          onEdit={(_branch, mode) => {
            // Le BranchDetailsModal peut demander "edit" ou "activate"
            setEditSubMode(mode);
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          openingHours={openingHours}
          holidays={holidays}
          isLoadingData={isLoading}
        />
      )}
    </div>
  );
};

export default BranchesGrid;