import React from 'react';
import { Eye, Edit, Trash2, Receipt, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { EmployeeData, formatGender, getEmployeeStatus } from '@/app/components/employees/validations';

interface EmployeeCardProps {
  employee: EmployeeData;
  onView:              (e: EmployeeData) => void;
  onEdit:              (e: EmployeeData) => void;
  onDelete:            (e: EmployeeData) => void;
  onViewTransactions:  (e: EmployeeData) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Actif' },
  inactive:  { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Inactif' },
  suspended: { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Suspendu' },
};

// ─── Component ─────────────────────────────────────────────────────────────────
const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee, onView, onEdit, onDelete, onViewTransactions,
}) => {
  const fullName   = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Sans nom';
  const branchName = employee.branch_details?.branch_name ?? 'Succursale non définie';
  const status     = getEmployeeStatus(employee);
  const statusCfg  = STATUS_CFG[status] ?? STATUS_CFG['active'];

  const ACTIONS = [
    { icon: Eye,        label: 'Voir',          color: 'hover:bg-blue-50  text-blue-600',   onClick: () => onView(employee) },
    { icon: Edit,       label: 'Modifier',      color: 'hover:bg-[#DDEAD5] text-[#2E7D32]', onClick: () => onEdit(employee) },
    { icon: Receipt,    label: 'Transactions',  color: 'hover:bg-purple-50 text-purple-600', onClick: () => onViewTransactions(employee) },
    { icon: Trash2,     label: 'Supprimer',     color: 'hover:bg-red-50   text-red-600',    onClick: () => onDelete(employee) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#2E7D32]/30 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">

      {/* ── Avatar header ── */}
      <div className="bg-gradient-to-br from-[#F9F9F6] to-[#DDEAD5]/30 pt-6 pb-10 flex flex-col items-center gap-3 relative">
        {/* Badge statut */}
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>

        {/* Avatar */}
        {employee.photo_profil ? (
          <img
            src={employee.photo_profil}
            alt={fullName}
            className="w-20 h-20 rounded-full border-4 border-white shadow-md ring-2 ring-[#DDEAD5] object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md ring-2 ring-[#DDEAD5] bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{getInitials(fullName)}</span>
          </div>
        )}
      </div>

      {/* ── Infos principales ── */}
      <div className="px-5 pb-4 -mt-6 flex flex-col flex-1">

        {/* Nom + postes */}
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">{fullName}</h3>
          <div className="flex flex-wrap justify-center gap-1">
            {employee.posts_details && employee.posts_details.length > 0 ? (
              employee.posts_details.map(post => (
                <span
                  key={post.id}
                  className="px-2.5 py-0.5 text-xs rounded-lg bg-[#DDEAD5] text-[#1B5E20] font-medium capitalize"
                >
                  {post.name}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-0.5 text-xs rounded-lg bg-gray-100 text-gray-500">
                Aucun poste assigné
              </span>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2 mb-4 flex-1">
          {employee.user?.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{employee.user.email}</span>
            </div>
          )}
          {employee.phone_number && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{employee.phone_number}</span>
            </div>
          )}
          {branchName && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{branchName}</span>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-center gap-1 pt-3 border-t border-gray-100">
          {ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={a.onClick}
              title={a.label}
              className={`p-2 rounded-xl transition-colors ${a.color}`}
            >
              <a.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;