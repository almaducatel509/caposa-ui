// app/components/account/modals/AccountDetailModal.tsx
'use client';
import React, { useEffect } from "react";
import type { AccountData } from "../validationsaccount";

// ============= MODAL COMPONENT =============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {children}
      </div>
    </div>
  );
};

// ============= CHIP COMPONENT =============
interface ChipProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Chip: React.FC<ChipProps> = ({ children, color = 'default', size = 'md' }) => {
  const colorClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-purple-100 text-purple-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700'
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-xl font-semibold ${colorClasses[color]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

// ============= BUTTON COMPONENT =============
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'light';
  color?: 'primary' | 'default';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'solid',
  color = 'default'
}) => {
  const getClasses = () => {
    if (variant === 'light') {
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
    if (color === 'primary') {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }
    return 'bg-gray-500 text-white hover:bg-gray-600';
  };

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${getClasses()}`}
    >
      {children}
    </button>
  );
};

// ============= MAIN COMPONENT =============
interface AccountDetailModalProps {
  isOpen: boolean;
  onEdit: () => void;
  onClose: () => void;
  account: AccountData | null;
}

export default function AccountDetailModal({ 
  onEdit,
  isOpen, 
  onClose, 
  account 
}: AccountDetailModalProps) {
  
  if (!account) return null;

  // Helper functions
  const getStatusColor = (status?: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'actif': return 'success';
      case 'suspendu': return 'warning';
      case 'ferme': return 'danger';
      default: return 'default';
    }
  };

  const getTypeColor = (type?: string): 'primary' | 'secondary' | 'warning' | 'default' => {
    switch (type) {
      case 'epargne': return 'primary';
      case 'cheques': return 'secondary';
      case 'terme': return 'warning';
      default: return 'default';
    }
  };

  const getAccountTypeName = (type?: string) => {
    switch (type) {
      case 'epargne': return 'Compte Épargne';
      case 'cheques': return 'Compte Chèques';
      case 'terme': return 'Compte à Terme';
      default: return 'Type inconnu';
    }
  };

  const getAccountStatusDisplay = (status?: string) => {
    switch (status) {
      case 'actif': return 'Actif';
      case 'suspendu': return 'Suspendu';
      case 'ferme': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails du compte</h2>
          <Chip 
            color={getStatusColor(account.statutCompte)}
            size="lg"
          >
            {getAccountStatusDisplay(account.statutCompte)}
          </Chip>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-6 py-6 overflow-y-auto flex-1">
        <div className="space-y-5">
          {/* Section Informations générales - Flat Design */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              📋 Informations générales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem 
                label="Numéro de compte" 
                value={account.account_number}
                highlight
              />
              <DetailItem 
                label="Type de compte" 
                value={
                  <Chip color={getTypeColor(account.typeCompte)}>
                    {getAccountTypeName(account.typeCompte)}
                  </Chip>
                }
              />
              <DetailItem 
                label="Date d'ouverture" 
                value={account.dateOuverture 
                  ? new Date(account.dateOuverture).toLocaleDateString('fr-CA')
                  : account.created_at
                  ? new Date(account.created_at).toLocaleDateString('fr-CA')
                  : 'N/A'
                }
              />
              {account.dateFermeture && (
                <DetailItem 
                  label="Date de fermeture" 
                  value={new Date(account.dateFermeture).toLocaleDateString('fr-CA')}
                />
              )}
            </div>
          </div>

          {/* Section Informations financières - Flat Design */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              💰 Informations financières
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem 
                label="Solde actuel" 
                value={`${(account.soldeActuel || parseFloat(account.balance || '0')).toLocaleString('fr-CA')} HTG`}
                highlight
                className="text-xl font-bold text-green-600"
              />
              {account.tauxInteret !== null && account.tauxInteret !== undefined && (
                <DetailItem 
                  label="Taux d'intérêt" 
                  value={`${account.tauxInteret}%`}
                />
              )}
              {account.limiteTrait !== null && account.limiteTrait !== undefined && (
                <DetailItem 
                  label="Limite de retrait" 
                  value={`${account.limiteTrait.toLocaleString('fr-CA')} HTG`}
                />
              )}
              {account.fraisServiceMensuel !== null && account.fraisServiceMensuel !== undefined && (
                <DetailItem 
                  label="Frais mensuels" 
                  value={`${account.fraisServiceMensuel.toLocaleString('fr-CA')} HTG`}
                />
              )}
            </div>
          </div>

          {/* Section Membre - Flat Design */}
          {account.member_details && (
            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                👤 Informations du membre
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem 
                  label="Nom complet" 
                  value={
                    account.member_details.full_name || 
                    `${account.member_details.first_name} ${account.member_details.last_name}`
                  }
                />
                <DetailItem 
                  label="Numéro d'identification" 
                  value={account.member_details.id_number}
                />
                {account.member_details.phone_number && (
                  <DetailItem 
                    label="Téléphone" 
                    value={account.member_details.phone_number}
                  />
                )}
                {account.member_details.email && (
                  <DetailItem 
                    label="Email" 
                    value={account.member_details.email}
                  />
                )}
              </div>
            </div>
          )}

          {/* Section Statistiques - Flat Design */}
          {(account.total_transactions || account.total_deposits || account.total_withdrawals) && (
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                📊 Statistiques
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {account.total_transactions !== undefined && (
                  <DetailItem 
                    label="Total transactions" 
                    value={account.total_transactions}
                  />
                )}
                {account.total_deposits !== undefined && (
                  <DetailItem 
                    label="Total dépôts" 
                    value={`${account.total_deposits.toLocaleString('fr-CA')} HTG`}
                    className="text-green-600"
                  />
                )}
                {account.total_withdrawals !== undefined && (
                  <DetailItem 
                    label="Total retraits" 
                    value={`${account.total_withdrawals.toLocaleString('fr-CA')} HTG`}
                    className="text-red-600"
                  />
                )}
              </div>
              {account.last_transaction_date && (
                <div className="mt-4">
                  <DetailItem 
                    label="Dernière transaction" 
                    value={new Date(account.last_transaction_date).toLocaleDateString('fr-CA')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section Métadonnées - Flat Design */}
          <div className="text-xs text-gray-500 space-y-1 border-t border-gray-200 pt-4">
            <p className="font-medium">ID: {account.id}</p>
            {account.created_at && (
              <p>Créé le: {new Date(account.created_at).toLocaleString('fr-CA')}</p>
            )}
            {account.updated_at && (
              <p>Modifié le: {new Date(account.updated_at).toLocaleString('fr-CA')}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
        <Button variant="light" onClick={onClose}>
          Fermer
        </Button>
        <Button color="primary" onClick={() => {
          onClose();
          onEdit();
        }}>
          Voir le Membre
        </Button>
      </div>
    </Modal>
  );
}

// ============= DETAIL ITEM COMPONENT =============
function DetailItem({ 
  label, 
  value, 
  highlight = false,
  className = ""
}: { 
  label: string; 
  value: React.ReactNode; 
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={highlight ? "col-span-2" : ""}>
      <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">{label}</p>
      <p className={`font-semibold text-gray-900 ${className}`}>
        {value}
      </p>
    </div>
  );
}