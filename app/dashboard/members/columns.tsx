import React from "react";
import { Tooltip, Chip, User, Badge } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa";

export type Member = {
  first_name: string;
  last_name: string;
  email: string;
  photo_url: string;
  current_balance: string;
  status: string;
};

export const columns = [
  {
    key: "first_name",
    label: "MEMBRE",
  },
  {
    key: "current_balance",
    label: "SOLDE ACTUEL",
  },
  {
    key: "status",
    label: "STATUT",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

// Helper to format currency values
const formatCurrency = (value: string) => {
  // Parse the string to a number and format it
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return value;
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(numValue);
};

// Helper to determine balance status
const getBalanceStatus = (balance: string) => {
  const numBalance = parseFloat(balance);
  
  if (isNaN(numBalance)) return { color: "default", text: "Inconnu" };
  
  if (numBalance > 1000) return { color: "success", text: "Excellent" };
  if (numBalance > 500) return { color: "primary", text: "Bon" };
  if (numBalance > 0) return { color: "warning", text: "Régulier" };
  return { color: "danger", text: "Attention" };
};

// Helper to determine member status
type StatusKey = "active" | "pending" | "inactive" | "vip";

const statusMap: Record<StatusKey, { color: string; text: string }> = {
  active: { color: "success", text: "Actif" },
  pending: { color: "warning", text: "En attente" },
  inactive: { color: "danger", text: "Inactif" },
  vip: { color: "secondary", text: "VIP" },
};

const getStatusConfig = (status: string) => {
  const key = status.toLowerCase() as StatusKey;
  return statusMap[key] || { color: "default", text: status };
};


export const renderCell = (member: Member, columnKey: React.Key) => {
  switch (columnKey) {
    case "first_name":
      return (
        <User
          name={`${member.first_name} ${member.last_name}`}
          description={member.email}
          avatarProps={{
            src: member.photo_url,
            showFallback: true,
            name: `${member.first_name} ${member.last_name}`,
            className: "w-10 h-10"
          }}
          classNames={{
            name: "text-sm font-semibold",
            description: "text-xs text-gray-500"
          }}
        />
      );

    case "current_balance":
      const balanceStatus = getBalanceStatus(member.current_balance);
      
      return (
        <div className="flex items-center gap-2">
          <Badge 
            color={balanceStatus.color as any} 
            variant="flat" 
            size="sm"
            className="hidden sm:flex"
          >
            <FaMoneyBillWave className="mr-1" />
            {balanceStatus.text}
          </Badge>
          <span className="font-semibold text-sm">
            {formatCurrency(member.current_balance)}
          </span>
        </div>
      );
      
    case "status":
      const statusConfig = getStatusConfig(member.status);
      
      return (
        <Chip
          size="sm"
          variant="flat"
          color={statusConfig.color as any}
          className="capitalize px-3"
        >
          {statusConfig.text}
        </Chip>
      );

    case "actions":
      return (
        <div className="flex items-center gap-2 justify-end">
          <Tooltip content="Détails du membre">
            <span className="text-lg text-primary cursor-pointer hover:opacity-80 active:opacity-50 transition-opacity">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Modifier le membre">
            <span className="text-lg text-default-400 cursor-pointer hover:opacity-80 active:opacity-50 transition-opacity">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Supprimer le membre">
            <span className="text-lg text-danger cursor-pointer hover:opacity-80 active:opacity-50 transition-opacity">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return null;
  }
};