"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Globe,
  MapPin,
  Building2,
  ShieldAlert,
  Edit2,
  HelpCircle,
  Tag,
} from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import type { Branch } from "@/types/branche";
import {
  getBranchesForGroup,
  formatHolidayDate,
} from "@/types/holidayHelpers";
import { GroupedHoliday } from "@/types/holidayHelpers";
import {
  HolidayData,
  HolidayType,
  HOLIDAY_TYPE_LABELS,
  HOLIDAY_SCOPE_LABELS,
} from "../validations";
import { fetchBranches } from "@/app/lib/api/branche";
import { assignHolidayToBranches } from "@/app/lib/api/holidays";

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. SUPPRIMÉ : le faux setTimeout(800) qui simulait l'assignation.
//    Avant, le bouton "Confirmer l'assignation" attendait 800ms et
//    affichait un message de succès SANS rien envoyer au backend.
//    Aucune donnée n'était persistée.
//
// 2. AJOUTÉ : vrai appel `assignHolidayToBranches()` (PATCH /holidays/{id}/)
//    qui envoie le payload exact attendu par le backend :
//      { scope, department_code?, branch_ids, pending_assignment: false, comment }
//
// 3. AJOUTÉ : fetch interne des branches via fetchBranches() (TEMPORAIRE,
//    le parent passe encore des mocks dans la prop allBranches).
//
// 4. AJOUTÉ : log console au submit pour vérifier le payload envoyé.
//
// 🔧 TODO : QUAND LE PARENT SERA CORRIGÉ
//   → Supprimer apiBranches/isLoadingBranches/le useEffect de fetch
//   → Supprimer l'import fetchBranches
//   → Remplacer `branchesToUse` par `allBranches`
// ─────────────────────────────────────────────────────────────────────────────

interface AssignBranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: GroupedHoliday;
  /** ⚠ Actuellement ignoré : on fetch les vraies branches en interne. */
  allBranches: Branch[];
  onEditType?: (group: GroupedHoliday) => void;
}

type AssignmentScope = "national" | "regional" | "branch" | "autre";

const TYPE_COLORS: Record<HolidayType, { bg: string; text: string }> = {
  ferie:       { bg: "#E6F1FB", text: "#042C53" },
  local:       { bg: "#FBEAF0", text: "#4B1528" },
  interne:     { bg: "#E1F5EE", text: "#04342C" },
  election:    { bg: "#EEEDFE", text: "#26215C" },
  maintenance: { bg: "#FAEEDA", text: "#412402" },
  autre:       { bg: "#F1EFE8", text: "#2C2C2A" },
};

