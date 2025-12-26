"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, Phone, Mail, Clock, X } from "lucide-react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

// ================= TYPES (Matching your validation) =================
type DepartmentCode = "OUEST" | "NORD" | "SUD" | "ARTIBONITE" | "CENTRE" | "GRAND_ANSE" | "NIPPES" | "NORDEST" | "NORD_OUEST" | "SUDEST";

interface OpeningHour {
  id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday?: string | null;
  sunday?: string | null;
}

interface BranchData {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  status: "active" | "inactive";
  opening_hour?: string; // UUID reference
  opening_hour_details?: OpeningHour; // Populated by API
  
  // Location fields (you'll need to add these to Zod schema)
  department_code?: DepartmentCode;
  city?: string;
}

// ================= HAITI LOCATIONS DATA =================
// Import from your actual haitiLocations file
const HAITI_DEPARTMENTS = [
  { code: "OUEST" as DepartmentCode, name: "Ouest" },
  { code: "NORD" as DepartmentCode, name: "Nord" },
  { code: "SUD" as DepartmentCode, name: "Sud" },
  { code: "ARTIBONITE" as DepartmentCode, name: "Artibonite" },
  { code: "CENTRE" as DepartmentCode, name: "Centre" },
  { code: "GRAND_ANSE" as DepartmentCode, name: "Grand'Anse" },
  { code: "NIPPES" as DepartmentCode, name: "Nippes" },
  { code: "NORDEST" as DepartmentCode, name: "Nord-Est" },
  { code: "NORD_OUEST" as DepartmentCode, name: "Nord-Ouest" },
  { code: "SUDEST" as DepartmentCode, name: "Sud-Est" },
];

const getCitiesByDepartment = (code: DepartmentCode): string[] => {
  const citiesMap: Record<DepartmentCode, string[]> = {
    OUEST: ["Port-au-Prince", "Pétion-Ville", "Carrefour", "Delmas", "Croix-des-Bouquets"],
    NORD: ["Cap-Haïtien", "Quartier-Morin", "Limonade", "Acul-du-Nord"],
    SUD: ["Les Cayes", "Port-Salut", "Aquin", "Chardonnières"],
    ARTIBONITE: ["Gonaïves", "Saint-Marc", "Dessalines", "Petite-Rivière-de-l'Artibonite"],
    CENTRE: ["Hinche", "Mirebalais", "Lascahobas", "Thomonde"],
    GRAND_ANSE: ["Jérémie", "Dame-Marie", "Corail", "Pestel"],
    NIPPES: ["Miragoâne", "Petit-Goâve", "Anse-à-Veau"],
    NORDEST: ["Fort-Liberté", "Trou-du-Nord", "Ouanaminthe"],
    NORD_OUEST: ["Port-de-Paix", "Saint-Louis-du-Nord", "Anse-à-Foleur"],
    SUDEST: ["Jacmel", "Marigot", "Cayes-Jacmel", "Bainet"],
  };
  return citiesMap[code] || [];
};

// ================= SAMPLE DATA (Remove when API ready) =================
const SAMPLE_BRANCHES: BranchData[] = [
  {
    id: "1",
    branch_code: "PAP001",
    branch_name: "Port-au-Prince Centre",
    branch_address: "123 Rue Pavée, Port-au-Prince",
    branch_phone_number: "(509) 2222-1234",
    branch_email: "pap.centre@bank.ht",
    status: "active",
    department_code: "OUEST",
    city: "Port-au-Prince",
    opening_hour: "sch1",
    opening_hour_details: {
      id: "sch1",
      monday: "8h00 - 16h00",
      tuesday: "8h00 - 16h00",
      wednesday: "8h00 - 16h00",
      thursday: "8h00 - 16h00",
      friday: "8h00 - 15h00",
      saturday: "9h00 - 12h00",
      sunday: null,
    },
  },
  {
    id: "2",
    branch_code: "CAP001",
    branch_name: "Cap-Haïtien Nord",
    branch_address: "45 Boulevard du Cap, Cap-Haïtien",
    branch_phone_number: "(509) 2262-5678",
    branch_email: "cap.nord@bank.ht",
    status: "active",
    department_code: "NORD",
    city: "Cap-Haïtien",
    opening_hour: "sch2",
    opening_hour_details: {
      id: "sch2",
      monday: "8h30 - 15h30",
      tuesday: "8h30 - 15h30",
      wednesday: "8h30 - 15h30",
      thursday: "8h30 - 15h30",
      friday: "8h30 - 15h00",
      saturday: null,
      sunday: null,
    },
  },
  {
    id: "3",
    branch_code: "PET001",
    branch_name: "Pétion-Ville Plaza",
    branch_address: "12 Place Boyer, Pétion-Ville",
    branch_phone_number: "(509) 2257-9999",
    branch_email: "petion.plaza@bank.ht",
    status: "active",
    department_code: "OUEST",
    city: "Pétion-Ville",
    opening_hour: "sch1",
    opening_hour_details: {
      id: "sch1",
      monday: "8h00 - 16h00",
      tuesday: "8h00 - 16h00",
      wednesday: "8h00 - 16h00",
      thursday: "8h00 - 16h00",
      friday: "8h00 - 15h00",
      saturday: "9h00 - 12h00",
      sunday: null,
    },
  },
];

