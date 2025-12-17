import React from 'react';
import { Card, CardBody, Button, Avatar, Chip } from "@heroui/react";
import { FaEye, FaEdit, FaTrash, FaReceipt, FaCalendar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaVenusMars } from "react-icons/fa";

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
  
  // Récupérer le poste principal - vérifie d'abord posts_details, sinon affiche un message par défaut
  const primaryPost = employee.posts_details && employee.posts_details.length > 0
    ? (employee.posts_details[0].name || employee.posts_details[0].post_name || 'Poste non défini')
    : 'Aucun poste assigné';
  
  const branchName = employee.branch_details?.branch_name || 'Succursale non définie';
  
  // Utiliser les helpers de validation
  const status = getEmployeeStatus(employee);
  const genderLabel = formatGender(employee.gender);

  // Couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'success';
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

  // Couleur du badge genre
  const getGenderColor = (gender?: string) => {
    switch (gender?.toUpperCase()) {
      case 'M':
      case 'MALE':
        return 'bg-blue-100 text-blue-700';
      case 'F':
      case 'FEMALE':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <Card 
      className="h-full bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 rounded-2xl overflow-hidden group"
    >
      <CardBody className="p-0">
        {/* Header avec genre et status */}
        <div className="relative bg-linear-to-br from-green-50 to-blue-50 p-6 pb-16">
          <div className="flex justify-between items-start mb-4">
            {/* Badge Genre */}
            {employee.gender && (
              <div className={`flex items-center gap-1.5 ${getGenderColor(employee.gender)} backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm`}>
                <FaVenusMars className="text-sm" />
                <span className="text-xs font-semibold">{genderLabel}</span>
              </div>
            )}
            
            {/* Status */}
           <Chip 
            size="sm" 
            color={getStatusColor(status)}
            variant="flat"
            className="font-medium bg-green-200/70 text-green-700 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm"
          >
            {getStatusLabel(status)}
          </Chip>

          </div>

          {/* Avatar centré */}
          <div className="flex justify-center">
            <Avatar
              src={employee.photo_profil || undefined}
              alt={fullName}
              className="w-24 h-24 border-4 border-white shadow-lg ring-2 ring-green-100"
              showFallback
              name={fullName}
            />
          </div>
        </div>

        {/* Informations principales */}
        <div className="px-6 pt-4 pb-5 -mt-8 relative">
          {/* Nom et poste */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {fullName}
            </h3>
           
            {employee.posts_details?.length ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {employee.posts_details.map(post => (
                  <span
                    key={post.id}
                    className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700"
                  >
                    {post.post_name || post.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400">No post</span>
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
          <div className="h-px bg-gray-200 my-4"></div>

          {/* Action icons */}
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              onPress={() => onView(employee)}
              className="hover:bg-blue-50"
              title="Voir les détails"
            >
              <FaEye className="text-base" />
            </Button>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="warning"
              onPress={() => onEdit(employee)}
              className="hover:bg-orange-50"
              title="Modifier"
            >
              <FaEdit className="text-base" />
            </Button>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="secondary"
              onPress={() => onViewTransactions(employee)}
              className="hover:bg-purple-50"
              title="Voir les transactions"
            >
              <FaReceipt className="text-base" />
            </Button>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => onDelete(employee)}
              className="hover:bg-red-50"
              title="Supprimer"
            >
              <FaTrash className="text-base" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EmployeeCard;