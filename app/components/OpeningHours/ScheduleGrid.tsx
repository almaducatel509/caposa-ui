"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, Phone, Mail, Clock, X, Printer, AlertCircle, CheckCircle, Building2, Calendar, Filter } from "lucide-react";

// ================= TYPES =================
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
  department_code: DepartmentCode;
  city: string;
  opening_hour?: string;
  opening_hour_details?: OpeningHour;
}

// ================= HAITI LOCATIONS =================
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
    OUEST: ["Port-au-Prince", "Pétion-Ville", "Carrefour", "Delmas"],
    NORD: ["Cap-Haïtien", "Quartier-Morin", "Limonade"],
    SUD: ["Les Cayes", "Port-Salut", "Aquin"],
    ARTIBONITE: ["Gonaïves", "Saint-Marc", "Dessalines"],
    CENTRE: ["Hinche", "Mirebalais", "Lascahobas"],
    GRAND_ANSE: ["Jérémie", "Dame-Marie", "Corail"],
    NIPPES: ["Miragoâne", "Petit-Goâve", "Anse-à-Veau"],
    NORDEST: ["Fort-Liberté", "Trou-du-Nord", "Ouanaminthe"],
    NORD_OUEST: ["Port-de-Paix", "Saint-Louis-du-Nord"],
    SUDEST: ["Jacmel", "Marigot", "Cayes-Jacmel"],
  };
  return citiesMap[code] || [];
};

// ================= SAMPLE DATA =================
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

// ================= SCHEDULE FORM COMPONENT =================
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
    saturday: "",
    sunday: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
          <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-lg text-gray-900">Créer un horaire régulier</h3>
            <p className="text-sm text-gray-700 mt-1">
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
            <label className="w-28 font-semibold text-gray-700">{label}</label>
            <input
              type="text"
              value={formData[key as keyof typeof formData]}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              placeholder="08:00 - 17:00 ou laissez vide si fermé"
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            {formData[key as keyof typeof formData] && (
              <button
                onClick={() => setFormData({ ...formData, [key]: "" })}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
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
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Création en cours..." : "✓ Créer l'horaire régulier"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">{branch.branch_name}</h3>
            <p className="text-blue-100 text-sm flex items-center gap-2">
              <Building2 size={14} />
              Code: {branch.branch_code}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`
              px-3 py-1.5 rounded-full text-xs font-bold
              ${branch.status === "active" 
                ? "bg-green-500 text-white shadow-md" 
                : "bg-white/20 text-blue-100"}
            `}>
              {branch.status === "active" ? "✓ Active" : "○ Inactive"}
            </span>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <Printer size={14} />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-green-900">Horaire régulier configuré</p>
            <p className="text-sm text-green-700 mt-1">
              Cette succursale possède un horaire régulier. Consultez les horaires ci-dessous.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-200 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{branch.branch_address}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {branch.city}, Département {departmentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Phone className="text-blue-600" size={18} />
          </div>
          <a href={`tel:${branch.branch_phone_number}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
            {branch.branch_phone_number}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="text-blue-600" size={18} />
          </div>
          <a href={`mailto:${branch.branch_email}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
            {branch.branch_email}
          </a>
        </div>
      </div>

      {/* Schedule */}
      <div className="p-6">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
          <Clock className="text-blue-600" size={20} />
          Horaires d'ouverture
        </h4>

        <div className="space-y-2">
          {daysOfWeek.map(({ key, label }) => {
            const hours = schedule?.[key as keyof OpeningHour];
            return (
              <div key={key} className="flex justify-between items-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-700">{label}</span>
                <span className={`text-sm font-medium ${hours ? "text-gray-900 bg-blue-100 px-3 py-1 rounded-full" : "text-gray-400 italic"}`}>
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

// ================= LOCATION SELECTOR =================
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Département</label>
        <select
          value={departmentCode}
          onChange={(e) => onDepartmentChange(e.target.value as DepartmentCode | "")}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors font-medium"
        >
          <option value="">📍 Tous les départements</option>
          {HAITI_DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!departmentCode}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white transition-colors font-medium"
        >
          <option value="">{departmentCode ? "🏙️ Toutes les villes" : "Choisissez d'abord un département"}</option>
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

  // Stats
  const stats = useMemo(() => {
    const total = SAMPLE_BRANCHES.length;
    const withSchedule = SAMPLE_BRANCHES.filter(b => b.opening_hour_details).length;
    const active = SAMPLE_BRANCHES.filter(b => b.status === "active").length;
    return { total, withSchedule, active, pending: total - withSchedule };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
       

        {!selectedBranch && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Filter size={16} />
                Filtres de recherche
              </h3>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Search size={16} />
                Recherche directe
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Nom de branche, ville, adresse, code..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                {searchText && (
                  <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
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
              <Building2 className="text-blue-600" size={24} />
              {filteredBranches.length} succursale(s) trouvée(s)
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredBranches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 p-5 text-left transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{branch.branch_name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      branch.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {branch.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                    <MapPin size={14} />
                    {branch.city}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mb-3">Code: {branch.branch_code}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      branch.opening_hour_details ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {branch.opening_hour_details ? "✓ Horaire configuré" : "⏳ À configurer"}
                    </span>
                    <span className="text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Voir détails →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement...</p>
          </div>
        )}

        {selectedBranch && !isLoading && (
          <div>
            <button 
              onClick={() => { setSelectedBranch(null); setShowForm(false); }} 
              className="mb-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              ← Retour à la liste
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