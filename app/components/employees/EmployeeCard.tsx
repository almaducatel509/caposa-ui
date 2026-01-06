import React from 'react';
import { FaEye, FaEdit, FaTrash, FaReceipt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaVenusMars } from "react-icons/fa";
import { PiCheckFat, PiCheckFill, PiCheckSquareOffsetLight, PiUserCircleCheckFill } from "react-icons/pi";
import clsx from "clsx";


// Import des types et helpers depuis validations
import { EmployeeData, formatGender, getEmployeeStatus } from '@/app/components/employees/validations';

interface EmployeeCardProps {
  employee: EmployeeData;
  onView: (employee: EmployeeData) => void;
  onEdit: (employee: EmployeeData) => void;
  onDelete: (employee: EmployeeData) => void;
  onViewTransactions: (employee: EmployeeData) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onView,
  onEdit,
  onDelete,
  onViewTransactions,
}) => {
  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Sans nom';
  
 
  const branchName = employee.branch_details?.branch_name || 'Succursale non définie';
  
  // Utiliser les helpers de validation
  const status = getEmployeeStatus(employee);
  const genderLabel = formatGender(employee.gender);

  // Couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-200/70 text-green-700';
      case 'inactive': return 'bg-yellow-200/70 text-yellow-700';
      case 'suspended': return 'bg-red-200/70 text-red-700';
      default: return 'bg-green-200/70 text-green-700';
    }
  };

  // Libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return 'Actif';
    }
  };
  console.log("EMPLOYEE CARD DATA", employee);


  // // Couleur du badge genre
  // const getGenderColor = (gender?: string) => {
  //   switch (gender?.toUpperCase()) {
  //     case 'M':
  //     case 'MALE':
  //       return 'bg-blue-100 text-blue-700';
  //     case 'F':
  //     case 'FEMALE':
  //       return 'bg-pink-100 text-pink-700';
  //     default:
  //       return 'bg-purple-100 text-purple-700';
  //   }
  // };

  // Générer les initiales pour l'avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 rounded-2xl overflow-hidden group">
      <div className="p-0">
        {/* Header avec genre et status */}
        <div className="relative bg-linear-to-br from-green-50 to-blue-50  pb-16">
         {/* Avatar centré */}    


          <div className="flex justify-center">

            {employee.photo_profil ? (
              <img
                src={employee.photo_profil}
                alt={fullName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg ring-2 ring-green-100 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg ring-2 ring-green-100 bg-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(fullName)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="px-6 pt-4 pb-5 -mt-8 relative">
          {/* Nom et poste */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {fullName}
            </h3>
           
            {employee.posts_details && employee.posts_details.length > 0 ? (
              employee.posts_details.map((post) => (
                <span 
                  key={post.id}
                  className="capitalize px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  {post.name}
                </span>
              ))
            ) : (
              <p className="font-medium">Aucun poste assigné</p>
            )}

        </div>

          {/* Informations de contact */}
          <div className="space-y-2.5 mb-4">
            {employee.user?.email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaEnvelope className="text-gray-400 shrink-0" />
                <span className="truncate">{employee.user.email}</span>
              </div>
            )}
            
            {employee.phone_number && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaPhone className="text-gray-400 shrink-0" />
                <span>{employee.phone_number}</span>
              </div>
            )}
            
            {branchName && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                <span className="truncate">{branchName}</span>
              </div>
            )}
          </div>

          {/* Divider */}

          {/* Action icons */}
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onView(employee)}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              title="Voir les détails"
            >
              <FaEye className="text-base" />
            </button>
            
            <button
              onClick={() => onEdit(employee)}
              className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
              title="Modifier"
            >
              <FaEdit className="text-base" />
            </button>
            
            <button
              onClick={() => onViewTransactions(employee)}
              className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
              title="Voir les transactions"
            >
              <FaReceipt className="text-base" />
            </button>
            
            <button
              onClick={() => onDelete(employee)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Supprimer"
            >
              <FaTrash className="text-base" />
            </button>
            
            <button
             
              className={ "text-blue-600 hover:bg-blue-100 w-8 p-2 rounded-xl" }
              title="Active"
            >
              <PiCheckFat />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;