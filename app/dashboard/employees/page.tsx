// "use client";

// import React from 'react';
// import {
//   Card,
//   CardBody,
//   Chip,
//   Button,
//   Tooltip,
// } from "@nextui-org/react";
// import UserAvatar from '@/app/components/core/UserAvatar';
// import { FaEye, FaEdit, FaTrash, FaMoneyBillWave } from "react-icons/fa";
// import { getEmployeeStatus, EmployeeData } from '@/app/components/employees/validations';

// interface EmployeeCardProps {
//   employee: EmployeeData;
//   onView: (employee: EmployeeData) => void;
//   onEdit: (employee: EmployeeData) => void;
//   onDelete: (employee: EmployeeData) => void;
//   onViewTransactions: (employee: EmployeeData) => void;
// }

// const safeString = (value: any): string => {
//   if (value === null || value === undefined) return 'N/A';
//   if (typeof value === 'string') return value;
//   if (typeof value === 'number') return value.toString();
//   return 'N/A';
// };

// const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onView, onEdit, onDelete, onViewTransactions }) => {
//   const age = employee.date_of_birth 
//     ? new Date().getFullYear() - new Date(employee.date_of_birth).getFullYear()
//     : null;
//   const status = getEmployeeStatus(employee);

//   return (
//   <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300 min-h-[320px]">
//     <CardBody className="p-6 space-y-4 "> {/* ✅ Plus de padding et d'espace */}
//       {/* Header avec avatar - Plus d'espace */}
//       <div className="flex items-start gap-4">
//         <UserAvatar user={employee} size="lg" type="employee" />
//         <div className="min-w-0 flex-1">
//           <h3 className="font-semibold capitalize text-lg text-gray-800 truncate leading-relaxed">
//             {safeString(employee.first_name)} {safeString(employee.last_name)}
//           </h3>
//           <p className="text-sm text-gray-500 truncate mt-1 capitalize">
//             {safeString(employee.role || employee.user?.username || 'Employé')}
//           </p>
//           {age && (
//             <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
//               <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
//               {age} ans
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Divider pour séparer */}
//       <hr className="border-gray-100" />

//       {/* Informations principales - Mieux organisées */}
//       <div className="space-y-3">
//         <div className="grid grid-cols-1 gap-2 text-sm">
//           <div className="flex items-center gap-2">
//             <span className="text-gray-400 w-16">📧</span>
//             <span className=" text-gray-700 truncate">{safeString(employee.user?.email)}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-gray-400 w-16">📞</span>
//             <span className="text-gray-700">{safeString(employee.phone_number)}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-gray-400 w-16">📍</span>
//             <span className="capitalize text-gray-700 truncate">{safeString(employee.address)}</span>
//           </div>
//         </div>
//       </div>

    
      
//       {/* Footer avec statut et actions - Plus d'espace */}
//       <div className="flex justify-between items-center pt-3 border-t border-gray-100">
//         <Chip 
//           size="sm" 
//           color="success" 
//           variant="flat"
//           className="text-xs"
//         >
//           {status}
//         </Chip>
        
//         <div className="flex gap-1">
//           <Tooltip content="Voir profil">
//             <Button 
//               isIconOnly 
//               size="sm" 
//               variant="light" 
//               className="text-blue-600 hover:bg-blue-50"
//               onClick={() => onView(employee)}
//             >
//               <FaEye className="w-4 h-4" />
//             </Button>
//           </Tooltip>
//           <Tooltip content="Modifier">
//             <Button 
//               isIconOnly 
//               size="sm" 
//               variant="light" 
//               className="text-orange-600 hover:bg-orange-50"
//               onClick={() => onEdit(employee)}
//             >
//               <FaEdit className="w-4 h-4" />
//             </Button>
//           </Tooltip>
//           <Tooltip content="Supprimer">
//             <Button 
//               isIconOnly 
//               size="sm" 
//               variant="light" 
//               className="text-red-600 hover:bg-red-50"
//               onClick={() => onDelete(employee)}
//             >
//               <FaTrash className="w-4 h-4" />
//             </Button>
//           </Tooltip>
//           <Tooltip content="Transactions">
//             <Button 
//               isIconOnly 
//               size="sm" 
//               variant="light" 
//               className="text-green-600 hover:bg-green-50"
//               onClick={() => onViewTransactions(employee)}
//             >
//               <FaMoneyBillWave className="w-4 h-4" />
//             </Button>
//           </Tooltip>
//         </div>
//       </div>
//     </CardBody>
//   </Card>
// );
// };

// export default EmployeeCard;


import EmployeeGrid from "@/app/components/employees/EmployeeGrid"
export default function EmployeeCardProps() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create emp</div>
        <div className="bg-white mt-12">
            <EmployeeGrid />
        </div>   
     </main>

    )
}
