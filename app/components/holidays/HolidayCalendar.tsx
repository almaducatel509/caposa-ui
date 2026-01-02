import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, MessageSquare, User, Search, Plus, Download, X, Edit2, Trash2 } from "lucide-react";
import PageHeader from "../header";
import { TbCalendarCog } from "react-icons/tb";
import EditHolidayModal from "./EditHolidayModal";
import DeleteHolidayModal from "./DeleteHolidayModal";

// ================= TYPES =================
interface Holiday {
  id: string;
  date: string;
  description: string;
  type: "ferie" | "local" | "interne" | "election" | "maintenance" | "autre";
  scope: "national" | "regional" | "branch" | "autre";
  branch_code?: string;
  comment?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface Branch {
  id: string;
  branch_name: string;
}

// ================= SAMPLE DATA =================
const sampleBranches: Branch[] = [
  { id: "001", branch_name: "Port-au-Prince" },
  { id: "002", branch_name: "Cap-Haïtien" },
  { id: "003", branch_name: "Les Cayes" },
  { id: "004", branch_name: "Gonaïves" },
];

const sampleHolidays: Holiday[] = [
  { 
    id: "1", 
    date: "2025-01-01", 
    description: "Jour de l'An", 
    type: "ferie", 
    scope: "national",
    comment: "Férié bancaire national",
    modified_by: "Admin Système"
  },
  { 
    id: "2", 
    date: "2025-01-07", 
    description: "Carnaval Local", 
    type: "local", 
    scope: "branch", 
    branch_code: "002",
    comment: "Événement culturel régional",
    modified_by: "Jean Pierre"
  },
  { 
    id: "3", 
    date: "2025-01-15", 
    description: "Réunion CA", 
    type: "interne", 
    scope: "national",
    comment: "Conseil d'administration trimestriel",
    modified_by: "Marie Dupont"
  },
  { 
    id: "4", 
    date: "2025-01-07", 
    description: "Maintenance Serveurs", 
    type: "maintenance", 
    scope: "national",
    comment: "Mise à jour infrastructure",
    modified_by: "IT Team"
  },
  { 
    id: "5", 
    date: "2025-01-20", 
    description: "Élections Locales", 
    type: "election", 
    scope: "regional",
    branch_code: "003"
  },
];

// ================= CONSTANTS =================
const typeLabels: Record<string, string> = {
  ferie: "Férié",
  local: "Local",
  interne: "Interne",
  election: "Élection",
  maintenance: "Maintenance",
  autre: "Autre",
};

const scopeLabels: Record<string, string> = {
  national: "National",
  regional: "Régional",
  branch: "Succursale",
  autre: "Autre",
};

const typeColors: Record<string, string> = {
  ferie: 'bg-emerald-600 text-white',
  local: 'bg-emerald-400 text-white',
  interne: 'bg-green-700 text-white',
  election: 'bg-blue-500 text-white',
  maintenance: 'bg-red-500 text-white',
  autre: 'bg-gray-500 text-white',
};

// ================= HELPER FUNCTIONS =================
const getDayPriorityColor = (holidays: Holiday[]): string => {
  if (holidays.length === 0) return 'bg-white hover:bg-gray-50';
  
  if (holidays.some(h => h.type === 'ferie' && h.scope === 'national')) {
    return 'bg-red-50 border-red-300 hover:bg-red-100';
  }
  
  if (holidays.some(h => h.type === 'election')) {
    return 'bg-blue-50 border-blue-300 hover:bg-blue-100';
  }
  
  if (holidays.some(h => h.type === 'local' || h.scope === 'branch')) {
    return 'bg-orange-50 border-orange-300 hover:bg-orange-100';
  }
  
  return 'bg-gray-50 border-gray-300 hover:bg-gray-100';
};

// ================= EVENT DETAIL CARD =================
interface EventDetailCardProps {
  holiday: Holiday;
  branch?: Branch;
  canEdit: boolean;
  onEdit: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
}

const EventDetailCard: React.FC<EventDetailCardProps> = ({ 
  holiday, 
  branch, 
  canEdit, 
  onEdit, 
  onDelete 
}) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
    {/* Header avec badges et boutons */}
    <div className="flex justify-between items-start mb-3">
      <div className="flex gap-2 flex-wrap">
        <span className={`${typeColors[holiday.type]} px-3 py-1 rounded-full text-xs font-semibold`}>
          {typeLabels[holiday.type]}
        </span>
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
          {scopeLabels[holiday.scope]}
        </span>
      </div>
      
      {/* Boutons toujours visibles si canEdit */}
      {/* {canEdit && ( */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(holiday)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-emerald-600 transition-colors"
            title="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(holiday)}
            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      {/* )} */}
    </div>

    {/* Content */}
    <h4 className="font-semibold text-base mb-3 text-gray-900">{holiday.description}</h4>
    
    {/* Details */}
    <div className="space-y-2 text-sm text-gray-600">
      {branch && (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-emerald-600 flex-shrink-0" />
          <span>{branch.branch_name}</span>
        </div>
      )}
      
      {holiday.comment && (
        <div className="flex items-start gap-2">
          <MessageSquare size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
          <span className="italic text-gray-700">"{holiday.comment}"</span>
        </div>
      )}
      
      {holiday.modified_by && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User size={12} className="flex-shrink-0" />
          <span>Modifié par {holiday.modified_by}</span>
        </div>
      )}
    </div>
  </div>
);

