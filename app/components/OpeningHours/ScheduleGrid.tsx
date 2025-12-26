"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, Mail, MapPin, Phone, Printer, Search, X } from "lucide-react";
import { CITIES_BY_DEPARTMENT, HAITI_DEPARTMENTS } from "@/app/data/haitiLocations";
import { HaitiLocationSelector } from "../members/HaitiLocationSelector";

// ================= TYPES =================
type DepartmentCode = "OUEST" | "SUDEST" | "NORD" | "NORDEST" | "ARTIBONITE" | "CENTRE" | "SUD" | "GRAND_ANSE" | "NORD_OUEST" | "NIPPES";

interface OpeningHour {
  id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday?: string;
  sunday?: string;
}

interface BranchData {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  status: "active" | "inactive";
  department_code: DepartmentCode;
  city: string;
  opening_hour?: string;
  opening_hour_details?: OpeningHour;
}

const getCitiesByDepartment = (code: DepartmentCode) => CITIES_BY_DEPARTMENT[code] || [];

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
      monday: "08:00 - 17:00",
      tuesday: "08:00 - 17:00",
      wednesday: "08:00 - 17:00",
      thursday: "08:00 - 17:00",
      friday: "08:00 - 16:00",
      saturday: "09:00 - 13:00",
      sunday: "",
    },
  },
  {
    id: "2",
    branch_code: "CAP001",
    branch_name: "Cap-Haïtien Nord",
    branch_address: "45 Boulevard du Cap, Cap-Haïtien",
    branch_phone_number: "(509) 2262-5678",
    branch_email: "cap.nord@bank.ht",
    status: "inactive",
    department_code: "NORD",
    city: "Cap-Haïtien",
  },
  {
    id: "3",
    branch_code: "PET001",
    branch_name: "Pétion-Ville Plaza",
    branch_address: "12 Place Boyer, Pétion-Ville",
    branch_phone_number: "(509) 2257-9999",
    branch_email: "petion.plaza@bank.ht",
    status: "inactive",
    department_code: "OUEST",
    city: "Pétion-Ville",
  },
];
interface ScheduleFormProps { 
  branchId: string; 
  branchName: string; 
  onSuccess: () => void; 
  onCancel: () => void; 
}
 const ScheduleForm: React.FC<ScheduleFormProps> = ({ branchId, branchName, onSuccess, onCancel }) => {
   const [formData, setFormData] = useState({ 
    monday: "08:00 - 17:00", 
    tuesday: "08:00 - 17:00", 
    wednesday: "08:00 - 17:00", 
    thursday: "08:00 - 17:00", 
    friday: "08:00 - 17:00", 
    saturday: "", sunday: "",
   });
   const [isSubmitting, setIsSubmitting] = useState(false);
   
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // 🔌 API CALL (À REMPLACER)
    try {
      // await fetch(`/api/branches/${branchId}/opening-hours`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Creating schedule for branch:", branchId, formData);
      
      alert("✅ Horaire régulier créé avec succès !");
      onSuccess();
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert("❌ Erreur lors de la création de l'horaire");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCreate = async () => {
    setLoading(true);
     try {
    await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Creating schedule for branch:", branchId, formData);
        
        alert("✅ Horaire régulier créé avec succès !");
        onSuccess();
      } catch (error) {
        console.error("Error creating schedule:", error);
        alert("❌ Erreur lors de la création de l'horaire");
      } finally {
        setIsSubmitting(false);
      }
      setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 p-6">
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Créer un horaire régulier</h3>
            <p className="text-sm text-gray-600 mt-1">
              Aucun horaire régulier n'a encore été défini pour <strong>{branchName}</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Créez un horaire pour activer cette succursale.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {daysOfWeek.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-28 font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={formData[key as keyof typeof formData]}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              placeholder="08:00 - 17:00 ou laissez vide si fermé"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {formData[key as keyof typeof formData] && (
              <button
                onClick={() => setFormData({ ...formData, [key]: "" })}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Marquer comme fermé"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Création en cours..." : "✓ Créer l'horaire régulier"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

// ================= BRANCH SCHEDULE DISPLAY =================
interface BranchScheduleDisplayProps {
  branch: BranchData;
}

const BranchScheduleDisplay: React.FC<BranchScheduleDisplayProps> = ({ branch }) => {
  const schedule = branch.opening_hour_details;
  const departmentName = HAITI_DEPARTMENTS.find(d => d.code === branch.department_code)?.name || "N/A";

  const daysOfWeek = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">{branch.branch_name}</h3>
            <p className="text-emerald-100 text-sm">Code: {branch.branch_code}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`
              px-3 py-1 rounded-full text-xs font-semibold
              ${branch.status === "active" 
                ? "bg-white/20 backdrop-blur-sm text-white" 
                : "bg-white/10 text-emerald-200"}
            `}>
              {branch.status === "active" ? "✓ Ouverte" : "○ Inactive"}
            </span>
            <button
              onClick={handlePrint}
              className="px-4 py-1 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Printer size={14} />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 m-6 rounded">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-emerald-900">Horaire régulier configuré</p>
            <p className="text-sm text-emerald-700 mt-1">
              Cette succursale possède déjà un horaire régulier. Vous pouvez consulter les horaires ci-dessous.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-200 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-gray-900">{branch.branch_address}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {branch.city}, Département {departmentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="text-emerald-600 flex-shrink-0" size={18} />
          <a href={`tel:${branch.branch_phone_number}`} className="text-sm text-gray-900 hover:text-emerald-600 transition-colors">
            {branch.branch_phone_number}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="text-emerald-600 flex-shrink-0" size={18} />
          <a href={`mailto:${branch.branch_email}`} className="text-sm text-gray-900 hover:text-emerald-600 transition-colors">
            {branch.branch_email}
          </a>
        </div>
      </div>

      {/* Schedule */}
      <div className="p-6">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
          <Clock className="text-emerald-600" size={20} />
          Horaires d'ouverture
        </h4>

        <div className="space-y-2">
          {daysOfWeek.map(({ key, label }) => {
            const hours = schedule?.[key as keyof OpeningHour];
            return (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="font-medium text-gray-700">{label}</span>
                <span className={`text-sm ${hours ? "text-gray-900 font-semibold" : "text-gray-400 italic"}`}>
                  {hours || "Fermé"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BranchList = ({ branches, onSelect }: { branches: BranchData[]; onSelect: (b: BranchData) => void }) => {
  if (branches.length === 0) return <div className="p-6 bg-white rounded-xl border">Aucune branche trouvée</div>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {branches.map(b => (
        <button key={b.id} onClick={() => onSelect(b)} className="bg-white p-4 border rounded-lg hover:border-emerald-500">
          <h3 className="font-bold">{b.branch_name}</h3>
          <p className="text-sm text-gray-500">{b.city}</p>
          <span className={`text-xs px-2 py-1 rounded ${b.opening_hour_details ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {b.opening_hour_details ? "Horaire défini" : "À configurer"}
          </span>
        </button>
      ))}
    </div>
  );
};

const BranchSelector = ({
  departmentCode,
  city,
  onDepartmentChange,
  onCityChange,
  searchText,
  onSearchChange,
}: {
  departmentCode: DepartmentCode | "";
  city: string;
  onDepartmentChange: (c: DepartmentCode | "") => void;
  onCityChange: (c: string) => void;
  searchText: string;
  onSearchChange: (s: string) => void;
}) => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (departmentCode) {
      const list = getCitiesByDepartment(departmentCode);
      setCities(list);
      if (city && !list.includes(city)) onCityChange("");
    } else {
      setCities([]);
      onCityChange("");
    }
  }, [departmentCode, city]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
        <select
          value={departmentCode}
          onChange={(e) => onDepartmentChange(e.target.value as DepartmentCode | "")}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        >
          <option value="">Sélectionnez un département</option>
          {HAITI_DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>{d.name}</option>
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
          <option value="">{departmentCode ? "Sélectionnez une ville" : "Choisissez d'abord un département"}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
export default function BranchScheduleManager() {
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode | "">("");
  const [city, setCity] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filteredBranches = useMemo(() => {
    return SAMPLE_BRANCHES.filter((branch) => {
      const matchDept = !departmentCode || branch.department_code === departmentCode;
      const matchCity = !city || branch.city === city;
      const searchLower = searchText.toLowerCase();
      const matchSearch = !searchText || [
        branch.branch_name,
        branch.branch_address,
        branch.city,
        branch.branch_code,
      ].some(field => field?.toLowerCase().includes(searchLower));

      return matchDept && matchCity && matchSearch;
    });
  }, [departmentCode, city, searchText]);

  const handleBranchSelect = async (branch: BranchData) => {
    setIsLoading(true);
    setSelectedBranch(null);
    setShowForm(false);

    // 🔌 API: await fetch(`/api/branches/${branch.id}/opening-hours`)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSelectedBranch(branch);
    setShowForm(!branch.opening_hour_details);
    setIsLoading(false);
  };

  const handleClearFilters = () => {
    setDepartmentCode("");
    setCity("");
    setSearchText("");
    setSelectedBranch(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (selectedBranch) handleBranchSelect(selectedBranch);
  };

  const hasActiveFilters = departmentCode || city || searchText;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Clock className="text-emerald-600" size={32} />
            </div>
            Gestion des Horaires de Succursale
          </h1>
          <p className="text-gray-600 text-lg">
            Sélectionnez une succursale pour consulter ou créer son horaire régulier
          </p>
        </div>

        {!selectedBranch && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sélectionnez une succursale</h3>
              <HaitiLocationSelector
                departmentCode={departmentCode}
                city={city}
                onDepartmentChange={setDepartmentCode}
                onCityChange={setCity}
              />
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium px-2">OU</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche directe</label>
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
                  <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button onClick={handleClearFilters} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
                  <X size={16} />
                  Effacer filtres
                </button>
              </div>
            )}
          </div>
        )}

        {!selectedBranch && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-emerald-600" size={24} />
              {filteredBranches.length} succursale(s)
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredBranches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className="bg-white rounded-lg border-2 border-gray-200 hover:border-emerald-500 p-4 text-left transition-all hover:shadow-md"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{branch.branch_name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <MapPin size={14} />
                    {branch.city}
                  </p>
                  <p className="text-xs text-gray-500">Code: {branch.branch_code}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      branch.opening_hour_details ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {branch.opening_hour_details ? "✓ Horaire défini" : "○ À configurer"}
                    </span>
                    <span className="text-emerald-600 text-sm font-medium">Sélectionner →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        )}

        {selectedBranch && !isLoading && (
          <div>
            <button onClick={() => { setSelectedBranch(null); setShowForm(false); }} className="mb-4 text-emerald-600 hover:text-emerald-700 font-medium">
              ← Retour
            </button>

            {showForm ? (
              <ScheduleForm
                branchId={selectedBranch.id}
                branchName={selectedBranch.branch_name}
                onSuccess={handleFormSuccess}
                onCancel={() => { setSelectedBranch(null); setShowForm(false); }}
              />
            ) : (
              <BranchScheduleDisplay branch={selectedBranch} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
