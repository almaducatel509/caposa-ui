'use client';
import React, { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
type ValidationResult = {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | null;
  isValidating: boolean;
};

// ==================== HOOK SIMPLE POUR VALIDATION EMAIL ====================
const useEmailValidation = (email: string, context: 'employee' | 'member' | 'connection' = 'employee') => {
  const [result, setResult] = useState<ValidationResult>({
    isValid: false,
    message: '',
    type: null,
    isValidating: false
  });

  // Configuration selon contexte
  const getConfig = () => {
    switch (context) {
      case 'connection':
        return { delay: 200, requireDomain: false };
      case 'member':
        return { delay: 500, allowedDomains: ['com', 'ca', 'org'] };
      default: // employee
        return { delay: 500, allowedDomains: [] };
    }
  };

  const validateEmail = useCallback((email: string): ValidationResult => {
    const config = getConfig();
    const contientArrobase = email.includes("@");
    const estLongAssez = email.length >= 6;
    const formatComplet = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Pas assez pour valider
    if (!contientArrobase || !estLongAssez) {
      return { 
        isValid: false, 
        message: '', 
        type: null, 
        isValidating: false 
      } as ValidationResult;
    }

    // Email valide
    if (formatComplet) {
      // Pour member, vérifier domaines autorisés
      if (context === 'member' && config.allowedDomains?.length) {
        const hasAllowedDomain = config.allowedDomains.some(domain => 
          email.toLowerCase().endsWith(`.${domain}`)
        );
        if (!hasAllowedDomain) {
          return {
            isValid: false,
            message: 'Utilisez un domaine .com, .ca ou .org',
            type: 'warning' as const,
            isValidating: false
          };
        }
      }

      return {
        isValid: true,
        message: context === 'connection' ? 'Email reconnu' : 'Email valide !',
        type: 'success' as const,
        isValidating: false
      };
    }

    // Format incorrect
    return {
      isValid: false,
      message: 'Format d\'email invalide',
      type: 'error' as const,
      isValidating: false
    };
  }, [context]);

  useEffect(() => {
    if (!email || email.length < 3) {
      setResult({ isValid: false, message: '', type: null, isValidating: false });
      return;
    }

    setResult(prev => ({ ...prev, isValidating: true }));
    
    const config = getConfig();
    const timeoutId = setTimeout(() => {
      const validationResult = validateEmail(email);
      setResult(validationResult);
    }, config.delay);

    return () => clearTimeout(timeoutId);
  }, [email, validateEmail]);

  return result;
};

// ==================== COMPOSANT EMAILFIELD SIMPLE ====================
interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  context?: 'employee' | 'member' | 'connection';
  error?: string; // Erreur externe
}

export const EmailField: React.FC<EmailFieldProps> = ({
  value,
  onChange,
  label = "Email",
  placeholder = "employe@gmail.com",
  required = false,
  disabled = false,
  context = 'employee',
  error: externalError
}) => {
  const validation = useEmailValidation(value, context);

  // Classes CSS selon état — alignées sur le composant Input du formulaire
  // (text-sm, px-3 py-2.5, rounded-xl, couleurs CAPOSA)
  const getInputClasses = () => {
    const base = "w-full pl-3 pr-9 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2";

    if (disabled) return `${base} bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200`;
    if (externalError) return `${base} border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400`;
    if (validation.isValidating) return `${base} border-gray-200 bg-white focus:ring-[#DDEAD5] focus:border-[#2E7D32]`;

    switch (validation.type) {
      case 'success': return `${base} border-[#81C784] bg-white focus:ring-[#DDEAD5] focus:border-[#2E7D32]`;
      case 'warning': return `${base} border-orange-300 bg-orange-50/30 focus:ring-orange-100 focus:border-orange-400`;
      case 'error':   return `${base} border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400`;
      default:        return `${base} border-gray-200 bg-white hover:border-gray-300 focus:ring-[#DDEAD5] focus:border-[#2E7D32]`;
    }
  };

  const message = externalError || validation.message;
  const messageColor =
    externalError || validation.type === 'error' ? 'text-red-500' :
    validation.type === 'warning' ? 'text-orange-600' :
    'text-[#2E7D32]';

  return (
    <div>
      {/* Input */}
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={label}
          className={getInputClasses()}
        />

        {/* Indicateur visuel */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {validation.isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2E7D32]" />
          )}
          {!validation.isValidating && !externalError && validation.type === 'success' && (
            <span className="text-[#2E7D32] text-sm">✓</span>
          )}
          {!validation.isValidating && !externalError && validation.type === 'warning' && (
            <span className="text-orange-500 text-sm">⚠</span>
          )}
          {!validation.isValidating && (validation.type === 'error' || externalError) && (
            <span className="text-red-500 text-sm">✗</span>
          )}
        </div>
      </div>

      {/* Message — même style que les autres champs du formulaire */}
      {message && (
        <p className={`text-xs mt-1.5 ${messageColor}`}>{message}</p>
      )}
    </div>
  );
};