// ================= HAITI LOCATION SELECTOR =================
interface HaitiLocationSelectorProps {
  departmentCode: DepartmentCode | "";
  city: string;
  onDepartmentChange: (code: DepartmentCode | "") => void;
  onCityChange: (city: string) => void;
}

const HaitiLocationSelector: React.FC<HaitiLocationSelectorProps> = ({
  departmentCode,
  city,
  onDepartmentChange,
  onCityChange,
}) => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (departmentCode) {
      const list = getCitiesByDepartment(departmentCode as DepartmentCode);
      setCities(list);
      if (city && !list.includes(city)) onCityChange("");
    } else {
      setCities([]);
      onCityChange("");
    }
  }, [departmentCode, city, onCityChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Département
        </label>
        <select
          value={departmentCode}
          onChange={(e) => onDepartmentChange(e.target.value as DepartmentCode | "")}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        >
          <option value="">Sélectionnez un département</option>
          {HAITI_DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!departmentCode}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
        >
          <option value="">
            {departmentCode ? "Sélectionnez une ville" : "Choisissez d'abord un département"}
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ================= BRANCH SCHEDULE CARD =================
const BranchScheduleCard = ({ branch }: { branch: BranchData }) => {
  const schedule = branch.opening_hour_details;

  const daysOfWeek = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  const departmentName = HAITI_DEPARTMENTS.find(d => d.code === branch.department_code)?.name || "N/A";

  const handlePrinter = () =>{
    console.log("need to print")
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">{branch.branch_name}</h3>
            <span className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${branch.status === "active" 
                  ? "bg-white/20 backdrop-blur-sm text-white" 
                  : "bg-white/10 text-emerald-200"}
              `}>
                {branch.status === "active" ? "✓ Ouverte" : "○ Inactive"}
            </span>
          </div>
          <button  
            onClick={handlePrinter}
            className="
            px-4 py-1 rounded-full text-xs font-semibold
          bg-white/10 text-white
            transition 
            delay-150 
            duration-300 
            ease-in-out 
            hover:-translate-y-1 
            hover:scale-110 
            hover:bg-white/10 drop-shadow-md ...">
            Imprimer 
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-200 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-gray-900">{branch.branch_address}</p>
            {branch.city && (
              <p className="text-xs text-gray-500 mt-0.5">
                {branch.city}, Département {departmentName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="text-emerald-600 flex-shrink-0" size={18} />
          <a 
            href={`tel:${branch.branch_phone_number}`} 
            className="text-sm text-gray-900 hover:text-emerald-600 transition-colors"
          >
            {branch.branch_phone_number}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="text-emerald-600 flex-shrink-0" size={18} />
          <a 
            href={`mailto:${branch.branch_email}`} 
            className="text-sm text-gray-900 hover:text-emerald-600 transition-colors"
          >
            {branch.branch_email}
          </a>
        </div>
      </div>

      {/* Schedule */}
      {schedule ? (
        <div className="p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
            <Clock className="text-emerald-600" size={20} />
            Horaires d'ouverture
          </h4>

          <div className="space-y-2">
            {daysOfWeek.map(({ key, label }) => {
              const hours = schedule[key as keyof OpeningHour];
              return (
                <div
                  key={key}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className={`text-sm ${hours ? "text-gray-900 font-semibold" : "text-gray-400 italic"}`}>
                    {hours || "Fermé"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <Clock className="mx-auto mb-2 opacity-30" size={32} />
          <p className="text-sm">Horaires non définis</p>
        </div>
      )}
    </div>
  );
};

// ================= MAIN COMPONENT =================
interface BranchScheduleFinderProps {
  branches?: BranchData[]; // Make it optional, will use SAMPLE_BRANCHES if not provided
}

export default function BranchScheduleFinder({ branches = SAMPLE_BRANCHES }: BranchScheduleFinderProps) {
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode | "">("");
  const [city, setCity] = useState("");
  const [searchText, setSearchText] = useState("");
  
const dataToDisplay =
  branches && branches.length > 0 ? branches : SAMPLE_BRANCHES;

  //avec api
  // Filtering logic
  // const filteredBranches = useMemo(() => {
  //   return branches.filter((branch) => {
  //     // Location filters
  //     const matchDept = !departmentCode || branch.department_code === departmentCode;
  //     const matchCity = !city || branch.city === city;
      
  //     // Text search (searches in name, address, city, code)
  //     const searchLower = searchText.toLowerCase();
  //     const matchSearch = !searchText || [
  //       branch.branch_name,
  //       branch.branch_address,
  //       branch.city,
  //       branch.branch_code,
  //     ].some(field => field?.toLowerCase().includes(searchLower));

  //     return matchDept && matchCity && matchSearch;
  //   });
  // }, [branches, departmentCode, city, searchText]);
//pout afficher tout
  // const filteredBranches = useMemo(() => {
//   return dataToDisplay;
// }, [dataToDisplay]);

//sans api
const filteredBranches = useMemo(() => {
  return dataToDisplay.filter((branch) => {
    const matchDept =
      !departmentCode || branch.department_code === departmentCode;

    const matchCity =
      !city || branch.city === city;

    const searchLower = searchText.toLowerCase();
    const matchSearch =
      !searchText ||
      [
        branch.branch_name,
        branch.branch_address,
        branch.city,
        branch.branch_code,
      ].some(field =>
        field?.toLowerCase().includes(searchLower)
      );

    return matchDept && matchCity && matchSearch;
  });
}, [dataToDisplay, departmentCode, city, searchText]);

  const handleClearFilters = () => {
    setDepartmentCode("");
    setCity("");
    setSearchText("");
  };
 
const hasActiveFilters =
  departmentCode !== "" || city !== "" || searchText.trim() !== "";

  // const hasActiveFilters = departmentCode || city || searchText;
console.log("DATA TO DISPLAY:", dataToDisplay);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Clock className="text-emerald-600" size={32} />
            </div>
            Trouver l'horaire d'une branche
          </h1>
          <p className="text-gray-600 text-lg">
            Sélectionnez le département et la ville, ou recherchez directement
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {/* Location Selectors */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Étape 1 : Sélectionnez le département
            </h3>
            <HaitiLocationSelector
              departmentCode={departmentCode}
              city={city}
              onDepartmentChange={setDepartmentCode}
              onCityChange={setCity}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium px-2">OU</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Direct Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche directe
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Nom de branche, ville, adresse, code..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
              >
                <X size={16} />
                Effacer tous les filtres
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {/* Results Section */}
      <div className="mt-8">

        {/* 1️⃣ AVANT FILTRE */}
        {!hasActiveFilters && (
          <div className="text-center text-gray-600 mt-8">
            <HiOutlineMagnifyingGlass  className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-semibold">
              Trouvez votre succursale pour consulter les horaires d’ouverture.
            </p>
            <p className="mt-2 text-sm">
              Sélectionnez un département et une ville, ou recherchez directement par nom,
              adresse ou code.
            </p>
          </div>
        )}

        {/* 2️⃣ FILTRÉ MAIS AUCUN RÉSULTAT */}
        {hasActiveFilters && filteredBranches.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune branche trouvée
            </h3>
            <p className="text-gray-600">
              Aucune branche ne correspond à votre recherche
            </p>
          </div>
        )}

        {/* 3️⃣ FILTRÉ AVEC RÉSULTATS */}
        {hasActiveFilters && filteredBranches.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {filteredBranches.length} branche(s) trouvée(s)
            </h2>

            {filteredBranches.map((branch) => (
              <BranchScheduleCard key={branch.id} branch={branch} />
            ))}
          </div>
        )}
      </div>

      </div>
    </div>
  );
}