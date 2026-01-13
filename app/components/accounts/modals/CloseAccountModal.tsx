'use client';
import React, { useState, useEffect } from "react";
import type { AccountData } from "../validationsaccount";
import { updateAccount } from "@/app/lib/api/accounts";

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
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {children}
      </div>
    </div>
  );
};

// ============= CHIP COMPONENT =============
interface ChipProps {
  children: React.ReactNode;
  color?: 'success' | 'warning' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Chip: React.FC<ChipProps> = ({ children, color = 'default', size = 'sm' }) => {
  const colorClasses = {
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

// ============= INPUT COMPONENT =============
interface InputProps {
  type?: 'text' | 'date';
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  maxLength?: number;
  required?: boolean;
  description?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  maxLength,
  required,
  description
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        maxLength={maxLength}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm"
      />
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

// ============= BUTTON COMPONENT =============
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'light';
  color?: 'primary' | 'warning' | 'default';
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'solid',
  color = 'default',
  disabled = false,
  loading = false
}) => {
  const getClasses = () => {
    if (disabled) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    if (variant === 'light') {
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300';
    }
    if (color === 'warning') {
      return 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700';
    }
    if (color === 'primary') {
      return 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700';
    }
    return 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 ${getClasses()}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// ============= MAIN COMPONENT =============
interface CloseAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: AccountData | null;
}

export default function CloseAccountModal({ 
  isOpen, 
  onClose, 
  account,
  onSuccess 
}: CloseAccountModalProps) {
  
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closureDate, setClosureDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // ============= VALIDATIONS MÉTIER =============
  const solde = account?.soldeActuel || parseFloat(account?.balance || '0');
  const isAlreadyClosed = account?.statutCompte === 'ferme';
  
  // Règle 1: Le solde DOIT être à zéro
  const canClose = solde === 0 && !isAlreadyClosed;
  
  // Messages d'erreur contextuels
  const getBlockingReason = () => {
    if (isAlreadyClosed) {
      return "Ce compte est déjà fermé.";
    }
    if (solde !== 0) {
      return `Le compte a un solde de ${solde.toLocaleString('fr-CA')} HTG. Le solde doit être exactement à 0 HTG avant la fermeture.`;
    }
    return null;
  };

  const blockingReason = getBlockingReason();

  // ============= HANDLER DE FERMETURE =============
  const handleClose = async () => {
    if (!canClose) {
      setError(blockingReason || "Impossible de fermer ce compte.");
      return;
    }

    // Validation de la date
    const openingDate = new Date(account?.dateOuverture || account?.created_at || '');
    const closeDate = new Date(closureDate);
    
    if (closeDate < openingDate) {
      setError("La date de fermeture ne peut pas être antérieure à la date d'ouverture.");
      return;
    }

    setIsClosing(true);
    setError(null);

    try {
      await updateAccount(account!.id, {
        statutCompte: 'ferme',
        dateFermeture: closureDate,
      });

      console.log("✅ Compte fermé (soft delete):", {
        id: account?.id,
        account_number: account?.account_number,
        dateFermeture: closureDate,
        reason: reason || 'Non spécifié'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Erreur fermeture:", err);
      setError(err.message || "Erreur lors de la fermeture du compte.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 pt-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-orange-600">
          🔒 Fermer le compte
        </h2>
        <p className="text-sm text-gray-600 font-normal">
          Fermeture logique - Les données seront conservées pour la traçabilité
        </p>
      </div>
      
      {/* Body */}
      <div className="px-6 py-6 overflow-y-auto flex-1">
        <div className="space-y-4">
          {/* Avertissement principal */}
          <div className={`p-4 rounded-xl border-2 ${
            canClose 
              ? 'bg-yellow-50 border-yellow-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <p className={`font-semibold mb-2 ${
              canClose ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {canClose 
                ? '⚠️ Fermeture de compte' 
                : '❌ Fermeture impossible'
              }
            </p>
            <p className={`text-sm ${canClose ? 'text-yellow-700' : 'text-red-700'}`}>
              {blockingReason || 
                'Le compte sera marqué comme fermé. Aucune nouvelle transaction ne sera possible, mais l\'historique sera conservé.'
              }
            </p>
          </div>

          {/* Info légale */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-300">
            <p className="text-blue-800 text-sm">
              <strong>ℹ️ Note importante :</strong> Conformément aux réglementations bancaires, 
              les données du compte seront conservées à des fins de traçabilité et d'audit. 
              Le compte restera consultable mais ne pourra plus être utilisé.
            </p>
          </div>

          {/* Détails du compte */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-800">
              📋 Détails du compte :
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro :</span>
                <span className="font-semibold text-gray-900">{account?.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Titulaire :</span>
                <span className="font-semibold text-gray-900">
                  {account?.member_details?.full_name || 
                   `${account?.member_details?.first_name || ''} ${account?.member_details?.last_name || ''}`.trim() ||
                   account?.id_membre
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type :</span>
                <span className="font-semibold text-gray-900 capitalize">{account?.typeCompte}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Solde actuel :</span>
                <span className={`font-bold ${solde === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {solde.toLocaleString('fr-CA')} HTG
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ouvert le :</span>
                <span className="font-semibold text-gray-900">
                  {account?.dateOuverture 
                    ? new Date(account.dateOuverture).toLocaleDateString('fr-CA')
                    : new Date(account?.created_at || '').toLocaleDateString('fr-CA')
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Statut actuel :</span>
                <Chip 
                  size="sm"
                  color={
                    account?.statutCompte === 'actif' ? 'success' :
                    account?.statutCompte === 'suspendu' ? 'warning' : 'danger'
                  }
                >
                  {account?.statutCompte?.toUpperCase() || 'INCONNU'}
                </Chip>
              </div>
            </div>
          </div>

          {/* Formulaire de fermeture (uniquement si possible) */}
          {canClose && (
            <div className="space-y-3">
              <Input
                type="date"
                label="Date de fermeture"
                value={closureDate}
                onChange={(e) => setClosureDate(e.target.value)}
                min={account?.dateOuverture || account?.created_at?.split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                required
                description="La date ne peut pas être antérieure à la date d'ouverture"
              />
              
              <Input
                label="Raison de la fermeture (optionnel)"
                placeholder="Ex: Demande du client, Migration vers autre compte..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
              />
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-red-800 font-semibold">❌ Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Instructions si solde non nul */}
          {!canClose && solde !== 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-300">
              <p className="text-blue-800 font-semibold mb-2">
                📝 Étapes à suivre :
              </p>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Effectuez {solde > 0 ? 'un retrait' : 'un dépôt'} pour ramener le solde exactement à 0 HTG</li>
                <li>Vérifiez qu'aucune transaction n'est en attente</li>
                <li>Assurez-vous que tous les chèques ont été compensés</li>
                <li>Revenez pour fermer le compte</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
        <Button 
          variant="light" 
          onClick={onClose}
          disabled={isClosing}
        >
          Annuler
        </Button>
        <Button 
          color="warning" 
          onClick={handleClose}
          loading={isClosing}
          disabled={!canClose}
        >
          {isClosing ? 'Fermeture en cours...' : '🔒 Confirmer la fermeture'}
        </Button>
      </div>
    </Modal>
  );
}    