const AssignBranchesModal: React.FC<AssignBranchesModalProps> = ({
  isOpen, onClose, onSuccess, group, allBranches, onEditType,
}) => {

  // ─── TEMPORAIRE : fetch des vraies branches API ──────────────────────────
  const [apiBranches, setApiBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadRealBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const data = await fetchBranches();
        setApiBranches(data);
      } catch (e) {
        console.error("❌ Erreur chargement branches API:", e);
        setApiBranches([]);
      } finally {
        setIsLoadingBranches(false);
      }
    };
    loadRealBranches();
  }, [isOpen]);

  const branchesToUse = apiBranches;

  const holidayType: HolidayType = group.type;
  const typeColor = TYPE_COLORS[holidayType];

  const initialScope: AssignmentScope =
    group.effectiveScope === "national" ? "national"
    : group.effectiveScope === "regional" ? "regional"
    : group.effectiveScope === "branch" ? "branch"
    : "autre";

  const [scope, setScope] = useState<AssignmentScope>(initialScope);
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    group.records[0]?.scope === "regional"
      ? (group.records[0]?.department_code ?? group.records[0]?.branch_code ?? "")
      : ""
  );
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setScope(initialScope);
    // selectedBranches stocke des branch_code (pour l'UI checkbox)
    setSelectedBranches(
      new Set(getBranchesForGroup(group, branchesToUse).map((b) => b.branch_code))
    );
    setSearch(""); setReason(""); setApiError(null); setSuccessMessage(null);
  }, [isOpen, group, branchesToUse]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    branchesToUse.forEach((b) => b.department_code && set.add(b.department_code));
    return Array.from(set).sort();
  }, [branchesToUse]);

  const filteredBranches = useMemo(() => {
    if (!search.trim()) return branchesToUse;
    const q = search.toLowerCase();
    return branchesToUse.filter(
      (b) =>
        b.branch_name.toLowerCase().includes(q) ||
        b.branch_code.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q)
    );
  }, [branchesToUse, search]);

  const branchesInDepartment = useMemo(() => {
    if (!selectedDepartment) return [];
    return branchesToUse.filter((b) => b.department_code === selectedDepartment);
  }, [branchesToUse, selectedDepartment]);

  const toggleBranch = (code: string) => {
    setSelectedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const selectAll = () => setSelectedBranches(new Set(branchesToUse.map((b) => b.branch_code)));
  const deselectAll = () => setSelectedBranches(new Set());

  const finalCount =
    scope === "national" ? branchesToUse.length
    : scope === "regional" ? branchesInDepartment.length
    : selectedBranches.size;

  const canSubmit = (() => {
    if (isSubmitting || isLoadingBranches) return false;
    if (scope === "national") return branchesToUse.length > 0;
    if (scope === "regional") return selectedDepartment !== "";
    return selectedBranches.size > 0;
  })();

  // ═════════════════════════════════════════════════════════════════════════
  // SUBMIT — vrai appel backend
  // ═════════════════════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Calculer les branch_ids (UUIDs) selon le scope
      // - national : toutes les branches (le backend ignore mais on envoie)
      // - regional : branches du département (le backend ignore mais on envoie)
      // - branch/autre : branches cochées (converties code → id)
      let targetBranches: Branch[] = [];
      if (scope === "national") {
        targetBranches = branchesToUse;
      } else if (scope === "regional") {
        targetBranches = branchesInDepartment;
      } else {
        targetBranches = branchesToUse.filter((b) =>
          selectedBranches.has(b.branch_code)
        );
      }

      const branch_ids = targetBranches.map((b) => b.id);

      const payload = {
        scope,
        department_code: scope === "regional" ? selectedDepartment : undefined,
        branch_ids,
        comment: reason || undefined,
      };

      console.group("🟢 [AssignBranchesModal] Soumission");
      console.log("Holiday ID:", group.id);
      console.log("Scope:", scope);
      console.log("Branches ciblées:", targetBranches.length);
      console.log("Payload envoyé:", payload);
      console.groupEnd();

      // ⚠ group.id correspond au PREMIER record du groupe.
      //    Avec le modèle M2M, un groupe = un seul Holiday, donc c'est OK.
      //    Si plus tard on a plusieurs records par groupe, il faudra revoir.
      await assignHolidayToBranches(group.id, payload);

      const summary =
        scope === "national" ? `Férié appliqué à toutes les branches (${branchesToUse.length})`
        : scope === "regional" ? `Férié appliqué aux ${branchesInDepartment.length} branche${branchesInDepartment.length > 1 ? "s" : ""} du département ${selectedDepartment}`
        : `Férié appliqué à ${selectedBranches.size} branche${selectedBranches.size > 1 ? "s" : ""}`;
      setSuccessMessage(summary);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);

    } catch (err: any) {
      console.error("❌ Erreur assignation:", err);
      setApiError(err?.message || "Une erreur est survenue lors de l'assignation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Assigner aux branches</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
              {group.description} · {formatHolidayDate(group.date)}
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

        {isLoadingBranches && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-xs text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#2E7D32]" />
            Chargement des branches…
          </div>
        )}

        {apiError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-3 px-4 py-3 bg-[#DDEAD5] rounded-xl border border-[#2E7D32]/20">
            <CheckCircle className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#1B5E20]">{successMessage}</p>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
          <p className="text-xs text-[#355C7D] leading-relaxed">
            Ce changement bloquera l'ouverture de session des caissiers des branches concernées le{" "}
            <strong>{formatHolidayDate(group.date)}</strong>. Toute modification est tracée dans le journal d'audit.
          </p>
        </div>

        {/* Type + Portée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />Type du jour
              </p>
              <Tooltip text="Le type décrit la nature du jour. Il se modifie depuis le formulaire d'édition." />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: typeColor.bg, color: typeColor.text }}>
                {HOLIDAY_TYPE_LABELS[holidayType]}
              </span>
              {onEditType && (
                <button onClick={() => onEditType(group)}
                  className="text-xs font-semibold text-[#2E7D32] hover:underline flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />Modifier
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Lecture seule — modifiez via le formulaire d'édition.
            </p>
          </div>

          <div className="p-4 bg-[#DDEAD5]/30 border border-[#2E7D32]/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] flex items-center gap-1.5">
                <Globe className="w-3 h-3" />Portée
              </p>
              <Tooltip text="La portée définit qui est concerné. C'est ici que vous décidez quelles branches seront affectées." />
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-white text-[#1B5E20] border border-[#2E7D32]/20">
                {HOLIDAY_SCOPE_LABELS[scope]}
              </span>
              <span className="text-xs text-[#1B5E20]/70">
                → {finalCount} branche{finalCount > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-[11px] text-[#1B5E20]/60 mt-2 leading-relaxed">Modifiable ci-dessous.</p>
          </div>
        </div>

        {/* Sélecteur portée */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Choisir la portée
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <ScopeCard icon={<Globe className="w-5 h-5" />} title={HOLIDAY_SCOPE_LABELS.national}
              description="Toutes les branches" isSelected={scope === "national"} onClick={() => setScope("national")} />
            <ScopeCard icon={<MapPin className="w-5 h-5" />} title={HOLIDAY_SCOPE_LABELS.regional}
              description="Un département" isSelected={scope === "regional"} onClick={() => setScope("regional")} />
            <ScopeCard icon={<Building2 className="w-5 h-5" />} title={HOLIDAY_SCOPE_LABELS.branch}
              description="Sélection manuelle" isSelected={scope === "branch"} onClick={() => setScope("branch")} />
            <ScopeCard icon={<Tag className="w-5 h-5" />} title={HOLIDAY_SCOPE_LABELS.autre}
              description="Cas spécial" isSelected={scope === "autre"} onClick={() => setScope("autre")} />
          </div>
        </div>

        {scope === "national" && (
          <div className="p-4 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#2E7D32]" />
              <div>
                <p className="text-sm font-semibold text-[#1B5E20]">
                  Application à toutes les {branchesToUse.length} branches
                </p>
                <p className="text-xs text-[#1B5E20]/70 mt-0.5">
                  Tous les caissiers du réseau seront concernés
                </p>
              </div>
            </div>
          </div>
        )}

        {scope === "regional" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Département</p>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] appearance-none">
              <option value="">Sélectionnez un département</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
            {selectedDepartment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">
                  {branchesInDepartment.length} branche{branchesInDepartment.length > 1 ? "s" : ""} dans ce département :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {branchesInDepartment.map((b) => (
                    <span key={b.branch_code} className="px-2.5 py-1 bg-white text-gray-600 text-xs rounded-md border border-gray-200">
                      {b.branch_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(scope === "branch" || scope === "autre") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {scope === "autre" ? "Cas spécial — sélection libre" : "Sélectionner les branches"}{" "}
                <span className="ml-1 px-2 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded text-[10px]">
                  {selectedBranches.size} / {branchesToUse.length}
                </span>
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-xs font-semibold text-[#2E7D32] hover:underline">Tout cocher</button>
                <span className="text-gray-300">·</span>
                <button type="button" onClick={deselectAll} className="text-xs font-semibold text-gray-500 hover:underline">Tout décocher</button>
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Rechercher une branche..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]" />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
              {filteredBranches.length > 0 ? (
                filteredBranches.map((b) => {
                  const isChecked = selectedBranches.has(b.branch_code);
                  return (
                    <label key={b.branch_code}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isChecked ? "bg-[#DDEAD5]/40 hover:bg-[#DDEAD5]/70" : "hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleBranch(b.branch_code)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{b.branch_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {b.city} · {b.department_code} · {b.branch_code}
                        </p>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  {isLoadingBranches ? "Chargement…" : "Aucune branche ne correspond à votre recherche"}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
            Raison du changement <span className="text-gray-400 font-normal normal-case">(optionnel mais recommandé)</span>
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : Décret présidentiel du 15 août 2025…" rows={2}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] resize-none" />
          <p className="text-xs text-gray-400 mt-1">
            Sera enregistré dans le journal d'audit avec votre identifiant.
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">Résumé</p>
          <p className="text-sm text-amber-900">
            <strong>{HOLIDAY_TYPE_LABELS[holidayType]}</strong> de portée{" "}
            <strong>{HOLIDAY_SCOPE_LABELS[scope].toLowerCase()}</strong> →{" "}
            <strong>{finalCount}</strong> branche{finalCount > 1 ? "s" : ""} concernée{finalCount > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50">
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={!canSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Application en cours…</>
          ) : (
            <><CheckCircle className="w-4 h-4" />Confirmer l'assignation</>
          )}
        </button>
      </div>
    </Modal>
  );
};

interface ScopeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const ScopeCard: React.FC<ScopeCardProps> = ({ icon, title, description, isSelected, onClick }) => (
  <button type="button" onClick={onClick}
    className={`text-left p-3 rounded-xl border-2 transition-all ${
      isSelected ? "border-[#2E7D32] bg-[#DDEAD5]/40 ring-2 ring-[#2E7D32]/20" : "border-gray-200 bg-white hover:border-gray-300"
    }`}>
    <div className={`mb-1.5 ${isSelected ? "text-[#2E7D32]" : "text-gray-400"}`}>{icon}</div>
    <p className={`text-sm font-semibold ${isSelected ? "text-[#1B5E20]" : "text-gray-700"}`}>{title}</p>
    <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
  </button>
);

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative">
    <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
    <div className="absolute right-0 top-5 hidden group-hover:block z-10 w-56 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg leading-relaxed">
      {text}
    </div>
  </div>
);

export default AssignBranchesModal;