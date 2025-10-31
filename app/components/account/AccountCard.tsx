'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { FaEye, FaEdit, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import { AccountData } from "./validationsaccount";

// ============= TYPES =============
interface AccountCardProps {
  account: AccountData;  // ✅ CORRIGÉ: "account" pas "employee"!
  onView: (account: AccountData) => void;
  onEdit: (account: AccountData) => void;
  onDelete: (account: AccountData) => void;
  onViewTransactions?: (account: AccountData) => void;  // Optionnel
}

// ============= COMPONENT =============
const AccountCard: React.FC<AccountCardProps> = ({
  account,  // ✅ Destructure "account"
  onView,
  onEdit,
  onDelete,
  onViewTransactions,
}) => {
  
  // 🎨 Badge de statut
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
      case 'actif':
        return 'success';
      case 'closed':
      case 'fermé':
        return 'default';
      case 'suspended':
      case 'suspendu':
        return 'danger';
      default:
        return 'warning';
    }
  };

  // 🎨 Badge de type
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Épargne':
        return 'primary';
      case 'Chèque':
        return 'secondary';
      case 'Crédit':
        return 'warning';
      case 'Investissement':
        return 'success';
      default:
        return 'default';
    }
  };

  // 💰 Formater le solde
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0.00 $';
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  // 📅 Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-CA');
  };

  return (
    <Card 
      className="border-2 border-[#e4e4e7] hover:border-[#34963d] transition-all duration-300 hover:shadow-lg bg-white"
      isPressable
      onPress={() => onView(account)}
    >
      <CardBody className="p-6">
        {/* En-tête avec badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <Chip 
              size="sm" 
              color={getTypeColor(account.typeCompte)}
              variant="flat"
            >
              {account.typeCompte || 'N/A'}
            </Chip>
            <Chip 
              size="sm" 
              color={getStatusColor(account.statutCompte)}
              variant="flat"
            >
              {account.statutCompte || 'N/A'}
            </Chip>
          </div>
        </div>

        {/* Numéro de compte */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#2c2e2f] mb-1">
            {account.noCompte || 'N/A'}
          </h3>
          <p className="text-sm text-[#2c2e2f]/60">
            {account.member_name || account.idMembre || 'Membre inconnu'}
          </p>
        </div>

        {/* Solde */}
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <p className="text-xs text-[#2c2e2f]/60 mb-1">Solde actuel</p>
          <p className={`text-2xl font-bold ${
            (account.soldeActuel || 0) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatCurrency(account.soldeActuel)}
          </p>
        </div>

        {/* Informations supplémentaires */}
        <div className="space-y-2 text-sm text-[#2c2e2f]/70 mb-4">
          <div className="flex justify-between">
            <span>Ouvert le:</span>
            <span className="font-medium">{formatDate(account.dateOuverture)}</span>
          </div>
          {account.tauxInteret && (
            <div className="flex justify-between">
              <span>Taux d'intérêt:</span>
              <span className="font-medium">{account.tauxInteret}%</span>
            </div>
          )}
          {account.limiteCredit && (
            <div className="flex justify-between">
              <span>Limite crédit:</span>
              <span className="font-medium">{formatCurrency(account.limiteCredit)}</span>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            size="sm"
            variant="flat"
            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
            startContent={<FaEye />}
            onPress={() => onView(account)}
          >
            Voir
          </Button>
          
          <Button
            size="sm"
            variant="flat"
            className="flex-1 bg-green-50 text-green-600 hover:bg-green-100"
            startContent={<FaEdit />}
            onPress={() => onEdit(account)}
          >
            Modifier
          </Button>
          
          {onViewTransactions && (
            <Button
              size="sm"
              variant="flat"
              className="bg-purple-50 text-purple-600 hover:bg-purple-100"
              isIconOnly
              onPress={() => onViewTransactions(account)}
            >
              <FaMoneyBillWave />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="flat"
            className="bg-red-50 text-red-600 hover:bg-red-100"
            isIconOnly
            onPress={() => onDelete(account)}
          >
            <FaTrash />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AccountCard;