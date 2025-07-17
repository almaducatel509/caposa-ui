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
  placeholder = "Entrez l'email",
  required = false,
  disabled = false,
  context = 'employee',
  error: externalError
}) => {
  const validation = useEmailValidation(value, context);

  // Classes CSS selon état
  const getInputClasses = () => {
    const base = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200";
    
    if (disabled) return `${base} bg-gray-100 cursor-not-allowed border-gray-300`;
    if (externalError) return `${base} border-red-300 bg-red-50 focus:ring-red-200`;
    if (validation.isValidating) return `${base} border-blue-300 focus:ring-blue-200`;
    
    switch (validation.type) {
      case 'success': return `${base} border-green-300 bg-green-50 focus:ring-green-200`;
      case 'warning': return `${base} border-orange-300 bg-orange-50 focus:ring-orange-200`;
      case 'error': return `${base} border-red-300 bg-red-50 focus:ring-red-200`;
      default: return `${base} border-gray-300 focus:ring-blue-500`;
    }
  };

  // Icône selon contexte
  const getIcon = () => {
    switch (context) {
      case 'connection': return '🔐';
      case 'member': return '👥';
      default: return '📧';
    }
  };

  return (
    <div>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <span className="mr-1">{getIcon()}</span>
        {label} {required && <span className="text-red-500">*</span>}
        {validation.isValidating && (
          <span className="ml-2 text-xs text-blue-600">
            <span className="inline-block animate-spin">⟳</span> Validation...
          </span>
        )}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClasses()}
        />
        
        {/* Indicateur visuel */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {validation.isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          {!validation.isValidating && validation.type === 'success' && (
            <span className="text-green-500 text-lg">✓</span>
          )}
          {!validation.isValidating && validation.type === 'warning' && (
            <span className="text-orange-500 text-lg">⚠</span>
          )}
          {!validation.isValidating && (validation.type === 'error' || externalError) && (
            <span className="text-red-500 text-lg">✗</span>
          )}
        </div>
      </div>

      {/* Messages */}
      {externalError ? (
        <div className="text-sm p-2 rounded border mt-1 text-red-600 bg-red-50 border-red-200">
          {externalError}
        </div>
      ) : validation.message ? (
        <div className={`text-sm p-2 rounded border mt-1 ${
          validation.type === 'success' ? 'text-green-600 bg-green-50 border-green-200' :
          validation.type === 'warning' ? 'text-orange-600 bg-orange-50 border-orange-200' :
          'text-red-600 bg-red-50 border-red-200'
        }`}>
          {validation.message}
        </div>
      ) : null}
    </div>
  );
};