// ================= MAIN COMPONENT =================
export default function HolidayCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // User permissions (simulated)
  // const user = {
  //   role: 'directeur', // 'employe' | 'directeur' | 'admin'
  //   branch_code: '002'
  // };
// on mettera la restriction de edit dans bd
  // const canEditHoliday = (holiday: Holiday) => {
  //   if (user.role === 'admin') return true;
  //   if (user.role === 'directeur') {
  //     return holiday.scope === 'branch' && holiday.branch_code === user.branch_code;
  //   }
  //   return false;
  // };

  // const canAddHoliday = user.role === 'directeur' || user.role === 'admin';

  // Filtering
  const filteredHolidays = useMemo(() => {
    return sampleHolidays.filter((holiday) => {
      const matchSearch = !filterValue || 
        holiday.description.toLowerCase().includes(filterValue.toLowerCase());
      const matchType = selectedType === "all" || holiday.type === selectedType;
      const matchScope = selectedScope === "all" || holiday.scope === selectedScope;
      const matchBranch = selectedBranch === "all" || 
        holiday.scope === "national" || 
        holiday.branch_code === selectedBranch;

      return matchSearch && matchType && matchScope && matchBranch;
    });
  }, [filterValue, selectedType, selectedScope, selectedBranch]);

  // Calendar generation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
  };

  const days = generateCalendarDays();

  const holidaysForDate = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    return filteredHolidays.filter((h) => h.date === key);
  };

  const eventsToShow = selectedDay 
    ? holidaysForDate(selectedDay) 
    : filteredHolidays.slice(0, 10);

  // Handlers
  const handleCreate = () => {
    setSelectedHoliday(null);
    setIsEditMode(false);
    setShowCreateModal(true);
    setShowEditModal(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowDeleteModal(true);
  };

  const handleSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedHoliday(null);
    setIsEditMode(false);
    // TODO: Recharger les données
  };

  // ================= RENDER =================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <PageHeader 
              title="Gestion de calendrier" 
              subtitle="Gérez le calendrier et ses informations"
              icon={<TbCalendarCog className="text-5xl" />}
            />
    
            {/* {canAddHoliday && ( */}
              <button
                onClick={handleCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md whitespace-nowrap"
              >
                <Plus size={20} />
                <span>Ajouter un jour férié</span>
              </button>
            {/* )}   */}
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {filterValue && (
                <button
                  onClick={() => setFilterValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tous les types</option>
              <option value="ferie">Férié</option>
              <option value="local">Local</option>
              <option value="interne">Interne</option>
              <option value="election">Élection</option>
              <option value="maintenance">Maintenance</option>
              <option value="autre">Autre</option>
            </select>

            {/* Scope Filter */}
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Toutes les portées</option>
              <option value="national">National</option>
              <option value="regional">Régional</option>
              <option value="branch">Succursale</option>
            </select>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Toutes les succursales</option>
              {sampleBranches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold">{filteredHolidays.length}</span> événement(s) trouvé(s)
          </div>
        </div>

        {/* Calendar + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="text-gray-600" />
              </button>
              <h2 className="font-bold text-xl text-gray-900">
                {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="text-gray-600" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) =>
                day ? (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      aspect-square border rounded-lg p-2 transition-all
                      ${getDayPriorityColor(holidaysForDate(day))}
                      ${selectedDay?.toDateString() === day.toDateString() ? 'ring-2 ring-emerald-500' : ''}
                    `}
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {day.getDate()}
                    </div>
                    {holidaysForDate(day).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {holidaysForDate(day).slice(0, 3).map((h) => (
                          <div
                            key={h.id}
                            className={`h-1 flex-1 rounded-full ${typeColors[h.type].split(' ')[0]}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ) : (
                  <div key={idx} />
                )
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-700 mb-2">Légende</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
                  <span>Férié national</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                  <span>Élection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-50 border border-orange-300 rounded"></div>
                  <span>Exception locale</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                <Calendar size={20} className="text-emerald-600" />
                {selectedDay 
                  ? selectedDay.toLocaleDateString('fr-FR', { dateStyle: 'full' })
                  : 'Tous les événements'
                }
              </h3>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Voir tout
                </button>
              )}
            </div>

            {/* Event List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 ">
              {eventsToShow.length > 0 ? (
                eventsToShow.map((holiday) => (
                  <EventDetailCard
                    key={holiday.id}
                    holiday={holiday}
                    branch={sampleBranches.find(b => b.id === holiday.branch_code)}
                    // canEdit={canEditHoliday(holiday)}
                    onEdit={handleEdit}
                    onDelete={handleDelete} canEdit={false}                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aucun événement</p>
                  <p className="text-sm mt-1">
                    {selectedDay 
                      ? "Pas d'événement pour cette date" 
                      : "Aucun événement ne correspond aux filtres"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditHolidayModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setShowCreateModal(false);
            setSelectedHoliday(null);
            setIsEditMode(false);
          }}
          onSuccess={handleSuccess}
          holiday={selectedHoliday}
          isEditMode={isEditMode}
          mode={isEditMode ? "edit" : "create"}
        />
      )}

      {showDeleteModal && selectedHoliday && (
        <DeleteHolidayModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedHoliday(null);
          }}
          onSuccess={handleSuccess}
          holiday={selectedHoliday}
        />
      )}
    </div>
  );
}