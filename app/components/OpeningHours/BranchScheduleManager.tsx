"use client";

import React, { useState, useMemo } from "react";
import { Search, Clock, Filter, X, Building2, MapPin, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { BranchData, DepartmentCode, OpeningHourDetail } from "./validations";
import { MOCK_BRANCHES } from "./mock";
import HaitiLocationSelector from "./HaitiLocationSelector";
import ScheduleForm from "./ScheduleForm";
import BranchScheduleDisplay from "./BranchScheduleDisplay";

function isCurrentlyOpen(details?: OpeningHourDetail): boolean {
  if (!details) return false;
  const now = new Date();
  const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const;
  const todayHours = details[dayKeys[now.getDay()] as keyof OpeningHourDetail] as string | null | undefined;
  if (!todayHours) return false;
  const [openStr, closeStr] = todayHours.split("-");
  if (!openStr || !closeStr) return false;
  const [oH, oM] = openStr.split(":").map(Number);
  const [cH, cM] = closeStr.split(":").map(Number);
  const now_m  = now.getHours() * 60 + now.getMinutes();
  return now_m >= oH * 60 + oM && now_m < cH * 60 + cM;
}

export default function BranchScheduleManager() {
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode | "">("");
  const [city, setCity]                     = useState("");
  const [searchText, setSearchText]         = useState("");
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [showForm, setShowForm]             = useState(false);

  const filteredBranches = useMemo(() =>
    MOCK_BRANCHES.filter((b: BranchData) => {
      if (b.status === "inactive") return false;
      const matchDept   = !departmentCode || b.department_code === departmentCode;
      const matchCity   = !city || b.city === city;
      const q           = searchText.toLowerCase();
      const matchSearch = !searchText || [b.branch_name, b.branch_address, b.city, b.branch_code]
        .some(f => f?.toLowerCase().includes(q));
      return matchDept && matchCity && matchSearch;
    }),
  [departmentCode, city, searchText]);

  const handleBranchSelect = async (branch: BranchData) => {
    setIsLoading(true);
    setSelectedBranch(null);
    setShowForm(false);
    await new Promise(r => setTimeout(r, 400));
    setSelectedBranch(branch);
    setShowForm(!branch.opening_hour_details);
    setIsLoading(false);
  };

  const handleBack   = () => { setSelectedBranch(null); setShowForm(false); };
  const handleClear  = () => { setDepartmentCode(""); setCity(""); setSearchText(""); };
  const handleSuccess = () => { setShowForm(false); if (selectedBranch) handleBranchSelect(selectedBranch); };

  const hasFilters = !!(departmentCode || city || searchText);

  return (
    <div>
      {/* Sub-header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDEAD5] text-[#1B5E20] rounded-full text-xs font-semibold mb-3">
          <Clock className="w-3 h-3" /> Gestion des horaires
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Succursales</h2>
        <p className="text-sm text-gray-500">
          Selectionnez une succursale pour consulter ou creer son horaire regulier.
        </p>
      </div>

      {/* List view */}
      {!selectedBranch && !isLoading && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Filtres de recherche</h3>
            </div>

            <HaitiLocationSelector
              departmentCode={departmentCode}
              city={city}
              onDepartmentChange={setDepartmentCode}
              onCityChange={setCity}
            />

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">OU</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" /> Recherche directe
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text"
                  placeholder="Nom, ville, adresse, code..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                />
                {searchText && (
                  <button onClick={() => setSearchText("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {hasFilters && (
              <div className="mt-4 flex justify-end">
                <button onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32] hover:underline">
                  <X className="w-3.5 h-3.5" /> Effacer les filtres
                </button>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-900">
              {filteredBranches.length} succursale(s) trouvee(s)
            </h3>
          </div>

          {/* Cards */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map((branch: BranchData) => {
              const open = isCurrentlyOpen(branch.opening_hour_details);
              return (
                <button key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 text-left
                             hover:border-[#2E7D32]/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1B5E20] transition-colors leading-tight">
                      {branch.branch_name}
                    </h3>
                    {branch.opening_hour_details ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ml-2 shrink-0 border
                        ${open ? "bg-[#DDEAD5] text-[#1B5E20] border-[#2E7D32]/20" : "bg-red-50 text-red-600 border-red-100"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-[#2E7D32]" : "bg-red-500"}`} />
                        {open ? "OUVERT" : "FERME"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ml-2 shrink-0 border bg-gray-100 text-gray-400 border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        INCONNU
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {branch.city}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mb-4">Code: {branch.branch_code}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border
                      ${branch.opening_hour_details
                        ? "bg-[#DDEAD5] text-[#1B5E20] border-[#2E7D32]/20"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                      {branch.opening_hour_details ? "Horaire configure" : "A configurer"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#2E7D32] group-hover:translate-x-0.5 transition-transform">
                      Voir details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredBranches.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 py-12 text-center text-gray-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucune succursale ne correspond a votre recherche.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Chargement...</p>
        </div>
      )}

      {/* Detail view */}
      {selectedBranch && !isLoading && (
        <div>
          <button onClick={handleBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2E7D32] hover:underline mb-5">
            <ArrowLeft className="w-4 h-4" /> Retour a la liste
          </button>

          {showForm ? (
            <ScheduleForm
              branchId={selectedBranch.id}
              branchName={selectedBranch.branch_name}
              onSuccess={handleSuccess}
              onCancel={handleBack}
            />
          ) : (
            <BranchScheduleDisplay branch={selectedBranch} />
          )}
        </div>
      )}
    </div>
  );
}