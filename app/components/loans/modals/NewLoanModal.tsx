'use client';

import React from 'react';
import { X, Landmark } from 'lucide-react';
import LoanForm from '../LoanFormFields';
import { LoanFormData } from '../../transactions/validation/loanSchema';

interface NewLoanModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSubmit?: (data: LoanFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Wrapper modale pour la création d'un nouveau prêt.
 * Utilise LoanForm (qu'on importe depuis LoanFormFields).
 */
const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen, onClose, onSubmit, isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
      <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Nouvelle demande de prêt</p>
              <p className="text-xs text-gray-400">Remplissez les informations du prêt</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 overflow-y-auto max-h-[80vh]">
          <LoanForm
            onCancel={onClose}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default NewLoanModal;